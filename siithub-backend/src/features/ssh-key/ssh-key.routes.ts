import { type Request, type Response, Router } from "express";
import { z } from "zod";
import { sshKeyService } from "./ssh-key.service";
import "express-async-errors";
import { authorizeSshKeyOwner } from "./ssh-key.middleware";

const sshKeyRoutes = Router();

const sshKeyBodySchema = z.object({
  name: z.string().min(3, "Name should have at least 3 characters."),
  value: z.string(),
  owner: z.string(),
});
const createSshKeyBodySchema = sshKeyBodySchema;
const sshKeyParamsSchema = z.object({ id: z.string().uuid() });

sshKeyRoutes.post("/", authorizeSshKeyOwner, async (req: Request, res: Response) => {
  const createSshKey = createSshKeyBodySchema.parse(req.body);
  res.send(await sshKeyService.create(createSshKey));
});

sshKeyRoutes.put("/:id", authorizeSshKeyOwner, async (req: Request, res: Response) => {
  const params = sshKeyParamsSchema.parse(req.params);
  const updateSshKey = createSshKeyBodySchema.parse(req.body);
  res.send(await sshKeyService.update(params.id, updateSshKey));
});

sshKeyRoutes.delete("/:id", authorizeSshKeyOwner, async (req: Request, res: Response) => {
  const params = sshKeyParamsSchema.parse(req.params);
  res.send(await sshKeyService.delete(params.id));
});

export { sshKeyBodySchema, sshKeyRoutes };
