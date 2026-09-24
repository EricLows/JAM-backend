import z, { AnyZodObject } from "zod/v3";
import { RequestErrorTypes } from "./consts";
import type { Response, NextFunction, Request } from "express";
import jwt from "jsonwebtoken";
import { usersTable } from "@/db/schema";
import { db } from "..";
import { and, eq } from "drizzle-orm";

export function createValidToken(data: object) {
  const jwtKey = process.env.JWT_KEY;
  try {
    return jwt.sign(data, jwtKey);
  } catch (e) {}
}

export async function validateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const jwtKey = process.env.JWT_KEY;
  
  try {
    const data = jwt.verify(req.get('auth'), jwtKey);
    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, data.id), eq(usersTable.email, data.email)))
      .limit(1);

    if (!user) {
      throw "Usuário não encontrado";
    }
  } catch (e) {
    res.status(400).send({message: 'Token inválido'});
  }

  next();
}

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

export const zodErrorMap: z.ZodErrorMap = (issue, ctx) => {
  const result = validateErrorManager(issue, ctx);

  return {
    message: result.message ?? ctx.defaultError,
  };
};

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

export type TypedRequest<T extends z.ZodType> = Request<
  z.infer<T>["params"],
  any,
  z.infer<T>["body"],
  z.infer<T>["query"]
>;
