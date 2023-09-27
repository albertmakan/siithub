import { useState, type FC } from "react";
import { useNotifications } from "../../core/hooks/useNotifications";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { extractErrorMessage } from "../../core/utils/errors";
import { Button } from "../../core/components/Button";
import AsyncSelect from "react-select/async";
import { type AddCollaborator, addCollaborator } from "./collaboratorAction";
import { type User } from "../users/user.model";
import { getUsers } from "../users/registration/createUser";
import { useRepositoryContext } from "../repository/RepositoryContext";

export const CollaboratorsForm: FC = () => {
  const repoId = useRepositoryContext().repository?._id ?? "";

  const [userId, setUserId] = useState<string>();

  const notifications = useNotifications();
  const { setResult } = useResult("collaborators");

  const addCollaboratorAction = useAction<AddCollaborator>(addCollaborator(repoId), {
    onSuccess: () => {
      notifications.success("You have successfully added a new collaborator to the repository.");
      setResult({ status: ResultStatus.Ok, type: "ADD_COLLABORATOR" });
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "ADD_COLLABORATOR" });
    },
  });

  const loadOptions = (inputValue: string, callback: (options: { value: string; label: string }[]) => void) => {
    getUsers(inputValue).then((resp) => {
      const userOptions = (resp?.data as User[]).map((u) => ({ value: u._id, label: u.name }));
      callback(userOptions);
    });
  };

  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Collaborator</label>

      <AsyncSelect
        cacheOptions
        loadOptions={loadOptions}
        isMulti={false}
        name="collaborators"
        className="mt-1 basic-select"
        classNamePrefix="select"
        onChange={(opt) => setUserId(opt?.value)}
        isClearable={true}
      />

      <div className="py-6 text-right">
        {userId && <Button onClick={() => addCollaboratorAction({ userId })}>Submit</Button>}
      </div>
    </>
  );
};
