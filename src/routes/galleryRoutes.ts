import { Hono } from "hono";
import { validate } from "@/lib/validator";
import { GalleryController } from "../controllers/galleryController";
import { GalleryValidator } from "@/validators/galleryValidator";

const galleryController = new GalleryController();

const galleryRouter = new Hono();

galleryRouter.get("/list", validate(GalleryValidator.getGallery), (c) =>
  galleryController.getGallery(c),
);

export default galleryRouter;
