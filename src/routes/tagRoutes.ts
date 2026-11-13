import { validate } from "@/lib/validator.ts";
import { TagController } from "../controllers/tagController";
import { Router } from "express";
import { TagValidator } from "@/validators/tagValidator.ts";
import { validateToken } from "@/lib/token.ts";

const tagController = new TagController();

const tagRouter = Router();

tagRouter.post(
  "/",
  validate(TagValidator.postTag),
  tagController.postTag as any,
);

tagRouter.get(
  "/",
  validateToken,
  validate(TagValidator.getTags),
  tagController.getTags as any,
);

export default tagRouter;
