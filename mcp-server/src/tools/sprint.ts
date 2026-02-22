import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Logger } from "../utils/logger.js";

const logger = new Logger("sprint-tools");

export async function handleSprintStart(args: unknown): Promise<Record<string, unknown>> {
  const params = args as Record<string, unknown>;
  const name = params.name as string;
  const description = params.description as string | undefined;

  logger.info(`Starting sprint with name: ${name}`);

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    process.chdir(projectRoot);

    const command = description
      ? `onecoder sprint start --name "${name}" --description "${description}"`
      : `onecoder sprint start --name "${name}"`;

    const result = execSync(command, { encoding: "utf-8" });

    return {
      success: true,
      message: "Sprint started successfully",
      output: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to start sprint: ${message}`);

    return {
      success: false,
      error: message,
    };
  }
}

export async function handleSprintStatus(_args: unknown): Promise<Record<string, unknown>> {
  logger.info("Getting sprint status");

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    process.chdir(projectRoot);

    const result = execSync("onecoder sprint status --json", {
      encoding: "utf-8",
    });

    return {
      success: true,
      data: JSON.parse(result),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to get sprint status: ${message}`);

    try {
      const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
      const sprintDir = path.join(projectRoot, ".sprint");

      if (fs.existsSync(sprintDir)) {
        const sprints = fs
          .readdirSync(sprintDir)
          .filter((f) =>
            fs.statSync(path.join(sprintDir, f)).isDirectory()
          );

        return {
          success: true,
          data: {
            availableSprints: sprints,
            message: "No active sprint found",
          },
        };
      }
    } catch (fallbackError) {
      logger.error(
        `Fallback status check failed: ${
          fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        }`
      );
    }

    return {
      success: false,
      error: message,
    };
  }
}

export async function handleSprintCommit(args: unknown): Promise<Record<string, unknown>> {
  const params = args as Record<string, unknown>;
  const message = params.message as string;
  const specId = params.spec_id as string | undefined;
  const files = params.files as string[] | undefined;

  logger.info(`Committing with message: ${message}`);

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    process.chdir(projectRoot);

    if (files && files.length > 0) {
      for (const file of files) {
        execSync(`git add "${file}"`, { encoding: "utf-8" });
      }
    } else {
      execSync("git add .", { encoding: "utf-8" });
    }

    let command = `onecoder sprint commit -m "${message}"`;
    if (specId) {
      command += ` --spec-id ${specId}`;
    }

    const result = execSync(command, { encoding: "utf-8" });

    return {
      success: true,
      message: "Commit created successfully",
      output: result,
    };
  } catch (error) {
    const message_err = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to commit: ${message_err}`);

    return {
      success: false,
      error: message_err,
    };
  }
}

export async function handleSprintClose(args: unknown): Promise<Record<string, unknown>> {
  const params = args as Record<string, unknown>;
  const wentWell = params.went_well as string | undefined;
  const toImprove = params.to_improve as string | undefined;
  const action = params.action as string | undefined;

  logger.info("Closing sprint");

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    process.chdir(projectRoot);

    let command = "onecoder sprint close";
    if (wentWell) command += ` --went-well "${wentWell}"`;
    if (toImprove) command += ` --to-improve "${toImprove}"`;
    if (action) command += ` --action "${action}"`;

    const result = execSync(command, { encoding: "utf-8" });

    return {
      success: true,
      message: "Sprint closed successfully",
      output: result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to close sprint: ${message}`);

    return {
      success: false,
      error: message,
    };
  }
}
