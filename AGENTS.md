# Agent Operational Guide & Best Practices

This document serves as the primary operational manual for AI agents working within the `onerepo` project. It defines how to effectively use the `onecoder` CLI and manage the project's evolution.

## 1. `onecoder` CLI Standard Operating Procedures

### Sprint Management
- **Start**: Always ensure you are in an active task before coding.
  ```bash
  onecoder sprint start --name "task-name-kebab-case"
  ```
- **Commit**: NEVER use `git commit` directly. Use the atomic commit command to ensure governance metadata is captured.
  ```bash
  onecoder sprint commit -m "feat: description of change"
  ```
  *Note: Stage files with `git add` before committing, or pass specific files if the CLI supports it in the future.*

- **Status**: Check where you are.
  ```bash
  onecoder sprint status
  ```

### Governance
- **Zero-Debt**: We aim for clean code. Ensure linting and types pass before marking a task done.
- **Traceability**: If a Specification ID exists (in `specs/`), reference it in commits (e.g., `--spec-id SPEC-001`).

## 2. Self-Learning & Auto-Update Protocol

**Instruction to Agents:**
If you discover a new pattern, a friction point with the `onecoder` CLI, or a project-specific constraint:

1.  **Frictions/Bugs**: Log them in `FEEDBACK.md`. This is essential for the "Voice of the Coder" loop.
2.  **Operational Best Practices**: If you find a better way to do things (e.g., a specific test command sequence), **update this `AGENTS.md` file**.

---

## 3. Project Specifics: The "Backend Shootout"

- **Architecture**: One Frontend (Next.js), Multiple Backends, One Gateway (Cloudflare).
- **Current Sprint Focus**: Fullstack TypeScript (Next.js + Bun/SQLite).
- **Path Conventions**:
  - `frontend/`: The Next.js App
  - `gateways/`: The Routing Logic
  - `backends/<lang>-<framework>/`: The implementations.
