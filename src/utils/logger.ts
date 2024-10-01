import { createLogger, format, transports, Logger } from "winston";

const { combine, timestamp, json, colorize, printf } = format;

const consoleLogFormat = combine(
  colorize(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
  }),
);

const logger: Logger = createLogger({
  level: "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    json(),
  ),
  transports: [
    new transports.Console({
      level: "info",
      format: consoleLogFormat,
    }),
    new transports.File({
      filename: "logs/error.log",
      level: "error",
      format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
    }),
  ],
});

export default logger;
