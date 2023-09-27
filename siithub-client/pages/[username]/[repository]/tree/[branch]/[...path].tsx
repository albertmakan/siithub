import { useRouter } from "next/router";
import { DirectoryTable } from "../../../../../features/tree/DirectoryTable";

const Tree = () => {
  const router = useRouter();
  const { branch, path } = router.query;

  if (!branch) return <></>;

  return <DirectoryTable branch={branch.toString()} treePath={(path as string[]).join("/")} />;
};

export default Tree;
