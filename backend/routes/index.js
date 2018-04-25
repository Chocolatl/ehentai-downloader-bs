const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const _ = require('lodash');
const TaskList = require('../lib/TaskList');
const TaskStates = require('../lib/TaskStates');

function archive(srcDir, destStream) {
  let archive = archiver('zip', {
    zlib: {level: 1}
  });
  archive.pipe(destStream);
  archive.directory(srcDir, false);
  archive.finalize();
}

const MAX_QUEUE_LEN = 3;  // 最大同时下载任务数量
const STORE_PATH = path.resolve(__dirname, '..', 'store');
const tasks = new TaskList(STORE_PATH);

// req.taskInfo
router.param('taskid', function(req, res, next, taskid) {
  req.taskInfo = tasks.find(taskid);
  if(!req.taskInfo) return res.status(404).json({
    errMsg: '该任务不存在'
  });
  next();
});

// 获取任务列表
router.get('/tasks/list', function(req, res, next) {
  res.json(tasks.all().map(function(taskInfo) {
    return _.pick(taskInfo, ['id', 'state', 'title', 'gurl']);
  }));
});

// 获取任务详细信息
router.get('/task/:taskid/info', function(req, res, next) {
  let taskInfo = req.taskInfo;
  let files = Object.entries(taskInfo.files)
    .map(([index, {fileName, width, height}]) => ({index: +index, fileName, width, height}))
    .sort(({index: i1}, {index: i2}) => i1 - i2);
  return res.json({..._.pick(taskInfo, ['id', 'state', 'title', 'gurl', 'logs']), files});
});

// 下载归档文件
router.get('/task/:taskid/download', function(req, res, next) {
  let taskInfo = req.taskInfo;
  if(taskInfo.state !== TaskStates.SUCCESS) {
    return res.status(404).end();
  } else {
    res.set('Content-Disposition','attachment;filename*=UTF-8\'\'' + encodeURIComponent(taskInfo.title + '.zip'));
    archive(taskInfo.imagePath, res);
  }
});

// 查看单张图片
router.get('/task/:taskid/preview/:index', function(req, res, next) {
  let taskInfo = req.taskInfo;
  let index = req.params.index;
  let thumb = req.query.thumb;  // 存在thumb参数时使用缩略图
  let fileName = taskInfo.files[+index].fileName;
  if(fileName === undefined) {
    return res.status(404).end();
  } else {
    res.set('Content-Disposition','attachment;filename*=UTF-8\'\'' + encodeURIComponent(fileName));
    let filePath = thumb ? path.join(taskInfo.thumbPath, fileName) : path.join(taskInfo.imagePath, fileName);
    fs.existsSync(filePath) ? res.sendFile(filePath) : res.status(404).end();
  }
});

// 添加任务
router.post('/task', function(req, res, next) {
  if(tasks.getQueueLenth() >= MAX_QUEUE_LEN) return res.status(403).json({
    errMsg: '下载队列已满'
  });
  res.status(201).json({
    id: tasks.add(req.body.url).id
  });
});

// 重试失败任务
router.put('/task/:taskid', function(req, res, next) {
  if(tasks.getQueueLenth() >= MAX_QUEUE_LEN) return res.status(403).json({
    errMsg: '下载队列已满'
  });
  if(!tasks.retry(req.params.taskid)) return res.status(403).json({
    errMsg: '该任务不存在或无法重试'
  });
  res.status(204).end();
});

module.exports = router;