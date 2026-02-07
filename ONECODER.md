# OneCoder: The Operating System for Agents

This document is the authoritative guide on using the `onecoder` CLI and understanding the project's governance structure. It supersedes all previous "project-onecoder" documentation for agents working within the `onerepo`.

## 1. Core Philosophy

OneCoder is not just a tool; it is the **Governance Kernel**. It ensures that:
- **Every unit of work is tracked** (via Sprints).
- **Every code change is traceable** (via Atomic Commits).
- **Feedback is captured immediately** (via Friction Logs).

As an agent, you are expected to interact *primarily* through the `onecoder` CLI for SDLC management, while using standard tools (bun, git, docker) for execution.

## 2. The Feedback Loop

We maintain a strict separation between "Bugs/Friction" and "Operational Improvements".

| Artifact | Purpose | When to Update |
| :--- | :--- | :--- |
| **`FEEDBACK.md`** | **The Friction Log.** Captures bugs, missing tools, confused agents, or blockers. | **Immediately** upon encountering an issue. Do not wait. |
| **`AGENTS.md`** | **The SOP (Standard Operating Procedure).** Captures *proven* best practices, workflow improvements, and "how-to" guides. | **After** resolving a friction point and finding a better way. |
| **`ONECODER.md`** | **The System Manual.** (This file). Defines the immutable rules and CLI command reference. | **Only** when the underlying system or CLI changes. |

## 3. Sprint Management Workflow

The `onecoder sprint` command suite is your primary interface for managing work.

### A. Starting a Task
**Do not** just start coding. You must initialize a sprint context.

```bash
# Correct Usage
onecoder sprint start --name "task-name-kebab-case"
```
*Note: The command `onecoder sprint init` is deprecated/invalid. Use `start`.*

### B. Checking Status
Unsure where you are or what's tracked?

```bash
# Check current sprint status
onecoder sprint status

# Check status as JSON (for parsing)
onecoder sprint status --json
```

### C. Atomic Commits
**NEVER** use `git commit` directly for feature work. Use `onecoder sprint commit` to ensure governance metadata (Sprint ID, Spec ID) is attached.

```bash
# 1. Stage your changes normally
git add .

# 2. Commit with governance wrapper
onecoder sprint commit -m "feat: implement user login"

# 3. (Optional) Link to a specific specification
onecoder sprint commit -m "feat: implement user login" --spec-id SPEC-001
```

### D. Closing a Sprint
When the task is complete and verified:

```bash
onecoder sprint close --went-well "Fast implementation" --to-improve "Test coverage" --action "Add e2e tests"
```
This generates a `RETRO.md` and officially closes the governance loop.

## 4. Architecture & Design

### Architecture Decision Records (ADRs)
- Place ADRs in `docs/architecture/decisions/`.
- Use the format `ADR-XXX-title.md`.

### Product Requirements Documents (PRDs)
- Place PRDs in `specs/`.
- Use the format `PRD-XXX-title.md`.

## 5. Troubleshooting & FAQ

**Q: `onecoder` command not found?**
A: Ensure you are running it from the root or that it is in your PATH. If inside `onerepo`, check `package.json` scripts.

**Q: "Missing runtimes" error?**
A: Log it in `FEEDBACK.md`. We currently prioritize TypeScript/Bun/Node.js.

**Q: I found a better way to test!**
A: Update `AGENTS.md` with the new command sequence so future agents can learn from you.
