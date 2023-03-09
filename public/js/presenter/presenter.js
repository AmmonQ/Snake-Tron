import {Directions} from "../model/directions.js";

export class Presenter {

    static TILE_DIAMETER = 32;
    static BORDER_SIZE = 32;
    static NUM_ROWS = 20;
    static NUM_COLS = 30;
    static WIDTH = Presenter.TILE_DIAMETER * Presenter.NUM_COLS + Presenter.BORDER_SIZE * 2;
    static HEIGHT = Presenter.TILE_DIAMETER * Presenter.NUM_ROWS + Presenter.BORDER_SIZE * 2;

    static BG_COLOR_STR = '#009C29'


    constructor() {

        this.BLUE = 0x0000FF;
        this.RED = 0xFF0000;

        this.TILE_DIAMETER = 32;

        this.appleCollected = false;
    }

    getBlue() {
        return this.BLUE;
    }

    getRed() {
        return this.RED;
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

    convertToColor(colorStr) {
        switch(colorStr) {
            case "blue":
                return this.getBlue();
            case "red":
                return this.getRed();
        }
    }

    drawBorder(view, ALPHA) {

        const BORDER_COLOR = 0x004C29;

        view.drawRect(0, 0, Presenter.WIDTH, Presenter.BORDER_SIZE, BORDER_COLOR, ALPHA);
        view.drawRect(0, 0, Presenter.BORDER_SIZE, Presenter.HEIGHT, BORDER_COLOR, ALPHA);
        view.drawRect(Presenter.WIDTH - Presenter.BORDER_SIZE, 0, Presenter.BORDER_SIZE, Presenter.HEIGHT, BORDER_COLOR, ALPHA);
        view.drawRect(0, Presenter.HEIGHT - Presenter.BORDER_SIZE, Presenter.WIDTH, Presenter.BORDER_SIZE, BORDER_COLOR, ALPHA);
    }

    drawBoard(view) {

        const FG_COLOR = 0x008C29;
        const ALPHA = 1.0;

        let previous = false;

        for (let col = Presenter.BORDER_SIZE; col < Presenter.HEIGHT - Presenter.BORDER_SIZE; col += this.getTileDiameter()) {
            for (let row = Presenter.BORDER_SIZE; row < Presenter.WIDTH - Presenter.BORDER_SIZE; row += this.getTileDiameter()) {
                if (!previous) {
                    view.drawRect(row, col, this.getTileDiameter(), this.getTileDiameter(), FG_COLOR, ALPHA);
                }
                previous = !previous;
            }
            previous = !previous;
        }

        this.drawBorder(view, ALPHA);
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

        if (player.x < Presenter.BORDER_SIZE) {
            return false;
        } else if (player.x > (Presenter.WIDTH - Presenter.BORDER_SIZE * 2)) {
            return false;
        } else if (player.y < Presenter.BORDER_SIZE) {
            return false;
        } else if (player.y > (Presenter.HEIGHT - Presenter.BORDER_SIZE * 2)) {
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

    setSnakeDirection(snake, game) {

        if (!this.areCoordinatesAligned(snake.getHead())) {
            return;
        }

        game.addPlayerIcon(snake.getSegments());

        snake.updateDirection();
    }
}