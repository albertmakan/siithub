import { useQuery } from "react-query";
import { type Tag, getTagsCountByRepo, searchTagsInRepo } from "./tagActions";
import { type Repository } from "../repository/repository.service";

export function useTags(repositoryId: Repository["_id"], dependencies: any[] = []) {
  return useSearchTags(repositoryId, "", dependencies);
}

export function useSearchTags(repositoryId: Repository["_id"], tagName: string, dependencies: any[] = []) {
  const { data } = useQuery(
    [`tags_${repositoryId}_${tagName}`, name, tagName, ...dependencies],
    () => searchTagsInRepo(repositoryId, tagName),
    {
      enabled: dependencies.reduce((acc, d) => acc && !d, true) && !!repositoryId,
    }
  );

  return {
    tags: (data?.data ?? []) as Tag[],
  };
}

export function useTagsCount(repositoryId: Repository["_id"]) {
  const { data } = useQuery([`tags_${repositoryId}_count`, name], () => getTagsCountByRepo(repositoryId), {
    enabled: !!repositoryId,
  });

  return {
    count: data?.data?.count ?? 0,
  };
}
