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
  res.send(await collaboratorsService.add({ userId, repositoryId, verified: false }, true));
});

router.delete("/:userId", async (req: Request, res: Response) => {
  const { userId } = removeCollaboratorSchema.parse(req.params);
  const repositoryId = res.locals.repository._id;
  const removerId = res.locals.userId;
  res.send(await collaboratorsService.remove({ userId, repositoryId }, removerId));
});

router.put("/verify", async (_, res: Response) => {
  const userId = res.locals.userId;
  const repositoryId = res.locals.repository._id;
  res.send(await collaboratorsService.verifyCollaborator(repositoryId, userId));
});

router.get("/me", async (_, res: Response) => {
  const userId = res.locals.userId;
  const repositoryId = res.locals.repository._id;
  const collaborator = await collaboratorsService.findByRepositoryAndUser(repositoryId, userId);
  res.status(collaborator ? 200 : 404).send(collaborator);
});

export { addCollaboratorSchema, removeCollaboratorSchema };

export { router as collaboratorsRoutes };
