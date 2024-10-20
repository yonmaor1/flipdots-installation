function setup() {
	createCanvas(windowWidth, windowHeight);
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
}

function rasterize(width_in, height_in, width_out, height_out = Infinity) {
	/**
	 * calculate the avarage brightness in each section of the canvas
	 * 
	 * width_in: width of canvas
	 * height_in: height of the canvas
	 * width_out: width of the output image (ncols in the flip dot display)
	 * 
	 * return: 1D array of brightnesses
	 */

	pixels_per_col_out = int(width_in / width_out);
	height_out = min(height_out, int(height_in / pixels_per_col_out));

	loadPixels();
	pd = pixelDensity();
	background(240);

	// create an array to store the brightnesses
	let rasterized_brightnesses = []
	for (let i = 0; i < height_out * width_out; i++) {
		rasterized_brightnesses.push(0);
	}

	// calculate the 'total' brightness
	noStroke();
	for (let y_out = 0; y_out < height_out; y_out++) {
		for (let x_out = 0; x_out < width_out; x_out++) {
			// fill(0, 0, 0, 254)
			// ellipse(x_out * pixels_per_col_out, y_out * pixels_per_col_out, 1);
			for (let x = 0; x < pixels_per_col_out; x ++) {
				for (let y = 0; y < pixels_per_col_out; y ++) {
					let index = (x + x_out * pixels_per_col_out + (y + y_out * pixels_per_col_out) * width_in * pd) * 4 * pd;
					let r = pixels[index] / 255;
					let g = pixels[index + 1] / 255;
					let b = pixels[index + 2] / 255;
					let a = pixels[index + 3] / 255;

					// fill(r*255, g*255, b*255, 254)
					// ellipse(x + x_out * pixels_per_col_out, y + y_out * pixels_per_col_out, 1);

					let brightness = (0.2126*r + 0.7152*g + 0.0722*b);

					rasterized_brightnesses[y_out * width_out + x_out] += brightness;
				}
			}
		}
	}

	// calculate the average brightness
	for (let i = 0; i < height_out * width_out; i++) {
		rasterized_brightnesses[i] = round(rasterized_brightnesses[i] / (pixels_per_col_out * pixels_per_col_out));
		
	}

	return rasterized_brightnesses;

}

function draw_rasterized_image(rasterized_brightnesses, width_out) {
	/**
	 * draw the rasterized image
	 * 
	 * rasterized_brightnesses: 1D array of brightnesses
	 * width_out: width of the output image (ncols in the flip dot display)
	 */

	let pixels_per_col_out = int(width / width_out);

	for (let i = 0; i < rasterized_brightnesses.length; i++) {
		let row = int(i / width_out);
		let col = i % width_out;
		fill(rasterized_brightnesses[i] * 255, 200);
		rect(col * pixels_per_col_out, row * pixels_per_col_out, pixels_per_col_out);
	}
}