import type { NextFunction, Request, Response } from "express";
import { ForbiddenException, MissingEntityException } from "../../error-handling/errors";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { userService } from "../user/user.service";
import { repositoryRepo } from "./repository.repo";
import { idSchema } from "../../utils/zod";

async function authorizeRepositoryOwner(req: Request, res: Response, next: NextFunction) {
  const userId = res.locals.userId || getUserIdFromRequest(req);

  const username: string = req.body.owner || req.params.username;
  const user = username ? await userService.findByUsername(username) : null;

  if (userId?.toString() !== user?._id.toString()) {
    next(new ForbiddenException("You are not authorized to access someone else's repository."));
  }

  next();
}

async function findRepository(req: Request, res: Response, next: NextFunction) {
  const { repositoryId, username, repository } = req.params;
  const repo = await (repositoryId
    ? repositoryRepo.crud.findOne(idSchema.parse(repositoryId))
    : repositoryRepo.findByOwnerAndName(username, repository));
  if (!repo) {
    next(new MissingEntityException("Repository does not exist."));
  }
  res.locals.repository = repo;

  next();
}

export { authorizeRepositoryOwner, findRepository };
