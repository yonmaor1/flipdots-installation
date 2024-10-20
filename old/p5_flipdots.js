import {
    connectSerial,
    readData,
    writeData
} from './serial.js';

let reader, writer;

document.getElementById('connectButton').addEventListener('click', async () => {
    try {
        const connection = await connectSerial();
        reader = connection.reader;
        writer = connection.writer;

        // Read data continuously
        (async function readLoop() {
            while (true) {
                const data = await readData(reader);
                if (data) {
                    document.getElementById('output').textContent += data + '\n';
                }
            }
        })();
    } catch (error) {
        console.error("Failed to connect:", error);
    }
});

document.getElementById('sendButton').addEventListener('click', async () => {
    try {
        await writeData(writer, "Hello, Serial!");
    } catch (error) {
        console.error("Failed to send data:", error);
    }
});