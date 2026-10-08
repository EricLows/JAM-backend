import { zodErrorMap } from "@/lib/validator";
import { z } from "zod/v3";

export const LogValidator = {
  getLogs: z.object({
    query: z.object({
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
