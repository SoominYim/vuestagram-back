var express = require('express');
var router = express.Router();
var authMiddleware = require('../middlewares/auth')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.use('/check', authMiddleware)

module.exports = router;
