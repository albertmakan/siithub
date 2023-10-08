import { exec } from "child_process";

export function execCmd(cmd: string, cwd?: string): Promise<string> {
  console.log(cmd, " CWD:", cwd);
  return new Promise((res, rej) =>
    exec(cmd, { cwd }, (err, stdout, stderr) => {
      console.log(stderr);
      err ? rej(stderr) : res(stdout);
    })
  );
}

export function execCmds(cmds: string[], cwd?: string) {
  return execCmd(cmds.join(" && "), cwd);
}
