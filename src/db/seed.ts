import { eq } from "drizzle-orm";
import { usersTable, tagTable } from "./schema";
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
      avatar: "./src/assets/images/JAM.png",
    });
  }

  const tags = await db.select().from(tagTable);

  if (!tags.length) {
    const defaultTags = [
      { name: "Adoração" },
      { name: "Formação/Estudo" },
      { name: "Dinâmica" },
      { name: "Passeio/Visita" },
      { name: "Missa" },
      { name: "Diversão" },
      { name: "Game JAM" },
      { name: "Convidado" },
      { name: "Novena" },
      { name: "Evento/Festa" },
      { name: "Aniversário" },
      { name: "Casa de membro" },
      { name: "Filme/Documentário" },
    ];

    await db.insert(tagTable).values(defaultTags);
  }

  console.log("Seed gerada!!");
}
