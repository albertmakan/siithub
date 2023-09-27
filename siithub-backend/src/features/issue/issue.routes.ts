import type { Request, Response } from "express";
import { Router } from "express";
import "express-async-errors";
import { localIdSchema } from "../../utils/zod";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { issueService } from "./issue.service";
import { type IssueUpdate, type IssueCreate } from "./issue.model";
import { type IssuesQuery } from "./issue.query";

const issueRoutes = Router();

issueRoutes.get("/", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  res.send(await issueService.resolveParticipants(await issueService.findByRepositoryId(repositoryId)));
});

issueRoutes.get("/search", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  const query = req.query as IssuesQuery;
  res.send(await issueService.resolveParticipants(await issueService.searchByQuery(query, repositoryId)));
});

issueRoutes.get("/:localId", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  const localId = localIdSchema.parse(+req.params.localId);
  const issue = await issueService.findByRepositoryIdAndLocalId(repositoryId, localId);
  res.send((await issueService.resolveParticipants([issue]))[0]);
});

issueRoutes.post("/", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const issueCreate = req.body as IssueCreate;
  issueCreate.repositoryId = res.locals.repository._id;
  res.send(await issueService.create(issueCreate));
});

issueRoutes.put("/:localId", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const issueUpdate = req.body as IssueUpdate;
  issueUpdate.repositoryId = res.locals.repository._id;
  issueUpdate.localId = localIdSchema.parse(+req.params.localId);
  res.send(await issueService.update(issueUpdate));
});

export { issueRoutes };
