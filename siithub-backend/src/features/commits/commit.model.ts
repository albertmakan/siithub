import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";

export type AuthorInfo = {
  name: string;
  email: string;
  username: string;
  pictures?: string[];
  _id?: User["_id"];
};

export type Commit = {
  message: string;
  sha: string;
  date: number;
  author: AuthorInfo;
};

export type CommitsWithRepo = {
  commits: Commit[];
  repository: Repository;
};

export type LastCommitAndContrib = Commit & { contributors: AuthorInfo[] };

export type CommitWithDiff = Commit & {
  stats: { add: number; del: number; files: number };
};

export type PushInfo = {
  repository: string;
  username: string;
  branch: string;
  commits: Commit[];
};
