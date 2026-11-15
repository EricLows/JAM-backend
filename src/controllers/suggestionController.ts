import type { Context } from "hono";
import { SuggestionService } from "@/services/suggestionService";
import { ControllerResponse, JamResponse } from "@/lib/validator";
import { Suggestion } from "@/types/suggestion";

class SuggestionController {
  /*
   * Registra uma sugestão
   */
  async postSuggestion(c: Context): Promise<Response> {
    try {
      const { name, message } = await c.req
        .json()
        .catch(() => ({ name: undefined, message: undefined }));
      const response = await SuggestionService.postSuggestion(message, name);

      return Response.json({ id: response }, { status: 201 });
    } catch (e) {
      throw e;
    }
  }

  /*
   * Busca as sugestões registradas
   */
  async getSuggestions(c: Context): Promise<Response> {
    try {
      const { page, pageSize } = c.req.query();
      const suggestions = await SuggestionService.getSuggestions(
        Number(page),
        Number(pageSize),
      );

      return Response.json(
        new JamResponse({
          data: suggestions,
        }),
        { status: 200 },
      );
    } catch (e) {
      throw e;
    }
  }
}

export { SuggestionController };
