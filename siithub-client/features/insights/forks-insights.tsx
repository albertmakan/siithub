import Link from "next/link";
import { type FC } from "react";
import { useForks } from "../repository/useRepositories";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { type Repository } from "../repository/repository.service";

export const ForksInsights: FC = () => {
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;

  const { forks } = useForks(owner, name);
  return (
    <div className="w-full">
      <div className="flex items-center">
        <Link className="hover:text-blue-500 hover:underline ml-3" href={`/users/${owner}`}>
          {owner}
        </Link>
        <span className="mx-1">/</span>
        <Link className="hover:text-blue-500 hover:underline" href={`/r/${owner}/${name}`}>
          {name}
        </Link>
      </div>
      {forks?.map((fork) => (
        <div key={fork.owner} className="flex items-center">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="#d1d5da">
            <path fillRule="evenodd" clipRule="evenodd" d="M10 0V13H20V14H9V0H10Z" />
          </svg>
          <Link className="text-sm font-semibold text-blue-500 hover:underline ml-3" href={`/users/${fork.owner}`}>
            {fork.owner}
          </Link>
          <span className="text-sm font-semibold text-blue-500 mx-1">/</span>
          <Link className="text-sm font-semibold text-blue-500 hover:underline" href={`/r/${fork.owner}/${fork.name}`}>
            {fork.name}
          </Link>
        </div>
      ))}
    </div>
  );
};
