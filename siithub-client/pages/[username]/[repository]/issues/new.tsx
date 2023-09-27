import { IssueContextProvider } from "../../../../features/issues/IssueContext";
import { IssuePage } from "../../../../features/issues/IssuePage";

const Labels = () => (
  <IssueContextProvider>
    <IssuePage />
  </IssueContextProvider>
);

export default Labels;
