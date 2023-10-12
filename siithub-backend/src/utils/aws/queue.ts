import { Consumer } from "sqs-consumer";
import { SQSClient } from "@aws-sdk/client-sqs";
import { awsConfig } from "./config";
import { PushInfo } from "../../features/commits/commit.model";
import { issueService } from "../../features/issue/issue.service";

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
    } catch (error) {}
  },
});

sqsConsumer.on("error", (err) => {
  console.error(err.message);
});

sqsConsumer.on("processing_error", (err) => {
  console.error(err.message);
});

export { sqsConsumer };
