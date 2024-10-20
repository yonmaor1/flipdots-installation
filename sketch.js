function setup() {
    createCanvas(800, 600);
    rectMode(CENTER);
    // angleMode(DEGREES);

    frameRate(10);
}

let angle = 0;
let panel_1_bits = [];
let panel_2_bits = [];

function csc(x) {
    return 1 / Math.sin(x);
}

let color_func = function(x, y, i, t) {
    // return x % 3 * y % 5;
    // return random() > 0.5 ? 1 : 0;
    // return sin(x + t) * cos(y + t); // doesnt work
    return 14*sin(t/10)-10+x
}

function draw() {

    background(220);

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
    let w = (width * 0.75) / NUM_COLS;
    translate(width/2 - NUM_COLS/2 * w, height/2 - NUM_ROWS/2 * w);
    for (let x = 0; x < NUM_COLS; x++) {
        for (let y = 0; y < NUM_ROWS; y++) {
            let i = x + y * NUM_COLS;
            let t = frameCount;

            bit = draw_tixy_cell(x, y, i, t, f);

            inv_bit = 1 - bit;

            if (y == 0) {
                panel_1_bits.push(0);
            } else if (y == 7) {
                panel_2_bits.push(0);
            }

            if (y < 7) {
                panel_1_bits.push(inv_bit);
            } else {
                panel_2_bits.push(inv_bit);
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
    let c = v ? 'black' : 'white';
    
    fill(c);
    noStroke();
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

    let command1 = hex_str_to_command(hexStr1, 1, true);
    let command2 = hex_str_to_command(hexStr2, 2, true);
    
    send_signal(command1);
    send_signal(command2);
}

function mousePressed() {

    // const updateHexString = '80828F';


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