import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { advanceSearchService } from "./advance-search.service";
import { asOptionalField, idSchema, paramSchema } from "../../utils/zod";

const router = Router();

router.get("/repositories", async (req: Request, res: Response) => {
  const { param, sort } = paramSchema.parse(req.query);
  res.send(await advanceSearchService.searchRepositories(param, res.locals.userId, sort));
});

router.get("/repositories/count", async (req: Request, res: Response) => {
  const { param } = paramSchema.parse(req.query);
  res.send({ count: await advanceSearchService.countRepositories(param, res.locals.userId) });
});

router.get("/users", async (req: Request, res: Response) => {
  const { param, sort } = paramSchema.parse(req.query);
  res.send(await advanceSearchService.searchUsers(param, sort));
});

router.get("/users/count", async (req: Request, res: Response) => {
  const { param } = paramSchema.parse(req.query);
  res.send({ count: await advanceSearchService.countUsers(param) });
});

router.get("/tags", async (req: Request, res: Response) => {
  const repositoryId = asOptionalField(idSchema).parse(req.query.repositoryId);
  const { param, sort } = paramSchema.parse(req.query);
  res.send(await advanceSearchService.searchTags(param, res.locals.userId, repositoryId, sort));
});

router.get("/tags/count", async (req: Request, res: Response) => {
  const repositoryId = asOptionalField(idSchema).parse(req.query.repositoryId);
  const { param } = paramSchema.parse(req.query);
  res.send({ count: await advanceSearchService.countTags(param, res.locals.userId, repositoryId) });
});

router.get("/issues", async (req: Request, res: Response) => {
  const repositoryId = asOptionalField(idSchema).parse(req.query.repositoryId);
  const { param, sort } = paramSchema.parse(req.query);
  res.send(await advanceSearchService.searchIssues(param, res.locals.userId, repositoryId, sort));
});

router.get("/issues/count", async (req: Request, res: Response) => {
  const repositoryId = asOptionalField(idSchema).parse(req.query.repositoryId);
  const { param } = paramSchema.parse(req.query);
  res.send({ count: await advanceSearchService.countIssues(param, res.locals.userId, repositoryId) });
});

router.get("/commits", async (req: Request, res: Response) => {
  const repositoryId = idSchema.parse(req.query.repositoryId);
  const { param, sort } = paramSchema.parse(req.query);
  res.send(await advanceSearchService.searchCommits(param, repositoryId, sort));
});

router.get("/commits/count", async (req: Request, res: Response) => {
  const repositoryId = idSchema.parse(req.query.repositoryId);
  const { param } = paramSchema.parse(req.query);
  res.send({ count: await advanceSearchService.countCommits(param, repositoryId) });
});

router.get("/pull-requests", async (req: Request, res: Response) => {
  const repositoryId = asOptionalField(idSchema).parse(req.query.repositoryId);
  const { param, sort } = paramSchema.parse(req.query);
  res.send(await advanceSearchService.searchPullRequest(param, res.locals.userId, repositoryId, sort));
});

router.get("/pull-requests/count", async (req: Request, res: Response) => {
  const repositoryId = asOptionalField(idSchema).parse(req.query.repositoryId);
  const { param } = paramSchema.parse(req.query);
  res.send({ count: await advanceSearchService.countPullRequest(param, res.locals.userId, repositoryId) });
});

export { router as advanceSearchRoutes };
