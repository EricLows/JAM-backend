import { Hono } from "hono";
import { validate } from "@/lib/validator";
import { LogController } from "../controllers/logController";
import { LogValidator } from "@/validators/logValidator";
import { validateToken } from "@/lib/token";

const logController = new LogController();

const logRouter = new Hono();

logRouter.get("/", validateToken, validate(LogValidator.getLogs), (c) => logController.getLogs(c));

export default logRouter;
