import { type FC, useEffect, useState } from "react";
import {
  assignUser,
  instantAssignUserTo,
  instantUnassignUserFrom,
  unassignUser,
  useIssueContext,
} from "./IssueContext";
import { useAuthContext } from "../../core/contexts/Auth";
import { findDifference } from "../common/utils";
import { ChooseAssigneesField } from "../common/ChooseAssigneesField";

export const AssigneesForm: FC = () => {
  const { user } = useAuthContext();
  const executedBy = user?._id ?? "";

  const { issue, isEdit, issueDispatcher } = useIssueContext();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => setSelectedUsers(issue.csm.assignees ?? []), [issue.csm.assignees]);

  const onUsersChange = (users: string[]): void => {
    if (users.length > selectedUsers.length) {
      const added = findDifference(users, selectedUsers);
      if (added)
        issueDispatcher(isEdit ? instantAssignUserTo(issue, added, executedBy) : assignUser(added, executedBy));
    } else {
      const removed = findDifference(selectedUsers, users);
      if (removed)
        issueDispatcher(
          isEdit ? instantUnassignUserFrom(issue, removed, executedBy) : unassignUser(removed, executedBy)
        );
    }
    setSelectedUsers(users);
  };

  return (
    <ChooseAssigneesField
      key={selectedUsers.length}
      repositoryId={issue?.repositoryId}
      selectedAssignees={selectedUsers}
      onAssigneesChange={onUsersChange}
    />
  );
};
