import { BadLogicException } from "../../error-handling/errors";
import type { Collaborator, CollaboratorAdd, CollaboratorRemove } from "./collaborators.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
import { repositoryService } from "../repository/repository.service";
import { userService } from "../user/user.service";
import { collaboratorsRepo } from "./collaborators.repo";
import { gitServerClient } from "../gitserver/gitserver.client";

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

async function addCollaborator(collaborator: CollaboratorAdd, onGitServerToo = true): Promise<Collaborator | null> {
  const { repositoryId, userId } = collaborator;

  const existingCollaborator = await findByRepositoryAndUser(repositoryId, userId);
  if (existingCollaborator) {
    throw new BadLogicException("User is already collaborator on the given repository.");
  }

  const repository = await repositoryService.findOneOrThrow(repositoryId);
  const user = await userService.findOneOrThrow(userId);

  if (onGitServerToo) await gitServerClient.addCollaborator(repository.owner, repository.name, user.username);

  return await collaboratorsRepo.crud.add(collaborator);
}

async function removeCollaborator(collaborator: CollaboratorRemove): Promise<Collaborator | null> {
  const { repositoryId, userId } = collaborator;

  const existingCollaborator = await findByRepositoryAndUser(repositoryId, userId);
  if (!existingCollaborator) {
    throw new BadLogicException("User is not collaborating on the given repository.");
  }

  const repository = await repositoryService.findOneOrThrow(repositoryId);
  const user = await userService.findOneOrThrow(userId);

  await gitServerClient.removeCollaborator(repository.owner, repository.name, user.username);

  return await collaboratorsRepo.crud.delete(existingCollaborator._id);
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
  add(collaborator: CollaboratorAdd, onGitServerToo?: boolean): Promise<Collaborator | null>;
  remove(collaborator: CollaboratorRemove): Promise<Collaborator | null>;
  findByRepository(repositoryId: Repository["_id"]): Promise<Collaborator[]>;
  findByUser(userId: User["_id"]): Promise<Collaborator[]>;
  findByRepositoryAndUser(repositoryId: Repository["_id"], userId: User["_id"]): Promise<Collaborator | null>;
  resolveUsers(collaborators: Collaborator[], name: string): Promise<(Collaborator & { user: User })[]>;
};

const collaboratorsService: CollaboratorService = {
  add: addCollaborator,
  remove: removeCollaborator,
  findByRepository,
  findByUser,
  findByRepositoryAndUser,
  resolveUsers,
};

export { collaboratorsService };
