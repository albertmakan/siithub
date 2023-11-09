import { type FC } from "react";
import { useIssueContext } from "./IssueContext";
import moment from "moment";
import { useLabels } from "../labels/useLabels";
import { LabelPreview } from "../labels/LabelPreview";
import { CommentPreview } from "./CommentPreview";
import { type Comment } from "./issueActions";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { useMilestones } from "../milestones/useMilestones";
import { useAuthContext } from "../../core/contexts/Auth";
import { type User } from "../users/user.model";
import { useCollaborators } from "../collaborators/useCollaborators";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { type Repository } from "../repository/repository.service";
import Link from "next/link";
import { HashtagLink } from "../../core/components/HashtagLink";

const eventTypesToExclude = ["UserReactedEvent", "UserUnreactedEvent"];

export const IssueHistory: FC = () => {
  const { repository } = useRepositoryContext();
  const { owner, name, _id: repositoryId } = repository as Repository;

  const { issue } = useIssueContext();
  const { labels } = useLabels(issue.repositoryId);
  const { milestones } = useMilestones(issue.repositoryId);

  const { user } = useAuthContext();
  const { collaborators } = useCollaborators(repositoryId, "");

  const participants = {
    ...(issue.participants || {}),
    [user?._id ?? ""]: user as any as User,
    ...(collaborators?.reduce((acc: { [uid: string]: User }, c) => {
      acc[c.userId] = c.user;
      return acc;
    }, {}) ?? {}),
  };

  const EventText: FC<{ event: any }> = ({ event }) => {
    switch (event.type) {
      case "IssueCreatedEvent":
        return <>has opened this issue</>;
      case "IssueUpdatedEvent":
        return <>has updated this issue</>;
      case "LabelAssignedEvent": {
        const label = labels?.find((l) => l._id === event.labelId);
        if (!label) return <></>;
        return (
          <>
            added the <LabelPreview {...label} /> label
          </>
        );
      }
      case "LabelUnassignedEvent": {
        const label = labels?.find((l) => l._id === event.labelId);
        if (!label) return <></>;
        return (
          <>
            removed the <LabelPreview {...label} /> label
          </>
        );
      }
      case "MilestoneAssignedEvent": {
        const milestone = milestones?.find((m) => m._id === event.milestoneId);
        return (
          <>
            added the <Link href={`/r/${owner}/${name}/milestones/${milestone?.localId}`}>{milestone?.title}</Link>{" "}
            milestone
          </>
        );
      }
      case "MilestoneUnassignedEvent": {
        const milestone = milestones?.find((m) => m._id === event.milestoneId);
        return (
          <>
            removed the <Link href={`/r/${owner}/${name}/milestones/${milestone?.localId}`}>{milestone?.title}</Link>{" "}
            milestone
          </>
        );
      }
      case "UserAssignedEvent":
        const assigned = participants[event.userId];
        return (
          <>
            assigned <Link href={`/users/${assigned?.username}`}>{assigned?.name}</Link>
          </>
        );
      case "UserUnassignedEvent":
        const unassigned = participants[event.userId];
        return (
          <>
            removed <Link href={`/users/${unassigned?.username}`}>{unassigned?.name}</Link>
          </>
        );
      case "IssueReopenedEvent":
        return <>reopened this issue</>;
      case "IssueClosedEvent":
        return <>closed this issue</>;
      case "CommentCreatedEvent":
        return (
          <>
            has commented
            <CommentPreview comment={issue.csm.comments?.find((c) => c._id === event.commentId) as Comment} />
          </>
        );
      case "CommentUpdatedEvent": {
        const commentById = issue.events?.find(
          (e) => e.commentId === event.commentId && e.type === "CommentCreatedEvent"
        ).by;
        return <>edited comment from {participants[commentById].name}</>;
      }
      case "CommentHiddenEvent": {
        const commentById = issue.events?.find(
          (e) => e.commentId === event.commentId && e.type === "CommentCreatedEvent"
        ).by;
        return <>hid comment from {participants[commentById].name}</>;
      }
      case "CommentDeletedEvent": {
        const commentById = issue.events?.find(
          (e) => e.commentId === event.commentId && e.type === "CommentCreatedEvent"
        ).by;
        return <>deleted comment from {participants[commentById].name}</>;
      }
      case "IssueReferencedEvent":
        return (
          <>
            added a commit that referenced this issue{" "}
            <div className="text-sm ml-3">
              <HashtagLink href={`/r/${owner}/${name}/commit/${event.sha}`}>{event.message}</HashtagLink>
            </div>
          </>
        );
      default:
        return <></>;
    }
  };

  return (
    <ol className="relative border-l border-gray-200">
      {issue?.events
        .filter((e) => e._id && !eventTypesToExclude.includes(e.type))
        .map((event, i) => {
          const user = participants[event.by];
          return (
            <li key={i} className="mb-3 ml-6">
              <span className="absolute -left-5 mt-2">
                <ProfilePicture user={user} size={30} />
              </span>
              <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="grid grid-cols-12">
                  <div className="col-span-10 text-left ">
                    <b>{user.username}</b> <EventText event={event} />
                  </div>

                  <div className="col-span-2 text-right">
                    <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                      {moment(event.timeStamp).fromNow()}
                    </time>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
    </ol>
  );
};
