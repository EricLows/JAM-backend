import e, { NextFunction } from "express";
import z, { AnyZodObject } from "zod/v3";
import { RequestErrorTypes } from "./consts";

export const RequestSchema = {
  body: z.any().optional(),
  query: z.any().optional(),
  params: z.any().optional(),
  headers: z.any().optional(),
  cookies: z.any().optional(),
};

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

      return res.status(400).json({
        errors: result.error.errors.map((error) => ({
          path: error.path[error.path.length - 1],
          type: error.message,
        })),
      });
    }

    req.data = result.data;

    next();
  };
}

export function validateErrorManager(
  issue: z.ZodIssueOptionalMessage,
  ctx: z.ErrorMapCtx,
) {
  console.log(issue.message);

  if (issue.code === "invalid_type") {
    console.log(`Expected ${issue.expected}, received ${issue.received}`);
    return { message: RequestErrorTypes.InvalidType };
  }

  if (issue.code === "invalid_string") {
    return { message: RequestErrorTypes.InvalidFormat };
  }

  if (!ctx.data) {
    return { message: RequestErrorTypes.NoData };
  }

  return {
    message: issue.message,
  };
}

export type RequestSchemaType = typeof RequestSchema;
