import type { Request, Response, NextFunction } from "express";
import { TagService } from "@/services/tagService";
import { TagValidator } from "@/validators/tagValidator";
import { ControllerResponse, JamResponse, TypedRequest } from "@/lib/validator";
import { Tag } from "@/types/tag";

class TagController {
  /*
   * Registra uma tag de foto/encontro
   */
  async postTag(
    req: TypedRequest<typeof TagValidator.postTag>,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<Tag[]> {
    try {
      const { name } = req.body;
      const response = await TagService.postTag({
        name,
      });

      return res.status(201).send({ id: response });
    } catch (e) {
      next(e);
    }
  }

  /*
   * Busca uma lista de tags
   */
  async getTags(
    req: TypedRequest<typeof TagValidator.getTags>,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<Tag[]> {
    try {
      const tags = await TagService.getTags();

      return res.status(200).json(
        new JamResponse({
          data: tags,
        }),
      );
    } catch (e) {
      next(e);
    }
  }
}

export { TagController };
