import axios from "axios";
import { type Repository } from "../repository/repository.service";
import { type User } from "../users/user.model";

type AddCollaborator = { userId: User["_id"] };
type RemoveCollaborator = AddCollaborator;

type Collaborator = AddCollaborator & {
  _id: string;
  repositoryId: Repository["_id"];
  verified: boolean;
  user: User;
};

function searchCollaborators(repositoryId: Repository["_id"], name: string = "") {
  return axios.get(`/api/repositories/${repositoryId}/collaborators`, { params: { name } });
}

function addCollaborator(repositoryId: Repository["_id"]) {
  return (collaborator: AddCollaborator) => axios.post(`/api/repositories/${repositoryId}/collaborators`, collaborator);
}

function removeCollaborator(repositoryId: Repository["_id"]) {
  return (collaborator: RemoveCollaborator) =>
    axios.delete(`/api/repositories/${repositoryId}/collaborators/${collaborator.userId}`);
}

function verifyCollaborator(repositoryId: Repository["_id"]) {
  return () => axios.put(`/api/repositories/${repositoryId}/collaborators/verify`);
}

function getCollaborator(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/collaborators/me`);
}

export { searchCollaborators, addCollaborator, removeCollaborator, verifyCollaborator, getCollaborator };
export type { AddCollaborator, RemoveCollaborator, Collaborator };
