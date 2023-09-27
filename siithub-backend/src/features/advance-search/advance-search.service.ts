import { type CommitsWithRepo } from "../commits/commit.model";
import { type IssueWithRepository } from "../issue/issue.model";
import { type PullRequestWithRepository } from "../pull-requests/pull-requests.model";
import { type TagWithRepository } from "../tags/tags.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
import { pullRequestsRepo } from "../pull-requests/pull-requests.repo";
import { repositoryRepo } from "../repository/repository.repo";
import { commitService } from "../commits/commit.service";
import { repositoryService } from "../repository/repository.service";
import { userRepo } from "../user/user.repo";
import { issueRepo } from "../issue/issue.repo";
import { tagsRepo } from "../tags/tags.repo";
import { userService } from "../user/user.service";
import { type BaseEntity } from "../../db/base.repo.utils";

const re = (searchParam: string) => ({ $regex: searchParam, $options: "i" });

const getRepoOptions = async (searchParam: string, userId: User["_id"]) => {
  const repoIds = (await repositoryService.getRelevantRepos(userId)).map((r) => r._id);
  return {
    $or: [
      { name: re(searchParam), type: "public" as const },
      { description: re(searchParam), type: "public" as const },
      { name: re(searchParam), _id: { $in: repoIds } },
      { description: re(searchParam), _id: { $in: repoIds } },
    ],
  };
};

const getUserOptions = (searchParam: string) => ({
  $or: [{ name: re(searchParam) }, { username: re(searchParam) }, { email: re(searchParam) }, { bio: re(searchParam) }],
});

const getPullRequestOptions = (searchParam: string, repositoryId?: Repository["_id"]) => ({
  ...(repositoryId ? { repositoryId } : {}),
  $or: [{ "csm.title": re(searchParam) }, { "csm.base": re(searchParam) }, { "csm.compare": re(searchParam) }],
});

const getTagsOptions = (searchParam: string, repositoryId?: Repository["_id"]) => ({
  ...(repositoryId ? { repositoryId } : {}),
  $or: [{ name: re(searchParam) }, { description: re(searchParam) }, { version: re(searchParam) }],
});

const getIssueOptions = (searchParam: string, repositoryId?: Repository["_id"]) => ({
  ...(repositoryId ? { repositoryId } : {}),
  $or: [{ "csm.title": re(searchParam) }, { "csm.description": re(searchParam) }],
});

async function searchRepositories(searchParam: string, userId: User["_id"], sort?: any) {
  const sortParams = sort || { name: 1 };
  return (await repositoryRepo.crud.findManyCursor(await getRepoOptions(searchParam, userId)))
    .sort(sortParams)
    .toArray();
}

async function countRepositories(searchParam: string, userId: User["_id"]) {
  return repositoryRepo.crud.count(await getRepoOptions(searchParam, userId));
}

async function searchUsers(searchParam: string, sort?: any) {
  const sortParams = sort || { username: 1 };
  return (await userRepo.crud.findManyCursor(getUserOptions(searchParam))).sort(sortParams).toArray();
}

function countUsers(searchParam: string) {
  return userRepo.crud.count(getUserOptions(searchParam));
}

async function searchPullRequest(
  searchParam: string,
  userId: User["_id"],
  repositoryId?: Repository["_id"],
  sort?: any
) {
  const sortParams = sort || { "csm.timeStamp": -1 };

  const pullRequests = await (
    await pullRequestsRepo.crud.findManyCursor(getPullRequestOptions(searchParam, repositoryId))
  )
    .sort(sortParams)
    .toArray();

  const repos = await getRepos(pullRequests, userId, repositoryId);
  const repoMap = getMapOfEntities(repos);

  return connectWithRepo(pullRequests, repoMap);
}

function countPullRequest(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]) {
  return pullRequestsRepo.crud.count(getPullRequestOptions(searchParam, repositoryId));
}

async function searchTags(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"], sort?: any) {
  const sortParams = sort || { timeStamp: -1 };

  const tags = await (await tagsRepo.crud.findManyCursor(getTagsOptions(searchParam, repositoryId)))
    .sort(sortParams)
    .toArray();

  const repos = await getRepos(tags, userId, repositoryId);
  const repoMap = getMapOfEntities(repos);

  const tagAuthors = tags.map((t) => t.author);
  const authors = await userService.findManyByIds(tagAuthors);
  const authorMap = getMapOfEntities(authors);

  return connectWithRepo(connectWithUser(tags, authorMap), repoMap);
}

function countTags(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]) {
  return tagsRepo.crud.count(getTagsOptions(searchParam, repositoryId));
}

async function searchIssues(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"], sort?: any) {
  const sortParams = sort || { "csm.timeStamp": -1 };

  const issues = await (
    await issueRepo.crud.findManyCursor(getIssueOptions(searchParam, repositoryId), {
      projection: { events: 0, "csm.comments": 0 },
    })
  )
    .sort(sortParams)
    .toArray();

  const repos = await getRepos(issues, userId, repositoryId);
  const repoMap = getMapOfEntities(repos);

  return connectWithRepo(issues, repoMap);
}

function countIssues(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]) {
  return issueRepo.crud.count(getIssueOptions(searchParam, repositoryId));
}

async function searchCommits(searchParam: string, repositoryId: Repository["_id"], sort?: any) {
  const direction = sort ? sort["date"] : 1;
  const repository = (await repositoryRepo.crud.findOne(repositoryId)) as Repository;
  const commits = await commitService.getCommits(repository.owner, repository.name, repository.defaultBranch || "");
  searchParam = searchParam.toLowerCase();
  return {
    commits: commits
      .filter((c) => c.message.toLowerCase().includes(searchParam))
      .sort((c1, c2) => direction * Number(new Date(c2.date)) - direction * Number(new Date(c1.date))),
    repository,
  };
}

async function countCommits(searchParam: string, repositoryId: Repository["_id"]) {
  const repository = (await repositoryRepo.crud.findOne(repositoryId)) as Repository;
  const commits = await commitService.getCommits(repository.owner, repository.name, repository.defaultBranch || "");
  searchParam = searchParam.toLowerCase();
  return commits.reduce((n, c) => n + (c.message.toLowerCase().includes(searchParam) ? 1 : 0), 0);
}

async function getRepos(
  objectList: { repositoryId: Repository["_id"] }[],
  userId: User["_id"],
  repositoryId?: Repository["_id"]
) {
  const repoIds = objectList?.map((o) => o.repositoryId);
  const publicRepos = await repositoryService.findByIds(repoIds, repositoryId ? undefined : "public");
  const relRepos = repositoryId ? [] : await repositoryService.getRelevantRepos(userId);
  return [...publicRepos, ...relRepos];
}

function getMapOfEntities<T extends BaseEntity>(entities: T[]) {
  return entities?.reduce((acc: { [id: string]: T }, e: T) => {
    acc[e._id + ""] = e;
    return acc;
  }, {});
}

function connectWithRepo<T extends { repositoryId: Repository["_id"] }>(
  objectList: T[],
  repoMap: { [id: string]: Repository }
) {
  return objectList.map?.((o) => ({ ...o, repository: repoMap[o.repositoryId + ""] })).filter((o) => !!o.repository);
}

function connectWithUser<T extends { author: User["_id"] }>(objectList: T[], authorMap: { [id: string]: User }) {
  return objectList.map?.((o) => ({ ...o, user: authorMap[o.author + ""] })).filter((o) => !!o.author);
}

export type AdvanceSearchService = {
  searchRepositories(searchParam: string, userId: User["_id"], sort?: any): Promise<Repository[]>;
  countRepositories(searchParam: string, userId: User["_id"]): Promise<number>;
  searchUsers(searchParam: string, sort?: any): Promise<User[]>;
  countUsers(searchParam: string): Promise<number>;
  searchTags(
    searchParam: string,
    userId: User["_id"],
    repositoryId?: Repository["_id"],
    sort?: any
  ): Promise<TagWithRepository[]>;
  countTags(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]): Promise<number>;
  searchIssues(
    searchParam: string,
    userId: User["_id"],
    repositoryId?: Repository["_id"],
    sort?: any
  ): Promise<IssueWithRepository[]>;
  countIssues(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]): Promise<number>;
  searchCommits(searchParam: string, repositoryId: Repository["_id"], sort?: any): Promise<CommitsWithRepo>;
  countCommits(searchParam: string, repositoryId: Repository["_id"]): Promise<number>;
  searchPullRequest(
    searchParam: string,
    userId: User["_id"],
    repositoryId?: Repository["_id"],
    sort?: any
  ): Promise<PullRequestWithRepository[]>;
  countPullRequest(searchParam: string, userId: User["_id"], repositoryId?: Repository["_id"]): Promise<number>;
};

const advanceSearchService: AdvanceSearchService = {
  searchRepositories,
  countRepositories,
  searchUsers,
  countUsers,
  searchTags,
  countTags,
  searchIssues,
  countIssues,
  searchCommits,
  countCommits,
  searchPullRequest,
  countPullRequest,
};

export { advanceSearchService };
