var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// 환경 변수로부터 JWT_SECRET 값을 가져와서 변수에 할당
const secret = process.env.JWT_SECRET;

// 라우터 모듈들을 import
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/user/users");

// 설정 정보를 담은 config 파일을 import
var config = require("./config");

// Express 애플리케이션을 생성
var app = express();

// 요청 및 응답의 body를 파싱하기 위한 미들웨어를 등록
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// "/api/users" 경로로 들어오는 요청을 usersRouter 라우터로 전달
app.use("/api/users", usersRouter);

// "/auth/check" 경로로 들어오는 요청의 인증 확인을 처리하는 미들웨어를 등록
app.get("/auth/check", (req, res) => {
    // 요청 헤더나 쿼리 파라미터로부터 토큰을 얻어옵니다.
    const token = req.headers["x-access-token"] || req.query.token;

    // 토큰이 존재하지 않으면 400 상태 코드와 함께 오류 응답을 보냄
    if (!token) {
        res.status(400).json({
            status: 400,
            msg: "Token 없음",
        });
    }

    // 토큰을 검증하는 비동기 작업을 수행
    const checkToken = new Promise((resolve, reject) => {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) reject(err);
            resolve(decoded);
        });
    });

    // 토큰 검증이 성공하면 성공 메시지와 토큰을 응답
    checkToken.then((token) => {
        console.log(token);
        res.status(200).json({
            status: 200,
            msg: "success",
            token,
        });
    });
});

// 뷰 엔진 설정
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// 기타 미들웨어 등록
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// 라우터 모듈들을 등록
app.use("/", indexRouter);
app.use("/users", usersRouter);

// JWT 시크릿 키 설정
app.set("jwt-secret", config.secret);

// 404 에러 핸들링
app.use(function (req, res, next) {
    next(createError(404));
});

// 에러 핸들링
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

// 서버를 3000번 포트에서 실행
const port = 3000;
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

module.exports = app;
