import axios from "axios";
import { useQuery } from "react-query";
import { type Repository } from "../repository/repository.service";

export type PulseInsights = {
  totalPrs: number;
  activePrs: number;
  mergedPrs: number;
  totalIssues: number;
  closedIssues: number;
  newIssues: number;
};

export function usePulseInsights(repositoryId: Repository["_id"], dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`contributor_insights_${repositoryId}`, ...dependencies],
    () => axios.get(`/api/repositories/${repositoryId}/insights/pulse`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !!d, true),
    }
  );
  return {
    insights: data?.data as PulseInsights,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export type GroupedCommitCount = {
  date: string;
  commits: number;
};

export type ContributorInsights = {
  all: GroupedCommitCount[];
  authorDataMax: {
    adds: number;
    dels: number;
    commits: number;
  };
  perAuthor: {
    data: GroupedCommitCount[];
    author: { username?: string; name: string };
    commitsTotal: number;
    addsTotal: number;
    delsTotal: number;
  }[];
};

export function useContributorInsights(repositoryId: Repository["_id"], branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`contributor_insights_${repositoryId}/${branch}`, ...dependencies],
    () => axios.get(`/api/repositories/${repositoryId}/insights/contributors/${encodeURIComponent(branch)}`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !!d, true),
    }
  );
  return {
    insights: data?.data as ContributorInsights,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export type CommitsInsights = {
  weekly: GroupedCommitCount[];
  daily: GroupedCommitCount[];
};

export function useCommitsInsights(repositoryId: Repository["_id"], branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`commits_insights_${repositoryId}/${branch}`, ...dependencies],
    () => axios.get(`/api/repositories/${repositoryId}/insights/commits/${encodeURIComponent(branch)}`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !!d, true),
    }
  );
  return {
    insights: data?.data as CommitsInsights,
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}

export type CodeFrequencyInsight = {
  date: string;
  adds: number;
  dels: number;
};

export function useCodeFrequencyInsights(repositoryId: Repository["_id"], branch: string, dependencies: any[] = []) {
  const { data, error, isLoading } = useQuery(
    [`code_frequency_insights_${repositoryId}/${branch}`, ...dependencies],
    () => axios.get(`/api/repositories/${repositoryId}/insights/frequency/${encodeURIComponent(branch)}`),
    {
      enabled: dependencies.reduce((acc, d) => acc && !!d, true),
    }
  );
  return {
    insights: data?.data as CodeFrequencyInsight[],
    error: (error as any)?.response?.data,
    isLoading: isLoading,
  };
}
