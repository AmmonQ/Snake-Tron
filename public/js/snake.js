import {Directions} from "./directions.js";
import {Segment} from "./segment.js";

export class Snake {

    constructor(tileDiameter) {

        this.NUM_ICONS_PER_SEGMENTS = 8;
        this.SEGMENT_IMAGE_TYPE = 'greenSnakeBody';
        this.HEAD_IMAGE_TYPE = 'greenSnakeHead';
        this.movDelta = tileDiameter / this.NUM_ICONS_PER_SEGMENTS;

        this.segments = [];
        this.direction = Directions.LEFT;
        this.nextDirection;
        this.color = "blue";
        this.funcSetIconColor = (icon, color) => {};
        this.position = {
            x: -1,
            y: -1
        }
        this.oldPosition =  {
            x: -1,
            y: -1
        };
    }

    setMovDelta(movDelta) {
        this.movDelta = movDelta;
    }

    getMovDelta() {
        return this.movDelta;
    }

    getHead() {
        return this.segments[0].getFirst();
    }

    getLast() {
        return this.getSegments()[this.getLength() - 1].getLast();
    }

    getSegments() {
        return this.segments;
    }

    getLength() {
        return this.getSegments().length;
    }

    getDirection() {
        return this.direction;
    }

    setDirection(direction) {
        this.direction = direction;
    }

    isAlive() {
        return this.getLength() !== 0;
    }

    getNextDirection() {
        return this.nextDirection;
    }

    setNextDirection(nextDirection) {
        this.nextDirection = nextDirection;
    }

    setOldPosition(x, y) {
        this.oldPosition.x = x;
        this.oldPosition.y = y;
    }

    getX() {
        return this.getHead().x;
    }

    getY() {
        return this.getHead().y
    }

    getOldX() {
        return this.oldPosition.x;
    }

    getOldY() {
        return this.oldPosition.y;
    }

    getLastSegment() {
        return this.getSegments()[this.getLength() - 1];
    }

    updatePos() {
        this.setOldPosition(this.getX(), this.getY());
    }

    hasMoved() {
        return this.getX() !== this.getOldX() || this.getY() !== this.getOldY();
    }

    getNewPos(position, delta) {

        let newX = position.x;
        let newY = position.y;

        switch (position.direction) {
            case Directions.LEFT:
                newX -= delta;
                break;
            case Directions.RIGHT:
                newX += delta;
                break;
            case Directions.UP:
                newY -= delta;
                break;
            case Directions.DOWN:
                newY += delta;
                break;
        }

        return {
            x: newX,
            y: newY
        };
    }

    addSegment(insertPos, funcAddImage) {

        let segment = new Segment();

        for (let i = 0; i < this.NUM_ICONS_PER_SEGMENTS; i++) {

            let newPosition = this.getNewPos(insertPos, i * this.getMovDelta());
            segment.addIcon(funcAddImage(newPosition, this.SEGMENT_IMAGE_TYPE));
        }

        this.getSegments().push(segment);
    }


    addHeadSegment(position, funcAddImage) {
        this.addSegment(position, funcAddImage);
        this.getLastSegment().getFirst().destroy();
        this.getLastSegment().setFirst(funcAddImage(position, this.HEAD_IMAGE_TYPE));
    }


    addBodySegment(funcAddImage) {
        this.addSegment(this.getLast(), funcAddImage);
        this.getLastSegment().setColor(this.color, this.funcSetIconColor);
    }

    move() {

        for (let i = this.getSegments().length - 1; i > 0; i--) {
            this.getSegments()[i].move(this.getSegments()[i - 1].getLast());
        }

        this.getSegments()[0].move(this.getHead());

        let newPos = this.getNewPos(this.getHead(), this.getMovDelta());

        this.getHead().setPosition(newPos.x, newPos.y);
    }

    destroy() {

        for (let i = 0; i < this.getLength(); i++) {
            this.getSegments()[i].destroy();
        }
        this.getSegments().length = 0;
    }

    setColor(color, funcSetIconColor) {

        for (let i = 0; i < this.getLength(); i++) {
            this.getSegments()[i].setColor(color, funcSetIconColor);
        }

        this.color = color;
        this.funcSetIconColor = funcSetIconColor;
    }
}