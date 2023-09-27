import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { z } from "zod";
import type { MilestoneCreate, MilestoneUpdate } from "./milestone.model";
import { milestoneService } from "./milestone.service";
import { localIdSchema, optionalDateString } from "../../utils/zod";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";

const milestoneRoutes = Router();

const milestoneBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().default(""),
  dueDate: optionalDateString,
});

const createMilestoneBodySchema = milestoneBodySchema;
const updateMilestoneBodySchema = milestoneBodySchema;

milestoneRoutes.get("/", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const isOpen = { closed: false, open: true }[req.query.state + ""];
  const repositoryId = res.locals.repository._id;
  res.send(await milestoneService.findByRepositoryId(repositoryId, isOpen));
});

milestoneRoutes.get("/:localId", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const localId = localIdSchema.parse(+req.params.localId);
  const repositoryId = res.locals.repository._id;
  res.send(await milestoneService.findByRepositoryIdAndLocalId(repositoryId, localId));
});

milestoneRoutes.post("/", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const createMilestone = createMilestoneBodySchema.parse(req.body);
  const milestone = createMilestone as MilestoneCreate;
  milestone.repositoryId = res.locals.repository._id;
  res.send(await milestoneService.create(milestone));
});

milestoneRoutes.put("/:localId", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const updateMilestone = updateMilestoneBodySchema.parse(req.body);
  const milestone = updateMilestone as MilestoneUpdate;
  milestone.localId = localIdSchema.parse(+req.params.localId);
  milestone.repositoryId = res.locals.repository._id;
  res.send(await milestoneService.update(milestone));
});

milestoneRoutes.delete("/:localId", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const localId = localIdSchema.parse(+req.params.localId);
  const repositoryId = res.locals.repository._id;
  res.send(await milestoneService.delete(repositoryId, localId));
});

milestoneRoutes.put("/:localId/close", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const localId = localIdSchema.parse(+req.params.localId);
  const repositoryId = res.locals.repository._id;
  res.send(await milestoneService.changeStatus(repositoryId, localId, false));
});

milestoneRoutes.put("/:localId/open", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const localId = localIdSchema.parse(+req.params.localId);
  const repositoryId = res.locals.repository._id;
  res.send(await milestoneService.changeStatus(repositoryId, localId, true));
});

export { milestoneBodySchema, milestoneRoutes };
