import { tagTable } from "@/db/schema";
import { asc } from "drizzle-orm";
import { Tag } from "@/types/tag";
import { createDb } from "../db/db";

const TagService = {
  /*
   * Registra uma tag
   */
  async postTag({ name }): Promise<number> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    const [result] = await db
      .insert(tagTable)
      .values({
        name,
      })
      .returning()
      .prepare("post_tag")
      .execute();

    await client.close();
    return result.id;
  },

  /*
   * Busca as tags registradas
   */
  async getTags(): Promise<Tag[]> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    const results = await db
      .select()
      .from(tagTable)
      .orderBy(asc(tagTable.id))
      .prepare("get_tags")
      .execute();
      
    await client.close();
    return results;
  },
};

export { TagService };
