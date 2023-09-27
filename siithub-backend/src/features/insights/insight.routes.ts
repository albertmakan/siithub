import "express-async-errors";
import { type Request, type Response, Router } from "express";
import { insightService } from "./insight.service";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { type Repository } from "../repository/repository.model";

const insightRoutes = Router();

insightRoutes.get("/pulse", isAllowedToAccessRepo(true), async (_, res: Response) => {
  const repoId = res.locals.repository._id;
  res.send(await insightService.getPulseInsights(repoId));
});

insightRoutes.get("/contributors/:branch", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await insightService.getContributorInsights(owner, name, req.params.branch));
});

insightRoutes.get("/commits/:branch", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await insightService.getCommitsInsights(owner, name, req.params.branch));
});

insightRoutes.get("/frequency/:branch", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const { owner, name } = res.locals.repository as Repository;
  res.send(await insightService.getCodeFrequencyInsights(owner, name, req.params.branch));
});

export { insightRoutes };
