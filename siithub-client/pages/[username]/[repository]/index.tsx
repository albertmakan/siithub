import { useRouter } from "next/router";
import { useEffect } from "react";
import { RepositoryView } from "../../../features/repository/repository-view";
import { useRepositoryContext } from "../../../features/repository/RepositoryContext";
import { Repository } from "../../../features/repository/repository.service";

const Repository = () => {
  const router = useRouter();
  const { repository } = useRepositoryContext();
  const { owner, name, defaultBranch } = repository as Repository;

  useEffect(() => {
    if (defaultBranch) router.push(`/${owner}/${name}/tree/${encodeURIComponent(defaultBranch)}`);
  }, [router, owner, name, defaultBranch]);

  return <RepositoryView repo={name} username={owner} isEmpty={!defaultBranch} />;
};

export default Repository;
