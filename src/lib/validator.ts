import z, { AnyZodObject } from "zod/v3";
import { RequestErrorTypes } from "./consts";
import type { Request, Response } from "express";

 /*
  * Formato de request tipado
  */
export type TypedRequest<T extends z.ZodType> = Request<
  z.infer<T>["params"],
  any,
  z.infer<T>["body"],
  z.infer<T>["query"]
>;

export type ControllerResponse<T> = Promise<Response<JamResponse<T>, Record<string, any>> | undefined>;

 /*
  * Formato de resposta padrão para todas as requisições do sistema
  */
export class JamResponse<T> {
  data?: T;
  error?: {
    message: string;
    field?: string;
    metadata?: any;
  };

  constructor(data: {
    data?: T;
    message?: string;
    field?: string;
    metadata?: any;
  }) {
    this.data = data.data;
    if (data.message) {
      this.error = {
        message: data.message,
        field: data.field,
        metadata: data.metadata,
      };
    }
  }
}

 /*
  * Padroniza a mensagem de erro do validador do Zod
  */
export const zodErrorMap: z.ZodErrorMap = (issue, ctx) => {
  let message: string | undefined;
  
  console.log(issue.message);

  if (issue.code === "invalid_type") {
    console.log(`Expected ${issue.expected}, received ${issue.received}`);
    message = RequestErrorTypes.InvalidType;
  } else if (issue.code === "invalid_string") {
    message = RequestErrorTypes.InvalidFormat;
  } else if (!ctx.data) {
    message = RequestErrorTypes.NoData;
  } else {
    message = issue.message;
  }

  return {
    message: message ?? ctx.defaultError,
  };
};

 /*
  * Retorna uma função que valida o corpo de uma requisição
  */
export function validate(schema: AnyZodObject) {
  return async (req, res, next) => {
    const result = await schema.safeParseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
      cookies: req.cookies,
    });

    if (!result.success) {
      console.dir(result.error, { depth: null });

      const error = result.error.errors[0];
      return res.status(400).json(
        new JamResponse({
          field: error.path[error.path.length - 1].toString(),
          message: error.message,
        }),
      );
    }

    req.data = result.data;

    next();
  };
}
