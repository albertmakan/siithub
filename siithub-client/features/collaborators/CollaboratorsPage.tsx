import { type FC, useEffect, useState } from "react";
import { useCollaborators } from "./useCollaborators";
import { CollaboratorsTable } from "./CollaboratorsTable";
import { useResult } from "../../core/contexts/Result";
import { Button } from "../../core/components/Button";
import { useRefresh } from "../../core/hooks/useRefresh";
import { CollaboratorsForm } from "./CollaboratorsForm";
import { Modal } from "../../core/components/Modal";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { InputField } from "../../core/components/InputField";

export const CollaboratorsPage: FC = () => {
  const repoId = useRepositoryContext().repository?._id ?? "";

  const [name, setName] = useState("");
  const { key, refresh } = useRefresh("collaboratorsSearchForm");
  const { result, setResult } = useResult("collaborators");
  const { collaborators } = useCollaborators(repoId, name, [result]);

  useEffect(() => {
    if (!result) return;

    setResult(undefined);
  }, [result, setResult]);

  const clearName = () => {
    setName("");
    refresh();
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-12 bg-gray-50 py-2">
        <div className="col-span-6 ml-3 text-4xl">Manage Collaborators</div>

        <div className={`col-span-6 mr-3 bg-gray-50 text-right`}>
          <Button onClick={() => setIsOpen(true)}>Add</Button>
        </div>
      </div>

      <Modal title="Add Collaborator" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <CollaboratorsForm />
      </Modal>

      <div className="hidden sm:block" aria-hidden="true">
        <div className="py-5">
          <div className="border-t border-gray-200" />
        </div>
      </div>

      <div className="overflow-hidden shadow sm:rounded-md px-4 py-3">
        <div className="mb-4 grid grid-cols-12">
          <div key={key} className="col-span-11">
            <InputField label="Name" formElement={{ value: name, onChange: (e: any) => setName(e.target.value) }} />
          </div>

          <div className="mt-8 col-span-1 text-right">
            <Button onClick={clearName}>Clear</Button>
          </div>
        </div>

        <CollaboratorsTable collaborators={collaborators} />
      </div>
    </>
  );
};
