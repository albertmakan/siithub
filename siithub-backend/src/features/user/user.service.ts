import { BadLogicException, DuplicateException, MissingEntityException } from "../../error-handling/errors";
import { UserType, type UserUpdate, type User, type UserCreate } from "./user.model";
import { userRepo } from "./user.repo";
import { clearPropertiesOfResultWrapper } from "../../utils/wrappers";
import { getRandomString, getSha256Hash } from "../../utils/crypto";
import { gitServerClient } from "../gitserver/gitserver.client";
import { Filter } from "mongodb";
import { verifyEmail } from "../../utils/email";

const projection = { _id: 1, username: 1, email: 1, name: 1, pictures: 1 } as const;

async function findOneOrThrow(id: User["_id"]): Promise<User> {
  const existingUser = await userRepo.crud.findOne(id);
  if (!existingUser) {
    throw new MissingEntityException("User with given id does not exist.");
  }
  return existingUser;
}

async function findMany(filters?: Filter<User>): Promise<User[]> {
  return await userRepo.crud.findMany(filters, { projection });
}

async function findManyByIds(ids: User["_id"][], filters: Filter<User> = {}): Promise<User[]> {
  return await userRepo.crud.findMany({ _id: { $in: ids }, ...filters }, { projection });
}

async function findManyByEmails(emails: string[]): Promise<User[]> {
  return await userRepo.crud.findMany({ email: { $in: emails } }, { projection });
}

async function findByUsername(username: string): Promise<User | null> {
  return await userRepo.findByUsername(username);
}

async function findByUsernameOrThrow(username: string): Promise<User> {
  const existingUser = await userRepo.findByUsername(username);
  if (!existingUser) {
    throw new MissingEntityException("User with given username does not exist.");
  }
  return existingUser;
}

async function findByGithubUsername(username: string): Promise<User | null> {
  return userRepo.findByGithubUsername(username);
}

function removePassword(f: any) {
  return clearPropertiesOfResultWrapper(f, "password", "passwordAccount");
}

function getHashedPassword(password: string) {
  const salt = getRandomString(16);
  const passwordHash = getSha256Hash(password + salt);
  return { salt, passwordHash };
}

async function createUser(user: UserCreate, verify = false): Promise<User | null> {
  const userWithSameUsername = await userRepo.findByUsername(user.username);
  if (userWithSameUsername) {
    throw new DuplicateException("Username is already taken.", user);
  }

  if (user.githubUsername) {
    const userWithSameGithubUsername = await userRepo.findByGithubUsername(user.githubUsername);
    if (userWithSameGithubUsername) {
      throw new DuplicateException("Github username is already taken.", user);
    } else {
      user.githubAccount = { username: user.githubUsername };
    }
  }

  user.type = UserType.Developer;
  user.passwordAccount = getHashedPassword(user.password);
  user.password = "";

  try {
    await gitServerClient.createUser(user.username);
  } catch (error) {
    throw new BadLogicException("Failed to create user");
  }

  if (verify) verifyEmail(user.email);

  return await userRepo.crud.add(user);
}

async function updateProfile(id: User["_id"], profileUpdate: UserUpdate): Promise<User | null> {
  const user = await findOneOrThrow(id);
  const { name, bio, email } = profileUpdate;
  return await userRepo.crud.update(id, { name, bio, email });
}

async function updatePassword(
  id: User["_id"],
  passwordUpdate: { oldPassword: string; newPassword: string }
): Promise<User | null> {
  const user = await findOneOrThrow(id);
  const passwordHash = getSha256Hash(passwordUpdate.oldPassword + user.passwordAccount?.salt);
  if (passwordHash !== user.passwordAccount?.passwordHash) {
    throw new BadLogicException("Old password is incorrect");
  }
  return await userRepo.crud.update(id, {
    passwordAccount: getHashedPassword(passwordUpdate.newPassword),
  });
}

async function updateProfilePicture(id: User["_id"], pictureKey: string): Promise<User | null> {
  const user = await findOneOrThrow(id);
  const pictures = user.pictures ?? [];
  pictures.push(pictureKey);
  return await userRepo.crud.update(id, { pictures });
}

export type UserService = {
  findOneOrThrow(id: User["_id"]): Promise<User>;
  findByUsername(username: string): Promise<User | null>;
  findByUsernameOrThrow(username: string): Promise<User>;
  findByGithubUsername(username: string): Promise<User | null>;
  findMany(filters?: Filter<User>): Promise<User[]>;
  findManyByEmails(emails: string[]): Promise<User[]>;
  findManyByIds(ids: User["_id"][], filters?: Filter<User>): Promise<User[]>;
  create(user: UserCreate, verify?: boolean): Promise<User | null>;
  updateProfile(id: User["_id"], profileUpdate: UserUpdate): Promise<User | null>;
  updatePassword(id: User["_id"], passwordUpdate: { oldPassword: string; newPassword: string }): Promise<User | null>;
  updateProfilePicture(id: User["_id"], pictureKey: string): Promise<User | null>;
};

const userService: UserService = {
  findMany,
  findManyByIds,
  findManyByEmails,
  findOneOrThrow: removePassword(findOneOrThrow),
  findByUsername,
  findByUsernameOrThrow: removePassword(findByUsernameOrThrow),
  findByGithubUsername: removePassword(findByGithubUsername),
  create: removePassword(createUser),
  updateProfile: removePassword(updateProfile),
  updatePassword: removePassword(updatePassword),
  updateProfilePicture: removePassword(updateProfilePicture),
};

export { userService };
