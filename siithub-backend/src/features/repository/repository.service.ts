import {
  BadLogicException,
  DuplicateException,
  ForbiddenException,
  MissingEntityException,
} from "../../error-handling/errors";
import { logger } from "../../utils/aws/logger";
import { asyncFilter } from "../../utils/filter";
import { Branch } from "../branches/branches.models";
import { branchesService } from "../branches/branches.service";
import { collaboratorsService } from "../collaborators/collaborators.service";
import { gitServerClient } from "../gitserver/gitserver.client";
import { labelSeeder } from "../label/label.seeder";
import { type User } from "../user/user.model";
import { userService } from "../user/user.service";
import type { CounterType, Repository, RepositoryCreate, RepositoryForkCreate } from "./repository.model";
import { repositoryRepo } from "./repository.repo";

async function getRelevantRepos(userId: User["_id"]): Promise<Repository[]> {
  const collabs = await collaboratorsService.findByUser(userId);
  return findByIds(collabs.map((collab) => collab.repositoryId));
}

async function findOneOrThrow(id: Repository["_id"]): Promise<Repository> {
  const repository = await repositoryRepo.crud.findOne(id);
  if (!repository) {
    logger.warn("Repository not found", { repoId: id });
    throw new MissingEntityException("Repository with given id does not exist.");
  }
  return repository;
}

async function createRepository(repository: RepositoryCreate): Promise<Repository> {
  const repositoriesWithSameName = await findByOwnerAndName(repository.owner, repository.name);
  if (repositoriesWithSameName) {
    logger.warn("Repository with same name already exists", { repo: `${repository.owner}/${repository.name}` });
    throw new DuplicateException("Repository with same name already exists.", repository);
  }
  const existingUser = await userService.findByUsernameOrThrow(repository.owner);

  try {
    await gitServerClient.createRepository(existingUser.username, repository.name, repository.type);
  } catch (error) {
    logger.error("Failed to create repository in the file system", { repo: `${repository.owner}/${repository.name}` });
    throw new BadLogicException("Failed to create repository in the file system.");
  }

  const repo = await repositoryRepo.crud.add(repository);
  if (!repo) {
    logger.error("Failed to create repository", { repo: `${repository.owner}/${repository.name}` });
    throw new BadLogicException("Failed to create repository.");
  }
  logger.info("Repository is created", { repo: `${repository.owner}/${repository.name}` });

  await collaboratorsService.add({ repositoryId: repo._id, userId: existingUser._id, verified: true });
  await labelSeeder.seedDefaultLabels(repo._id);

  return repo;
}

async function deleteRepository(owner: string, name: string): Promise<Repository | null> {
  const repository = await findByOwnerAndNameOrThrow(owner, name);
  const existingUser = await userService.findByUsernameOrThrow(repository.owner);

  try {
    await gitServerClient.deleteRepository(existingUser.username, repository.name);
  } catch (error) {
    logger.error("Failed to delete repository in the file system", { repo: `${repository.owner}/${repository.name}` });
    throw new BadLogicException("Failed to delete repository in the file system.");
  }

  if (repository.forkedFrom) await decreaseCounterValue(repository.forkedFrom, "forks");

  const deletedRepo = await repositoryRepo.crud.delete(repository._id);
  logger.info("Repository is deleted", { repo: `${repository.owner}/${repository.name}` });
  return deletedRepo;
}

async function findByOwnerAndName(owner: string, name: string): Promise<Repository | null> {
  const repo = await repositoryRepo.findByOwnerAndName(owner, name);
  if (repo && !repo.defaultBranch) await tryCreateDefaultBranch(repo);
  return repo;
}

async function findByOwnerAndNameOrThrow(owner: string, name: string): Promise<Repository> {
  const repository = await findByOwnerAndName(owner, name);
  if (!repository) {
    logger.warn("Repository not found", { repo: `${owner}/${name}` });
    throw new MissingEntityException("Repository does not exist.");
  }
  return repository;
}

async function search(owner: string, term: string): Promise<Repository[]> {
  const user = await userService.findByUsernameOrThrow(owner);
  return (await getRelevantRepos(user._id)).filter((x) => !term || x.name.toLowerCase().includes(term.toLowerCase()));
}

async function increaseCounterValue(id: Repository["_id"], thing: CounterType): Promise<number> {
  const repo = await findOneOrThrow(id);
  const counters = repo.counters ?? { [thing]: 0 };
  counters[thing] = counters[thing] + 1 || 1;
  await repositoryRepo.crud.update(id, { counters });
  logger.info(`Increased ${thing} count`, { repo: `${repo.owner}/${repo.name}` });
  return counters[thing];
}

async function decreaseCounterValue(id: Repository["_id"], thing: "stars" | "forks"): Promise<number> {
  const repo = await findOneOrThrow(id);
  const counters = repo.counters ?? { [thing]: 0 };
  counters[thing] = counters[thing] - 1 || 0;
  await repositoryRepo.crud.update(id, { counters });
  logger.info(`Decreased ${thing} count`, { repo: `${repo.owner}/${repo.name}` });
  return counters[thing];
}

async function findByIds(ids: Repository["_id"][], type?: "private" | "public"): Promise<Repository[]> {
  return await repositoryRepo.crud.findMany({ _id: { $in: ids }, ...(type ? { type } : {}) });
}

async function forkRepository(
  { repoName, repoOwner, name, description, only1Branch }: RepositoryForkCreate,
  userId: User["_id"]
): Promise<Repository> {
  const repo = await findByOwnerAndNameOrThrow(repoOwner, repoName);
  const user = await userService.findOneOrThrow(userId);
  if (repo.owner === user.username) {
    logger.warn("Cannot fork own repository", { repo: `${repoOwner}/${repoName}`, user: user.username });
    throw new BadLogicException("You cannot fork your own repository.");
  }
  const collab = await collaboratorsService.findByRepositoryAndUser(repo._id, userId);
  if (repo.type !== "public" && !collab) {
    logger.warn("Cannot fork private repository, not a collaborator", {
      repo: `${repoOwner}/${repoName}`,
      user: user.username,
    });
    throw new ForbiddenException("You cannot fork this repository.");
  }
  const existingFork = await findFork(user.username, repo._id);
  if (existingFork) {
    logger.warn("Already forked repository", { repo: `${repoOwner}/${repoName}`, user: user.username });
    throw new BadLogicException("You already have forked this repository.");
  }
  const repoWithSameName = await findByOwnerAndName(user.username, name);
  if (repoWithSameName) {
    logger.warn("Repository with same name already exists", { repo: `${user.username}/${name}` });
    throw new DuplicateException("Repository with same name already exists.");
  }
  try {
    await gitServerClient.createRepositoryFork(user.username, name, repoOwner, repoName, repo.type, only1Branch);
  } catch (error) {
    logger.error("Failed to create repository fork in the file system", { repo: `${user.username}/${name}` });
    throw new BadLogicException("Failed to create repository in the file system.");
  }

  const repoFork = await repositoryRepo.crud.add({
    owner: user.username,
    name,
    type: repo.type,
    description,
    forkedFrom: repo._id,
  });
  if (!repoFork) {
    logger.error("Failed to create repository", { repo: `${user.username}/${name}` });
    throw new BadLogicException("Failed to create repository.");
  }
  logger.info("Repository fork is created", { repo: `${user.username}/${name}` });

  await collaboratorsService.add({ repositoryId: repoFork._id, userId, verified: true });
  await labelSeeder.seedDefaultLabels(repoFork._id);
  await increaseCounterValue(repo._id, "forks");

  return repoFork;
}

async function findForks(forkedFrom: Repository["_id"]): Promise<Repository[]> {
  return await repositoryRepo.crud.findMany({ forkedFrom }, { projection: { owner: 1, name: 1 } });
}

async function findFork(owner: string, forkedFrom: Repository["_id"]): Promise<Repository | null> {
  return (await repositoryRepo.crud.findManyCursor({ owner, forkedFrom })).next();
}

async function resolveForkedFrom(repository: Repository): Promise<any> {
  if (!repository.forkedFrom) return repository;
  return {
    ...repository,
    forkedFromRepo: await repositoryRepo.crud.findOne(repository.forkedFrom),
  };
}

async function findAllByOwner(owner: string, myId: User["_id"]): Promise<Repository[]> {
  const me = await userService.findOneOrThrow(myId);
  const repos = await repositoryRepo.crud.findMany({ owner });
  if (me.username === owner) return repos;
  return await asyncFilter(repos, async (repo) => {
    if (repo.type === "public") return true;
    return !!(await collaboratorsService.findByRepositoryAndUser(repo._id, myId));
  });
}

async function tryCreateDefaultBranch(repository: Repository) {
  const allBranches = await branchesService.findMany(repository.owner, repository.name);
  if (allBranches.length === 0) return;
  const branchName = ["main", "master", "develop"].find((b) => allBranches.includes(b));
  const defaultBranch = branchName ?? allBranches[0];
  await repositoryRepo.crud.update(repository._id, { defaultBranch });
  logger.info("Created default branch", { repo: `${repository.owner}/${repository.name}` });
}

async function changeDefaultBranch(id: Repository["_id"], defaultBranch: Branch) {
  const repo = await findOneOrThrow(id);
  await branchesService.findOneOrThrow(repo.owner, repo.name, defaultBranch);
  const updatedRepo = await repositoryRepo.crud.update(id, { defaultBranch });
  logger.info("Updated default branch", { repo: `${repo.owner}/${repo.name}` });
  return updatedRepo;
}

export type RepositoryService = {
  findOneOrThrow(id: Repository["_id"]): Promise<Repository>;
  create(repository: RepositoryCreate): Promise<Repository>;
  delete(owner: string, name: string): Promise<Repository | null>;
  findByOwnerAndName(owner: string, name: string): Promise<Repository | null>;
  findByOwnerAndNameOrThrow(owner: string, name: string): Promise<Repository>;
  increaseCounterValue(id: Repository["_id"], thing: CounterType): Promise<number>;
  search(owner: string, term?: string): Promise<Repository[]>;
  decreaseCounterValue(id: Repository["_id"], thing: "stars" | "forks"): Promise<number>;
  findByIds(ids: Repository["_id"][], type?: "private" | "public"): Promise<Repository[]>;
  getRelevantRepos(userId: User["_id"]): Promise<Repository[]>;
  forkRepository(fork: RepositoryForkCreate, userId: User["_id"]): Promise<Repository>;
  findForks(forkedFrom: Repository["_id"]): Promise<Repository[]>;
  findFork(owner: string, forkedFrom: Repository["_id"]): Promise<Repository | null>;
  resolveForkedFrom(repository: Repository): Promise<any>;
  findAllByOwner(owner: string, myId: User["_id"]): Promise<Repository[]>;
  changeDefaultBranch(id: Repository["_id"], defaultBranch: Branch): Promise<any>;
};

const repositoryService: RepositoryService = {
  findOneOrThrow,
  create: createRepository,
  delete: deleteRepository,
  findByOwnerAndName,
  findByOwnerAndNameOrThrow,
  increaseCounterValue,
  search,
  findByIds,
  decreaseCounterValue,
  getRelevantRepos,
  forkRepository,
  findForks,
  findFork,
  resolveForkedFrom,
  findAllByOwner,
  changeDefaultBranch,
};

export { repositoryService };
