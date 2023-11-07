import { execCmd, execCmds } from "../cmd.utils";
import { quote } from "shell-quote";

export async function getTree(repoPath: string, branch: string, treePath: string) {
  try {
    const lsTree = await execCmd(`git ls-tree ${quote([branch])}${treePath ? ":" + quote([treePath]) : ""}`, repoPath);
    const entries = lsTree
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [info, name] = line.split("\t");
        const [_mode, type, _objName] = info.split(" ");
        return { name, isFolder: type === "tree" };
      });
    const cmd = `git log -n 1 --pretty=format:"%at%n%H%n%s%n%n" ${quote([branch])}`;
    const latestCommitsLog = (
      await execCmds(
        entries.map((e) => `${cmd} -- ${quote([(treePath ? treePath + "/" : "") + e.name])}`),
        repoPath
      )
    ).split("\n\n");
    return entries.map((entry, i) => {
      const [date, sha, message] = latestCommitsLog[i].split("\n");
      return { ...entry, commit: { date: +date, sha, message } };
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}
