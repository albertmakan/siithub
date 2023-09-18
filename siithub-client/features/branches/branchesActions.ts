import axios from "axios";

export type Branch = string;

function getBranches(username: string, repoName: string, name?: string) {
  return axios.get(`/api/${username}/${repoName}/branches`, { params: { name } });
}

function createBranch(username: string, repoName: string) {
  return ({ branchName, source }: { source: string; branchName: string }) =>
    axios.post(`/api/${username}/${repoName}/branches`, {
      source,
      branchName,
    });
}

function renameBranch(username: string, repoName: string) {
  return ({ branchName, newBranchName }: { branchName: string; newBranchName: string }) =>
    axios.put(`/api/${username}/${repoName}/branches/${encodeURIComponent(branchName)}`, {
      newBranchName,
    });
}

function changeDefaultBranch(username: string, repoName: string) {
  return (newDefaultBranch: string) =>
    axios.put(`/api/repositories/${username}/${repoName}/default-branch`, {
      newBranchName: newDefaultBranch,
    });
}

function removeBranch(username: string, repoName: string) {
  return (branchName: string) =>
    axios.delete(`/api/${username}/${repoName}/branches/${encodeURIComponent(branchName)}`);
}

export { getBranches, createBranch, renameBranch, changeDefaultBranch, removeBranch };
