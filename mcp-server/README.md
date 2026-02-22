# OneCoder MCP Server

Model Context Protocol (MCP) server integration for OneCoder CLI, enabling Claude Code and other AI agents to access sprint management, project specifications, and architecture decision records programmatically.

## Quick Start

### Prerequisites

- Bun runtime (recommended) or Node.js 18+
- npm or bun package manager

### Installation

```bash
cd mcp-server
bun install
```

### Development

```bash
# Run in development mode with hot reload
bun run dev

# Build TypeScript
bun run build

# Run compiled version
bun start
```

## Project Structure

```
mcp-server/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # MCP Server implementation
│   ├── utils/
│   │   └── logger.ts         # Logging utility
│   ├── tools/
│   │   ├── sprint.ts         # Sprint management tools
│   │   ├── project.ts        # Project analysis tools
│   │   └── validation.ts     # Code validation tools
│   └── resources/
│       ├── sprints.ts        # Sprint data resources
│       ├── specs.ts          # Specification resources
│       ├── architecture.ts   # Architecture resources
│       └── feedback.ts       # Feedback log resources
├── test/
│   └── mcp-client.ts         # Test client
├── logs/                     # Log files
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
└── .env.example              # Environment template
```

## Available Tools

### Sprint Management

- `onecoder-sprint-start` - Start a new sprint task
- `onecoder-sprint-status` - Get current sprint status
- `onecoder-sprint-commit` - Create atomic commits with governance metadata
- `onecoder-sprint-close` - Close sprint with retrospective

### Project Analysis

- `project-list-specs` - List all project specifications (PRDs)
- `project-list-adr` - List all Architecture Decision Records
- `project-analyze-architecture` - Analyze project architecture and components

### Code Validation

- `validate-against-spec` - Validate code against a specification
- `validate-against-adr` - Validate code against an ADR

## Available Resources

### Sprint Data (`sprint://`)
- `sprint://all` - List all sprints
- `sprint://active` - Get active sprint data
- `sprint://ID` - Get specific sprint by ID

### Specifications (`specification://`)
- `specification://all` - List all specifications
- `specification://ID` - Get specific specification content

### Architecture (`architecture://`)
- `architecture://overview` - Architecture overview
- `architecture://decisions` - List all ADRs
- `architecture://ID` - Get specific ADR content

### Feedback (`feedback://`)
- `feedback://all` - Complete feedback log
- `feedback://recent` - Recent entries (last 10)

## Configuration

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Environment variables:

```bash
# Logging
LOG_LEVEL=info
LOG_FILE=./logs/server.log

# Project paths
PROJECT_ROOT=/home/user/onerepo
SPRINT_DIR=/home/user/onerepo/.sprint
SPECS_DIR=/home/user/onerepo/specs
DOCS_DIR=/home/user/onerepo/docs

# Server
MCP_PORT=9000
MCP_HOST=localhost
MCP_PROTOCOL=stdio
```

## Usage with Claude Code

### Configuration

In `~/.claudecode/mcp-servers.json`:

```json
{
  "onecoder-mcp": {
    "command": "bun",
    "args": ["run", "/home/user/onerepo/mcp-server/dist/index.js"],
    "env": {
      "LOG_LEVEL": "info",
      "PROJECT_ROOT": "/home/user/onerepo"
    }
  }
}
```

### Example: Starting a Sprint

```
@claude-assistant Start a sprint task named "implement-auth" using the onecoder-mcp tool
```

### Example: Getting Sprint Status

```
@claude-assistant What's the current sprint status?
```

### Example: Reading Sprint Data

```
@claude-assistant Show me all available sprints using the MCP resource sprint://all
```

## Testing

### With mcp-cli

```bash
# Validate protocol compliance
mpc-cli validate src/index.ts

# Call a tool
mcp-cli call onecoder-sprint-status

# Read a resource
mcp-cli read sprint://all
```

### With Test Client

```bash
# Run test suite
bun test/mcp-client.ts
```

## Implementation Notes

### Tools Implementation

Tools are implemented in `src/tools/` and handle:
- Sprint management via onecoder CLI
- Project analysis via file system inspection
- Code validation against specifications

### Resources Implementation

Resources are implemented in `src/resources/` and provide:
- YAML/JSON sprint data from `.sprint/*/sprint.yaml`
- Markdown content from `specs/` and `docs/architecture/decisions/`
- Log content from project feedback files

### Error Handling

All tools and resources include:
- Try-catch error handling
- Detailed logging
- Graceful fallbacks when possible
- Meaningful error messages

## Logging

Logs are written to:
- Console output (real-time)
- File: `./logs/server.log`

Log level controlled by `LOG_LEVEL` environment variable:
- `debug` - Detailed debug information
- `info` - General information (default)
- `warn` - Warning messages
- `error` - Error messages only

## Development Workflow

1. **Make changes** to `src/` files
2. **Build**: `bun run build`
3. **Test**: `bun test/mcp-client.ts`
4. **Validate**: `mcp-cli validate src/index.ts`
5. **Run**: `bun run dev` (development) or `bun start` (production)

## Troubleshooting

### Server Won't Start
- Check `LOG_LEVEL` is set to `debug` for more details
- Verify `PROJECT_ROOT` points to valid directory
- Ensure no other process uses `MCP_PORT`

### Tools Not Found
- Verify `onecoder` CLI is installed and in PATH
- Check project Git configuration
- Ensure project structure matches expectations

### Resources Return Empty
- Verify file paths in `.env`
- Check file permissions
- Ensure YAML/Markdown files are well-formed

## Architecture

See [SPEC-MCP-001.md](../.sprint/007-mcp-server-setup/context/SPEC-MCP-001.md) for complete technical specification.

### Key Design Decisions

1. **Tool-Based CLI Integration**: Tools wrap `onecoder` CLI commands for consistency
2. **Resource-Based Data Access**: Resources provide structured access to project artifacts
3. **File-System Inspection**: Direct file reading for fast analysis
4. **Comprehensive Logging**: Detailed logs for debugging and auditing
5. **Error Resilience**: Graceful handling of missing tools or files

## Future Enhancements

- WebSocket support for real-time updates
- Prometheus metrics export
- Custom prompt engineering for agent guidance
- Multi-user concurrency controls
- Integration with external LLMs
- Database persistence layer

## Related Documentation

- [SPEC-MCP-001.md](../.sprint/007-mcp-server-setup/context/SPEC-MCP-001.md) - Technical specification
- [MCP-SETUP.md](../.sprint/007-mcp-server-setup/context/MCP-SETUP.md) - Setup guide
- [MCP-VALIDATION.md](../.sprint/007-mcp-server-setup/context/MCP-VALIDATION.md) - Validation procedures
- [MCP Protocol](https://modelcontextprotocol.io/) - Official MCP documentation

## License

MIT

## Support

For issues or questions:
1. Check logs: `tail -f logs/server.log`
2. See troubleshooting section above
3. Review sprint documentation
4. Check project FEEDBACK.md for known issues

---

**Version**: 1.0.0
**Last Updated**: 2026-02-22
**Status**: MVP - Ready for Claude Code integration testing
