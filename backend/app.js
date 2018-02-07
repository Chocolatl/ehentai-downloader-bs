var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var index = require('./routes/index');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const staticPath = path.join(__dirname, 'public');
const faviconPath = path.join(staticPath, 'favicon.png');

fs.existsSync(faviconPath) && app.use(favicon(faviconPath));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(staticPath));
// app.use(cookieParser());
// app.use(cors());

// 禁用缓存
// 在IE11下测试发现对于相同路径的Ajax请求会直接使用浏览器缓存，导致fetch('/tasks/list')一直返回浏览器缓存结果
// 搞不懂IE为什么会那么奇葩。。。以后在想其他方法解决这个问题
app.set('etag', false);
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use('/', index);

// 没有匹配到路由跳转到主页
app.use(function(req, res, next) {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
