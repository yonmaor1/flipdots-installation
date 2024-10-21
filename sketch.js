/** inspired by https://tixy.land/ */

let TEXT_X;
let TEXT_Y;

let is_typing = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    rectMode(CENTER);
    // angleMode(DEGREES);

    frameRate(15);
    textFont('monospace');

    TEXT_X = width / 2;
    TEXT_Y = 0.78 * height;
}

let panel_1_bits = [];
let panel_2_bits = [];

let f_str = 'Math.sin(t-Math.sqrt((x-7.5)**2+(y-6)**2))'
let color_func = eval(`(x, y, i, t) => ${f_str}`);

/*
function(x, y, i, t) {
    // return x % 3 * y % 5;
    // return random() > 0.5 ? 1 : 0;
    // return sin(x + t) * cos(y + t); // doesnt work
    return sin(t-sqrt((x-7.5)**2+(y-6)**2))
    // return 0
}
*/

let marker_index = f_str.length
function func_input(draw_x, draw_y) {

    let ts = 32;


    push();
    translate(draw_x, draw_y);

    noStroke();
    fill('white');
    textSize(ts);
    let longest_line = '// input must be valid javascript expression'
    let text_width = textWidth(longest_line);
    let char_width = textWidth('m');
    translate(-text_width/2, 0);
    
    text(longest_line, 0, 0);
    text("(x, y, i, t) =>", 0, 1.4 * ts);
    text(f_str, 0, 1.4 * ts * 2);
    if (is_typing && marker_moved % 10 < 5) {
        text("|", marker_index * char_width - char_width/2, 1.4 * ts * 2);
    }
    pop();

    marker_moved += 1;
}

function draw() {

    background(0);

    func_input(TEXT_X, TEXT_Y);

    draw_tixy_grid(color_func);
    
    // Polling method
    /*
    if (serial.available() > 0) {
     let data = serial.read();
     ellipse(50,50,data,data);
    }
    */

    process_and_send_signal()
}

const NUM_COLS = 28;
const NUM_ROWS = 14;

function draw_tixy_grid(f) {

    panel_1_bits = [];
    panel_2_bits = [];

    push()
    let w = max((width * 0.75) / NUM_COLS, 37);
    translate(width/2 - NUM_COLS/2 * w, height/2 - NUM_ROWS * 0.6 * w);
    
    for (let x = 0; x < NUM_COLS; x++) {
        for (let y = 0; y < NUM_ROWS; y++) {
            let i = x + y * NUM_COLS;
            let t = frameCount;

            let bit = draw_tixy_cell(x, y, i, t, f);

            // inv_bit = 1 - bit;

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
    let w = (width * 0.75) / NUM_COLS;
    push();
    translate(x * w, y * w);

    let v = f(x, y, i, t) > 0 ? 1 : 0;
    let c = v ? 'white' : 'black';
    let s = v ? 'black' : 'white';
    
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
    
    send_signal(command1);
    send_signal(command2);

    send_signal(update_command());
}

function mousePressed() {

    let ts = 32;
    textSize(ts);
    let longest_line = '// input must be valid javascript expression';
    let text_width = textWidth(longest_line);

    let x1 = TEXT_X - text_width / 2;
    let x2 = TEXT_X + text_width / 2;
    let y1 = TEXT_Y + 1.4 * ts;
    let y2 = y1 + 1.4 * ts;

    if (mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2) {
        is_typing = true;
        print('typing');
    } else {
        is_typing = false;
    }

}

let marker_moved = 0;
function keyPressed() {
    if (!is_typing) {
        return;
    }

    if (keyCode == BACKSPACE) {
        f_str = f_str.slice(0, marker_index - 1) + f_str.slice(marker_index);
        marker_index = max(0, marker_index - 1);
        marker_moved = 0;
    } else if (keyCode == ENTER) {
        // is_typing = false;
        try {
            color_func = eval(`(x, y, i, t) => ${f_str}`);
        } catch (e) {
            console.error("Invalid function string:", e);
            color_func = () => 0; // Fallback to a default function
        }
    } else if (keyCode == LEFT_ARROW) {
        marker_index = max(0, marker_index - 1);
        marker_moved = 0;
    } else if (keyCode == RIGHT_ARROW) {
        marker_index = min(f_str.length, marker_index + 1);
        marker_moved = 0;
    } else if (key.length != 1) {
        return;
    } else {
        f_str = f_str.slice(0, marker_index) + key + f_str.slice(marker_index);
        marker_index = min(f_str.length, marker_index + 1);
        marker_moved = 0;
    }
}

function send_signal(hexString) {
    fetch('http://localhost:3000/send-signal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ hexString })
    })
    .then(response => response.text())
    // .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  }