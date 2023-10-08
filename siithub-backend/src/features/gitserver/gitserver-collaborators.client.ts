import { gitServerHttpClient } from "../../utils/axios";

async function addCollaborator(owner: string, repo: string, collaborator: string): Promise<any> {
  return await gitServerHttpClient.post(`/api/repo/${owner}/${repo}/collaborators`, { collaborator });
}

async function removeCollaborator(owner: string, repo: string, collaborator: string): Promise<any> {
  return await gitServerHttpClient.delete(`/api/repo/${owner}/${repo}/collaborators/${collaborator}`);
}

export type GitServerCollaboratorsClient = {
  addCollaborator(owner: string, repo: string, collaborator: string): Promise<any>;
  removeCollaborator(owner: string, repo: string, collaborator: string): Promise<any>;
};

const gitServerCollaboratorsClient: GitServerCollaboratorsClient = {
  addCollaborator,
  removeCollaborator,
};

export { gitServerCollaboratorsClient };
