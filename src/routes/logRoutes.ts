import { validate } from "@/lib/validator.ts";
import { LogController } from "../controllers/logController.ts";
import { Router } from "express";
import { LogValidator } from "@/validators/logValidator.ts";
import { validateToken } from "@/lib/token.ts";

const logController = new LogController();

const logRouter = Router();

logRouter.get(
  "/",
  validateToken,
  validate(LogValidator.getLogs),
  logController.getLogs as any,
);

export default logRouter;
