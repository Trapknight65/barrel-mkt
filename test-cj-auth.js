const https = require('https');

const apiKey = 'CJ4966615@api@e3843fc72e93457b92bb374fa7242ebd';

const data = JSON.stringify({ apiKey: apiKey });

const options = {
    hostname: 'developers.cjdropshipping.com',
    port: 443,
    path: '/api2.0/v1/authentication/getAccessToken',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('Testing CJ Auth with native https...');

const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);

    let result = '';
    res.on('data', (chunk) => { result += chunk; });
    res.on('end', () => {
        console.log('Response Body:', result);
    });
});

req.on('error', (error) => {
    console.error('Error:', error);
});

req.write(data);
req.end();
