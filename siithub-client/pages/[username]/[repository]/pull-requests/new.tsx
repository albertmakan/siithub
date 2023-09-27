import { NewPullRequestPage } from "../../../../features/pull-requests/NewPullRequestPage";
import { PullRequestContextProvider } from "../../../../features/pull-requests/PullRequestContext";

const NewPullRequest = () => (
  <PullRequestContextProvider>
    <NewPullRequestPage />
  </PullRequestContextProvider>
);

export default NewPullRequest;
