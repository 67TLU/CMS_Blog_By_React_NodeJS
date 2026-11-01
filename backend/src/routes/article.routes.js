import { Router } from "express";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {authenticate} from '../middlewares/authenticate.js';
import { requireRole } from '../middlewares/authorize.js';
import * as extra from '../controllers/extended.controller.js';
import {
  createCommentSchema,
} from "../schemas/comment.schema.js";
import {
  commentListSchema,
} from "../schemas/commentList.schema.js";

import {
  getArticleCommentsController,
} from "../controllers/comment.controller.js";
import {
  createCommentController,
} from "../controllers/comment.controller.js";
import {
  articleListSchema,
  articleDetailSchema,
  articleSearchSchema ,
  articleCategorySchema,
  articleTagSchema
} from "../schemas/article.schema.js";
import { articleLikeSchema } from "../schemas/articleLike.schema.js";
import {
  getArticles,
  getArticleDetailByIdOrSlug,
  getHomePage,
  searchArticlesController,
  getArticlesByCategoryController,
  getArticlesByTagController,
} from "../controllers/article.controller.js";
import {likeArticleController,unlikeArticleController} from '../controllers/articleLike.controller.js'
import { articleBookmarkSchema } from "../schemas/articleBookmark.schema.js";
import {
  bookmarkArticleController,
  unbookmarkArticleController,
} from "../controllers/articleBookmark.controller.js";
const router = Router();
// Author Studio: bài viết của người dùng đã đăng nhập.
const optionalAuth = (req,res,next) => {
  if (!req.headers.authorization) return next();
  return authenticate(req,res,next);
};
router.post('/', authenticate, requireRole('ADMIN','EDITOR','AUTHOR'), asyncHandler(extra.createAuthorArticle));
router.get('/:id/edit', authenticate, requireRole('ADMIN','EDITOR','AUTHOR'), asyncHandler(extra.getAuthorArticleEdit));
router.patch('/:id', authenticate, requireRole('ADMIN','EDITOR','AUTHOR'), asyncHandler(extra.updateAuthorArticle));
router.delete('/:id', authenticate, requireRole('ADMIN','EDITOR','AUTHOR'), asyncHandler(extra.deleteAuthorArticle));
router.post('/:id/submit', authenticate, requireRole('ADMIN','EDITOR','AUTHOR'), asyncHandler(extra.submitAuthorArticle));
router.post('/:id/schedule', authenticate, requireRole('ADMIN','EDITOR','AUTHOR'), asyncHandler(extra.scheduleAuthorArticle));
router.patch('/:id/schedule', authenticate, requireRole('ADMIN','EDITOR','AUTHOR'), asyncHandler(extra.scheduleAuthorArticle));
router.post('/:id/view', optionalAuth, asyncHandler(extra.recordArticleView));

// 1. Trang chủ
router.get(
  "/home",
  asyncHandler(getHomePage)
);

// 2. Danh sách bài viết
router.get(
  "/",
  validate(articleListSchema),
  asyncHandler(getArticles)
);
router.get(
  "/search",
  validate(articleSearchSchema),
  asyncHandler(searchArticlesController),
);
// 3. Chi tiết bài viết theo ID hoặc slug
router.get(
  "/category/:slug",
  validate(articleCategorySchema),
  asyncHandler(getArticlesByCategoryController),
);
router.get(
  "/tag/:slug",
  validate(articleTagSchema),
  asyncHandler(getArticlesByTagController),
);
router.post(
  "/:id/like",
  authenticate,
  validate(articleLikeSchema),
  asyncHandler(likeArticleController)
);

router.delete(
  "/:id/like",
  authenticate,
  validate(articleLikeSchema),
  asyncHandler(unlikeArticleController)
);
router.post(
  "/:id/bookmark",
  authenticate,
  validate(articleBookmarkSchema),
  asyncHandler(bookmarkArticleController)
);
router.post(
  "/:id/comments",
  authenticate,
  validate(createCommentSchema),
  asyncHandler(createCommentController)
);
router.delete(
  "/:id/bookmark",
  authenticate,
  validate(articleBookmarkSchema),
  asyncHandler(unbookmarkArticleController)
);
router.get(
  "/:id/comments",
  validate(commentListSchema),
  asyncHandler(getArticleCommentsController)
);
router.get(
  "/:idOrSlug",
  validate(articleDetailSchema),
  asyncHandler(getArticleDetailByIdOrSlug)
);

export default router