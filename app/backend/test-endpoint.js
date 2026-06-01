const http = require('http');

function test(url) {
  http.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`URL: ${url}`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}\n`);
    });
  }).on('error', (err) => {
    console.error(`Error: ${err.message}`);
  });
}

test('http://127.0.0.1:5000/users/profile/undefined');
test('http://127.0.0.1:5000/users/profile/null');
test('http://127.0.0.1:5000/users/profile/6a1be2acf508793566a10c6d');
