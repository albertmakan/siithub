import { BadLogicException } from "../../error-handling/errors";
import { gitServerHttpClient } from "../../utils/axios";

async function createTag(username: string, repoName: string, tagName: string, target: string): Promise<string> {
  const response = await gitServerHttpClient.post(`/api/repo/${username}/${repoName}/tags`, { tagName, target });

  if (response.status !== 200) {
    throw new BadLogicException("Error while creating a new tag.");
  }
  return response.data;
}

async function deleteTag(username: string, repoName: string, tagName: string): Promise<string> {
  const response = await gitServerHttpClient.delete(`/api/repo/${username}/${repoName}/tags/${tagName}`);

  if (response.status !== 200) {
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
