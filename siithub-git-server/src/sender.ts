import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { getCommitsBetweenRevisions } from "./git/commits";

async function sendMessage(message: string) {
  const SQS = new SQSClient({
    credentials: {
      accessKeyId: process.env.ACCESS_KEY ?? "",
      secretAccessKey: process.env.SECRET_ACCESS_KEY ?? "",
    },
    region: process.env.REGION,
  });
  const command = new SendMessageCommand({ MessageBody: message, QueueUrl: process.env.QUEUE_URL });
  const result = await SQS.send(command);
  console.log(result);
}

async function processChanges() {
  const [, , cwd, oldrev, newrev, branch] = process.argv;
  const [username, repository] = cwd.split("/").slice(-3, -1); // /home/username/repository/.git

  const commits = await getCommitsBetweenRevisions(cwd, oldrev !== "0".repeat(40) ? oldrev : "", newrev, true);

  if (commits) {
    await sendMessage(JSON.stringify({ repository, username, branch, commits }));
  }
}

processChanges();
