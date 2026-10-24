import { zodErrorMap } from "@/lib/validator";
import { z } from "zod/v3";

export const SuggestionValidator = {
  postSuggestion: z.object({
    body: z.strictObject({
      name: z.string().optional(),
      message: z.string({
        errorMap: () => ({ message: 'Escreva uma sugestão' })
      }),
    }),
  }),

  getSuggestions: z.object({
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
