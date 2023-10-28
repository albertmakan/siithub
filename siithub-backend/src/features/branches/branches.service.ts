import { BadLogicException, MissingEntityException } from "../../error-handling/errors";
import { logger } from "../../utils/aws/logger";
import { gitServerClient } from "../gitserver/gitserver.client";
import { type Branch } from "./branches.models";

async function findMany(username: string, repoName: string, name: string = ""): Promise<Branch[]> {
  return (await gitServerClient.getBranches(username, repoName)).filter((branch) =>
    branch.toLowerCase().includes(name.toLowerCase())
  );
}

async function findOne(username: string, repoName: string, branchName: string): Promise<Branch | null> {
  const branches = await findMany(username, repoName);
  return branches.find((branch) => branch === branchName) ?? null;
}

async function findOneOrThrow(username: string, repoName: string, branchName: string): Promise<Branch> {
  const branch = await findOne(username, repoName, branchName);
  if (!branch) {
    logger.warn("Branch not found", { branch: branchName, repo: `${username}/${repoName}` });
    throw new MissingEntityException(`Branch ${branchName} does not exist.`);
  }
  return branch;
}

async function createBranch(username: string, repoName: string, source: string, branchName: string): Promise<Branch> {
  await findOneOrThrow(username, repoName, source);

  const existingBranch = await findOne(username, repoName, branchName);
  if (existingBranch) {
    logger.warn("Cannot create branch because it already exists", {
      branch: branchName,
      repo: `${username}/${repoName}`,
    });
    throw new BadLogicException(`Branch ${branchName} already exist.`);
  }
  const branch = await gitServerClient.createBranch(username, repoName, source, branchName);
  logger.info("Branch is created", { branch: branchName, repo: `${username}/${repoName}` });
  return branch;
}

async function renameBranch(
  username: string,
  repoName: string,
  branchName: string,
  newBranchName: string
): Promise<Branch> {
  await findOneOrThrow(username, repoName, branchName);

  const existingBranch = await findOne(username, repoName, newBranchName);
  if (existingBranch) {
    logger.warn("Cannot rename branch because it already exists", {
      branch: branchName,
      repo: `${username}/${repoName}`,
    });
    throw new BadLogicException(`Branch ${newBranchName} already exist.`);
  }
  const branch = await gitServerClient.renameBranch(username, repoName, branchName, newBranchName);
  logger.info("Branch is renamed", { branch: `${branchName} -> ${newBranchName}`, repo: `${username}/${repoName}` });
  return branch;
}

async function removeBranch(username: string, repoName: string, branchName: string): Promise<Branch> {
  await findOneOrThrow(username, repoName, branchName);

  const branch = await gitServerClient.removeBranch(username, repoName, branchName);
  logger.info("Branch is deleted", { branch: branchName, repo: `${username}/${repoName}` });
  return branch;
}

export type BranchesService = {
  findMany(username: string, repoName: string, name?: string): Promise<Branch[]>;
  findOne(username: string, repoName: string, branchName: string): Promise<Branch | null>;
  findOneOrThrow(username: string, repoName: string, branchName: string): Promise<Branch>;
  create(username: string, repoName: string, source: string, branchName: string): Promise<Branch>;
  rename(username: string, repoName: string, branchName: string, newBranchName: string): Promise<Branch>;
  remove(username: string, repoName: string, branchName: string): Promise<Branch>;
};

const branchesService: BranchesService = {
  findMany,
  findOne,
  findOneOrThrow,
  create: createBranch,
  rename: renameBranch,
  remove: removeBranch,
};

export { branchesService };
