import { type Request, type Response, Router } from "express";
import { collaboratorsService } from "./collaborators.service";
import { z } from "zod";
import { objectIdString } from "../../utils/zod";
import "express-async-errors";
import { isAllowedToAccessRepo } from "./collaborators.middleware";
import { authorizeRepositoryOwner } from "../repository/repository.middleware";

const router = Router();

const addCollaboratorSchema = z.object({
  userId: objectIdString("User id must be provided."),
});
const removeCollaboratorSchema = addCollaboratorSchema;

const nameQuerySchema = z.object({ name: z.string().default("") });

router.get("/", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  const { name } = nameQuerySchema.parse(req.query);
  const collaborators = await collaboratorsService.findByRepository(repositoryId);
  res.send(await collaboratorsService.resolveUsers(collaborators, name));
});

router.post("/", authorizeRepositoryOwner, async (req: Request, res: Response) => {
  const { userId } = addCollaboratorSchema.parse(req.body);
  const repositoryId = res.locals.repository._id;
  res.send(await collaboratorsService.add({ userId, repositoryId }));
});

router.delete("/:userId", authorizeRepositoryOwner, async (req: Request, res: Response) => {
  const { userId } = removeCollaboratorSchema.parse(req.params);
  const repositoryId = res.locals.repository._id;
  res.send(await collaboratorsService.remove({ userId, repositoryId }));
});

export { addCollaboratorSchema, removeCollaboratorSchema };

export { router as collaboratorsRoutes };
