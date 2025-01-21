const { faker } = require("@faker-js/faker");

/*
 * 초기 필요한 상수 정의
 */
const REFRESH_INTERVAL = 5000; // 5초

function trackLatency(requestParams, response, context, ee, next) {
    const startTime = context.vars.startTime || Date.now();
    const duration = Date.now() - startTime;

    console.log(`[${new Date().toISOString()}] ${requestParams.url}`);
    console.log(`Status: ${response.statusCode}, Duration: ${duration}ms`);

    // 응답 데이터 처리
    if (response.body) {
        try {
            // 응답이 문자열인 경우에만 JSON.parse 실행
            const responseData =
                typeof response.body === "string"
                    ? JSON.parse(response.body)
                    : response.body;

            // questions 응답일 경우 첫 번째 질문의 ID 저장
            if (
                requestParams.url.includes("/api/questions") &&
                !requestParams.url.includes("/likes") &&
                responseData.questions &&
                responseData.questions.length > 0
            ) {
                context.vars.questionId = responseData.questions[0].questionId;
                console.log("Captured Question ID:", context.vars.questionId);
            }
        } catch (e) {
            // 파싱 에러가 발생해도 계속 진행
            if (response.statusCode >= 400) {
                console.error("Error response:", response.body);
            }
        }
    }

    return next();
}

/*
 * 시나리오별 함수들
 */

// 1. 질문 목록 새로고침
function refreshQuestionList(context, events, done) {
    context.vars.startTime = Date.now();
    setTimeout(() => {
        done();
    }, REFRESH_INTERVAL);
}

// 2. 질문 작성
function createQuestion(context, events, done) {
    context.vars.startTime = Date.now();
    context.vars.questionBody = faker.lorem.paragraph();
    return done();
}

// 3. 답변 작성
function createReply(context, events, done) {
    context.vars.startTime = Date.now();
    context.vars.replyBody = faker.lorem.paragraph();
    return done();
}

// 4. 좋아요 토글
function toggleLikes(context, events, done) {
    context.vars.startTime = Date.now();
    if (context.vars.questionId) {
        console.log(
            "Toggle Likes - Using Question ID:",
            context.vars.questionId
        );
    }
    return done();
}

module.exports = {
    trackLatency,
    refreshQuestionList,
    createQuestion,
    createReply,
    toggleLikes,
};
