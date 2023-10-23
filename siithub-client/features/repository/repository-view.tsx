import { type FC } from "react";
import { CloneButton } from "./CloneButton";

type RepositoryViewProps = {
  repo: string;
  username: string;
  isEmpty: boolean;
};

export const RepositoryView: FC<RepositoryViewProps> = ({ username, repo, isEmpty }) => {
  if (isEmpty)
    return (
      <div>
        <p className="text-2xl">This repository is empty</p>
        <CloneButton />
      </div>
    );
  return <div>Loading...</div>;
};
