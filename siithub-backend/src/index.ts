import express from "express";
import type { NextFunction, Request, Response } from "express";
import { apiRoutes } from "./api.routes";
import { config } from "./config";
import { getConnection } from "./db/mongo.utils";
import { ErrorHandler } from "./error-handling/error-handler";
import { sqsConsumer } from "./utils/aws/queue";
import cors from "cors";
import { logger } from "./utils/aws/logger";

const app = express();

const errorHandler = (error: Error, request: Request, response: Response, next: NextFunction) => {
  ErrorHandler.forResponse(response).handleError(error);
  next(error);
};

app
  .use(cors({ origin: process.env.CLIENT_URL }))
  .use(express.json({ limit: "10mb" }))
  .use(express.urlencoded({ limit: "10mb" }))
  .use("/api", apiRoutes)
  .use(errorHandler);

app.listen(config.port, () => {
  getConnection();
  sqsConsumer.start();
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);
  logger.info("Server restarted");
});
