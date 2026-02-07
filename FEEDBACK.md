# Project Feedback & Friction Log

This document serves as a repository for capturing friction points, bug reports, and suggested improvements for both the `onecoder` CLI and the project architecture.

## Protocol

**For Agents:**
When you encounter an error, a confusing workflow, or an opportunity for optimization:
1.  **Document it here immediately.**
2.  Use the format below.
3.  If critical for the current task, try to resolve it, but always log it for future refinement.

---

## Log

### [2026-02-07] CLI & Setup Frictions
- **Issue**: `onecoder sprint init` command was deprecated/unknown in the installed version vs. documentation expectations.
- **Resolution**: Used `onecoder sprint start --name ...` instead.
- **Suggestion**: Update global docs or ensure CLI version parity.

### [2026-02-07] Environment Gaps
- **Issue**: Missing runtimes for Java, PHP, .NET, Elixir in the current environment.
- **Impact**: Deferred multi-language backend setup.
- **Action**: Focusing on TypeScript/Bun stack for Sprint 1.
