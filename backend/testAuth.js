const axios = require('axios');

async function testAuth() {
    const baseUrl = 'http://localhost:5001/api/users';
    const testUser = {
        username: 'testuser_' + Date.now(),
        password: 'password123'
    };

    console.log('Testing Registration...');
    try {
        const regRes = await axios.post(baseUrl, testUser);
        console.log('Registration SUCCESS:', regRes.data);

        console.log('Testing Login...');
        const loginRes = await axios.post(`${baseUrl}/login`, testUser);
        console.log('Login SUCCESS:', loginRes.data);
    } catch (err) {
        console.error('FAILURE:', err.response?.data || err.message);
        if (err.stack) console.error(err.stack);
    }
}

testAuth();
