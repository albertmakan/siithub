import { useRouter } from "next/router";
import { SortComponent } from "../../features/advance-search/SortComponent";
import { TagsSearch } from "../../features/advance-search/TagsSearch";

const Tags = () => {
  const router = useRouter();
  const { param, repositoryId, sort } = router.query;

  if (!router) return <></>;
  return (
    <>
      <SortComponent
        options={[
          { label: "Sort by timestamp 🔽", value: { timeStamp: -1 } },
          { label: "Sort by timestamp 🔼", value: { timeStamp: 1 } },
          { label: "Sort by name 🔼", value: { name: 1 } },
          { label: "Sort by name 🔽", value: { name: -1 } },
          { label: "Sort by description 🔼", value: { description: 1 } },
          { label: "Sort by description 🔽", value: { description: -1 } },
          { label: "Sort by version 🔼", value: { version: 1 } },
          { label: "Sort by version 🔽", value: { version: -1 } },
        ]}
      />
      <TagsSearch param={param?.toString() ?? ""} repositoryId={repositoryId?.toString() ?? ""} sort={sort} />
    </>
  );
};

export default Tags;
