import fs from "fs";
import { execCmd, execCmds } from "../cmd.utils";
import { createUser } from "../user.utils";
import { addGroup, deleteGroup } from "../group.utils";
import { collabFile, homePath } from "../config";
import { quote } from "shell-quote";

export async function createRepo(username: string, repoName: string, publicRepo = false) {
  if (!fs.existsSync(`${homePath}/${username}`)) {
    await createUser(username);
  }
  const groupName = `${username}-${repoName}`;
  await addGroup(groupName, username);

  const repoPath = `${homePath}/${username}/${repoName}`;

  if (fs.existsSync(`${repoPath}/.git`)) return;

  await execCmds([
    `git init --bare ${repoPath}/.git`,
    `cd ${repoPath}`,
    `touch ${collabFile} ${publicRepo ? "public" : ""}`,
    `chown -R ${username}:${groupName} ${repoPath}`,
    `chmod -R 77${publicRepo ? 5 : 0} ${repoPath}`, // owner full access | group full access (collabs) | others no access
    `git config --global --add safe.directory ${repoPath}`,
  ]);
}

export async function removeRepo(username: string, repoName: string) {
  if (!fs.existsSync(`/home/.deleted`)) {
    await execCmd(`mkdir /home/.deleted`);
  }
  if (fs.existsSync(`${homePath}/${username}/${repoName}`)) {
    await execCmds([
      `cp -r ${homePath}/${username}/${repoName} /home/.deleted`,
      `rm -r ${homePath}/${username}/${repoName}`,
    ]);
    await deleteGroup(`${username}-${repoName}`);
  }
}

export async function createRepoFork(
  username: string,
  repoName: string,
  fromUsername: string,
  fromRepositoryName: string,
  publicRepo = false,
  only1Branch?: string
) {
  if (!fs.existsSync(`${homePath}/${username}`)) {
    await createUser(username);
  }
  const groupName = `${username}-${repoName}`;
  await addGroup(groupName, username);

  const forkedRepoPath = `${homePath}/${fromUsername}/${fromRepositoryName}`;
  const repoPath = `${homePath}/${username}/${repoName}`;
  const branchOptions = only1Branch ? `-b ${quote([only1Branch])} --single-branch` : "";

  if (fs.existsSync(`${repoPath}/.git`)) return;

  await execCmds([
    `git clone -n ${branchOptions} ${forkedRepoPath} ${repoPath}`,
    `cd ${repoPath}`,
    `touch ${collabFile} ${publicRepo ? "public" : ""}`,
    `chown -R ${username}:${groupName} ${repoPath}`,
    `chmod -R 77${publicRepo ? 5 : 0} ${repoPath}`,
    `git config --global --add safe.directory ${repoPath}`,
  ]);
}
