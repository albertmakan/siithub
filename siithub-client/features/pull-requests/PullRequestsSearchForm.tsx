import { type FC, useState } from "react";
import { InputField } from "../../core/components/InputField";
import Select from "react-select";
import { type Repository } from "../repository/repository.service";
import { ChooseAssigneesField } from "../common/ChooseAssigneesField";
import { PullRequestState, type PullRequestsQuery } from "./pullRequestActions";
import { ChooseLabelsField } from "../common/ChooseLabelsField";
import { ChooseMilestonesField } from "../common/ChooseMilestonesField";
import { useCollaborators } from "../collaborators/useCollaborators";

const avaiableStates = [
  {
    value: [
      PullRequestState.Opened,
      PullRequestState.Approved,
      PullRequestState.ChangesRequired,
      PullRequestState.Merged,
      PullRequestState.Canceled,
    ],
    label: "Any",
  },
  { value: [PullRequestState.Opened, PullRequestState.Approved, PullRequestState.ChangesRequired], label: "Opened" },
  { value: [PullRequestState.Merged, PullRequestState.Canceled], label: "Closed" },
];

const sortOptions = [
  { value: { timeStamp: -1 }, label: "Newest" },
  { value: { timeStamp: 1 }, label: "Oldest" },
  { value: { lastModified: -1 }, label: "Recently updated" },
  { value: { lastModified: 1 }, label: "Least recently updated" },
];

type PullRequestsSearchFormProps = {
  repositoryId: Repository["_id"];
  existingParams: PullRequestsQuery;
  onParamsChange: (params: PullRequestsQuery) => any;
};

export const PullRequestsSearchForm: FC<PullRequestsSearchFormProps> = ({
  repositoryId,
  existingParams,
  onParamsChange,
}) => {
  const [params, setParams] = useState<PullRequestsQuery>(existingParams);

  const { collaborators } = useCollaborators(repositoryId, "");
  const userOptions = [
    { value: "", label: "Any" },
    ...collaborators.map((c) => ({ value: c.user._id, label: c.user.name })),
  ];

  const onDataChange = (data: Partial<PullRequestsQuery>) => {
    const newParams = { ...params, ...data };
    onParamsChange(newParams);
    setParams(newParams);
  };

  return (
    <>
      <div className="mt-10 grid grid-cols-12 gap-6">
        <div className="col-span-9">
          <InputField
            label="Title"
            formElement={{ value: params.title ?? "", onChange: (e: any) => onDataChange({ title: e.target.value }) }}
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

      <div className="mt-10 grid grid-cols-12 gap-6">
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
            defaultValue={{ value: "", label: "Any" }}
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
