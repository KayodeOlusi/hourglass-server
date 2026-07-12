import * as winston from "winston";

const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack }) =>
          `${timestamp} ${level}: ${stack || message}`
        )
      )
    }),
    new winston.transports.File({
      filename: "./logs/index.log",
      level: "error",
      format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.errors({ stack: true }),
        winston.format.printf(({ level, message, timestamp, stack }) =>
          `${timestamp} ${level}: ${stack || message}`
        )
      )
    })
  ]
});

const loggerActions = {
  info(message: string) {
    return logger.info(message);
  },
  error(message: string, err?: object) {
    return logger.error(message, err);
  },
  warn(message: string) {
    return logger.warn(message);
  }
};

export { loggerActions };