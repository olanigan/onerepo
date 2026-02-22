#!/usr/bin/env bun
import { OnecodeServer } from "./server.js";
import * as fs from "fs";
import * as path from "path";

// Ensure logs directory exists
const logsDir = path.join(import.meta.dir, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const server = new OnecodeServer();

// Handle shutdown gracefully
process.on("SIGINT", async () => {
  console.log("\n📴 Shutting down MCP server...");
  await server.shutdown();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n📴 Shutting down MCP server...");
  await server.shutdown();
  process.exit(0);
});

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled rejection:", reason);
  process.exit(1);
});

// Start server
try {
  console.log("🚀 Starting OneCoder MCP Server...");
  await server.start();
  console.log("✅ MCP Server ready for connections");
} catch (error) {
  console.error("❌ Failed to start MCP server:", error);
  process.exit(1);
}
