import { createLogger, format } from "winston";
import WinstonCloudwatch from "winston-cloudwatch";
import { awsConfig } from "./config";

export const logger = createLogger({
  level: "debug",
  format: format.json(),
  transports: [
    new WinstonCloudwatch({
      awsOptions: awsConfig,
      level: "info",
      logGroupName: process.env.LOG_GROUP,
      logStreamName: "log-stream",
      uploadRate: 10000,
    }),
  ],
});
