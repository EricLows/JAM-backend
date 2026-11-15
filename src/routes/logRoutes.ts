import { Hono } from "hono";
import { validate } from "@/lib/validator.ts";
import { LogController } from "../controllers/logController.ts";
import { LogValidator } from "@/validators/logValidator.ts";
import { validateToken } from "@/lib/token.ts";

const logController = new LogController();

const logRouter = new Hono();

logRouter.get("/", validateToken, validate(LogValidator.getLogs), (c) => logController.getLogs(c));

export default logRouter;
