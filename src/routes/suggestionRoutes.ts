import { Hono } from "hono";
import { validate } from "@/lib/validator";
import { SuggestionController } from "../controllers/suggestionController";
import { SuggestionValidator } from "@/validators/suggestionValidator";
import { validateToken } from "@/lib/token";

const suggestionController = new SuggestionController();

const suggestionRouter = new Hono();

suggestionRouter.post("/", validate(SuggestionValidator.postSuggestion), (c) => suggestionController.postSuggestion(c));
suggestionRouter.get("/", validateToken, validate(SuggestionValidator.getSuggestions), (c) => suggestionController.getSuggestions(c));

export default suggestionRouter;
