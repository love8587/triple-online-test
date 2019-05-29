const debug = require('debug')('triple-online-test:controllers:points:get')
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
      description: 'GET User Point'
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

      debug('wheres ============> ', wheres)
      // DB용량이 늘어나거나 유저당 포인트증감이 많아지면 이 부분을 user_point 테이블로 최적화 진행
      // 차후에 Redis도 고려해볼 수 있음
      const userPoint = await PointServiceInst.getTotalPoint(wheres)
      let basicPoint = Number.parseInt(userPoint[0]['basic_point']) || 0
      let bonusPoint = Number.parseInt(userPoint[0]['bonus_point']) || 0

      return response.success(200, `GET User Point`, {
        total_point: basicPoint + bonusPoint,
        basic_point: basicPoint,
        bonus_point: bonusPoint
      })
    }
  }
]
