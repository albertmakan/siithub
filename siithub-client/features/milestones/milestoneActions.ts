import axios from "axios";
import { z } from "zod";
import { type Repository } from "../repository/repository.service";

const milestoneBodySchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().default(""),
  dueDate: z.nullable(z.string()),
});

type CreateMilestone = z.infer<typeof milestoneBodySchema>;
type UpdateMilestone = CreateMilestone;
type Milestone = CreateMilestone & {
  _id: string;
  localId: number;
  isOpen: boolean;
  issuesInfo: {
    open: number;
    closed: number;
    lastUpdated: Date;
  };
};

function getRepositoryMilestones(repositoryId: Repository["_id"], open?: boolean) {
  return axios.get(`/api/repositories/${repositoryId}/milestones`, {
    params: open === undefined ? {} : { state: open ? "open" : "closed" },
  });
}
function getMilestone(repositoryId: Repository["_id"], localId: number) {
  return axios.get(`/api/repositories/${repositoryId}/milestones/${localId}`);
}
function createMilestoneFor(repositoryId: Repository["_id"]) {
  return (milestone: CreateMilestone) => axios.post(`/api/repositories/${repositoryId}/milestones`, milestone);
}
function updateMilestoneFor(repositoryId: Repository["_id"], localId: number) {
  return (milestone: UpdateMilestone) =>
    axios.put(`/api/repositories/${repositoryId}/milestones/${localId}`, milestone);
}
function deleteMilestoneFor(repositoryId: Repository["_id"]) {
  return (milestone: Milestone) => axios.delete(`/api/repositories/${repositoryId}/milestones/${milestone.localId}`);
}
function closeMilestoneFor(repositoryId: Repository["_id"]) {
  return (milestone: Milestone) =>
    axios.put(`/api/repositories/${repositoryId}/milestones/${milestone?.localId}/close`);
}
function openMilestoneFor(repositoryId: Repository["_id"]) {
  return (milestone: Milestone) => axios.put(`/api/repositories/${repositoryId}/milestones/${milestone.localId}/open`);
}

export {
  milestoneBodySchema,
  createMilestoneFor,
  updateMilestoneFor,
  deleteMilestoneFor,
  getRepositoryMilestones,
  getMilestone,
  closeMilestoneFor,
  openMilestoneFor,
};

export type { CreateMilestone, UpdateMilestone, Milestone };
