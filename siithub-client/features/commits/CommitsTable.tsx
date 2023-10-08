import moment from "moment";
import { Fragment, type FC } from "react";
import NotFound from "../../core/components/NotFound";
import { Spinner } from "../../core/components/Spinner";
import { type Commit, useCommits } from "./useCommits";
import { BranchesMenu } from "../branches/BranchesMenu";
import { FilePath } from "../file/FilePath";
import { CommitCard } from "./CommitCard";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { Repository } from "../repository/repository.service";

type CommitsHistoryProps = {
  username: string;
  repoName: string;
  commits: Commit[];
};

export const CommitsHistory: FC<CommitsHistoryProps> = ({ username, repoName, commits }) => {
  let currentDate = "";

  return (
    <>
      {commits?.map((commit) => {
        const date = moment.unix(commit.date).format("MMM D, YYYY");

        const isNewDate = date !== currentDate;
        if (isNewDate) currentDate = date;
        return (
          <Fragment key={commit.sha}>
            {isNewDate && (
              <div className="p-3 font-semibold">{`Commits on ${moment.unix(commit.date).format("MMM D, YYYY")}`}</div>
            )}
            <CommitCard commit={commit} username={username} repoName={repoName} />
          </Fragment>
        );
      })}
    </>
  );
};

type CommitsTableProps = {
  branch: string;
  filePath?: string;
};

export const CommitsTable: FC<CommitsTableProps> = ({ branch, filePath }) => {
  const { repository } = useRepositoryContext();
  const { owner, name, _id } = repository as Repository;
  const { commits, error, isLoading } = useCommits(_id, branch, filePath ?? "");

  if (error) return <NotFound />;

  return (
    <>
      <div className="overflow-x-auto relative sm:rounded-lg">
        <div className="mb-3 flex">
          {filePath ? (
            <p className="text-lg items-center">
              History for{" "}
              <FilePath username={owner} repoName={name} branch={branch} filePath={filePath} forCommits={true} />
            </p>
          ) : (
            <BranchesMenu />
          )}
        </div>
        <div className="">
          {isLoading ? (
            <div className="bg-white border-2 border-gray-200 text-md">
              <div className="flex min-h-full items-center justify-center">
                <Spinner size={20} />
              </div>
            </div>
          ) : (
            <CommitsHistory username={owner} repoName={name} commits={commits} />
          )}
        </div>
      </div>
    </>
  );
};
