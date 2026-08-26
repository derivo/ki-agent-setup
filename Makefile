# One gate for the repo, run by .github/workflows/harness-ci.yml on every PR.
# Each check owns a block below and adds itself to `verify` with its own
# prerequisite line — additive, so a branch adding a check appends a block
# instead of editing a shared list.

.PHONY: verify
verify:

.PHONY: verify-docs
verify: verify-docs
verify-docs:
	python3 -m py_compile scripts/verify-docs.py
	python3 scripts/verify-docs.py

.PHONY: verify-guard
verify: verify-guard
verify-guard:
	node --check security/tool-guard.js
	node security/tool-guard.test.js

# compile() instead of py_compile: same syntax check, but py_compile writes
# __pycache__ under harness/, and the APPLY.md mirror rsync would deploy it.
.PHONY: verify-evals
verify: verify-evals
verify-evals:
	python3 -c 'import sys; [compile(open(f).read(), f, "exec") for f in sys.argv[1:]]' harness/evals/validate.py harness/evals/prompt.py
	python3 harness/evals/validate.py
