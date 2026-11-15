import type { Context } from "hono";
import { MeetingService } from "@/services/meetingService";
import { ControllerResponse, JamResponse } from "@/lib/validator";
import { Meeting } from "@/types/meeting";

import type { ReqFile } from "@/types/file";

class MeetingController {
  /*
   * Registra um encontro
   */
  async postMeeting(c: Context): ControllerResponse<Meeting[]> {
    try {
      const formData = await c.req.parseBody();
      const { date, description, responsible, title, tags } = Object.fromEntries(
        Object.entries(formData).filter(([key]) => !["coverPhoto", "pdf", "photos"].includes(key)),
      ) as unknown as {
        date: string;
        description: string;
        responsible: string;
        title: string;
        tags?: string | string[];
      };

      const rawCoverPhoto = formData["coverPhoto"];
      const rawPdf = formData["pdf"];
      const rawPhotos = formData["photos"];

      let coverPhoto: ReqFile | undefined;
      let pdf: ReqFile | undefined;
      let photos: ReqFile[] = [];

      if (!rawCoverPhoto) {
        return c.json(
          new JamResponse({
            field: "coverPhoto",
            message: "O encontro precisa de uma capa",
          }),
          401,
        );
      }

      if (rawCoverPhoto) {
        coverPhoto = Array.isArray(rawCoverPhoto) ? rawCoverPhoto[0] : rawCoverPhoto;
      }

      if (rawPdf) {
        pdf = Array.isArray(rawPdf) ? rawPdf[0] : rawPdf;
      }

      if (rawPhotos) {
        photos = (Array.isArray(rawPhotos) ? rawPhotos : [rawPhotos]).filter(Boolean) as ReqFile[];
      }

      const response = await MeetingService.postMeeting({
        date: new Date(date),
        description,
        responsible,
        title,
        pdf,
        coverPhoto: coverPhoto!,
        photos,
        tags: (Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",") : []).map(Number).filter((tag) => !Number.isNaN(tag)),
      });

      return c.json({ id: response }, 201);
    } catch (e) {
      throw e;
    }
  }

  /*
   * Busca uma lista de encontros
   */
  async getMeetings(c: Context): ControllerResponse<Meeting[]> {
    try {
      const { page, pageSize } = c.req.query();
      const meetings = await MeetingService.getMeetings(Number(page), Number(pageSize));

      return c.json(
        new JamResponse({
          data: meetings,
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }

  /*
   * Busca um determinado encontro
   */
  async getMeeting(c: Context): ControllerResponse<Meeting[]> {
    try {
      const { id } = c.req.param();
      const meeting = await MeetingService.getMeeting(Number(id));

      if (!meeting) {
        return c.text("", 404);
      }

      return c.json(
        new JamResponse({
          data: meeting,
        }),
        200,
      );
    } catch (e) {
      throw e;
    }
  }
}

export { MeetingController };
