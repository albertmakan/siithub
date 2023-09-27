import { useRouter } from "next/router";
import { RepositoriesSearch } from "../../features/advance-search/RepositoriesSearch";
import { SortComponent } from "../../features/advance-search/SortComponent";

const Repositories = () => {
  const router = useRouter();
  const { param, sort } = router.query;

  if (!router) return <></>;

  return (
    <>
      <SortComponent
        options={[
          { label: "Sort by name 🔼", value: { name: 1 } },
          { label: "Sort by name 🔽", value: { name: -1 } },
          { label: "Sort by description 🔼", value: { description: 1 } },
          { label: "Sort by description 🔽", value: { description: -1 } },
        ]}
      />
      <RepositoriesSearch param={param?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Repositories;
