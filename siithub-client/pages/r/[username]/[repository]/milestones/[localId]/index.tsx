import { useRouter } from "next/router";
import { MilestonePage } from "../../../../../../features/milestones/MilestonePage";

const Milestone = () => {
  const router = useRouter();
  const { localId } = router.query;

  return <MilestonePage localId={+(localId?.toString() ?? "0")} />;
};

export default Milestone;
