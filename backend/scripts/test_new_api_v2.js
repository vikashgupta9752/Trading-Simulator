const axios = require('axios');

const baseUrl = 'https://military-jobye-haiqstudios-14f59639.koyeb.app';
const endpoints = [
    '/api/price?symbol=TCS',
    '/api/equity?symbol=TCS',
    '/api/v1/quote?symbol=TCS',
    '/api/stock?name=TCS',
    '/quote?symbol=TCS'
];

async function testEndpoints() {
    console.log(`Testing endpoints on ${baseUrl}...`);
    // First check root
    try {
        await axios.get(baseUrl, { timeout: 5000 });
        console.log("Root / is reachable!");
    } catch (e) {
        console.log("Root / failed:", e.message);
        if (e.response) console.log("Response data:", e.response.data);
    }

    for (const endpoint of endpoints) {
        try {
            const url = baseUrl + endpoint;
            console.log(`Trying ${url}...`);
            const response = await axios.get(url, { timeout: 5000 });
            console.log(`SUCCESS [${endpoint}]:`, response.status, response.data);
            return;
        } catch (error) {
            console.log(`FAILED [${endpoint}]:`, error.message);
        }
    }
}

testEndpoints();
