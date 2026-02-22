import * as fs from "fs";
import * as path from "path";
import { Logger } from "../utils/logger.js";

const logger = new Logger("feedback-resources");

export async function handleReadFeedback(uri: string): Promise<string> {
  logger.info(`Reading feedback resource: ${uri}`);

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    const feedbackPath = path.join(projectRoot, "FEEDBACK.md");

    // Parse URI: feedback://all, feedback://recent
    const uriPart = uri.replace("feedback://", "").trim();

    if (!fs.existsSync(feedbackPath)) {
      return JSON.stringify({
        error: "FEEDBACK.md not found",
        path: feedbackPath,
        message: "No feedback log exists yet. Start by logging friction points.",
      });
    }

    const content = fs.readFileSync(feedbackPath, "utf-8");

    if (uriPart === "recent") {
      // Extract last 10 entries
      const lines = content.split("\n");

      // Find log entries (lines starting with ###)
      const entryIndices = lines
        .map((line, index) => (line.startsWith("###") ? index : -1))
        .filter((i) => i !== -1);

      if (entryIndices.length === 0) {
        return content; // Return full content if no structured log
      }

      // Get last 10 entries
      const recentIndices = entryIndices.slice(-10);
      const startIndex = recentIndices[0];
      const endIndex =
        recentIndices[recentIndices.length - 1] + 1 < lines.length
          ? lines.findIndex((line, i) => i > recentIndices[recentIndices.length - 1] && line.startsWith("###"))
          : lines.length;

      const recentContent =
        lines.slice(0, Math.min(20, startIndex)).join("\n") + // Include header
        "\n" +
        lines.slice(startIndex, endIndex).join("\n");

      logger.info(`Feedback resource read (recent entries)`);
      return recentContent;
    }

    logger.info(`Feedback resource read (all entries)`);
    return content;
  } catch (error) {
    logger.error(
      `Failed to read feedback resource: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return JSON.stringify({
      error: `Failed to read feedback resource: ${
        error instanceof Error ? error.message : String(error)
      }`,
    });
  }
}
