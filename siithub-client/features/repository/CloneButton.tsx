import { type FC } from "react";
import { Menu } from "@headlessui/react";
import { useRepositoryContext } from "./RepositoryContext";
import { type Repository } from "./repository.service";
import { ClipboardDocumentIcon, CodeBracketIcon } from "@heroicons/react/24/outline";
import { useNotifications } from "../../core/hooks/useNotifications";
import { type AuthUser, useAuthContext } from "../../core/contexts/Auth";

const SSH_URL = process.env.NEXT_PUBLIC_SSH_URL || "localhost:22/home";

export const CloneButton: FC = () => {
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;
  const myUsername = (useAuthContext()?.user as AuthUser)?.username;

  const notification = useNotifications();

  const sshUrl = `ssh://${myUsername}@${SSH_URL}/${owner}/${name}`;

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex bg-blue-500 items-center p-2 rounded-md text-white font-semibold">
          <CodeBracketIcon className="h-4 w-4 mr-2 font-semibold" />
          Clone
        </Menu.Button>
      </div>
      <Menu.Items className="absolute right-0 z-10 mt-2 rounded-md bg-white p-5 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
        <div className="flex rounded-lg">
          <input value={sshUrl} readOnly className="rounded-l-lg border-blue-500 border-2 w-96" />
          <button
            onClick={() =>
              navigator.clipboard.writeText(sshUrl).then(() => notification.success("Copied to clipboard"))
            }
            className="rounded-r-lg px-2 border-blue-500 border-2"
          >
            <ClipboardDocumentIcon className="w-5 h-5" />
          </button>
        </div>
      </Menu.Items>
    </Menu>
  );
};
