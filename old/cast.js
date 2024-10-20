/**
 * Setup casting
 *
 * If casting is enabled, connected to the ETH-Serial converters.
 * Uncomment `printArray(Serial.list());` to list USB devices.
 */
export function cast_setup() {
    // Cast data
    if (!config_cast) return;

    // Cast over Network
    if (castOver == 1) {
        // Connect to each network adapter
        for (let i = 0; i < netAdapters.length; i++) {
            let adapterAddress = split(netAdapters[i], ':');
            adaptersNet[i] = new Client(this, adapterAddress[0], int(adapterAddress[1]));
        }
    }
    // Cast over USB Serial device
    else if (castOver == 2) {
        // Uncomment List all the available serial ports:
        // printArray(Serial.list());

        // Connect to each USB serial device
        for (let i = 0; i < serialAdapters.length; i++) {
            let adapterAddress = split(serialAdapters[i], ':');
            adaptersSerial[i] = new Serial(this, adapterAddress[0], int(adapterAddress[1]));
        }
    }
}


/**
 * Cast data to display
 */
export async function cast_broadcast(writer) {
    // Only if casting is enabled.
    if (!config_cast) return;

    // Push data to all adapters
    let adapterCount = netAdapters.length;
    if (castOver == 2) {
        adapterCount = serialAdapters.length;
    }

    for (let adapter = 0; adapter < adapterCount; adapter++) {
        // Each panel connected to adapter
        for (let i = 0; i < panels.length; i++) {
            // Is this panel connected to this adapter
            if (panels[i].adapter != adapter) continue;

            // If enabled and panel image has not changed, skip
            if (config_cast_only_changed && panels[i].has_changed == false) continue;

            // Send frame data
            // cast_write(adapter, 0x80);
            // cast_write(adapter, (config_video_sync) ? 0x84 : 0x83);
            // cast_write(adapter, panels[i].id);
            // cast_write(adapter, panels[i].buffer);
            // cast_write(adapter, 0x8F);

            writer.write(0x80);
            writer.write((config_video_sync) ? 0x84 : 0x83);
            writer.write(panels[i].id);
            writer.write(panels[i].buffer);
            writer.write(0x8F);
        }
    }

    // Video sync update
    // This instruction tells all panels to refresh
    if (config_video_sync) {
        for (let adapter = 0; adapter < adapterCount; adapter++) {
            // Refresh all panels command
            // cast_write(adapter, 0x80);
            // cast_write(adapter, 0x82);
            // cast_write(adapter, 0x8F);

            writer.write(0x80);
            writer.write(0x82);
            writer.write(0x8F);
        }
    }
}


/**
 * Cast write
 *
 * Push data out over adapter.
 *
 * @param {int} adapter Adapter ID {netAdapters/serialAdapters} 
 * @param {int/byte/byte[]} data Frame data
 * 
 */
function cast_write(adapter, data) {
    if (castOver == 1) {
        // Network adapter
        adaptersNet[adapter].write(data);
    } else if (castOver == 2) {
        // USB Serial device
        adaptersSerial[adapter].write(data);
    }
}