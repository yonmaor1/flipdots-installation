const { exec } = require('child_process');

// Start the Python server
const python_server = exec('python3 server.py', { cwd: __dirname });

python_server.stdout.on('data', (data) => {
  console.log(`Python Server: ${data}`);
});

python_server.stderr.on('data', (data) => {
  console.error(`Python Server Error: ${data}`);
});

// Start the Node.js server
const nodeServer = exec('node server.js', { cwd: __dirname });

nodeServer.stdout.on('data', (data) => {
  console.log(`Node.js Server: ${data}`);
});

nodeServer.stderr.on('data', (data) => {
  console.error(`Node.js Server Error: ${data}`);
});