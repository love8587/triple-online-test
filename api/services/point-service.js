const debug = require('debug')('triple-online-test:services:point-service')
const queries = require('../db/queries/point-history.js')

class PointService {
  async getAllPointHistory (wheres, pagination) {
    return queries.getAllPointHistory(wheres, pagination)
  }

  async addHistory (userId, reason, point) {
    return queries.addPointHistory(userId, reason, point)
  }

  async getTotalPoint (wheres) {
    return queries.getTotalPoint(wheres)
  }
}

module.exports = PointService
