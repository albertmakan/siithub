import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { z } from "zod";
import { isAllowedToAccessRepo } from "../collaborators/collaborators.middleware";
import { tagsService } from "./tags.service";
import { type TagCreate } from "./tags.model";
import { ALPHANUMERIC_AND_WHITESPACE_REGEX } from "../../patterns";

const tagsRoutes = Router();

const tagBodySchema = z.object({
  name: z
    .string()
    .min(3, "Name should have at least 3 characters.")
    .regex(ALPHANUMERIC_AND_WHITESPACE_REGEX, "Name should contain only alphanumeric characters."),
  description: z.string().default(""),
  version: z.string().min(1, "Version should be provided."),
  branch: z.string().min(1),
  isLatest: z.boolean().default(false),
  isPreRelease: z.boolean().default(false),
});

tagsRoutes.get("/", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  const name = req.query?.name?.toString() ?? "";

  res.send(await tagsService.searchByNameAndRepositoryId(name, repositoryId));
});

tagsRoutes.get("/count", isAllowedToAccessRepo(true), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  res.send({ count: await tagsService.countByRepositoryId(repositoryId) });
});

tagsRoutes.post("/", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const createTag = tagBodySchema.parse(req.body);

  const tag: TagCreate = {
    ...createTag,
    repositoryId: res.locals.repository._id,
    author: res.locals.userId,
    timeStamp: new Date(),
  };

  res.send(await tagsService.create(tag));
});

tagsRoutes.delete("/:version", isAllowedToAccessRepo(), async (req: Request, res: Response) => {
  const repositoryId = res.locals.repository._id;
  const { version } = req.params;

  res.send(await tagsService.delete(version, repositoryId));
});

export { tagsRoutes };
