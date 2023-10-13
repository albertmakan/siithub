import { ObjectId } from "mongodb";
import { BadLogicException, DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { gitServerClient } from "../gitserver/gitserver.client";
import { userService } from "../user/user.service";
import type { SshKey, SshKeyCreate, SshKeyUpdate } from "./ssh-key.model";
import { sshKeyRepo } from "./ssh-key.repo";
import { logger } from "../../utils/aws/logger";

async function findOneOrThrow(id: SshKey["_id"] | string): Promise<SshKey> {
  const sshKey = await sshKeyRepo.crud.findOne(id);
  if (!sshKey) {
    logger.warn(`Ssh key not found - SshKeyId[${id}]`);
    throw new MissingEntityException("SshKey with given id does not exist.");
  }
  return sshKey;
}

async function createSshKey(sshKey: SshKeyCreate): Promise<SshKey | null> {
  const sshKeysWithSameName = await sshKeyRepo.crud.findMany({ name: sshKey.name, owner: sshKey.owner });
  if (sshKeysWithSameName.length) {
    logger.warn(`Ssh key with same name already exists - SshKeyName[${sshKey.name}]`);
    throw new DuplicateException("SshKey with same name already exists.", sshKey);
  }
  const existingUser = await userService.findByUsernameOrThrow(sshKey.owner);

  try {
    await gitServerClient.addSshKey(existingUser.username, sshKey.value);
  } catch (error) {
    logger.error(`Failed to create ssh key in the file system - Username[${existingUser.username}]`);
    throw new BadLogicException("Failed to create sshKey in the file system.");
  }

  const createdKey = (await sshKeyRepo.crud.add(sshKey)) as SshKey;
  logger.info(`Ssh key is created - Username[${existingUser.username}], Id[${createdKey._id}]`);
  return createdKey;
}

async function updateSshKey(keyId: string, sshKey: SshKeyUpdate): Promise<SshKey | null> {
  const foundSshKey = await findOneOrThrow(keyId);
  const sshKeysWithSameName = await sshKeyRepo.crud.findMany({ name: sshKey.name, owner: sshKey.owner });
  if (sshKeysWithSameName.length && sshKeysWithSameName[0]._id !== foundSshKey._id) {
    logger.warn(`Ssh key with same name already exists - SshKeyName[${sshKey.name}]`);
    throw new DuplicateException("SshKey with same name already exists.", sshKey);
  }
  const existingUser = await userService.findByUsernameOrThrow(sshKey.owner);

  try {
    await gitServerClient.updateSshKey(existingUser.username, foundSshKey.value, sshKey.value);
  } catch (error) {
    logger.error(`Failed to update ssh key in the file system - Username[${existingUser.username}]`);
    throw new BadLogicException("Failed to update sshKey in the file system.");
  }

  const updatedKey = await sshKeyRepo.crud.update(keyId, sshKey);
  logger.info(`Ssh key is updated - Username[${existingUser.username}], Id[${keyId}]`);
  return updatedKey;
}

async function deleteSshKey(keyId: string): Promise<SshKey | null> {
  const foundSshKey = await findOneOrThrow(keyId);
  const existingUser = await userService.findByUsernameOrThrow(foundSshKey.owner);

  try {
    await gitServerClient.removeSshKey(existingUser.username, foundSshKey.value);
  } catch (error) {
    logger.error(`Failed to delete ssh key in the file system - Username[${existingUser.username}]`);
    throw new BadLogicException("Failed to create sshKey in the file system.");
  }

  const deletedKey = await sshKeyRepo.crud.delete(keyId);
  logger.info(`Ssh key is deleted - Username[${existingUser.username}], Id[${keyId}]`);
  return deletedKey;
}

export type SshKeyService = {
  findOneOrThrow(id: SshKey["_id"] | string): Promise<SshKey>;
  create(sshKey: SshKeyCreate): Promise<SshKey | null>;
  update(keyId: ObjectId | string, sshKey: SshKeyCreate): Promise<SshKey | null>;
  delete(keyId: string): Promise<SshKey | null>;
};

const sshKeyService: SshKeyService = {
  findOneOrThrow,
  create: createSshKey,
  update: updateSshKey,
  delete: deleteSshKey,
};

export { sshKeyService };
