import { useRouter } from "next/router";
import { CommitDiff } from "../../../../features/commits/CommitDiff";

const Commit = () => {
  const router = useRouter();
  const { sha } = router.query;

  return <CommitDiff sha={sha as string} />;
};

export default Commit;
