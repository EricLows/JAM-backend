import { zodErrorMap } from "@/lib/validator";
import { z } from "zod/v3";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export const MeetingValidator = {
  postMeeting: z.strictObject({
    title: z.string().min(1, "Forneça um título"),
    description: z.string().min(1, "Forneça uma descrição"),
    responsible: z.string().min(1, "Informe o apresentador"),
    date: z.coerce.date({
      errorMap: () => ({ message: "Informe a data" }),
    }),
    tags: z.string().optional(),
    coverPhoto: z
      .instanceof(File, { message: "Insira a foto da capa" })
      .refine((file) => file.size <= MAX_FILE_SIZE, "Tamanho máximo de 20MB")
      .refine(
        (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
        "Insira um arquivo de imagem",
      ),
    pdf: z
      .instanceof(File)
      .refine((file) => file.size <= MAX_FILE_SIZE, "Tamanho máximo de 20MB")
      .refine(
        (file) => ["application/pdf"].includes(file.type),
        "Insira um arquivo PDF",
      )
      .optional(),
    photos: z
      .array(
        z
          .instanceof(File)
          .refine(
            (file) => file.size <= MAX_FILE_SIZE,
            "Tamanho máximo de 20MB",
          )
          .refine(
            (file) =>
              ["image/jpeg", "image/png", "image/webp"].includes(file.type),
            "Insira um arquivo de imagem",
          ),
      )
      .optional(),
  }),

  getMeetings: z.object({
    query: z.strictObject({
      page: z.coerce
        .number({
          errorMap: zodErrorMap,
        })
        .optional()
        .default(1),
      pageSize: z.coerce
        .number({
          errorMap: zodErrorMap,
        })
        .optional()
        .default(50),
      search: z.string().optional(),
      minDate: z.coerce.date().optional(),
      maxDate: z.coerce.date().optional(),
      tags: z.string().optional(),
    }),
  }),

  getMeeting: z.object({
    params: z.strictObject({
      id: z.coerce.number({
        errorMap: zodErrorMap,
      }),
    }),
  }),
};
