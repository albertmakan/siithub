import { type BaseEvent } from "../../db/base.repo.utils";
import { DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { logger } from "../../utils/aws/logger";
import type { MilestoneAssignedEvent, MilestoneUnassignedEvent } from "../common/events/events.model";
import { type Repository } from "../repository/repository.model";
import { repositoryService } from "../repository/repository.service";
import type { Milestone, MilestoneCreate, MilestoneUpdate } from "./milestone.model";
import { milestoneRepo } from "./milestone.repo";

const eventTypes = [
  "IssueReopenedEvent",
  "IssueClosedEvent",
  "MilestoneUnassignedEvent",
  "MilestoneAssignedEvent",
] as const;

async function findOne(id: Milestone["_id"]): Promise<Milestone | null> {
  return await milestoneRepo.crud.findOne(id);
}

async function findByRepositoryId(repositoryId: Repository["_id"], isOpen = true): Promise<Milestone[]> {
  return await milestoneRepo.findByRepositoryId(repositoryId, isOpen);
}

async function findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Milestone> {
  const milestone = await milestoneRepo.findByRepositoryIdAndLocalId(repositoryId, localId);
  if (!milestone) {
    logger.warn("Milestone not found", { repoId: repositoryId, localId: `#M${localId}` });
    throw new MissingEntityException("Milestone with given id does not exist.");
  }
  return milestone;
}

async function findByTitleAndRepositoryId(title: string, repositoryId: Repository["_id"]): Promise<Milestone | null> {
  return await milestoneRepo.findByTitleAndRepositoryId(title, repositoryId);
}

async function findOneOrThrow(id: Milestone["_id"]): Promise<Milestone> {
  const milestone = await findOne(id);
  if (!milestone) {
    logger.warn("Milestone not found", { milestoneId: id });
    throw new MissingEntityException("Milestone with given id does not exist.");
  }
  return milestone;
}

async function createMilestone(milestone: MilestoneCreate): Promise<Milestone | null> {
  const milestoneWithSameName = await findByTitleAndRepositoryId(milestone.title, milestone.repositoryId);
  if (milestoneWithSameName) {
    logger.warn("Milestone with same title already exists", { title: milestone.title, repoId: milestone.repositoryId });
    throw new DuplicateException("Milestone with same title already exists.", milestone);
  }
  milestone.isOpen = true;
  milestone.localId = await repositoryService.increaseCounterValue(milestone.repositoryId, "milestone");
  milestone.issuesInfo = { open: 0, closed: 0, lastUpdated: new Date() };

  const createdMilestone = (await milestoneRepo.crud.add(milestone)) as Milestone;
  logger.info("Milestone is created", { repoId: milestone.repositoryId, localId: `#M${milestone.localId}` });
  return createdMilestone;
}

async function updateMilestone(milestone: MilestoneUpdate): Promise<Milestone | null> {
  const existingMilestone = await findByRepositoryIdAndLocalId(milestone.repositoryId, milestone.localId);

  const milestoneWithSameName = await findByTitleAndRepositoryId(milestone.title, milestone.repositoryId);
  if (milestoneWithSameName && milestoneWithSameName._id + "" !== existingMilestone._id + "") {
    logger.warn("Milestone with same title already exists", { title: milestone.title, repoId: milestone.repositoryId });
    throw new DuplicateException("Milestone with same title already exists.", milestone);
  }
  existingMilestone.dueDate = milestone.dueDate;
  existingMilestone.description = milestone.description;
  existingMilestone.title = milestone.title;

  const updatedMilestone = await milestoneRepo.crud.update(existingMilestone._id, existingMilestone);
  logger.info("Milestone is updated", { repoId: milestone.repositoryId, localId: `#M${milestone.localId}` });
  return updatedMilestone;
}

async function deleteMilestone(repositoryId: Repository["_id"], localId: number): Promise<Milestone | null> {
  const existingMilestone = await findByRepositoryIdAndLocalId(repositoryId, localId);
  const deletedMilestone = await milestoneRepo.crud.delete(existingMilestone._id);
  logger.info("Milestone is deleted", { repoId: repositoryId, localId: `#M${localId}` });
  return deletedMilestone;
}

async function changeStatus(
  repositoryId: Repository["_id"],
  localId: number,
  open: boolean
): Promise<Milestone | null> {
  const existingMilestone = await findByRepositoryIdAndLocalId(repositoryId, localId);
  const updatedMilestone = await milestoneRepo.crud.update(existingMilestone._id, { isOpen: open } as MilestoneUpdate);
  logger.info(`Milestone is ${open ? "opened" : "closed"}`, { repoId: repositoryId, localId: `#M${localId}` });
  return updatedMilestone;
}

async function handleIssueEvent(id: Milestone["_id"], event: BaseEvent, isOpen: boolean) {
  if (!(eventTypes as ReadonlyArray<string>).includes(event.type)) return;
  if (event.type === eventTypes[2] && (event as MilestoneUnassignedEvent).milestoneId + "" !== id + "") return;
  if (event.type === eventTypes[3] && (event as MilestoneAssignedEvent).milestoneId + "" !== id + "") return;

  const milestone = await findOne(id);
  if (!milestone) return;
  const issuesInfo = milestone.issuesInfo ?? { open: 0, closed: 0, lastUpdated: new Date() };

  switch (event.type) {
    case eventTypes[0]:
      issuesInfo.closed--;
      issuesInfo.open++;
      break;
    case eventTypes[1]:
      issuesInfo.closed++;
      issuesInfo.open--;
      break;
    case eventTypes[2]:
      if (isOpen) issuesInfo.open--;
      else issuesInfo.closed--;
      break;
    case eventTypes[3]:
      if (isOpen) issuesInfo.open++;
      else issuesInfo.closed++;
      break;
  }
  issuesInfo.lastUpdated = new Date();

  await milestoneRepo.crud.update(id, { issuesInfo } as MilestoneUpdate);
  logger.info("Milestone is updated with issue event", {
    repoId: milestone.repositoryId,
    localId: `#M${milestone.localId}`,
  });
}

export type MilestoneService = {
  create(Milestone: MilestoneCreate): Promise<Milestone | null>;
  update(Milestone: MilestoneUpdate): Promise<Milestone | null>;
  delete(repositoryId: Repository["_id"], localId: number): Promise<Milestone | null>;
  findOne(id: Milestone["_id"]): Promise<Milestone | null>;
  findOneOrThrow(id: Milestone["_id"]): Promise<Milestone>;
  findByRepositoryId(repositoryId: Repository["_id"], isOpen?: boolean): Promise<Milestone[]>;
  findByTitleAndRepositoryId(title: string, repositoryId: Repository["_id"]): Promise<Milestone | null>;
  changeStatus(repositoryId: Repository["_id"], localId: number, open: boolean): Promise<Milestone | null>;
  findByRepositoryIdAndLocalId(repositoryId: Repository["_id"], localId: number): Promise<Milestone>;
  handleIssueEvent(id: Milestone["_id"], event: BaseEvent, isOpen: boolean): Promise<void>;
};

const milestoneService: MilestoneService = {
  findOne,
  findOneOrThrow,
  findByRepositoryId,
  findByTitleAndRepositoryId,
  changeStatus,
  create: createMilestone,
  update: updateMilestone,
  delete: deleteMilestone,
  findByRepositoryIdAndLocalId,
  handleIssueEvent,
};

export { milestoneService };
