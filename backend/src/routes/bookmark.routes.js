import { Router } from "express";

import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

import { userBookmarksSchema } from "../schemas/bookmark.schema.js";
import { getUserBookmarksController } from "../controllers/bookmark.controller.js";

const router = Router();

router.get(
  "/",
  authenticate,
  validate(userBookmarksSchema),
  asyncHandler(getUserBookmarksController)
);

export default router;