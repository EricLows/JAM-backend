import type { Context } from "hono";
import { JamResponse } from "./validator";

export class JamError extends Error {
  public statusCode: number;
  public message: string;
  public field: string;
  public metadata: string;

  constructor(
    statusCode: number,
    message?: string,
    field?: string,
    metadata?: string,
  ) {
    super();
    this.statusCode = statusCode;
    this.message = message ?? "";
    this.field = field ?? "";
    this.metadata = metadata ?? "";
  }
}

/**
 * Tratador de erros customizado do Hono
 */
export const handleError = (err: JamError, c: Context) => {
  let { statusCode, message, field, metadata } = err;

  console.log(err.message);
  console.log(err.stack);

  if (!statusCode) {
    statusCode = 500;
    message = err.message;
    metadata = err.stack ?? "";
  }

  return c.json(
    new JamResponse({
      message,
      field,
      metadata,
    }),
    statusCode as any,
  );
};
