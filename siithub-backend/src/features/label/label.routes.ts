import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { ALPHANUMERIC_REGEX, COLOR_REGEX } from "../../patterns";
import type { LabelUpdate, LabelCreate } from "./label.model";
import { labelService } from "./label.service";
import "express-async-errors";
import { labelHasToBelongToRepo } from "./label.middlewares";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { idSchema } from "../../utils/zod";

const labelRoutes = Router();

const labelBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Name should contain only alphanumeric characters."),
  description: z.string().default(""),
  color: z.string().regex(COLOR_REGEX, "Color should contain only hexadecimal numbers."),
});

const createLabelBodySchema = labelBodySchema;
const updateLabelBodySchema = labelBodySchema;

labelRoutes.get("/search", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const name = req.query.name;
  const repositoryId = res.locals.repository._id;
  if (!name) {
    res.send(await labelService.findByRepositoryId(repositoryId));
  } else {
    res.send(await labelService.searchByName(name.toString(), repositoryId));
  }
});

labelRoutes.get("/:id", isAllowedToAccessRepo(true), labelHasToBelongToRepo, async (req: Request, res: Response) => {
  res.send(res.locals.label);
});

labelRoutes.post("/", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const createLabel = createLabelBodySchema.parse(req.body);
  const label = createLabel as LabelCreate;
  label.repositoryId = res.locals.repository._id;
  res.send(await labelService.create(label));
});

labelRoutes.put("/:id", isAllowedToAccessRepo(), labelHasToBelongToRepo, async (req: Request, res: Response) => {
  const updateLabel = updateLabelBodySchema.parse(req.body);
  const label = updateLabel as LabelUpdate;
  label._id = idSchema.parse(req.params.id);
  label.repositoryId = res.locals.repository._id;
  res.send(await labelService.update(label));
});

labelRoutes.delete("/:id", isAllowedToAccessRepo(), labelHasToBelongToRepo, async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  res.send(await labelService.delete(id));
});

export { labelBodySchema, labelRoutes };
