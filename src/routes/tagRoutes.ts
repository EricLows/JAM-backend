import { Hono } from "hono";
import { validate } from "@/lib/validator";
import { TagController } from "../controllers/tagController";
import { TagValidator } from "@/validators/tagValidator";
import { validateToken } from "@/lib/token";

const tagController = new TagController();

const tagRouter = new Hono();

tagRouter.post("/", validateToken, validate(TagValidator.postTag), (c) => tagController.postTag(c));
tagRouter.get("/", validate(TagValidator.getTags), (c) => tagController.getTags(c));

export default tagRouter;
