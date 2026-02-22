import * as fs from "fs";
import * as path from "path";
import { Logger } from "../utils/logger.js";

const logger = new Logger("architecture-resources");

export async function handleReadArchitecture(uri: string): Promise<string> {
  logger.info(`Reading architecture resource: ${uri}`);

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    const adrDir = path.join(projectRoot, "docs/architecture/decisions");

    // Parse URI: architecture://overview, architecture://decisions, architecture://ADR-001
    const uriPart = uri.replace("architecture://", "").trim();

    if (uriPart === "overview" || uriPart === "") {
      // Return architecture overview
      const overviewPath = path.join(projectRoot, "docs/architecture");
      if (fs.existsSync(overviewPath)) {
        const files = fs.readdirSync(overviewPath);
        const readmeFile = files.find((f) => f.toLowerCase() === "readme.md");
        if (readmeFile) {
          return fs.readFileSync(path.join(overviewPath, readmeFile), "utf-8");
        }
      }

      // Fallback: generate overview
      return `# OneCoder Architecture Overview

## Project Structure

OneCoder is a multi-language backend shootout implementing a GTD (Getting Things Done) application across multiple programming languages and frameworks.

### Components

1. **Frontend**: Next.js 16 + Tailwind CSS v4
2. **Gateway**: Cloudflare Workers for backend routing
3. **Backends**: Multiple implementations (planned)
   - Bun + SQLite (reference)
   - Elixir + Phoenix
   - Ruby + Rails
   - PHP + Laravel
   - C# + .NET
   - Java + Spring Boot

## Key Architecture Decisions

See individual ADRs in the decisions/ directory for detailed architectural decisions.

## Development Workflow

All development follows the OneCoder sprint-based workflow with governance tracking and atomic commits.
`;
    }

    if (uriPart === "decisions") {
      // List all ADRs
      if (!fs.existsSync(adrDir)) {
        return JSON.stringify({
          message: "No Architecture Decision Records directory found",
          suggestions: [
            "Create docs/architecture/decisions/ directory",
            "Add ADR files (ADR-XXX.md) to track architectural decisions",
          ],
        });
      }

      const files = fs
        .readdirSync(adrDir)
        .filter((f) => f.endsWith(".md"));

      const adrs = files.map((file) => ({
        id: file.replace(".md", ""),
        title: file.replace(".md", "").replace(/[_-]/g, " "),
        path: path.join("docs/architecture/decisions", file),
        size: fs.statSync(path.join(adrDir, file)).size,
      }));

      return JSON.stringify(
        {
          decisions: adrs,
          total: adrs.length,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );
    }

    // Read specific ADR
    if (!fs.existsSync(adrDir)) {
      return JSON.stringify({
        error: `ADR directory not found: ${adrDir}`,
        suggestions: ["Create the directory and add ADR files"],
      });
    }

    const adrPath = path.join(adrDir, `${uriPart}.md`);

    if (!fs.existsSync(adrPath)) {
      // Try without extension
      const dirEntries = fs.readdirSync(adrDir);
      const match = dirEntries.find((f) => f.includes(uriPart));
      if (match) {
        return fs.readFileSync(path.join(adrDir, match), "utf-8");
      }

      return JSON.stringify({
        error: `ADR ${uriPart} not found`,
        path: adrPath,
        availableAdrs: fs
          .readdirSync(adrDir)
          .filter((f) => f.endsWith(".md"))
          .map((f) => f.replace(".md", "")),
      });
    }

    const content = fs.readFileSync(adrPath, "utf-8");
    logger.info(`ADR ${uriPart} read successfully`);

    return content;
  } catch (error) {
    logger.error(
      `Failed to read architecture resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return JSON.stringify({
      error: `Failed to read architecture resource: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}
