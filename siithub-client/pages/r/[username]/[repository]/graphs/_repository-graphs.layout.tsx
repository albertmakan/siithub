import { useRouter } from "next/router";
import { type FC, type PropsWithChildren } from "react";
import Link from "next/link";

const graphTypes = {
  pulse: "Pulse",
  contributors: "Contributors",
  commits: "Commits",
  "code-frequency": "Code frequency",
  forks: "Forks",
};

type GraphType = keyof typeof graphTypes;

export const RepositoryGraphsLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { repository, username } = router.query;
  const graph = router.pathname.split("/").at(-1);

  return (
    <div className="md:flex gap-5">
      <div className="flex flex-col h-fit border rounded-md mb-5">
        {Object.keys(graphTypes).map((graphType) => (
          <Link
            key={graphType}
            className={`px-3 py-2 hover:bg-slate-50 ${
              graph === graphType ? "border-l-2 border-orange-500 bg-gray-200" : ""
            }`}
            href={`/r/${username}/${repository}/graphs/${graphType}`}
          >
            {graphTypes[graphType as GraphType]}
          </Link>
        ))}
      </div>
      <div className="flex flex-col gap-5 flex-1 items-center">{children}</div>
    </div>
  );
};

export default RepositoryGraphsLayout;
