const debug = require('debug')('triple-online-test:controllers:events:post')
const response = require('api/helpers/response')
const ReviewPointSubscriber = require('api/services/event-subscribers/review-point')

/**
 * 코딩테스트를 위해 간단한 버전으로 구현
 * @param {*} type 이벤트 타입
 * @param {*} action 이벤트 액션
 */
function getEventSubscriber (type, action) {
  if (!type || !action) {
    throw new Error('no passed required parameter')
  }

  if (type.toUpperCase() === 'REVIEW') {
    return [
      new ReviewPointSubscriber()
    ]
  }
}

module.exports = [
  {
    method: 'POST',
    path: '/',
    config: {
      description: 'POST triple events'
      // auth: 'default'
    },
    handler: async (request, h) => {
      let event = request.payload

      let subscribers = getEventSubscriber(event.type, event.action)
      subscribers.forEach(subs => {
        if (!subs) return
        subs.update(event) // error는 각 subscriber에서 처리
      })

      debug('subscribers ============> ', subscribers)

      // Save the event to DB
      let eventId = 'created-new-event-id'

      return response.success(201, 'Saved new event', {
        id: eventId
      })
    }
  }
]
