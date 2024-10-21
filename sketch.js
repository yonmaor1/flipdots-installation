/** inspired by https://tixy.land/ */
// Includes the library: 
// https://cdn.jsdelivr.net/npm/p5.serialserver@0.0.28/lib/p5.serialport.js


const ENABLE_TX = false;
const NUM_COLS = 28; // Don't change
const NUM_ROWS = 14; // Don't change
let panel_1_bits = [];
let panel_2_bits = [];
let function_field;
let canvas;

let f_str = 'Math.sin(t-Math.sqrt((x-7.5)**2+(y-6)**2))';
let color_func = eval(`(x,y,i,t) => ${f_str}`);

function setup() {
    canvas = createCanvas(800, 600);
    frameRate(15);
    textFont('monospace');
    function_field = createElement('textarea');
    function_field.size(750, 100);
    function_field.position(20, height - 120);
    function_field.style('font-size', '16px'); // Adjust the font size here
    function_field.value(f_str);
    windowResized();
}

function is_valid_function(f_str) {
    try {
        // Try to create a new function with the provided string
        let test_f = new Function(`return (x, y, i, t) => ${f_str}`);
        test_f()(0, 0, 0, 0);
        return true;
    } catch (e) {
        return false;
    }
}

function func_input() {

    let prev_f_str = f_str;
    f_str = function_field.value();
    if (is_valid_function(f_str)) {
        try {
            color_func = eval(`(x, y, i, t) => ${f_str}`);
        } catch (e) { // probably in the middle of typing
            try {
                color_func = eval(`(x, y, i, t) => ${prev_f_str}`);
                f_str = prev_f_str;
            } catch (e) { // something went wrong
                color_func = () => 0; // Fallback to a default function
                f_str = '0'
            }
        }
    } else {
        color_func = eval(`(x, y, i, t) => ${prev_f_str}`);
        f_str = prev_f_str;
    }

}


function windowResized() {
    let canvasX = canvas.position().x;
    let canvasY = canvas.position().y;
    function_field.position(canvasX + 20, canvasY + height - 120);
}

function keyPressed() {

}

function draw() {
    background(0);
    noStroke();
    fill(64);
    rect(0, 0, width, height);

    draw_info();
    func_input()
    draw_tixy_grid(color_func);
    process_and_send_signal()
}

function draw_info() {
    noStroke();
    fill('white');
    textSize(16);
    let displayStr = "// input must be valid javascript expression\n";
    displayStr += "(x,y,i,t) =>";
    text(displayStr, 20, height - 150);
}

function draw_tixy_grid(f) {
    panel_1_bits = [];
    panel_2_bits = [];

    for (let x = 0; x < NUM_COLS; x++) {
        for (let y = 0; y < NUM_ROWS; y++) {
            let i = x + y * NUM_COLS;
            let t = frameCount;
            let bit = draw_tixy_cell(x, y, i, t, f);

            if (y == 0) {
                panel_1_bits.push(0);
            } else if (y == 7) {
                panel_2_bits.push(0);
            }

            if (y < 7) {
                panel_1_bits.push(bit);
            } else {
                panel_2_bits.push(bit);
            }
        }
    }
}

function draw_tixy_cell(x, y, i, t, f) {
    let margin = 30;
    let gridAreaWidth = (width - 2 * margin);
    let cellSize = gridAreaWidth / NUM_COLS;

    let px = x * cellSize + (cellSize / 2) + margin;
    let py = y * cellSize + (cellSize / 2) + margin;

    let v = (f(x, y, i, t) > 0) ? 1 : 0;
    let c = v ? 'white' : 'black';
    let s = v ? 'black' : 'white';

    fill(c);
    noStroke(); //stroke(128);
    circle(px, py, 0.9 * cellSize);
    return v;
}

function bit_arr_to_hex_str(bit_arr) {
    let hex_str = '';
    for (let i = 0; i < bit_arr.length; i += 8) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            byte += bit_arr[i + 7 - j] * Math.pow(2, j);
        }
        hex_str += byte.toString(16).padStart(2, '0');
    }
    return hex_str;
}

// TODO: save bytes in global consts
function hex_str_to_command(hex_str, panel_num, immidiate) {
    let command = '80';
    command += immidiate ? '83' : '84';
    command += panel_num == 1 ? '00' : '3F';
    command += hex_str;
    command += '8F';
    return command;
}

function update_command() {
    return '80828F'
}

function flip_image_y_axis(hex_str1, hex_str2) {
    let flipped_hex_str1 = '';
    let flipped_hex_str2 = '';
    for (let i = 0; i < hex_str1.length; i += 2) {
        curr_byte_1 = hex_str1.slice(i, i + 2);
        curr_byte_2 = hex_str2.slice(i, i + 2);
        curr_byte_1_inverted = (~parseInt(curr_byte_1, 16)).toString(16).padStart(2, '0');
        curr_byte_2_inverted = (~parseInt(curr_byte_2, 16)).toString(16).padStart(2, '0');
        flipped_hex_str1 += curr_byte_2_inverted;
        flipped_hex_str2 += curr_byte_1_inverted;
    }
    return [flipped_hex_str1, flipped_hex_str2];
}

function process_and_send_signal() {
    let hexStr1 = bit_arr_to_hex_str(panel_1_bits);
    let hexStr2 = bit_arr_to_hex_str(panel_2_bits);
    // [hexStr1, hexStr2] = flip_image_y_axis(hexStr1, hexStr2);
    let command1 = hex_str_to_command(hexStr1, 1, false);
    let command2 = hex_str_to_command(hexStr2, 2, false);

    if (ENABLE_TX) {
        send_signal(command1);
        send_signal(command2);
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