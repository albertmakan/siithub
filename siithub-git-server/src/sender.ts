import { exec } from "child_process";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const initRef = "0000000000000000000000000000000000000000";

const QUEUE_URL = process.env.QUEUE_URL;
const awsConfig = {
  credentials: {
    accessKeyId: process.env.ACCESS_KEY ?? "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY ?? "",
  },
  region: process.env.REGION,
};

processChanges();

function processChanges() {
  const [, , cwd, oldrev, newrev, branch] = process.argv;

  exec(
    `git log --reverse ${oldrev !== initRef ? oldrev + ".." : ""}${newrev} --pretty=format:"%an%n%ae%n%at%n%H%n%s%n"`,
    { cwd },
    (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${stderr}`);
        return;
      }
      const commits = stdout.split("\n\n").map((commit) => {
        const [name, email, date, sha, message] = commit.split("\n");
        return { author: { name, email }, date: +date, sha, message };
      });
      const [username, repository] = cwd.split("/").slice(-3, -1);

      sendMessage(JSON.stringify({ repository, username, branch, commits }));
    }
  );
}

async function sendMessage(message: string) {
  const SQS = new SQSClient(awsConfig);
  const command = new SendMessageCommand({ MessageBody: message, QueueUrl: QUEUE_URL });
  const result = await SQS.send(command);
  console.log(result);
}
