import { quote } from "shell-quote";
import { execCmd } from "../cmd.utils";

export async function getBranches(repoPath: string) {
  try {
    const branches = await execCmd(`git branch --format="%(refname:short)"`, repoPath);
    return branches.split("\n").filter(Boolean);
  } catch {
    return null;
  }
}

export async function createBranch(repoPath: string, source: string, branchName: string) {
  try {
    await execCmd(`git branch ${quote([branchName, source])}`, repoPath);
    return branchName;
  } catch {
    return null;
  }
}

export async function renameBranch(repoPath: string, branchName: string, newBranchName: string) {
  try {
    await execCmd(`git branch -m ${quote([branchName, newBranchName])}`, repoPath);
    return newBranchName;
  } catch {
    return null;
  }
}

export async function removeBranch(repoPath: string, branchName: string) {
  try {
    await execCmd(`git branch -d ${quote([branchName])}`, repoPath);
    return branchName;
  } catch {
    return null;
  }
}
