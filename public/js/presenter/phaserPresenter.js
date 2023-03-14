import {Directions} from "../model/directions.js";
import {PhaserView} from "../view/phaserView.js";

export class PhaserPresenter {

    static TILE_DIAMETER = 32;
    static BORDER_SIZE = 32;
    static NUM_ROWS = 20;
    static NUM_COLS = 30;
    static WIDTH = PhaserPresenter.TILE_DIAMETER * PhaserPresenter.NUM_COLS + PhaserPresenter.BORDER_SIZE * 2;
    static HEIGHT = PhaserPresenter.TILE_DIAMETER * PhaserPresenter.NUM_ROWS + PhaserPresenter.BORDER_SIZE * 2;

    static BG_COLOR_STR = '#009C29'


    constructor(phaserPtr) {

        this.BLUE = 0x0000FF;
        this.RED = 0xFF0000;
        this.TILE_DIAMETER = 32;

        this.appleCollected = false;
        this.phaserView = new PhaserView(phaserPtr);
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

    getPhaserView() {
        return this.phaserView;
    }

    getPhysicsGroup() {
        return this.getPhaserView().addPhysicsGroup();
    }

    addSprite(position, image) {
        return this.getPhaserView().addSprite(position, image);
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

    addImage(position, imageName) {
        return this.getPhaserView().addImage(position, imageName);
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

        for (let col = PhaserPresenter.BORDER_SIZE; col < PhaserPresenter.HEIGHT - PhaserPresenter.BORDER_SIZE; col += this.getTileDiameter()) {
            for (let row = PhaserPresenter.BORDER_SIZE; row < PhaserPresenter.WIDTH - PhaserPresenter.BORDER_SIZE; row += this.getTileDiameter()) {
                if (!previous) {
                    this.getPhaserView().drawRect(row, col, this.getTileDiameter(), this.getTileDiameter(), FG_COLOR, ALPHA);
                }
                previous = !previous;
            }
            previous = !previous;
        }

        this.drawBorder(ALPHA);
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