import dotenv from "dotenv";

dotenv.config();

export const awsConfig = {
  credentials: {
    accessKeyId: process.env.ACCESS_KEY ?? "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY ?? "",
  },
  region: process.env.REGION,
} as const;
