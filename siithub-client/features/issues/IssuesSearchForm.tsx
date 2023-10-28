import { IssueState, type IssuesQuery } from "./issueActions";
import Select from "react-select";
import { type FC, useState } from "react";
import { type Repository } from "../repository/repository.service";
import { ChooseAssigneesField } from "../common/ChooseAssigneesField";
import { ChooseLabelsField } from "../common/ChooseLabelsField";
import { ChooseMilestonesField } from "../common/ChooseMilestonesField";
import { useCollaborators } from "../collaborators/useCollaborators";
import { ProfilePicture } from "../../core/components/ProfilePicture";

const avaiableStates = [
  { value: [IssueState.Open, IssueState.Reopened, IssueState.Closed], label: "Any" },
  { value: [IssueState.Open, IssueState.Reopened], label: "Opened" },
  { value: [IssueState.Closed], label: "Closed" },
];

const sortOptions = [
  { value: { timeStamp: -1 }, label: "Newest" },
  { value: { timeStamp: 1 }, label: "Oldest" },
  { value: { lastModified: -1 }, label: "Recently updated" },
  { value: { lastModified: 1 }, label: "Least recently updated" },
];

type IssuesSearchFormProps = {
  repositoryId: Repository["_id"];
  existingParams: IssuesQuery;
  onParamsChange: (params: IssuesQuery) => any;
};

export const IssuesSearchForm: FC<IssuesSearchFormProps> = ({ repositoryId, existingParams, onParamsChange }) => {
  const [params, setParams] = useState<IssuesQuery>(existingParams);

  const { collaborators } = useCollaborators(repositoryId, "");
  const userOptions = [
    { value: "", label: "Any" },
    ...collaborators.map((c) => ({
      value: c.user._id,
      label: (
        <span className="flex items-center">
          <ProfilePicture user={c.user} size={25} />
          <span className="ml-3">{c.user.name}</span>
        </span>
      ),
    })),
  ];

  const onDataChange = (data: Partial<IssuesQuery>) => {
    const newParams = { ...params, ...data };
    onParamsChange(newParams);
    setParams(newParams);
  };

  return (
    <>
      <div className="mt-3 grid grid-cols-12 gap-6">
        <div className="col-span-9">
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300"
            onChange={(e) => onDataChange({ title: e.target.value })}
          />
        </div>
        <div className="col-span-3">
          <label className="block text-sm font-medium text-gray-700">Sort by</label>

          <Select
            isMulti={false}
            name="sort"
            defaultValue={sortOptions[0]}
            options={sortOptions}
            className="mt-1 basic-select"
            classNamePrefix="select"
            onChange={(sort) => onDataChange({ sort: sort?.value })}
          />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-12 gap-6">
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700">State</label>

          <Select
            isMulti={false}
            name="states"
            defaultValue={avaiableStates[0]}
            options={avaiableStates}
            className="mt-1 basic-select"
            classNamePrefix="select"
            onChange={(state) => onDataChange({ state: state?.value })}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Author</label>

          <Select
            isMulti={false}
            name="author"
            defaultValue={userOptions[0]}
            options={userOptions}
            className="mt-1 basic-select"
            classNamePrefix="select"
            onChange={(author) => onDataChange({ author: author?.value })}
          />
        </div>

        <div className="col-span-3">
          <ChooseAssigneesField
            repositoryId={repositoryId}
            selectedAssignees={existingParams.assignees ?? []}
            onAssigneesChange={(assignees) => onDataChange({ assignees })}
          />
        </div>

        <div className="col-span-3">
          <ChooseLabelsField
            repositoryId={repositoryId}
            selectedLabels={existingParams.labels ?? []}
            onLabelChange={(labels) => onDataChange({ labels })}
          />
        </div>

        <div className="col-span-3">
          <ChooseMilestonesField
            repositoryId={repositoryId}
            selectedMilestones={existingParams.milestones ?? []}
            onMilestonesChange={(milestones) => onDataChange({ milestones })}
          />
        </div>
      </div>
    </>
  );
};
