const redis = require("redis"); // 'redis' 모듈을 가져옴

const redisClient = redis.createClient(6379); // Redis 클라이언트를 6379번 포트로 생성

module.exports = redisClient; // 생성된 Redis 클라이언트를 모듈로 내보냄
