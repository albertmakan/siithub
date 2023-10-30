import { useRouter } from "next/router";
import { CommitsTable } from "../../../../../../features/commits/CommitsTable";

const Commits = () => {
  const router = useRouter();
  const { branch, path } = router.query;
  return <CommitsTable branch={branch as string} filePath={(path as string[]).join("/")} />;
};

export default Commits;
