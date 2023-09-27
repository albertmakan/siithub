import { type Response, Router } from "express";
import "express-async-errors";
import { userService } from "../user/user.service";
import { starService } from "./star.service";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";

const starRoutes = Router();

starRoutes.get("/all", isAllowedToAccessRepo(true), async (_, res: Response) => {
  const stars = await starService.findByRepoId(res.locals.repository._id);
  res.send(await userService.findManyByIds(stars.map((s) => s.userId)));
});

starRoutes.get("/", isAllowedToAccessRepo(true), async (_, res: Response) => {
  res.send(await starService.findByUserIdAndRepoId(res.locals.userId, res.locals.repository._id));
});

starRoutes.post("/", isAllowedToAccessRepo(true), async (_, res: Response) => {
  res.send(await starService.addStar(res.locals.userId, res.locals.repository._id));
});

starRoutes.delete("/", isAllowedToAccessRepo(true), async (_, res: Response) => {
  res.send(await starService.removeStar(res.locals.userId, res.locals.repository._id));
});

export { starRoutes };
