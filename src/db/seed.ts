import { eq } from "drizzle-orm";
import { usersTable } from "./schema";
import { db } from "..";

export async function seed() {
  console.log("Iniciando seed");

  const username = process.env.DEFAULT_ACCOUNT_NAME ?? "JAM admin";
  const email = process.env.DEFAULT_ACCOUNT_EMAIL ?? "jam.10.scb@gmail.com";
  const password = process.env.DEFAULT_ACCOUNT_PASSWORD ?? "123456789";

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!user.length) {
    await db.insert(usersTable).values({
      username,
      email,
      password,
      avatar: null,
    });

    console.log("Seed gerada!!");
  }
}
