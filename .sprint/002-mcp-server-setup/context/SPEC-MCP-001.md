# SPEC-MCP-001: OneCoder MCP Server Specification

## Executive Summary

The OneCoder MCP Server enables Claude Code and other AI agents to interact with the onecoder CLI and project infrastructure through the Model Context Protocol (MCP). This specification defines the server's architecture, available tools, resources, and integration points.

## 1. Overview & Objectives

### 1.1 Purpose

Provide a structured, machine-readable interface to onecoder's sprint management, project analysis, and workflow automation capabilities via the MCP protocol.

### 1.2 Scope

- **In Scope**: MCP server exposing CLI commands, sprint data, specs, and project analysis
- **Out of Scope**: Browser-based UI, real-time collaboration features, external API integrations
- **Phase**: MVP (Minimum Viable Product) with room for expansion

### 1.3 Key Objectives

1. Enable Claude Code to manage sprints and tasks programmatically
2. Provide rich context from project artifacts (PRDs, ADRs, feedback)
3. Validate code changes against architecture decisions
4. Support future extensibility with additional tools and resources

## 2. Architecture & Design

### 2.1 MCP Server Overview

**Technology Stack**:
- **Runtime**: Bun (native MCP support planned, fallback to Node.js compatibility)
- **Protocol**: MCP v1.0 (Model Context Protocol)
- **Language**: TypeScript
- **Location**: `/mcp-server/` (sibling to `frontend/`, `backends/`, `gateways/`)

### 2.2 Server Components

```
MCP Server
├── Tools (Procedures)
│   ├── Sprint Management
│   │   ├── onecoder-sprint-start
│   │   ├── onecoder-sprint-status
│   │   ├── onecoder-sprint-commit
│   │   └── onecoder-sprint-close
│   ├── Project Analysis
│   │   ├── project-list-specs
│   │   ├── project-list-adr
│   │   └── project-analyze-architecture
│   └── Code Validation
│       ├── validate-against-spec
│       └── validate-against-adr
├── Resources (Data Access)
│   ├── Sprint Data
│   │   ├── list all sprints
│   │   ├── get sprint by ID
│   │   └── get sprint tasks
│   ├── Specifications
│   │   ├── list PRDs
│   │   └── get PRD content
│   └── Architecture
│       ├── list ADRs
│       └── get ADR content
└── Prompts (Optional)
    └── agent-guidance (how to use tools effectively)
```

### 2.3 Server Behavior

**Connection**:
- Runs as a long-lived process
- Accepts MCP protocol messages via stdio or HTTP
- Implements proper error handling and logging

**Execution**:
- Executes local commands (git, onecoder CLI)
- Reads/parses project files (sprint.yaml, specs, docs)
- Returns structured JSON responses

## 3. Tools Specification

### 3.1 Sprint Management Tools

#### 3.1.1 onecoder-sprint-start

**Purpose**: Start a new sprint task

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "description": "Task name in kebab-case (e.g., 'implement-auth')"
    },
    "description": {
      "type": "string",
      "description": "Optional task description"
    }
  },
  "required": ["name"]
}
```

**Output**: JSON with sprint context (ID, status, current branch)

**Example**:
```bash
onecoder sprint start --name "implement-user-auth"
```

#### 3.1.2 onecoder-sprint-status

**Purpose**: Get current sprint status

**Input Schema**: None (no required parameters)

**Output**: JSON with active sprint info, task list, branch name

**Example**:
```bash
onecoder sprint status --json
```

#### 3.1.3 onecoder-sprint-commit

**Purpose**: Create atomic commit with governance metadata

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "Commit message (type: description format)"
    },
    "spec_id": {
      "type": "string",
      "description": "Optional specification ID (e.g., SPEC-CLI-002)"
    },
    "files": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Files to stage (if empty, stages all)"
    }
  },
  "required": ["message"]
}
```

**Output**: JSON with commit hash, message, branch info

#### 3.1.4 onecoder-sprint-close

**Purpose**: Close sprint with retrospective

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "went_well": {
      "type": "string",
      "description": "What worked well in this sprint"
    },
    "to_improve": {
      "type": "string",
      "description": "Areas for improvement"
    },
    "action": {
      "type": "string",
      "description": "Actionable next steps"
    }
  },
  "required": []
}
```

**Output**: JSON with RETRO.md path, closure status

### 3.2 Project Analysis Tools

#### 3.2.1 project-list-specs

**Purpose**: List all project specifications (PRDs, ADRs)

**Input Schema**: None

**Output**: JSON array with spec metadata (ID, title, path, category)

#### 3.2.2 project-list-adr

**Purpose**: List all Architecture Decision Records

**Input Schema**: None

**Output**: JSON array with ADR metadata (ID, title, status, path)

#### 3.2.3 project-analyze-architecture

**Purpose**: Analyze project architecture and identify components

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "component": {
      "type": "string",
      "description": "Optional component to analyze (frontend, gateway, backend-bun, etc.)"
    }
  },
  "required": []
}
```

**Output**: JSON with component structure, dependencies, key files

### 3.3 Code Validation Tools

#### 3.3.1 validate-against-spec

**Purpose**: Validate code changes against a specification

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "spec_id": {
      "type": "string",
      "description": "Specification ID (e.g., SPEC-FRONTEND-001)"
    },
    "component": {
      "type": "string",
      "description": "Component path to validate"
    }
  },
  "required": ["spec_id"]
}
```

**Output**: JSON with validation results (checks passed/failed, recommendations)

#### 3.3.2 validate-against-adr

**Purpose**: Validate code against Architecture Decision Record

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "adr_id": {
      "type": "string",
      "description": "ADR ID (e.g., ADR-001)"
    },
    "component": {
      "type": "string",
      "description": "Component path to validate"
    }
  },
  "required": ["adr_id"]
}
```

**Output**: JSON with ADR compliance results

## 4. Resources Specification

### 4.1 Sprint Data Resources

**Resource Type**: `sprint`

**URI Pattern**: `sprint://<sprint-id>`

**Available Resources**:
- `sprint://all` - List all sprints
- `sprint://active` - Get active sprint
- `sprint://002-mcp-server-setup` - Get specific sprint by ID

**Response Format**: YAML/JSON containing sprint metadata and tasks

### 4.2 Specification Resources

**Resource Type**: `specification`

**URI Pattern**: `specification://<spec-id>`

**Available Resources**:
- `specification://all` - List all specifications
- `specification://SPEC-MCP-001` - Get specific specification
- `specification://PRD-*` - Get all PRDs

**Response Format**: Markdown content of specification

### 4.3 Architecture Resources

**Resource Type**: `architecture`

**URI Pattern**: `architecture://<component>`

**Available Resources**:
- `architecture://overview` - Overall architecture diagram and description
- `architecture://decisions` - List all ADRs
- `architecture://ADR-001` - Get specific ADR

**Response Format**: Markdown content with diagrams and analysis

### 4.4 Feedback & Friction Resources

**Resource Type**: `feedback`

**URI Pattern**: `feedback://all`

**Available Resources**:
- `feedback://all` - Complete FEEDBACK.md
- `feedback://recent` - Recent friction logs (last 10 entries)

**Response Format**: Markdown content

## 5. Implementation Details

### 5.1 MCP Server Structure

```typescript
// src/mcp-server.ts
import { Server } from "@modelcontextprotocol/sdk/server";

interface Tool {
  name: string;
  description: string;
  inputSchema: JSONSchema;
}

class OnecodeServer extends Server {
  // Initialize server with tools and resources
  constructor()

  // Tool implementations
  private async handleSprintStart(args: SprintStartArgs)
  private async handleSprintStatus(args: void)
  private async handleSprintCommit(args: SprintCommitArgs)
  private async handleSprintClose(args: SprintCloseArgs)

  private async handleProjectListSpecs(args: void)
  private async handleProjectListAdr(args: void)
  private async handleProjectAnalyzeArch(args: AnalyzeArchArgs)

  private async handleValidateSpec(args: ValidateSpecArgs)
  private async handleValidateAdr(args: ValidateAdrArgs)

  // Resource handlers
  private async handleResourceList(uri: string)
  private async handleResourceRead(uri: string)
}
```

### 5.2 Error Handling

- All tools return `{ success: boolean, data?: any, error?: string }`
- HTTP 400-level errors for invalid input
- HTTP 500-level errors for execution failures
- Detailed error messages with remediation suggestions

### 5.3 Logging & Debugging

- File-based logging to `/mcp-server/logs/server.log`
- Debug mode with verbose output (environment variable)
- Request/response logging for troubleshooting

## 6. Integration Points

### 6.1 Claude Code Integration

Claude Code will invoke MCP server through:
- Standard MCP protocol client
- Configuration in `.claudecode/mcp.json` or environment
- Access to tools and resources within code generation workflows

### 6.2 Project Integration

The MCP server integrates with:
- **onecoder CLI**: For sprint management and git operations
- **Project Files**: Sprint data, specs, ADRs, feedback logs
- **Git**: Commit creation, branch management
- **File System**: Project structure analysis

### 6.3 Future Extensions

Planned extensions:
- Backend status monitoring (Docker, AWS Lambda, etc.)
- Code generation triggers (scaffolding, templates)
- Test execution and reporting
- Performance metrics and analytics

## 7. Success Criteria

### 7.1 Functional Requirements

- [ ] MCP server implements MCP protocol v1.0
- [ ] All 8 core tools implemented and working
- [ ] All 4 resource types implemented and queryable
- [ ] Error handling with descriptive messages
- [ ] Proper request/response logging

### 7.2 Quality Requirements

- [ ] Validates with mcp-cli without errors
- [ ] Test MCP client successfully calls all tools
- [ ] Documentation covers all tools and resources
- [ ] Code is typed (TypeScript with strict mode)
- [ ] Reasonable test coverage (>70% for critical paths)

### 7.3 Operational Requirements

- [ ] Server starts cleanly with `bun run start`
- [ ] Handles graceful shutdown
- [ ] No blocking operations that timeout
- [ ] Resource usage reasonable (<100MB memory typical)

## 8. Out of Scope & Future Work

- Real-time updates via WebSocket (Phase 2)
- Prometheus metrics export (Phase 2)
- Custom prompt engineering (Phase 2)
- Multi-user concurrency controls (Phase 3)
- Integration with external LLMs (Phase 3)

---

**Document Version**: 1.0
**Last Updated**: 2026-02-22
**Status**: Active
**Owner**: Claude Code Sprint Team
