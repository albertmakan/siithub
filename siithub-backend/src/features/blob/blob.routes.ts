import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { gitServerClient } from "../gitserver/gitserver.client";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { type Repository } from "../repository/repository.model";

const blobRoutes = Router();

blobRoutes.get("/:branch/:blobPath", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name: repoName } = res.locals.repository as Repository;
  const blob = await gitServerClient.getBlob(owner, repoName, req.params.branch, req.params.blobPath);
  const { size, bin, data } = blob;
  res.setHeader("bin", bin).setHeader("size", size).type("blob").send(data);
});

export { blobRoutes };
