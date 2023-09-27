import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { commitService } from "./commit.service";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { type Repository } from "../repository/repository.model";

const commitRoutes = Router();

commitRoutes.get("/between/:base/:compare", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await commitService.getCommitsBetweenBranches(owner, name, req.params.base, req.params.compare));
});

commitRoutes.get("/diff/:base/:compare", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await commitService.getCommitsDiffBetweenBranches(owner, name, req.params.base, req.params.compare));
});

commitRoutes.get("/history/:branch", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await commitService.getCommits(owner, name, req.params.branch));
});

commitRoutes.get("/history/:branch/:filePath", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await commitService.getFileHistoryCommits(owner, name, req.params.branch, req.params.filePath));
});

commitRoutes.get("/count/:branch", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await commitService.getCommitCount(owner, name, req.params.branch));
});

commitRoutes.get("/:sha", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await commitService.getCommit(owner, name, req.params.sha));
});

commitRoutes.get("/blob-info/:branch/:blobPath", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await commitService.getFileInfo(owner, name, req.params.branch, req.params.blobPath));
});

export { commitRoutes };
