import { type FC } from "react";
import AsyncSelect from "react-select/async";
import { type Branch, getBranches } from "./branchesActions";
import { useRepositoryContext } from "../repository/RepositoryContext";

type SelectBranchFieldProps = {
  showLabel?: boolean;
  defaultBranch?: string;
  onChange: (branch: string) => any;
};

export const SelectBranchField: FC<SelectBranchFieldProps> = ({
  onChange,
  showLabel = true,
  defaultBranch = undefined,
}) => {
  const repositoryId = useRepositoryContext().repository?._id ?? "";

  const loadOptions = (inputValue: string, callback: (options: any[]) => void) => {
    getBranches(repositoryId, inputValue).then((resp: any) => {
      const branchOptions = ((resp?.data ?? []) as Branch[]).map((b) => ({ value: b, label: b }));
      callback(branchOptions);
    });
  };

  return (
    <>
      {showLabel ? <label className="block text-sm font-medium text-gray-700">Branch</label> : <></>}

      <AsyncSelect
        key={defaultBranch}
        defaultValue={defaultBranch ? { value: defaultBranch, label: defaultBranch } : {}}
        required={true}
        cacheOptions
        loadOptions={loadOptions}
        isMulti={false}
        name="branches"
        className="mt-1 basic-select"
        classNamePrefix="select"
        onChange={(branch) => onChange(branch?.value ?? "")}
        isClearable={true}
      />
    </>
  );
};
