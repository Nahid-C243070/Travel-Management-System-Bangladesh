export function success(res, data, message = 'Success', statusCode = 200, meta = undefined) {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return res.status(statusCode).json(payload);
}
