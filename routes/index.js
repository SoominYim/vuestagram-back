// Express.js와 라우터 객체를 가져옴
var express = require("express");
var router = express.Router();

// 미들웨어로서 인증을 수행하는 모듈을 가져옴
var authMiddleware = require("../middlewares/auth");

/* GET home page. */
// '/' 경로로 GET 요청이 들어오면, 'index' 템플릿을 렌더링하여 보여줌
router.get("/", function (req, res, next) {
    res.render("index", { title: "Express" });
});

// '/check' 경로로 들어오는 모든 요청에 대해 인증 미들웨어를 실행함
// 인증 미들웨어는 토큰이 유효한지 확인하고, 유효하지 않으면 인증 에러를 응답
router.use("/check", authMiddleware);

// 라우터를 내보냅니다. (다른 파일에서 사용할 수 있도록)
module.exports = router;
