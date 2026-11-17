import { zodErrorMap } from "@/lib/validator";
import { z } from "zod/v3";

export const GalleryValidator = {
  getGallery: z.object({
    query: z.strictObject({
      search: z.string().optional(),
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
    }),
  }),
};
