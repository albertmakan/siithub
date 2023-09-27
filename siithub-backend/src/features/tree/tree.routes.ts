import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { gitServerClient } from "../gitserver/gitserver.client";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { type Repository } from "../repository/repository.model";

const treeRoutes = Router();

treeRoutes.get("/:branch/:treePath", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name: repoName } = res.locals.repository as Repository;
  res.send(await gitServerClient.getTree(owner, repoName, req.params.branch, req.params.treePath));
});

treeRoutes.get("/:branch", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name: repoName } = res.locals.repository as Repository;
  res.send(await gitServerClient.getTree(owner, repoName, req.params.branch, ""));
});

export { treeRoutes };
