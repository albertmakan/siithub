import { quote } from "shell-quote";
import { execCmd } from "../cmd.utils";
import { execFile } from "child_process";

export async function getBlob(repoPath: string, branch: string, blobPath: string) {
  try {
    const fileType = await execCmd(`git cat-file -t ${quote([branch])}:${quote([blobPath])}`, repoPath);
    if (fileType.trim() !== "blob") return null;

    const size = await getFileSize(repoPath, branch, blobPath);
    const lastChange = await execCmd(
      `git log -n 1 --pretty="" --numstat ${quote([branch])} -- ${quote([blobPath])}`,
      repoPath
    );

    const content: Buffer = await new Promise((res, rej) =>
      execFile(
        "git",
        ["show", `${branch}:${blobPath}`],
        { cwd: repoPath, encoding: "buffer" },
        (error, stdout, stderr) => (error ? rej(stderr) : res(stdout))
      )
    );
    return { size, isBinary: lastChange.startsWith("-"), content };
  } catch {
    return null;
  }
}

export async function getFileSize(repoPath: string, revision: string, filePath: string) {
  const sizeStr = await execCmd(`git cat-file -s ${quote([revision])}:${quote([filePath])}`, repoPath);
  return +sizeStr;
}
