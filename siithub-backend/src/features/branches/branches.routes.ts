import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { getRepoIdFromPath } from "../../utils/getRepo";
import { branchesService } from "./branches.service";
import "express-async-errors";

const router = Router();

const commonParamsSchema = z.object({
  username: z.string(),
  repository: z.string(),
});

const getBranchesQuerySchema = z.object({
  name: z.string().default(""),
});

router.get("/:username/:repository/branches", async (req: Request, res: Response) => {
  await checkExistanceOfRepository(req);

  const { name } = getBranchesQuerySchema.parse(req.query);
  const { username, repository } = commonParamsSchema.parse(req.params);

  res.send(await branchesService.findMany(username, repository, name));
});

const createBranchBodySchema = z.object({
  source: z.string(),
  branchName: z.string(),
});

router.post("/:username/:repository/branches", async (req: Request, res: Response) => {
  await checkExistanceOfRepository(req);

  const { username, repository } = commonParamsSchema.parse(req.params);
  const { source, branchName } = createBranchBodySchema.parse(req.body);

  res.send(await branchesService.create(username, repository, source, branchName));
});

const modifyBranchParamsSchema = z.object({
  username: z.string(),
  repository: z.string(),
  branchName: z.string(),
});

const renameBranchBodySchema = z.object({
  newBranchName: z.string(),
});

router.put("/:username/:repository/branches/:branchName", async (req: Request, res: Response) => {
  await checkExistanceOfRepository(req);

  const { username, repository, branchName } = modifyBranchParamsSchema.parse(req.params);
  const { newBranchName } = renameBranchBodySchema.parse(req.body);

  res.send(await branchesService.rename(username, repository, branchName, newBranchName));
});

router.delete("/:username/:repository/branches/:branchName", async (req: Request, res: Response) => {
  await checkExistanceOfRepository(req);

  const { username, repository, branchName } = modifyBranchParamsSchema.parse(req.params);

  res.send(await branchesService.remove(username, repository, branchName));
});

async function checkExistanceOfRepository(req: Request) {
  await getRepoIdFromPath(req);
}

export { router as branchesRoutes };
