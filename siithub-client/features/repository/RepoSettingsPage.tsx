import { useRouter } from "next/router";
import { useState, type FC } from "react";
import { Button } from "../../core/components/Button";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { extractErrorMessage } from "../../core/utils/errors";
import { type Repository, deleteRepository } from "./repository.service";
import { useRepositoryContext } from "./RepositoryContext";
import { Modal } from "../../core/components/Modal";

export const RepoSettingsPage: FC = () => {
  const { repository } = useRepositoryContext();
  const { owner, name } = repository as Repository;

  const router = useRouter();
  const notifications = useNotifications();
  const { setResult } = useResult("delete-repo");

  const deleteRepositoryAction = useAction(deleteRepository(owner, name), {
    onSuccess: () => {
      notifications.success("You have successfully deleted repository.");
      setResult({ status: ResultStatus.Ok, type: "DELETE_REPO" });
      router.push("/");
    },
    onError: (error: any) => {
      notifications.error(extractErrorMessage(error));
      setResult({ status: ResultStatus.Error, type: "DELETE_REPO" });
    },
  });
  const [isOpen, setIsOpen] = useState(false);
  const [enteredName, setEnteredName] = useState("");

  return (
    <div className="flex items-center border-2 rounded-lg border-red-700 p-2">
      <div className="grow">
        <p className="font-medium">Delete this repository</p>
        <p>Once you delete a repository, there is no going back. Please be certain.</p>
      </div>

      <Button className="text-right" onClick={() => setIsOpen(true)}>
        Delete this repo
      </Button>
      <Modal title="Delete repository" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <p>Enter the repository name</p>
        <input onChange={(e) => setEnteredName(e.target.value)} className="rounded-md w-full mt-2" />
        <div className="flex justify-end mt-2">
          <button
            disabled={enteredName !== name}
            onClick={deleteRepositoryAction}
            className="rounded-md bg-red-500 disabled:bg-red-300 text-white p-2"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
};
