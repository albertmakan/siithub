import { type FC } from "react";
import { type Repository } from "../repository/repository.service";
import { useMilestones } from "../milestones/useMilestones";
import Select from "react-select";

type ChooseMilestonesFieldProps = {
  repositoryId: Repository["_id"];
  selectedMilestones: string[];
  onMilestonesChange: (milestones: string[]) => any;
};

export const ChooseMilestonesField: FC<ChooseMilestonesFieldProps> = ({
  repositoryId,
  selectedMilestones,
  onMilestonesChange,
}) => {
  const { milestones } = useMilestones(repositoryId);

  const milestoneOptions =
    milestones?.map((m) => ({
      value: m._id,
      label: (
        <span>
          <span>{m.title}</span>
          <span className="text-gray-400 ml-2">#M{m.localId}</span>
        </span>
      ),
    })) ?? [];
  const defaultValue = milestoneOptions.filter((m) => selectedMilestones?.includes(m.value));

  return (
    <>
      <label className="block text-sm font-medium text-gray-700">Milestones</label>

      <Select
        isMulti
        name="milestones"
        key={milestones?.length}
        defaultValue={defaultValue}
        options={milestoneOptions}
        className="mt-1 basic-multi-select"
        classNamePrefix="select"
        onChange={(milestones) => onMilestonesChange(milestones.map((m) => m.value))}
      />
    </>
  );
};
