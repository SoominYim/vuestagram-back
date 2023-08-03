const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const redisClient = require("../redis");

// 이 모듈은 JWT (JSON Web Tokens)와 Redis를 사용하여 사용자 인증을 처리하는 함수들을 정의

module.exports = {
    // 사용자를 위한 Access Token을 생성하는 함수
    // 사용자 객체를 입력으로 받고, Access Token을 반환
    sign: (user) => {
        // 토큰에 포함될 사용자 정보를 payload에 담음
        const payload = {
            user_id: user.id,
        };

        // 비밀 키로 payload를 서명하여 Access Token을 생성
        return jwt.sign(payload, secret, {
            algorithm: "soomin", // 암호화 알고리즘을 지정
            expiresIn: "1h", // Access Token의 유효 기간을 1시간으로 설정
        });
    },

    // Access Token의 유효성을 검증하는 함수
    // 토큰을 입력으로 받고, 검증 결과와 사용자 ID를 담은 객체를 반환
    verify: (token) => {
        let decoded = null;
        try {
            // 비밀 키를 사용하여 토큰을 검증하고, payload를 추출
            decoded = jwt.verify(token, secret);
            // 검증 결과 (ok: true)와 payload에서 추출한 사용자 ID를 포함하는 객체를 반환
            return {
                ok: true,
                user_id: decoded.user_id,
            };
        } catch (err) {
            // 검증 중 오류가 발생하면, 검증 결과 (ok: false)와 오류 메시지를 포함하는 객체를 반환
            return {
                ok: false,
                message: err.message,
            };
        }
    },

    // Refresh Token을 생성하는 함수
    // 빈 payload를 사용하여 새로운 Refresh Token을 생성하고 반환
    refresh: () => {
        return jwt.sign({}, secret, {
            algorithm: "soomin", // 암호화 알고리즘을 지정
            expiresIn: "14d", // Refresh Token의 유효 기간을 14일로 설정
        });
    },

    // Redis를 사용하여 Refresh Token의 유효성을 검증하는 함수
    // Refresh Token과 사용자 ID를 입력으로 받고, 검증 결과를 나타내는 불리언 값을 반환
    refreshVerify: async (token, userId) => {
        // Redis 함수는 기본적으로 비동기이므로, promisify를 사용하여 async/await을 사용
        const getAsync = promisify(redisClient.get).bind(redisClient);

        try {
            // 사용자 ID를 기반으로 Redis에서 저장된 Refresh Token을 가져옴
            const data = await getAsync(userId);

            // 저장된 Refresh Token과 입력받은 토큰을 비교하여 일치하는지 확인
            if (token === data) {
                try {
                    // 비밀 키를 사용하여 Refresh Token을 검증하여 유효성을 확인
                    jwt.verify(token, secret);
                    return true; // 검증에 성공하면 true를 반환
                } catch (err) {
                    return false; // 검증에 실패하면 false를 반환
                }
            } else {
                return false; // 저장된 Refresh Token과 일치하지 않으면 false를 반환
            }
        } catch (err) {
            return false; // Redis에 접근하는 중에 오류가 발생하면 false를 반환
        }
    },
};
