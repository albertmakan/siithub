import express from "express";
import fs from "fs";
import type { Express, Request, Response } from "express";
import { collabFile, config, homePath } from "./config";
import { createUser } from "./user.utils";
import { createRepo, createRepoFork, removeRepo } from "./git/repository.utils";
import { addKey, removeKey } from "./key.utils";
import { repoRoutes } from "./repo.routes";
import { addUserToGroup, deleteUserFromGroup } from "./group.utils";
import { execCmd } from "./cmd.utils";
import { alphanum } from "./string.utils";

const app: Express = express();

app.use(express.json());

app.use(
  "/api/repo/:username/:repository",
  (req, res, next) => {
    const { username, repository } = req.params;
    if (!alphanum(username, repository)) {
      res.status(400).send();
      return;
    }
    res.locals.repoPath = `${homePath}/${username}/${repository}`;
    if (!fs.existsSync(`${res.locals.repoPath}/.git`)) res.status(404).send({ m: "Repository not found" });
    else next();
  },
  repoRoutes
);

app.post("/api/users", async (req: Request, res: Response) => {
  const { username } = req.body;
  if (!alphanum(username)) {
    res.status(400).send();
    return;
  }
  await createUser(username);

  res.send({ status: "ok" });
});

app.post("/api/repositories", async (req: Request, res: Response) => {
  const { username, repositoryName, type } = req.body;
  if (!alphanum(username, repositoryName)) {
    res.status(400).send();
    return;
  }
  await createRepo(username, repositoryName, type === "public");

  res.send({ status: "ok" });
});

app.post("/api/repositories/fork", async (req: Request, res: Response) => {
  const { username, repositoryName, fromUsername, fromRepositoryName, type, only1Branch } = req.body;
  if (!alphanum(username, repositoryName, fromUsername, fromRepositoryName)) {
    res.status(400).send();
    return;
  }
  await createRepoFork(username, repositoryName, fromUsername, fromRepositoryName, type === "public", only1Branch);

  res.send({ status: "ok" });
});

app.put("/api/repositories/delete", async (req: Request, res: Response) => {
  const { username, repositoryName } = req.body;
  if (!alphanum(username, repositoryName)) {
    res.status(400).send();
    return;
  }
  await removeRepo(username, repositoryName);

  res.send({ status: "ok" });
});

app.post("/api/key", async (req: Request, res: Response) => {
  const { username, key } = req.body;
  if (!alphanum(username)) {
    res.status(400).send();
    return;
  }
  await addKey(username, key);

  res.send({ status: "ok" });
});

app.put("/api/key", async (req: Request, res: Response) => {
  const { username, key, oldKey } = req.body;
  if (!alphanum(username)) {
    res.status(400).send();
    return;
  }
  await removeKey(username, oldKey);
  await addKey(username, key);

  res.send({ status: "ok" });
});

app.put("/api/key/delete", async (req: Request, res: Response) => {
  const { username, key } = req.body;
  if (!alphanum(username)) {
    res.status(400).send();
    return;
  }
  await removeKey(username, key);

  res.send({ status: "ok" });
});

app.post("/api/repo/:username/:repository/collaborators", async (req: Request, res: Response) => {
  const { username, repository } = req.params;
  const { collaborator } = req.body;
  if (!alphanum(username, repository, collaborator)) {
    res.status(400).send();
    return;
  }
  await addUserToGroup(`${username}-${repository}`, collaborator);
  await execCmd(`echo "${collaborator}" >> ${collabFile}`, `${homePath}/${username}/${repository}`);

  res.send({ status: "ok" });
});

app.delete("/api/repo/:username/:repository/collaborators/:collaborator", async (req: Request, res: Response) => {
  const { username, repository, collaborator } = req.params;
  if (!alphanum(username, repository, collaborator)) {
    res.status(400).send();
    return;
  }
  await deleteUserFromGroup(`${username}-${repository}`, collaborator);
  await execCmd(
    `grep -v "^${collaborator}$" ${collabFile} > temp && mv temp ${collabFile}`,
    `${homePath}/${username}/${repository}`
  );

  res.send({ status: "ok" });
});

app.listen(config.port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${config.port}`);
});
