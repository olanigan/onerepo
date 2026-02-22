# MCP Server Implementation Notes

## Sprint 007 Progress

### Completed

✅ Sprint 007 documentation structure created
✅ SPEC-MCP-001 - Technical specification documenting:
  - Complete architecture and design
  - 8+ tools for sprint, project, and validation
  - 4 resource types for data access
  - Implementation details and error handling
  - Success criteria and quality requirements

✅ MCP-SETUP.md - Comprehensive setup guide
  - Step-by-step installation instructions
  - Directory structure documentation
  - Configuration examples
  - mcp-cli usage
  - Troubleshooting guide

✅ MCP-VALIDATION.md - Validation procedures
  - mcp-cli compliance testing
  - Live server validation
  - Test client implementation guide
  - Integration test scenarios
  - Validation checklist

✅ MCP Server package structure
  - Bun/npm project setup
  - TypeScript configuration
  - Dependency installation
  - Utility logger implementation
  - Tool and resource module structure

### In Progress

🔄 MCP Server implementation
  - Core server class: ~80% complete
  - Tool implementations: Framework ready
  - Resource handlers: Framework ready
  - Test client: Template created

### Next Phase

Plan for Phase 2:
1. Resolve SDK import issues and finalize TypeScript compilation
2. Test with actual mcp-cli
3. Implement real tool integration with onecoder CLI
4. Create comprehensive test scenarios
5. Document agent integration patterns
6. Deploy and validate in production

## Architecture Overview

```
OneCoder MCP Server (Sprint 007)
├── Tools (Procedures)
│   ├── Sprint Management (4 tools)
│   │   └── Executes onecoder CLI commands
│   ├── Project Analysis (3 tools)
│   │   └── Inspects file system and specifications
│   └── Code Validation (2 tools)
│       └── Validates against specs and ADRs
│
├── Resources (Data Access)
│   ├── Sprint Data
│   ├── Specifications
│   ├── Architecture Decisions
│   └── Feedback Logs
│
└── Integration Layer
    ├── Logger (file + console)
    ├── Error handling
    └── MCP Protocol compliance
```

## Key Implementation Decisions

1. **Async-First**: All handlers use async/await for non-blocking operations

2. **Error Resilience**:
   - Tools include fallback mechanisms
   - Resources degrade gracefully
   - Detailed error logging

3. **Logging Strategy**:
   - File-based persistence
   - Console output for development
   - Configurable log levels

4. **Module Organization**:
   - Separate tools from resources
   - Utility modules for cross-cutting concerns
   - Clear separation of concerns

5. **Configuration**:
   - Environment-driven
   - Sensible defaults
   - `.env` template provided

## Sprint.yaml Integration

The MCP server reads sprint data from:
```
.sprint/
├── 001-setup-multi-backend-gtd-app/
│   ├── sprint.yaml
│   ├── README.md
│   └── context/
│
├── 007-mcp-server-setup/
│   ├── sprint.yaml
│   ├── README.md
│   ├── RETRO.md (generated after sprint close)
│   └── context/
│       ├── SPEC-MCP-001.md
│       ├── MCP-SETUP.md
│       └── MCP-VALIDATION.md
```

## Specification Integration

The `project-list-specs` tool reads from:
```
specs/
├── PRD-Frontend.md
├── PRD-Gateway.md
├── PRD-Backend-BunSQLite.md
├── README.md
└── openapi.yaml
```

## Architecture Decision Records

The `project-list-adr` tool reads from:
```
docs/architecture/decisions/
├── ADR-001.md
└── [future ADRs...]
```

## Testing Strategy

### Unit Testing
- Tool handler functions can be tested in isolation
- Resource handlers with mock file system

### Integration Testing
- mcp-cli validation
- Full server startup/shutdown
- End-to-end tool call scenarios

### Validation Testing
- MCP protocol compliance
- Tool schema validation
- Resource URI pattern matching

## Logging Examples

```
[2026-02-22T22:07:00.000Z] [INFO] [server] Initializing OneCoder MCP Server with project root: /home/user/onerepo
[2026-02-22T22:07:00.100Z] [INFO] [server] Registered 8 tools
[2026-02-22T22:07:00.110Z] [INFO] [server] Registered 4 resource handlers
[2026-02-22T22:07:00.200Z] [INFO] [server] Starting MCP server transport
[2026-02-22T22:07:00.300Z] [INFO] [server] MCP server connected via stdio
[2026-02-22T22:07:01.000Z] [DEBUG] [server] Tool call: onecoder-sprint-status
[2026-02-22T22:07:01.150Z] [DEBUG] [sprint-tools] Getting sprint status
[2026-02-22T22:07:01.200Z] [DEBUG] [server] Tool onecoder-sprint-status completed successfully
```

## Error Scenarios Handled

1. **Missing directories**
   - Spec directory not found → Return error with suggestion
   - ADR directory not found → Return empty list with message
   - Sprint directory not found → Return error

2. **File access failures**
   - Permission denied → Catch and return error
   - File not found → Check alternate locations, return error
   - Parse errors → Return raw content or error

3. **Command execution failures**
   - onecoder CLI not found → Return error with fallback info
   - Git not configured → Return error with setup instructions
   - Invalid input → Return validation error

4. **Resource access patterns**
   - Invalid URI → Find closest match or error
   - Wildcard patterns → Return list of matches
   - Pagination → Handled via response structure

## Claude Code Integration

Once working, the MCP server enables:

```typescript
// Agent pseudocode using MCP
const sprintStatus = await mcpClient.callTool("onecoder-sprint-status");
const specs = await mcpClient.readResource("specification://all");
const adrDecisions = await mcpClient.readResource("architecture://decisions");

// Agent can now:
// - Check current sprint progress
// - Read requirements before implementing
// - Validate changes against ADRs
// - Create new sprint tasks
// - Commit changes with governance
```

## Performance Considerations

1. **File System Access**: Direct reads, suitable for project-scale data
2. **Command Execution**: Async to prevent blocking
3. **Logging**: Async file writes
4. **Caching**: Could be added in Phase 2 for frequently accessed specs

## Security Considerations

1. **File Permissions**: Respects OS-level permissions
2. **Command Injection**: All dynamic commands quoted/escaped
3. **Path Traversal**: Restricted to project root
4. **Logging**: No sensitive data logged (credentials, tokens)

## Maintenance & Operations

### Health Check
```bash
curl http://localhost:9000/health  # if HTTP enabled
# or use mcp-cli
```

### Log Rotation
Configure externally:
```bash
logrotate /etc/logrotate.d/onecoder-mcp
```

### Monitoring
- Check `logs/server.log` for errors
- Monitor process memory/CPU
- Track tool call latencies
- Alert on error rates

## Version History

### v1.0.0 (Sprint 007)
- ✅ Documentation complete
- ✅ Package structure ready
- 🔄 Implementation in progress
- ⏳ Testing phase pending

## References

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [OneCoder Architecture](../../docs/architecture/decisions/ADR-001.md)
- [Project Requirements](../../specs/README.md)

---

**Document**: Sprint 007 Implementation Progress
**Created**: 2026-02-22
**Status**: Active
**Owner**: Claude Code Team
