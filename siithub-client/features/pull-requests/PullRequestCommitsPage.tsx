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

  const base = pullRequest.csm.baseSHA || pullRequest.csm.base;
  const compare = pullRequest.csm.compareSHA || pullRequest.csm.compare;
  const { commits } = useCommitsBetweenBranches(_id, base, compare, [base, compare]);

  if (!commits?.length) return <></>;

  return (
    <>
      <h2>
        {commits.length} commit{commits.length !== 1 && "s"}
      </h2>
      <CommitsHistory username={owner} repoName={name} commits={commits} />
    </>
  );
};
