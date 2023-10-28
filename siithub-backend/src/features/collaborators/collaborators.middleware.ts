import type { NextFunction, Request, Response } from "express";
import { type Repository } from "../repository/repository.model";
import { ForbiddenException } from "../../error-handling/errors";
import { collaboratorsRepo } from "./collaborators.repo";
import { logger } from "../../utils/aws/logger";

export function isAllowedToAccessRepo(allowPublicAccess = false, onlyVerified = true) {
  return async function (_: Request, res: Response, next: NextFunction) {
    const { type, _id, owner, name } = res.locals.repository as Repository;
    let allowAccess = allowPublicAccess && type === "public";
    if (!allowAccess) {
      const collaborator = await collaboratorsRepo.findByRepositoryAndUser(_id, res.locals.userId);
      allowAccess = !!(onlyVerified ? collaborator?.verified : collaborator);
    }
    if (allowAccess) next();
    else {
      logger.warn("Not a collaborator", { userId: res.locals.userId, repo: `${owner}/${name}` });
      next(new ForbiddenException("You are not collaborating on the repository."));
    }
  };
}
