import { validate } from "@/lib/validator.ts";
import { LoginController } from "../controllers/loginController.ts";
import { Router } from "express";
import { LoginValidator } from "@/validators/loginValidator.ts";

const loginController = new LoginController();

const loginRouter = Router();

loginRouter.get("/", loginController.login);
loginRouter.post(
  "/register",
  validate(LoginValidator.register),
  loginController.register as any,
);

export default loginRouter;
