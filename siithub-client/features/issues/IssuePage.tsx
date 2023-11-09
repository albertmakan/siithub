import { useEffect, type FC } from "react";
import { DescribeIssueForm } from "./DescribeIssueForm";
import { useIssue } from "./useIssue";
import { LabelsForm } from "./LabelsForm";
import { initialIssue as emptyIssue, setIssue, useIssueContext } from "./IssueContext";
import { IssueHistory } from "./IssueHistory";
import { AssigneesForm } from "./AssigneesForm";
import { MilestonesForm } from "./MilestonesForm";
import { CommentForm } from "./CommentForm";
import NotFound from "../../core/components/NotFound";
import { useRepositoryContext } from "../repository/RepositoryContext";

type IssuePageProps = {
  existingIssueId?: number;
};

export const IssuePage: FC<IssuePageProps> = ({ existingIssueId = undefined }) => {
  const repositoryId = useRepositoryContext().repository?._id ?? "";

  const { issue: existingIssue, error } = useIssue(repositoryId, existingIssueId ?? 0);
  const isEdit = !!existingIssueId;

  const { issue, issueDispatcher } = useIssueContext();

  useEffect(() => {
    const issue = existingIssue || emptyIssue;
    issue.repositoryId = repositoryId;

    issueDispatcher(setIssue(issue));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingIssue]);

  if (error) return <NotFound />;

  return (
    <>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="overflow-hidden shadow sm:rounded-md mb-10">
            <DescribeIssueForm />
          </div>

          <IssueHistory />

          {isEdit && (
            <div key={issue?.csm?.comments?.length}>
              <CommentForm />
            </div>
          )}
        </div>
        <div className="col-span-1">
          <div className="py-3">
            <LabelsForm />
          </div>
          <div className=" py-3">
            <MilestonesForm />
          </div>
          <div className="py-3">
            <AssigneesForm />
          </div>
        </div>
      </div>
    </>
  );
};
