import * as fs from "fs";
import * as path from "path";
import { Logger } from "../utils/logger.js";

const logger = new Logger("validation-tools");

export async function handleValidateSpec(args: unknown): Promise<Record<string, unknown>> {
  const params = args as Record<string, unknown>;
  const specId = params.spec_id as string;
  const component = params.component as string | undefined;

  logger.info(`Validating against spec: ${specId}`);

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    const specPath = path.join(projectRoot, "specs", `${specId}.md`);

    if (!fs.existsSync(specPath)) {
      return {
        success: false,
        error: `Specification ${specId} not found`,
      };
    }

    const specContent = fs.readFileSync(specPath, "utf-8");

    const checks = [
      {
        name: "Spec file exists",
        passed: fs.existsSync(specPath),
      },
      {
        name: "Spec contains requirements section",
        passed: specContent.includes("requirement") || specContent.includes("Requirement"),
      },
      {
        name: "Component path exists",
        passed: !component || fs.existsSync(path.join(projectRoot, component)),
      },
    ];

    const passedChecks = checks.filter((c) => c.passed).length;

    logger.info(`Spec validation: ${passedChecks}/${checks.length} checks passed`);

    return {
      success: true,
      data: {
        specId,
        component: component || "all",
        checks,
        summary: `${passedChecks}/${checks.length} validation checks passed`,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to validate spec: ${message}`);

    return {
      success: false,
      error: message,
    };
  }
}

export async function handleValidateAdr(args: unknown): Promise<Record<string, unknown>> {
  const params = args as Record<string, unknown>;
  const adrId = params.adr_id as string;
  const component = params.component as string | undefined;

  logger.info(`Validating against ADR: ${adrId}`);

  try {
    const projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    const adrPath = path.join(projectRoot, "docs/architecture/decisions", `${adrId}.md`);

    if (!fs.existsSync(adrPath)) {
      return {
        success: false,
        error: `ADR ${adrId} not found`,
      };
    }

    const adrContent = fs.readFileSync(adrPath, "utf-8");

    const checks = [
      {
        name: "ADR file exists",
        passed: fs.existsSync(adrPath),
      },
      {
        name: "ADR has status section",
        passed: adrContent.includes("Status") || adrContent.includes("status"),
      },
      {
        name: "ADR has decision section",
        passed: adrContent.includes("Decision") || adrContent.includes("decision"),
      },
      {
        name: "Component path exists",
        passed: !component || fs.existsSync(path.join(projectRoot, component)),
      },
    ];

    const passedChecks = checks.filter((c) => c.passed).length;

    logger.info(`ADR validation: ${passedChecks}/${checks.length} checks passed`);

    return {
      success: true,
      data: {
        adrId,
        component: component || "all",
        checks,
        summary: `${passedChecks}/${checks.length} validation checks passed`,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Failed to validate ADR: ${message}`);

    return {
      success: false,
      error: message,
    };
  }
}
