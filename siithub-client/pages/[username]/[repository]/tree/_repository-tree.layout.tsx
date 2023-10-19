import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, type PropsWithChildren } from "react";
import { BranchesMenu } from "../../../../features/branches/BranchesMenu";
import { CommitsIcon } from "../../../../features/commits/CommitsIcon";
import { useCommitCount } from "../../../../features/commits/useCommits";
import { useRepositoryContext } from "../../../../features/repository/RepositoryContext";
import { type Repository } from "../../../../features/repository/repository.service";
import { CloneButton } from "../../../../features/repository/CloneButton";

export const RepositoryTreeLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { branch } = router.query;

  const { repository } = useRepositoryContext();
  const { owner, name, _id } = repository as Repository;

  const { count } = useCommitCount(_id, branch as string);

  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <BranchesMenu count={true} />

        <div className="flex items-center justify-end">
          <Link
            className="flex hover:text-blue-800 w-full"
            href={`/${owner}/${name}/commits/${encodeURIComponent(branch as string)}`}
          >
            <CommitsIcon className="mt-1 mr-1" />
            {count} commits
          </Link>
        </div>
        <CloneButton />
      </div>

      {children}
    </>
  );
};

export default RepositoryTreeLayout;
