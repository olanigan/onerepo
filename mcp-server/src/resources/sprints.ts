import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "../utils/logger.js";

const logger = new Logger("sprint-resources");

export async function handleReadSprint(uri: string): Promise<string> {
  logger.info(`Reading sprint resource: ${uri}`);

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    const sprintDir = path.join(projectRoot, ".sprint");

    if (!fs.existsSync(sprintDir)) {
      return JSON.stringify({
        error: "Sprint directory not found",
        path: sprintDir,
      });
    }

    // Parse URI: sprint://all, sprint://active, sprint://007-mcp-server-setup
    const uriPart = uri.replace("sprint://", "").trim();

    if (uriPart === "all" || uriPart === "") {
      // List all sprints
      const sprints = fs
        .readdirSync(sprintDir)
        .filter((f) => fs.statSync(path.join(sprintDir, f)).isDirectory());

      const sprintData = sprints.map((sprint) => {
        const yamlPath = path.join(sprintDir, sprint, "sprint.yaml");
        if (fs.existsSync(yamlPath)) {
          return {
            id: sprint,
            name: sprint.split("-").slice(1).join("-"),
            hasData: true,
            path: path.join(".sprint", sprint),
          };
        }
        return {
          id: sprint,
          name: sprint.split("-").slice(1).join("-"),
          hasData: false,
        };
      });

      return JSON.stringify(
        {
          sprints: sprintData,
          total: sprintData.length,
          timestamp: new Date().toISOString(),
        },
        null,
        2
      );
    }

    if (uriPart === "active") {
      // Get current active sprint (based on git branch)
      try {
        const branch = execSync("git rev-parse --abbrev-ref HEAD", {
          encoding: "utf-8",
          cwd: projectRoot,
        }).trim();

        // Extract sprint ID from branch name (e.g., claude/sprint-007-setup-ABC -> 007-setup)
        const sprintMatch = branch.match(/sprint-(\d+-\w+)/);
        if (sprintMatch) {
          const sprintId = sprintMatch[1];
          const yamlPath = path.join(sprintDir, sprintId, "sprint.yaml");
          if (fs.existsSync(yamlPath)) {
            return fs.readFileSync(yamlPath, "utf-8");
          }
        }

        // Fallback: read latest sprint
        const sprints = fs
          .readdirSync(sprintDir)
          .filter((f) => fs.statSync(path.join(sprintDir, f)).isDirectory())
          .sort()
          .reverse();

        if (sprints.length > 0) {
          const yamlPath = path.join(sprintDir, sprints[0], "sprint.yaml");
          if (fs.existsSync(yamlPath)) {
            return fs.readFileSync(yamlPath, "utf-8");
          }
        }

        return JSON.stringify({ error: "No active sprint found" });
      } catch (error) {
        logger.warn(`Failed to detect active sprint: ${error instanceof Error ? error.message : String(error)}`);
        return JSON.stringify({ error: "Failed to detect active sprint" });
      }
    }

    // Read specific sprint
    const sprintPath = path.join(sprintDir, uriPart);
    const yamlPath = path.join(sprintPath, "sprint.yaml");

    if (!fs.existsSync(yamlPath)) {
      return JSON.stringify({
        error: `Sprint ${uriPart} not found`,
        path: yamlPath,
      });
    }

    const content = fs.readFileSync(yamlPath, "utf-8");
    logger.info(`Sprint ${uriPart} read successfully`);

    return content;
  } catch (error) {
    logger.error(
      `Failed to read sprint resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return JSON.stringify({
      error: `Failed to read sprint resource: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}
