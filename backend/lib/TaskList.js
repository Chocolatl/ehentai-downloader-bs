'use strict';
const fs = require('fs');
const path = require('path');
const nanoid = require('nanoid/generate');
const Jimp = require('jimp');
const _ = require('lodash');
const TaskStates = require('./TaskStates');
const downloadGallery = require('ehentai-downloader')({
  download: {
    fileName: '{jtitle}[{index.0}]'
  }
});

class TaskList {
  constructor(storePath) {
    !fs.existsSync(storePath) && fs.mkdirSync(storePath);    
    this.STORE_PATH  = storePath;
    this.TASKDB_PATH = path.join(this.STORE_PATH, 'db.json');
    this.tasks = this.read();
  }

  read() {
    return fs.existsSync(this.TASKDB_PATH) ? JSON.parse(fs.readFileSync(this.TASKDB_PATH)) : [];
  }

  save() {
    let tasks = this.tasks.filter(({state}) => state !== TaskStates.WAITING && state !== TaskStates.DOWNLOADING);   // 已完成下载的任务
    fs.writeFileSync(this.TASKDB_PATH, JSON.stringify(tasks));  // 保存到文件
  }

  queueLenth() {
    let length = 0;
    this.tasks.forEach(({state}) => {
      if(state === TaskStates.WAITING || state === TaskStates.DOWNLOADING) {
        length++;
      }
    });
    return length;
  }

  find(id) {
    let taskInfo = this.tasks.find(e => e.id === id);
    return taskInfo;
  }

  all() {
    return this.tasks;
  }

  add(galleryUrl) {
    let id = nanoid('0123456789ABCDEFGHXYZ', 8);
    let outerPath = path.join(this.STORE_PATH, id);
    let taskInfo = {
      id        : id,
      state     : undefined,
      gurl      : galleryUrl,
      outerPath : outerPath,
      thumbPath : path.join(outerPath, 'thumbnails'),
      imagePath : undefined,
      title     : undefined,
      files     : {},
      logs      : []
    }

    fs.mkdirSync(taskInfo.outerPath);
    fs.mkdirSync(taskInfo.thumbPath);
    this.tasks.unshift(taskInfo);
    return downloadTask(taskInfo, this.save.bind(this));
  }

  retry(id) {
    const {FAILURE, ERROR} = TaskStates;
    let taskInfo = this.find(id);
    if(!taskInfo || (taskInfo.state !== FAILURE && taskInfo.state !== ERROR)) return null;
    return downloadTask(taskInfo, this.save.bind(this));
  }
}

let logActions = {
  download: ({index, fileName}) => ({
    date: +new Date(), event: 'download', index, fileName
  }),
  fail: ({message: errMsg}, {index}) => ({
    date: +new Date(), event: 'fail', index, errMsg
  }),
  error: ({message: errMsg}) => ({
    date: +new Date(), event: 'error', errMsg
  }),
  done: () => ({
    date: +new Date(), event: 'done'
  })
}

function logDownloadProcess(ev, logArr) {
  let actions = _.mapValues(logActions, (f) => (...args) => logArr.push(f(...args)));
  _.forOwn(actions, (value, key) => ev.on(key, value));
}

function handleDownloadedFiles(ev, {files, imagePath, thumbPath}) {
  ev.on('download', ({index, fileName}) => {
    let imageFilePath = path.join(imagePath, fileName);
    let thumbFilePath = path.join(thumbPath, fileName);
    Jimp.read(imageFilePath).then(function(image) {
      let width  = image.bitmap.width;
      let height = image.bitmap.height;
      files[index] = {width, height, fileName};  // 记录到taskInfo.files
      // BUG：Jimp不支持操作gif格式图片，无法成功制作gif图片的缩略图
      return image.resize(160, Jimp.AUTO).write(thumbFilePath);
    });
  });
}

// 根据下载日志确定任务状态
function getTaskState(taskInfo) {

    // 因为允许重试，所以日志数组中可能会有多次下载的日志
    // 这里通过'done'事件寻找最后一次下载的下载日志起始位置
    // taskInfo.logs.length - 2 用来跳过这一次下载的'done'
    let beginIndex = _.findLastIndex(taskInfo.logs, {event: 'done'}, taskInfo.logs.length - 2) + 1;
    let lastLogs   = taskInfo.logs.slice(beginIndex);    // 最后一次下载的日志数组
    let hasFail    = lastLogs.some(log => log.event === 'fail');
    let hasErr     = lastLogs.some(log => log.event === 'error');

    return (hasErr && TaskStates.ERROR) || (hasFail && TaskStates.FAILURE) || TaskStates.SUCCESS;
}

function downloadTask(taskInfo, cb) {

  function onbegin(ev) {
    taskInfo.title     = ev.dirName;
    taskInfo.imagePath = ev.dirPath;
    taskInfo.state     = TaskStates.DOWNLOADING;
    logDownloadProcess(ev, taskInfo.logs);
    handleDownloadedFiles(ev, taskInfo);
    ev.on('done', () => {
      taskInfo.state = getTaskState(taskInfo);  // 设置任务状态
      cb();
    });
  }

  function onfail(err) {
    taskInfo.logs.push(logActions.error(err));
    taskInfo.state = TaskStates.ERROR;   // 设置任务状态
    cb(err);
  }
  
  taskInfo.state = TaskStates.WAITING;
  downloadGallery(taskInfo.gurl, taskInfo.outerPath).then(onbegin, onfail);
  return taskInfo;
}

module.exports = TaskList;