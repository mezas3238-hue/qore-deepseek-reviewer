#!/usr/bin/env python3
from __future__ import annotations

import ast
from collections import deque

import deepseek_reviewer_compat_entrypoint as compat

budgeted = compat.budgeted
quality_guarded = compat.quality_guarded
reviewer = budgeted.reviewer

# V2 keeps complete changed-file evidence and the existing fail-closed quality guard,
# while removing two major token amplifiers observed in R1D:
# 1) complete imported infrastructure modules in every final prompt;
# 2) a likely second full final prompt when 10k high-reasoning tokens leave no answer.
#
# Four tool-capable exploration rounds plus one explicit closure round remain available
# for evidence outside the deterministic bundle.
budgeted.MAX_EXPLORER_ROUNDS = max(2, min(budgeted.MAX_EXPLORER_ROUNDS, 5))
compat._EXPLORER_CLOSURE_ROUND = budgeted.MAX_EXPLORER_ROUNDS
budgeted.FINAL_MAX_TOKENS = max(budgeted.FINAL_MAX_TOKENS, 16000)

MAX_DEPENDENCY_SLICE_CHARS = 70000
MAX_DEPENDENCY_MODULES = 6
MAX_TRANSITIVE_DEFINITION_DEPTH = 3

compat._EXPLORER_OPTIMIZED_INSTRUCTION = (
    "First verify repo_state once. The quality guard injects every changed file "
    "completely into the FINAL pass, exact BASE..HEAD patches for modified files, "
    "and deterministic semantic slices for local qore.infrastructure definitions "
    "directly imported by changed Python files, including bounded helper definitions "
    "referenced by those imported definitions. Do NOT reread changed files or evidence "
    "already guaranteed by that bundle. Use explorer tools only for binding/CI evidence "
    "and additional surrounding definitions/usages genuinely needed to falsify a "
    "requested invariant. Batch independent reads/searches. Once sufficient, stop tools "
    "and return EVIDENCE_COMPLETE with the strongest candidate finding or "
    "'no material candidate found'."
)
compat._EXPLORER_CLOSURE_INSTRUCTION = (
    "EXPLORATION CLOSURE. Do not call tools. The FINAL pass will deterministically "
    "receive all complete changed files, exact modified-file patches, and semantic "
    "slices of directly imported local qore.infrastructure definitions plus bounded "
    "referenced helpers. Based on those guarantees and evidence already collected, "
    "begin exactly EVIDENCE_COMPLETE if no additional evidence is needed; otherwise "
    "begin exactly EVIDENCE_INCOMPLETE and name only the specific missing evidence "
    "outside the guaranteed bundle. Never infer unseen facts."
)


def _module_path(module: str) -> str:
    relative = module.removeprefix("qore.").replace(".", "/") + ".py"
    return f"src/qore/{relative}"


def _changed_import_requirements() -> dict[str, set[str]]:
    requirements: dict[str, set[str]] = {}
    changed_paths = {path for _, path in quality_guarded.changed_rows()}
    for status, path in quality_guarded.changed_rows():
        if status[:1] == "D" or not path.endswith(".py"):
            continue
        content = quality_guarded.raw_git("show", f"{reviewer.EXPECTED_HEAD}:{path}")
        try:
            tree = ast.parse(content, filename=path)
        except SyntaxError as exc:
            raise RuntimeError(
                f"cannot parse changed Python file {path!r} for dependency slicing"
            ) from exc

        for node in ast.walk(tree):
            if not isinstance(node, ast.ImportFrom) or node.module is None:
                continue
            if not node.module.startswith("qore.infrastructure."):
                continue
            dependency_path = _module_path(node.module)
            if dependency_path in changed_paths:
                continue
            names = requirements.setdefault(node.module, set())
            for alias in node.names:
                if alias.name == "*":
                    raise RuntimeError(
                        f"wildcard local infrastructure import in {path!r}; "
                        "cannot build a safe bounded dependency slice"
                    )
                names.add(alias.name)

    if len(requirements) > MAX_DEPENDENCY_MODULES:
        raise RuntimeError(
            "dependency slicing requires "
            f"{len(requirements)} modules, exceeding MAX_DEPENDENCY_MODULES="
            f"{MAX_DEPENDENCY_MODULES}; split the review surface or raise the "
            "quality budget explicitly"
        )
    return requirements


def _definition_nodes(tree: ast.Module) -> dict[str, ast.AST]:
    result: dict[str, ast.AST] = {}
    for node in tree.body:
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
            result[node.name] = node
        elif isinstance(node, (ast.Assign, ast.AnnAssign)):
            targets: list[ast.expr] = []
            if isinstance(node, ast.Assign):
                targets.extend(node.targets)
            else:
                targets.append(node.target)
            for target in targets:
                if isinstance(target, ast.Name):
                    result[target.id] = node
    return result


def _loaded_names(node: ast.AST) -> set[str]:
    return {
        item.id
        for item in ast.walk(node)
        if isinstance(item, ast.Name) and isinstance(item.ctx, ast.Load)
    }


def _line_slice(lines: list[str], node: ast.AST) -> str:
    start = getattr(node, "lineno", None)
    end = getattr(node, "end_lineno", None)
    if not isinstance(start, int) or not isinstance(end, int):
        raise RuntimeError("AST definition lacks stable source line bounds")
    return "\n".join(lines[start - 1 : end])


def _semantic_module_slice(module: str, imported_names: set[str]) -> str:
    path = _module_path(module)
    try:
        content = quality_guarded.raw_git("show", f"{reviewer.EXPECTED_HEAD}:{path}")
    except RuntimeError as exc:
        raise RuntimeError(
            f"required local dependency {path!r} is unavailable at frozen HEAD"
        ) from exc
    if "\x00" in content or "\ufffd" in content:
        raise RuntimeError(
            f"dependency file {path!r} is not safely representable as UTF-8 text"
        )

    try:
        tree = ast.parse(content, filename=path)
    except SyntaxError as exc:
        raise RuntimeError(f"cannot parse dependency module {path!r}") from exc

    definitions = _definition_nodes(tree)
    missing = sorted(name for name in imported_names if name not in definitions)
    if missing:
        raise RuntimeError(
            f"cannot locate imported definitions {missing!r} in {path!r}; "
            "fail closed rather than omit dependency evidence"
        )

    selected: dict[str, tuple[ast.AST, int]] = {}
    queue: deque[tuple[str, int]] = deque((name, 0) for name in sorted(imported_names))
    while queue:
        name, depth = queue.popleft()
        if name in selected:
            continue
        node = definitions.get(name)
        if node is None:
            continue
        selected[name] = (node, depth)
        if depth >= MAX_TRANSITIVE_DEFINITION_DEPTH:
            continue
        for referenced in sorted(_loaded_names(node)):
            if referenced in definitions and referenced not in selected:
                queue.append((referenced, depth + 1))

    lines = content.splitlines()
    ordered = sorted(
        selected.items(),
        key=lambda item: int(getattr(item[1][0], "lineno", 0)),
    )
    blocks = [
        f"\n## LOCAL DEPENDENCY SLICE\nPATH: {path}\n"
        f"REF: {reviewer.EXPECTED_HEAD}\n"
        f"DIRECT_IMPORTS: {','.join(sorted(imported_names))}\n"
        "CONTENT: exact source definitions. Complete changed files remain separately "
        "mandatory. If a requested invariant needs material outside this slice, the "
        "reviewer must fetch it or return EVIDENCIA INSUFICIENTE.\n"
    ]
    for name, (node, depth) in ordered:
        blocks.append(
            f"\n### DEFINITION {name} depth={depth} "
            f"lines={getattr(node, 'lineno', '?')}-{getattr(node, 'end_lineno', '?')}\n"
            + quality_guarded.numbered_text(_line_slice(lines, node))
            + "\n"
        )
    return "".join(blocks)


def build_sliced_dependency_evidence() -> tuple[str, int]:
    requirements = _changed_import_requirements()
    if not requirements:
        return "", 0

    blocks = [
        "\n# MANDATORY LOCAL DEPENDENCY SEMANTIC SLICES\n",
        "These exact frozen-HEAD definitions are selected deterministically from direct "
        "local infrastructure imports and bounded referenced helpers. This reduces "
        "repeated context without weakening the quality rule: missing required material "
        "must be fetched by explorer or produce VALIDACIÓN BLOQUEADA.\n",
    ]
    for module in sorted(requirements):
        blocks.append(_semantic_module_slice(module, requirements[module]))
        if sum(len(item) for item in blocks) > MAX_DEPENDENCY_SLICE_CHARS:
            raise RuntimeError(
                "mandatory dependency semantic slices exceed "
                f"MAX_DEPENDENCY_SLICE_CHARS={MAX_DEPENDENCY_SLICE_CHARS}; "
                "split the review surface or explicitly raise the quality budget. "
                "The harness will not truncate required definitions."
            )

    return "".join(blocks), len(requirements)


quality_guarded.build_mandatory_dependency_evidence = build_sliced_dependency_evidence


if __name__ == "__main__":
    try:
        raise SystemExit(quality_guarded.main())
    except Exception as exc:  # noqa: BLE001
        quality_guarded.budgeted.write_usage_summary()
        print(
            f"ERROR: {type(exc).__name__}: {exc}",
            file=quality_guarded.os.sys.stderr,
        )
        raise
