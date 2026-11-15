import { Hono } from "hono";
import { validate } from "@/lib/validator.ts";
import { TagController } from "../controllers/tagController";
import { TagValidator } from "@/validators/tagValidator.ts";
import { validateToken } from "@/lib/token.ts";

const tagController = new TagController();

const tagRouter = new Hono();

tagRouter.post("/", validate(TagValidator.postTag), (c) => tagController.postTag(c));
tagRouter.get("/", validate(TagValidator.getTags), (c) => tagController.getTags(c));

export default tagRouter;
