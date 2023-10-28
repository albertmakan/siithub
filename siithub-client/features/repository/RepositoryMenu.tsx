import { useRouter } from "next/router";
import { type FC, ReactElement, useCallback } from "react";

export type RepositoryMenuItem = {
  title: string;
  icon: ReactElement;
  path: string;
  isMultimenu?: boolean;
  menus?: string[];
  hasChildren?: boolean;
  onClick: () => any;
};

type RepositoryMenuProps = {
  links: RepositoryMenuItem[];
};

export const RepositoryMenu: FC<RepositoryMenuProps> = ({ links }) => {
  const router = useRouter();

  const isActive = useCallback(
    ({ path, hasChildren, isMultimenu, menus }: RepositoryMenuItem) => {
      if (!router) return false;

      if (hasChildren) return router.pathname.startsWith(path);

      if (isMultimenu) return !!menus?.find((m) => router.pathname.startsWith(path + m)) || router.pathname === path;

      return router.pathname === path;
    },
    [router]
  );

  return (
    <div className="bg-gray-700 p-1 mt-2 flex flex-wrap">
      {links.map((link) => (
        <span
          key={link.title}
          onClick={link.onClick}
          className={
            "flex items-center bg-gray-900 text-white cursor-pointer px-3 py-2 m-1 rounded-md text-sm font-medium hover:border-indigo-300 hover:border-b-4 " +
            (isActive(link) ? "border-blue-600 border-b-4" : "")
          }
        >
          {link.icon}
          <span className="ml-2">{link.title}</span>
        </span>
      ))}
    </div>
  );
};
