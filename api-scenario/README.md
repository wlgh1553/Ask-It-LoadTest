# API Test 분석 보고서

## 시나리오 목적

1. 200명의 동시 접속자가 발생했을 때 시스템의 안정성과 성능을 검증
    - API 엔드포인트별 성능 검증
    - 실제 사용자와 유사한 행동 패턴 시뮬레이션
    - 서비스의 부하 수용력 평가
    - 동시성 문제 검증

## 시나리오 설명

테스트 시나리오는 다음과 같이 구성되었습니다:

1. 동시 접속: 200명의 사용자가 1초 안에 생성됨
2. 시나리오 가중치:
    - 질문 목록 조회: 35% 
    - 질문 작성: 30% 
    - 답변 작성: 20% 
    - 좋아요: 15%
3. 사용자 행동 시뮬레이션:
    - 각 작업 사이에 현실적인 대기 시간 추가 (1-10초)
    - 실제 사용자의 행동 패턴을 반영한 시나리오 구성

## 결과 분석

### 주요 지표

-   총 테스트 사용자: 200명
-   실패율: 500 에러 4건 (0.7%)
-   평균 세션 시간: 18.18초
-   HTTP 요청 성공률: 99.3% (560/564 요청 성공)

### 성능 분석

#### 응답 시간 구성

1. 질문 목록 조회 (/api/questions):

    - 평균: 44.3ms
    - 중앙값: 32.8ms
    - p95: 117.9ms

2. 답변 작성 (/api/replies):

    - 평균: 34.2ms
    - 중앙값: 30.3ms
    - p95: 64.7ms

3. 좋아요 (/api/questions/{id}/likes):
    - 평균: 28.6ms
    - 중앙값: 24.8ms
    - p95: 51.9ms

#### 부하 수용력

1. 요청 처리량:

    - 초당 평균 40개 요청 처리
    - 총 564개 요청 성공적 처리
    - 다운로드된 데이터: 약 15MB

2. 오류 발생:

    - 좋아요 기능에서 4건의 500 에러 발생
    - 다른 기능들은 모두 안정적으로 동작

3. 응답 시간 분포:
    - 전체 요청의 75%가 53ms 이내 처리
    - 전체 요청의 95%가 106.7ms 이내 처리
    - 최대 응답 시간: 186ms

### 동시성 문제 분석

좋아요 토글 기능에서 발견된 동시성 문제:

1. 문제 발생 지점:

    ```typescript
    async toggleLike(questionId: number, createUserToken: string) {
        const exist = await this.questionRepository.findLike(questionId, createUserToken);
        if (exist) await this.questionRepository.deleteLike(exist.questionLikeId);
        else await this.questionRepository.createLike(questionId, createUserToken);
        return { liked: !exist };
    }
    ```

2. 문제 원인:

    - Race Condition: findLike와 deleteLike/createLike 사이에 시간 간격 존재
    - 다수의 동시 요청 시 데이터 일관성 깨짐
    - 특히 동일 사용자가 같은 게시글에 대해 빠르게 여러 번 좋아요를 토글할 경우 발생

3. 오류 로그 분석:
    - "Record to delete does not exist" 에러 발생
    - findLike에서 찾은 레코드가 deleteLike 시점에는 이미 삭제된 상태

## 최종 결론

시스템은 200명의 동시 접속자 부하에서 전반적으로 안정적인 성능을 보여주었습니다. 99.3%의 높은 요청 성공률과 대부분의 요청이 100ms 이내에 처리된 점은 매우 긍정적입니다.

하지만 좋아요 기능에서 발견된 동시성 문제는 개선이 필요합니다. 추후 Unique 키를 걸어 동시성 문제를 개선해볼 예정입니다.
