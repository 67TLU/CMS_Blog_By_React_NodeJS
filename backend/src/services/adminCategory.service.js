import {
  countAdminCategories,
  findAdminCategories,
  findAdminCategoryById,
  createAdminCategory,
  deleteAdminCategory,
  updateAdminCategory
} from "../repositories/adminCategory.repository.js";
import { ApiError } from "../utils/ApiError.js";
export async function getAdminCategoriesService(query) {
  const {
    page,
    limit,
    q,
    status,
    parentId,
  } = query;

  const filters = {
    q,
    status,
    parentId,
  };

  const total = await countAdminCategories(filters);

  const categories = await findAdminCategories({
    ...filters,
    limit,
    offset: (page - 1) * limit,
  });

  return {
    categories,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
export async function getAdminCategoryByIdService(id) {
  const category = await findAdminCategoryById(id);

  if (!category) {
    throw new ApiError(
      404,
      "CATEGORY_NOT_FOUND",
      "Không tìm thấy danh mục."
    );
  }

  return category;
}
export async function createAdminCategoryService(data) {
  const category = await createAdminCategory(data);

  if (category?.error === "PARENT_NOT_FOUND") {
    throw new ApiError(
      400,
      "CATEGORY_PARENT_NOT_FOUND",
      "Danh mục cha không tồn tại."
    );
  }

  if (category?.error === "SLUG_ALREADY_EXISTS") {
    throw new ApiError(
      409,
      "CATEGORY_SLUG_ALREADY_EXISTS",
      "Slug danh mục đã tồn tại."
    );
  }

  return category;
}
export async function updateAdminCategoryService(id, data) {
  const category = await updateAdminCategory(id, data);

  if (category?.error === "CATEGORY_NOT_FOUND") {
    throw new ApiError(
      404,
      "CATEGORY_NOT_FOUND",
      "Danh mục không tồn tại."
    );
  }

  if (category?.error === "PARENT_NOT_FOUND") {
    throw new ApiError(
      400,
      "CATEGORY_PARENT_NOT_FOUND",
      "Danh mục cha không tồn tại."
    );
  }

  if (category?.error === "CATEGORY_CANNOT_BE_OWN_PARENT") {
    throw new ApiError(
      400,
      "CATEGORY_CANNOT_BE_OWN_PARENT",
      "Danh mục không thể là danh mục cha của chính nó."
    );
  }

  if (category?.error === "SLUG_ALREADY_EXISTS") {
    throw new ApiError(
      409,
      "CATEGORY_SLUG_ALREADY_EXISTS",
      "Slug danh mục đã tồn tại."
    );
  }

  return category;
}
export async function deleteAdminCategoryService(id) {
  const result = await deleteAdminCategory(id);

  if (result?.error === "CATEGORY_NOT_FOUND") {
    throw new ApiError(
      404,
      "CATEGORY_NOT_FOUND",
      "Danh mục không tồn tại."
    );
  }

  if (result?.error === "CATEGORY_HAS_CHILDREN") {
    throw new ApiError(
      409,
      "CATEGORY_HAS_CHILDREN",
      "Không thể xóa danh mục đang có danh mục con."
    );
  }

  if (result?.error === "CATEGORY_HAS_ARTICLES") {
    throw new ApiError(
      409,
      "CATEGORY_HAS_ARTICLES",
      "Không thể xóa danh mục đang được bài viết sử dụng."
    );
  }

  if (result?.error === "CATEGORY_IN_USE") {
    throw new ApiError(
      409,
      "CATEGORY_IN_USE",
      "Không thể xóa danh mục vì vẫn còn dữ liệu tham chiếu."
    );
  }

  return result;
}