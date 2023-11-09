import axios from "axios";
import { useQuery } from "react-query";
import { type Repository } from "../repository/repository.service";

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

export type LastCommitAndContrib = Commit & { contributors: AuthorInfo[] };

const basePath = (repositoryId: Repository["_id"]) => `/api/repositories/${repositoryId}/commits`;

export function useCommits(
  repositoryId: Repository["_id"],
  branch: string,
  filePath: string,
  dependencies: any[] = []
) {
  const { data, error, isLoading } = useQuery(
    [`commits_${repositoryId}/${branch}/${filePath}`, ...dependencies],
    () => axios.get(`${basePath(repositoryId)}/history/${encodeURIComponent(branch)}/${encodeURIComponent(filePath)}`),
    { enabled: dependencies.reduce((acc, d) => acc && !!d, true) }
  );
  return {
    commits: data?.data as Commit[],
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export function useCommitsBetweenBranches(
  repositoryId: Repository["_id"],
  base: string,
  compare: string,
  dependencies: any[] = []
) {
  const { data, error, isLoading } = useQuery(
    [`commits_between_${repositoryId}/${base}/${compare}`, ...dependencies],
    () => axios.get(`${basePath(repositoryId)}/between/${encodeURIComponent(base)}/${encodeURIComponent(compare)}`),
    { enabled: !!base && !!compare }
  );
  return {
    commits: data?.data as Commit[],
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export function useCommitsDiffBetweenBranches(
  repositoryId: Repository["_id"],
  base: string,
  compare: string,
  dependencies: any[] = []
) {
  const { data, error, isLoading } = useQuery(
    [`commits_diff_between_${repositoryId}/${base}/${compare}`, ...dependencies],
    () => axios.get(`${basePath(repositoryId)}/diff/${encodeURIComponent(base)}/${encodeURIComponent(compare)}`),
    { enabled: !!base && !!compare }
  );
  return {
    commit: data?.data as CommitWithDiff,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export function useCommitCount(repositoryId: Repository["_id"], branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`commit-count_${repositoryId}/${branch}`, ...dependencies],
    () => axios.get(`${basePath(repositoryId)}/count/${encodeURIComponent(branch)}`),
    { enabled: dependencies.reduce((acc, d) => acc && !!d, true) }
  );
  return {
    count: data?.data?.count as number,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export type CommitWithDiff = Commit & {
  diff: {
    old: { path: string; content?: string };
    new: { path: string; content?: string };
    stats: { total_additions: number; total_deletions: number };
    large: boolean;
  }[];
};

export function useCommit(repositoryId: Repository["_id"], sha: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`commit_${repositoryId}/${sha}`, ...dependencies],
    () => axios.get(`${basePath(repositoryId)}/${sha}`),
    { enabled: dependencies.reduce((acc, d) => acc && !!d, true) }
  );
  return {
    commit: data?.data as CommitWithDiff,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export function useFileInfo(
  repositoryId: Repository["_id"],
  branch: string,
  filePath: string,
  dependencies: any[] = []
) {
  const { data, error, isLoading } = useQuery(
    [`file-info_${repositoryId}/${branch}`, ...dependencies],
    () =>
      axios.get(`${basePath(repositoryId)}/blob-info/${encodeURIComponent(branch)}/${encodeURIComponent(filePath)}`),
    { enabled: dependencies.reduce((acc, d) => acc && !!d, true) }
  );
  return {
    info: data?.data as LastCommitAndContrib,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}
