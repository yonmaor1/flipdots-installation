const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const SerialPort = require('serialport').SerialPort;

const app = express();
const port = 3000;

const serialPortPath = '/dev/tty.usbserial-A9E7G8FR'; // Replace with your serial port path
const baudRate = 57600;


const serialPort = new SerialPort({
  path : serialPortPath,
  baudRate : baudRate,
});


app.use(bodyParser.json());
app.use(cors());

process.on('uncaughtException', (err) => {
  if (err.message.includes(`cannot open ${serialPortPath}`)) {
    console.error(`SerialPortNotFoundError: Serial port ${serialPortPath} not found`);
    process.exit(1);
  }
});

app.post('/send-signal', (req, res) => {
  const { hexString } = req.body;
  const byteArray = hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16));
  const buffer = Buffer.from(byteArray);

  serialPort.write(buffer, (err) => {
    if (err) {
      console.error('Error writing to serial port:', err.message);
      res.status(500).send('Error writing to serial port');
    } else {
      // console.log('Signal sent to serial port');
      res.send('Signal sent to serial port');
    }
  });
});

app.listen(port, () => {
  console.log(`Node.js server listening at http://localhost:${port}`);
});