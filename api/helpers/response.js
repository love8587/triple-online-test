module.exports.success = function (httpStatus, message, data) {
  if (!httpStatus) {
    throw new Error('missing send data!!!')
  }
  if (typeof httpStatus !== 'number') {
    data = httpStatus
    httpStatus = 200
  }
  return {
    statusCode: httpStatus,
    message: message || '',
    data: data
  }
}
