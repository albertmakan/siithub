import { type FC, useState, useEffect } from "react";
import { useAuthContext } from "../../core/contexts/Auth";
import { findDifference } from "../common/utils";
import { ChooseAssigneesField } from "../common/ChooseAssigneesField";
import { anassignUserFromPR, assignUserToPR, usePullRequestContext } from "./PullRequestContext";

export const AssigneesForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { pullRequest, pullRequestDispatcher } = usePullRequestContext();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => setSelectedUsers(pullRequest.csm.assignees ?? []), [pullRequest.csm.assignees]);

  const onUsersChange = (users: string[]): void => {
    if (users.length > selectedUsers.length) {
      const added = findDifference(users, selectedUsers);
      if (added) pullRequestDispatcher(assignUserToPR(pullRequest, added, executedBy));
    } else {
      const removed = findDifference(selectedUsers, users);
      if (removed) pullRequestDispatcher(anassignUserFromPR(pullRequest, removed, executedBy));
    }
    setSelectedUsers(users);
  };

  return (
    <ChooseAssigneesField
      key={selectedUsers.length}
      repositoryId={pullRequest.repositoryId}
      selectedAssignees={selectedUsers}
      onAssigneesChange={onUsersChange}
    />
  );
};
