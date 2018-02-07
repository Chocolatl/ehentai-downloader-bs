const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const nanoid = require('nanoid/generate');
const archiver = require('archiver');
const downloadGallery = require('ehentai-downloader')({
  download: {
    downloadLog: false,
    retries: 3
  }
});

function archive(srcDir, destStream) {
  return new Promise((resolve, reject) => {
    let archive = archiver('zip', {
      zlib: {level: 1}
    });
    let lastErr = null;
  
    destStream.on('close', function() {
      if(lastErr) {
        reject();
      } else {
        resolve();
      }
    });
  
    archive.on('warning', function(err) {
      lastErr = err;
    });
  
    archive.on('error', function(err) {
      lastErr = err;
    });
  
    archive.pipe(destStream);
    archive.directory(srcDir, false);
    archive.finalize();
  });
}

const STORE_PATH = path.resolve(__dirname, '..', 'store');
const STORE_DB_PATH = path.join(STORE_PATH, 'db.json');
fs.existsSync(STORE_PATH) === false && fs.mkdirSync(STORE_PATH);

const RANGE = (function(begin, end, _ = []){
  for(let i = begin; i <= end; i++)
    _.push(i);
  return _;
})(0, 100); // 只下载序号为0-100的图片

const taskList = fs.existsSync(STORE_DB_PATH) ? JSON.parse(fs.readFileSync(STORE_DB_PATH)) : [];


router.get('/tasks/list', function(req, res, next) {
  res.json(taskList.map(taskInfo => {
    return {
      id: taskInfo.id,
      state: taskInfo.state,
      title: taskInfo.title,
      gurl: taskInfo.gurl,
      error: taskInfo.error
    };
  }));
});


router.get('/task/:id/info', function(req, res, next) {
  let taskInfo = taskList.find(e => e.id === req.params.id);
  if(!taskInfo) {
    return res.status(404).end();
  }
  return res.json({
    id: taskInfo.id,
    state: taskInfo.state,
    title: taskInfo.title,
    gurl: taskInfo.gurl,
    error: taskInfo.error,
    log: fs.existsSync(taskInfo.logPath) ? fs.readFileSync(taskInfo.logPath, 'utf8') : ''
  });
});


router.get('/task/:id/download', function(req, res, next) {
  let taskInfo = taskList.find(e => e.id === req.params.id);
  if(!taskInfo) return res.status(404).end();
  if(taskInfo.state !== 'success') {
    return res.status(404).end(taskInfo.state);
  } else {
    res.set('Content-Disposition','attachment;filename*=UTF-8\'\'' + encodeURIComponent(taskInfo.title + '.zip'));
    archive(taskInfo.dirPath, res);
  }
});


const MAX_QUEUE_LENGTH = 3;
let queueLength = 0;

router.post('/task', function(req, res, next) {
  if(queueLength === MAX_QUEUE_LENGTH) {
    return res.status(403).end();
  } else {
    queueLength++;
  }

  let id = nanoid('0123456789ABCDEFGHXYZ', 8);
  let url = req.body.url;
  let savePath = path.join(STORE_PATH, id);

  let taskInfo = {
    id: id,
    gurl: url,
    state: 'waiting',
    logPath: path.join(savePath, 'download.log'),
    dirPath: undefined,
    title: undefined,
    error: undefined
  }

  taskList.unshift(taskInfo);

  // end
  res.end();

  fs.mkdirSync(savePath);
  let logStream = fs.createWriteStream(taskInfo.logPath).setDefaultEncoding('utf8');

  downloadGallery(url, savePath, RANGE).then(ev => {
    taskInfo.title = ev.dirName;
    taskInfo.dirPath = ev.dirPath;

    taskInfo.state = 'downloading';

    // 这个Promise用于保证触发done事件后再进行下一步
    return new Promise((resolve, reject) => {
      ev.on('download', info => {
        logStream.write(`[${new Date().toISOString()}] ${info.fileName} download success\r\n`);
      });
      ev.on('done', _ => {
        logStream.end(`[${new Date().toISOString()}] end\r\n`);
        resolve();
      });
      ev.on('fail', (err, info) => {
        taskInfo.error = err.message;
        logStream.write(`[${new Date().toISOString()}] ${info.fileName} ${err.message}\r\n`);
      });
      ev.on('error', err => {
        taskInfo.error = err.message;
        logStream.write(`[${new Date().toISOString()}] ${err.message}\r\n`);
      });
    }).then(_ => {
      taskInfo.state = taskInfo.error ? 'failure' : 'success';
      fs.writeFileSync(STORE_DB_PATH, JSON.stringify(taskList));  // 保存taskList
    });
  }).catch(err => {
    taskInfo.error = err.message;
    taskInfo.state = 'error';
    logStream.end(`[${new Date().toISOString()}] ${err.message}\r\n`);
    fs.writeFileSync(STORE_DB_PATH, JSON.stringify(taskList));  // 保存taskList
  }).then(_ => {
    queueLength--;
  });
});

module.exports = router;
