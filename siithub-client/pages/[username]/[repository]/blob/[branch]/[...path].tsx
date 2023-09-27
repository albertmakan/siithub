import { useRouter } from "next/router";
import { FilePreviewPage } from "../../../../../features/file/FilePreviewPage";

const Blob = () => {
  const router = useRouter();
  const { path, branch } = router.query;

  if (!branch || !path) return <></>;

  return <FilePreviewPage branch={branch as string} blobPath={(path as string[]).join("/")} />;
};

export default Blob;
