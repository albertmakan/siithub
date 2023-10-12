import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { awsConfig } from "./config";

const s3 = new S3Client(awsConfig);

const bucket = process.env.BUCKET ?? "";

const s3Storage = multerS3({
  s3,
  bucket,
  metadata: (req, file, cb) => {
    cb(null, { fieldname: file.fieldname });
  },
  key: (req, file, cb) => {
    const [, ext] = file.mimetype.split("/");
    cb(null, `${file.originalname}_${Date.now()}.${ext}`);
  },
});

export const uploadImage = multer({
  storage: s3Storage,
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith("image/")) callback(null, true);
    else callback(new Error("Not allowed"));
  },
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
});

export const getImage = async (key: string) => {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  const res = await s3.send(command);
  return res.Body;
};
