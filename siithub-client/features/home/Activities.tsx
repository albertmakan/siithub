import moment from "moment";
import Link from "next/link";
import { type FC, ReactElement, useState } from "react";
import { Button } from "../../core/components/Button";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { RepositoryCard } from "../repository/RepositoryCard";
import {
  type Activity,
  type StaringActivity,
  type NewCommentActivity,
  type NewIssueActivity,
  type NewPullRequestActivity,
} from "./activityActions";
import { useActivities } from "./useActivities";

type ActivitySharedWrapperProps = ActivityComponentProps & {
  children: ReactElement;
};

const ActivitySharedWrapper: FC<ActivitySharedWrapperProps> = ({ activity, children }) => {
  return (
    <li className="mb-5 ml-6">
      <span className="flex absolute -left-3 justify-center items-center bg-blue-200 rounded-full">
        <ProfilePicture user={activity} size={34} />
      </span>
      <div className="pl-2">
        <div className="grid grid-cols-12">
          <div className="col-span-10 text-left ">{children}</div>

          <div className="col-span-2 text-right">
            <time className="mb-1 text-xs font-normal text-gray-400 sm:order-last sm:mb-0">
              {moment(activity.timeStamp).fromNow()}
            </time>
          </div>
        </div>
      </div>
    </li>
  );
};

const StarredActivityComponent: FC<ActivityComponentProps> = ({ activity }) => {
  const starredActivity = activity as StaringActivity;
  return (
    <ActivitySharedWrapper activity={starredActivity}>
      <div>
        <Link className="text-blue-500 hover:underline" href={`/users/${activity.username}`}>
          {activity.username}
        </Link>{" "}
        has starred repo{" "}
        <Link
          className="text-blue-500 hover:underline"
          href={`/${starredActivity.repo.owner}/${starredActivity.repo.name}`}
        >
          {starredActivity.repo.owner}/{starredActivity.repo.name}
        </Link>
      </div>
    </ActivitySharedWrapper>
  );
};

const NewIssueActivityComponent: FC<ActivityComponentProps> = ({ activity }) => {
  const newIssueActivity = activity as NewIssueActivity;
  return (
    <ActivitySharedWrapper activity={newIssueActivity}>
      <div>
        <Link className="text-blue-500 hover:underline" href={`/users/${activity.username}`}>
          {activity.username}
        </Link>{" "}
        has created a new issue{" "}
        <Link
          className="text-blue-500 hover:underline"
          href={`/${activity.repo.owner}/${activity.repo.name}/issues/${newIssueActivity.localId}`}
        >
          {newIssueActivity.title}
        </Link>{" "}
        inside{" "}
        <Link className="text-blue-500 hover:underline" href={`/${activity.repo.owner}/${activity.repo.name}`}>
          {activity.repo.owner}/{activity.repo.name}
        </Link>
      </div>
    </ActivitySharedWrapper>
  );
};

const NewCommentActivityComponent: FC<ActivityComponentProps> = ({ activity }) => {
  const newCommentActivity = activity as NewCommentActivity;
  return (
    <ActivitySharedWrapper activity={newCommentActivity}>
      <div>
        <Link className="text-blue-500 hover:underline" href={`/users/${activity.username}`}>
          {activity.username}
        </Link>{" "}
        has posted a new comment on the{" "}
        <Link
          className="text-blue-500 hover:underline"
          href={`/${activity.repo.owner}/${activity.repo.name}/issues/${newCommentActivity.localId}`}
        >
          {newCommentActivity.title}
        </Link>{" "}
        inside{" "}
        <Link className="text-blue-500 hover:underline" href={`/${activity.repo.owner}/${activity.repo.name}`}>
          {activity.repo.owner}/{activity.repo.name}
        </Link>
      </div>
    </ActivitySharedWrapper>
  );
};

const NewPullRequestActivityComponent: FC<ActivityComponentProps> = ({ activity }) => {
  const newPullRequestActivity = activity as NewPullRequestActivity;
  return (
    <ActivitySharedWrapper activity={newPullRequestActivity}>
      <div>
        <Link className="text-blue-500 hover:underline" href={`/users/${activity.username}`}>
          {activity.username}
        </Link>{" "}
        has created a new pull request{" "}
        <Link
          className="text-blue-500 hover:underline"
          href={`/${activity.repo.owner}/${activity.repo.name}/pull-requests/${newPullRequestActivity.localId}`}
        >
          {newPullRequestActivity.title}
        </Link>{" "}
        inside{" "}
        <Link className="text-blue-500 hover:underline" href={`/${activity.repo.owner}/${activity.repo.name}`}>
          {activity.repo.owner}/{activity.repo.name}
        </Link>
      </div>
    </ActivitySharedWrapper>
  );
};

const ActivityComponents = {
  StaringActivity: StarredActivityComponent,
  NewIssueActivity: NewIssueActivityComponent,
  NewCommentActivity: NewCommentActivityComponent,
  NewPullRequestActivity: NewPullRequestActivityComponent,
};

type ActivityComponentProps = { activity: Activity };

const ActivityComponent: FC<ActivityComponentProps> = ({ activity }) => {
  const type = activity.type as keyof typeof ActivityComponents;
  const Component = ActivityComponents[type];

  if (!Component) return <></>;

  return (
    <>
      <Component activity={activity} />
      <RepositoryCard repository={activity.repo} />
    </>
  );
};

export const Activities: FC = () => {
  const [upTill, setUpTill] = useState(moment().startOf("M"));
  const { activities } = useActivities(upTill);

  const increaseUpTill = () => {
    setUpTill((upTill) => moment(upTill).add(-1, "M"));
  };

  return (
    <>
      <ol className="relative ml-10 mt-10">
        <div key={activities.length}>
          {activities.map((a, i) => (
            <div className="mb-5" key={i}>
              <ActivityComponent activity={a} />
            </div>
          ))}
        </div>
      </ol>

      <div className="flex justify-center">
        <Button onClick={increaseUpTill}>Load More</Button>
      </div>
    </>
  );
};
