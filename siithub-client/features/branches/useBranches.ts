import { useQuery } from "react-query";
import { type Branch, getBranches } from "./branchesActions";

export function useBranches(username: string, repoName: string, name?: string, dependencies: any[] = []) {
  const { data }: { data: any } = useQuery(
    [`${username}/${repoName}_branches_get_${name}`, name, ...dependencies],
    () => getBranches(username, repoName, name),
    { enabled: dependencies.reduce((acc, d) => acc && !d, true) }
  );

  return {
    branches: (data?.data ?? []) as Branch[],
  };
}
