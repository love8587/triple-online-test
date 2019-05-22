# 트리플 온라인 테스트 (Triple Online Test)

## 사용 기술스택
- Nodejs
- Hapi Framework (https://hapijs.com/)
- knex (https://knexjs.org/)
- nodemon (https://nodemon.io/)

## 서버 구동시 명령어
------------------
```npm install```

```npm install -g nodemon```

```DEBUG=triple-online-test* nodemon server.js```

------------------

## 마이크로서비스
- 현재 주어진 테스트는 DB까지 완벽하게 분리가 된 마이크로서비스 아키텍처라고 가정하였습니다

## 사용자 포인트 조회시 
- 사용자의 포인트증감 데이터가 select sum 쿼리로 해결할 수 있는 범위로 봤습니다.
- user_id 를 키로 가지기 때문에 유저당 데이터양이 많지 않다면 퍼포먼스 문제가 크게 없다고 판단했습니다.
- 필요시 별도의 user_point 테이블 (전체포인트 관리) 혹은 Redis 를 사용가능할 것으로 판단됩니다.

## 이벤트 중복 전송 및 시간순서 보장이 안될 경우
- 이벤트의 순서가 보장되지 않는 경우(ex: ADD보다 MOD가 먼저 호출, DEL이 ADD보다 먼저 호출)
- 예를 들어 이렇게 확장할 수 있을 것 입니다
-- ex) review_point_history => review.action, is_excuted 컬럼 추가
-- DEL이 ADD보다 먼저 호출되면 history 테이블에 action:DEL, is_excuted:false 저장
-- 차후에 is_excuted: false 인 값을 해결

## pseudo code
- 포인트 적립
```
  find given review point by review_id (기지급된 리뷰 포인트 조회)
  find given review place by review_id, pace_id (포인트 기지급된 장소 조회)
  START Calcurate (current_review_event, given_point, given_place)
    basic_point, bonus_point = 0 (현재 리뷰 데이터에 대한 포인트 계산)

    if (has text): (텍스트가 첨부된 경우)
      basic_point += 1  (기본 점수 +1)
    if (has photo): (사진이 포함된 경우)
      basic_point += 1  (기본 점수 +1)

    case (action === ADD):
      if (is first place): (장소에 첫리뷰인경우)
        bonus_point += 1   (보너스 점수 +1)
    case (action === MOD):
      basic_point = basic_point - SUM(given_point) (현재 리뷰포인트-기지급된 포인트 합계)
    case (action === DEL):
      basic_point = 0 - SUM(given_point.basic_point) (기지급된 포인트 합계 회수)
      bonus_point = 0 - SUM(given_point.bonus_point) (기지급된 포인트 합계 회수)
    return { basic_point, bonus_point }
  END Calcurate
  
  SAVE DB user_point_history (변경된 포인트 내역 저장)
  
  if (action === ADD && bonus_point > 0): (리뷰 등록 && 보너스 포인트 지급)
    SAVE review_point_history with review_id, place_id (리뷰 신규 장소 등록)
  
  if (action === DEL && bonus_point < 0): (리뷰 삭제 && 보너스 포인트 회수)
    DELETE review_point_history by place_id (리뷰 장소 삭제)

```

- 포인트 조회 (포인트 합계 조회)
```
if (validate userId) then
  QUERY (SELECT SUM point) in POINT_HISTORY_TABLE by userId
  return success 200 { total_point, basic_point, bonus_point }
else 
  return error 400
```

- 포인트 조회 (포인트 내역 조회)
```
if (validate userId) then
  QUERY (SELECT *) in POINT_HISTORY_TABLE by userId with pagination
  return success 200 {list, count}
else 
  return error 400
```

# DDL
```mysql 
create table review_point_history
(
	id bigint auto_increment
		primary key,
	review_id varchar(55) not null,
	place_id varchar(55) not null,
	created_at timestamp default CURRENT_TIMESTAMP null,
	updated_at timestamp default CURRENT_TIMESTAMP null,
	constraint review_point_place_place_id_uindex
		unique (place_id)
);

create table user_point_history
(
	id bigint auto_increment
		primary key,
	user_id varchar(55) not null,
	basic_point int default '0' null,
	bonus_point int default '0' null,
	reason_type varchar(10) not null,
	reason_id varchar(55) null,
	created_at timestamp default CURRENT_TIMESTAMP null,
	updated_at timestamp default CURRENT_TIMESTAMP null
);
```

## API
```http
GET /points?userId=3ede0ef2-92b7-4817-a5f3-0c575361f745

{
    "statusCode": 200,
    "message": "GET User Point",
    "data": {
        "list": [
            {
                "id": 63,
                "user_id": "3ede0ef2-92b7-4817-a5f3-0c575361f745",
                "basic_point": -1,
                "bonus_point": 0,
                "reason_type": "review",
                "reason_id": "240a0658-dc5f-4878-9381-ebb7b2667772",
                "created_at": "2019-05-22 16:00:20",
                "updated_at": "2019-05-22 16:00:20"
            },
            {
                "id": 62,
                "user_id": "3ede0ef2-92b7-4817-a5f3-0c575361f745",
                "basic_point": -1,
                "bonus_point": 0,
                "reason_type": "review",
                "reason_id": "240a0658-dc5f-4878-9381-ebb7b2667772",
                "created_at": "2019-05-22 16:00:09",
                "updated_at": "2019-05-22 16:00:09"
            },
            {
                "id": 61,
                "user_id": "3ede0ef2-92b7-4817-a5f3-0c575361f745",
                "basic_point": 2,
                "bonus_point": 0,
                "reason_type": "review",
                "reason_id": "240a0658-dc5f-4878-9381-ebb7b2667772",
                "created_at": "2019-05-22 15:59:59",
                "updated_at": "2019-05-22 15:59:59"
            },
            {
                "id": 60,
                "user_id": "3ede0ef2-92b7-4817-a5f3-0c575361f745",
                "basic_point": 2,
                "bonus_point": 1,
                "reason_type": "review",
                "reason_id": "340a0658-dc5f-4878-9381-ebb7b2667772",
                "created_at": "2019-05-22 15:59:55",
                "updated_at": "2019-05-22 15:59:55"
            }
        ],
        "count": 4
    }
}
```

```http
GET /points/histories?userId=3ede0ef2-92b7-4817-a5f3-0c575361f745

{
    "statusCode": 200,
    "message": "GET User Point",
    "data": {
        "total_point": 3,
        "basic_point": 2,
        "bonus_point": 1
    }
}
```