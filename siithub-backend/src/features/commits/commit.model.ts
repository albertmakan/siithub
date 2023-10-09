import { type Repository } from "../repository/repository.model";

export type AuthorInfo = {
  name: string;
  email: string;
  username: string;
  pictures?: string[];
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
