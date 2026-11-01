import { Router } from "express";
import { commentLikeSchema } from "../schemas/commentLike.schema.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { commentDeleteSchema } from "../schemas/commentDelete.schema.js";
import { commentUpdateSchema } from "../schemas/commentUpdate.schema.js";
import { updateCommentController,deleteCommentController,  likeCommentController,
  unlikeCommentController,createCommentReportController } from "../controllers/comment.controller.js";
import { commentReportSchema } from "../schemas/commentReport.schema.js";
const router = Router();

router.patch(
  "/:id",
  authenticate,
  validate(commentUpdateSchema),
  asyncHandler(updateCommentController)
);
router.delete(
  "/:id",
  authenticate,
  validate(commentDeleteSchema),
  asyncHandler(deleteCommentController)
);
router.post(
  "/:id/like",
  authenticate,
  validate(commentLikeSchema),
  asyncHandler(likeCommentController)
);

router.delete(
  "/:id/like",
  authenticate,
  validate(commentLikeSchema),
  asyncHandler(unlikeCommentController)
);
router.post(
  "/:id/reports",
  authenticate,
  validate(commentReportSchema),
  asyncHandler(createCommentReportController)
);
export default router;