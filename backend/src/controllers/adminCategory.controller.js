import {
  getAdminCategoriesService,
  getAdminCategoryByIdService,
  createAdminCategoryService,
  updateAdminCategoryService,
  deleteAdminCategoryService
} from "../services/adminCategory.service.js";
import { sendPaginated,sendSuccess,sendCreated} from "../utils/response.js";
import { adminCategoryUpdateSchema } from "../schemas/adminCategoryUpdate.schema.js";
export async function getAdminCategoriesController(req, res) {
  const query = req.validated.query;

  const result = await getAdminCategoriesService(query);

  return sendPaginated(
    res,
    result.categories,
    result.meta
  );
}
export async function getAdminCategoryByIdController(req, res) {
  const { id } = req.validated.params;

  const category = await getAdminCategoryByIdService(id);

  return sendSuccess(res, { category });
}
export async function createAdminCategoryController(req, res) {
  const data = req.validated.body;

  const category = await createAdminCategoryService(data);

  return sendCreated(
    res,
    {
      message: "Tạo danh mục thành công.",
      category,
    }
  );
}
export async function updateAdminCategoryController(req, res) {
  const { id } = req.validated.params;
  const data = req.validated.body;

  const category = await updateAdminCategoryService(id, data);

  return sendSuccess(res, {
    message: "Cập nhật danh mục thành công.",
    category,
  });
}
export async function deleteAdminCategoryController(req, res) {
  const { id } = req.validated.params;

  const result = await deleteAdminCategoryService(id);

  return sendSuccess(res, {
    message: "Xóa danh mục thành công.",
    deletedId: result.id,
  });
}