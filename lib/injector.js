'use strict';

var extend = require('extend');

function Injector(task, appData, taskParams, taskData) {
  this.task = task;
  this.appData = appData;
  this.taskParams = taskParams;
  this.taskData = taskData;
  this.isCanceled = false;
  this.isDev = (taskParams && taskParams.config && taskParams.config.main && (typeof taskParams.config.main.isDev !== 'undefined')) ? taskParams.config.main.isDev : appData.config.main.isDev;

  var taskConfig;
  if (typeof task == 'string') {
    //passed a task id
    taskConfig = this.appData.config[task];
  }
  else {
    //passed a config object (customDirs)
    taskConfig = task;
  }

  var taskConfigEnv = taskConfig[this.isDev ? 'dev': 'prod']
  this.taskConfig = taskConfigEnv ? extend(true, taskConfig, taskConfigEnv) : taskConfig;
  if (taskParams && taskParams.config) {
    this.taskConfig = extend(true, this.taskConfig, taskParams.config);
  }

  this.taskConfig.inject = this.taskConfig.inject || {};
}

Injector.prototype.run = function(name, stream, data) {
  var injectorFn = this.taskConfig.inject[name];

  this.isCanceled = false;

  if (typeof injectorFn === 'function') {
    return injectorFn.call(this, stream, name, data);
  }
  else {
    if (injectorFn === false) {
      this.isCanceled = true;
    }
    return stream;
  }
}

Injector.prototype.cancel = function(stream) {
  this.isCanceled = true;
  return stream;
}

Injector.prototype.isTaskCanceled = function(stream) {
  return this.isCanceled && !stream;
}

module.exports = Injector;
