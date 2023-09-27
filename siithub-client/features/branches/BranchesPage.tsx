import { type FC, useEffect, useState } from "react";
import { useBranches } from "./useBranches";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { Button } from "../../core/components/Button";
import { BranchesTable } from "./BranchesTable";
import { useRefresh } from "../../core/hooks/useRefresh";
import debounce from "lodash.debounce";
import { Modal } from "../../core/components/Modal";
import { CreateBranchForm } from "./CreateBranchForm";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { InputField } from "../../core/components/InputField";

const debouncedCb = debounce((cb: () => void) => cb(), 300);

export const BranchesPage: FC = () => {
  const repositoryId = useRepositoryContext().repository?._id ?? "";

  const [name, setName] = useState("");
  const [finalName, setFinalName] = useState(name);
  const [isOpen, setIsOpen] = useState(false);

  const { key, refresh } = useRefresh("branchesSearchForm");
  const { result: branchesResult, setResult: setBranchesResult } = useResult("branches");
  const { branches } = useBranches(repositoryId, finalName, [branchesResult]);

  useEffect(() => {
    debouncedCb(() => setFinalName(name));
  }, [name]);

  useEffect(() => {
    if (!branchesResult) return;

    if (branchesResult.type === "CREATE" && branchesResult.status === ResultStatus.Ok) setIsOpen(false);

    setBranchesResult(undefined);
  }, [branchesResult, setBranchesResult]);

  const clearName = () => {
    setName("");
    refresh();
  };

  return (
    <>
      <div className="grid grid-cols-12 bg-gray-50 py-2">
        <div className="col-span-6 ml-3 text-4xl">Manage Branches</div>

        <div className={`col-span-6 mr-3 bg-gray-50 text-right`}>
          <Button onClick={() => setIsOpen(true)}>Create</Button>
        </div>
      </div>

      <Modal title="Create branch" isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <CreateBranchForm />
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

        <BranchesTable branches={branches} />
      </div>
    </>
  );
};
