import type { AggregateRoot, BaseEvent } from "../../../db/base.repo.utils";
import type { Label } from "../../label/label.model";
import type { Milestone } from "../../milestone/milestone.model";
import type { User } from "../../user/user.model";
import type {
  Comment,
  CommentCreatedEvent,
  CommentDeletedEvent,
  CommentHiddenEvent,
  CommentUpdatedEvent,
  LabelAssignedEvent,
  LabelUnassignedEvent,
  MilestoneAssignedEvent,
  MilestoneUnassignedEvent,
  UserAssignedEvent,
  UserReactedEvent,
  UserUnassignedEvent,
  UserUnreactedEvent,
} from "./events.model";
import { CommentState } from "./events.model";
import { BadLogicException } from "../../../error-handling/errors";
import { canCommentBeModified, compareIds, findComment, findLastEvent } from "./utils";
import { ObjectId } from "mongodb";
import { logger } from "../../../utils/aws/logger";

type Lableable = AggregateRoot<{ labels?: Label["_id"][] }>;

function labelAssignedEventHandler({ csm, events }: Lableable, event: BaseEvent) {
  const labelAssigned = event as LabelAssignedEvent;
  const lastLabelEvent = findLastEvent<LabelAssignedEvent | LabelUnassignedEvent>(events, (e) =>
    compareIds(e?.labelId, labelAssigned?.labelId)
  );
  if (lastLabelEvent?.type === "LabelAssignedEvent") {
    logger.warn("Label is already assigned to the Issue", { issueId: event.streamId, labelId: labelAssigned.labelId });
    throw new BadLogicException("Label is already assigned to the Issue.", event);
  }

  csm.labels?.push(labelAssigned?.labelId);
}

function labelUnassignedEventHandler({ csm, events }: Lableable, event: BaseEvent) {
  const labelUnassigned = event as LabelUnassignedEvent;
  const lastLabelEvent = findLastEvent<LabelAssignedEvent | LabelUnassignedEvent>(events, (e) =>
    compareIds(e?.labelId, labelUnassigned?.labelId)
  );
  if (!lastLabelEvent || lastLabelEvent?.type === "LabelUnassignedEvent") {
    logger.warn("Label cannot be unassigned from the Issue", {
      issueId: event.streamId,
      labelId: labelUnassigned.labelId,
    });
    throw new BadLogicException("Label cannot be unassigned from the Issue.", event);
  }

  csm.labels = csm?.labels?.filter(
    (l) => l !== labelUnassigned?.labelId && l.toString() !== labelUnassigned?.labelId?.toString()
  );
}

type Checkpointable = AggregateRoot<{ milestones?: Milestone["_id"][] }>;

function milestoneAssignedEventHandler({ csm, events }: Checkpointable, event: BaseEvent) {
  const milestoneAssigned = event as MilestoneAssignedEvent;
  const lastMilestoneEvent = findLastEvent<MilestoneAssignedEvent | MilestoneUnassignedEvent>(events, (e) =>
    compareIds(e?.milestoneId, milestoneAssigned?.milestoneId)
  );
  if (lastMilestoneEvent?.type === "MilestoneAssignedEvent") {
    logger.warn("Milestone is already assigned to the Issue", {
      issueId: event.streamId,
      milestoneId: milestoneAssigned.milestoneId,
    });
    throw new BadLogicException("Milestone is already assigned to the Issue.", event);
  }

  csm.milestones?.push(milestoneAssigned?.milestoneId);
}

function milestoneUnassignedEventHandler({ csm, events }: Checkpointable, event: BaseEvent) {
  const milestoneUnassigned = event as MilestoneUnassignedEvent;
  const lastMilestoneEvent = findLastEvent<MilestoneAssignedEvent | MilestoneUnassignedEvent>(events, (e) =>
    compareIds(e?.milestoneId, milestoneUnassigned?.milestoneId)
  );
  if (!lastMilestoneEvent || lastMilestoneEvent?.type === "MilestoneUnassignedEvent") {
    logger.warn("Milestone cannot be unassigned from the Issue", {
      issueId: event.streamId,
      milestoneId: milestoneUnassigned.milestoneId,
    });
    throw new BadLogicException("Milestone cannot be unassigned from the Issue.", event);
  }

  csm.milestones = csm?.milestones?.filter(
    (m) => m !== milestoneUnassigned?.milestoneId && m.toString() !== milestoneUnassigned?.milestoneId?.toString()
  );
}

type Assignable = AggregateRoot<{ assignees?: User["_id"][] }>;

function userAssignedEventHandler({ csm, events }: Assignable, event: BaseEvent) {
  const userAssigned = event as UserAssignedEvent;
  const lastUserEvent = findLastEvent<UserAssignedEvent | UserUnassignedEvent>(events, (e) =>
    compareIds(e?.userId, userAssigned?.userId)
  );
  if (lastUserEvent?.type === "UserAssignedEvent") {
    logger.warn("User is already assigned to the Issue", { issueId: event.streamId, userId: userAssigned.userId });
    throw new BadLogicException("User is already assigned to the Issue.", event);
  }

  csm.assignees?.push(userAssigned?.userId);
}

function userUnassignedEventHandler({ csm, events }: Assignable, event: BaseEvent) {
  const userUnassigned = event as UserUnassignedEvent;
  const lastUserEvent = findLastEvent<UserAssignedEvent | UserUnassignedEvent>(events, (e) =>
    compareIds(e?.userId, userUnassigned?.userId)
  );
  if (!lastUserEvent || lastUserEvent?.type === "UserUnassignedEvent") {
    logger.warn("User cannot be unassigned from the Issue", { issueId: event.streamId, userId: userUnassigned.userId });
    throw new BadLogicException("User cannot be unassigned from the Issue.", event);
  }

  csm.assignees = csm?.assignees?.filter(
    (u) => u !== userUnassigned?.userId && u.toString() !== userUnassigned?.userId?.toString()
  );
}

type Commentable = AggregateRoot<{ comments?: Comment[] }>;

function commentCreatedEventHandler({ csm, events }: Commentable, event: BaseEvent) {
  const commentCreated = event as CommentCreatedEvent;
  commentCreated.commentId = new ObjectId();

  csm.comments?.push({
    _id: commentCreated.commentId,
    text: commentCreated.text,
    state: CommentState.Existing,
    reactions: {},
  });
}

function commentUpdatedEventHandler({ csm, events }: Commentable, event: BaseEvent) {
  const commentUpdated = event as CommentUpdatedEvent;

  if (!canCommentBeModified({ events }, commentUpdated.commentId)) {
    logger.warn("Comment cannot be updated", { issueId: event.streamId, commentId: commentUpdated.commentId });
    throw new BadLogicException("Comment cannot be updated.", event);
  }

  const commentToBeUpdated = findComment({ csm }, commentUpdated.commentId);
  commentToBeUpdated.text = commentUpdated.text;
}

function commentHiddenEventHandler({ csm, events }: Commentable, event: BaseEvent) {
  const commentHidden = event as CommentHiddenEvent;

  if (!canCommentBeModified({ events }, commentHidden.commentId)) {
    logger.warn("Comment cannot be hidden", { issueId: event.streamId, commentId: commentHidden.commentId });
    throw new BadLogicException("Comment cannot be hidden.", event);
  }

  const commentToBeHidden = findComment({ csm }, commentHidden.commentId);
  commentToBeHidden.state = CommentState.Hidden;
}

function commentDeletedEventHandler({ csm, events }: Commentable, event: BaseEvent) {
  const commentDeleted = event as CommentDeletedEvent;
  if (!canCommentBeModified({ events }, commentDeleted.commentId)) {
    logger.warn("Comment cannot be deleted", { issueId: event.streamId, commentId: commentDeleted.commentId });
    throw new BadLogicException("Comment cannot be deleted.", event);
  }

  const commentToBeDeleted = findComment({ csm }, commentDeleted.commentId);
  commentToBeDeleted.state = CommentState.Deleted;
}

type Reactable = AggregateRoot<{ comments?: { reactions: any }[] }>;

function userReactedEventHandler({ csm, events }: Reactable, event: BaseEvent) {
  const userReacted = event as UserReactedEvent;
  const lastReactionEvent = findLastEvent<UserReactedEvent | UserUnreactedEvent>(
    events,
    (e) =>
      compareIds(e?.commentId, userReacted?.commentId) &&
      compareIds(e?.by, userReacted?.by) &&
      e?.code === userReacted?.code
  );

  if (lastReactionEvent?.type === "UserReactedEvent") {
    logger.warn("Reaction cannot be added", { issueId: event.streamId, commentId: userReacted.commentId });
    throw new BadLogicException("Reaction cannot be added.", event);
  }

  const comment = findComment({ csm }, userReacted.commentId);
  if (!comment || comment.state !== CommentState.Existing) {
    logger.warn("Reaction cannot be added because comment does not exist", {
      issueId: event.streamId,
      commentId: userReacted.commentId,
    });
    throw new BadLogicException("Reaction cannot be added because comment does not exist.", event);
  }

  comment.reactions[userReacted.code] = comment.reactions[userReacted.code] + 1 || 1;
}

function userUnreactedEventHandler({ csm, events }: Reactable, event: BaseEvent) {
  const userUnreacted = event as UserUnreactedEvent;
  const lastReactionEvent = findLastEvent<UserReactedEvent | UserUnreactedEvent>(
    events,
    (e) =>
      compareIds(e?.commentId, userUnreacted?.commentId) &&
      compareIds(e?.by, userUnreacted?.by) &&
      e?.code === userUnreacted?.code
  );

  if (!lastReactionEvent || lastReactionEvent?.type === "UserUnreactedEvent") {
    logger.warn("Reaction cannot be removed", { issueId: event.streamId, commentId: userUnreacted.commentId });
    throw new BadLogicException("Reaction cannot be removed.", event);
  }

  const comment = findComment({ csm }, userUnreacted.commentId);
  if (comment.state !== CommentState.Existing) {
    logger.warn("Reaction cannot be removed because comment does not exist", {
      issueId: event.streamId,
      commentId: userUnreacted.commentId,
    });
    throw new BadLogicException("Reaction cannot be removed because comment does not exist.");
  }

  comment.reactions[userUnreacted.code] = comment.reactions[userUnreacted.code] - 1;

  if (comment.reactions[userUnreacted.code] === 0) {
    delete comment.reactions[userUnreacted.code];
  }
}

export {
  labelAssignedEventHandler,
  labelUnassignedEventHandler,
  milestoneAssignedEventHandler,
  milestoneUnassignedEventHandler,
  userAssignedEventHandler,
  userUnassignedEventHandler,
  commentCreatedEventHandler,
  commentUpdatedEventHandler,
  commentHiddenEventHandler,
  commentDeletedEventHandler,
  userReactedEventHandler,
  userUnreactedEventHandler,
};
