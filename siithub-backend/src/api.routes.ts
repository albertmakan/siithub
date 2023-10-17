import { Router } from "express";
import { labelRoutes } from "./features/label/label.routes";
import { authRoutes } from "./features/auth/auth.routes";
import { userRoutes } from "./features/user/user.routes";
import { issueRoutes } from "./features/issue/issue.routes";
import { repositoryRoutes } from "./features/repository/repository.routes";
import { sshKeyRoutes } from "./features/ssh-key/ssh-key.routes";
import { milestoneRoutes } from "./features/milestone/milestone.routes";
import { collaboratorsRoutes } from "./features/collaborators/collaborators.routes";
import { starRoutes } from "./features/star/star.routes";
import { activitiesRoutes } from "./features/activities/activities.routes";
import { blobRoutes } from "./features/blob/blob.routes";
import { treeRoutes } from "./features/tree/tree.routes";
import { branchesRoutes } from "./features/branches/branches.routes";
import { commitRoutes } from "./features/commits/commit.routes";
import { pullRequestRoutes } from "./features/pull-requests/pull-requests.routes";
import { insightRoutes } from "./features/insights/insight.routes";
import { tagsRoutes } from "./features/tags/tags.routes";
import { advanceSearchRoutes } from "./features/advance-search/advance-search.routes";
import { findRepository } from "./features/repository/repository.middleware";
import { authorize } from "./features/auth/auth.middleware";

export const apiRoutes = Router()
  .use("/hello", (_, res) => res.send({ message: `Hello from Siithub! (${new Date()})` }))
  .use("/users", userRoutes)
  .use("/auth", authRoutes)
  .use("/ssh-keys", sshKeyRoutes)
  .use("/search", authorize(), advanceSearchRoutes)
  .use("/activities", authorize(), activitiesRoutes)
  .use("/repositories", authorize(), repositoryRoutes)
  .use(
    "/repositories/:repositoryId",
    authorize(),
    findRepository,
    Router()
      .use("/labels", labelRoutes)
      .use("/issues", issueRoutes)
      .use("/pull-requests", pullRequestRoutes)
      .use("/collaborators", collaboratorsRoutes)
      .use("/tags", tagsRoutes)
      .use("/milestones", milestoneRoutes)
      .use("/insights", insightRoutes)
      .use("/star", starRoutes)
      .use("/tree", treeRoutes)
      .use("/blob", blobRoutes)
      .use("/commits", commitRoutes)
      .use("/branches", branchesRoutes)
  );
