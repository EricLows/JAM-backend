import type { Request, Response, NextFunction } from "express";
import { LoginService } from "@/services/loginService";
import { LogService } from "@/services/logService";
import { createValidToken } from "@/lib/token";
import { ControllerResponse, JamResponse } from "@/lib/validator";
import { User } from "@/types/user";

class LoginController {
  /*
   * Acessa uma conta, caso ela exista
   */
  async login(
    req: Request,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<User> {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Basic ")) {
        return res
          .status(401)
          .json(new JamResponse({ message: "Autenticação inválida" }));
      }

      const base64Credentials = authHeader.split(" ")[1];
      const credentials = Buffer.from(base64Credentials, "base64").toString(
        "utf-8",
      );
      const [email, password] = credentials.split(":");

      if(!email?.length) {
        return res.status(403).json(
          new JamResponse<User>({
            message: "Informe um e-mail",
            field: "email",
          }),
        );
      }

      if(!password?.length) {
        return res.status(403).json(
          new JamResponse<User>({
            message: "Informe sua senha",
            field: "password",
          }),
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

      return res.status(200).json(
        new JamResponse<User>({
          data: {
            token,
            userName: user.username,
            avatar: user.avatar,
          },
        }),
      );
    } catch (e) {
      next(e);
    }
  }

  /*
   * Registra uma conta com um determinado e-mail, nome de usuário,
   * senha e foto de perfil
   */
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<Number> {
    try {
      const { username, email, password, passwordConfirm } = req.body;

      const emailExists = await LoginService.emailExists(email);
      if (emailExists) {
        return res.status(401).json(
          new JamResponse({
            field: "email",
            message: "E-mail já cadastrado",
          }),
        );
      }

      if (password != passwordConfirm) {
        return res.status(401).json(
          new JamResponse({
            field: "passwordConfirm",
            message: "Confirme sua senha corretamente",
          }),
        );
      }

      const id = await LoginService.register(username, email, password);

      return res.status(200).json(
        new JamResponse({
          data: id,
        }),
      );
    } catch (e) {
      next(e);
    }
  }
}

export { LoginController };
