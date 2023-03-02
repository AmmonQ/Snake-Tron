export class Presenter {

    constructor() {
        
        this.BLUE = 0x0000FF;
        this.RED = 0xFF0000;
        this.BG_COLOR_STR = '#009C29';
        this.BORDER_SIZE = 32;

        this.ROW_COL_SIZE = 32;
        this.NUM_ROWS = 20;
        this.NUM_COLS = 30;
        this.WIDTH = this.ROW_COL_SIZE * this.NUM_COLS + this.BORDER_SIZE * 2;
        this.HEIGHT = this.ROW_COL_SIZE * this.NUM_ROWS + this.BORDER_SIZE * 2;
    }

    getWidth() {
        return this.WIDTH;
    }

    getHeight() {
        return this.HEIGHT;
    }
}