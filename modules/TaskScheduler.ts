/// <reference path="Queue.ts" />

interface Context {
    id?: string;
    startTime?: Date;
    delay?: number;
    mask?: Array<boolean>;
    args?: Array<any>;
}

interface SubTask {
    (sched: _TaskScheduler, ...args: any[]): void
}

interface Task {
    subtasks: Array<SubTask>;
    context: Context;
    reset: boolean;
}

class PrioBlock {
    queue: Queue<Task> = new Queue<Task>();
    delayedQueue: Array<Task> = [];

    constructor(public prio: number) {
    }

    addTask(task: Task): void {
        if (task.context.startTime) {
            this.delayedQueue.push(task);
        } else {
            this.queue.push(task);
        }
    }
}

class _TaskScheduler {
    tasks: Array<PrioBlock> = [];
    byId: { [index: string]: Task } = {};
    minPrio: number = null;
    currentPrio: number = null;
    currentTask: Task = null;
    lastTimeout: Date = null;
    waitTimeout: number = null;

    PRIO_SYSTEM = -5;
    PRIO_DATA = 0;
    PRIO_UI = 5;

    collectTime = 10;
    lockTime = 50;

    _findPrioBlock(prio: number): PrioBlock {
        var tasks = this.tasks;
        var prioBlock: PrioBlock;
        for (var i = 0, l = tasks.length; i < l; ++i) {
            if (tasks[i].prio == prio) {
                prioBlock = tasks[i];
                break;
            }
            if (tasks[i].prio > prio) {
                prioBlock = new PrioBlock(prio);
                tasks.splice(i, 0, prioBlock);
                break;
            }
        }
        if (!prioBlock) {
            prioBlock = new PrioBlock(prio);
            tasks.push(prioBlock);
        }
        return prioBlock;
    }

    _isMaskReady(mask: Array<boolean>): boolean {
        for (var i = 0, l = mask.length; i < l; ++i) {
            if (!mask[i]) {
                return false;
            }
        }
        return true;
    }

    run(prio: number, subtasks: Array<SubTask>, context: Context): void {
        context = context || {};
        if (context.delay) {
            if (context.mask && this._isMaskReady(context.mask)) {
                context.startTime = new Date(0);
            } else {
                context.startTime = new Date(+new Date() + context.delay);
            }
        }

        // restart task if it already in queue
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
            context: context,
            reset: false
        };
        prioBlock.addTask(newTask);
        if (context.id) {
            this.byId[context.id] = newTask;
        }

        if (this.minPrio === null || prio < this.minPrio) {
            this.minPrio = prio;
        }

        if (this.currentTask === null) {
            this.waitForNextTask();
        }
    }

    update(prio: number, subtasks: Array<SubTask>, context: Context): void {
        context = context || {};
        if (context.id && this.byId[context.id]) {
            var task = this.byId[context.id];
            var delay = task.context.delay;
            var resetTimer = false;

            if (delay && (!context.delay || context.delay > delay)) {
                context.delay = delay;
            }

            if (context.delay) {
                if (context.mask && this._isMaskReady(context.mask)) {
                    context.startTime = new Date(0);
                } else {
                    context.startTime = new Date(+new Date() + context.delay);
                }
                resetTimer = true;
            }

            task.context = context;

            if (resetTimer && this.currentTask === null) {
                this.waitForNextTask();
            }
        } else {
            this.run(prio, subtasks, context);
        }
    }

    _nextTask(finished: boolean): boolean {
        if (finished && this.currentTask && this.currentTask.context.id) {
            delete this.byId[this.currentTask.context.id];
        }

        var tasks = this.tasks;
        var prioBlock: PrioBlock;
        for (var i = 0, l = tasks.length; i < l; ++i) {
            if (tasks[i].delayedQueue.length > 0) {
                var queue = tasks[i].delayedQueue,
                    now = +new Date(),
                    j = 0;
                while (j < queue.length) {
                    if (+queue[j].context.startTime <= now) {
                        var x = queue.splice(j, 1);
                        tasks[i].queue.unpop(x[0]);
                    } else {
                        ++j;
                    }
                }
            }

            if (tasks[i].queue.size() > 0) {
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

        this.minPrio = prioBlock.prio;
        this.currentPrio = prioBlock.prio;
        this.currentTask = prioBlock.queue.pop();
        return true;
    }

    next(func?: SubTask): void {
        if (this.currentTask !== null && this.currentTask.reset) {
            func = (void 0);
            this.currentTask.reset = false;
        }

        var nextFunc: SubTask;
        if (this.minPrio !== null && this.currentPrio !== null &&
            this.minPrio < this.currentPrio) {
            // urgent task available
            if (typeof func !== 'undefined') {
                this.currentTask.subtasks.unshift(func);
            }
            var currentPrioBlock = this._findPrioBlock(this.currentPrio);
            currentPrioBlock.queue.unpop(this.currentTask);

            // swtich to urgent task
            this._nextTask(false);
        } else {
            nextFunc = func;
        }
        if (typeof nextFunc === 'undefined') {
            while (this.currentTask === null || this.currentTask.subtasks.length === 0) {
                if (!this._nextTask(true)) {
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
                    //console.log('taking lock...');
                    nextFunc.apply(_this, args);
                }, _this.collectTime);
            } else {
                nextFunc.apply(_this, args);
            }
        } else {
            //console.log('releasing lock...');
            console.log('locked for ', (+new Date() - +this.lastTimeout), 'ms');
            this.waitForNextTask();
        }
    }

    _waitTimeForPrioBlock(prioBlock: PrioBlock, now: number): number {
        if (prioBlock.queue.size() > 0) {
            return null;
        }

        var waitTime: number;
        for (var i = 0, l = prioBlock.delayedQueue.length; i < l; ++i) {
            var task = prioBlock.delayedQueue[i];
            var taskWaitTime = +task.context.startTime - now;
            if (typeof waitTime === 'undefined' || taskWaitTime < waitTime) {
                waitTime = taskWaitTime;
            }
        }
        return waitTime;
    }

    waitForNextTask(): void {
        var _this = this,
            tasks = _this.tasks,
            waitTime: number,
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
            _this.lastTimeout = new Date();
            //console.log('taking lock for new task...');
            _this.next();
        } else if (typeof waitTime !== 'undefined') {
            _this.waitTimeout = setTimeout(function() {
                _this.lastTimeout = new Date();
                _this.next();
            }, waitTime);
        }
    }
}

var TaskScheduler = new _TaskScheduler();
