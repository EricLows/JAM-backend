import type { Context } from "hono";
import { MeetingService } from "@/services/meetingService";
import { ControllerResponse, JamResponse, TypedRequest } from "@/lib/validator";
import { Meeting } from "@/types/meeting";
import { MeetingValidator } from "@/validators/meetingValidator";

class MeetingController {
  /*
   * Registra um encontro
   */
  async postMeeting(c: Context): Promise<Response> {
    try {
      const formData = await c.req.formData();

      const date = formData.get("date") as string;
      const description = formData.get("description") as string;
      const responsible = formData.get("responsible") as string;
      const title = formData.get("title") as string;
      const tags: number[] = (formData.get("tags") as string)
        .split(",")
        .map((s) => Number(s));

      const coverPhoto = formData.get("coverPhoto") as File;

      const photos: File[] = [];
      let pdf: File | undefined;

      for (const [key, value] of formData.entries()) {
        switch (key) {
          case "photos[]":
          case "photos":
            photos.push(value as File);
            break;

          case "pdf":
            pdf = value as File;
            break;
        }
      }

      if (!coverPhoto) {
        return c.json(
          new JamResponse({
            field: "coverPhoto",
            message: "O encontro precisa de uma capa",
          }),
          401,
        );
      }

      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const response = await MeetingService.postMeeting({
        date: new Date(date),
        description,
        responsible,
        title,
        pdf,
        coverPhoto,
        photos,
        tags,
      });

      return c.json({ id: response }, 201);
    } catch (e) {
      throw e;
    }
  }

  /*
   * Busca uma lista de encontros
   */
  async getMeetings(c: Context): Promise<Response> {
    try {
      const { page, pageSize, search, minDate, maxDate, tags } = c.req.query();

      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const meetings = await MeetingService.getMeetings(
        search,
        minDate ? new Date(minDate) : undefined,
        maxDate ? new Date(maxDate) : undefined,
        tags?.length ? tags.split(",").map((t) => Number(t)) : undefined,
        Number(page),
        Number(pageSize),
      );

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
  async getMeeting(c: Context): Promise<Response> {
    try {
      const { id } = c.req.param();

      process.env.DB_CONNECTION = c.env.HYPERDRIVE?.connectionString;
      const meeting = await MeetingService.getMeeting(Number(id));

      if (!meeting) {
        return c.json("", 404);
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
