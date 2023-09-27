import axios from "axios";
import { type Repository } from "../repository/repository.service";

export type Branch = string;

function getBranches(repositoryId: Repository["_id"], name?: string) {
  return axios.get(`/api/repositories/${repositoryId}/branches`, { params: { name } });
}

function createBranch(repositoryId: Repository["_id"]) {
  return ({ branchName, source }: { source: string; branchName: string }) =>
    axios.post(`/api/repositories/${repositoryId}/branches`, { source, branchName });
}

function renameBranch(repositoryId: Repository["_id"]) {
  return ({ branchName, newBranchName }: { branchName: string; newBranchName: string }) =>
    axios.put(`/api/repositories/${repositoryId}/branches/${encodeURIComponent(branchName)}`, { newBranchName });
}

function removeBranch(repositoryId: Repository["_id"]) {
  return (branchName: string) =>
    axios.delete(`/api/repositories/${repositoryId}/branches/${encodeURIComponent(branchName)}`);
}

function changeDefaultBranch(repositoryId: Repository["_id"]) {
  return (newBranchName: string) => axios.put(`/api/repositories/${repositoryId}/default-branch`, { newBranchName });
}

export { getBranches, createBranch, renameBranch, changeDefaultBranch, removeBranch };
