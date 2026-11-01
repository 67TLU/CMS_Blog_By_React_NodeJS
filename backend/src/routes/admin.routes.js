import { Router } from "express";
import { adminArticleRejectSchema } from "../schemas/adminArticleReject.schema.js";
import { adminCategoryCreateSchema } from "../schemas/adminCategoryCreate.schema.js";
import { adminCategoryDetailSchema } from "../schemas/adminCategoryDetail.schema.js";
import { adminArticleFeatureSchema } from "../schemas/adminArticleFeature.schema.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireRole } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { adminCommentReportUpdateSchema } from "../schemas/adminCommentReportUpdate.schema.js";
import { adminCommentReportsSchema } from "../schemas/adminCommentReports.schema.js";
import { adminArticleApproveSchema } from "../schemas/adminArticleApprove.schema.js";
import { getCommentReportsController,handleCommentReportController } from "../controllers/adminCommentReport.controller.js";
import { adminArticlesSchema } from "../schemas/adminArticles.schema.js";
import { getAdminArticlesController,approveAdminArticleController,getAdminArticlePreviewController, rejectAdminArticleController,unpublishAdminArticleController, toggleAdminArticleFeatureController } from "../controllers/adminArticle.controller.js";
import { adminArticlePreviewSchema } from "../schemas/adminArticlePreview.schema.js";
import { adminArticleUnpublishSchema } from "../schemas/adminArticleUnpublish.schema.js";
import { adminCategoriesSchema } from "../schemas/adminCategories.schema.js";
import { createAdminCategoryController, deleteAdminCategoryController, getAdminCategoriesController, getAdminCategoryByIdController, updateAdminCategoryController } from "../controllers/adminCategory.controller.js";
import { adminCategoryUpdateSchema } from "../schemas/adminCategoryUpdate.schema.js";
import { adminCategoryDeleteSchema } from "../schemas/adminCategoryDelete.schema.js";
import { getAdminCategoryTree } from "../controllers/extended.controller.js";
const router = Router();

router.get(
  "/comment-reports",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminCommentReportsSchema),
  asyncHandler(getCommentReportsController)
);
router.patch(
  "/comment-reports/:id",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminCommentReportUpdateSchema),
  asyncHandler(handleCommentReportController)
);
router.get(
  "/articles",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminArticlesSchema),
  asyncHandler(getAdminArticlesController)
);
router.get(
  "/articles/:id/preview",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminArticlePreviewSchema),
  asyncHandler(getAdminArticlePreviewController)
);
router.post(
  "/articles/:id/approve",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminArticleApproveSchema),
  asyncHandler(approveAdminArticleController)
);
// Must be registered before /categories/:id so "tree" is not treated as an ID.
router.get(
  "/categories/tree",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  asyncHandler(getAdminCategoryTree)
);
router.get(
  "/categories/:id",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminCategoryDetailSchema),
  asyncHandler(getAdminCategoryByIdController)
);
router.post(
  "/articles/:id/reject",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminArticleRejectSchema),
  asyncHandler(rejectAdminArticleController)
);
router.post(
  "/articles/:id/unpublish",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminArticleUnpublishSchema),
  asyncHandler(unpublishAdminArticleController)
);
router.get(
  "/categories",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminCategoriesSchema),
  asyncHandler(getAdminCategoriesController)
);
router.post(
  "/categories",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminCategoryCreateSchema),
  asyncHandler(createAdminCategoryController)
);
router.post(
  "/articles/:id/feature",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminArticleFeatureSchema),
  asyncHandler(toggleAdminArticleFeatureController)
);
router.patch(
  "/categories/:id",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminCategoryUpdateSchema),
  asyncHandler(updateAdminCategoryController)
);
router.delete(
  "/categories/:id",
  authenticate,
  requireRole("ADMIN", "EDITOR"),
  validate(adminCategoryDeleteSchema),
  asyncHandler(deleteAdminCategoryController)
);
export default router;