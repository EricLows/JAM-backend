import { z } from "zod/v3";

export const TagValidator = {
  postTag: z.object({
    body: z.strictObject({
      name: z.string({
        errorMap: () => ({ message: 'Forneça um nome' })
      }),
    }),
  }),

  getTags: z.object({})
};
