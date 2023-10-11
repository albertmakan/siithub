import { type FC } from "react";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import { removeCollaborator, type Collaborator, type RemoveCollaborator } from "./collaboratorAction";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { ProfilePicture } from "../../core/components/ProfilePicture";
import { Repository } from "../repository/repository.service";

export const CollaboratorsTable: FC<{ collaborators: Collaborator[] }> = ({ collaborators }) => {
  const { repository } = useRepositoryContext();
  const { owner, _id: repoId } = repository as Repository;

  const notifications = useNotifications();
  const { setResult } = useResult("collaborators");

  const removeCollaboratorAction = useAction<RemoveCollaborator>(removeCollaborator(repoId), {
    onSuccess: () => {
      notifications.success("You have successfully removed collaborator from the repo.");
      setResult({ status: ResultStatus.Ok, type: "REMOVE_COLLABORATOR" });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "REMOVE_COLLABORATOR" });
    },
  });

  return (
    <div className="overflow-x-auto relative shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
          <tr>
            <th className="py-3 px-6" colSpan={3}>
              Collaborators
            </th>
          </tr>
        </thead>
        <tbody>
          {collaborators?.map((collaborator) => (
            <tr key={collaborator._id} className="bg-white border-b">
              <td className="pl-5">
                <ProfilePicture user={collaborator.user} size={30} />
              </td>
              <td className="py-4 font-medium text-gray-900 whitespace-nowrap">{collaborator.user?.name}</td>
              <td className="py-4 font-medium text-gray-400 whitespace-nowrap">
                {!collaborator.verified && "Pending"}
              </td>
              <td className="py-4 px-6 text-right">
                {collaborator.user.username !== owner && (
                  <a
                    href="#"
                    onClick={() => removeCollaboratorAction(collaborator)}
                    className="ml-4 font-medium text-blue-600 hover:underline text right"
                  >
                    Remove
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
