import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { ALPHANUMERIC_REGEX } from "../../patterns";
import { repositoryService } from "./repository.service";
import "express-async-errors";
import { authorizeRepositoryOwner, findRepository } from "./repository.middleware";
import { starService } from "../star/star.service";
import { getUserIdFromPath } from "../../utils/getUser";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { Repository } from "./repository.model";

const router = Router();

const repositorySearchSchema = z.object({
  term: z.string().optional(),
  owner: z.string(),
});

router.get("/", async (req: Request, res: Response) => {
  const query = repositorySearchSchema.parse(req.query);
  res.send(await repositoryService.search(query.owner, query.term));
});

router.get("/starred-by/:username", async (req: Request, res: Response) => {
  const userId = await getUserIdFromPath(req);
  const stars = await starService.findByUserId(userId);
  res.send(await repositoryService.findByIds(stars.map((s) => s.repoId)));
});

router.get("/r/:username/:repository", findRepository, isAllowedToAccessRepo(true, false), async (_, res: Response) => {
  res.send(await repositoryService.resolveForkedFrom(res.locals.repository as Repository));
});

const repositoryBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Name should contain only alphanumeric characters."),
  type: z.enum(["private", "public"]),
  description: z.string().default(""),
  owner: z.string(),
});

const createRepositoryBodySchema = repositoryBodySchema;

router.post("/", authorizeRepositoryOwner, async (req: Request, res: Response) => {
  const repository = createRepositoryBodySchema.parse(req.body);
  res.send(repositoryService.create(repository));
});

router.delete("/r/:username/:repository", authorizeRepositoryOwner, async (req: Request, res: Response) => {
  res.send(await repositoryService.delete(req.params.username, req.params.repository));
});

const forkBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Name should contain only alphanumeric characters."),
  description: z.string().default(""),
  only1Branch: z.string().optional(),
});

router.post(
  "/fork/:username/:repository",
  findRepository,
  isAllowedToAccessRepo(),
  async (req: Request, res: Response) => {
    const fork = forkBodySchema.parse(req.body);
    const userId = res.locals.userId;
    const { owner, name } = res.locals.repository as Repository;
    res.send(await repositoryService.forkRepository({ ...fork, repoOwner: owner, repoName: name }, userId));
  }
);

router.get(
  "/fork/:username/:repository/:owner",
  findRepository,
  isAllowedToAccessRepo(true),
  async (req: Request, res: Response) => {
    res.send(await repositoryService.findFork(req.params.owner, res.locals.repository._id));
  }
);

router.get("/forks/:username/:repository", findRepository, isAllowedToAccessRepo(true), async (_, res: Response) => {
  res.send(await repositoryService.findForks(res.locals.repository._id));
});

router.get("/by-owner/:owner", async (req: Request, res: Response) => {
  const usersRepos = await repositoryService.findAllByOwner(req.params.owner, res.locals.userId);
  res.send(await Promise.all(usersRepos.map(async (repo) => await repositoryService.resolveForkedFrom(repo))));
});

router.put("/:repositoryId/default-branch", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const { newBranchName } = req.body;
  res.send(await repositoryService.changeDefaultBranch(res.locals.repository._id, newBranchName));
});

export { repositoryBodySchema, router as repositoryRoutes };
