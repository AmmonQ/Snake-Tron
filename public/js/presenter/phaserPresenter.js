import {Directions} from "../model/directions.js";
import {PhaserView} from "../view/phaserView.js";

export class PhaserPresenter {

    static ROW_COL_SIZE = 32;
    static BORDER_SIZE = 32;
    static NUM_ROWS = 20;
    static NUM_COLS = 30;
    static WIDTH = PhaserPresenter.ROW_COL_SIZE * PhaserPresenter.NUM_COLS + PhaserPresenter.BORDER_SIZE * 2;
    static HEIGHT = PhaserPresenter.ROW_COL_SIZE * PhaserPresenter.NUM_ROWS + PhaserPresenter.BORDER_SIZE * 2;

    static BG_COLOR_STR = '#009C29'

    constructor(phaserPtr) {

        this.BLUE = 0x0000FF;
        this.RED = 0xFF0000;
        this.ROW_COL_SIZE = 32;

        this.phaserView = new PhaserView(phaserPtr);
    }

    getBlue() {
        return this.BLUE;
    }

    getRed() {
        return this.RED;
    }

    getRowColSize() {
        return this.ROW_COL_SIZE;
    }

    getPhaserView() {
        return this.phaserView;
    }

    getPhysicsGroup() {
        return this.getPhaserView().addPhysicsGroup();
    }

    convertRowToY(row) {
        return (row * this.getRowColSize()) + PhaserPresenter.BORDER_SIZE;
    }

    convertColToX(col) {
        return (col * this.getRowColSize()) + PhaserPresenter.BORDER_SIZE;
    }

    addSprite(row, col, image) {
        return this.getPhaserView().addSprite(this.convertColToX(col), this.convertRowToY(row), image);
    }

    loadImages() {
        this.getPhaserView().loadImages();
    }

    addCollision(item1, item2, callbackFunc) {
        this.getPhaserView().addCollision(item1, item2, callbackFunc);
    }

    addOverlap(item1, item2, callbackFunc) {
        this.getPhaserView().addOverlap(item1, item2, callbackFunc)
    }

    addImage(row, col, imageName) {
        return this.getPhaserView().addImage(this.convertColToX(col), this.convertRowToY(row), imageName);
    }

    convertToColor(colorStr) {
        switch(colorStr) {
            case "blue":
                return this.getBlue();
            case "red":
                return this.getRed();
        }
    }

    drawBorder(ALPHA) {

        const BORDER_COLOR = 0x004C29;

        this.getPhaserView().drawRect(0, 0, PhaserPresenter.WIDTH, PhaserPresenter.BORDER_SIZE, BORDER_COLOR, ALPHA);
        this.getPhaserView().drawRect(0, 0, PhaserPresenter.BORDER_SIZE, PhaserPresenter.HEIGHT, BORDER_COLOR, ALPHA);
        this.getPhaserView().drawRect(PhaserPresenter.WIDTH - PhaserPresenter.BORDER_SIZE, 0, PhaserPresenter.BORDER_SIZE, PhaserPresenter.HEIGHT, BORDER_COLOR, ALPHA);
        this.getPhaserView().drawRect(0, PhaserPresenter.HEIGHT - PhaserPresenter.BORDER_SIZE, PhaserPresenter.WIDTH, PhaserPresenter.BORDER_SIZE, BORDER_COLOR, ALPHA);
    }

    drawBoard() {

        const FG_COLOR = 0x008C29;
        const ALPHA = 1.0;

        let previous = false;

        for (let col = PhaserPresenter.BORDER_SIZE; col < PhaserPresenter.HEIGHT - PhaserPresenter.BORDER_SIZE; col += this.getRowColSize()) {
            for (let row = PhaserPresenter.BORDER_SIZE; row < PhaserPresenter.WIDTH - PhaserPresenter.BORDER_SIZE; row += this.getRowColSize()) {
                if (!previous) {
                    this.getPhaserView().drawRect(row, col, this.getRowColSize(), this.getRowColSize(), FG_COLOR, ALPHA);
                }
                previous = !previous;
            }
            previous = !previous;
        }

        this.drawBorder(ALPHA);
    }

    getPlayerNextDirection(cursors, playerDirection, nextDir) {

        if (cursors.left.isDown && playerDirection !== Directions.RIGHT) {
            return Directions.LEFT;
        } else if (cursors.right.isDown && playerDirection !== Directions.LEFT) {
            return Directions.RIGHT;
        } else if (cursors.up.isDown && playerDirection !== Directions.DOWN) {
            return Directions.UP;
        } else if (cursors.down.isDown && playerDirection !== Directions.UP) {
            return Directions.DOWN;
        } else {
            return nextDir;
        }
    }

    isPlayerInBounds(player) {

        if (player.x < PhaserPresenter.BORDER_SIZE) {
            return false;
        } else if (player.x > (PhaserPresenter.WIDTH - PhaserPresenter.BORDER_SIZE * 2)) {
            return false;
        } else if (player.y < PhaserPresenter.BORDER_SIZE) {
            return false;
        } else if (player.y > (PhaserPresenter.HEIGHT - PhaserPresenter.BORDER_SIZE * 2)) {
            return false;
        }

        return true;
    }

    isCoordinateAligned(coordinate) {
        return ((coordinate % this.getRowColSize()) === 0);
    }

    areCoordinatesAligned(position) {
        return (this.isCoordinateAligned(position.x) && this.isCoordinateAligned(position.y));
    }

    setSnakeDirection(snake) {
        if (!this.areCoordinatesAligned(snake.getHead())) {
            return;
        }
        console.log("setting snake direction");


        snake.updateDirection();
    }
}