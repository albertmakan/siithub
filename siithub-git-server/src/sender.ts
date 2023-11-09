import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { FORMAT_NL } from "./git/commits";
import { execCmd } from "./cmd.utils";
import { quote } from "shell-quote";

const NULL_SHA = /^0+$/;

async function sendMessage(message: string) {
  const SQS = new SQSClient({ region: process.env.REGION });
  const command = new SendMessageCommand({ MessageBody: message, QueueUrl: process.env.QUEUE_URL });
  const result = await SQS.send(command);
  console.log(result);
}

async function processChanges() {
  const [, , cwd, oldrev, newrev, branch] = process.argv;
  if (!branch.startsWith("refs/heads/") || newrev.match(NULL_SHA)) return;
  const [username, repository] = cwd.split("/").slice(-3, -1); // /home/username/repository/.git

  const isNewBranch = oldrev.match(NULL_SHA);
  const cmd = isNewBranch
    ? `git rev-list ${FORMAT_NL} --reverse ${newrev} --not --exclude=${quote([branch.slice(11)])} --branches=*`
    : `git rev-list ${FORMAT_NL} --reverse ${oldrev}..${newrev}`;
  const log = await execCmd(cmd, cwd);

  const commits = log.split("\n\n").map((commit) => {
    const [, name, email, date, sha, message] = commit.split("\n");
    return { author: { name, email }, date: +date, sha, message };
  });

  if (commits.length) {
    await sendMessage(JSON.stringify({ repository, username, branch, commits }));
  }
}

processChanges();
