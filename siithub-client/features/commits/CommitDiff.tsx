import { useMemo, type FC } from "react";
import NotFound from "../../core/components/NotFound";
import { type CommitWithDiff, useCommit } from "./useCommits";
import ReactDiffViewer from "react-diff-viewer-continued";
import { truncate } from "../../core/utils/string";
import Link from "next/link";
import { Spinner } from "../../core/components/Spinner";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import moment from "moment";
import { Repository } from "../repository/repository.service";

type CommitDiffViewerProps = {
  commit: CommitWithDiff;
};

export const CommitDiffViewer: FC<CommitDiffViewerProps> = ({ commit }) => {
  const additions = useMemo(
    () => commit.diff.reduce((acc, val) => acc + (val?.stats?.total_additions || 0), 0),
    [commit]
  );
  const deletions = useMemo(
    () => commit.diff.reduce((acc, val) => acc + (val?.stats?.total_deletions || 0), 0),
    [commit]
  );

  return (
    <>
      <div className="m-2">
        Showing <span className="font-bold">{commit.diff.length}</span> changed files with{" "}
        <span className="text-green-500 font-bold">{additions}</span> additions and{" "}
        <span className="text-red-500 font-bold">{deletions}</span> deletions.
      </div>
      {commit.diff.map((diff, i) => {
        return (
          <div
            key={i + truncate(diff?.old?.content ?? "", 5) + truncate(diff?.new?.content ?? "", 5)}
            className="w-full overflow-x-scroll mt-2"
          >
            <a id={`${i}`} />
            <ReactDiffViewer
              styles={{
                diffContainer: {},
              }}
              leftTitle={
                <Link href={`#${i}`} className="hover:text-blue-400 hover:underline text-sm">
                  {diff?.old?.path}
                </Link>
              }
              rightTitle={
                <Link href={`#${i}`} className="hover:text-blue-400 hover:underline text-sm">
                  {diff?.new?.path}
                </Link>
              }
              oldValue={diff?.old?.content}
              newValue={diff?.new?.content}
              splitView={true}
            />
            {diff?.large && <div className="w-full text-center p-3">Large diffs are not rendered by default</div>}
          </div>
        );
      })}
    </>
  );
};

export const CommitDiff: FC<{ sha: string }> = ({ sha }) => {
  const { repository } = useRepositoryContext();
  const { _id, owner, name } = repository as Repository;

  const { commit, error, isLoading } = useCommit(_id, sha);

  if (error) return <NotFound />;

  if (isLoading) return <Spinner size={20} />;

  return (
    <>
      <div className="rounded-lg mb-3 border-2 p-3">
        <button className="float-right m-2 p-2 border rounded-lg">
          <Link href={`/r/${owner}/${name}/tree/${commit.sha}`}>Browse files</Link>
        </button>
        <h2>{commit.message || "?"}</h2>
        <span className="flex text-sm mt-2">
          {commit.author?.username ? (
            <>
              <ProfilePicture user={commit.author} size={20} />
              <span className="mx-2">{commit.author.username}</span>
            </>
          ) : (
            <span className="mx-2">{commit.author?.name}</span>
          )}
          committed on {moment.unix(commit.date).format("MMM D, YYYY")}
        </span>
      </div>
      <CommitDiffViewer commit={commit} />
    </>
  );
};
