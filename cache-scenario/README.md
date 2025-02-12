# Cache Test 분석 보고서

## 시나리오 목적

본 테스트는 캐싱 시스템 도입 전후의 성능을 비교 분석하여 캐싱의 효과성을 검증하는 것을 목적으로 합니다.

## 시나리오 설명

테스트는 다음과 같은 4가지 주요 시나리오로 구성되었습니다:

1. 질문 목록 조회 (40% 비중)

    - 세션 ID와 토큰을 사용한 질문 목록 API 호출
    - 5초 간격으로 3회 반복 실행

2. 질문 작성 (30% 비중)

    - 무작위 텍스트를 사용한 새 질문 생성
    - 2회 반복 실행

3. 답변 작성 (20% 비중)

    - 기존 질문에 대한 답변 작성
    - 2회 반복 실행

4. 좋아요 토글 (50% 비중)
    - 특정 질문에 대한 좋아요 토글 기능
    - 단일 실행

테스트는 총 300초(5분) 동안 200명의 가상 사용자를 대상으로 실행되었습니다.

## 결과 분석

### 캐시 이전과 이후 비교

#### 1. 응답 시간 (Latency)

| 지표       | 캐시 전 | 캐시 후 | 개선율  |
| ---------- | ------- | ------- | ------- |
| 중간값     | 118.6ms | 22.9ms  | 80.7% ↓ |
| 95퍼센타일 | 204.2ms | 37.0ms  | 81.9% ↓ |
| 99퍼센타일 | 235.7ms | 49.9ms  | 78.8% ↓ |

#### 2. 처리량 (Throughput)

-   캐시 전: 평균 1.69 RPS
-   캐시 후: 평균 2.00 RPS
-   개선율: 18.3% ↑

#### 3. 시나리오 실행 시간

| 지표       | 캐시 전    | 캐시 후    | 개선율  |
| ---------- | ---------- | ---------- | ------- |
| 중간값     | 1,331.5ms  | 1,130.2ms  | 15.1% ↓ |
| 95퍼센타일 | 16,757.7ms | 16,159.7ms | 3.6% ↓  |

## 최종 결론

1. 성능 개선 효과

    - 전반적인 응답 시간 80% 이상 감소
    - 시스템 처리량 18.3% 향상
    - 응답 시간의 일관성 크게 개선

2. 캐시 효율성

    - 읽기 작업(질문 목록 조회)에서 가장 큰 성능 향상
    - 쓰기 작업에서도 안정적인 성능 유지
    - 실시간성이 요구되는 작업에서도 적절한 성능 보장

위 분석 결과를 토대로, 캐시 시스템 도입이 서비스의 성능과 안정성을 크게 향상시켰다고 평가할 수 있습니다. 특히 읽기 작업이 많은 서비스 특성상, 캐시 도입으로 인한 효과가 매우 긍정적으로 나타났습니다.
