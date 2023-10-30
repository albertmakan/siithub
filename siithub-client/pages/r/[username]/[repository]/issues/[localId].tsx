import { useRouter } from "next/router";
import { IssuePage } from "../../../../../features/issues/IssuePage";
import { IssueContextProvider } from "../../../../../features/issues/IssueContext";

const Issue = () => {
  const router = useRouter();
  const { localId } = router.query;

  return (
    <IssueContextProvider>
      <IssuePage existingIssueId={+(localId?.toString() ?? "0")} />
    </IssueContextProvider>
  );
};

export default Issue;
