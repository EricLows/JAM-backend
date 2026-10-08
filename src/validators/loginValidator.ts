import { zodErrorMap } from "@/lib/validator";
import { z } from "zod/v3";

export const LoginValidator = {
  register: z.object({
    body: z.object({
      username: z.string({
        errorMap: zodErrorMap,
      }).min(1, "Informe o nome de usuário"),
      email: z.string({
        errorMap: zodErrorMap,
      }).email(),
      password: z.string({
        errorMap: zodErrorMap,
      }).min(1),
      passwordConfirm: z.string({
        errorMap: zodErrorMap,
      }).min(1),
    }),
  }),
};
