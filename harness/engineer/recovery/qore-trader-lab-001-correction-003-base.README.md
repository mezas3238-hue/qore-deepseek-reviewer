# Trader Lab Correction 003 — Exact Recovery Base

## Source

This recovery material preserves the completed candidate produced by:

- package: `HARNESS-ENGINEER-QORE-TRADER-LAB-001-CORRECTION-002-IA-RESIDUALS-RESUME-001`
- run: `33710144873`
- job: `100507662976`
- artifact: `9877634840`
- artifact digest: `sha256:5a8dbc8910c72c23892927c1e862f7235e4e75b81475ea8e24a89230c297289c`
- qore-core START: `5d25445faf57fa83410b57faf5eaf1f437949129`
- qore-core TREE: `f9df989d7e7120d8742d4001b045fdd11cb0cb03`

The Harness workflow conclusion was `failure` because checkpoint publication rejected the non-semantic uppercase annotation `(UNCHANGED)` after an otherwise unchanged exact START/TREE line. That parser defect has been separately corrected. It does not erase or invalidate the completed candidate engineering work.

## Exact candidate

- patch SHA-256: `dce905d442d13c851bdd6fc799fcbd8f035ca027a2f22cc66034708714ce15b1`
- raw patch bytes: `169443`
- changed files: `13`
- diff: `+2744/-259`
- durable lanes: `1..6 COMPLETED`
- focused Trader Lab tests: `63 passed`
- Harness-recorded FULL QG: Ruff PASS; Mypy PASS (`753 source files`); Pytest `4925 passed`; coverage `87%`; `git diff --check` clean.

Harness self-report/FULL QG is not independent semantic approval. Integration Authority found one remaining MATERIAL root family described below.

## Stored representation

The exact patch is bzip2-compressed and base64 encoded, split only for repository transport into these files in this exact order:

1. `qore-trader-lab-001-correction-003-base.patch.bz2.b64.part00` — 7500 bytes
2. `qore-trader-lab-001-correction-003-base.patch.bz2.b64.part01` — 7500 bytes
3. `qore-trader-lab-001-correction-003-base.patch.bz2.b64.part02` — 7500 bytes
4. `qore-trader-lab-001-correction-003-base.patch.bz2.b64.part03` — 7536 bytes

Representation hashes:

- bzip2 SHA-256: `03cc0f7fb407108263a81f73bfecc7ffc799935602b5374afd44891d42af3254`
- base64-stream SHA-256: `c1468626adbf94441d76d1784a0c9344366a68762ea9d11684080439c926b46c`

## Mandatory reconstruction

From a clean qore-core checkout at the exact START/TREE above, concatenate the fragments in order and reconstruct:

```bash
cat \
  qore-trader-lab-001-correction-003-base.patch.bz2.b64.part00 \
  qore-trader-lab-001-correction-003-base.patch.bz2.b64.part01 \
  qore-trader-lab-001-correction-003-base.patch.bz2.b64.part02 \
  qore-trader-lab-001-correction-003-base.patch.bz2.b64.part03 \
  | base64 -d | bzip2 -d > /tmp/qore-trader-lab-001-correction-003-base.patch
sha256sum /tmp/qore-trader-lab-001-correction-003-base.patch
```

The result MUST equal:

`dce905d442d13c851bdd6fc799fcbd8f035ca027a2f22cc66034708714ce15b1`

Then use `git apply --check` before `git apply`. Any SHA/binding/apply mismatch fails closed.

## DO NOT REPEAT COMPLETED WORK

This is a continuation base, not a new Trader Lab rebuild.

Do NOT rerun/reconstruct:
- Batch 005;
- Correction 001;
- Correction 001 Resume 001;
- Correction 002 investigation;
- Correction 002 Resume 001 six completed lanes;
- already-closed F1-F18 / IA-R2..R5 work except for regression checks caused by the bounded correction.

## Remaining IA residual — only authorized semantic correction

`IA-R1B — LOCALLY MINTABLE GOVERNED APPROVAL EVIDENCE — MATERIAL`

The completed candidate introduces `build_trader_lab_governed_gate_evidence(...)`, which accepts caller-supplied authority identity/name, `APPROVED` decision, timestamp and digest, locally fingerprints them and returns a governed-gate evidence object. `reference_governed_gate_evidence(...)` can then convert that locally constructed object into qualifying Risk/CIBO/Independent-Validation stage evidence for the exact candidate.

This still violates:

`TYPED APPROVED OBJECT != AUTHENTIC GOVERNED EVIDENCE`

and:

`A TYPED REFERENCE IS NOT PROOF OF AUTHENTIC GOVERNED EVIDENCE BY ITSELF`.

For external gates without an authoritative producer in qore-core, Trader Lab must expose an explicit fail-closed consumption/verification seam. It must not contain a public local constructor capable of minting evidence that becomes qualifying merely because supplied identity/digest/decision fields are structurally valid.

## Next safe action

Run only the bounded Correction-003 authenticity package over this exact recovered candidate. Add adversarial witnesses proving fabricated/local/reflection-built Risk/CIBO/Independent-Validation approvals cannot advance the lifecycle. Preserve legitimate in-repo self-authenticating Research/OOS/Stress/Monte-Carlo/Economic evidence paths. Run focused tests + FULL QG, then return to independent IA. No Expert before IA CLEAN.
