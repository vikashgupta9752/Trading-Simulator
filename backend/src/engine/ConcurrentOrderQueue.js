const { Worker, isMainThread, parentPort } = require('worker_threads');

class ConcurrentOrderQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    push(order, processFn) {
        this.queue.push({ order, processFn });
        this.next();
    }

    async next() {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        const { order, processFn } = this.queue.shift();

        try {
            await processFn(order);
        } catch (err) {
            console.error("Error in concurrent queue processing:", err);
        } finally {
            this.processing = false;
            this.next();
        }
    }
}

module.exports = new ConcurrentOrderQueue();
