function setup() {
	createCanvas(28 * 28, 14 * 28);
	// noLoop()
}

function draw() {
	background(220);
	fill('black')
	stroke('black')
	ellipse(mouseX, mouseY, mouseX)

    canvas2display()
}

