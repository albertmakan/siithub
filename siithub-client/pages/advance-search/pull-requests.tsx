import { useRouter } from "next/router";
import { PullRequestsSearch } from "../../features/advance-search/PullReqestSearch";
import { SortComponent } from "../../features/advance-search/SortComponent";

const PullRequests = () => {
  const router = useRouter();
  const { param, repositoryId, sort } = router.query;

  if (!router) return <></>;

  return (
    <>
      <SortComponent
        options={[
          { label: "Sort by timestamp 🔽", value: { "csm.timeStamp": -1 } },
          { label: "Sort by timestamp 🔼", value: { "csm.timeStamp": 1 } },
          { label: "Sort by title 🔼", value: { "csm.title": 1 } },
          { label: "Sort by title 🔽", value: { "csm.title": -1 } },
          { label: "Sort by local number 🔼", value: { localId: 1 } },
          { label: "Sort by local number 🔽", value: { localId: -1 } },
        ]}
      />
      <PullRequestsSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default PullRequests;
