import {Segment} from "./segment.js";

export class Snake {

    constructor(tileDiameter) {

        this.NUM_ICONS_PER_SEGMENTS = 8;
        this.SEGMENT_IMAGE_TYPE = 'greenSnakeBody'
        this.movDelta = tileDiameter / this.NUM_ICONS_PER_SEGMENTS;

        this.head;
        this.segments = [];
        this.direction = "left";
        this.nextDirection;
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

    addSegment(funcGetNewPos, insertPos, funcAddImage) {

        let segment = new Segment();

        for (let i = 0; i < this.NUM_ICONS_PER_SEGMENTS; i++) {

            let newPosition = funcGetNewPos(insertPos, i * this.getMovDelta());
            segment.addIcon(funcAddImage(newPosition, this.SEGMENT_IMAGE_TYPE));
        }

        this.getSegments().push(segment);
    }


    addHeadSegment(funcGetNewPos, position, funcAddImage) {
        this.addSegment(funcGetNewPos, position, funcAddImage);
    }


    addBodySegment(funcGetNewPos, funcAddImage) {
        this.addSegment(funcGetNewPos, this.getLast(), funcAddImage);
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

    getOldX() {
        return this.oldPosition.x;
    }

    getOldY() {
        return this.oldPosition.y;
    }

    move(funcGetNewPos) {

        for (let i = this.getSegments().length - 1; i > 0; i--) {
            this.getSegments()[i].move(this.getSegments()[i - 1].getLast());
        }

        this.getSegments()[0].move(this.getHead());

        let newPosition = funcGetNewPos(this.getHead(), this.getMovDelta());

        this.getHead().setPosition(newPosition.x, newPosition.y);
    }

    destroy() {

        for (let i = 0; i < this.getLength(); i++) {
            this.getSegments()[i].destroy();
        }
        this.getSegments().length = 0;
    }
}