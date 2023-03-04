import {Directions} from "./directions.js";

export class Presenter {

    constructor() {

        this.BLUE = 0x0000FF;
        this.RED = 0xFF0000;
        this.BG_COLOR_STR = '#009C29';
        this.BORDER_SIZE = 32;

        this.TILE_DIAMETER = 32;
        this.NUM_ROWS = 20;
        this.NUM_COLS = 30;
        this.WIDTH = this.TILE_DIAMETER * this.NUM_COLS + this.BORDER_SIZE * 2;
        this.HEIGHT = this.TILE_DIAMETER * this.NUM_ROWS + this.BORDER_SIZE * 2;

        this.appleCollected = false;
    }

    getWidth() {
        return this.WIDTH;
    }

    getHeight() {
        return this.HEIGHT;
    }

    getBgColorStr() {
        return this.BG_COLOR_STR;
    }

    getBlue() {
        return this.BLUE;
    }

    getRed() {
        return this.RED;
    }

    getBorderSize() {
        return this.BORDER_SIZE;
    }

    getTileDiameter() {
        return this.TILE_DIAMETER;
    }

    isAppleCollected() {
        return this.appleCollected;
    }

    setAppleCollected(appleCollected) {
        this.appleCollected = appleCollected;
    }

    drawBorder(funcDrawRect, ALPHA) {

        const BORDER_COLOR = 0x004C29;

        funcDrawRect(0, 0, this.getWidth(), this.getBorderSize(), BORDER_COLOR, ALPHA);
        funcDrawRect(0, 0, this.getBorderSize(), this.getHeight(), BORDER_COLOR, ALPHA);
        funcDrawRect(this.getWidth() - this.getBorderSize(), 0, this.getBorderSize(), this.getHeight(), BORDER_COLOR, ALPHA);
        funcDrawRect(0, this.getHeight() - this.getBorderSize(), this.getWidth(), this.getBorderSize(), BORDER_COLOR, ALPHA);
    }

    drawBoard(funcDrawRect) {

        const FG_COLOR = 0x008C29;
        const ALPHA = 1.0;

        let previous = false;

        for (let col = this.getBorderSize(); col < this.getHeight() - this.getBorderSize(); col += this.getTileDiameter()) {
            for (let row = this.getBorderSize(); row < this.getWidth() - this.getBorderSize(); row += this.getTileDiameter()) {
                if (!previous) {
                    funcDrawRect(row, col, this.getTileDiameter(), this.getTileDiameter(), FG_COLOR, ALPHA);
                }
                previous = !previous;
            }
            previous = !previous;
        }

        this.drawBorder(funcDrawRect, ALPHA);
    }

    getPlayerNextDirection(cursors, playerDirection) {

        if (cursors.left.isDown && playerDirection !== Directions.RIGHT) {
            return Directions.LEFT;
        } else if (cursors.right.isDown && playerDirection !== Directions.LEFT) {
            return Directions.RIGHT;
        } else if (cursors.up.isDown && playerDirection !== Directions.DOWN) {
            return Directions.UP;
        } else if (cursors.down.isDown && playerDirection !== Directions.UP) {
            return Directions.DOWN;
        } else {
            return playerDirection;
        }
    }

    isPlayerInBounds(player) {

        if (player.x < this.getBorderSize()) {
            return false;
        } else if (player.x > (this.getWidth() - this.getBorderSize() * 2)) {
            return false;
        } else if (player.y < this.getBorderSize()) {
            return false;
        } else if (player.y > (this.getHeight() - this.getBorderSize() * 2)) {
            return false;
        }

        return true;
    }

    isCoordinateAligned(coordinate) {
        return ((coordinate % this.getTileDiameter()) === 0);
    }

    areCoordinatesAligned(position) {
        return (this.isCoordinateAligned(position.x) && this.isCoordinateAligned(position.y));
    }

    setSnakeDirection(snake, funcAddPlayerIcon) {

        if (!this.areCoordinatesAligned(snake.getHead())) {
            return;
        }

        funcAddPlayerIcon(snake.getSegments());

        snake.getHead().direction = snake.getNextDirection();
    }
}