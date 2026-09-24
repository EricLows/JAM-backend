import { zodErrorMap } from "@/lib/validator";
import { z } from "zod/v3";

export const LogValidator = {
  getLogs: z.object({
    params: z.object({
      page: z.coerce
        .number({
          errorMap: zodErrorMap,
        })
        .optional()
        .default(0),
      pageSize: z.coerce
        .number({
          errorMap: zodErrorMap,
        })
        .optional()
        .default(50),
    })
  })
};
