# MCP Setup Guide: OneCoder MCP Server

## Quick Start

### 1. Install mcp-cli (for validation)

```bash
# On macOS/Linux
npm install -g @modelcontextprotocol/mcp-cli

# Or with bun
bun add -g @modelcontextprotocol/mcp-cli

# Verify installation
mcp-cli --version
```

### 2. Initialize MCP Server Package

```bash
cd /home/user/onerepo
mkdir -p mcp-server
cd mcp-server

# Create package.json
cat > package.json << 'EOF'
{
  "name": "@onecoder/mcp-server",
  "version": "1.0.0",
  "description": "OneCoder MCP Server for Claude Code integration",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "onecoder-mcp": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "bun run src/index.ts",
    "start": "bun run dist/index.js",
    "test": "bun test",
    "validate": "mcp-cli validate src/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.1.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "test"]
}
EOF

# Create directory structure
mkdir -p src/{tools,resources} test logs
```

### 3. Install Dependencies

```bash
cd /home/user/onerepo/mcp-server

# Using Bun (recommended)
bun install

# Or using npm/yarn
npm install
# or
yarn install
```

## Directory Structure

```
onerepo/
├── mcp-server/
│   ├── src/
│   │   ├── index.ts              # Main entry point
│   │   ├── server.ts             # MCP Server class
│   │   ├── tools/
│   │   │   ├── sprint.ts         # Sprint management tools
│   │   │   ├── project.ts        # Project analysis tools
│   │   │   └── validation.ts     # Code validation tools
│   │   └── resources/
│   │       ├── sprints.ts        # Sprint data resources
│   │       ├── specs.ts          # Specification resources
│   │       └── architecture.ts   # Architecture resources
│   ├── test/
│   │   ├── mcp-client.ts         # Test MCP client
│   │   └── integration.test.ts   # Integration tests
│   ├── dist/                     # Compiled output
│   ├── logs/                     # Server logs
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
```

## Core Implementation Steps

### Step 1: Create Entry Point (src/index.ts)

```typescript
#!/usr/bin/env bun
import { OnecodeServer } from "./server.js";

const server = new OnecodeServer();

process.on("SIGINT", () => {
  console.log("Shutting down MCP server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Shutting down MCP server...");
  process.exit(0);
});

// Start server
server.start();
```

### Step 2: Create Server Class (src/server.ts)

Implement the core MCP server that:
- Extends `Server` from `@modelcontextprotocol/sdk`
- Initializes tools and resources
- Handles tool calls and resource queries
- Executes local commands and file operations

### Step 3: Implement Tools (src/tools/)

Create tool implementations:
- `sprint.ts` - Sprint management (start, status, commit, close)
- `project.ts` - Project analysis (list specs, list ADRs, analyze architecture)
- `validation.ts` - Code validation (validate against spec, validate against ADR)

### Step 4: Implement Resources (src/resources/)

Create resource handlers:
- `sprints.ts` - Sprint data access
- `specs.ts` - Specification file reading
- `architecture.ts` - Architecture decision records

### Step 5: Create Test Client (test/mcp-client.ts)

Build a lightweight test client that:
- Connects to MCP server
- Calls all tools
- Reads all resource types
- Verifies responses

## Configuration

### Environment Variables

Create `.env` file in `mcp-server/` directory:

```bash
# Logging
LOG_LEVEL=info
LOG_FILE=./logs/server.log

# Project paths
PROJECT_ROOT=/home/user/onerepo
SPRINT_DIR=/home/user/onerepo/.sprint
SPECS_DIR=/home/user/onerepo/specs

# Server
MCP_PORT=9000
MCP_HOST=localhost
MCP_PROTOCOL=stdio  # or 'http'
```

### MCP Configuration for Claude Code

Create `~/.claudecode/mcp-servers.json`:

```json
{
  "onecoder": {
    "command": "bun",
    "args": ["run", "/home/user/onerepo/mcp-server/dist/index.js"],
    "env": {
      "LOG_LEVEL": "info"
    }
  }
}
```

## Running the Server

### Development Mode

```bash
cd /home/user/onerepo/mcp-server

# Run with hot reload
bun run dev

# Output:
# [INFO] OneCoder MCP Server starting...
# [INFO] Listening on stdio
# [INFO] Tools registered: 8
# [INFO] Resources registered: 4
# Ready for connections
```

### Production Mode

```bash
cd /home/user/onerepo/mcp-server

# Build
bun run build

# Start
bun start

# Or directly
node dist/index.js
```

### Validation with mcp-cli

```bash
# Validate server implementation
mcp-cli validate src/index.ts

# Expected output:
# ✓ MCP protocol compliance check
# ✓ All required fields present
# ✓ Tool schemas valid
# ✓ Resource patterns valid
```

## Testing the Server

### Using Test Client

```bash
cd /home/user/onerepo/mcp-server

# Run test client against running server
bun run test

# Expected output:
# Running test client...
# ✓ Sprint management tools working
# ✓ Project analysis tools working
# ✓ Validation tools working
# ✓ All resources accessible
# All tests passed!
```

### Manual Testing with mcp-cli

```bash
# In one terminal, start server
cd /home/user/onerepo/mcp-server
bun run dev

# In another terminal
mcp-cli call onecoder/sprint-start \
  --arg name "test-task" \
  --arg description "Testing MCP server"

# Call sprint status
mcp-cli call onecoder/sprint-status

# Read a resource
mcp-cli read sprint://active
mcp-cli read specification://all
```

## Troubleshooting

### MCP CLI Not Found

```bash
# Check installation
which mcp-cli

# If not found, install globally
npm install -g @modelcontextprotocol/mcp-cli

# Or install locally and run with npx
npx @modelcontextprotocol/mcp-cli --version
```

### Server Won't Start

```bash
# Check for port conflicts
lsof -i :9000

# Check file permissions
chmod +x /home/user/onerepo/mcp-server/dist/index.js

# Check logs
tail -f /home/user/onerepo/mcp-server/logs/server.log
```

### Tool Call Failures

1. Check server logs for detailed error messages
2. Verify project paths in environment variables
3. Ensure Git is properly configured
4. Test tool independently:
   ```bash
   cd /home/user/onerepo
   onecoder sprint status
   ```

### Resource Access Issues

1. Verify file paths are accessible
2. Check file permissions:
   ```bash
   ls -la /home/user/onerepo/.sprint/*/sprint.yaml
   ls -la /home/user/onerepo/specs/
   ls -la /home/user/onerepo/docs/architecture/decisions/
   ```
3. Ensure YAML/Markdown parsing is correct

## Next Steps

1. Build MCP server implementation
2. Run `bun run build` to compile TypeScript
3. Run `mcp-cli validate` to check MCP compliance
4. Start dev server and test with mcp-cli
5. Run full test client validation
6. Document results in validation report

## References

- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP SDK Documentation](https://github.com/modelcontextprotocol/sdk)
- [mcp-cli Documentation](https://github.com/modelcontextprotocol/cli)

---

**Last Updated**: 2026-02-22
**Status**: Active
**Version**: 1.0
