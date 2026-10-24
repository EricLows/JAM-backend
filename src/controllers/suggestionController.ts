import type { Request, Response, NextFunction } from "express";
import { SuggestionService } from "@/services/suggestionService";
import { SuggestionValidator } from "@/validators/suggestionValidator";
import { ControllerResponse, JamResponse, TypedRequest } from "@/lib/validator";
import { Suggestion } from "@/types/suggestion";

class SuggestionController {
  /*
   * Registra uma sugestão
   */
  async postSuggestion(
    req: TypedRequest<typeof SuggestionValidator.postSuggestion>,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<Suggestion[]> {
    try {
      const { name, message } = req.body;
      const response = await SuggestionService.postSuggestion(message, name);

      return res.status(201).send({id: response});
    } catch (e) {
      next(e);
    }
  }

  /*
   * Busca as sugestões registradas
   */
  async getSuggestions(
    req: TypedRequest<typeof SuggestionValidator.getSuggestions>,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<Suggestion[]> {
    try {
      const { page, pageSize } = req.query;
      const suggestions = await SuggestionService.getSuggestions(Number(page), Number(pageSize));

      return res.status(200).json(
        new JamResponse({
          data: suggestions,
        }),
      );
    } catch (e) {
      next(e);
    }
  }
}

export { SuggestionController };
