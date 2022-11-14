var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
var mysql = require('mysql');
// const {
//   token
// } = require('morgan');
require("dotenv").config();
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;
// const rsecret = process.env.JWT_R_SECRET;
// const config = require('../../config')

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '6431',
  database: 'vuestagram',
})

connection.connect(function (err) {
  if (err) {
    console.error('mysql connetion error');
    console.error(err);
    throw err;
  }
})


/* GET users listing. */
router.get('/', function (req, res, ) {
  connection.query('SELECT * FROM users;', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  })
});

router.post('/signUp', function (req, res) {
  const user = {
    user_id: req.body.user.user_id,
    user_password: req.body.user.user_password,
    user_name: req.body.user.user_name,
    user_nickname: req.body.user.user_nickname,
  }
  connection.query(
    `SELECT user_id FROM users WHERE id = '${user.user_id}';`,
    function (err, row) {
      if (row === undefined) {
        const salt = bcrypt.genSaltSync();
        const encryptedPassword = bcrypt.hashSync(user.user_password, salt);
        connection.query(
          `INSERT INTO users(id,password,name,nickname) values('${user.user_id}','${encryptedPassword}','${user.user_name}','${user.user_nickname}');`, user,
          function (err) {
            if (err) throw err;
          }
        );
        res.json({
          success: true,
          message: '회원가입 완료',
        })
      } else {
        res.json({
          success: false,
          message: '동일한 아이디 존재'
        })
      }
    }
  )
});

router.post('/login', function (req, res) {
  const user = {
    user_id: req.body.user.user_id,
    user_password: req.body.user.user_password
  }
  if (user.user_id) {
    connection.query(
      `SELECT id,password FROM users WHERE id = '${user.user_id}';`,
      function (err, row, fields) {
        console.log(req.body.user.user_id)
        console.log(req.body.user.user_password)
        if (row[0] !== undefined && row[0].id === user.user_id) {
          bcrypt.compare(user.user_password, row[0].password, function (err, res2) {
            if (res2) {
              const getToken = new Promise((resolve, reject) => {
                jwt.sign({
                  id: user.user_id,
                }, secret, {
                  expiresIn: '1h',
                  issuer: 'soomin',
                  subject: 'userInfo',
                }, (err, token) => {
                  if (err) reject(err)
                  resolve(token)
                })
              })
              getToken.then(token => {
                res.json({
                  success: true,
                  message: '로그인완료',
                  token
                })
              });
              // const getrToken = new Promise((resolve, reject) => {
              //   jwt.sign({
              //     id: user.user_id,
              //   }, rsecret, {
              //     expiresIn: '30d',
              //     issuer: 'soomin',
              //     subject: 'userInfo',
              //   }, (err, rtoken) => {
              //     if (err) reject(err)
              //     resolve(rtoken)
              //   })
              // }
              // )
              // getrToken.then(rtoken => {
              //   res.json({
              //     rtoken
              //   })
              // })
            } else {
              // console.log(row[0])
              // console.log('row[0].id : ' + row[0].id)
              // console.log('row[0].password : ' + row[0].password)
              // console.log('user.user_id : ' + user.user_id)
              // console.log('user.user_password : ' + user.user_password)
              res.json({
                success: false,
                message: '비밀번호 틀렸'
              })
            }
          })

        } else {
          // console.log(row[0])
          // console.log('row[0].id : ' + row[0].id)
          // console.log('row[0].password : ' + row[0].password)
          // console.log('user.user_id : ' + user.user_id)
          // console.log('user.user_password : ' + user.user_password)
          res.json({
            success: false,
            message: 'Login failed please check your id or password'

          })
        }
      })
  }
})



module.exports = router;