import { useQuery } from "react-query";
import { type Branch, getBranches } from "./branchesActions";
import { type Repository } from "../repository/repository.service";

export function useBranches(repositoryId: Repository["_id"], name?: string, dependencies: any[] = []) {
  const { data } = useQuery(
    [`branches_${repositoryId}/${name}`, name, ...dependencies],
    () => getBranches(repositoryId, name),
    { enabled: dependencies.reduce((acc, d) => acc && !d, true) }
  );

  return { branches: (data?.data ?? []) as Branch[] };
}
