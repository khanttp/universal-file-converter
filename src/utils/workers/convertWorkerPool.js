// File: src/utils/workerPool.js

class WorkerPool {
  constructor(workerUrl, poolSize = 4) {
    this.pool = [];
    this.queue = [];
    this.poolSize = poolSize;
    this.workerUrl = workerUrl;
    this._initPool();
  }

  _initPool() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerUrl, { type: 'module' });
      // Add a custom property to track idle status.
      worker.idle = true;
      this.pool.push(worker);
    }
  }

  runTask(taskData) {
    return new Promise((resolve, reject) => {
      const task = { taskData, resolve, reject };
      // Try to assign immediately if an idle worker exists.
      const idleWorker = this.pool.find((worker) => worker.idle);
      if (idleWorker) {
        this._runTaskOnWorker(idleWorker, task);
      } else {
        // Otherwise, queue the task.
        this.queue.push(task);
      }
    });
  }

  _runTaskOnWorker(worker, task) {
    worker.idle = false;

    const handleMessage = (e) => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.idle = true;
      // If any queued task exists, assign it now.
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift();
        this._runTaskOnWorker(worker, nextTask);
      }
      if (e.data.error) {
        task.reject(new Error(e.data.error));
      } else {
        task.resolve(e.data.blob);
      }
    };

    const handleError = (e) => {
      worker.removeEventListener('message', handleMessage);
      worker.removeEventListener('error', handleError);
      worker.idle = true;
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift();
        this._runTaskOnWorker(worker, nextTask);
      }
      task.reject(new Error(e.message));
    };

    worker.addEventListener('message', handleMessage);
    worker.addEventListener('error', handleError);

    // If taskData has an ArrayBuffer, transfer it to avoid copying.
    const transferList = task.taskData.buffer ? [task.taskData.buffer] : [];
    worker.postMessage(task.taskData, transferList);
  }
}

// Export an instance of the worker pool.
export default new WorkerPool(new URL('./convertWorker.js', import.meta.url), 4);
