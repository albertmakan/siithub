import type { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { labelService } from "./label.service";
import { BadLogicException } from "../../error-handling/errors";

async function labelHasToBelongToRepo(req: Request, _: Response, next: NextFunction) {
  const id = new ObjectId(req.params.id);
  const repositoryId = new ObjectId(req.params.repositoryId);

  const label = await labelService.findOne(id);
  if (label?.repositoryId.toString() !== repositoryId.toString()) {
    throw new BadLogicException("Label does not belong to the given repository.");
  }

  next();
}

export { labelHasToBelongToRepo };
