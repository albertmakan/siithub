import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { branchesService } from "./branches.service";
import "express-async-errors";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { type Repository } from "../repository/repository.model";

const getBranchesQuerySchema = z.object({ name: z.string().default("") });
const createBranchBodySchema = z.object({ source: z.string(), branchName: z.string() });
const renameBranchBodySchema = z.object({ newBranchName: z.string() });

const branchesRoutes = Router();

branchesRoutes.get("/", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { name } = getBranchesQuerySchema.parse(req.query);
  const { owner, name: repoName } = res.locals.repository as Repository;
  res.send(await branchesService.findMany(owner, repoName, name));
});

branchesRoutes.post("/", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const { source, branchName } = createBranchBodySchema.parse(req.body);
  const { owner, name: repoName } = res.locals.repository as Repository;
  res.send(await branchesService.create(owner, repoName, source, branchName));
});

branchesRoutes.put("/:branchName", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const { newBranchName } = renameBranchBodySchema.parse(req.body);
  const { owner, name: repoName } = res.locals.repository as Repository;
  res.send(await branchesService.rename(owner, repoName, req.params.branchName, newBranchName));
});

branchesRoutes.delete("/:branchName", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const { owner, name: repoName } = res.locals.repository as Repository;
  res.send(await branchesService.remove(owner, repoName, req.params.branchName));
});

export { branchesRoutes };
