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
  const { repository, username, graph } = router.query;

  return (
    <div className="flex items-center justify-center w-full p-2">
      <div className="flex gap-5">
        <div className="flex flex-col w-[312px] h-fit border rounded-md">
          {Object.keys(graphTypes).map((graphType) => (
            <Link
              key={graphType}
              className={`p-3 flex hover:bg-slate-50 ${graph === graphType ? "border-l-2 border-orange-500" : ""}`}
              href={`/${username}/${repository}/graphs/${graphType}`}
            >
              {graphTypes[graphType as GraphType]}
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-5 flex-1 items-center min-w-[812px] max-w-[1024px]">{children}</div>
      </div>
    </div>
  );
};

export default RepositoryGraphsLayout;
