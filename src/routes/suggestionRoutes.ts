import { validate } from "@/lib/validator.ts";
import { SuggestionController } from "../controllers/suggestionController";
import { Router } from "express";
import { SuggestionValidator } from "@/validators/suggestionValidator.ts";
import { validateToken } from "@/lib/token.ts";

const suggestionController = new SuggestionController();

const suggestionRouter = Router();

suggestionRouter.post(
  "/",
  validate(SuggestionValidator.postSuggestion),
  suggestionController.postSuggestion as any,
);

suggestionRouter.get(
  "/",
  validateToken,
  validate(SuggestionValidator.getSuggestions),
  suggestionController.getSuggestions as any,
);

export default suggestionRouter;
