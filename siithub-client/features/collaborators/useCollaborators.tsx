import { useQuery } from "react-query";
import { type Collaborator, searchCollaborators } from "./collaboratorAction";
import { type Repository } from "../repository/repository.service";

export function useCollaborators(repositoryId: Repository["_id"], name: string, dependencies: any[] = []) {
  const { data } = useQuery(
    [`collaborators_${repositoryId}`, name, ...dependencies],
    () => searchCollaborators(repositoryId, name),
    { enabled: dependencies.reduce((acc, d) => acc && !d, true) }
  );

  return { collaborators: (data?.data ?? []) as Collaborator[] };
}
