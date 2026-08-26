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
