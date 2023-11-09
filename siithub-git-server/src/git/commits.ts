import { quote } from "shell-quote";
import { execCmd } from "../cmd.utils";
import { parseContributor, parseGitStats } from "../string.utils";
import { getFileSize } from "./blob.utils";

export const FORMAT = '--format="%an%n%ae%n%at%n%H%n%s"';
export const FORMAT_NL = '--format="%an%n%ae%n%at%n%H%n%s%n"';

export async function getCommits(repoPath: string, branch: string, withStats = false) {
  const cmd = withStats
    ? `git log --shortstat ${FORMAT} ${quote([branch])}`
    : `git log ${FORMAT_NL} ${quote([branch])}`;
  try {
    const log = await execCmd(cmd, repoPath);
    return log.split("\n\n").map((commit) => {
      const [name, email, date, sha, message, stats] = commit.split("\n");
      return {
        author: { name, email },
        date: +date,
        sha,
        message,
        stats: withStats ? parseGitStats(stats) : undefined,
      };
    });
  } catch {
    return null;
  }
}

export async function getCommitsBetweenRevisions(repoPath: string, base: string, compare: string) {
  try {
    const log = await execCmd(`git log ${FORMAT_NL} ${base ? quote([base]) + ".." : ""}${quote([compare])}`, repoPath);
    return log.split("\n\n").map((commit) => {
      const [name, email, date, sha, message] = commit.split("\n");
      return { author: { name, email }, date: +date, sha, message };
    });
  } catch {
    return null;
  }
}

export async function getCommitCount(repoPath: string, branch: string) {
  try {
    return +(await execCmd(`git rev-list --count ${quote([branch])}`, repoPath));
  } catch {
    return null;
  }
}

export async function getCommitsDiffBetweenBranches(repoPath: string, base: string, compare: string) {
  try {
    const [parentCommit, commit] = await getCommitsSha(repoPath, base, compare);
    if (!parentCommit || !commit) return null;
    return await getDiffData(repoPath, commit, parentCommit);
  } catch {
    return null;
  }
}

export async function getCommit(repoPath: string, sha: string) {
  try {
    const [commit] = await getCommitsSha(repoPath, sha);
    if (!commit) return null;
    return await getDiffData(repoPath, commit);
  } catch {
    return null;
  }
}

async function getDiffData(repoPath: string, commit: string, parentCommit?: string) {
  const numstatCommand = parentCommit
    ? `git diff --numstat -z ${quote([parentCommit])}..${quote([commit])}`
    : `git show --numstat -z ${FORMAT} ${quote([commit])}`;
  const cmdResult = (await execCmd(numstatCommand, repoPath)).split("\n");
  let commitInfo,
    numstatList = "";
  if (!parentCommit) {
    const [name, email, date, sha, message, numstat] = cmdResult;
    commitInfo = { author: { name, email }, date: +date, sha, message };
    numstatList = numstat;
  } else {
    numstatList = cmdResult[0];
  }
  const reg = /(\d+|-)\t(\d+|-)\t(?:\0(.+?)\0)?(.+?)\0/gy;
  const statRecord: { [fileName: string]: { total_additions: number; total_deletions: number } } = {};
  let match;
  while ((match = reg.exec(numstatList)) !== null) {
    const [, added, deleted, pre, post] = match;
    statRecord[post] = { total_additions: +added || 0, total_deletions: +deleted || 0 };
  }
  const diffListCommand = parentCommit
    ? `git diff --name-status ${quote([parentCommit])}..${quote([commit])}`
    : `git show --pretty=format:"" --name-status ${quote([commit])}`;
  const diffList = await execCmd(diffListCommand, repoPath);
  const patches = diffList
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [change, fileName, renamedTo] = line.split("\t");
      return {
        old: change.startsWith("A") ? undefined : { path: fileName, content: "" },
        new: change.startsWith("D") ? undefined : { path: renamedTo || fileName, content: "" },
        stats: statRecord[renamedTo || fileName],
        large: false,
      };
    });
  parentCommit ||= commit + "~";
  for (const patch of patches) {
    const oldSize = patch.old ? await getFileSize(repoPath, parentCommit, patch.old.path) : 0;
    const newSize = patch.new ? await getFileSize(repoPath, commit, patch.new.path) : 0;
    patch.large = oldSize > 20000 || newSize > 20000;
    if (patch.large) continue;

    if (patch.old)
      patch.old.content = await execCmd(`git show ${quote([parentCommit])}:${quote([patch.old.path])}`, repoPath);
    if (patch.new)
      patch.new.content = await execCmd(`git show ${quote([commit])}:${quote([patch.new.path])}`, repoPath);
  }

  return { diff: patches, ...commitInfo };
}

export async function getFileHistoryCommits(repoPath: string, branch: string, filePath: string) {
  try {
    const log = await execCmd(`git log ${FORMAT_NL} ${quote([branch])} -- ${quote([filePath])}`, repoPath);
    return log.split("\n\n").map((commit) => {
      const [name, email, date, sha, message] = commit.split("\n");
      return { author: { name, email }, date: +date, sha, message };
    });
  } catch {
    return null;
  }
}

export async function getLatestCommitAndContributors(repoPath: string, branch: string, blobPath: string) {
  try {
    const latestCommitLog = await execCmd(
      `git log -n 1 ${FORMAT} ${quote([branch])} -- ${quote([blobPath])}`,
      repoPath
    );
    const [name, email, date, sha, message] = latestCommitLog.split("\n");

    const contribLog = await execCmd(`git shortlog -se ${quote([branch])} -- ${quote([blobPath])}`, repoPath);
    const contributors = contribLog.split("\n").map(parseContributor).filter(Boolean);

    return { author: { name, email }, date: +date, sha, message, contributors };
  } catch {
    return null;
  }
}

export async function getCommitsSha(repoPath: string, ...revisions: string[]) {
  if (!revisions.length) return revisions;
  try {
    return (await execCmd(`git rev-parse ${revisions.map((r) => quote([r]) + "^{commit}").join(" ")}`, repoPath))
      .trim()
      .split("\n");
  } catch {
    return [];
  }
}

export async function mergeCommits(repoPath: string, base: string, compare: string) {
  try {
    const [compareSHA, baseSHA] = await getCommitsSha(repoPath, compare, base);
    if (!compareSHA || !baseSHA) return null;

    const newTree = (await execCmd(`git merge-tree --write-tree ${baseSHA} ${compareSHA}`, repoPath)).trim();
    const m = `Merge branch ${quote([compare, "into", base])}`;
    const newCommit = (
      await execCmd(`git commit-tree ${quote([newTree])} -p ${baseSHA} -p ${compareSHA} -m "${m}"`, repoPath)
    ).trim();
    await execCmd(`git update-ref ${quote([`refs/heads/${base}`, newCommit])}`, repoPath);
    return { baseSHA, compareSHA };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}
