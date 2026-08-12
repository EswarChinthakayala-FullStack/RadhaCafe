// ESC/POS Command Constants for Thermal Printer
export const ESC_POS_COMMANDS = {
  INIT: [0x1B, 0x40],                     // Initialize printer
  ALIGN_LEFT: [0x1B, 0x61, 0x00],         // Left align
  ALIGN_CENTER: [0x1B, 0x61, 0x01],       // Center align
  ALIGN_RIGHT: [0x1B, 0x61, 0x02],        // Right align
  TEXT_NORMAL: [0x1B, 0x21, 0x00],        // Normal text size
  TEXT_BOLD_ON: [0x1B, 0x45, 0x01],       // Bold text ON
  TEXT_BOLD_OFF: [0x1B, 0x45, 0x00],      // Bold text OFF
  TEXT_DOUBLE_HEIGHT: [0x1B, 0x21, 0x10], // Double height
  TEXT_DOUBLE_WIDTH: [0x1B, 0x21, 0x20],  // Double width
  TEXT_LARGE: [0x1B, 0x21, 0x30],         // Double height + width
  FEED_LINE: [0x0A],                      // Line feed
  FEED_PAPER_3_LINES: [0x1B, 0x64, 0x03], // Feed 3 lines
  CUT_PAPER: [0x1D, 0x56, 0x41, 0x00],    // Full cut paper
};

export const BLE_CHUNK_SIZE = 20;
