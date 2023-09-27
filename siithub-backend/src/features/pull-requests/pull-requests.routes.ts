import type { Request, Response } from "express";
import { Router } from "express";
import "express-async-errors";
import { localIdSchema } from "../../utils/zod";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { pullRequestService } from "./pull-requests.service";
import { type PullRequestCreate, type PullRequestUpdate } from "./pull-requests.model";
import { type PullRequestsQuery } from "./pull-requests.query";

const pullRequestRoutes = Router();

pullRequestRoutes.get("/", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  res.send(await pullRequestService.resolveParticipants(await pullRequestService.findByRepositoryId(repositoryId)));
});

pullRequestRoutes.get("/search", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  const query = req.query as PullRequestsQuery;
  res.send(await pullRequestService.resolveParticipants(await pullRequestService.searchByQuery(query, repositoryId)));
});

pullRequestRoutes.get("/:localId", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  const localId = localIdSchema.parse(+req.params.localId);
  const pullRequest = await pullRequestService.findByRepositoryIdAndLocalId(repositoryId, localId);
  res.send((await pullRequestService.resolveParticipants([pullRequest]))[0]);
});

pullRequestRoutes.post("/", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const pullRequestCreate = req.body as PullRequestCreate;
  pullRequestCreate.repositoryId = res.locals.repository._id;
  res.send(await pullRequestService.create(pullRequestCreate));
});

pullRequestRoutes.put("/:localId", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const pullRequestUpdate = req.body as PullRequestUpdate;
  pullRequestUpdate.repositoryId = res.locals.repository._id;
  pullRequestUpdate.localId = localIdSchema.parse(+req.params.localId);
  res.send(await pullRequestService.update(pullRequestUpdate));
});

export { pullRequestRoutes };
