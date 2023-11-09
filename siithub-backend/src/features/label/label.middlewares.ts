import type { NextFunction, Request, Response } from "express";
import { labelService } from "./label.service";
import { BadLogicException } from "../../error-handling/errors";
import { idSchema } from "../../utils/zod";

export async function labelHasToBelongToRepo(req: Request, res: Response, next: NextFunction) {
  const id = idSchema.parse(req.params.id);
  const label = await labelService.findOneOrThrow(id);
  res.locals.label = label;
  if (label.repositoryId.toString() !== res.locals.repository._id.toString()) {
    throw new BadLogicException("Label does not belong to the given repository.");
  }
  next();
}
