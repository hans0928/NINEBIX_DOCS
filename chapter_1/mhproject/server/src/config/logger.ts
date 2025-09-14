import winston from "winston";
import "winston-daily-rotate-file";
/** [KR] 로거 설정 / [EN] Logger setup */
export const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: "logs/server_%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m",
      maxFiles: "14d",
      zippedArchive: true
    }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});
