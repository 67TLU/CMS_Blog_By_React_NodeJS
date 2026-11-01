export function validate(schema) {
  return (req, res, next) => {
    try {
      const validated = {};

      // Kiểm tra body
      if (schema.body) {
        validated.body = schema.body.parse(req.body);
      }

      // Kiểm tra query parameters
      if (schema.query) {
        validated.query = schema.query.parse(req.query);
      }

      // Kiểm tra URL parameters
      if (schema.params) {
        validated.params = schema.params.parse(req.params);
      }

      // Lưu dữ liệu đã kiểm tra để controller sử dụng.
      req.validated = validated;

      next();
    } catch (error) {
      next(error);
    }
  };
}