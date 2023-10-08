import axios from "axios";
import { config } from "../config";

export const gitServerHttpClient = axios.create({
  baseURL: config.gitServer.url,
});
