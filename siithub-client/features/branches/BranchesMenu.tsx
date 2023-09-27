import { type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { type Repository } from "../repository/repository.service";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { useBranches } from "./useBranches";
import Select from "react-select";
import { useTagsCount } from "../tags/useTags";
import { TagIcon } from "../tags/Icons";

const BranchesIcon = ({ className }: any) => {
  return (
    <svg height="16" viewBox="0 0 16 16" version="1.1" width="16" className={"octicon octicon-git-branch " + className}>
      <path d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"></path>
    </svg>
  );
};

export const BranchesMenu: FC<{ count?: boolean }> = ({ count }) => {
  const router = useRouter();
  const { branch } = router.query;

  const { repository } = useRepositoryContext();
  const { owner, name, _id: repositoryId } = repository as Repository;

  const { branches } = useBranches(repositoryId);
  const { count: tagsCount } = useTagsCount(repositoryId);

  if (!branch) return <></>;

  const changeBranch = (branch: string) => {
    if (!branch) return;

    const queryParams = { ...router.query };
    queryParams["branch"] = branch;
    let finalRoute = router.pathname;

    for (const [param, value] of Object.entries(queryParams))
      finalRoute =
        typeof value === "string"
          ? finalRoute.replace(`[${param}]`, encodeURIComponent(value))
          : finalRoute.replace(`[...${param}]`, encodeURIComponent(value?.join("/") ?? ""));

    router.push(finalRoute);
  };

  return (
    <div className="flex space-x-2 items-center">
      <div className="min-w-[256px]">
        <Select
          defaultValue={{ value: branch, label: branch }}
          options={branches.map((b) => ({ value: b, label: b }))}
          onChange={(val) => changeBranch(val?.label as string)}
        />
      </div>

      {count && (
        <div className="flex space-x-2">
          <Link href={`/${owner}/${name}/branches`} className="flex hover:text-blue-800">
            <BranchesIcon className="mt-1 mr-1" />
            {branches.length} branches
          </Link>
          <Link href={`/${owner}/${name}/tags`} className="flex hover:text-blue-800">
            <TagIcon className="mt-1 mr-1" />
            {tagsCount} tags
          </Link>
        </div>
      )}
    </div>
  );
};
