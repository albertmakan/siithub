import { type BaseRepo, BaseRepoFactory } from "../../db/base.repo.utils";
import { type Repository } from "../repository/repository.model";
import { type Milestone, type MilestoneCreate, type MilestoneUpdate } from "./milestone.model";

const collectionName = "milestone";

async function findByRepositoryId(repositoryId: Repository["_id"], isOpen?: boolean): Promise<Milestone[]> {
  return (
    await milestoneRepo.crud.findManyCursor({ repositoryId, ...(isOpen === undefined ? {} : { isOpen }) })
  ).toArray();
}

async function findByTitleAndRepositoryId(title: string, repositoryId: Repository["_id"]): Promise<Milestone | null> {
  return (await milestoneRepo.crud.findManyCursor({ title, repositoryId })).next();
}

async function findByRepositoryIdAndLocalId(
  repositoryId: Repository["_id"],
  localId: number
): Promise<Milestone | null> {
  return (await milestoneRepo.crud.findManyCursor({ localId, repositoryId })).next();
}

export type MilestoneRepo = {
  crud: BaseRepo<Milestone, MilestoneCreate, MilestoneUpdate>;
  findByRepositoryId(repositoryId: Repository["_id"], isOpen?: boolean): Promise<Milestone[]>;
  findByTitleAndRepositoryId(title: string, repositoryId: Repository["_id"]): Promise<Milestone | null>;
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Milestone | null>;
};

const milestoneRepo: MilestoneRepo = {
  crud: BaseRepoFactory<Milestone, MilestoneCreate, MilestoneUpdate>(collectionName),
  findByRepositoryId,
  findByTitleAndRepositoryId,
  findByRepositoryIdAndLocalId,
};

export { milestoneRepo };
