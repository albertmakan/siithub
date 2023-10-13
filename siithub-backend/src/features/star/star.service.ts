import { Filter } from "mongodb";
import type { Repository } from "../repository/repository.model";
import { repositoryService } from "../repository/repository.service";
import type { User } from "../user/user.model";
import type { Star } from "./star.model";
import { starRepo } from "./star.repo";
import { logger } from "../../utils/aws/logger";

async function findByRepoId(repoId: Repository["_id"]): Promise<Star[]> {
  return await starRepo.crud.findMany({ repoId }, { projection: { repoId: 0 } });
}

async function findByRepoIds(repoIds: Repository["_id"][], filters: Filter<Star> = {}): Promise<Star[]> {
  return await starRepo.crud.findMany({ repoId: { $in: repoIds }, ...(filters || {}) });
}

async function countByRepoId(repoId: Repository["_id"]): Promise<number> {
  return await starRepo.crud.count({ repoId });
}

async function findByUserId(userId: User["_id"]): Promise<Star[]> {
  return await starRepo.crud.findMany({ userId }, { projection: { userId: 0 } });
}

async function countByUserId(userId: User["_id"]): Promise<number> {
  return await starRepo.crud.count({ userId });
}

async function findByUserIdAndRepoId(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null> {
  return await starRepo.findByUserIdAndRepoId(userId, repoId);
}

async function addStar(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null> {
  const existingStar = await findByUserIdAndRepoId(userId, repoId);
  if (existingStar) {
    return existingStar;
  }
  const star = await starRepo.crud.add({ userId, repoId, date: new Date() });
  await repositoryService.increaseCounterValue(repoId, "stars");
  logger.info(`Star is added - UserId[${userId}], RepoId[${repoId}]`);
  return star;
}

async function removeStar(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null> {
  const existingStar = await findByUserIdAndRepoId(userId, repoId);
  if (!existingStar) {
    return existingStar;
  }
  const star = await starRepo.crud.delete(existingStar._id);
  await repositoryService.decreaseCounterValue(repoId, "stars");
  logger.info(`Star is removed - UserId[${userId}], RepoId[${repoId}]`);
  return star;
}

export type StarService = {
  addStar(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null>;
  removeStar(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null>;
  findByUserIdAndRepoId(userId: User["_id"], repoId: Repository["_id"]): Promise<Star | null>;
  findByRepoId(repoId: Repository["_id"]): Promise<Star[]>;
  findByRepoIds(repoIds: Repository["_id"][], filters?: Filter<Star>): Promise<Star[]>;
  countByRepoId(repoId: Repository["_id"]): Promise<number>;
  findByUserId(userId: User["_id"]): Promise<Star[]>;
  countByUserId(userId: User["_id"]): Promise<number>;
};

const starService: StarService = {
  addStar,
  removeStar,
  findByUserIdAndRepoId,
  findByRepoId,
  findByRepoIds,
  countByRepoId,
  findByUserId,
  countByUserId,
};

export { starService };
