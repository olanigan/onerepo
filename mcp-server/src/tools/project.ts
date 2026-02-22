import * as fs from "fs";
import * as path from "path";
import { Logger } from "../utils/logger.js";

const logger = new Logger("project-tools");

export async function handleListSpecs(_args: unknown): Promise<Record<string, unknown>> {
  logger.info("Listing project specifications");

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    const specsDir = path.join(projectRoot, "specs");

    if (!fs.existsSync(specsDir)) {
      return {
        success: false,
        error: "Specs directory not found",
      };
    }

    const files = fs.readdirSync(specsDir).filter((f) => f.endsWith(".md"));
    const specs = files.map((file) => ({
      id: file.replace(".md", ""),
      title: file.replace(".md", "").replace(/[_-]/g, " "),
      path: path.join("specs", file),
    }));

    logger.info(`Found ${specs.length} specifications`);

    return {
      success: true,
      data: specs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to list specs: ${message}`);

    return {
      success: false,
      error: message,
    };
  }
}

export async function handleListAdr(_args: unknown): Promise<Record<string, unknown>> {
  logger.info("Listing Architecture Decision Records");

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    const adrDir = path.join(projectRoot, "docs/architecture/decisions");

    if (!fs.existsSync(adrDir)) {
      return {
        success: true,
        data: [],
        message: "No ADR directory found (this is okay for early phases)",
      };
    }

    const files = fs.readdirSync(adrDir).filter((f) => f.endsWith(".md"));
    const adrs = files.map((file) => ({
      id: file.replace(".md", ""),
      title: file.replace(".md", "").replace(/[_-]/g, " "),
      path: path.join("docs/architecture/decisions", file),
    }));

    logger.info(`Found ${adrs.length} ADRs`);

    return {
      success: true,
      data: adrs,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to list ADRs: ${message}`);

    return {
      success: false,
      error: message,
    };
  }
}

export async function handleAnalyzeArchitecture(args: unknown): Promise<Record<string, unknown>> {
  const params = args as Record<string, unknown>;
  const component = params.component as string | undefined;

  logger.info(`Analyzing architecture${component ? ` for component: ${component}` : ""}`);

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";

    const analysis = {
      projectRoot,
      components: [] as Record<string, unknown>[],
      overview: "OneCoder backend shootout - Multi-language GTD application",
    };

    const componentDirs = ["frontend", "gateways", "backends", ".sprint", "specs", "docs"];

    for (const comp of componentDirs) {
      const compPath = path.join(projectRoot, comp);
      if (fs.existsSync(compPath)) {
        const stats = fs.statSync(compPath);
        analysis.components.push({
          name: comp,
          path: comp,
          type: stats.isDirectory() ? "directory" : "file",
          exists: true,
        });
      }
    }

    if (component) {
      const compPath = path.join(projectRoot, component);
      if (fs.existsSync(compPath)) {
        const files = getDirectoryStructure(compPath, 2);
        return {
          success: true,
          data: {
            component,
            structure: files,
            path: compPath,
          },
        };
      }
    }

    logger.info(`Architecture analysis complete with ${analysis.components.length} components`);

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to analyze architecture: ${message}`);

    return {
      success: false,
      error: message,
    };
  }
}

function getDirectoryStructure(
  dir: string,
  depth: number,
  currentDepth = 0
): Record<string, unknown>[] {
  if (currentDepth >= depth) return [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    return entries
      .filter((e) => !e.name.startsWith("."))
      .slice(0, 20)
      .map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? "directory" : "file",
        path: path.join(dir, entry.name),
        children: entry.isDirectory()
          ? getDirectoryStructure(path.join(dir, entry.name), depth, currentDepth + 1)
          : undefined,
      }));
  } catch (error) {
    logger.warn(`Failed to read directory ${dir}: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
