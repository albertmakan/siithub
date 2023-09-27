import { useQuery } from "react-query";
import { type User } from "../users/user.model";
import { getStar, getStargazers } from "./starActions";
import { type Repository } from "../repository/repository.service";

export function useStar(repositoryId: Repository["_id"], dependencies: any[] = []) {
  const { data, error } = useQuery([`stars_${repositoryId}`, ...dependencies], () => getStar(repositoryId), {
    enabled: dependencies?.reduce((acc, dep) => acc && !dep, true),
  });
  return {
    star: data?.data as { date: Date },
    error: (error as any)?.response?.data,
  };
}

export function useStargazers(repositoryId: Repository["_id"], dependencies: any[] = []) {
  const { data, error } = useQuery([`stargazers_${repositoryId}`, ...dependencies], () => getStargazers(repositoryId), {
    enabled: dependencies?.reduce((acc, dep) => acc && !dep, true),
  });
  return {
    users: data?.data as User[],
    error: (error as any)?.response?.data,
  };
}
