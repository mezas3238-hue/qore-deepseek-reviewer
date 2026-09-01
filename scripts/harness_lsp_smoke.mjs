import { mkdtemp, mkdir, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { Context } from '@deepseek-ai/cordis'
import LocalFileSystem from '@deepseek-ai/dsh-fs-local'
import Lsp from '@deepseek-ai/dsh-lsp'
import * as LspLocal from '@deepseek-ai/dsh-lsp-stdio'
import LocalSubprocessRuntime from '@deepseek-ai/dsh-subprocess-local'

const pyrightLangserver = process.argv[2]
if (typeof pyrightLangserver !== 'string' || pyrightLangserver.length === 0) {
  throw new Error('usage: node harness_lsp_smoke.mjs /absolute/path/to/pyright-langserver')
}

const root = await realpath(await mkdtemp(join(tmpdir(), 'qore-lsp-smoke-')))
const workspace = join(root, 'workspace')
await mkdir(workspace)
await writeFile(
  join(workspace, 'helper.py'),
  'def meaning() -> int:\n    return 42\n',
  'utf8',
)
await writeFile(
  join(workspace, 'main.py'),
  'from helper import meaning\nresult = meaning()\n',
  'utf8',
)

const ctx = new Context()
try {
  await ctx.plugin(Lsp)
  await ctx.plugin(LocalSubprocessRuntime)
  await ctx.plugin(LocalFileSystem, { cwd: workspace })
  await ctx.plugin(LspLocal, {
    servers: {
      python: {
        command: pyrightLangserver,
        args: ['--stdio'],
        extensionToLanguage: { '.py': 'python' },
      },
    },
  })

  const definition = await ctx.lsp.query({
    operation: 'goToDefinition',
    filePath: 'main.py',
    position: { line: 1, character: 10 },
    workspaceRoot: workspace,
  })
  if (definition.kind !== 'locations') {
    throw new Error(`goToDefinition returned unexpected kind ${definition.kind}`)
  }
  const expectedHelper = pathToFileURL(join(workspace, 'helper.py')).href
  if (!definition.locations.some((location) => location.uri === expectedHelper)) {
    throw new Error(`goToDefinition did not resolve helper.py: ${JSON.stringify(definition)}`)
  }

  const references = await ctx.lsp.query({
    operation: 'findReferences',
    filePath: 'main.py',
    position: { line: 1, character: 10 },
    workspaceRoot: workspace,
  })
  if (references.kind !== 'locations' || references.locations.length < 2) {
    throw new Error(`findReferences returned insufficient locations: ${JSON.stringify(references)}`)
  }

  const hover = await ctx.lsp.query({
    operation: 'hover',
    filePath: 'main.py',
    position: { line: 1, character: 10 },
    workspaceRoot: workspace,
  })
  if (hover.kind !== 'hover' || hover.hover === null || !hover.hover.contents.includes('meaning')) {
    throw new Error(`hover did not describe meaning: ${JSON.stringify(hover)}`)
  }

  process.stdout.write(JSON.stringify({
    schema: 'qore-harness-lsp-smoke-v1',
    definition_locations: definition.locations.length,
    reference_locations: references.locations.length,
    hover_available: true,
  }) + '\n')
} finally {
  await ctx.fiber.dispose()
  await rm(root, { recursive: true, force: true })
}
