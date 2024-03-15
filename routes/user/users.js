var express = require("express"); // Express.js 웹 프레임워크
var router = express.Router(); // Express의 라우터 객체
const bcrypt = require("bcryptjs"); // 비밀번호 암호화를 위한 라이브러리
var mysql = require("mysql"); // MySQL 데이터베이스와의 연결을 위한 라이브러리
// const { token } = require('morgan');
require("dotenv").config(); // 환경 변수 설정 파일을 사용하기 위한 라이브러리
const jwt = require("jsonwebtoken"); // JSON Web Token을 사용하기 위한 라이브러리
const secret = process.env.JWT_SECRET; // JWT 비밀 키를 환경 변수에서 가져옴

// MySQL 데이터베이스와의 연결 설정
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "6431",
  database: "vuestagram",
});

// MySQL 데이터베이스와 연결을 수행
connection.connect(function (err) {
  if (err) {
    console.error("mysql connetion error"); // MySQL 연결 오류가 발생하면 에러를 출력.
    console.error(err);
    throw err;
  }
});

/* GET users listing. */
// '/users' 경로로 GET 요청이 들어오면 사용자 목록을 조회하는 핸들러 함수를 실행
router.get("/", function (req, res) {
  // 데이터베이스에서 'users' 테이블의 모든 데이터를 조회
  connection.query("SELECT * FROM users;", function (err, rows) {
    if (err) throw err;
    res.send(rows); // 조회된 데이터를 JSON 형태로 응답
  });
});

// 회원가입을 처리하는 POST 요청 핸들러 함수
router.post("/signUp", function (req, res) {
  const user = {
    user_id: req.body.user.user_id, // 클라이언트에서 받은 사용자 아이디
    user_password: req.body.user.user_password, // 클라이언트에서 받은 사용자 비밀번호
    user_name: req.body.user.user_name, // 클라이언트에서 받은 사용자 이름
    user_nickname: req.body.user.user_nickname, // 클라이언트에서 받은 사용자 닉네임
  };
  // 데이터베이스에서 이미 존재하는 사용자인지 확인
  connection.query(`SELECT user_id FROM users WHERE id = '${user.user_id}';`, function (err, row) {
    if (row === undefined) {
      // 이미 존재하는 아이디가 아닌 경우
      const salt = bcrypt.genSaltSync(); // Salt를 생성
      const encryptedPassword = bcrypt.hashSync(user.user_password, salt); // 비밀번호를 암호화하여 저장

      // 사용자 정보를 'users' 테이블에 저장
      connection.query(
        `INSERT INTO users(id,password,name,nickname) values('${user.user_id}','${encryptedPassword}','${user.user_name}','${user.user_nickname}');`,
        user,
        function (err) {
          if (err) throw err;
        }
      );

      // 회원가입 성공 응답
      res.json({
        success: true,
        message: "회원가입 완료",
      });
    } else {
      // 이미 존재하는 아이디인 경우
      // 실패 응답을 보냄
      res.json({
        success: false,
        message: "동일한 아이디 존재",
      });
    }
  });
});

// 로그인을 처리하는 POST 요청 핸들러 함수
router.post("/login", function (req, res) {
  const user = {
    user_id: req.body.user.user_id, // 클라이언트에서 받은 사용자 아이디
    user_password: req.body.user.user_password, // 클라이언트에서 받은 사용자 비밀번호
  };
  if (user.user_id) {
    // 사용자 아이디가 입력되었을 경우
    // 데이터베이스에서 사용자 아이디로 조회
    connection.query(`SELECT id,password FROM users WHERE id = '${user.user_id}';`, function (err, row, fields) {
      console.log(req.body.user.user_id);
      console.log(req.body.user.user_password);
      if (row[0] !== undefined && row[0].id === user.user_id) {
        // 사용자 아이디가 존재하는 경우
        // 비밀번호를 비교하여 일치하는지 확인
        bcrypt.compare(user.user_password, row[0].password, function (err, res2) {
          if (res2) {
            // 비밀번호가 일치하는 경우
            // JWT를 생성하여 사용자 인증에 사용
            const getToken = new Promise((resolve, reject) => {
              jwt.sign(
                {
                  id: user.user_id, // 토큰에 담을 정보, 여기서는 사용자 아이디
                },
                secret,
                {
                  expiresIn: "1h", // 토큰의 유효기간
                  issuer: "soomin", // 토큰 발급자
                  subject: "userInfo", // 토큰 제목
                },
                (err, token) => {
                  if (err) reject(err);
                  resolve(token); // 생성된 토큰을 반환
                }
              );
            });

            // 로그인 성공 응답을 보냄
            getToken.then((token) => {
              res.json({
                success: true,
                message: "로그인완료",
                token,
              });
            });
          } else {
            // 비밀번호가 일치하지 않는 경우
            res.json({
              success: false,
              message: "비밀번호 틀렸",
            });
          }
        });
      } else {
        // 사용자 아이디가 존재하지 않는 경우
        res.json({
          success: false,
          message: "Login failed please check your id or password",
        });
      }
    });
  }
});

module.exports = router;
