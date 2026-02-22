import * as fs from "fs";
import * as path from "path";

type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
  private name: string;
  private logFile: string;
  private logLevel: LogLevel;

  constructor(name: string) {
    this.name = name;
    this.logFile = path.join(
      import.meta.dir,
      "../../logs/server.log"
    );
    this.logLevel =
      (process.env.LOG_LEVEL as LogLevel) || "info";

    // Ensure logs directory exists
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    return levels[level] >= levels[this.logLevel];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${this.name}] ${message}`;
  }

  private write(level: LogLevel, message: string): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const formatted = this.formatMessage(level, message);

    // Log to stderr (stdout is reserved for MCP stdio protocol)
    console.error(formatted);

    // Log to file
    try {
      fs.appendFileSync(this.logFile, formatted + "\n");
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    const fullMessage = args.length > 0 ? `${message} ${JSON.stringify(args)}` : message;
    this.write("debug", fullMessage);
  }

  info(message: string, ...args: unknown[]): void {
    const fullMessage = args.length > 0 ? `${message} ${JSON.stringify(args)}` : message;
    this.write("info", fullMessage);
  }

  warn(message: string, ...args: unknown[]): void {
    const fullMessage = args.length > 0 ? `${message} ${JSON.stringify(args)}` : message;
    this.write("warn", fullMessage);
  }

  error(message: string, ...args: unknown[]): void {
    const fullMessage = args.length > 0 ? `${message} ${JSON.stringify(args)}` : message;
    this.write("error", fullMessage);
  }
}
