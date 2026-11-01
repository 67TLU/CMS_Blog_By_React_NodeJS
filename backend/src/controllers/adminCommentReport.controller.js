import { getCommentReportsService,handleCommentReportService } from "../services/adminCommentReport.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getCommentReportsController(req, res) {
  const { status, page, limit } = req.validated.query;

  const result = await getCommentReportsService({
    status,
    page,
    limit,
  });

  return sendSuccess(res, {
    items: result.items,
  }, {
    meta: result.pagination,
  });
}
export async function handleCommentReportController(req, res) {
  const { id } = req.validated.params;
  const { status, action } = req.validated.body;

  const report = await handleCommentReportService({
    reportId: id,
    handlerId: req.user.id,
    status,
    action,
  });

  return sendSuccess(res, { report });
}