import type { NextFunction, Request, Response } from "express";
import { type UserType } from "../user/user.model";
import { getUserIdFromRequest } from "./auth.utils";

export function authorize(...types: UserType[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    res.locals.userId = getUserIdFromRequest(req, types);
    next();
  };
}
