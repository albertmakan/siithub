import axios from "axios";
import { type Repository } from "../repository/repository.service";
import { type User } from "../users/user.model";

type TagCreate = {
  name: string;
  description: string;
  version: string;
  branch: string;
  isLatest: boolean;
  isPreRelease: boolean;
};

type Tag = TagCreate & {
  _id: string;
  commitSha: string;
  repositoryId: Repository["_id"];
  author: User["_id"];
  timeStamp: Date;
};

type TagWithRepository = Tag & {
  repository: Repository;
  user: User;
};

function getTagsByRepo(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/tags`);
}

function searchTagsInRepo(repositoryId: Repository["_id"], tagName: string) {
  return axios.get(`/api/repositories/${repositoryId}/tags`, { params: { name: tagName } });
}

function getTagsCountByRepo(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/tags/count`);
}

function createTag(repositoryId: Repository["_id"]) {
  return (tag: TagCreate) => axios.post(`/api/repositories/${repositoryId}/tags`, tag);
}

function deleteTag(repositoryId: Repository["_id"]) {
  return (version: string) => axios.delete(`/api/repositories/${repositoryId}/tags/${version}`);
}

export { getTagsByRepo, searchTagsInRepo, getTagsCountByRepo, createTag, deleteTag };

export type { Tag, TagCreate, TagWithRepository };
