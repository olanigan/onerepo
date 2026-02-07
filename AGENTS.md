# Agent Operational Guide & Best Practices

**Current Focus**: Fullstack TypeScript (Next.js + Bun/SQLite) | **Governing Doc**: [`ONECODER.md`](./ONECODER.md)

This document is the **Standard Operating Procedure (SOP)** for agents. It summarizes *how* to work effectively, while [`ONECODER.md`](./ONECODER.md) explains the *what* and *why* of the tooling.

## 1. Quick Start Protocol

1.  **Check In**: Read `FEEDBACK.md` to see recent issues.
2.  **Start Work**:
    ```bash
    onecoder sprint start --name "your-task-name"
    ```
3.  **Code & Verify**: Use `bun` for runtime and tests.
4.  **Commit**:
    ```bash
    git add .
    onecoder sprint commit -m "type: description"
    ```

## 2. The "Voice of the Coder" Loop

- **Found a Bug/Blocker?** → Log it in [`FEEDBACK.md`](./FEEDBACK.md) **immediately**.
- **Found a Better Way?** → Update this file (`AGENTS.md`) with the new best practice.

## 3. Proven Patterns (Learned Best Practices)

*Agents: Add new operational discoveries below this line.*

### Testing
- Always run `bun test` before committing.
- For UI tests, ensure the dev server is running before executing Playwright.

### Architecture
- **Specs (PRDs)**: Place Product Requirements Documents in `specs/` (e.g., `PRD-XXX.md`).
- **Decisions (ADRs)**: Place Architecture Decision Records in `docs/architecture/decisions/` (e.g., `ADR-XXX.md`).
- **Backends**: Place new backend services in `backends/<lang>-<framework>/`.

### Sprint Tracking
- **Manual Tasks**: For design/planning work not captured by CLI commands, manually edit `.sprint/<sprint-name>/sprint.yaml`.
  - **Critical**: Use `status: done` for completed tasks. The CLI ignores `completed`.
  - Structure: `id`, `title`, `status` (`todo`, `in_progress`, `done`), `type`.
