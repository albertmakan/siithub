import { useRouter } from "next/router";
import { DirectoryTable } from "../../../../../../features/tree/DirectoryTable";

const Tree = () => {
  const router = useRouter();
  const { branch } = router.query;

  if (!branch) return <></>;

  return <DirectoryTable branch={branch.toString()} treePath={""} />;
};

export default Tree;
