// example.js

const {
    connectSerial,
    writeHex
} = require('./serialHex');
const SerialPort = require('serialport').SerialPort;

async function main() {
    try {
        const portPath = '/dev/tty.usbserial-A9E7G8FR'; // Replace with your serial port path
        const baudRate = 57600;
        console.log('Connecting to serial port...');
        // const port = connectSerial(portPath);
        const port = new SerialPort({
            path: portPath,
            baudRate: baudRate,
            dataBits: 8,
            stopBits: 1,
            parity: 'none',
        });

        console.log('Connected to serial port');

        // const hexString = '8084FF01000055007F7F7F7F7F7F7F7F7F7F7F7F7F7F7F7F7F7F7F7F7F7F7F8F';
        const hexString = '80828F';

        const byteArray = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
        const buffer = Buffer.from(byteArray);
        port.write(buffer, (err) => {
            if (err) {
                return console.error(`Error writing hex data: ${err.message}`);
            }
        });

        // await writeHex(port, hexString);

        console.log('Hex data sent:', hexString);

        // Close the port when done
        port.close((err) => {
            if (err) {
                console.error('Error closing port:', err.message);
            } else {
                console.log('Port closed');
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

main();


