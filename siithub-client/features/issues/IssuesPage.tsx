import { useRouter } from "next/router";
import { type FC, useState } from "react";
import { Button } from "../../core/components/Button";
import { IssuesSearchForm } from "./IssuesSearchForm";
import { IssuesTable } from "./IssuesTable";
import { useSearchIssues } from "./useIssue";
import { type IssuesQuery } from "./issueActions";
import { type Repository } from "../repository/repository.service";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { useRefresh } from "../../core/hooks/useRefresh";

export const IssuesPage: FC = () => {
  const { repository } = useRepositoryContext();
  const { owner, name, _id: repositoryId } = repository as Repository;

  const router = useRouter();
  const [existingParams, setExistingParams] = useState<IssuesQuery>({});
  const { issues } = useSearchIssues(existingParams, repositoryId);
  const { key, refresh } = useRefresh("iss_search_form");

  const navigateToNewIssue = () => router.push(`/r/${owner}/${name}/issues/new`);

  const clearParams = () => {
    setExistingParams({});
    refresh();
  };

  return (
    <>
      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-2">
          <div key={key} className="border-t border-gray-200">
            <IssuesSearchForm
              repositoryId={repositoryId}
              existingParams={existingParams}
              onParamsChange={(params) => setExistingParams(params)}
            />
          </div>
        </div>
      </div>
      <div className="px-4 py-2 text-right sm:px-6">
        <span className="pr-4">
          <Button onClick={clearParams}>Clear</Button>
        </span>
        <span>
          <Button onClick={navigateToNewIssue}>New Issue</Button>
        </span>
      </div>
      <IssuesTable issues={issues} />
    </>
  );
};
