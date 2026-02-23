class PriceSegmentTree {
    constructor(size) {
        this.size = size;
        this.tree = new Array(4 * size).fill({ min: Infinity, max: -Infinity, avg: 0, count: 0 });
    }

    update(index, price, node = 1, start = 0, end = this.size - 1) {
        if (start === end) {
            this.tree[node] = { min: price, max: price, avg: price, count: 1 };
            return;
        }

        let mid = Math.floor((start + end) / 2);
        if (index <= mid) {
            this.update(index, price, 2 * node, start, mid);
        } else {
            this.update(index, price, 2 * node + 1, mid + 1, end);
        }

        const left = this.tree[2 * node];
        const right = this.tree[2 * node + 1];

        this.tree[node] = {
            min: Math.min(left.min, right.min),
            max: Math.max(left.max, right.max),
            avg: (left.avg * left.count + right.avg * right.count) / (left.count + right.count || 1),
            count: left.count + right.count
        };
    }

    query(l, r, node = 1, start = 0, end = this.size - 1) {
        if (r < start || end < l) {
            return { min: Infinity, max: -Infinity, avg: 0, count: 0 };
        }

        if (l <= start && end <= r) {
            return this.tree[node];
        }

        let mid = Math.floor((start + end) / 2);
        const left = this.query(l, r, 2 * node, start, mid);
        const right = this.query(l, r, 2 * node + 1, mid + 1, end);

        if (left.count === 0) return right;
        if (right.count === 0) return left;

        return {
            min: Math.min(left.min, right.min),
            max: Math.max(left.max, right.max),
            avg: (left.avg * left.count + right.avg * right.count) / (left.count + right.count),
            count: left.count + right.count
        };
    }
}

module.exports = PriceSegmentTree;
