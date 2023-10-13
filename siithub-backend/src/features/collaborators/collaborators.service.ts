import { BadLogicException, ForbiddenException, MissingEntityException } from "../../error-handling/errors";
import type { Collaborator, CollaboratorAdd, CollaboratorRemove } from "./collaborators.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
import { repositoryService } from "../repository/repository.service";
import { userService } from "../user/user.service";
import { collaboratorsRepo } from "./collaborators.repo";
import { gitServerClient } from "../gitserver/gitserver.client";
import { sendInvitationMail } from "../../utils/aws/email";
import { logger } from "../../utils/aws/logger";

async function findByRepository(repositoryId: Repository["_id"]): Promise<Collaborator[]> {
  return await collaboratorsRepo.findByRepository(repositoryId);
}

async function findByUser(userId: User["_id"]): Promise<Collaborator[]> {
  return await collaboratorsRepo.findByUser(userId);
}

async function findByRepositoryAndUser(
  repositoryId: Repository["_id"],
  userId: User["_id"]
): Promise<Collaborator | null> {
  return await collaboratorsRepo.findByRepositoryAndUser(repositoryId, userId);
}

async function addCollaborator(collaborator: CollaboratorAdd, sendMail = false): Promise<Collaborator | null> {
  const { repositoryId, userId } = collaborator;

  const existingCollaborator = await findByRepositoryAndUser(repositoryId, userId);
  if (existingCollaborator) {
    logger.warn(`User is already collaborator on the given repository - UserId[${userId}], RepoId[${repositoryId}]`);
    throw new BadLogicException("User is already collaborator on the given repository.");
  }

  const repository = await repositoryService.findOneOrThrow(repositoryId);
  const user = await userService.findOneOrThrow(userId);

  const newCollab = await collaboratorsRepo.crud.add(collaborator);
  logger.info(`Collaborator is added - User[${user.username}], Repo[${repository.owner}/${repository.name}]`);

  if (newCollab && !newCollab.verified && sendMail) sendInvitationMail(user, repository);

  return newCollab;
}

async function verifyCollaborator(repositoryId: Repository["_id"], userId: User["_id"]): Promise<Collaborator | null> {
  const existingCollaborator = await findByRepositoryAndUser(repositoryId, userId);
  if (!existingCollaborator) {
    logger.warn(
      `User is not invited to collaborate on the given repository - UserId[${userId}], RepoId[${repositoryId}]`
    );
    throw new MissingEntityException("User is not invited to collaborate on the given repository.");
  }
  if (existingCollaborator.verified) return existingCollaborator;

  const repository = await repositoryService.findOneOrThrow(repositoryId);
  const user = await userService.findOneOrThrow(userId);

  existingCollaborator.verified = true;
  await collaboratorsRepo.crud.update(existingCollaborator._id, existingCollaborator);
  logger.info(`Collaborator is verified - User[${user.username}], Repo[${repository.owner}/${repository.name}]`);

  try {
    await gitServerClient.addCollaborator(repository.owner, repository.name, user.username);
  } catch (error) {
    logger.error(
      `Failed to add collaborator on gitserver - User[${user.username}], Repo[${repository.owner}/${repository.name}]`
    );
    throw new BadLogicException("Failed to add collaborator");
  }

  return existingCollaborator;
}

async function removeCollaborator(
  collaborator: CollaboratorRemove,
  removerId: User["_id"]
): Promise<Collaborator | null> {
  const { repositoryId, userId } = collaborator;

  const repository = await repositoryService.findOneOrThrow(repositoryId);
  const userToRemoveId = userId + "";
  const ownerUserId = (await userService.findByUsername(repository.owner))?._id + "";

  if (userToRemoveId === ownerUserId) {
    logger.warn(
      `The owner tried to remove itself - UserId[${userToRemoveId}], Repo[${repository.owner}/${repository.name}]`
    );
    throw new BadLogicException("The owner cannot be removed");
  }
  const removerUserId = removerId + "";
  if (removerUserId !== userToRemoveId && removerUserId !== ownerUserId) {
    logger.warn(
      `The user is not allowed to remove this collaborator - RemoverId[${removerUserId}], UserId[${userToRemoveId}], Repo[${repository.owner}/${repository.name}]`
    );
    throw new ForbiddenException("You are not allowed to remove this collaborator");
  }

  const existingCollaborator = await findByRepositoryAndUser(repositoryId, userId);
  if (!existingCollaborator) {
    logger.warn(
      `User is not collaborating on the given repository - UserId[${userToRemoveId}], Repo[${repository.owner}/${repository.name}]`
    );
    throw new BadLogicException("User is not collaborating on the given repository.");
  }

  const userToRemove = await userService.findOneOrThrow(userId);

  const removed = await collaboratorsRepo.crud.delete(existingCollaborator._id);
  logger.info(`Collaborator is removed - User[${userToRemove.username}], Repo[${repository.owner}/${repository.name}]`);

  try {
    await gitServerClient.removeCollaborator(repository.owner, repository.name, userToRemove.username);
  } catch (error) {
    logger.error(
      `Failed to remove collaborator on gitserver - User[${userToRemove.username}], Repo[${repository.owner}/${repository.name}]`
    );
    throw new BadLogicException("Failed to remove collaborator");
  }

  return removed;
}

async function resolveUsers(collaborators: Collaborator[], name: string) {
  const collaboratorUserIds = collaborators?.map((c) => c.userId);
  const users = await userService.findManyByIds(collaboratorUserIds, {
    name: { $regex: name, $options: "i" },
  });
  const usersMap = users.reduce((acc: { [id: string]: User }, user: User) => {
    acc[user._id.toString()] = user;
    return acc;
  }, {});

  return collaborators
    .map((c) => ({
      ...c,
      user: usersMap[c.userId.toString()],
    }))
    .filter((c) => !!c.user);
}

export type CollaboratorService = {
  add(collaborator: CollaboratorAdd, sendMail?: boolean): Promise<Collaborator | null>;
  remove(collaborator: CollaboratorRemove, removerId: User["_id"]): Promise<Collaborator | null>;
  verifyCollaborator(repositoryId: Repository["_id"], userId: User["_id"]): Promise<Collaborator | null>;
  findByRepository(repositoryId: Repository["_id"]): Promise<Collaborator[]>;
  findByUser(userId: User["_id"]): Promise<Collaborator[]>;
  findByRepositoryAndUser(repositoryId: Repository["_id"], userId: User["_id"]): Promise<Collaborator | null>;
  resolveUsers(collaborators: Collaborator[], name: string): Promise<(Collaborator & { user: User })[]>;
};

const collaboratorsService: CollaboratorService = {
  add: addCollaborator,
  remove: removeCollaborator,
  verifyCollaborator,
  findByRepository,
  findByUser,
  findByRepositoryAndUser,
  resolveUsers,
};

export { collaboratorsService };
