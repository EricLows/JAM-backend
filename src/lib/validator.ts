import z, { AnyZodObject } from "zod/v3";
import { RequestErrorTypes } from "./consts";
import type { Context, Next } from "hono";
import type { ReqFile } from "@/types/file";

declare module "hono" {
  interface ContextVariableMap {
    uploadedFiles: Record<string, ReqFile[]>;
  }
}

/*
 * Formato de request tipado
 */
export type TypedRequest<T extends z.ZodType> = {
  body: z.infer<T>["body"];
  params: z.infer<T>["params"];
  query: z.infer<T>["query"];
  headers: Record<string, string | undefined>;
  cookies: Record<string, string>;
};

export type ControllerResponse<T> = Promise<Response | undefined>;

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

const parseCookies = (cookieHeader: string): Record<string, string> => {
  if (!cookieHeader.trim()) {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, entry) => {
      const [key, ...value] = entry.split("=");
      acc[key] = decodeURIComponent(value.join("="));
      return acc;
    }, {});
};

const getRequestBody = async (c: Context) => {
  const contentType = c.req.header("content-type") ?? "";

  if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
    return await c.req.parseBody();
  }

  if (contentType.includes("application/json")) {
    try {
      return await c.req.json();
    } catch {
      return {};
    }
  }

  return {};
};

/*
 * Retorna uma função que valida o corpo de uma requisição
 */
export function validate(schema: AnyZodObject) {
  return async (c: Context, next: Next) => {
    const result = await schema.safeParseAsync({
      body: await getRequestBody(c),
      query: c.req.query(),
      params: c.req.param(),
      headers: c.req.header(),
      cookies: parseCookies(c.req.header("Cookie") ?? ""),
    });

    if (!result.success) {
      console.dir(result.error, { depth: null });

      const error = result.error.errors[0];
      const field = error.path[error.path.length - 1]?.toString() ?? "field";

      return c.json(
        new JamResponse({
          field,
          message: error.message,
        }),
        400,
      );
    }

    await next();
  };
}

const maxFileSize = 100 * 1024 * 1024;

/*
 * Middleware multipart compatível com Hono, que prepara arquivos no formato
 * esperado pelos serviços de upload.
 */
export const multerUpload = {
  fields(fields: { name: string; maxCount?: number }[]) {
    const allowedFields = new Map(fields.map((field) => [field.name, field]));

    return async (c: Context, next: Next) => {
      const body = await c.req.parseBody({ all: true });
      const uploadedFiles: Record<string, ReqFile[]> = Object.fromEntries(
        fields.map(({ name }) => [name, []]),
      );

      for (const [fieldname, value] of Object.entries(body)) {
        const values = Array.isArray(value) ? value : [value];
        const files = values.filter(
          (entry): entry is File =>
            typeof entry !== "string" && entry.name !== "",
        );

        if (files.length === 0) {
          continue;
        }

        const field = allowedFields.get(fieldname);
        if (!field) {
          return c.json(
            new JamResponse({
              field: fieldname,
              message: `Campo de arquivo não permitido: ${fieldname}`,
            }),
            400,
          );
        }

        if (
          field.maxCount !== undefined &&
          uploadedFiles[fieldname].length + files.length > field.maxCount
        ) {
          return c.json(
            new JamResponse({
              field: fieldname,
              message: `Número máximo de arquivos excedido: ${fieldname}`,
            }),
            400,
          );
        }

        for (const file of files) {
          if (file.size > maxFileSize) {
            return c.json(
              new JamResponse({
                field: fieldname,
                message: "O arquivo excede o limite de 100 MB",
              }),
              413,
            );
          }

          uploadedFiles[fieldname].push({
            fieldname,
            originalname: file.name,
            encoding: "7bit",
            mimetype: file.type,
            buffer: new Uint8Array(await file.arrayBuffer()),
            size: file.size,
          });
        }
      }

      c.set("uploadedFiles", uploadedFiles);
      await next();
    };
  },
};

export const fileValidationSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  mimetype: z.string(),
  size: z.number(),
});