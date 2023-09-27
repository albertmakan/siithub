import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { useCommitsBetweenBranches } from "../commits/useCommits";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { usePullRequestContext } from "./PullRequestContext";
import { CommitsHistory } from "../commits/CommitsTable";

export const PullRequestCommitsPage: FC = () => {
  const { pullRequest } = usePullRequestContext();
  const { repository } = useRepositoryContext();
  const { owner, name, _id } = repository as Repository;

  const { commits } = useCommitsBetweenBranches(_id, pullRequest.csm.base, pullRequest.csm.compare, [
    pullRequest.csm.base,
    pullRequest.csm.compare,
  ]);

  return <>{commits?.length ? <CommitsHistory username={owner} repoName={name} commits={commits} /> : <></>}</>;
};
