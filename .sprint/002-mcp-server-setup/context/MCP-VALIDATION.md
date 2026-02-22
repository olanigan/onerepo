# MCP Server Validation Guide

## Overview

This guide provides comprehensive validation procedures for the OneCoder MCP Server using:
- **mcp-cli**: Official Model Context Protocol CLI tool
- **Test MCP Client**: Custom lightweight test client
- **Integration Tests**: End-to-end validation scenarios

## Prerequisites

```bash
# Ensure mcp-cli is installed
npm install -g @modelcontextprotocol/mcp-cli

# Verify version
mcp-cli --version
# Expected: @modelcontextprotocol/mcp-cli v0.1.0 or higher
```

## Validation Stages

### Stage 1: MCP Protocol Compliance (mcp-cli)

#### 1.1 Check Server Implementation

```bash
cd /home/user/onerepo/mcp-server

# Validate TypeScript implementation
mcp-cli validate src/index.ts

# Expected output:
# ✓ Protocol version supported: 1.0
# ✓ Server interface implemented correctly
# ✓ All required methods present
# ✓ No protocol violations
```

#### 1.2 Validate Tool Schemas

```bash
# List all registered tools
mcp-cli list-tools src/index.ts

# Expected output:
# Tools registered:
# 1. onecoder-sprint-start
# 2. onecoder-sprint-status
# 3. onecoder-sprint-commit
# 4. onecoder-sprint-close
# 5. project-list-specs
# 6. project-list-adr
# 7. project-analyze-architecture
# 8. validate-against-spec
# 9. validate-against-adr
```

#### 1.3 Validate Resource Patterns

```bash
# List all registered resources
mcp-cli list-resources src/index.ts

# Expected output:
# Resources registered:
# 1. sprint://* (Sprint data)
# 2. specification://* (Specifications)
# 3. architecture://* (Architecture decisions)
# 4. feedback://* (Feedback logs)
```

### Stage 2: Live Server Validation

#### 2.1 Start Server in Background

```bash
cd /home/user/onerepo/mcp-server

# Start development server (detach)
bun run dev &

# Wait for startup
sleep 2

# Check process is running
ps aux | grep "mcp-server\|node dist/index.js"

# Expected: Process running and listening on stdio
```

#### 2.2 Test Tool Calls with mcp-cli

```bash
# Test 1: Sprint Status
mcp-cli call onecoder/sprint-status

# Expected output:
# {
#   "type": "text",
#   "text": "{
#     \"success\": true,
#     \"data\": {
#       \"activeSprintId\": \"...\",
#       \"branch\": \"claude/sprint-002-setup\",
#       \"phase\": \"...\",
#       \"tasks\": [...]
#     }
#   }"
# }
```

```bash
# Test 2: List Specifications
mcp-cli call onecoder/project-list-specs

# Expected output includes specs from /onerepo/specs/
```

```bash
# Test 3: List Architecture Decisions
mcp-cli call onecoder/project-list-adr

# Expected output includes ADRs from /onerepo/docs/architecture/decisions/
```

```bash
# Test 4: Analyze Architecture
mcp-cli call onecoder/project-analyze-architecture \
  --arg component "frontend"

# Expected: Project structure analysis of frontend/
```

#### 2.3 Test Resource Reads with mcp-cli

```bash
# Read active sprint data
mcp-cli read sprint://active

# Expected: YAML/JSON sprint data including tasks, metadata

# List all sprints
mcp-cli read sprint://all

# Expected: List of all sprints with metadata

# Read specific sprint
mcp-cli read sprint://002-mcp-server-setup

# Expected: Full sprint.yaml content

# Read specification
mcp-cli read specification://SPEC-MCP-001

# Expected: Markdown specification content

# Read ADR
mcp-cli read architecture://ADR-001

# Expected: Markdown ADR content

# Read feedback log
mcp-cli read feedback://all

# Expected: Complete FEEDBACK.md content
```

### Stage 3: Test Client Validation

#### 3.1 Create Test Client

File: `mcp-server/test/mcp-client.ts`

```typescript
import { OnecodeServer } from "../src/server.js";

interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
  duration: number;
}

class TestClient {
  private server: OnecodeServer;
  private results: TestResult[] = [];

  async run(): Promise<boolean> {
    console.log("🧪 Starting OneCoder MCP Test Client\n");

    try {
      // Initialize server
      this.server = new OnecodeServer();

      // Run test suites
      await this.testSprintTools();
      await this.testProjectTools();
      await this.testValidationTools();
      await this.testSprintResources();
      await this.testSpecificationResources();
      await this.testArchitectureResources();

      // Print results
      this.printResults();

      return this.results.every(r => r.passed);
    } catch (error) {
      console.error("❌ Test client error:", error);
      return false;
    }
  }

  private async testSprintTools(): Promise<void> {
    console.log("📋 Testing Sprint Management Tools");

    // Test sprint-status
    const startTime = Date.now();
    try {
      const result = await this.server.callTool("onecoder-sprint-status", {});
      this.results.push({
        name: "onecoder-sprint-status",
        passed: result.success,
        message: result.error || "Sprint status retrieved",
        duration: Date.now() - startTime
      });
    } catch (error: any) {
      this.results.push({
        name: "onecoder-sprint-status",
        passed: false,
        message: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  private async testProjectTools(): Promise<void> {
    console.log("📊 Testing Project Analysis Tools");

    // Test project-list-specs
    const startTime = Date.now();
    try {
      const result = await this.server.callTool("project-list-specs", {});
      this.results.push({
        name: "project-list-specs",
        passed: result.success && Array.isArray(result.data),
        message: `Found ${result.data?.length || 0} specifications`,
        duration: Date.now() - startTime
      });
    } catch (error: any) {
      this.results.push({
        name: "project-list-specs",
        passed: false,
        message: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  private async testValidationTools(): Promise<void> {
    console.log("✅ Testing Code Validation Tools");

    // Test validate-against-adr
    const startTime = Date.now();
    try {
      const result = await this.server.callTool("validate-against-adr", {
        adr_id: "ADR-001"
      });
      this.results.push({
        name: "validate-against-adr",
        passed: result.success,
        message: result.error || "Validation completed",
        duration: Date.now() - startTime
      });
    } catch (error: any) {
      this.results.push({
        name: "validate-against-adr",
        passed: false,
        message: error.message,
        duration: Date.now() - startTime
      });
    }
  }

  private async testSprintResources(): Promise<void> {
    console.log("🔖 Testing Sprint Resources");

    const patterns = ["sprint://all", "sprint://active", "sprint://002-mcp-server-setup"];

    for (const pattern of patterns) {
      const startTime = Date.now();
      try {
        const result = await this.server.readResource(pattern);
        this.results.push({
          name: `resource:${pattern}`,
          passed: result !== null && result.length > 0,
          message: `${result?.length || 0} bytes`,
          duration: Date.now() - startTime
        });
      } catch (error: any) {
        this.results.push({
          name: `resource:${pattern}`,
          passed: false,
          message: error.message,
          duration: Date.now() - startTime
        });
      }
    }
  }

  private async testSpecificationResources(): Promise<void> {
    console.log("📖 Testing Specification Resources");

    const patterns = ["specification://all", "specification://SPEC-MCP-001"];

    for (const pattern of patterns) {
      const startTime = Date.now();
      try {
        const result = await this.server.readResource(pattern);
        this.results.push({
          name: `resource:${pattern}`,
          passed: result !== null && result.length > 0,
          message: `${result?.length || 0} bytes`,
          duration: Date.now() - startTime
        });
      } catch (error: any) {
        this.results.push({
          name: `resource:${pattern}`,
          passed: false,
          message: error.message,
          duration: Date.now() - startTime
        });
      }
    }
  }

  private async testArchitectureResources(): Promise<void> {
    console.log("🏗️  Testing Architecture Resources");

    const patterns = ["architecture://overview", "architecture://decisions"];

    for (const pattern of patterns) {
      const startTime = Date.now();
      try {
        const result = await this.server.readResource(pattern);
        this.results.push({
          name: `resource:${pattern}`,
          passed: result !== null && result.length > 0,
          message: `${result?.length || 0} bytes`,
          duration: Date.now() - startTime
        });
      } catch (error: any) {
        this.results.push({
          name: `resource:${pattern}`,
          passed: false,
          message: error.message,
          duration: Date.now() - startTime
        });
      }
    }
  }

  private printResults(): void {
    console.log("\n📊 Test Results:\n");

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    for (const result of this.results) {
      const icon = result.passed ? "✅" : "❌";
      const duration = result.duration.toFixed(0);
      console.log(`${icon} ${result.name.padEnd(35)} ${duration.padStart(4)}ms`);
      if (result.message) {
        console.log(`   └─ ${result.message}`);
      }
    }

    console.log(`\n${passed}/${total} tests passed`);
    console.log(passed === total ? "✨ All tests passed!" : "⚠️  Some tests failed");
  }
}

// Run tests
const client = new TestClient();
const success = await client.run();
process.exit(success ? 0 : 1);
```

#### 3.2 Run Test Client

```bash
cd /home/user/onerepo/mcp-server

# Compile test client
bun run build

# Run tests
bun test/mcp-client.ts

# Expected output:
# 🧪 Starting OneCoder MCP Test Client
#
# 📋 Testing Sprint Management Tools
# 📊 Testing Project Analysis Tools
# ✅ Testing Code Validation Tools
# 🔖 Testing Sprint Resources
# 📖 Testing Specification Resources
# 🏗️  Testing Architecture Resources
#
# 📊 Test Results:
#
# ✅ onecoder-sprint-status        125ms
# ✅ project-list-specs              45ms
# ✅ project-list-adr                42ms
# ✅ project-analyze-architecture   182ms
# ✅ validate-against-adr            98ms
# ✅ resource:sprint://all           23ms
# ✅ resource:sprint://active        19ms
# ✅ resource:specification://all    31ms
# ✅ resource:architecture://overview 27ms
#
# 9/9 tests passed
# ✨ All tests passed!
```

### Stage 4: Integration Tests

#### 4.1 End-to-End Workflow Test

```bash
# Scenario: Create a sprint task and commit changes

# 1. Start server
cd /home/user/onerepo/mcp-server
bun run dev &
sleep 1

# 2. Create new task via MCP
mcp-cli call onecoder/sprint-start \
  --arg name "test-mcp-integration" \
  --arg description "Testing MCP server integration"

# Expected: New sprint context created

# 3. Make a code change
echo "// MCP Server Test" >> src/test-marker.ts

# 4. Commit via MCP
mcp-cli call onecoder/sprint-commit \
  --arg message "feat: add test marker for MCP validation" \
  --arg files "src/test-marker.ts"

# Expected: Commit created with governance metadata

# 5. Check sprint status
mcp-cli call onecoder/sprint-status

# Expected: New task shown in active sprint

# 6. Cleanup
rm src/test-marker.ts
git reset HEAD~1  # Undo test commit
```

#### 4.2 Resource Availability Test

```bash
# Verify all expected resources are accessible

mcp-cli read sprint://002-mcp-server-setup && echo "✓ Sprint 002 data available"
mcp-cli read specification://SPEC-MCP-001 && echo "✓ MCP Spec available"
mcp-cli read architecture://ADR-001 && echo "✓ ADR-001 available"
mcp-cli read feedback://recent && echo "✓ Feedback log available"
```

## Validation Checklist

### MCP Protocol Compliance
- [ ] Server implements MCP protocol v1.0
- [ ] mcp-cli validate passes without errors
- [ ] All tools registered and discoverable
- [ ] All resources registered and queryable
- [ ] Input schemas are valid JSON Schema
- [ ] Output formats consistent and documented

### Tool Functionality
- [ ] sprint-start creates new sprint task
- [ ] sprint-status returns current sprint info
- [ ] sprint-commit creates atomic commits
- [ ] sprint-close generates RETRO.md
- [ ] project-list-specs returns PRDs
- [ ] project-list-adr returns ADRs
- [ ] project-analyze-architecture analyzes components
- [ ] validate-against-spec works with specs
- [ ] validate-against-adr works with ADRs

### Resource Access
- [ ] sprint://all returns all sprints
- [ ] sprint://active returns current sprint
- [ ] sprint://ID returns specific sprint
- [ ] specification://all returns all specs
- [ ] specification://ID returns specific spec
- [ ] architecture://overview returns overview
- [ ] architecture://decisions returns ADR list
- [ ] feedback://all returns feedback log

### Error Handling
- [ ] Invalid tool calls return proper errors
- [ ] Missing parameters detected and reported
- [ ] Inaccessible resources handled gracefully
- [ ] File read errors reported clearly
- [ ] Command execution failures captured

### Performance
- [ ] Tool calls complete within 5 seconds
- [ ] Resource reads complete within 2 seconds
- [ ] Memory usage stays below 100MB
- [ ] No memory leaks on repeated calls
- [ ] Concurrent calls handled properly

### Documentation
- [ ] All tools documented with examples
- [ ] All resources documented
- [ ] Setup guide is clear and complete
- [ ] Validation procedures are repeatable
- [ ] Troubleshooting section helpful

## Reporting Results

Create a validation report after testing:

```markdown
# MCP Server Validation Report

**Date**: 2026-02-22
**Version**: 1.0.0
**Status**: ✅ PASSED

## Summary
- 9/9 tools functional
- 4/4 resource types accessible
- mcp-cli validation passed
- Test client: 100% pass rate

## Details
[Detailed results from each stage]

## Recommendations
[Any improvements found during validation]

## Sign-off
Validated and ready for production use.
```

## Continuous Validation

After initial validation, run periodic checks:

```bash
# Daily validation script
# Add to cron: 0 9 * * * /path/to/daily-mcp-check.sh

#!/bin/bash
cd /home/user/onerepo/mcp-server

# Build
bun run build || exit 1

# Validate protocol
mcp-cli validate src/index.ts || exit 1

# Run tests
bun test/mcp-client.ts || exit 1

# Report
echo "✓ MCP Server validation successful at $(date)" >> /var/log/mcp-validation.log
```

---

**Last Updated**: 2026-02-22
**Version**: 1.0
**Status**: Active
