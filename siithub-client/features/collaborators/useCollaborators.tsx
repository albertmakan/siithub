import { useQuery } from "react-query";
import { type Collaborator, searchCollaborators, getCollaborator } from "./collaboratorAction";
import { type Repository } from "../repository/repository.service";

export function useCollaborators(repositoryId: Repository["_id"], name: string, dependencies: any[] = []) {
  const { data } = useQuery(
    [`collaborators_${repositoryId}`, name, ...dependencies],
    () => searchCollaborators(repositoryId, name),
    { enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!repositoryId }
  );

  return { collaborators: (data?.data ?? []) as Collaborator[] };
}

export function useCollaborator(repositoryId: Repository["_id"], dependencies: any[] = []) {
  const { data, error } = useQuery(
    [`collaborator_${repositoryId}`, ...dependencies],
    () => getCollaborator(repositoryId),
    { enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!repositoryId }
  );

  return { collaborator: data?.data as Collaborator, error: (error as any)?.response?.data };
}
