import { quote } from "shell-quote";
import { execCmd } from "./cmd.utils";

const keyOptions = "no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty";

export async function addKey(username: string, key: string) {
  await execCmd(`echo ${quote([keyOptions + " " + key])} >> /home/${username}/.ssh/authorized_keys`);
}

export async function removeKey(username: string, key: string) {
  const result = await execCmd(`cat /home/${username}/.ssh/authorized_keys`);
  await execCmd(`echo ${quote([result.replace(`${keyOptions} ${key}`, "")])} > /home/${username}/.ssh/authorized_keys`);
}
