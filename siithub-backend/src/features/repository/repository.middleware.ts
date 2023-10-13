import type { NextFunction, Request, Response } from "express";
import { ForbiddenException } from "../../error-handling/errors";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { userService } from "../user/user.service";
import { idSchema } from "../../utils/zod";
import { repositoryService } from "./repository.service";
import { logger } from "../../utils/aws/logger";

async function authorizeRepositoryOwner(req: Request, res: Response, next: NextFunction) {
  const userId = res.locals.userId || getUserIdFromRequest(req);

  const username: string = res.locals.repository?.owner || req.body.owner || req.params.username;
  const repoName: string = res.locals.repository?.name || req.body.name || req.params.repository;
  const user = username ? await userService.findByUsername(username) : null;

  if (userId?.toString() !== user?._id.toString()) {
    logger.warn(`Not the owner - UserId[${userId}], Repo[${username}/${repoName}]`);
    next(new ForbiddenException("You are not authorized to access someone else's repository."));
  }

  next();
}

async function findRepository(req: Request, res: Response, next: NextFunction) {
  const { repositoryId, username, repository } = req.params;
  const repo = await (repositoryId
    ? repositoryService.findOneOrThrow(idSchema.parse(repositoryId))
    : repositoryService.findByOwnerAndNameOrThrow(username, repository));
  res.locals.repository = repo;

  next();
}

export { authorizeRepositoryOwner, findRepository };
