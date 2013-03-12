(function(exports) {
"use strict";

var TaskScheduler = {
    tasks: [],
    byId: {},
    minPrio: null,
    currentPrio: null,
    currentTask: null,
    lastTimeout: null,

    PRIO_SYSTEM: -5,
    PRIO_DATA: 0,
    PRIO_UI: 5,

    collectTime: 10,
    lockTime: 50
};

TaskScheduler._findPrioBlock = function(prio) {
    var tasks = this.tasks;
    var prioBlock;
    for (var i = 0, l = tasks.length; i < l; ++i) {
        if (tasks[i].prio == prio) {
            prioBlock = tasks[i];
            break;
        }
        if (tasks[i].prio > prio) {
            prioBlock = { prio: prio, queue: [], revQueue: [], delayedQueue: [] };
            tasks.splice(i, 0, prioBlock);
            break;
        }
    }
    if (!prioBlock) {
        prioBlock = { prio: prio, queue: [], revQueue: [], delayedQueue: [] };
        tasks.push(prioBlock);
    }
    return prioBlock;
};

TaskScheduler._isMaskReady = function(mask) {
    for (var i = 0, l = mask.length; i < l; ++i) {
        if (!mask[i]) {
            return false;
        }
    }
    return true;
};

TaskScheduler.run = function(prio, subtasks, context, feature) {
    context = context || {};
    if (context.delay) {
        context.startTime = new Date(+new Date() + context.delay);
        if (context.features) {
            context.mask = new Array(context.features);
            if (typeof feature !== 'undefined') {
                context.mask[feature] = true;
            }
            if (this._isMaskReady(context.mask)) {
                context.startTime = new Date(0);
            }
        }
    }
    if (context.id && this.byId[context.id]) {
        var task = this.byId[context.id];

        if (!context.startTime && task.context.startTime) {
            context.startTime = new Date(0);
        }

        task.subtasks = subtasks.slice();
        task.context = context;
        task.reset = true;

        return;
    }

    var prioBlock = this._findPrioBlock(prio);
    var newTask = {
        subtasks: subtasks.slice(),
        context: context
    };
    if (context.startTime) {
        prioBlock.delayedQueue.push(newTask);
    } else {
        prioBlock.queue.push(newTask);
    }
    if (context.id) {
        this.byId[context.id] = newTask;
    }

    if (this.minPrio === null || prio < this.minPrio) {
        this.minPrio = prio;
    }

    if (this.currentTask === null) {
        this.waitForNextTask();
    }
};

TaskScheduler.update = function(prio, subtasks, context, feature) {
    context = context || {};
    if (context.delay) {
        context.startTime = new Date(+new Date() + context.delay);
    }
    if (context.id && this.byId[context.id]) {
        var task = this.byId[context.id];
        var mask = task.context.mask;
        var resetTimer = false;

        task.context = context;
        if (mask && typeof feature !== 'undefined') {
            mask[feature] = true;
            if (this._isMaskReady(context.mask)) {
                task.context.startTime = new Date(0);
                resetTimer = true;
            }
        }

        task.context.mask = mask;

        if (resetTimer && this.currentTask === null) {
            this.waitForNextTask();
        }
    } else {
        this.run(prio, subtasks, context, feature);
    }
};

TaskScheduler._nextTask = function(finished) {
    finished = (typeof finished === 'undefined') ? true : finished;
    if (finished && this.currentTask && this.currentTask.context.id) {
        delete this.byId[this.currentTask.context.id];
    }

    var tasks = this.tasks;
    var prioBlock;
    for (var i = 0, l = tasks.length; i < l; ++i) {
        if (tasks[i].delayedQueue.length > 0) {
            var queue = tasks[i].delayedQueue,
                now = +new Date(),
                j = 0;
            while (j < queue.length) {
                if (+queue[j].context.startTime <= now) {
                    var x = queue.splice(j, 1);
                    tasks[i].revQueue.push(x[0]);
                } else {
                    ++j;
                }
            }
        }

        if (tasks[i].queue.length > 0 ||
            tasks[i].revQueue.length > 0)
        {
            prioBlock = tasks[i];
            break;
        }
    }
    if (!prioBlock) {
        this.minPrio = null;
        this.currentPrio = null;
        this.currentTask = null;
        return false;
    }

    if (prioBlock.revQueue.length === 0) {
        var q = prioBlock.queue,
            rq = prioBlock.revQueue,
            len = q.length;
        while (len--) rq.push(q.pop()); // q.reverse much slower in Firefox
    }
    this.minPrio = prioBlock.prio;
    this.currentPrio = prioBlock.prio;
    this.currentTask = prioBlock.revQueue.pop();
    return true;
};

TaskScheduler.next = function(func) {
    if (this.currentTask !== null && this.currentTask.reset) {
        func = (void 0);
        delete this.currentTask.reset;
    }

    var nextFunc;
    if (this.minPrio !== null && this.currentPrio !== null &&
        this.minPrio < this.currentPrio) {
        // urgent task available
        if (typeof func !== 'undefined') {
            this.currentTask.subtasks.unshift(func);
        }
        var currentPrioBlock = this._findPrioBlock(this.currentPrio);
        currentPrioBlock.revQueue.push(this.currentTask);

        // swtich to urgent task
        this._nextTask(false);
    } else {
        nextFunc = func;
    }
    if (typeof nextFunc === 'undefined') {
        while (this.currentTask === null || this.currentTask.subtasks.length === 0) {
            if (!this._nextTask()) {
                break;
            }
        }
        if (this.currentTask !== null) {
            nextFunc = this.currentTask.subtasks.shift();
        }
    }

    if (typeof nextFunc !== 'undefined') {
        var _this = this;
        var context = (this.currentTask && this.currentTask.context) || {};
        var args = [_this].concat(context.args || []);
        if (_this.lastTimeout === null) {
            _this.lastTimeout = new Date();
        }
        if (+new Date() - +this.lastTimeout > this.lockTime) {
            console.log('locked for', (+new Date() - +this.lastTimeout), 'ms; releasing for events collecting...');
            setTimeout(function() {
                _this.lastTimeout = new Date();
                nextFunc.apply(_this, args);
            }, _this.collectTime);
        } else {
            nextFunc.apply(_this, args);
        }
    } else {
        this.waitForNextTask();
    }
};

TaskScheduler._waitTimeForPrioBlock = function(prioBlock, now) {
    if (prioBlock.queue.length > 0 || prioBlock.revQueue.length > 0) {
        return null;
    }

    var waitTime;
    for (var i = 0, l = prioBlock.delayedQueue.length; i < l; ++i) {
        var task = prioBlock.delayedQueue[i];
        var taskWaitTime = +task.context.startTime - now;
        if (typeof waitTime === 'undefined' || taskWaitTime < waitTime) {
            waitTime = taskWaitTime;
        }
    }
    return waitTime;
};

TaskScheduler.waitForNextTask = function() {
    var _this = this,
        tasks = _this.tasks,
        waitTime,
        now = +new Date();

    for (var i = 0, l = tasks.length; i < l; ++i) {
        var blockWaitTime = _this._waitTimeForPrioBlock(tasks[i], now);
        if (blockWaitTime === null) {
            waitTime = 0;
        } else if (typeof waitTime === 'undefined' || blockWaitTime < waitTime) {
            waitTime = blockWaitTime;
        }
        if (waitTime <= 0) {
            break;
        }
    }

    if (_this.waitTimeout) {
        clearTimeout(_this.waitTimeout);
        delete _this.waitTimeout;
    }
    if (waitTime <= 0) {
        _this.next();
    } else if (typeof waitTime !== 'undefined') {
        _this.waitTimeout = setTimeout(function() {
            _this.lastTimeout = new Date();
            _this.next();
        }, waitTime);
    }
};

exports.TaskScheduler = TaskScheduler;

})(window);
