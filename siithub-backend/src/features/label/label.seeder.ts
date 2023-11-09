import { labelService } from "./label.service";
import { type Label } from "./label.model";
import { type Repository } from "../repository/repository.model";
import { logger } from "../../utils/aws/logger";

async function seedDefaultLabels(repositoryId: Repository["_id"]) {
  const labels = [
    {
      name: "bug",
      description: "Something isn't working",
      color: "#FF0000",
      repositoryId,
    },
    {
      name: "documentation",
      description: "Improvements or additions to documentation",
      color: "#0000FF",
      repositoryId,
    },
    {
      name: "duplicate",
      description: "This issue or pull request already exists",
      color: "#BECC00",
      repositoryId,
    },
    {
      name: "feature",
      description: "New feature",
      color: "#00BB00",
      repositoryId,
    },
    {
      name: "setup",
      description: "Project or environment setup",
      color: "#FFAA00",
      repositoryId,
    },
    {
      name: "question",
      description: "Further information is requested",
      color: "#CC00FF",
      repositoryId,
    },
    {
      name: "wontfix",
      description: "This will not be worked on",
      color: "#D1D1D1",
      repositoryId,
    },
  ];

  const createdLabels = [];
  for (const label of labels) {
    try {
      createdLabels.push((await labelService.create(label)) as Label);
    } catch (error) {
      logger.error("Failed to add default label", { repoId: repositoryId, label: label.name });
    }
  }
  logger.info("Default labels are added", { repoId: repositoryId });

  return createdLabels;
}

export type LabelSeeder = {
  seedDefaultLabels(repositoryId: Repository["_id"]): Promise<Label[]>;
};

const labelSeeder: LabelSeeder = {
  seedDefaultLabels,
};

export { labelSeeder };
