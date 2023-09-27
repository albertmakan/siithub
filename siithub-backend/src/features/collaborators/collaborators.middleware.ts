import type { NextFunction, Request, Response } from "express";
import { type Repository } from "../repository/repository.model";
import { ForbiddenException } from "../../error-handling/errors";
import { collaboratorsRepo } from "./collaborators.repo";

export function isAllowedToAccessRepo(allowPublicAccess = false) {
  return async function (_: Request, res: Response, next: NextFunction) {
    const { type, _id } = res.locals.repository as Repository;

    const allowAccess =
      (allowPublicAccess && type === "public") ||
      !!(await collaboratorsRepo.findByRepositoryAndUser(_id, res.locals.userId));

    if (!allowAccess) {
      next(new ForbiddenException("You are not collaborating on the repository."));
    }
    next();
  };
}
