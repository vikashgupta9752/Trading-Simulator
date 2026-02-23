const PriorityQueue = require('./PriorityQueue');
const SectorGraph = require('./SectorGraph');
const StockSearch = require('./StockSearch');
const PriceSegmentTree = require('./PriceSegmentTree');

async function runTests() {
    console.log("--- Starting DSA Verification Tests ---");

    // 1. Heap Test
    const pq = new PriorityQueue((a, b) => a - b);
    pq.push(5); pq.push(2); pq.push(8); pq.push(1);
    console.log("Heap Peek (Expected 1):", pq.peek());
    pq.pop();
    console.log("Heap Peek after Pop (Expected 2):", pq.peek());

    // 2. Sector Graph Test
    SectorGraph.addStock('TCS', 'IT');
    SectorGraph.addStock('INFY', 'IT');
    SectorGraph.addStock('RELIANCE', 'Energy');
    console.log("Correlated with TCS (Expected INFY):", SectorGraph.getCorrelatedStocks('TCS'));

    // 3. Binary Search Test
    StockSearch.updateStocks({ 'TCS': 'Tata Consultancy Services', 'INFY': 'Infosys' });
    console.log("Search TCS (Expected Object):", StockSearch.searchByTicker('TCS'));
    console.log("Prefix Search I (Expected INFY):", StockSearch.searchPrefix('I'));

    // 4. Segment Tree Test
    const st = new PriceSegmentTree(10);
    st.update(0, 100);
    st.update(1, 200);
    st.update(2, 150);
    const res = st.query(0, 2);
    console.log("Range Max (0-2) (Expected 200):", res.max);
    console.log("Range Min (0-2) (Expected 100):", res.min);

    console.log("--- DSA Verification Tests Completed ---");
}

if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = runTests;
