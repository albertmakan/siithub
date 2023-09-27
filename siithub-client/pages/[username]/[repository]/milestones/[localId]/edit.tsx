import { useRouter } from "next/router";
import { MilestoneEdit } from "../../../../../features/milestones/MilestoneEdit";

const EditMilestone = () => {
  const router = useRouter();
  const { localId } = router.query;

  return <MilestoneEdit localId={+(localId?.toString() ?? "0")} />;
};

export default EditMilestone;
