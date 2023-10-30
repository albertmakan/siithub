import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, type FC } from "react";
import { Button } from "../../core/components/Button";
import NotFound from "../../core/components/NotFound";
import { ResultStatus, useResult } from "../../core/contexts/Result";
import { useAction } from "../../core/hooks/useAction";
import { useNotifications } from "../../core/hooks/useNotifications";
import { closeMilestoneFor, openMilestoneFor } from "./milestoneActions";
import { MilestoneForm } from "./MilestoneForm";
import { useMilestone } from "./useMilestones";
import { useRepositoryContext } from "../repository/RepositoryContext";
import { type Repository } from "../repository/repository.service";

export const MilestoneEdit: FC<{ localId: number }> = ({ localId }) => {
  const { repository } = useRepositoryContext();
  const { owner, name, _id } = repository as Repository;
  const backRoute = `/r/${owner}/${name}/milestones`;

  const { result, setResult } = useResult("milestones");
  const { milestone, error } = useMilestone(_id, localId, [result]);
  const router = useRouter();
  const notifications = useNotifications();

  useEffect(() => {
    if (!result) return;
    setResult(undefined);
  }, [result, setResult]);

  const closeMilestoneAction = useAction(closeMilestoneFor(_id), {
    onSuccess: () => {
      notifications.success("Milestone is successfully closed.");
      setResult({ status: ResultStatus.Ok, type: "CLOSE_Milestone" });
      router.push(backRoute);
    },
    onError: () => {},
  });
  const openMilestoneAction = useAction(openMilestoneFor(_id), {
    onSuccess: () => {
      notifications.success("Milestone is successfully reopened.");
      setResult({ status: ResultStatus.Ok, type: "OPEN_Milestone" });
      router.push(backRoute);
    },
    onError: () => {},
  });

  if (error) return <NotFound />;
  if (!milestone) return <></>;

  return (
    <>
      <MilestoneForm existingMilestone={milestone} />
      <div className="bg-gray-50 px-4 py-3 text-right sm:px-6">
        <Button>
          <Link href={backRoute}>Cancel</Link>
        </Button>
        <Button onClick={() => (milestone.isOpen ? closeMilestoneAction : openMilestoneAction)(milestone)}>
          {milestone?.isOpen ? "Close" : "Reopen"} milestone
        </Button>
      </div>
    </>
  );
};
