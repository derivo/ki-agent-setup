.PHONY: verify verify-docs

verify: verify-docs

verify-docs:
	python3 -m py_compile scripts/verify-docs.py
	python3 scripts/verify-docs.py
