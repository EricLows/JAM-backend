import type { Request, Response, NextFunction } from "express";
import { LoginService } from "@/services/loginService";
import { RequestErrorTypes } from "@/lib/consts";
import jwt from 'jsonwebtoken';

class LoginController {

    async login(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const authHeader = req.headers.authorization;
            const jwtKey = process.env.JWT_KEY;

            if (!authHeader || !authHeader.startsWith('Basic ')) {
                return res.status(401).json({ message: 'Autenticação inválida' });
            }

            const base64Credentials = authHeader.split(' ')[1];
            const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
            const [email, password] = credentials.split(':');

            const user = await LoginService.login(email, password);
            const token = jwt.sign({ 
                id: user.id,
                username: user.username,
                email: user.email,
             }, jwtKey);

            return res.status(200).json({
                token,
                avatar: user.avatar,
            });
        } catch (e) {
            next(e);
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
        } catch (e) {
            next(e);
        }
    }
}

export { LoginController };
