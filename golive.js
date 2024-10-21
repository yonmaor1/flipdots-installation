const { exec } = require('child_process');

const port = 8081;

// Start the Python server
const python_server = exec('python3 ./libs/server.py', { cwd: __dirname });

python_server.stdout.on('data', (data) => {
  console.log(`Python Server: ${data}`);
});

python_server.stderr.on('data', (data) => {
  console.error(`Python Server Error: ${data}`);
});

console.log('serving local server on port ' + port);

// Start the Node.js server
const nodeServer = exec('node ./libs/server.js', { cwd: __dirname });

nodeServer.stdout.on('data', (data) => {
  console.log(`Node.js Server: ${data}`);
});

nodeServer.stderr.on('data', (data) => {
  console.error(`Node.js Server Error: ${data}`);
});