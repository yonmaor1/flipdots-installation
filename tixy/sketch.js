/** inspired by https://tixy.land/ */

let function_field;
let canvas;

let f_str = 'Math.sin(t-Math.sqrt((x-7.5)**2+(y-6)**2))';
let color_func = eval(`(x,y,i,t) => ${f_str}`);

let frames_since = 0;

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
    
    if (!f_str) {
        return false;
    }

    try {
        // try to create a new function with the provided string
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
    if (f_str == prev_f_str) {
        return;
    }
    if (is_valid_function(f_str)) {
        try {
            color_func = eval(`(x, y, i, t) => ${f_str}`);
            frames_since = 0;
        } catch (e) { // probably in the middle of typing
            try {
                color_func = eval(`(x, y, i, t) => ${prev_f_str}`);
                f_str = prev_f_str;
            } catch (e) { // something went wrong
                color_func = () => 0; // fallback to a default function
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

function draw() {
    background(0);
    noStroke();
    fill(64);
    rect(0, 0, width, height);

    draw_info();
    func_input()
    draw_tixy_grid(color_func);

    tixy2display();
    
    frames_since += 1;
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
    // clear the panels
    panel_0_bits = [];
    panel_1_bits = [];

    for (let x = 0; x < NUM_COLS; x++) {
        for (let y = 0; y < NUM_ROWS; y++) {
            let i = x + y * NUM_COLS;
            let t = frames_since;
            let bit = draw_tixy_cell(x, y, i, t, f);

            // if (y == 0) {
            //     panel_1_bits.push(0);
            // } else if (y == 7) {
            //     panel_2_bits.push(0);
            // }

            if (y < 7) {
                panel_1_bits.push(bit);
            } else {
                panel_0_bits.push(bit);
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