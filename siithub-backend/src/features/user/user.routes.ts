import { Router } from "express";
import type { Request, Response } from "express";
import { userService } from "./user.service";
import { z } from "zod";
import {
  ALPHANUMERIC_REGEX,
  GITHUB_ACCOUNT,
  LOWER_CASE_REGEX,
  NUMERIC_REGEX,
  SPECIAL_CHARACTERS_REGEX,
  UPPER_CASE_REGEX,
} from "../../patterns";
import "express-async-errors";
import { userGithubService } from "./user-github.service";
import { asOptionalField, idSchema } from "../../utils/zod";
import { getImage, uploadImage } from "../../utils/aws/imageStorage";
import { authorize } from "../auth/auth.middleware";
import { generateJWT } from "../../utils/jwt";

const router = Router();

const nameQuerySchema = z.object({ name: z.string().default("") });

router.get("/", async (req: Request, res: Response) => {
  const { name } = nameQuerySchema.parse(req.query);
  res.send(await userService.findMany({ name: { $regex: name, $options: "i" } }));
});

router.get("/u/:id", async (req: Request, res: Response) => {
  const id = idSchema.parse(req.params.id);
  res.send(await userService.findOneOrThrow(id));
});

router.get("/by-username/:username", async (req: Request, res: Response) => {
  const username = req.params.username;
  res.send(await userService.findByUsernameOrThrow(username));
});

const passwordSchema = z
  .string()
  .min(8, "Password should have at least 8 characters.")
  .regex(UPPER_CASE_REGEX, "Password should have at least 1 capital letter.")
  .regex(LOWER_CASE_REGEX, "Password should have at least 1 lower letter.")
  .regex(NUMERIC_REGEX, "Password should have at least 1 number.")
  .regex(SPECIAL_CHARACTERS_REGEX, "Password should have at least 1 special character.");

const createUserBodySchema = z.object({
  username: z
    .string()
    .min(3, "Username should have at least 3 characters.")
    .regex(ALPHANUMERIC_REGEX, "Username should contain only alphanumeric characters."),
  password: passwordSchema,
  githubUsername: asOptionalField(z.string().regex(GITHUB_ACCOUNT, "Github username should be valid.")),
  name: z.string().min(1, "Name should be provided."),
  email: z.string().email("Email should be valid."),
  bio: z.string().default(""),
});

router.post("/", async (req: Request, res: Response) => {
  const createUser = createUserBodySchema.parse(req.body);
  const user = await userService.create(createUser, true);
  const token = generateJWT({ id: user?._id, type: user?.type });
  res.send({ user, token });
});

router.post("/profile-image", authorize(), uploadImage.single("image"), async (req: Request, res: Response) => {
  const key = (req.file as any)?.key;
  res.send(await userService.updateProfilePicture(res.locals.userId, key));
});

router.get("/profile-image/:key", async (req: Request, res: Response) => {
  const blob = await getImage(req.params.key);
  res.type("blob");
  (blob as any)?.pipe(res);
});

const updateProfileBodySchema = z.object({
  name: z.string().min(1, "Name should be provided."),
  email: z.string().email("Email should be valid."),
  bio: z.string().default(""),
});

router.put("/", authorize(), async (req: Request, res: Response) => {
  const updateUser = updateProfileBodySchema.parse(req.body);
  res.send(await userService.updateProfile(res.locals.userId, updateUser));
});

const passwordBodySchema = z.object({
  oldPassword: z.string().min(1, "Old password should be provided."),
  newPassword: passwordSchema,
});

router.put("/change-password", authorize(), async (req: Request, res: Response) => {
  const passwordUpdate = passwordBodySchema.parse(req.body);
  await userService.updatePassword(res.locals.userId, passwordUpdate);
  res.send();
});

const changeGithubAccountBodySchema = z.object({
  username: z.string().regex(GITHUB_ACCOUNT, "Github username should be valid."),
});

router.put("/github", authorize(), async (req: Request, res: Response) => {
  const githubAccount = changeGithubAccountBodySchema.parse(req.body);
  res.send(await userGithubService.update(res.locals.userId, githubAccount));
});

router.delete("/github", authorize(), async (req: Request, res: Response) => {
  res.send(await userGithubService.delete(res.locals.userId));
});

export { createUserBodySchema, changeGithubAccountBodySchema, router as userRoutes };
