const fs = require('fs');
const path = require('path');
const nanoid = require('nanoid/generate');
const _ = require('lodash');
const downloadGallery = require('ehentai-downloader')();

class TaskList {
  constructor(storeDirPath) {
    this.STORE_DIR_PATH = storeDirPath;
    this.TASK_DB_PATH = path.join(this.STORE_DIR_PATH, 'db.json');
    this.taskList = fs.existsSync(this.TASK_DB_PATH) ? JSON.parse(fs.readFileSync(this.TASK_DB_PATH)) : [];
  }

  save() {
    fs.writeFileSync(this.TASK_DB_PATH, JSON.stringify(this.taskList));  // 保存taskList到文件
  }

  add(galleryUrl) {
    let id = nanoid('0123456789ABCDEFGHXYZ', 8);
    let taskInfo = {
      id        : id,
      state     : undefined,
      gurl      : galleryUrl,
      outerPath : path.join(this.STORE_DIR_PATH, id),
      dirPath   : undefined,
      title     : undefined,
      files     : {},
      logs      : []
    }
    fs.mkdirSync(taskInfo.outerPath);
    this.taskList.unshift(taskInfo);
    return {
      taskInfo: taskInfo,
      donePromise: downloadTask(taskInfo).then(this.save.bind(this))
    }
  }

  retry(id) {
    let taskInfo = this.find(id);
    if(!taskInfo || taskInfo.state !== 'failure') {
      return null;
    }
    return {
      taskInfo: taskInfo,
      donePromise: downloadTask(taskInfo).then(this.save.bind(this))
    }
  }

  find(id) {
    let taskInfo = this.taskList.find(e => e.id === id);
    return taskInfo;
  }

  all() {
    return this.taskList;
  }
}

logActions = {
  download: (index, fileName, event = 'download', date = +new Date()) => ({
    event, index, fileName, date
  }),
  done: (event = 'done', date = +new Date()) => ({
    event, date
  }),
  fail: (index, fileName, errMsg, event = 'fail', date = +new Date()) => ({
    event, index, fileName, errMsg, date
  }),
  error: (errMsg, event = 'error', date = +new Date()) => ({
    event, errMsg, date
  })
}

function logDownloadProcess(ev, logArr) {
  ev.on('download', info => {
    logArr.push(logActions.download(info.index, info.fileName));
  });
  ev.on('done', _ => {
    logArr.push(logActions.done());
  });
  ev.on('fail', (err, info) => {
    logArr.push(logActions.fail(info.index, info.fileName, err.message));
  });
  ev.on('error', err => {
    logArr.push(logActions.error(err.message));
  });
}

function logDownloadedFiles(ev, filesObj) {
  ev.on('download', info => {
    filesObj[info.index] = info.fileName;
  });
}

function downloadTask(taskInfo) {
  taskInfo.state = 'waiting';
  return downloadGallery(taskInfo.gurl, taskInfo.outerPath).then(ev => {
    taskInfo.title   = ev.dirName;
    taskInfo.dirPath = ev.dirPath;
    taskInfo.state   = 'downloading';
    logDownloadProcess(ev, taskInfo.logs);
    logDownloadedFiles(ev, taskInfo.files);

    // 这个Promise用于保证触发done事件后再进行下一步
    return new Promise(resolve => ev.on('done', resolve));

  }).then(function() {
    
    // 因为允许重试，所以日志数组中可能会有多次下载的日志
    // 这里通过'done'事件寻找最后一次下载的下载日志起始位置
    // taskInfo.logs.length - 2 用来跳过这一次下载的'done'
    let beginIndex = _.findLastIndex(taskInfo.logs, {'event': 'done'}, taskInfo.logs.length - 2) + 1;
    let lastLogs = taskInfo.logs.slice(beginIndex); // 最后一次下载的日志数组
    let hasFail = lastLogs.some(log => log.event === 'fail');
    let hasErr = lastLogs.some(log => log.event === 'error');

    if (hasErr) {
      taskInfo.state = 'error';
    } else if (hasFail) {
      taskInfo.state = 'failure';
    } else {
      taskInfo.state = 'success';
    }
  }).catch(err => {
    taskInfo.state = 'error';
    taskInfo.logs.push(logActions.error(err.message));
  });
}

function TaskQueue(maxLen) {
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

module.exports = {
  TaskList,
  TaskQueue
};