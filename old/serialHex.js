// serialHex.js

const SerialPort = require('serialport').SerialPort;

async function connectSerial(portPath, baudRate = 57600) {
    const port = new SerialPort({
        path: portPath,
        baudRate: baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
    });

    return port;
}

async function writeHex(port, hexString) {
  return new Promise((resolve, reject) => {
    // Convert hex string to byte array
    const byteArray = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
    const buffer = Buffer.from(byteArray);

    // Write byte array to the serial port
    port.write(buffer, (err) => {
      if (err) {
        return reject(`Error writing hex data: ${err.message}`);
      }
      resolve();
    });
  });
}

module.exports = { connectSerial, writeHex };

let serial;

function setup_serial() {

    serial = new p5.SerialPort();

    serial.list();
    serial.open('/dev/tty.usbserial-A9E7G8FR');

    serial.on('connected', serverConnected);

    serial.on('list', gotList);

    serial.on('data', gotData);

    serial.on('error', gotError);

    serial.on('open', gotOpen);

    serial.on('close', gotClose);
}

function serverConnected() {
    print("Connected to Server");
}

function gotList(thelist) {
    print("List of Serial Ports:");

    for (let i = 0; i < thelist.length; i++) {
        print(i + " " + thelist[i]);
    }
}

function gotOpen() {
    print("Serial Port is Open");
}

function gotClose() {
    print("Serial Port is Closed");
    latestData = "Serial Port is Closed";
}

function gotError(theerror) {
    print(theerror);
}

function gotData() {
    let currentString = serial.readLine();
    trim(currentString);
    if (!currentString) return;
    console.log(currentString);
    latestData = currentString;
}

function _draw() {
    background(255, 255, 255);
    fill(0, 0, 0);
    text(latestData, 10, 10);
    // Polling method
    /*
    if (serial.available() > 0) {
     let data = serial.read();
     ellipse(50,50,data,data);
    }
    */
}