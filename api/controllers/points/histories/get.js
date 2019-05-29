const debug = require('debug')('triple-online-test:controllers:points:histories:get')
const Boom = require('boom')
const PointService = require('api/services/point-service')
const response = require('api/helpers/response')
const validator = require('api/utils/validators/user')
const PointServiceInst = new PointService()

module.exports = [
  {
    method: 'GET',
    path: '/',
    config: {
      description: 'GET User Point Histories'
      // auth: 'default'
    },
    handler: async (request, h) => {
      let userId = request.query.userId

      if (!validator.validUserId(userId)) {
        throw Boom.badRequest('Not valid user id')
      }

      let wheres = {
        userId: userId || null
      }

      let pagination = {
        page: request.query.page || 1,
        limit: request.query.limit || 10,
        sortBy: request.query.sortBy ? request.query.sortBy.split('.')[0] : 'id',
        orderBy: request.query.sortBy ? request.query.sortBy.split('.')[1] : 'desc'
      }

      debug('wheres ============> ', wheres)
      debug('pagination ============> ', pagination)

      const pointHistories = await PointServiceInst.getAllPointHistory(wheres, pagination)

      return response.success(200, `GET User Point`, {
        list: pointHistories,
        count: pointHistories.length
      })
    }
  }
]
