import { suggestionTable } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Suggestion } from "@/types/suggestion";
import { createDb } from "../db/db";

const SuggestionService = {
  /*
   * Registra um suggestion
   */
  async postSuggestion(message: string, name?: string): Promise<number> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    const [result] = await db
      .insert(suggestionTable)
      .values({
        name,
        message,
      })
      .returning()
      .prepare("post_suggestion")
      .execute();

    await client.close();
    return result.id;
  },

  /*
   * Busca os suggestions registrados
   */
  async getSuggestions(
    page: number = 1,
    pageSize: number = 50,
  ): Promise<Suggestion[]> {
    const [db, client] = createDb(process.env.DB_CONNECTION, true);
    const results = await db
      .select()
      .from(suggestionTable)
      .orderBy(desc(suggestionTable.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .prepare("get_suggestions")
      .execute();

    await client.close();
    return results;
  },
};

export { SuggestionService };
