import { ApiError } from "../utils/ApiError.js"; 
import {
  countCommentReports,
  findCommentReports,handleCommentReport
} from "../repositories/adminCommentReport.repository.js";
export async function getCommentReportsService({
  status,
  page,
  limit,
}) {
  const totalItems = await countCommentReports({ status });

  const offset = (page - 1) * limit;

  const items = await findCommentReports({
    status,
    limit,
    offset,
  });

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}
export async function handleCommentReportService({
  reportId,
  handlerId,
  status,
  action,
}) {
  const result = await handleCommentReport({
    reportId,
    handlerId,
    status,
    action,
  });

  if (result?.error === "NOT_FOUND") {
    throw new ApiError(
      404,
      "REPORT_NOT_FOUND",
      "Không tìm thấy báo cáo."
    );
  }

  if (result?.error === "ALREADY_HANDLED") {
    throw new ApiError(
      409,
      "REPORT_ALREADY_HANDLED",
      "Báo cáo này đã được xử lý trước đó."
    );
  }

  if (result?.error === "COMMENT_NOT_FOUND") {
    throw new ApiError(
      404,
      "COMMENT_NOT_FOUND",
      "Bình luận liên quan đến báo cáo không còn tồn tại."
    );
  }

  if (result?.error === "COMMENT_NOT_VISIBLE") {
    throw new ApiError(
      409,
      "COMMENT_ALREADY_MODERATED",
      "Bình luận đã được xử lý theo một trạng thái khác."
    );
  }

  return result;
}