# Sprint 002: MCP Server Infrastructure Setup

## Sprint Goal

Establish a robust Model Context Protocol (MCP) server that exposes onecoder CLI functionality to Claude and other AI agents, enabling programmatic access to sprint management, project analysis, and code generation workflows.

## Current Status

**Phase**: Implementation
**State**: Active
**Last Updated**: 2026-02-22

## Overview

The onecoder ecosystem needs MCP server support to enable Claude Code and other AI tools to:
- Access sprint and task data programmatically
- Execute onecoder CLI commands through structured protocol
- Query project specifications and documentation
- Validate implementation against architecture decisions
- Provide rich context to AI agents for code generation tasks

## Tasks

| ID | Task | Status | Type |
|----|------|--------|------|
| 001 | Create MCP PRD and architecture documentation | 🔄 | documentation |
| 002 | Set up MCP server package and dependencies | ⏳ | setup |
| 003 | Implement core MCP server with tools and resources | ⏳ | implementation |
| 004 | Create mcp-cli validation and testing setup | ⏳ | tooling |
| 005 | Build test MCP clients for validation | ⏳ | testing |
| 006 | Document MCP server and integration points | ⏳ | documentation |
| 007 | Validate MCP server with mcp-cli and test clients | ⏳ | verification |
| 008 | Commit and push sprint 002 work | ⏳ | process |

## Key Architecture

```
┌─────────────────────────────────────────────────────┐
│           Claude Code / Claude IDE / Web            │
│         (MCP Protocol Clients/Consumers)            │
└──────────────────────┬──────────────────────────────┘
                       │
                  MCP Protocol
                       │
┌──────────────────────┴──────────────────────────────┐
│                                                      │
│  MCP Server (Bun Runtime)                          │
│  ┌───────────────────────────────────────────────┐ │
│  │ Tools                                         │ │
│  │  - onecoder-sprint-start                      │ │
│  │  - onecoder-sprint-commit                     │ │
│  │  - onecoder-sprint-status                     │ │
│  │  - project-analysis (specs, architecture)     │ │
│  │  - code-validation (linting, tests)           │ │
│  └───────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────┐ │
│  │ Resources                                     │ │
│  │  - Sprint Data (sprint.yaml, RETRO.md)       │ │
│  │  - Specifications (PRDs, ADRs)               │ │
│  │  - Project Artifacts (frontend, backends)    │ │
│  │  - Feedback & Friction Logs                  │ │
│  └───────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────┬──────────────────────────────┘
                       │
                  Local/Remote
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌──────────┐
   │Project │    │ CLI    │    │Git Repo  │
   │Files   │    │Execute │    │Integration
   └────────┘    └────────┘    └──────────┘
```

## Artifacts & Documentation

### Core Documentation
- **SPEC-MCP-001.md** - MCP server requirements and design specification
- **MCP-SETUP.md** - Step-by-step MCP server setup and installation guide
- **MCP-VALIDATION.md** - Validation procedures using mcp-cli and test clients

### Code Deliverables
- `src/mcp-server.ts` - Core MCP server implementation
- `src/tools/*.ts` - MCP tool implementations (sprint, project, validation)
- `src/resources/*.ts` - MCP resource implementations
- `test/mcp-client.ts` - Test MCP client for validation
- `package.json` - MCP server dependencies and scripts

## Next Steps

1. ✅ Create sprint 002 documentation structure
2. 🔄 Document MCP requirements and architecture (SPEC-MCP-001.md)
3. Set up MCP server package with bun
4. Implement core MCP server and tools
5. Create mcp-cli validation setup
6. Build and run test MCP clients
7. Document MCP integration with Claude Code
8. Commit work with atomic commits

## Success Criteria

- [ ] MCP server runs with Bun and implements MCP protocol v1.0
- [ ] Exposes 5+ tools for sprint and project management
- [ ] Provides 3+ resource types for data access
- [ ] Validates with mcp-cli without errors
- [ ] Test MCP client successfully calls all tools
- [ ] Documentation covers setup, usage, and validation
- [ ] All changes committed to sprint branch

## Related Sprints & Stories

- **Sprint 001**: Multi-backend GTD app foundation
- **SPEC-CLI-002**: OneCoder CLI requirements
- **ADR-001**: Hybrid local/cloud architecture
