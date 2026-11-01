export function sendSuccess(res, data, options = {}) {
  const { status = 200, meta } = options;

  const response = {
    success: true,
    data,
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(status).json(response);
}

export function sendCreated(res, data, options = {}) {
  return sendSuccess(res, data, {
    ...options,
    status: 201,
  });
}

export function sendPaginated(res, data, meta) {
  return sendSuccess(res, data, {
    status: 200,
    meta,
  });
}