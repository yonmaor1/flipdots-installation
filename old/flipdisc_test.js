// import { createDisplay } from 'flipdisc' 
// import { rasterize, draw_rasterized_image } from './process.js'


const path = '/dev/tty0'
// const display = createDisplay([[1], [2]], path) 

function setup() {
	createCanvas(windowWidth, windowHeight);
    background(240);
	// noLoop()
}

function draw() {
	background(240);
	fill('black')
	stroke('black')
	ellipse(mouseX, mouseY, mouseX)

	let width_out = int(width / 100);

	rasterized_brightnesses = rasterize(width, height, width_out);
	draw_rasterized_image(rasterized_brightnesses, width_out);

    // display.send(frameData)
}