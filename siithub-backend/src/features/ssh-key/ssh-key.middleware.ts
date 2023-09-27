import type { NextFunction, Request, Response } from "express";
import { ForbiddenException } from "../../error-handling/errors";
import { userService } from "../user/user.service";
import { sshKeyService } from "./ssh-key.service";
import { getUserIdFromRequest } from "../auth/auth.utils";
import { SshKey } from "./ssh-key.model";

async function authorizeSshKeyOwner(req: Request, _: Response, next: NextFunction) {
  const userId = getUserIdFromRequest(req);

  const sshKeyId = req.params.id;
  let sshKey: SshKey | undefined;
  if (sshKeyId) sshKey = await sshKeyService.findOneOrThrow(req.params.id);
  const user = await userService.findByUsername(sshKey?.owner || req.body.owner);

  if (userId.toString() !== user?._id.toString()) {
    throw new ForbiddenException("You are not authorized to set up someone else's keys.");
  }

  next();
}

export { authorizeSshKeyOwner };
