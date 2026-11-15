import { Hono } from "hono";
import { validate } from "@/lib/validator.ts";
import { LoginController } from "../controllers/loginController.ts";
import { LoginValidator } from "@/validators/loginValidator.ts";

const loginController = new LoginController();

const loginRouter = new Hono();

loginRouter.get("/", (c) => loginController.login(c));
loginRouter.post("/register", validate(LoginValidator.register), (c) => loginController.register(c));

export default loginRouter;
