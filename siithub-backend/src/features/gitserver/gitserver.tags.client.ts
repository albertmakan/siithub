import { BadLogicException } from "../../error-handling/errors";
import { logger } from "../../utils/aws/logger";
import { gitServerHttpClient } from "../../utils/axios";

async function createTag(username: string, repoName: string, tagName: string, target: string): Promise<string> {
  const response = await gitServerHttpClient.post(`/api/repo/${username}/${repoName}/tags`, { tagName, target });

  if (response.status !== 200) {
    logger.error("Failed to create tag", { target, tag: tagName, repo: `${username}/${repoName}` });
    throw new BadLogicException("Error while creating a new tag.");
  }
  return response.data;
}

async function deleteTag(username: string, repoName: string, tagName: string): Promise<string> {
  const response = await gitServerHttpClient.delete(`/api/repo/${username}/${repoName}/tags/${tagName}`);

  if (response.status !== 200) {
    logger.error("Failed to delete tag", { tag: tagName, repo: `${username}/${repoName}` });
    throw new BadLogicException("Error while deleting an existing tag.");
  }
  return response.data;
}

export type GitServerTagsClient = {
  createTag(username: string, repoName: string, tagName: string, target: string): Promise<string>;
  deleteTag(username: string, repoName: string, tagName: string): Promise<string>;
};

const gitServerTagsClient: GitServerTagsClient = {
  createTag,
  deleteTag,
};

export { gitServerTagsClient };
