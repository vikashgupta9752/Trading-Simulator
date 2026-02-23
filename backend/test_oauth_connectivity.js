const https = require('https');

const sites = [
    { name: 'Google Token API', host: 'oauth2.googleapis.com', path: '/token' },
    { name: 'GitHub Token API', host: 'github.com', path: '/login/oauth/access_token' }
];

sites.forEach(site => {
    console.log(`Testing connection to ${site.name} (${site.host})...`);
    const req = https.request({
        hostname: site.host,
        port: 443,
        path: site.path,
        method: 'POST'
    }, (res) => {
        console.log(`[${site.name}] Status: ${res.statusCode}`);
        res.on('data', () => { }); // consume data
    });

    req.on('error', (e) => {
        console.error(`[${site.name}] FAILED: ${e.message}`);
        if (e.code) console.error(`Code: ${e.code}`);
    });

    req.end();
});
