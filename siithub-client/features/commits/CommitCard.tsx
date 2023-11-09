import { CodeBracketIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import Link from "next/link";
import { type FC } from "react";
import { HashtagLink } from "../../core/components/HashtagLink";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { truncate } from "../../core/utils/string";
import { type Commit } from "./useCommits";

type CommitCardProps = { commit: Commit; username: string; repoName: string; isFirst: boolean };

export const CommitCard: FC<CommitCardProps> = ({ commit, username, repoName, isFirst }) => {
  return (
    <div
      className={"flex items-center bg-white border-b-2 border-x-2 text-md rounded-lg " + (isFirst ? "border-t-2" : "")}
    >
      <div className="w-5/6 p-2">
        <div className="hover:text-blue-400 hover:underline mb-1">
          <HashtagLink href={`/r/${username}/${repoName}/commit/${commit.sha}`}>
            {truncate(commit.message, 100)}
          </HashtagLink>
        </div>
        <span className="flex text-sm">
          {commit.author.username ? (
            <>
              <ProfilePicture user={commit.author} size={20} />{" "}
              <span className="mr-2 ml-2">{commit.author.username}</span>
            </>
          ) : (
            <span className="mr-2 ml-2">{commit.author.name}</span>
          )}
          committed {moment.unix(commit.date).fromNow()}
        </span>
      </div>
      <div className="w-1/12 text-blue-400 text-sm p-2">
        <Link href={`/r/${username}/${repoName}/commit/${commit.sha}`}>{commit.sha.substring(0, 6)}</Link>
      </div>
      <div className="w-1/12 text-gray-400 p-2">
        <button className="mt-2">
          <Link href={`/r/${username}/${repoName}/tree/${commit.sha}`}>
            <CodeBracketIcon className="h-5 w-5" />
          </Link>
        </button>
      </div>
    </div>
  );
};
