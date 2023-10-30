import { useCallback, type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { PullRequestState, type PullRequest } from "./pullRequestActions";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { useRouter } from "next/router";
import { useLabels } from "../labels/useLabels";
import { LabelPreview } from "../labels/LabelPreview";
import { findLastEvent } from "../common/utils";
import moment from "moment";
import { PRIcon } from "./PRIcon";
import { HashtagLink } from "../../core/components/HashtagLink";

const AdditionalText = ({ pullRequest }: { pullRequest: PullRequest }) => {
  const prCreated = findLastEvent(pullRequest.events, (e: any) => e.type === "PullRequestCreatedEvent");
  const prClosed = findLastEvent(pullRequest.events, (e: any) =>
    ["PullRequestCanceledEvent", "PullRequestMergedEvent"].includes(e.type)
  );

  return pullRequest.csm.isClosed ? (
    <>
      #P{pullRequest.localId} opened {moment(prCreated?.timeStamp).fromNow()} by{" "}
      {pullRequest.participants[prCreated?.by]?.username}
    </>
  ) : (
    <>
      #P{pullRequest.localId} by {pullRequest.participants[prClosed?.by]?.username} was{" "}
      {pullRequest.csm.state === PullRequestState.Merged ? "merged" : "canceled"}{" "}
      {moment(prCreated?.timeStamp).fromNow()}
    </>
  );
};

export const PullRequestsTable: FC<{ pullRequests: PullRequest[] }> = ({ pullRequests }) => {
  const { repository } = useRepositoryContext();
  const { owner, name, _id: repositoryId } = repository as Repository;

  const { labels } = useLabels(repositoryId);

  const router = useRouter();
  const navigateToPullRequestEdit = (localId: number) => router.push(`/r/${owner}/${name}/pull-requests/${localId}`);

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <tbody>
          {pullRequests?.map((pullRequest) => (
            <tr key={pullRequest._id} className="bg-white border-b">
              <td className="py-4 px-6">
                <div className="cursor-pointer" onClick={() => navigateToPullRequestEdit(pullRequest.localId)}>
                  <div className="flex">
                    <span className="mr-2 mt-2">
                      <PRIcon pullRequest={pullRequest} />
                    </span>
                    <span className="text-xl mr-2">
                      <HashtagLink>{pullRequest.csm.title}</HashtagLink>
                    </span>
                    <span>
                      {pullRequest.csm.labels?.map((lId) => {
                        const label = labels?.find((l) => l._id === lId);
                        return label ? <LabelPreview key={label._id} {...label} /> : <></>;
                      })}
                    </span>
                  </div>
                  <div className="ml-6">
                    <AdditionalText pullRequest={pullRequest} />
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
