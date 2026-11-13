import { ReqFile } from "@/types/file";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import "dotenv/config";

export const storage = new S3Client({
  region: "auto",

  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,

  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export const bucket = process.env.R2_BUCKET!;

export type FileStorage = {
  key: string,
  fileName: string,
  fileUrl: string,
}

/*
 * Salva um arquivo no storage
 */
export async function uploadFile(reqFile: ReqFile): Promise<FileStorage> {
  const file = Buffer.from(reqFile.buffer);
  const fileName = reqFile.originalname;
  const contentType = reqFile.mimetype;
  const key = `${randomUUID()}-${fileName}`;

  if (!process.env.R2_PUBLIC_URL) {
    throw 'Sem URl de acesso público de arquivos!'
  }

  await storage.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: contentType,
    }),
  );

  const fileUrl = `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;

  return {
    key,
    fileName,
    fileUrl,
  };
}

/*
 * Busca um arquivo no storage
 */
export async function getFile(key: string) {
  const response = await storage.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("Arquivo não encontrado");
  }

  if (!process.env.R2_PUBLIC_URL) {
    throw 'Sem URl de acesso público de arquivos!'
  }

  const fileUrl = `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;

  return {
    body: response.Body,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    fileUrl,
  };
}

/*
 * Deleta um arquivo no storage
 */
export async function deleteFile(key: string) {
  await storage.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  return {
    success: true,
  };
}
