import { multerUpload, validate } from "@/lib/validator.ts";
import { MeetingController } from "../controllers/meetingController";
import { Router } from "express";
import { MeetingValidator } from "@/validators/meetingValidator.ts";
import { validateToken } from "@/lib/token.ts";

const meetingController = new MeetingController();

const meetingRouter = Router();

meetingRouter.post(
  "/",
  multerUpload.fields([
    { name: "coverPhoto" },
    { name: "pdf" },
    { name: "photos" },
  ]),
  validate(MeetingValidator.postMeeting),
  meetingController.postMeeting as any,
);

meetingRouter.get(
  "/list",
  validate(MeetingValidator.getMeetings),
  meetingController.getMeetings as any,
);

meetingRouter.get(
  "/:id",
  validate(MeetingValidator.getMeeting),
  meetingController.getMeeting as any,
);

export default meetingRouter;
