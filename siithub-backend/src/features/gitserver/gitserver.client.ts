import { type GitServerBranchesClient, gitServerBranchesClient } from "./gitserver.branches.client";
import { MissingEntityException } from "../../error-handling/errors";
import { gitServerCollaboratorsClient, GitServerCollaboratorsClient } from "./gitserver-collaborators.client";
import { type GitServerTagsClient, gitServerTagsClient } from "./gitserver.tags.client";
import { gitServerHttpClient } from "../../utils/axios";

async function createUser(username: string): Promise<any> {
  return await gitServerHttpClient.post(`/api/users`, { username });
}

async function createRepository(username: string, repositoryName: string, type: "public" | "private"): Promise<any> {
  return await gitServerHttpClient.post(`/api/repositories`, { username, repositoryName, type });
}

async function createRepositoryFork(
  username: string,
  repositoryName: string,
  fromUsername: string,
  fromRepositoryName: string,
  type: "public" | "private",
  copyOnly1Branch?: string
): Promise<any> {
  return await gitServerHttpClient.post(`/api/repositories/fork`, {
    username,
    repositoryName,
    fromUsername,
    fromRepositoryName,
    type,
    copyOnly1Branch,
  });
}

async function deleteRepository(username: string, repositoryName: string): Promise<any> {
  return await gitServerHttpClient.put(`/api/repositories/delete`, { username, repositoryName });
}

async function addSshKey(username: string, key: string): Promise<any> {
  return await gitServerHttpClient.post(`/api/key`, { username, key });
}

async function updateSshKey(username: string, oldKey: string, key: string): Promise<any> {
  return await gitServerHttpClient.put(`/api/key`, { username, oldKey, key });
}

async function removeSshKey(username: string, key: string): Promise<any> {
  return await gitServerHttpClient.put(`/api/key/delete`, { username, key });
}

async function getTree(username: string, repoName: string, branch: string, treePath: string) {
  try {
    const response = await gitServerHttpClient.get(
      `/api/repo/${username}/${repoName}/tree/${encodeURIComponent(branch)}/${encodeURIComponent(treePath)}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Folder not found");
  }
}

async function getCommits(username: string, repoName: string, branch: string) {
  try {
    const response = await gitServerHttpClient.get(
      `/api/repo/${username}/${repoName}/commits/${encodeURIComponent(branch)}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Commits not found");
  }
}

async function getCommitsBetweenBranches(username: string, repoName: string, base: string, compare: string) {
  try {
    const response = await gitServerHttpClient.get(`/api/repo/${username}/${repoName}/commits/between`, {
      params: { base, compare },
    });
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Commits not found");
  }
}

async function getCommitsDiffBetweenBranches(username: string, repoName: string, base: string, compare: string) {
  try {
    const response = await gitServerHttpClient.get(`/api/repo/${username}/${repoName}/commits/diff/between`, {
      params: { base, compare },
    });
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Commits not found");
  }
}
async function getCommitsWithDiff(username: string, repoName: string, branch: string) {
  try {
    const response = await gitServerHttpClient.get(
      `/api/repo/${username}/${repoName}/commits/${encodeURIComponent(branch)}/with-diff`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Commits not found");
  }
}

async function getCommitCount(username: string, repoName: string, branch: string) {
  try {
    const response = await gitServerHttpClient.get(
      `/api/repo/${username}/${repoName}/commit-count/${encodeURIComponent(branch)}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Commits not found");
  }
}

async function getCommit(username: string, repoName: string, sha: string) {
  try {
    const response = await gitServerHttpClient.get(
      `/api/repo/${username}/${repoName}/commit/${encodeURIComponent(sha)}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Commit not found");
  }
}

async function getCommitsSha(username: string, repoName: string, branch: string) {
  try {
    const response = await gitServerHttpClient.get(
      `/api/repo/${username}/${repoName}/commit/sha/${encodeURIComponent(branch)}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Sha not found");
  }
}

async function mergeCommits(username: string, repoName: string, base: string, compare: string) {
  try {
    const response = await gitServerHttpClient.post(
      `/api/repo/${username}/${repoName}/commits/merge`,
      {},
      { params: { base, compare } }
    );
    return response.data;
  } catch (err) {
    return null;
  }
}

async function getFileHistoryCommits(username: string, repoName: string, branch: string, filePath: string) {
  try {
    const response = await gitServerHttpClient.get(
      `/api/repo/${username}/${repoName}/commits/${encodeURIComponent(branch)}/${encodeURIComponent(filePath)}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("Commits not found");
  }
}

async function getBlob(username: string, repoName: string, branch: string, blobPath: string) {
  try {
    const response = await gitServerHttpClient.get(
      `/api/repo/${username}/${repoName}/blob/${encodeURIComponent(branch)}/${encodeURIComponent(blobPath)}`,
      { responseType: "arraybuffer" }
    );
    return {
      size: response.headers["size"] + "",
      bin: response.headers["bin"] + "",
      data: response.data,
    };
  } catch (err) {
    throw new MissingEntityException("File not found");
  }
}

async function getBlobInfo(username: string, repoName: string, branch: string, blobPath: string) {
  try {
    const response = await gitServerHttpClient.get(
      `/api/repo/${username}/${repoName}/blob-info/${encodeURIComponent(branch)}/${encodeURIComponent(blobPath)}`
    );
    return response.data;
  } catch (err) {
    throw new MissingEntityException("File not found");
  }
}

export type GitServerClient = GitServerCollaboratorsClient &
  GitServerBranchesClient &
  GitServerTagsClient & {
    createUser(username: string): Promise<any>;
    createRepository(username: string, repositoryName: string, type: "public" | "private"): Promise<any>;
    createRepositoryFork(
      username: string,
      repositoryName: string,
      fromUsername: string,
      fromRepositoryName: string,
      type: "public" | "private",
      only1Branch?: string
    ): Promise<any>;
    deleteRepository(username: string, repositoryName: string): Promise<any>;
    addSshKey(username: string, key: string): Promise<any>;
    updateSshKey(username: string, oldKey: string, key: string): Promise<any>;
    removeSshKey(username: string, key: string): Promise<any>;
    getTree(username: string, repoName: string, branch: string, treePath: string): Promise<any>;
    getCommits(username: string, repoName: string, branch: string): Promise<any>;
    getCommitsBetweenBranches(username: string, repoName: string, base: string, compare: string): Promise<any>;
    getCommitsDiffBetweenBranches(username: string, repoName: string, base: string, compare: string): Promise<any>;
    getCommitsWithDiff(username: string, repoName: string, branch: string): Promise<any>;
    getCommitCount(username: string, repoName: string, branch: string): Promise<any>;
    getCommit(username: string, repoName: string, sha: string): Promise<any>;
    getCommitsSha(username: string, repoName: string, branch: string): Promise<any>;
    mergeCommits(username: string, repoName: string, base: string, compare: string): Promise<any>;
    getFileHistoryCommits(username: string, repoName: string, branch: string, filePath: string): Promise<any>;
    getBlob(
      username: string,
      repoName: string,
      branch: string,
      blobPath: string
    ): Promise<{ size: string; bin: string; data: any }>;
    getBlobInfo(username: string, repoName: string, branch: string, blobPath: string): Promise<any>;
  };

const gitServerClient: GitServerClient = {
  createUser,
  createRepository,
  createRepositoryFork,
  deleteRepository,
  addSshKey,
  updateSshKey,
  removeSshKey,
  getTree,
  getBlob,
  getBlobInfo,
  getCommits,
  getCommitsBetweenBranches,
  getCommitsDiffBetweenBranches,
  getCommitsWithDiff,
  getCommitCount,
  getCommit,
  getCommitsSha,
  mergeCommits,
  getFileHistoryCommits,
  ...gitServerCollaboratorsClient,
  ...gitServerBranchesClient,
  ...gitServerTagsClient,
};

export { gitServerClient };
