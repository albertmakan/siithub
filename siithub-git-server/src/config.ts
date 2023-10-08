import dotenv from "dotenv";

dotenv.config();

export const homePath = "/home";
export const collabFile = "collaborators.txt";

export const config = {
  port: process.env.PORT,
};
