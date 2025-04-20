const { exec } = require('child_process');

const port = 8081;
const args = process.argv.slice(2);
const verbose = args.includes('-v');

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