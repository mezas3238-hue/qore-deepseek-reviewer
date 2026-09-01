import { appendFileSync } from 'node:fs'

export const name = 'qore-adaptive-reasoning-controller'

const AUDIT_PATH = process.env.QORE_REASONING_AUDIT_PATH
  ?? '/tmp/qore-principal-reasoning-controller.jsonl'
const MAX_BURST_STEPS = 3
const states = new WeakMap()

const INITIAL_RISK_GROUPS = [
  {
    id: 'security-secret-hygiene',
    score: 2,
    pattern: /\b(?:credential|secret|password|token|authorization|userinfo|bypass|fail[- ]closed)\b/i,
  },
  {
    id: 'unicode-normalization',
    score: 2,
    pattern: /\b(?:unicode|normalization|nfkc|nfkd|nfc|nfd|casefold|confusable|homoglyph|bidi|zero[- ]width)\b/i,
  },
  {
    id: 'retained-state-integrity',
    score: 2,
    pattern: /\b(?:retained[- ]state|revalidation|recursive|re-entry|reentry|aliasing|immutability)\b/i,
  },
  {
    id: 'contract-governance',
    score: 1,
    pattern: /\b(?:contract ambiguity|authority|production|risk boundary|provider neutrality|exact runtime type)\b/i,
  },
  {
    id: 'adversarial-root-cause',
    score: 1,
    pattern: /\b(?:adversarial|root[- ]cause|equivalence|falsification|false positive|counterexample)\b/i,
  },
]

const FAILURE_PATTERN = /\b(?:traceback|assertionerror|failed|failure|mismatch|unexpectedly accepted|bypass|regression|contradiction|material finding|corruption)\b/i
const DISCOVERY_PATTERN = /\b(?:material finding|contract ambiguity|root cause not closed|unresolved contradiction|insufficient evidence|unexpected bypass|counterexample found)\b/i
const PRODUCTION_EDIT_PATTERN = /\b(?:str_replace_editor|apply_patch|edit|write)\b/i
const PRODUCTION_PATH_PATTERN = /(?:^|["'\s])src\/qore\//i

function safeJson(value) {
  try {
    return JSON.stringify(value)
  } catch {
    return ''
  }
}

function visibleAssistantText(event) {
  const content = event?.data?.message?.content
  if (!Array.isArray(content)) return ''
  return content
    .filter(block => block?.type === 'text')
    .map(block => typeof block.text === 'string' ? block.text : '')
    .join('\n')
}

function assistantToolCallText(event) {
  const content = event?.data?.message?.content
  if (!Array.isArray(content)) return ''
  return content
    .filter(block => block?.type === 'tool-call')
    .map(block => `${block.name ?? ''} ${block.arguments ?? ''}`)
    .join('\n')
}

function analyzeFreshEvents(events) {
  let riskScore = 0
  const reasons = []
  let productionEdit = false

  for (const event of events) {
    const type = typeof event?.type === 'string' ? event.type : ''

    // Task/package complexity is classified once from new user-role input.
    if (type === 'user/message') {
      const text = safeJson(event)
      for (const group of INITIAL_RISK_GROUPS) {
        if (group.pattern.test(text) && !reasons.includes(group.id)) {
          riskScore += group.score
          reasons.push(group.id)
        }
      }
      continue
    }

    // Concrete failed/contradictory execution evidence is a fresh reason to
    // spend a short max-effort burst even in an otherwise routine task.
    if (type === 'tool/result') {
      const text = safeJson(event)
      if (FAILURE_PATTERN.test(text)) {
        riskScore += 3
        if (!reasons.includes('failed-or-contradictory-evidence')) {
          reasons.push('failed-or-contradictory-evidence')
        }
      }
      continue
    }

    if (type !== 'assistant/message') continue

    // Inspect only visible assistant text and structured tool calls. Explicitly
    // exclude reasoning blocks from routing decisions.
    const visibleText = visibleAssistantText(event)
    if (DISCOVERY_PATTERN.test(visibleText)) {
      riskScore += 3
      if (!reasons.includes('material-discovery')) reasons.push('material-discovery')
    }

    const toolCallText = assistantToolCallText(event)
    if (
      PRODUCTION_EDIT_PATTERN.test(toolCallText)
      && PRODUCTION_PATH_PATTERN.test(toolCallText)
    ) {
      productionEdit = true
      if (!reasons.includes('production-source-edit')) {
        reasons.push('production-source-edit')
      }
    }
  }

  return { riskScore, reasons, productionEdit }
}

function appendAudit(record) {
  appendFileSync(AUDIT_PATH, `${JSON.stringify(record)}\n`, { encoding: 'utf8' })
}

export function apply(ctx) {
  ctx.on('agent/request', async ({ agent, turn, step }, next) => {
    const base = await next()
    const state = states.get(agent) ?? { lastEventIndex: 0, maxBudget: 0 }
    const allEvents = Array.from(agent?.session?.events ?? [])
    const freshEvents = allEvents.slice(state.lastEventIndex)
    state.lastEventIndex = allEvents.length

    const analysis = analyzeFreshEvents(freshEvents)
    if (analysis.riskScore >= 3) {
      state.maxBudget = Math.max(state.maxBudget, MAX_BURST_STEPS)
    }
    if (analysis.productionEdit) {
      state.maxBudget = Math.max(state.maxBudget, 2)
    }

    const budgetBefore = state.maxBudget
    const reasoningEffort = budgetBefore > 0 ? 'max' : 'high'
    if (state.maxBudget > 0) state.maxBudget -= 1
    states.set(agent, state)

    appendAudit({
      schema: 'qore-adaptive-reasoning-controller-v1',
      turn,
      step,
      reasoning_effort: reasoningEffort,
      risk_score: analysis.riskScore,
      reasons: analysis.reasons,
      production_edit: analysis.productionEdit,
      max_budget_before: budgetBefore,
      max_budget_after: state.maxBudget,
      fresh_event_count: freshEvents.length,
    })

    return { ...base, reasoningEffort }
  })
}
