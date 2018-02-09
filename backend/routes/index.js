const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const nanoid = require('nanoid/generate');
const archiver = require('archiver');
const downloadGallery = require('ehentai-downloader')({
  download: {
    downloadLog: true,
    retries: 3
  }
});

function objectPick(obj, keys) {
  let o = {};
  for(let key of keys) {
    if(key in obj) {
      o[key] = obj[key];
    }
  }
  return o;
}

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


router.param('taskid', function(req, res, next, taskid) {
  let taskInfo = taskList.find(e => e.id === taskid);
  if(!taskInfo) {
    return res.status(404).end();
  } else {
    req.taskInfo = taskInfo;
    next();
  }
});

router.get('/tasks/list', function(req, res, next) {
  res.json(taskList.map(function(taskInfo) {
    return objectPick(taskInfo, ['id', 'state', 'title', 'gurl']);
  }));
});


router.get('/task/:taskid/info', function(req, res, next) {
  let taskInfo = req.taskInfo;
  return res.json(objectPick(taskInfo, ['id', 'state', 'title', 'gurl', 'logs']));
});


router.get('/task/:taskid/download', function(req, res, next) {
  let taskInfo = req.taskInfo;
  if(taskInfo.state !== 'success') {
    return res.status(404).end(taskInfo.state);
  } else {
    res.set('Content-Disposition','attachment;filename*=UTF-8\'\'' + encodeURIComponent(taskInfo.title + '.zip'));
    archive(taskInfo.dirPath, res);
  }
});


function logDownloadProcess(ev, logArr) {
  ev.on('download', info => {
    logArr.push({
      event: 'download',
      date: +new Date(),
      index: info.index,
      fileName: info.fileName
    });
  });
  ev.on('done', _ => {
    logArr.push({
      event: 'done',
      date: +new Date()
    });
  });
  ev.on('fail', (err, info) => {
    logArr.push({
      event: 'fail',
      date: +new Date(),
      index: info.index,
      fileName: info.fileName,
      errMsg: err.message
    });
  });
  ev.on('error', err => {
    logArr.push({
      event: 'error',
      date: +new Date(),
      errMsg: err.message
    });
  });
}

function downloadTask(taskInfo) {
  taskInfo.state = 'waiting';
  return downloadGallery(taskInfo.gurl, taskInfo.outerPath, RANGE).then(ev => {
    taskInfo.title = ev.dirName;
    taskInfo.dirPath = ev.dirPath;
    taskInfo.state = 'downloading';

    logDownloadProcess(ev, taskInfo.logs);

    // 这个Promise用于保证触发done事件后再进行下一步
    return new Promise(resolve => ev.on('done', resolve));
  }).then(_ => {

    // 因为允许重试，所以日志数组中可能会有多次下载的日志
    // 这里通过'done'事件找到最后一次下载的下载日志起始位置
    // taskInfo.logs.length - 2 用来跳过这一次下载的'done'
    let beginIndex = 0;
    for(let i = taskInfo.logs.length - 2; i !== 0; i--) {
      if(taskInfo.logs[i].event === 'done') {
        beginIndex = i + 1;
        break;
      }
    }

    let lastLogs = taskInfo.logs.slice(beginIndex); // 最后一次下载的日志数组
    let hasFail = lastLogs.some(log => log.event === 'fail');
    let hasErr = lastLogs.some(log => log.event === 'error');

    if(hasErr){
      taskInfo.state = 'error';
    } else if (hasFail) {
      taskInfo.state = 'failure';
    } else {
      taskInfo.state = 'success';
    }
  }).catch(err => {
    taskInfo.state = 'error';
    taskInfo.logs.push({
      event: 'error',
      date: +new Date(),
      errMsg: err.message
    });
  });
}

function DownloadQueue(maxLen) {
  return {
    nowLen: 0,
    maxLen: maxLen,
    isFull: function() {
      return this.maxLen === this.nowLen;
    },
    isEmpty: function() {
      return this.nowLen === 0;
    },
    enqueue: function() {
      if(this.isFull()) {
        throw new Error('Full');
      }
      return ++this.nowLen;
    },
    dequeue: function() {
      if(this.isEmpty()) {
        throw new Error('Empty');
      }
      return --this.nowLen;
    }
  };
}

const MAX_QUEUE_LENGTH = 3;
const queue = new DownloadQueue(MAX_QUEUE_LENGTH);

router.post('/task', function(req, res, next) {
  if(queue.isFull()) {
    return res.status(403).end();
  } else {
    queue.enqueue();
  }

  let id = nanoid('0123456789ABCDEFGHXYZ', 8);
  let taskInfo = {
    id        : id,
    state     : undefined,
    gurl      : req.body.url,
    outerPath : path.join(STORE_PATH, id),
    dirPath   : undefined,
    title     : undefined,
    logs      : []
  }

  fs.mkdirSync(taskInfo.outerPath);
  taskList.unshift(taskInfo);

  // end
  res.status(201).json({
    id: taskInfo.id
  });

  downloadTask(taskInfo).then(_ => {
      fs.writeFileSync(STORE_DB_PATH, JSON.stringify(taskList));  // 保存taskList
      queue.dequeue();
  });
});


// 下载失败时请求重试的路由
router.put('/task/:taskid', function(req, res, next) {
  let taskInfo = req.taskInfo;
  if(taskInfo.state !== 'failure') {
    return res.status(403).end();
  }
  if(queue.isFull()) {
    return res.status(403).end();
  } else {
    queue.enqueue();
  }
  res.status(204).end();
  downloadTask(taskInfo).then(_ => {
    fs.writeFileSync(STORE_DB_PATH, JSON.stringify(taskList));  // 保存taskList
    queue.dequeue();
  });
});

module.exports = router;
