var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const secret = process.env.JWT_SECRET;


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user/users');


var config = require('./config')

var app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
)

app.use(express.json());

app.use("/api/users", usersRouter)
app.get('/auth/check', (req, res) => {
  // 인증 확인
  const token = req.headers['x-access-token'] || req.query.token;

  if (!token) {
    res.status(400).json({
      'status': 400,
      'msg': 'Token 없음'
    });
  }
  const checkToken = new Promise((resolve, reject) => {
    jwt.verify(token, secret, function (err, decoded) {
      if (err) reject(err);
      resolve(decoded);
    });
  });

  checkToken.then(
    token => {
      console.log(token);
      res.status(200).json({
        'status': 200,
        'msg': 'success',
        token
      });
    }
  )
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// set the secret key variable for jwt
app.set('jwt-secret', config.secret)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




module.exports = app;

