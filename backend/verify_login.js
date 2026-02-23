const axios = require('axios');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const testLogin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const testUser = `verify_${Date.now()}`;
        const testPass = 'password123';

        // Create user directly in DB
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(testPass, salt);
        await User.create({
            username: testUser,
            password: hashedPassword,
            balance: 10000
        });
        console.log('Test user created:', testUser);

        const response = await axios.post(`http://localhost:${process.env.PORT || 5001}/api/users/login`, {
            username: testUser,
            password: testPass
        });

        const data = response.data;
        console.log('Login Response:', JSON.stringify(data, null, 2));

        const requiredFields = ['_id', 'username', 'balance', 'portfolio', 'token'];
        const missing = requiredFields.filter(f => data[f] === undefined);

        if (missing.length === 0) {
            console.log('SUCCESS: All required fields present in login response.');
            process.exit(0);
        } else {
            console.error('FAILURE: Missing fields:', missing.join(', '));
            process.exit(1);
        }
    } catch (err) {
        console.error('Test Failed:', err.message);
        if (err.response) console.error('Response:', err.response.data);
        process.exit(1);
    }
};

testLogin();
