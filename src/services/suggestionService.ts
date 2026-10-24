import { suggestionTable } from "@/db/schema";
import { db } from "..";
import { desc } from "drizzle-orm";
import { Suggestion } from "@/types/suggestion";

const SuggestionService = {
  /*
   * Registra um suggestion
   */
  async postSuggestion(message: string, name?: string): Promise<number> {
    const [result] = await db
      .insert(suggestionTable)
      .values({
        name,
        message,
      })
      .returning();

    return result.id;
  },

  /*
   * Busca os suggestions registrados
   */
  async getSuggestions(page: number = 1, pageSize: number = 50): Promise<Suggestion[]> {
    const results = await db
      .select()
      .from(suggestionTable)
      .orderBy(desc(suggestionTable.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize);
    return results;
  },
};

export { SuggestionService };
