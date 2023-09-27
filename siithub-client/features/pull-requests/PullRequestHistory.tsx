import { type FC, useMemo } from "react";
import { usePullRequestContext } from "./PullRequestContext";
import { type Commit, useCommitsBetweenBranches } from "../commits/useCommits";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { type Repository } from "../repository/repository.service";
import moment from "moment";
import { type PullRequestComment, type PullRequestConversation } from "./pullRequestActions";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { type User } from "../users/user.model";
import { useLabels } from "../labels/useLabels";
import { useMilestones } from "../milestones/useMilestones";
import { LabelPreview } from "../labels/LabelPreview";
import { CommentPreview } from "./CommentPreview";
import { ConversationCard } from "./Conversation";
import { useAuthContext } from "../../core/contexts/Auth";
import { HashtagLink } from "../../core/components/HashtagLink";
import { useCollaborators } from "../collaborators/useCollaborators";
import Link from "next/link";

const eventsToTake = [
  "LabelAssignedEvent",
  "LabelUnassignedEvent",
  "MilestoneAssignedEvent",
  "MilestoneUnassignedEvent",
  "UserAssignedEvent",
  "UserUnassignedEvent",
  "CommentCreatedEvent",
  "ConversationCreatedEvent",
  "PullRequestApprovedEvent",
  "PullRequestChangesRequiredEvent",
  "PullRequestMergedEvent",
  "PullRequestCanceledEvent",
];

export const PullRequestHistory: FC = () => {
  const { repository } = useRepositoryContext();
  const { owner, name, _id: repositoryId } = repository as Repository;

  const { pullRequest } = usePullRequestContext();
  const { labels } = useLabels(pullRequest.repositoryId);
  const { milestones } = useMilestones(pullRequest.repositoryId);

  const { user } = useAuthContext();
  const { collaborators } = useCollaborators(repositoryId, "");

  const participants = {
    ...(pullRequest.participants || {}),
    [user?._id ?? ""]: user as any as User,
    ...(collaborators?.reduce((acc: { [uid: string]: User }, c) => {
      acc[c.userId] = c.user;
      return acc;
    }, {}) ?? {}),
  };

  const { commits } = useCommitsBetweenBranches(repositoryId, pullRequest.csm.base, pullRequest.csm.compare);

  const events = useMemo(() => pullRequest?.events.filter((e) => eventsToTake.includes(e.type)), [pullRequest?.events]);

  const entities = [
    ...(events || [])
      .filter(
        (e) =>
          (e.type !== "CommentCreatedEvent" || !e.conversation) &&
          (e.type !== "ConversationCreatedEvent" ||
            events?.some((ev) => e.topic === ev.conversation && ev.type === "CommentCreatedEvent"))
      )
      .map((e) => ({
        timeStamp: e.timeStamp,
        type: "Event",
        entity: e,
      })),
    ...(commits || []).map((c) => ({
      timeStamp: c.date,
      type: "Commit",
      entity: c,
    })),
  ].sort((e1, e2) => moment(e1.timeStamp).unix() - moment(e2.timeStamp).unix());

  const EventText: FC<{ event: any }> = ({ event }) => {
    switch (event.type) {
      case "LabelAssignedEvent": {
        const label = labels?.find((l) => l._id === event.labelId);
        if (!label) return <></>;
        return (
          <>
            added the <LabelPreview {...label} />
          </>
        );
      }
      case "LabelUnassignedEvent": {
        const label = labels?.find((l) => l._id === event.labelId);
        if (!label) return <></>;
        return (
          <>
            added the <LabelPreview {...label} />
          </>
        );
      }
      case "MilestoneAssignedEvent": {
        const milestone = milestones?.find((m) => m._id === event.milestoneId);
        return (
          <>
            added the <Link href={`/${owner}/${name}/milestones/${milestone?.localId}`}>{milestone?.title}</Link>{" "}
            milestone
          </>
        );
      }
      case "MilestoneUnassignedEvent": {
        const milestone = milestones?.find((m) => m._id === event.milestoneId);
        return (
          <>
            removed the <Link href={`/${owner}/${name}/milestones/${milestone?.localId}`}>{milestone?.title}</Link>{" "}
            milestone
          </>
        );
      }
      case "UserAssignedEvent": {
        const assigned = participants[event.userId];
        return participants[event.by]?._id === assigned?._id ? (
          <>
            <Link href={`/users/${assigned?.username}`}>self-assigned</Link>
          </>
        ) : (
          <>
            assigned <Link href={`/users/${assigned?.username}`}>{assigned?.name}</Link>
          </>
        );
      }
      case "UserUnassignedEvent": {
        const unassigned = participants[event.userId];
        return participants[event.by]?._id === unassigned?._id ? (
          <>
            <Link href={`/users/${unassigned?.username}`}>self-unassigned</Link>
          </>
        ) : (
          <>
            unassigned <Link href={`/users/${unassigned?.username}`}>{unassigned?.name}</Link>
          </>
        );
      }
      case "CommentCreatedEvent": {
        const comment = pullRequest.csm.comments?.find((c) => c._id === event.commentId);
        return (
          <>
            has commented
            <CommentPreview comment={comment as PullRequestComment} />
          </>
        );
      }
      case "ConversationCreatedEvent": {
        const conversation = pullRequest.csm.conversations?.find((c) => c.topic === event.topic);
        return (
          <>
            has opened a new conversation
            <ConversationCard conversation={conversation as PullRequestConversation} />
          </>
        );
      }
      case "PullRequestApprovedEvent":
        return <>has approved this pull request</>;
      case "PullRequestChangesRequiredEvent":
        return <>has requested changes for this pull request</>;
      case "PullRequestMergedEvent":
        return <>has merged and closed this pull request</>;
      case "PullRequestCanceledEvent":
        return <>has canceled and closed this pull request</>;
      default:
        return <></>;
    }
  };

  const CommitRow: FC<{ commit: Commit }> = ({ commit }) => (
    <>
      commited <HashtagLink href={`/${owner}/${name}/commit/${commit.sha}`}>{commit.message}</HashtagLink>
    </>
  );

  return (
    <ol className="relative border-l border-gray-200">
      {entities?.map((e, i) => {
        const username =
          e.type === "Commit" ? (e.entity as Commit).author.username : participants[e.entity.by]?.username;
        return (
          <li key={i} className="mb-10 ml-6">
            <span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-blue-200 rounded-full ring-8 ring-white">
              <ProfilePicture username={username ?? ""} size={40} />
            </span>
            <div className="pb-2">
              <div className="grid grid-cols-12">
                <div className="col-span-10 text-left ">
                  {username}{" "}
                  {e.type === "Commit" ? <CommitRow commit={e.entity as Commit} /> : <EventText event={e.entity} />}
                </div>

                <div className="col-span-2 text-right">
                  <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
                    {moment(e.timeStamp).fromNow()}
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
