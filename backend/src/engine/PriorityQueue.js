class PriorityQueue {
    constructor(comparator) {
        this.heap = [];
        this.comparator = comparator;
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.size() === 0;
    }

    peek() {
        return this.isEmpty() ? null : this.heap[0];
    }

    push(value) {
        this.heap.push(value);
        this._siftUp();
    }

    pop() {
        if (this.isEmpty()) return null;
        const root = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this._siftDown();
        }
        return root;
    }

    remove(predicate) {
        const index = this.heap.findIndex(predicate);
        if (index === -1) return false;

        if (index === this.size() - 1) {
            this.heap.pop();
        } else {
            this.heap[index] = this.heap.pop();
            this._siftDown(index);
            this._siftUp(index);
        }
        return true;
    }

    _siftUp(index = this.size() - 1) {
        let nodeIndex = index;
        while (nodeIndex > 0) {
            const parentIndex = Math.floor((nodeIndex - 1) / 2);
            if (this.comparator(this.heap[nodeIndex], this.heap[parentIndex]) < 0) {
                this._swap(nodeIndex, parentIndex);
                nodeIndex = parentIndex;
            } else {
                break;
            }
        }
    }

    _siftDown(index = 0) {
        let nodeIndex = index;
        while (true) {
            const leftChildIndex = 2 * nodeIndex + 1;
            const rightChildIndex = 2 * nodeIndex + 2;
            let swapIndex = null;

            if (leftChildIndex < this.size()) {
                if (this.comparator(this.heap[leftChildIndex], this.heap[nodeIndex]) < 0) {
                    swapIndex = leftChildIndex;
                }
            }

            if (rightChildIndex < this.size()) {
                if (
                    (swapIndex === null && this.comparator(this.heap[rightChildIndex], this.heap[nodeIndex]) < 0) ||
                    (swapIndex !== null && this.comparator(this.heap[rightChildIndex], this.heap[swapIndex]) < 0)
                ) {
                    swapIndex = rightChildIndex;
                }
            }

            if (swapIndex !== null) {
                this._swap(nodeIndex, swapIndex);
                nodeIndex = swapIndex;
            } else {
                break;
            }
        }
    }

    _swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    toArray() {
        return [...this.heap];
    }

    clear() {
        this.heap = [];
    }
}

module.exports = PriorityQueue;
