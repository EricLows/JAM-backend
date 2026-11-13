import { tagTable } from "@/db/schema";
import { db } from "..";
import { asc } from "drizzle-orm";
import { Tag } from "@/types/tag";

const TagService = {
  /*
   * Registra uma tag
   */
  async postTag({
    name,
  }): Promise<number> {
    const [result] = await db
      .insert(tagTable)
      .values({
        name,
      })
      .returning();

    return result.id;
  },

  /*
   * Busca as tags registradas
   */
  async getTags(): Promise<Tag[]> {
    const results = await db
      .select()
      .from(tagTable)
      .orderBy(asc(tagTable.id))
    return results;
  },
};

export { TagService };
