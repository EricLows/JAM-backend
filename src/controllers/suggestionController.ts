import type { Context } from "hono";
import { SuggestionService } from "@/services/suggestionService";
import { ControllerResponse, JamResponse, TypedRequest } from "@/lib/validator";
import { Suggestion } from "@/types/suggestion";
import { SuggestionValidator } from "../validators/suggestionValidator";

class SuggestionController {
  /*
   * Registra uma sugestão
   */
  async postSuggestion(c: Context): Promise<Response> {
    try {
      const { name, message } = await c.req
        .json<TypedRequest<typeof SuggestionValidator.postSuggestion>["body"]>()
        .catch(() => ({ name: undefined, message: undefined }));

      if (!message) {
        return c.json(
          new JamResponse({
            field: "message",
            message: "Insira uma mensagem",
          }),
          401,
        );
      }

      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const response = await SuggestionService.postSuggestion(message, name);

      return c.json({ id: response }, 201);
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

      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const suggestions = await SuggestionService.getSuggestions(
        Number(page),
        Number(pageSize),
      );

      return c.json(
        new JamResponse({
          data: suggestions,
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }
}

export { SuggestionController };
