import { Hono } from "hono";
import { multerUpload, validate } from "@/lib/validator";
import { MeetingController } from "../controllers/meetingController";
import { MeetingValidator } from "@/validators/meetingValidator";
import { validateToken } from "@/lib/token";

const meetingController = new MeetingController();

const meetingRouter = new Hono();

meetingRouter.post(
  "/",
  validateToken,
  multerUpload.fields([
    { name: "coverPhoto" },
    { name: "pdf" },
    { name: "photos" },
  ]),
  validate(MeetingValidator.postMeeting),
  (c) => meetingController.postMeeting(c),
);
meetingRouter.get("/list", validate(MeetingValidator.getMeetings), (c) =>
  meetingController.getMeetings(c),
);
meetingRouter.get("/:id", validate(MeetingValidator.getMeeting), (c) =>
  meetingController.getMeeting(c),
);

export default meetingRouter;
