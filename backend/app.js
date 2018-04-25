const express = require('express');
const fs = require('fs');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const index = require('./routes/index');
const eh = require('./routes/eh');
const app = express();

const staticPath = path.join(__dirname, 'public');
const faviconPath = path.join(staticPath, 'favicon.png');

fs.existsSync(faviconPath) && app.use(favicon(faviconPath));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(compression({level: 1}));
app.use(express.static(staticPath));
app.use('/', index);
app.use('/eh', eh);

// 没有匹配到路由则渲染主页
app.use(function(req, res, next) {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({errMsg: err.message});
});

module.exports = app;
