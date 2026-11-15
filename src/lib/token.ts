import jwt from "jsonwebtoken";
import { usersTable } from "@/db/schema";
import { db } from "..";
import { and, eq } from "drizzle-orm";
import type { Context, Next } from "hono";
import { JamResponse } from "./validator";

/*
 * Cria um token
 */
export function createValidToken(data: object) {
  const jwtKey = process.env.JWT_KEY;
  try {
    return jwt.sign(data, jwtKey);
  } catch (e) {}
}

/*
 * Valida um token
 */
export async function validateToken(c: Context, next: Next) {
  const jwtKey = process.env.JWT_KEY;

  try {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Token ausente");
    }

    const data = jwt.verify(authHeader.replace("Bearer ", ""), jwtKey) as {
      id: number;
      email: string;
    };

    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, data.id), eq(usersTable.email, data.email)))
      .limit(1);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    await next();
  } catch (e) {
    return c.json(new JamResponse({ message: "Faça login para acessar esse recurso" }), 401);
  }
}
