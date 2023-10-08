import { execCmd } from "../cmd.utils";
import { quote } from "shell-quote";

export async function createTag(repoPath: string, tagName: string, target: string) {
  try {
    await execCmd(`git tag ${quote([tagName, target])}`, repoPath);
    return tagName;
  } catch {
    return null;
  }
}

export async function deleteTag(repoPath: string, tagName: string) {
  try {
    await execCmd(`git tag -d ${quote([tagName])}`, repoPath);
    return tagName;
  } catch {
    return null;
  }
}
