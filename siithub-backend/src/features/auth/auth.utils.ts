import { Request } from "express";
import { ObjectId } from "mongodb";
import { AuthenticationException, ForbiddenException } from "../../error-handling/errors";
import { parseJWT } from "../../utils/jwt";
import { clearPropertiesOfObject } from "../../utils/wrappers";
import { UserType, type User } from "../user/user.model";
import { logger } from "../../utils/aws/logger";

function removePassword(user: User) {
  return clearPropertiesOfObject(user, "passwordAccount");
}

function getUserIdFromRequest(req: Request, types?: UserType[]): ObjectId {
  const autorization = req.headers["authorization"] || "";
  const token = autorization && autorization.split(" ")[1];
  if (!token) {
    logger.warn("Missing authorization token");
    throw new AuthenticationException("You are missing the authorization token.");
  }
  const payload = parseJWT(token);
  if (!payload?.id) {
    logger.warn("Not authorized", { userId: payload?.id });
    throw new AuthenticationException("You are not authorized to perform this action.");
  }
  if (types?.length && !types.includes(payload.type)) {
    logger.warn("Not authorized", { userId: payload?.id, types });
    throw new ForbiddenException("You are not authorized to perform this action.");
  }

  return new ObjectId(payload.id);
}

export { removePassword, getUserIdFromRequest };
