import { zodErrorMap } from "@/lib/validator";
import { z } from "zod/v3";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const JaimeValidator = {
  postJaimePhoto: z.strictObject({
    photo: z
      .instanceof(File, { message: "Insira uma foto" })
      .refine((file) => file.size <= MAX_FILE_SIZE, "Tamanho máximo de 20MB")
      .refine(
        (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "Insira um arquivo de imagem",
      ),
  }),

  postJaimeVideo: z.strictObject({
    name:  z.string({ message: "Insira um nome pro vídeo" }),
    video: z
      .instanceof(File, { message: "Insira um vídeo" })
      .refine((file) => file.size <= MAX_FILE_SIZE, "Tamanho máximo de 20MB")
      .refine(
        (file) => ["video/mp4"].includes(file.type),
        "Insira um arquivo de vídeo",
      ),
  }),

  getJaimePhotos: z.object({}),
  getJaimeVideos: z.object({}),
};
