import { useQuery } from "react-query";
import { type Repository } from "../repository/repository.service";
import { getMilestone, getRepositoryMilestones, type Milestone } from "./milestoneActions";

export function useMilestones(repositoryId: Repository["_id"], open?: boolean, dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`milestones_${repositoryId}`, open, ...dependencies],
    () => getRepositoryMilestones(repositoryId, open),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true),
    }
  );
  return {
    milestones: data?.data as Milestone[],
    error: (error as any)?.response?.data,
  };
}

export function useMilestone(repositoryId: Repository["_id"], localId: number, dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`milestones_${repositoryId}_${localId}`, ...dependencies],
    () => getMilestone(repositoryId, localId),
    {
      enabled: dependencies?.reduce((acc, dep) => acc && !dep, true),
    }
  );
  return {
    milestone: data?.data as Milestone,
    error: (error as any)?.response?.data,
  };
}
