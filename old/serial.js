import {
    cast_broadcast,
} from './cast.js';

export async function connectSerial(baudRate = 9600) {
    if (!("serial" in navigator)) {
        throw new Error("Web Serial API not supported.");
    }

    try {
        // Request a port and open a connection
        const port = await navigator.serial.requestPort();
        await port.open({
            baudRate
        });

        // Setup text decoder and encoder
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        const textEncoder = new TextEncoderStream();
        const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
        const writer = textEncoder.writable.getWriter();

        return {
            port,
            reader,
            writer,
            readableStreamClosed,
            writableStreamClosed
        };
    } catch (error) {
        console.error("There was an error opening the serial port:", error);
        throw error;
    }
}

export async function readData(reader) {
    try {
        const {
            value,
            done
        } = await reader.read();
        if (done) {
            reader.releaseLock();
            return null;
        }
        return value;
    } catch (error) {
        console.error("Error reading data:", error);
        throw error;
    }
}

export async function writeData(writer, data) {
    try {
        await cast_broadcast(writer); // writer.write(data);
    } catch (error) {
        console.error("Error writing data:", error);
        throw error;
    }
}