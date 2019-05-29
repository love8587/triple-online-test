// const debug = require('debug')('triple-online-test:services:review-point-history')
const queries = require('api/db/queries/review-point-history')

/**
 * 이벤트의 순서가 보장되지 않는 경우에는 (ex: ADD보다 MOD가 먼저 호출, DEL이 ADD보다 먼저 호출)
 * 다음과 같은 방법으로 확장할 것을 대비하여 review_point_history 라고 명칭하였습니다.
 * => review_point_history 테이블에 review.action, is_excuted를 저장하여 해결할 수 있음
 * ex) DEL이 ADD보다 먼저 호출되면 history 테이블에 action:DEL, is_excuted:false 저장
 * 차후에 is_excuted: false 인 값을 해결
 */
class ReviewPointHistoryService {
  async getPointPlace (placeId) {
    if (!placeId) return null
    let result = await queries.getPointPlace(placeId)
    return result && result.length > 0 ? result[0] : null
  }

  async addReviewPointPlace (reviewId, placeId) {
    let existPlace = await this.getPointPlace(placeId)
    if (existPlace && existPlace.length > 0) return existPlace[0].id

    return queries.addPointPlace(reviewId, placeId)
  }

  async deleteReviewPointPlace (reviewId) {
    return queries.deletePointPlace(reviewId)
  }
}

module.exports = ReviewPointHistoryService
