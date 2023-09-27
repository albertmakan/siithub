import { useEffect, type FC } from "react";
import { useResult } from "../../core/contexts/Result";
import { UserCard } from "../users/UserCard";
import { useStargazers } from "./useStars";
import { useRepositoryContext } from "../repository/RepositoryContext";

export const RepoStargazersPage: FC = () => {
  const repoId = useRepositoryContext().repository?._id ?? "";
  const { result, setResult } = useResult("repositories");
  const { result: starResult, setResult: setStarResult } = useResult("stars");
  const { users } = useStargazers(repoId, [result, starResult]);

  useEffect(() => {
    if (!result && !starResult) return;
    setResult(undefined);
    setStarResult(undefined);
  }, [result, setResult, starResult, setStarResult]);

  return (
    <div>
      <p className="text-xl m-3">Stargazers</p>
      {users?.map((user) => (
        <UserCard user={user} key={user._id} />
      ))}
    </div>
  );
};
