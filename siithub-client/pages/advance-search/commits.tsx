import { useRouter } from "next/router";
import { CommitsSearch } from "../../features/advance-search/CommitsSearch";
import { SortComponent } from "../../features/advance-search/SortComponent";

const Commits = () => {
  const router = useRouter();
  const { param, repositoryId, sort } = router.query;

  if (!repositoryId) return <></>;

  return (
    <>
      <SortComponent
        options={[
          { label: "Sort by commit date 🔼", value: { date: 1 } },
          { label: "Sort by commit date 🔽", value: { date: -1 } },
        ]}
      />
      <CommitsSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Commits;
