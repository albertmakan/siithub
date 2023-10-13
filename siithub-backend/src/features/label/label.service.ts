import { DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { logger } from "../../utils/aws/logger";
import type { Repository } from "../repository/repository.model";
import type { Label, LabelCreate, LabelUpdate } from "./label.model";
import { labelRepo } from "./label.repo";

async function findOne(id: Label["_id"]): Promise<Label | null> {
  return await labelRepo.crud.findOne(id);
}

async function findByRepositoryId(repositoryId: Repository["_id"]): Promise<Label[]> {
  return await labelRepo.findByRepositoryId(repositoryId);
}

async function findByNameAndRepositoryId(name: string, repositoryId: Repository["_id"]): Promise<Label | null> {
  return await labelRepo.findByNameAndRepositoryId(name, repositoryId);
}

async function findOneOrThrow(id: Label["_id"]): Promise<Label> {
  const label = await labelRepo.crud.findOne(id);
  if (!label) {
    logger.warn(`Label not found - LabelId[${id}]`);
    throw new MissingEntityException("Label with given id does not exist.");
  }
  return label;
}

async function searchByName(name: string, repositoryId: Repository["_id"]): Promise<Label[] | null> {
  return await labelRepo.searchByName(name, repositoryId);
}

async function createLabel(label: LabelCreate): Promise<Label | null> {
  const labelWithSameName = await labelRepo.findByNameAndRepositoryId(label.name, label.repositoryId);
  if (labelWithSameName) {
    logger.warn(`Label with same name already exists - LabelName[${label.name}], RepoId[${label.repositoryId}]`);
    throw new DuplicateException("Label with same name already exists.", label);
  }
  const createdLabel = (await labelRepo.crud.add(label)) as Label;
  logger.info(`Label is created - LabelId[${createdLabel._id}], RepoId[${label.repositoryId}]`);
  return createdLabel;
}

async function updateLabel(label: LabelUpdate): Promise<Label | null> {
  const existingLabel = await findOneOrThrow(label._id);

  const labelWithSameName = await labelRepo.findByNameAndRepositoryId(label.name, label.repositoryId);
  if (labelWithSameName && labelWithSameName._id + "" !== existingLabel._id + "") {
    logger.warn(`Label with same name already exists - LabelName[${label.name}], RepoId[${label.repositoryId}]`);
    throw new DuplicateException("Label with same name already exists.", label);
  }

  existingLabel.color = label.color;
  existingLabel.description = label.description;
  existingLabel.name = label.name;

  const updatedLabel = await labelRepo.crud.update(label._id, existingLabel);
  logger.info(`Label is updated - LabelId[${label._id}], RepoId[${label.repositoryId}]`);
  return updatedLabel;
}

async function deleteLabel(id: Label["_id"]): Promise<Label | null> {
  const existingLabel = await findOneOrThrow(id);

  const deletedLabel = await labelRepo.crud.delete(existingLabel._id);
  logger.info(`Label is deleted - LabelId[${id}], RepoId[${existingLabel.repositoryId}]`);
  return deletedLabel;
}

export type LabelService = {
  create(label: LabelCreate): Promise<Label | null>;
  update(label: LabelUpdate): Promise<Label | null>;
  delete(id: Label["_id"]): Promise<Label | null>;
  findOne(id: Label["_id"]): Promise<Label | null>;
  findOneOrThrow(id: Label["_id"]): Promise<Label>;
  findByRepositoryId(repositoryId: Repository["_id"]): Promise<Label[]>;
  findByNameAndRepositoryId(name: string, repositoryId: Repository["_id"]): Promise<Label | null>;
  searchByName(name: string, repositoryId: Repository["_id"]): Promise<Label[] | null>;
};

const labelService: LabelService = {
  findOne,
  findOneOrThrow,
  findByRepositoryId,
  findByNameAndRepositoryId,
  searchByName,
  create: createLabel,
  update: updateLabel,
  delete: deleteLabel,
};

export { labelService };
