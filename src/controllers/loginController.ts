import type { Request, Response, NextFunction } from "express";
import { LoginService } from "@/services/loginService";
import { RequestErrorTypes } from "@/lib/consts";

class LoginController {
    async login(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Basic ')) {
                return res.status(401).json({ message: 'Autenticação inválida' });
            }

            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
            const [username, password] = credentials.split(':');

            if (username != 'admin') {
                return res.status(401).json({
                    message: 'Conta não existe'
                });                
            }

            if (password != '123') {
                return res.status(401).json({
                    message: 'Senha inválida'
                });
            }

            return res.status(200).json({
                token: 'Sucesso',
            });
        } catch (err: any) {
            next(err);
        }
    }

    async register(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { username, email, password, passwordConfirm } = req.body;

            const emailExists = await LoginService.emailExists(email);
            if (emailExists) {
                res.status(401).json({
                    errors: [
                        {
                            path: 'email',
                            type: RequestErrorTypes.AlreadyExists
                        }
                    ]
                });
            }

            if (password != passwordConfirm) {
                res.status(401).json({
                    errors: [
                        {
                            path: 'passwordConfirm',
                            type: RequestErrorTypes.NoMatch
                        }
                    ]
                });
            }

            const id = await LoginService.register(
                username,
                email,
                password
            )

            res.status(200).json({
                id
            });
        } catch (err: any) {
            next(err);
        }
    }
}

export { LoginController };
