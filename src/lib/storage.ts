import { ReqFile } from "@/types/file";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import "dotenv/config";
import { JamLog } from "./error";

const DEFAULT_IMAGE_WIDTH = 1600;
const DEFAULT_IMAGE_HEIGHT = 900;

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
  key: string;
  fileName: string;
  fileUrl: string;
};

/*
 * Salva um arquivo no storage
 */
export async function uploadFile(
  repository: string,
  file: File,
  fileName: string,
): Promise<FileStorage> {
  JamLog("  Obtendo dados e gerando chave");

  const contentType = file.type;
  const key = `${repository}/${randomUUID()}-${fileName}`;

  JamLog("  Dados obtidos");

  if (!process.env.R2_PUBLIC_URL) {
    throw "Sem URl de acesso público de arquivos!";
  }

  // TODO - compressão de imagem

  JamLog("  Obtendo URL");
  const fileUrl = getFileUrl(key);
  JamLog("  URL obtida, obtendo array de bytes");
  const body = new Uint8Array(await file.arrayBuffer());
  JamLog("  Array obtido, subindo imagem");
  await storage.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  JamLog("  Imagem subiu com sucesso, retornando");
  return {
    key,
    fileName,
    fileUrl,
  };
}

export function getFileUrl(key: string) {
  if (!process.env.R2_PUBLIC_URL) {
    throw "Sem URl de acesso público de arquivos!";
  }

  const fileUrl = `${process.env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

  return fileUrl;
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

  const fileUrl = getFileUrl(key);

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

export async function compressImage(
  input: Buffer,
  resize: boolean = false,
): Promise<Buffer> {
  // TODO - Refazer compressor
  /*
  let result = sharp(input);

  // Corrige orientação EXIF automaticamente
  result = result.rotate();

  // Redimensiona a imagem
  if (resize) {
    result = result.resize(DEFAULT_IMAGE_WIDTH, DEFAULT_IMAGE_HEIGHT, {
      fit: "cover",
      position: "centre",
    });
  }

  // Converte para JPEG e comprime
  result = result.jpeg({
    quality: 85,
    progressive: true,
  });

  return result.toBuffer();
  */

  return input;
}
