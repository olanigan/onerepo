import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Logger } from "./utils/logger.js";
import * as sprintTools from "./tools/sprint.js";
import * as projectTools from "./tools/project.js";
import * as validationTools from "./tools/validation.js";
import * as sprintResources from "./resources/sprints.js";
import * as specResources from "./resources/specs.js";
import * as archResources from "./resources/architecture.js";
import * as feedbackResources from "./resources/feedback.js";

const logger = new Logger("server");

interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  handler: (args: unknown) => Promise<Record<string, unknown> | string>;
}

interface Resource {
  uri: string;
  name: string;
  mimeType: string;
  handler: (uri: string) => Promise<string>;
}

export class OnecodeServer {
  private server: Server;
  private tools: Map<string, ToolDefinition> = new Map();
  private resources: Map<string, Resource> = new Map();
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.env.PROJECT_ROOT || "/home/user/onerepo";
    logger.info(
      `Initializing OneCoder MCP Server with project root: ${this.projectRoot}`
    );

    this.server = new Server(
      { name: "onecoder-mcp", version: "1.0.0" },
      { capabilities: { tools: {}, resources: {} } }
    );

    this.setupTools();
    this.setupResources();
    this.setupHandlers();

    logger.info(
      `Server initialized with ${this.tools.size} tools and ${this.resources.size} resource handlers`
    );
  }

  private setupTools(): void {
    logger.debug("Setting up MCP tools");

    // Sprint Management Tools
    this.tools.set("onecoder-sprint-start", {
      name: "onecoder-sprint-start",
      description: "Start a new sprint task",
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Task name in kebab-case",
          },
          description: {
            type: "string",
            description: "Optional task description",
          },
        },
        required: ["name"],
      },
      handler: sprintTools.handleSprintStart,
    });

    this.tools.set("onecoder-sprint-status", {
      name: "onecoder-sprint-status",
      description: "Get current sprint status",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: sprintTools.handleSprintStatus,
    });

    this.tools.set("onecoder-sprint-commit", {
      name: "onecoder-sprint-commit",
      description: "Create an atomic commit with governance metadata",
      inputSchema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Commit message",
          },
          spec_id: {
            type: "string",
            description: "Optional specification ID",
          },
          files: {
            type: "array",
            items: { type: "string" },
            description: "Files to stage",
          },
        },
        required: ["message"],
      },
      handler: sprintTools.handleSprintCommit,
    });

    this.tools.set("onecoder-sprint-close", {
      name: "onecoder-sprint-close",
      description: "Close sprint with retrospective",
      inputSchema: {
        type: "object",
        properties: {
          went_well: {
            type: "string",
            description: "What worked well",
          },
          to_improve: {
            type: "string",
            description: "Areas for improvement",
          },
          action: {
            type: "string",
            description: "Actionable next steps",
          },
        },
        required: [],
      },
      handler: sprintTools.handleSprintClose,
    });

    // Project Analysis Tools
    this.tools.set("project-list-specs", {
      name: "project-list-specs",
      description: "List all project specifications",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: projectTools.handleListSpecs,
    });

    this.tools.set("project-list-adr", {
      name: "project-list-adr",
      description: "List all Architecture Decision Records",
      inputSchema: {
        type: "object",
        properties: {},
        required: [],
      },
      handler: projectTools.handleListAdr,
    });

    this.tools.set("project-analyze-architecture", {
      name: "project-analyze-architecture",
      description: "Analyze project architecture",
      inputSchema: {
        type: "object",
        properties: {
          component: {
            type: "string",
            description: "Component to analyze",
          },
        },
        required: [],
      },
      handler: projectTools.handleAnalyzeArchitecture,
    });

    // Code Validation Tools
    this.tools.set("validate-against-spec", {
      name: "validate-against-spec",
      description: "Validate code against specification",
      inputSchema: {
        type: "object",
        properties: {
          spec_id: {
            type: "string",
            description: "Specification ID",
          },
          component: {
            type: "string",
            description: "Component path",
          },
        },
        required: ["spec_id"],
      },
      handler: validationTools.handleValidateSpec,
    });

    this.tools.set("validate-against-adr", {
      name: "validate-against-adr",
      description: "Validate code against Architecture Decision Record",
      inputSchema: {
        type: "object",
        properties: {
          adr_id: {
            type: "string",
            description: "ADR ID",
          },
          component: {
            type: "string",
            description: "Component path",
          },
        },
        required: ["adr_id"],
      },
      handler: validationTools.handleValidateAdr,
    });

    logger.info(`Registered ${this.tools.size} tools`);
  }

  private setupResources(): void {
    logger.debug("Setting up MCP resources");

    // Sprint resources
    this.resources.set("sprint", {
      uri: "sprint://",
      name: "Sprint Data",
      mimeType: "application/yaml",
      handler: sprintResources.handleReadSprint,
    });

    // Specification resources
    this.resources.set("specification", {
      uri: "specification://",
      name: "Specifications",
      mimeType: "text/markdown",
      handler: specResources.handleReadSpec,
    });

    // Architecture resources
    this.resources.set("architecture", {
      uri: "architecture://",
      name: "Architecture Decisions",
      mimeType: "text/markdown",
      handler: archResources.handleReadArchitecture,
    });

    // Feedback resources
    this.resources.set("feedback", {
      uri: "feedback://",
      name: "Feedback and Friction Logs",
      mimeType: "text/markdown",
      handler: feedbackResources.handleReadFeedback,
    });

    logger.info(`Registered ${this.resources.size} resource handlers`);
  }

  private setupHandlers(): void {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = Array.from(this.tools.values()).map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema as Record<string, unknown>,
      }));

      logger.debug(`Listing ${tools.length} tools`);
      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const name = request.params.name;
      logger.debug(`Tool call: ${name}`);

      const tool = this.tools.get(name);
      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }

      try {
        const result = await tool.handler(request.params.arguments);
        logger.debug(`Tool ${name} completed successfully`);
        return {
          content: [
            {
              type: "text" as const,
              text:
                typeof result === "string"
                  ? result
                  : JSON.stringify(result),
            },
          ],
        };
      } catch (error) {
        logger.error(
          `Tool ${name} failed:`,
          error instanceof Error ? error.message : String(error)
        );
        throw error;
      }
    });

    // Handle resource listing
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources = Array.from(this.resources.values()).map((r) => ({
        uri: r.uri + "*",
        name: r.name,
        mimeType: r.mimeType,
      }));

      logger.debug(`Listing ${resources.length} resources`);
      return { resources };
    });

    // Handle resource reading
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      logger.debug(`Resource read: ${uri}`);

      // Find matching resource handler
      for (const [, resource] of this.resources) {
        if (uri.startsWith(resource.uri)) {
          try {
            const content = await resource.handler(uri);
            logger.debug(`Resource ${uri} read successfully`);
            return {
              contents: [
                {
                  uri,
                  mimeType: resource.mimeType,
                  text: content,
                },
              ],
            };
          } catch (error) {
            logger.error(
              `Resource ${uri} failed:`,
              error instanceof Error ? error.message : String(error)
            );
            throw error;
          }
        }
      }

      throw new Error(`Resource not found: ${uri}`);
    });
  }

  async start(): Promise<void> {
    logger.info("Starting MCP server transport");

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info("MCP server connected via stdio");
  }

  async shutdown(): Promise<void> {
    logger.info("Shutting down MCP server");
  }
}
