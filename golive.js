const { exec } = require('child_process');

const port = 8081;
const args = process.argv.slice(2);
const verbose = args.includes('-v');

// Start the Python server
let python_server = exec(`python3 ./libs/server.py ${port}`, { cwd: __dirname });

python_server.stdout.on('data', (data) => {
    if (verbose) {
        console.log(`Python Server: ${data}`);
    }
});

python_server.stderr.on('data', (data) => {
    if (verbose) { // maybe this should always be printed
        console.error(`Python Server Error: ${data}`);
    }
});

console.log(`hosting local server at http://localhost:${port}`);

// Start the Node.js server
const nodeServer = exec('node ./libs/server.js', { cwd: __dirname });

nodeServer.stdout.on('data', (data) => {
    if (verbose) {
        console.log(`Node.js Server: ${data}`);
    }
});

nodeServer.stderr.on('data', (data) => {
    if (data.includes('SerialPortNotFoundError')) {
        console.error(data);
        process.exit(1);
    }
    console.error(`Node.js Server Error: ${data}`);
});