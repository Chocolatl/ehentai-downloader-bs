const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const _ = require('lodash');
const {TaskList, TaskQueue} = require('../lib/TaskList.js');

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
fs.existsSync(STORE_PATH) === false && fs.mkdirSync(STORE_PATH);

const taskList = new TaskList(STORE_PATH);

router.param('taskid', function(req, res, next, taskid) {
  let taskInfo = taskList.find(taskid);
  if(!taskInfo) {
    return res.status(404).json({
      errMsg: '该任务不存在'
    });
  } else {
    req.taskInfo = taskInfo;
    next();
  }
});

router.get('/tasks/list', function(req, res, next) {
  res.json(taskList.all().map(function(taskInfo) {
    return _.pick(taskInfo, ['id', 'state', 'title', 'gurl']);
  }));
});

router.get('/task/:taskid/info', function(req, res, next) {
  let taskInfo = req.taskInfo;
  let files = Object.entries(taskInfo.files)
    .map(([index, {fileName, width, height}]) => ({index: +index, fileName, width, height}))
    .sort(({index: i1}, {index: i2}) => i1 - i2);
  return res.json(Object.assign(_.pick(taskInfo, ['id', 'state', 'title', 'gurl', 'logs']), {files}));
});

router.get('/task/:taskid/download', function(req, res, next) {
  let taskInfo = req.taskInfo;
  if(taskInfo.state !== 'success') {
    return res.status(404).end();
  } else {
    res.set('Content-Disposition','attachment;filename*=UTF-8\'\'' + encodeURIComponent(taskInfo.title + '.zip'));
    archive(taskInfo.dirPath, res);
  }
});

router.get('/task/:taskid/preview/:index', function(req, res, next) {
  let taskInfo = req.taskInfo;
  let index = req.params.index;
  let thumb = req.query.thumb;
  let fileName = taskInfo.files[+index].fileName;
  if(fileName === undefined) {
    return res.status(404).end();
  } else {
    res.set('Content-Disposition','attachment;filename*=UTF-8\'\'' + encodeURIComponent(fileName));
    let filePath = thumb ? path.join(taskInfo.thumbPath, fileName) : path.join(taskInfo.dirPath, fileName);
    fs.existsSync(filePath) ? res.sendFile(filePath) : res.status(404).end();
  }
});

const MAX_QUEUE_LENGTH = 3;
const queue = new TaskQueue(MAX_QUEUE_LENGTH);

router.post('/task', function(req, res, next) {
  if(queue.isFull()) {
    return res.status(403).json({
      errMsg: '下载队列已满'
    });
  } else {
    queue.enqueue();
  }

  let newTask = taskList.add(req.body.url);
  let {taskInfo, donePromise} = newTask;
  
  donePromise.then(_ => {
    queue.dequeue();
  });

  res.status(201).json({
    id: taskInfo.id
  });
});

// 下载失败时请求重试的路由
router.put('/task/:taskid', function(req, res, next) {
  let taskInfo = req.taskInfo;
  if(queue.isFull()) {
    return res.status(403).json({
      errMsg: '下载队列已满'
    });
  } else {
    queue.enqueue();
  }

  let task = taskList.retry(taskInfo.id);
  if(!task) {
    return res.status(403).json({
      errMsg: '该任务不存在'
    });
  }

  task.donePromise.then(_ => {
    queue.dequeue();
  });

  res.status(204).end();
});

module.exports = router;