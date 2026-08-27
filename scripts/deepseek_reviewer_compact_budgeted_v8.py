#!/usr/bin/env python3
from __future__ import annotations

import os
import pathlib
import subprocess
import sys

import deepseek_reviewer_compact_budgeted_v6 as v6
import deepseek_reviewer_compact_budgeted_v7 as v7

# Keep the generic python_semantics_probe sandbox unchanged. R72 demonstrated
# that importlib is intentionally outside its runtime import allowlist. These
# exact, immutable sources are infrastructure-owned probes, not model/user
# input, so execute only this closed set in an isolated subprocess.
_CONTROLLED_IMPORTLIB_RUNTIME_SOURCES = frozenset(
    {
        "import importlib\n"
        "module = importlib.import_module('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "module = getattr(importlib, 'import_module')('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "module = importlib.__dict__['import_module']('math')\n"
        "print(module.__name__)\n",
        "import importlib\n"
        "module = vars(importlib)['import_module']('math')\n"
        "print(module.__name__)\n",
    }
)
_original_python = v6._python


def _controlled_python(mode: str, source: str) -> str:
    if mode != "run" or source not in _CONTROLLED_IMPORTLIB_RUNTIME_SOURCES:
        return _original_python(mode, source)

    proc = subprocess.run(
        [sys.executable, "-I", "-B", "-c", source],
        cwd=pathlib.Path("/tmp"),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        timeout=8,
        check=False,
        env={
            "PATH": os.environ.get("PATH", ""),
            "LANG": os.environ.get("LANG", "C.UTF-8"),
            "LC_ALL": os.environ.get("LC_ALL", "C.UTF-8"),
        },
    )
    return v6.compact.compact_clip(
        f"python={sys.version}\nEXIT={proc.returncode}\n{proc.stdout}"
    )


v6._python = _controlled_python


if __name__ == "__main__":
    raise SystemExit(v7.main())
