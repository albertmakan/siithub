import axios from "axios";
import { type Repository } from "../repository/repository.service";

function addStarFor(repositoryId: Repository["_id"]) {
  return () => axios.post(`/api/repositories/${repositoryId}/star`);
}
function removeStarFor(repositoryId: Repository["_id"]) {
  return () => axios.delete(`/api/repositories/${repositoryId}/star`);
}
function getStar(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/star`);
}
function getStargazers(repositoryId: Repository["_id"]) {
  return axios.get(`/api/repositories/${repositoryId}/star/all`);
}

export { addStarFor, removeStarFor, getStar, getStargazers };
