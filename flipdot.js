const NUM_COLS = 28;
const NUM_ROWS = 14;

const START_BYTE = '80';
const END_BYTE = '8F';
const CAST_AND_UPDATE = '83';
const CAST_AND_STORE = '84';
const UPDATE_ALL_PANELS = '82';
const PANEL_ADDR = ['00', '3F'];
const ADDR_ALL_PANELS = 'FF';

const ENABLE_TX = false; // Set to true to enable sending signals to flipdot display

let panel_0_bits = [];
let panel_1_bits = [];

function bit_arr_to_hex_str(bit_arr) {
    let hex_str = '';
    for (let i = 0; i < bit_arr.length; i += 7) {
        let byte = 0;
        for (let j = 0; j < 7; j++) {
            byte += bit_arr[i + 6 - j] * Math.pow(2, j);
        }
        hex_str += byte.toString(16).padStart(2, '0');
    }
    return hex_str;
}

function hex_str_to_command(hex_str, panel_num, immidiate) {
    let command = START_BYTE;
    command += immidiate ? CAST_AND_UPDATE : CAST_AND_STORE;
    command += PANEL_ADDR[panel_num];
    command += hex_str;
    command += END_BYTE;
    return command;
}

function update_command() {
    return START + UPDATE_ALL_PANELS + END;
}

function flip_image_y_axis(hex_str0, hex_str1) {
    let flipped_hex_str0 = '';
    let flipped_hex_str1 = '';
    for (let i = 0; i < hex_str0.length; i += 2) {
        curr_byte_0 = hex_str0.slice(i, i + 2);
        curr_byte_1 = hex_str1.slice(i, i + 2);
        curr_byte_0_inverted = (~parseInt(curr_byte_0, 16)).toString(16).padStart(2, '0');
        curr_byte_1_inverted = (~parseInt(curr_byte_1, 16)).toString(16).padStart(2, '0');
        flipped_hex_str0 += curr_byte_0_inverted;
        flipped_hex_str1 += curr_byte_1_inverted;
    }
    return [flipped_hex_str0, flipped_hex_str1];
}

function process_and_send_signal() {
    let hexStr0 = bit_arr_to_hex_str(panel_0_bits);
    let hexStr1 = bit_arr_to_hex_str(panel_1_bits);
    // [hexStr1, hexStr2] = flip_image_y_axis(hexStr1, hexStr2);
    let command0 = hex_str_to_command(hexStr0, 0, false);
    let command1 = hex_str_to_command(hexStr1, 1, false);

    if (ENABLE_TX) {
        send_signal(command0);
        send_signal(command1);
        send_signal(update_command());
    }
}

function send_signal(hexString) {
    fetch('http://localhost:3000/send-signal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                hexString
            })
        })
        .then(response => response.text())
        // .then(data => print(data))
        .catch(error => print('Error:', error));
}