import { NextRouter, useRouter } from "next/router";
import { type FC, type PropsWithChildren } from "react";
import { useAuthContext } from "../../../../core/contexts/Auth";
import { RepositoryHeader } from "../../../../features/repository/RepositoryHeader";
import { CodeBracketIcon, PresentationChartLineIcon } from "@heroicons/react/24/outline";
import { CalendarIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/outline";
import { TagIcon } from "@heroicons/react/24/outline";
import { TicketIcon } from "@heroicons/react/24/outline";
import { Cog8ToothIcon } from "@heroicons/react/24/outline";
import { RepositoryContextProvider } from "../../../../features/repository/RepositoryContext";
import { RepositoryMenu, RepositoryMenuItem } from "../../../../features/repository/RepositoryMenu";

function getLinks(router: NextRouter, username: string, repository: string): RepositoryMenuItem[] {
  return [
    {
      title: "Code",
      icon: <CodeBracketIcon className="h-4 w-4 mr-2" />,
      path: "/r/[username]/[repository]",
      isMultimenu: true,
      menus: ["/tree", "/blob", "/branches", "/commits", "/commit", "/tags"],
      onClick: async () => {
        await router.push(`/r/${username}/${repository}`);
      },
    },
    {
      title: "Issues",
      icon: <TicketIcon className="h-4 w-4 mr-2" />,
      path: "/r/[username]/[repository]/issues",
      hasChildren: true,
      onClick: async () => {
        await router.push(`/r/${username}/${repository}/issues`);
      },
    },
    {
      title: "Pull Requests",
      icon: <TicketIcon className="h-4 w-4 mr-2" />,
      path: "/r/[username]/[repository]/pull-requests",
      hasChildren: true,
      onClick: async () => {
        await router.push(`/r/${username}/${repository}/pull-requests`);
      },
    },
    {
      title: "Milestones",
      icon: <CalendarIcon className="h-4 w-4 mr-2" />,
      path: "/r/[username]/[repository]/milestones",
      hasChildren: true,
      onClick: async () => {
        await router.push(`/r/${username}/${repository}/milestones`);
      },
    },
    {
      title: "Labels",
      icon: <TagIcon className="h-4 w-4 mr-2" />,
      path: "/r/[username]/[repository]/labels",
      onClick: async () => {
        await router.push(`/r/${username}/${repository}/labels`);
      },
    },
    {
      title: "Stars",
      icon: <StarIcon className="h-4 w-4 mr-2" />,
      path: "/r/[username]/[repository]/stargazers",
      onClick: async () => {
        await router.push(`/r/${username}/${repository}/stargazers`);
      },
    },
    {
      title: "Insights",
      icon: <PresentationChartLineIcon className="h-4 w-4 mr-2" />,
      path: "/r/[username]/[repository]/graphs",
      hasChildren: true,
      onClick: async () => {
        await router.push(`/r/${username}/${repository}/graphs/pulse`);
      },
    },
    {
      title: "Settings",
      icon: <Cog8ToothIcon className="h-4 w-4 mr-2" />,
      path: "/r/[username]/[repository]/settings",
      hasChildren: true,
      onClick: async () => {
        await router.push(`/r/${username}/${repository}/settings`);
      },
    },
  ];
}

export const RepositoryLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { username, repository } = router.query;
  const { user } = useAuthContext();

  const links = getLinks(router, username?.toString() ?? "", repository?.toString() ?? "");

  if (!user) return <></>;
  if (!username || !repository) return <></>;

  return (
    <>
      <RepositoryContextProvider>
        <RepositoryHeader />
        <RepositoryMenu links={links} />

        <div className="mt-5 w-full">{children}</div>
      </RepositoryContextProvider>
    </>
  );
};

export default RepositoryLayout;
