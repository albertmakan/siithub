import { createLogger, format } from "winston";
import WinstonCloudwatch from "winston-cloudwatch";
import { awsConfig } from "./config";
import moment from "moment";

export const logger = createLogger({
  level: "debug",
  format: format.json(),
  transports: [
    new WinstonCloudwatch({
      awsOptions: awsConfig,
      level: "info",
      logGroupName: process.env.LOG_GROUP,
      logStreamName: () => `backend/${moment().format("yyyy/MM/DD")}`,
      uploadRate: 10000,
      messageFormatter: JSON.stringify,
    }),
  ],
});
