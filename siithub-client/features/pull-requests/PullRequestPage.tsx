import { type FC } from "react";
import { DefinePullRequestForm } from "./DefinePullRequestForm";
import { LabelsForm } from "./LabelsForm";
import { MilestonesForm } from "./MilestonesForm";
import { AssigneesForm } from "./AssigneesForm";
import { CommentForm } from "./CommentForm";
import { usePullRequestContext } from "./PullRequestContext";
import { PullRequestHistory } from "./PullRequestHistory";
import { PullRequestClosingForm } from "./PullRequestClosingForm";

export const PullRequestPage: FC = () => {
  const { pullRequest, isEdit } = usePullRequestContext();

  if (!isEdit) return <></>;

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <div className="overflow-hidden shadow sm:rounded-md mb-10">
            <div className="bg-white px-4 py-5 sm:p-6 mb-1">
              <DefinePullRequestForm />
            </div>
          </div>

          <div>
            <PullRequestHistory />
          </div>

          <div key={pullRequest?.csm?.comments?.length ?? -1}>
            <CommentForm />
          </div>

          <div>
            <PullRequestClosingForm />
          </div>
        </div>

        <div className="col-span-4">
          <div className="bg-white py-6">
            <LabelsForm />
          </div>

          <div className="bg-white pb-6">
            <MilestonesForm />
          </div>

          <AssigneesForm />
        </div>
      </div>
    </>
  );
};
