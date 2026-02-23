var axios = require('axios');

const baseUrl = 'https://military-jobye-haiqstudios-14f59639.koyeb.app';
const endpoints = [
    '/',
    '/api/stock?symbol=TCS',
    '/api/v1/stock?symbol=TCS',
    '/api/quote?symbol=TCS',
    '/get?symbol=TCS',
    '/stock?symbol=TCS',
    '/api/nifty50',
    '/api/market_status'
];

async function testEndpoints() {
    console.log(`Testing endpoints on ${baseUrl}...`);
    for (const endpoint of endpoints) {
        try {
            const url = baseUrl + endpoint;
            console.log(`Trying ${url}...`);
            const response = await axios.get(url, { timeout: 5000 });
            console.log(`SUCCESS [${endpoint}]:`, response.status, response.data);
            return; // Found it!
        } catch (error) {
            console.log(`FAILED [${endpoint}]:`, error.message, error.response ? error.response.status : '');
        }
    }
    console.log("All endpoints failed.");
}

testEndpoints();
