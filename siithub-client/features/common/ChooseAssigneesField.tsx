import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import Select from "react-select";
import { useCollaborators } from "../collaborators/useCollaborators";

type ChooseAssigneesFieldProps = {
  repositoryId: Repository["_id"];
  selectedAssignees: string[];
  onAssigneesChange: (assignees: string[]) => any;
};

export const ChooseAssigneesField: FC<ChooseAssigneesFieldProps> = ({
  repositoryId,
  selectedAssignees,
  onAssigneesChange,
}) => {
  const { collaborators } = useCollaborators(repositoryId, "");

  const assigneesOptions = collaborators.map((c) => ({ value: c.user._id, label: c.user.name }));
  const defaultValue = assigneesOptions.filter((a) => selectedAssignees?.includes(a.value));

  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Assignees</label>

      <Select
        isMulti
        name="assignees"
        key={assigneesOptions.length}
        defaultValue={defaultValue}
        options={assigneesOptions}
        className="mt-1 basic-multi-select"
        classNamePrefix="select"
        onChange={(assignees) => onAssigneesChange(assignees.map((a) => a.value))}
      />
    </>
  );
};
