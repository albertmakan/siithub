import { FC } from "react";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { Repository } from "../repository/repository.service";
import { useCollaborator } from "./useCollaborators";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { removeCollaborator, verifyCollaborator } from "./collaboratorAction";
import NotFound from "../../core/components/NotFound";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { useUserByUsername } from "../users/profile/useUser";
import { AuthUser, useAuthContext } from "../../core/contexts/Auth";
import { useRouter } from "next/router";

export const InvitationPage: FC = () => {
  const { repository } = useRepositoryContext();
  const { owner, name, _id: repoId } = repository as Repository;

  const me = useAuthContext()?.user as AuthUser;

  const { result, setResult } = useResult("collaborators");

  const { collaborator, error } = useCollaborator(repoId, [result]);

  const { user } = useUserByUsername(owner);

  const router = useRouter();

  const accept = useAction(verifyCollaborator(repoId), {
    onSuccess: () => {
      setResult({ status: ResultStatus.Ok, type: "ACCEPT_INVITE" });
      router.push(`/${owner}/${name}`);
    },
    onError: () => {},
  });
  const decline = useAction(removeCollaborator(repoId), {
    onSuccess: () => {
      setResult({ status: ResultStatus.Ok, type: "DECLINE_INVITE" });
      router.push(`/users/${me.username}`);
    },
    onError: () => {},
  });

  if (error) return <NotFound />;
  if (!collaborator) return <></>;

  return (
    <div>
      <div className="flex justify-center items-center">
        <ProfilePicture user={user} size={50} />
        <span className="text-4xl text-gray-400 mx-5">+</span>
        <ProfilePicture user={me} size={50} />
      </div>
      <h1 className="text-center py-5">
        <b>{owner}</b> invited you to collaborate
      </h1>
      {collaborator.verified ? (
        <h2 className="text-center py-5">You have already accepted this invite</h2>
      ) : (
        <div className="flex justify-center items-center">
          <button className="bg-green-500 text-white cursor-pointer p-3 rounded-md mr-5" onClick={accept}>
            Accept invitation
          </button>
          <button
            className="bg-red-400 text-white cursor-pointer p-3 rounded-md"
            onClick={() => decline({ userId: me._id })}
          >
            Decline invitation
          </button>
        </div>
      )}
    </div>
  );
};
