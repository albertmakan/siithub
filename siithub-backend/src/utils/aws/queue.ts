import { Consumer } from "sqs-consumer";
import { SQSClient } from "@aws-sdk/client-sqs";
import { awsConfig } from "./config";
import { PushInfo } from "../../features/commits/commit.model";
import { issueService } from "../../features/issue/issue.service";
import { logger } from "./logger";

const SQS = new SQSClient(awsConfig);

const queueUrl = process.env.QUEUE_URL ?? "";

const sqsConsumer = Consumer.create({
  sqs: SQS,
  queueUrl,
  handleMessage: async (message) => {
    console.log(message.Body);
    if (!message.Body) return;
    try {
      const pushInfo: PushInfo = JSON.parse(message.Body);
      await issueService.processPushInfo(pushInfo);

      logger.info("Message processed", {
        repo: `${pushInfo.username}/${pushInfo.repository}`,
        branch: pushInfo.branch,
        commits: pushInfo.commits.length,
      });
    } catch (error) {}
  },
});

sqsConsumer.on("error", (err) => logger.error("Message error", { error: err.message }));
sqsConsumer.on("processing_error", (err) => logger.error("Message processing_error", { error: err.message }));

export { sqsConsumer };
