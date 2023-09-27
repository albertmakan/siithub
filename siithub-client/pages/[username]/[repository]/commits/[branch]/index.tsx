import { useRouter } from "next/router";
import { CommitsTable } from "../../../../../features/commits/CommitsTable";

const Commits = () => {
  const router = useRouter();
  const { branch } = router.query;
  return <CommitsTable branch={branch as string} />;
};

export default Commits;
