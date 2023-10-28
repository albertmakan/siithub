import { Router } from "express";
import type { Request, Response } from "express";
import { getTree } from "./git/tree.utils";
import { getBlob } from "./git/blob.utils";
import { createBranch, getBranches, removeBranch, renameBranch } from "./git/branches.utils";
import { createTag, deleteTag } from "./git/tags.utils";
import {
  getCommit,
  getCommitCount,
  getCommits,
  getCommitsBetweenRevisions,
  getCommitsDiffBetweenBranches,
  getCommitsSha,
  getFileHistoryCommits,
  getLatestCommitAndContributors,
  mergeCommits,
} from "./git/commits";

const router = Router();

router.get("/tree/:branch/:treePath", async (req: Request, res: Response) => {
  const { branch, treePath } = req.params;
  const tree = await getTree(res.locals.repoPath, branch, treePath);
  if (!tree) {
    res.status(404).send({ m: "not found" });
    return;
  }
  res.send(tree);
});

router.get("/tree/:branch/", async (req: Request, res: Response) => {
  const { branch } = req.params;
  const tree = await getTree(res.locals.repoPath, branch, "");
  if (!tree) {
    res.status(404).send({ m: "root not found" });
    return;
  }
  res.send(tree);
});

router.get("/blob/:branch/:blobPath", async (req: Request, res: Response) => {
  const { branch, blobPath } = req.params;
  const blob = await getBlob(res.locals.repoPath, branch, blobPath);
  if (!blob) {
    res.status(404).send({ m: "file not found" });
    return;
  }
  res.setHeader("bin", +blob.isBinary).setHeader("size", blob.size);
  res.type("blob").send(blob.content);
});

router.get("/blob-info/:branch/:blobPath", async (req: Request, res: Response) => {
  const { branch, blobPath } = req.params;
  const info = await getLatestCommitAndContributors(res.locals.repoPath, branch, blobPath);
  if (!info) {
    res.status(404).send({ m: "file not found" });
    return;
  }
  res.send(info);
});

router.get("/branches", async (req: Request, res: Response) => {
  const branches = await getBranches(res.locals.repoPath);
  if (!branches) {
    res.status(400).send({ message: "Error while trying to fetch branches." });
    return;
  }
  res.send(branches);
});

router.post("/branches", async (req: Request, res: Response) => {
  const { source, branchName } = req.body;
  const createdBranch = await createBranch(res.locals.repoPath, source, branchName);
  if (!createdBranch) {
    res.status(400).send({ message: "Branch already exists." });
    return;
  }
  res.send(createdBranch);
});

router.put("/branches/:branchName", async (req: Request, res: Response) => {
  const { branchName } = req.params;
  const { newBranchName } = req.body;
  const renamedBranch = await renameBranch(res.locals.repoPath, branchName, newBranchName);
  if (renamedBranch === null) {
    res.status(404).send({ message: `Branch ${branchName} not found.` });
    return;
  }
  res.send(renamedBranch);
});

router.delete("/branches/:branchName", async (req: Request, res: Response) => {
  const { branchName } = req.params;
  const deletedBranch = await removeBranch(res.locals.repoPath, branchName);
  if (deletedBranch === null) {
    res.status(404).send({ message: `Branch ${branchName} not found.` });
    return;
  }
  res.send(deletedBranch);
});

router.get("/commits/between", async (req: Request, res: Response) => {
  const { base, compare } = req.query;
  const commits = await getCommitsBetweenRevisions(
    res.locals.repoPath,
    base?.toString() ?? "",
    compare?.toString() ?? ""
  );
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

router.get("/commits/diff/between", async (req: Request, res: Response) => {
  const { base, compare } = req.query;
  const commits = await getCommitsDiffBetweenBranches(
    res.locals.repoPath,
    base?.toString() ?? "",
    compare?.toString() ?? ""
  );
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

router.get("/commits/:branch/", async (req: Request, res: Response) => {
  const { branch } = req.params;
  const commits = await getCommits(res.locals.repoPath, branch);
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

router.get("/commits/:branch/with-diff", async (req: Request, res: Response) => {
  const { branch } = req.params;
  const commits = await getCommits(res.locals.repoPath, branch, true);
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

router.get("/commits/:branch/:filePath", async (req: Request, res: Response) => {
  const { branch, filePath } = req.params;
  const commits = await getFileHistoryCommits(res.locals.repoPath, branch, filePath);
  if (!commits) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send(commits);
});

router.get("/commit-count/:branch/", async (req: Request, res: Response) => {
  const { branch } = req.params;
  const count = await getCommitCount(res.locals.repoPath, branch);
  if (!count) {
    res.status(404).send({ m: "commits not found" });
    return;
  }
  res.send({ count });
});

router.get("/commit/:sha/", async (req: Request, res: Response) => {
  const { sha } = req.params;
  const commit = await getCommit(res.locals.repoPath, sha);
  if (!commit) {
    res.status(404).send({ m: "commit not found" });
    return;
  }
  res.send(commit);
});

router.get("/commit/sha/:branch", async (req: Request, res: Response) => {
  const { branch } = req.params;
  const sha = await getCommitsSha(res.locals.repoPath, branch);
  if (!sha) {
    res.status(404).send({ m: "Sha does not exist" });
    return;
  }
  res.send(sha);
});

router.post("/commits/merge", async (req: Request, res: Response) => {
  const { base, compare } = req.query as any;
  const mergeResult = await mergeCommits(res.locals.repoPath, base, compare);
  if (!mergeResult) {
    res.status(400).send({ m: "Merge conflict" });
    return;
  }
  res.send(mergeResult);
});

router.post("/tags", async (req: Request, res: Response) => {
  const { tagName, target } = req.body;
  const tag = await createTag(res.locals.repoPath, tagName, target);
  if (!tag) {
    res.status(400).send({ m: "Tag not created" });
    return;
  }
  res.send(tag);
});

router.delete("/tags/:tagName", async (req: Request, res: Response) => {
  const { tagName } = req.params;
  const tag = await deleteTag(res.locals.repoPath, tagName);
  if (!tag) {
    res.status(404).send({ m: "Tag does not exist" });
    return;
  }
  res.send(tag);
});

export { router as repoRoutes };
