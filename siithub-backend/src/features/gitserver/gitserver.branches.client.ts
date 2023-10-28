import { BadLogicException } from "../../error-handling/errors";
import { logger } from "../../utils/aws/logger";
import { gitServerHttpClient } from "../../utils/axios";

async function getBranches(username: string, repoName: string): Promise<string[]> {
  const response = await gitServerHttpClient.get(`/api/repo/${username}/${repoName}/branches`);
  if (response.status !== 200) {
    logger.error("Failed to get branches", { repo: `${username}/${repoName}` });
    throw new BadLogicException("Error while getting repository branches.");
  }
  return response.data;
}

async function createBranch(username: string, repoName: string, source: string, branchName: string): Promise<string> {
  const response = await gitServerHttpClient.post(`/api/repo/${username}/${repoName}/branches`, { source, branchName });
  if (response.status !== 200) {
    logger.error("Failed to create branch", { source, branchName, repo: `${username}/${repoName}` });
    throw new BadLogicException("Error while creating a new repository branch.");
  }
  return response.data;
}

async function renameBranch(
  username: string,
  repoName: string,
  branchName: string,
  newBranchName: string
): Promise<string> {
  const response = await gitServerHttpClient.put(
    `/api/repo/${username}/${repoName}/branches/${encodeURIComponent(branchName)}`,
    { newBranchName }
  );
  if (response.status !== 200) {
    logger.error("Failed to rename branch", {
      branch: `${branchName} -> ${newBranchName}`,
      repo: `${username}/${repoName}`,
    });
    throw new BadLogicException("Error while renaming an existing repository branch.");
  }
  return response.data;
}

async function removeBranch(username: string, repoName: string, branchName: string): Promise<string> {
  const response = await gitServerHttpClient.delete(
    `/api/repo/${username}/${repoName}/branches/${encodeURIComponent(branchName)}`
  );
  if (response.status !== 200) {
    logger.error("Failed to remove branch", { branchName, repo: `${username}/${repoName}` });
    throw new BadLogicException("Error while removing an existing repository branch.");
  }
  return response.data;
}

export type GitServerBranchesClient = {
  getBranches(username: string, repoName: string): Promise<string[]>;
  createBranch(username: string, repoName: string, source: string, branchName: string): Promise<string>;
  renameBranch(username: string, repoName: string, branchName: string, newBranchName: string): Promise<string>;
  removeBranch(username: string, repoName: string, branchName: string): Promise<string>;
};

const gitServerBranchesClient: GitServerBranchesClient = {
  getBranches,
  createBranch,
  renameBranch,
  removeBranch,
};

export { gitServerBranchesClient };
