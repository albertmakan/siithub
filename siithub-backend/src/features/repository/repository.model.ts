import { type BaseEntity } from "../../db/base.repo.utils";
import { type Branch } from "../branches/branches.models";

export type CounterType = "milestone" | "issue" | "stars" | "pull-request" | "forks";

export type Repository = {
  name: string;
  description?: string;
  type: "public" | "private";
  owner: string;
  counters: Record<CounterType, number>;
  forkedFrom?: Repository["_id"];
  defaultBranch?: Branch;
} & BaseEntity;

export type RepositoryCreate = Omit<Repository, "_id" | "counters">;
export type RepositoryUpdate = Partial<Repository>;

export type RepositoryForkCreate = {
  name: string;
  description?: string;
  repoName: string;
  repoOwner: string;
  only1Branch?: string;
};
