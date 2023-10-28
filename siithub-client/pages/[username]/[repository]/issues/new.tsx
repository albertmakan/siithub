import { IssueContextProvider } from "../../../../features/issues/IssueContext";
import { IssuePage } from "../../../../features/issues/IssuePage";

const NewIssue = () => (
  <IssueContextProvider>
    <IssuePage />
  </IssueContextProvider>
);

export default NewIssue;
