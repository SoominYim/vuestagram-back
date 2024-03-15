const jwt = require("jsonwebtoken");

// 인증 처리를 위한 미들웨어 함수인 authMiddleware를 정의
const authMiddleware = (req, res, next) => {
  // 토큰을 요청 헤더의 'x-access-token'에서 또는 쿼리 파라미터 'token'에서 읽어옴
  const token = req.headers["x-access-token"] || req.query.token;

  // 토큰이 존재하지 않으면 인증되지 않은 상태로 처리하고 403 상태 코드와 메시지를 응답
  if (!token) {
    return res.status(403).json({
      success: false,
      message: "not logged in",
    });
  }

  // Promise 객체를 생성하여 토큰을 검증
  const p = new Promise((resolve, reject) => {
    // jwt.verify 함수를 사용하여 토큰을 검증
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      // 검증 과정에서 에러가 발생하면 reject를 호출하여 Promise를 거부
      if (err) reject(err);
      // 검증이 성공하면 resolve를 호출하여 Promise를 이행하고, 토큰에서 추출한 정보를 decoded에 저장
      resolve(decoded);
    });
  });

  // Promise가 이행되었을 때의 처리를 정의하는 함수
  // 토큰 검증이 성공했을 경우, req.decoded에 토큰에서 추출한 정보를 저장하고 다음 미들웨어로 이동
  const onSuccess = (decoded) => {
    req.decoded = decoded;
    next();
  };

  // Promise가 거부되었을 때의 처리를 정의하는 함수
  // 토큰 검증이 실패했을 경우, 403 상태 코드와 에러 메시지를 응답
  const onError = (error) => {
    res.status(403).json({
      success: false,
      message: error.message,
    });
  };

  // Promise를 처리
  // then 메소드는 Promise가 이행되었을 때의 처리를, catch 메소드는 Promise가 거부되었을 때의 처리를 정의
  p.then(onSuccess).catch(onError);
};

module.exports = authMiddleware;
