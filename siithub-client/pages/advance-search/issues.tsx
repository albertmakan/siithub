import { useRouter } from "next/router";
import { IssuesSearch } from "../../features/advance-search/IssuesSearch";
import { SortComponent } from "../../features/advance-search/SortComponent";

const Issues = () => {
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
      <IssuesSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Issues;
