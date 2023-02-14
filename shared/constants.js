module.exports.Constants = class {

    static BLUE = 0x0000FF;
    static RED = 0xFF0000;
    static BG_COLOR_STR = '#009C29';
    static BORDER_SIZE = 32;

    static ROW_COL_SIZE = 32;
    static NUM_ROWS = 20;
    static NUM_COLS = 30;
    static WIDTH = this.ROW_COL_SIZE * this.NUM_COLS + this.BORDER_SIZE * 2;
    static HEIGHT = this.ROW_COL_SIZE * this.NUM_ROWS + this.BORDER_SIZE * 2;
}