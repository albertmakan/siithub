import { collaboratorsService } from "../collaborators/collaborators.service";
import { repositoryService } from "../repository/repository.service";
import { issueService } from "../issue/issue.service";
import { starService } from "../star/star.service";
import { userService } from "../user/user.service";
import { type IssueCreatedEvent } from "../issue/issue.model";
import { type Repository } from "../repository/repository.model";
import { type User } from "../user/user.model";
import {
  type NewPullRequestActivity,
  type NewCommentActivity,
  type NewIssueActivity,
  type StaringActivity,
  type Activity,
} from "./activities.models";
import { type CommentCreatedEvent } from "../common/events/events.model";
import { pullRequestService } from "../pull-requests/pull-requests.service";
import { type PullRequestCreatedEvent } from "../pull-requests/pull-requests.model";

async function findActivities(userId: User["_id"], upTill?: Date): Promise<any> {
  const repositories = await getRelevantRepos(userId);
  const activities = await Promise.all([
    getStaringActivities(repositories, userId, upTill),
    getNewIssueActivities(repositories, userId, upTill),
    getNewCommentActivities(repositories, userId, upTill),
    getNewPullRequestActivities(repositories, userId, upTill),
  ]).then(([staring, newIssues, newComments, newPullRequests]) =>
    [...staring, ...newIssues, ...newComments, ...newPullRequests].sort(
      (a1, a2) => +new Date(a2.timeStamp) - +new Date(a1.timeStamp)
    )
  );
  return { activities: await connectWithUsers(activities) };
}

async function getRelevantRepos(userId: User["_id"]): Promise<Repository[]> {
  const collaborations = await collaboratorsService.findByUser(userId);
  const repoIds = collaborations.map((collaboration) => collaboration.repositoryId);
  return await repositoryService.findByIds(repoIds);
}

async function getStaringActivities(
  repos: Repository[],
  userId: User["_id"],
  upTill?: Date
): Promise<StaringActivity[]> {
  const repoIds = repos.map((repo) => repo._id);
  const repositoriesMap = getRepoMap(repos);

  const stars = await starService.findByRepoIds(repoIds, {
    userId: { $ne: userId },
    ...(upTill ? { date: { $gte: upTill } } : {}),
  });

  return stars.map((star) => {
    const repo = repositoriesMap[star.repoId.toString()];
    return {
      userId: star.userId,
      username: "",
      repo,
      timeStamp: star.date,
      type: "StaringActivity",
    };
  });
}

async function getNewIssueActivities(
  repos: Repository[],
  userId: User["_id"],
  upTill?: Date
): Promise<NewIssueActivity[]> {
  const repoIds = repos.map((repo) => repo._id);
  const repositoriesMap = getRepoMap(repos);

  const newIssues = await issueService.findMany(
    {
      repositoryId: { $in: repoIds },
      events: {
        $elemMatch: {
          type: "IssueCreatedEvent",
          by: { $ne: userId },
          ...(upTill ? { timeStamp: { $gte: upTill } } : {}),
        },
      },
    },
    { projection: { _id: 1, localId: 1, repositoryId: 1, "events.$": 1 } }
  );

  return newIssues.map((issue) => {
    const issueCreated = issue.events[0] as IssueCreatedEvent;
    const repo = repositoriesMap[issue.repositoryId.toString()];
    return {
      issueId: issue._id,
      localId: issue.localId,
      userId: issueCreated.by,
      username: "",
      repo,
      title: issueCreated.title,
      timeStamp: issueCreated.timeStamp,
      type: "NewIssueActivity",
    };
  });
}

async function getNewCommentActivities(
  repos: Repository[],
  userId: User["_id"],
  upTill?: Date
): Promise<NewCommentActivity[]> {
  const repoIds = repos.map((repo) => repo._id);
  const repositoriesMap = getRepoMap(repos);

  const newComments = await issueService.findMany(
    {
      repositoryId: { $in: repoIds },
      $and: [
        {
          events: {
            $elemMatch: {
              type: "CommentCreatedEvent",
              by: { $ne: userId },
              ...(upTill ? { timeStamp: { $gte: upTill } } : {}),
            },
          },
        },
        {
          events: {
            $elemMatch: {
              type: "IssueCreatedEvent",
              by: userId,
            },
          },
        },
      ],
    },
    {
      projection: {
        _id: 1,
        localId: 1,
        repositoryId: 1,
        "csm.title": 1,
        events: { $elemMatch: { type: "CommentCreatedEvent", by: { $ne: userId } } },
      },
    }
  );

  return newComments.flatMap((issue) =>
    issue.events.map((event) => {
      const issueCommented = event as CommentCreatedEvent;
      const repo = repositoriesMap[issue.repositoryId.toString()];
      return {
        issueId: issue._id,
        localId: issue.localId,
        userId: issueCommented.by,
        username: "",
        repo,
        title: issue.csm.title || "",
        text: issueCommented.text,
        timeStamp: issueCommented.timeStamp,
        type: "NewCommentActivity",
      };
    })
  );
}

async function getNewPullRequestActivities(
  repos: Repository[],
  userId: User["_id"],
  upTill?: Date
): Promise<NewPullRequestActivity[]> {
  const repoIds = repos.map((repo) => repo._id);
  const repositoriesMap = getRepoMap(repos);

  const newPullRequests = await pullRequestService.findMany(
    {
      repositoryId: { $in: repoIds },
      events: {
        $elemMatch: {
          type: "PullRequestCreatedEvent",
          by: { $ne: userId },
          ...(upTill ? { timeStamp: { $gte: upTill } } : {}),
        },
      },
    },
    { projection: { _id: 1, localId: 1, repositoryId: 1, "events.$": 1 } }
  );

  return newPullRequests.map((pullRequest) => {
    const pullRequestCreated = pullRequest.events[0] as PullRequestCreatedEvent;
    const repo = repositoriesMap[pullRequest.repositoryId.toString()];
    return {
      pullRequestId: pullRequest._id,
      localId: pullRequest.localId,
      userId: pullRequestCreated.by,
      username: "",
      repo,
      title: pullRequestCreated.title,
      timeStamp: pullRequestCreated.timeStamp,
      type: "NewPullRequestActivity",
    };
  });
}

async function connectWithUsers(activities: Activity[]): Promise<Activity[]> {
  const userIds = activities.map((activity) => activity.userId);
  const users = await userService.findManyByIds(userIds);
  const usersMap = getUserMap(users);
  activities.forEach((a) => {
    const user = usersMap[a.userId.toString()];
    a.username = user?.username;
    a.pictures = user?.pictures;
  });
  return activities;
}

function getRepoMap(repos: Repository[]) {
  return repos.reduce((acc: Record<string, Repository>, repo) => {
    acc[repo._id.toString()] = repo;
    return acc;
  }, {});
}

function getUserMap(users: User[]) {
  return users.reduce((acc: Record<string, User>, user) => {
    acc[user._id.toString()] = user;
    return acc;
  }, {});
}

export type ActivitiesService = {
  findActivities(userId: User["_id"], upTill?: Date): Promise<any>;
  connectWithUsers(activities: Activity[]): Promise<Activity[]>;
  getRelevantRepos(userId: User["_id"]): Promise<Repository[]>;
  getStaringActivities(repos: Repository[], userId: User["_id"], upTill?: Date): Promise<StaringActivity[]>;
  getNewIssueActivities(repos: Repository[], userId: User["_id"], upTill?: Date): Promise<NewIssueActivity[]>;
  getNewCommentActivities(repos: Repository[], userId: User["_id"], upTill?: Date): Promise<NewCommentActivity[]>;
  getNewPullRequestActivities(
    repos: Repository[],
    userId: User["_id"],
    upTill?: Date
  ): Promise<NewPullRequestActivity[]>;
};

const activitiesService: ActivitiesService = {
  findActivities,
  connectWithUsers,
  getRelevantRepos,
  getStaringActivities,
  getNewIssueActivities,
  getNewCommentActivities,
  getNewPullRequestActivities,
};

export { activitiesService };
