import { execCmd } from "../cmd.utils";
import { quote } from "shell-quote";

export async function getTree(repoPath: string, branch: string, treePath: string) {
  try {
    const lsTree = await execCmd(`git ls-tree ${quote([branch])}${treePath ? ":" + quote([treePath]) : ""}`, repoPath);
    const getLatestCommit = async (path: string) => {
      const log = await execCmd(
        `git log -n 1 --pretty=format:"%an%n%ae%n%at%n%H%n%s" ${quote([branch])} -- ${quote([
          (treePath ? treePath + "/" : "") + path,
        ])}`,
        repoPath
      );
      const [name, email, date, sha, message] = log.split("\n");
      return { author: { name, email }, date: +date, sha, message };
    };
    return await Promise.all(
      lsTree
        .split("\n")
        .filter(Boolean)
        .map(async (line) => {
          const [info, name] = line.split("\t");
          const [_mode, type, _objName] = info.split(" ");
          return { name, isFolder: type === "tree", commit: await getLatestCommit(name) };
        })
    );
  } catch (err) {
    console.error(err);
    return null;
  }
}
