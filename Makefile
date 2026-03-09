# Makefile for onerepo management

.PHONY: update setup

setup:
	git submodule update --init --recursive

update:
	git submodule update --remote --merge
	git add .
	git commit -m "chore: update submodules" || echo "No changes to commit"
