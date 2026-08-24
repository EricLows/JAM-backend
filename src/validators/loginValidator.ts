import { validateErrorManager } from "@/lib/validator";
import { z } from "zod/v3";

export const LoginValidator = {
  register: z.object({
    body: z.object({
      username: z.string({
        errorMap: validateErrorManager,
      }).min(1),
      email: z.string({
        errorMap: validateErrorManager,
      }).email(),
      password: z.string({
        errorMap: validateErrorManager,
      }).min(1),
      passwordConfirm: z.string({
        errorMap: validateErrorManager,
      }).min(1),
    }),
  }),
};
