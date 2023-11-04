import dotenv from "dotenv";

dotenv.config();

export const awsConfig = {
  region: process.env.REGION,
} as const;
