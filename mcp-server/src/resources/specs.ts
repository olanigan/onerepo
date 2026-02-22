import * as fs from "fs";
import * as path from "path";
import { Logger } from "../utils/logger.js";

const logger = new Logger("spec-resources");

export async function handleReadSpec(uri: string): Promise<string> {
  logger.info(`Reading specification resource: ${uri}`);

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    const specsDir = path.join(projectRoot, "specs");

    if (!fs.existsSync(specsDir)) {
      return JSON.stringify({
        error: "Specifications directory not found",
        path: specsDir,
      });
    }

    // Parse URI: specification://all, specification://SPEC-MCP-001
    const uriPart = uri.replace("specification://", "").trim();

    if (uriPart === "all" || uriPart === "") {
      // List all specifications
      const files = fs.readdirSync(specsDir).filter((f) => f.endsWith(".md"));

      const specs = files.map((file) => ({
        id: file.replace(".md", ""),
        title: file.replace(".md", "").replace(/[_-]/g, " "),
        path: path.join("specs", file),
        size: fs.statSync(path.join(specsDir, file)).size,
      }));

      return JSON.stringify(
        {
          specifications: specs,
          total: specs.length,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );
    }

    // Read specific specification
    const specPath = path.join(specsDir, `${uriPart}.md`);

    if (!fs.existsSync(specPath)) {
      // Try without extension
      const dirEntries = fs.readdirSync(specsDir);
      const match = dirEntries.find((f) => f.includes(uriPart));
      if (match) {
        return fs.readFileSync(path.join(specsDir, match), "utf-8");
      }

      return JSON.stringify({
        error: `Specification ${uriPart} not found`,
        path: specPath,
        availableSpecs: fs
          .readdirSync(specsDir)
          .filter((f) => f.endsWith(".md"))
          .map((f) => f.replace(".md", "")),
      });
    }

    const content = fs.readFileSync(specPath, "utf-8");
    logger.info(`Specification ${uriPart} read successfully`);

    return content;
  } catch (error) {
    logger.error(
      `Failed to read specification resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return JSON.stringify({
      error: `Failed to read specification resource: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}
