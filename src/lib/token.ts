import jwt from "jsonwebtoken";
import { usersTable } from "@/db/schema";
import { db } from "..";
import { and, eq } from "drizzle-orm";
import type { Response, NextFunction, Request } from "express";
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
export async function validateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const jwtKey = process.env.JWT_KEY;

  try {
    const data = jwt.verify(req.get("auth"), jwtKey);
    const [user] = await db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, data.id), eq(usersTable.email, data.email)))
      .limit(1);

    if (!user) {
      throw "Usuário não encontrado";
    }
  } catch (e) {
    res.status(401).send(new JamResponse({ message: "Faça login para acessar esse recurso" }));
  }

  next();
}
