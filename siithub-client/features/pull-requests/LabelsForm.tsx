import { type FC, useState, useEffect } from "react";
import { useAuthContext } from "../../core/contexts/Auth";
import { ChooseLabelsField } from "../common/ChooseLabelsField";
import { assignLabelToPR, unassignLabelFromPR, usePullRequestContext } from "./PullRequestContext";
import { findDifference } from "../common/utils";

export const LabelsForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  useEffect(() => setSelectedLabels(pullRequest.csm.labels ?? []), [pullRequest.csm.labels]);

  const onLabelChange = (labels: string[]): void => {
    if (labels.length > selectedLabels.length) {
      const added = findDifference(labels, selectedLabels);
      if (added) pullRequestDispatcher(assignLabelToPR(pullRequest, added, executedBy));
    } else {
      const removed = findDifference(selectedLabels, labels);
      if (removed) pullRequestDispatcher(unassignLabelFromPR(pullRequest, removed, executedBy));
    }
    setSelectedLabels(labels);
  };

  return (
    <ChooseLabelsField
      key={selectedLabels.length}
      repositoryId={pullRequest.repositoryId}
      selectedLabels={selectedLabels}
      onLabelChange={onLabelChange}
    />
  );
};
