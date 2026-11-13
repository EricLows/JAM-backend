import { zodErrorMap } from "@/lib/validator";
import { z } from "zod/v3";

export const MeetingValidator = {
  postMeeting: z.object({
    body: z.object({
      title: z.string().min(1, 'Forneça um título' ),
      description: z.string().min(1, 'Forneça uma descrição'),
      responsible: z.string().min(1, 'Informe o apresentador'),
      date: z.coerce.date({
        errorMap: () => ({ message: 'Informe a data' })
      }),
      tags: z.array(
        z.coerce.number(),
      ).optional(),
    }),
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
    })
  })
};
