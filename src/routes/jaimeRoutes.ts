import { Hono } from "hono";
import { validate } from "@/lib/validator";
import { JaimeController } from "../controllers/jaimeController";
import { JaimeValidator } from "@/validators/jaimeValidator";
import { validateToken } from "@/lib/token";
import { zValidator } from '@hono/zod-validator';

const jaimeController = new JaimeController();

const jaimeRouter = new Hono();

jaimeRouter.post(
  "/photo",
  validateToken,
  zValidator('form', JaimeValidator.postJaimePhoto),
  (c) => jaimeController.postJaimePhoto(c),
);

jaimeRouter.post(
  "/video",
  validateToken,
  zValidator('form', JaimeValidator.postJaimeVideo),
  (c) => jaimeController.postJaimeVideo(c),
);

jaimeRouter.get("/list/photos", validate(JaimeValidator.getJaimePhotos), (c) =>
  jaimeController.getJaimePhotos(c),
);

jaimeRouter.get("/list/videos", validate(JaimeValidator.getJaimeVideos), (c) =>
  jaimeController.getJaimeVideos(c),
);

export default jaimeRouter;
