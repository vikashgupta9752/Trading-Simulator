class Node {
    constructor(price) {
        this.price = price;
        this.orders = []; // Queue of orders at this price level
        this.height = 1;
        this.left = null;
        this.right = null;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    // Get height of a node
    getHeight(node) {
        if (!node) return 0;
        return node.height;
    }

    // Get balance factor
    getBalance(node) {
        if (!node) return 0;
        return this.getHeight(node.left) - this.getHeight(node.right);
    }

    // Right rotation
    rightRotate(y) {
        const x = y.left;
        const T2 = x.right;

        // Perform rotation
        x.right = y;
        y.left = T2;

        // Update heights
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        return x;
    }

    // Left rotation
    leftRotate(x) {
        const y = x.right;
        const T2 = y.left;

        // Perform rotation
        y.left = x;
        x.right = T2;

        // Update heights
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        return y;
    }

    // Insert a price level (or get existing)
    insert(price) {
        this.root = this._insert(this.root, price);
        return this.search(price); // Return the node so we can add orders to it
    }

    _insert(node, price) {
        // 1. Perform normal BST insertion
        if (!node) return new Node(price);

        if (price < node.price) {
            node.left = this._insert(node.left, price);
        } else if (price > node.price) {
            node.right = this._insert(node.right, price);
        } else {
            return node; // Duplicate keys not allowed (we group orders by price)
        }

        // 2. Update height of this ancestor node
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        // 3. Get the balance factor of this ancestor node to check balance
        const balance = this.getBalance(node);

        // If this node becomes unbalanced, then there are 4 cases

        // Left Left Case
        if (balance > 1 && price < node.left.price) {
            return this.rightRotate(node);
        }

        // Right Right Case
        if (balance < -1 && price > node.right.price) {
            return this.leftRotate(node);
        }

        // Left Right Case
        if (balance > 1 && price > node.left.price) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        // Right Left Case
        if (balance < -1 && price < node.right.price) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    // Search for a node by price
    search(price) {
        let current = this.root;
        while (current) {
            if (price === current.price) return current;
            if (price < current.price) current = current.left;
            else current = current.right;
        }
        return null;
    }

    // Remove a node (price level) - ONLY if empty
    remove(price) {
          this.root = this._removeNode(this.root, price);
    }

    _removeNode(node, price) {
        if (!node) return node;

        if (price < node.price) {
            node.left = this._removeNode(node.left, price);
        } else if (price > node.price) {
            node.right = this._removeNode(node.right, price);
        } else {
            // Node with only one child or no child
            if ((!node.left) || (!node.right)) {
                const temp = node.left ? node.left : node.right;
                if (!temp) {
                    node = null;
                } else {
                    node = temp;
                }
            } else {
                // Node with two children: Get inorder successor (smallest in right subtree)
                const temp = this._minValueNode(node.right);
                node.price = temp.price;
                node.orders = temp.orders; // Copy orders too!
                node.right = this._removeNode(node.right, temp.price);
            }
        }

        if (!node) return node;

        node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;
        const balance = this.getBalance(node);

        if (balance > 1 && this.getBalance(node.left) >= 0) {
             return this.rightRotate(node);
        }
        if (balance > 1 && this.getBalance(node.left) < 0) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }
        if (balance < -1 && this.getBalance(node.right) <= 0) {
            return this.leftRotate(node);
        }
        if (balance < -1 && this.getBalance(node.right) > 0) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    _minValueNode(node) {
        let current = node;
        while (current.left) current = current.left;
        return current;
    }
    
    // Get minimum price node (Best Ask)
    getMin() {
        if (!this.root) return null;
        return this._minValueNode(this.root);
    }

    // Get maximum price node (Best Bid)
    getMax() {
        if (!this.root) return null;
        let current = this.root;
        while (current.right) current = current.right;
        return current;
    }
    
    // In-order traversal to get all orders sorted by price
    inOrderTraversal() {
        const result = [];
        this._inOrder(this.root, result);
        return result;
    }

    _inOrder(node, result) {
        if (node) {
            this._inOrder(node.left, result);
            result.push({ price: node.price, orders: node.orders });
            this._inOrder(node.right, result);
        }
    }
}

module.exports = AVLTree;
