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
  async login(c: Context): Promise<Response> {
    try {
      const authHeader = c.req.header("Authorization");

      if (!authHeader || !authHeader.startsWith("Basic ")) {
        return c.json(
          new JamResponse({ message: "Autenticação inválida" }),
          401,
        );
      }

      const base64Credentials = authHeader.split(" ")[1];
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "utf-8",
      );
      const [email, password] = credentials.split(":");

      if (!email?.length) {
        return c.json(
          new JamResponse<User>({
            message: "Informe um e-mail",
            field: "email",
          }),
          403,
        );
      }

      if (!password?.length) {
        return c.json(
          new JamResponse<User>({
            message: "Informe sua senha",
            field: "password",
          }),
          403,
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

      return c.json(
        new JamResponse<User>({
          data: {
            token,
            userName: user.username,
            avatar: user.avatar,
          },
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }

  /*
   * Registra uma conta com um determinado e-mail, nome de usuário,
   * senha e foto de perfil
   */
  async register(c: Context): Promise<Response> {
    try {
      const body = await c.req.json().catch(() => ({}));
      const { username, email, password, passwordConfirm } = body;

      const emailExists = await LoginService.emailExists(email);
      if (emailExists) {
        return c.json(
          new JamResponse({
            field: "email",
            message: "E-mail já cadastrado",
          }),
          401,
        );
      }

      if (password != passwordConfirm) {
        return c.json(
          new JamResponse({
            field: "passwordConfirm",
            message: "Confirme sua senha corretamente",
          }),
          401,
        );
      }

      const id = await LoginService.register(username, email, password);

      return c.json(
        new JamResponse({
          data: id,
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }
}

export { LoginController };
