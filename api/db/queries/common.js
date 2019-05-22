
function setPagination (query, sortBy, orderBy = 'desc', page = 1, limit = 10) {
  if (!query) {
    throw new Error('query is empty')
  }

  if (limit) {
    query.limit(limit)
  }

  if (page && limit) {
    query.offset((page - 1) * limit)
  }

  if (sortBy && orderBy) {
    query.orderBy(sortBy, orderBy)
  }
}

module.exports = {
  setPagination
}
