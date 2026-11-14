import type { Request, Response, NextFunction } from "express";
import { MeetingService } from "@/services/meetingService";
import { MeetingValidator } from "@/validators/meetingValidator";
import { ControllerResponse, JamResponse, TypedRequest } from "@/lib/validator";
import { Meeting } from "@/types/meeting";

import type { ReqFile } from "@/types/file";

class MeetingController {
  /*
   * Registra um encontro
   */
  async postMeeting(
    req: TypedRequest<typeof MeetingValidator.postMeeting>,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<Meeting[]> {
    try {
      const { date, description, responsible, title, tags } = req.body;
      const files = req.files;

      let coverPhoto: ReqFile | undefined;
      let pdf: ReqFile | undefined;
      let photos: ReqFile[] = [];

      if (!files || !files['coverPhoto']) {
        return res.status(401).json(
          new JamResponse({
            field: "coverPhoto",
            message: "O encontro precisa de uma capa",
          }),
        );
      }

      if (files['coverPhoto']) {
        coverPhoto = files['coverPhoto'][0];
      }

      if (files['pdf']){
        pdf = files['pdf'][0];
      }

      if (files['photos']){
        photos.push(...files['photos']);
      }

      const response = await MeetingService.postMeeting({
        date,
        description,
        responsible,
        title,
        pdf,
        coverPhoto: coverPhoto!,
        photos,
        tags: tags ?? [],
      });

      return res.status(201).send({ id: response });
    } catch (e) {
      next(e);
    }
  }

  /*
   * Busca uma lista de encontros
   */
  async getMeetings(
    req: TypedRequest<typeof MeetingValidator.getMeetings>,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<Meeting[]> {
    try {
      const { page, pageSize } = req.query;
      const meetings = await MeetingService.getMeetings(
        Number(page),
        Number(pageSize),
      );

      return res.status(200).json(
        new JamResponse({
          data: meetings,
        }),
      );
    } catch (e) {
      next(e);
    }
  }

  /*
  * Busca um determinado encontro
  */
  async getMeeting(
    req: TypedRequest<typeof MeetingValidator.getMeeting>,
    res: Response,
    next: NextFunction,
  ): ControllerResponse<Meeting[]> {
    try {
      const { id } = req.params;
      const meeting = await MeetingService.getMeeting(
        Number(id),
      );

      if (!meeting) {
        return res.sendStatus(404);
      }

      return res.status(200).json(
        new JamResponse({
          data: meeting,
        }),
      );
    } catch (e) {
      next(e);
    }
  }
}

export { MeetingController };
