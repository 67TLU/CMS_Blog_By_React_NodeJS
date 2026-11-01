import express from 'express';
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

import {
  getPublicAuthorController,
  getAuthorArticlesController,
} from "../controllers/author.controller.js";

import {
  authorIdSchema,
  authorArticlesSchema,
} from "../schemas/author.schema.js";

const router = express.Router();

router.get(
  "/:id/articles",
  validate(authorArticlesSchema),
  asyncHandler(getAuthorArticlesController)
);

router.get(
  "/:id",
  validate(authorIdSchema),
  asyncHandler(getPublicAuthorController)
);

export default router;