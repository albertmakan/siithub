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
      <>
        <div className="flex justify-end">
          <CloneButton />
        </div>
        <div>
          <p className="text-2xl text-center">This repository is empty</p>
        </div>
      </>
    );
  return <div>Loading...</div>;
};
