import { type FC, useEffect } from "react";
import { type Repository } from "../repository/repository.service";
import { DefinePullRequestForm } from "./DefinePullRequestForm";
import { initialPullRequest, setPullRequest, usePullRequestContext } from "./PullRequestContext";
import { useCommitsBetweenBranches, useCommitsDiffBetweenBranches } from "../commits/useCommits";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { CommitsHistory } from "../commits/CommitsTable";
import { CommitDiffViewer } from "../commits/CommitDiff";

export const NewPullRequestPage: FC = () => {
  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();

  const { repository } = useRepositoryContext();
  const { owner, name, _id: repositoryId } = repository as Repository;

  useEffect(() => {
    pullRequestDispatcher(setPullRequest({ ...initialPullRequest, repositoryId }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repositoryId]);

  const { commits, isLoading } = useCommitsBetweenBranches(
    repositoryId,
    pullRequest.csm.base,
    pullRequest.csm.compare,
    [pullRequest.csm.base, pullRequest.csm.compare]
  );

  const { commit } = useCommitsDiffBetweenBranches(repositoryId, pullRequest.csm.base, pullRequest.csm.compare, [
    pullRequest.csm.base,
    pullRequest.csm.compare,
  ]);

  return (
    <div className="">
      <div className="mb-5">
        <DefinePullRequestForm />
      </div>
      {!isLoading && commits && !commits?.length && (
        <div className="text-center text-3xl">There isn`t anything to compare.</div>
      )}

      {commits?.length ? <CommitsHistory username={owner} repoName={name} commits={commits} /> : <></>}
      {commit?.diff?.length ? <CommitDiffViewer commit={commit} /> : <></>}
    </div>
  );
};
