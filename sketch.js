/** inspired by https://tixy.land/ */

let TEXT_X;
let TEXT_Y;

let function_field;

let ts = 32;
let longest_line = '// input must be valid javascript expression'
let text_width;
let char_width;

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);

    frameRate(15);

    textSize(ts);
    textFont('monospace');

    text_width = textWidth(longest_line);
    char_width = textWidth('m');

    TEXT_X = width / 2;
    TEXT_Y = 0.78 * height;

    function_field = createInput(f_str)
    // function_field.attribute('placeholder', 'your name')
    function_field.size(text_width)
    function_field.position(TEXT_X - text_width / 2, TEXT_Y + 1.8 * ts);
}

let panel_1_bits = [];
let panel_2_bits = [];

let f_str = 'Math.sin(t-Math.sqrt((x-7.5)**2+(y-6)**2))';
let color_func = eval(`(x, y, i, t) => ${f_str}`);

function is_valid_function(f_str) {
    try {
      // Try to create a new function with the provided string
      let test_f = new Function(`return (x, y, i, t) => ${f_str}`);
      test_f()(0,0,0,0);
      return true;
    } catch (e) {
      return false;
    }
  }

function func_input(draw_x, draw_y) {


    push();
    translate(draw_x, draw_y);

    noStroke();
    fill('white');
    translate(-text_width / 2, 0);

    text(longest_line, 0, 0);
    text("(x, y, i, t) =>", 0, 1.4 * ts);
    // text(f_str, 0, 1.4 * ts * 2);

    let prev_f_str = f_str;
    f_str = function_field.value();
    if (is_valid_function(f_str)) {
        try {
            print(f_str);
            color_func = eval(`(x, y, i, t) => ${f_str}`);
        } catch (e) { // probably in the middle of typing
            print("nope, reverting...")
            try {
                print(prev_f_str);
                color_func = eval(`(x, y, i, t) => ${prev_f_str}`);
                f_str = prev_f_str;
            } catch (e) { // something went wrong
                color_func = () => 0; // Fallback to a default function
                f_str = '0'
            }
        }
    } else {
        print("invalid functions string, reverting...")
        color_func = eval(`(x, y, i, t) => ${prev_f_str}`);
        f_str = prev_f_str;
    }

    pop();
}

function draw() {

    background(0);

    func_input(TEXT_X, TEXT_Y);

    draw_tixy_grid(color_func);

    process_and_send_signal()
}

const NUM_COLS = 28;
const NUM_ROWS = 14;

function draw_tixy_grid(f) {

    panel_1_bits = [];
    panel_2_bits = [];

    push()
    let w = min((width * 0.75) / NUM_COLS, 37);
    translate(width / 2 - NUM_COLS / 2 * w, height / 2 - NUM_ROWS * 0.6 * w);

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
    pop();
}

function draw_tixy_cell(x, y, i, t, f) {
    let w = min((width * 0.75) / NUM_COLS, 37);
    push();
    translate(x * w, y * w);

    let v = f(x, y, i, t) > 0 ? 1 : 0;
    let c = v ? 'white' : 'black';
    let s = 'white';

    fill(c);
    stroke(s);
    ellipse(0, 0, 0.9 * w);
    pop();

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
    return '80828F';
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

    send_signal(command1);
    send_signal(command2);

    send_signal(update_command());
}

function keyPressed() {

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
        // .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
}