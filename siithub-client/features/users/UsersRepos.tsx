import { type FC } from "react";
import NotFound from "../../core/components/NotFound";
import { RepositoryCard } from "../repository/RepositoryCard";
import { useUsersRepositories } from "../repository/useRepositories";

type UsersReposProps = {
  username: string;
};

export const UsersRepos: FC<UsersReposProps> = ({ username }) => {
  const { repositories, error } = useUsersRepositories(username);

  if (error) return <NotFound />;

  return (
    <>
      {repositories?.length ? (
        repositories.map((repo) => <RepositoryCard repository={repo} withUser={false} key={repo._id} />)
      ) : (
        <p className="text-xl">There are no repositories yet</p>
      )}
    </>
  );
};
