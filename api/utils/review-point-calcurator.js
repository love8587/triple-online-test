const debug = require('debug')('triple-online-test:utils:review-point-calcurator')
const DEFAULT_TEXT_POINT = 1
const DEFAULT_PHOTO_POINT = 1
const BONUS_POINT_FOR_FIRST_PLACE = 1

class ReviewPointCalcurator {
  calcurate (event, givenPoint, givenPlace) {
    debug('event,givenPoint,givenPlace ============> ', event, givenPoint, givenPlace)
    let totalPoint = 0
    let totalBonus = 0

    // 1자 이상 텍스트 첨부: 1점
    if (event.content && event.content.length > 0) {
      totalPoint += DEFAULT_TEXT_POINT
    }

    // 1장 이상 사진 첨부: 1점
    if (event.attachedPhotoIds && event.attachedPhotoIds.length > 0) {
      totalPoint += DEFAULT_PHOTO_POINT
    }

    switch (event.action.toUpperCase()) {
      case 'ADD':
        // 특정 장소에 첫 리뷰 작성: 1점
        if (!(givenPlace && givenPlace.id > 0)) {
          totalBonus += BONUS_POINT_FOR_FIRST_PLACE
        }

        break
      case 'MOD':
        totalPoint = totalPoint - givenPoint.basic_point
        totalBonus = 0 // 수정시에는 보너스 포인트에는 영향을 주지 않음 (차후 정책에 따라 변경)
        break
      case 'DELETE':
        totalPoint = 0 - givenPoint.basic_point
        totalBonus = 0 - givenPoint.bonus_point
        break
      default:
        throw new Error('unknown event action')
    }

    return { totalPoint, totalBonus }
  }
}

module.exports = ReviewPointCalcurator
