/**
 * Panel class
 * 
 * This class holds the panels and processed their data to be cast.
 *
 * @param {int} adapterId Ref to adapter index ID in {netAdapters/serialAdapters}
 * @param {int} panelNum Panel ID (set on the 3-pin DIP switch)
 * @param {int} offsetX X-position in total display
 * @param {int} offsetY Y-position in total display
 */
function Panel(adapterId, panelNum, offsetX, offsetY) {

    let p = {
        adapter: adapterId,
        id : panelNum,
        x : offsetX,
        y : offsetY,
        buffer : new Array(28).fill(0),
        has_changed : true,
        process : process_panel_frame_data,
    }

    return p;
}
    
/** 
 * Process panel's frame data 
 */ 
function process_panel_frame_data() {

    let offset = y * config_canvasW + x;
    has_changed = false;

    // Loop columns in panel
    for (let col = 0; col < 28; col++) {
        let b = 0;
        let index = offset + col;
        
        for (let panel_row = 0; panel_row < 7; panel_row++) {
            let pixelLocationY = index + (panel_row * config_canvasW);
            if (brightness(virtualDisplay.pixels[pixelLocationY]) > 0.5) {
                b |= 1 << panel_row;
            }
        }

        if (b != buffer[col]) {
            has_changed = true;
        }
        buffer[col] = b;
    }
}