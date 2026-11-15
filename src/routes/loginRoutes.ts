import { Hono } from "hono";
import { validate } from "@/lib/validator";
import { LoginController } from "../controllers/loginController";
import { LoginValidator } from "@/validators/loginValidator";

const loginController = new LoginController();

const loginRouter = new Hono();

loginRouter.get("/", (c) => loginController.login(c));
loginRouter.post("/register", validate(LoginValidator.register), (c) => loginController.register(c));

export default loginRouter;
