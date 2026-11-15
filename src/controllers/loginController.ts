import type { Context } from "hono";
import { LoginService } from "@/services/loginService";
import { LogService } from "@/services/logService";
import { createValidToken } from "@/lib/token";
import { ControllerResponse, JamResponse } from "@/lib/validator";
import { User } from "@/types/user";

class LoginController {
  /*
   * Acessa uma conta, caso ela exista
   */
  async login(c: Context): ControllerResponse<User> {
    try {
      const authHeader = c.req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Basic ")) {
        return Response.json(
          new JamResponse({ message: "Autenticação inválida" }),
          { status: 401 },
        );
      }

      const base64Credentials = authHeader.split(" ")[1];
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "utf-8",
      );
      const [email, password] = credentials.split(":");

      if (!email?.length) {
        return Response.json(
          new JamResponse<User>({
            message: "Informe um e-mail",
            field: "email",
          }),
          { status: 403 },
        );
      }

      if (!password?.length) {
        return Response.json(
          new JamResponse<User>({
            message: "Informe sua senha",
            field: "password",
          }),
          { status: 403 },
        );
      }

      const user = await LoginService.login(email, password);
      const token = createValidToken({
        id: user.id,
        username: user.username,
        email: user.email,
      });

      await LogService.log(
        "Usuário",
        `"${user.username}" entrou na sua conta.`,
      );

      return Response.json(
        new JamResponse<User>({
          data: {
            token,
            userName: user.username,
            avatar: user.avatar,
          },
        }),
        { status: 200 },
      );
    } catch (e) {
      throw e;
    }
  }

  /*
   * Registra uma conta com um determinado e-mail, nome de usuário,
   * senha e foto de perfil
   */
  async register(c: Context): ControllerResponse<Number> {
    try {
      const body = await c.req.json().catch(() => ({}));
      const { username, email, password, passwordConfirm } = body;

      const emailExists = await LoginService.emailExists(email);
      if (emailExists) {
        return Response.json(
          new JamResponse({
            field: "email",
            message: "E-mail já cadastrado",
          }),
          { status: 401 },
        );
      }

      if (password != passwordConfirm) {
        return Response.json(
          new JamResponse({
            field: "passwordConfirm",
            message: "Confirme sua senha corretamente",
          }),
          { status: 401 },
        );
      }

      const id = await LoginService.register(username, email, password);

      return Response.json(
        new JamResponse({
          data: id,
        }),
        { status: 200 },
      );
    } catch (e) {
      throw e;
    }
  }
}

export { LoginController };
