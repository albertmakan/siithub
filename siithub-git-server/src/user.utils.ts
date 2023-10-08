import { execCmds } from "./cmd.utils";

export async function createUser(username: string) {
  await execCmds([
    `adduser ${username} -D`,
    `echo '${username}:default1234siithub'|chpasswd`, // Note: Alpine user needs to have a pwd for pub key auth to work!
    `mkdir /home/${username}/.ssh`,
    `touch /home/${username}/.ssh/authorized_keys`,
    `chown -R ${username} /home/${username}/.ssh`,
  ]);
}
