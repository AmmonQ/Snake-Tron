import {Directions} from "./directions.js";
import {Segment} from "./segment.js";

export class Snake {

    constructor(tileDiameter) {

        this.NUM_ICONS_PER_SEGMENTS = 8;
        this.SEGMENT_IMAGE_TYPE = 'greenSnakeBody';
        this.HEAD_IMAGE_TYPE = 'greenSnakeHead';
        this.TILE_DIAMETER = tileDiameter;
        this.movDelta = this.TILE_DIAMETER / this.NUM_ICONS_PER_SEGMENTS;
        this.segments = [];
        this.direction = "none";
        this.nextDirection = "none";
        this.color = "blue";
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

    getSegmentsAt(i) {
        return this.getSegments()[i];
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
        return this.getSegmentsAt(this.getLength() - 1);
    }

    updateOldPos() {
        this.setOldPosition(this.getX(), this.getY());
    }

    hasMoved() {
        return this.getX() !== this.getOldX() || this.getY() !== this.getOldY();
    }

    getPos() {
        return {
            x: this.getX(),
            y: this.getY()
        };
    }

    getNewPos(position, delta) {

        let newX = position.x;
        let newY = position.y;

        switch (this.getDirection()) {
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

    addSegment(insertPos, view) {

        let segment = new Segment();

        for (let i = 0; i < this.NUM_ICONS_PER_SEGMENTS; i++) {

            let newPosition = this.getNewPos(insertPos, i * this.getMovDelta());
            segment.addIcon(view.addImage(newPosition, this.SEGMENT_IMAGE_TYPE));
        }

        this.getSegments().push(segment);
    }


    addHeadSegment(position, view) {
        this.addSegment(position, view);
        this.getLastSegment().getFirst().destroy();
        this.getLastSegment().setFirst(view.addImage(position, this.HEAD_IMAGE_TYPE));
    }


    addBodySegment(view) {
        this.addSegment(this.getLast(), view);
        this.getLastSegment().setColor(this.color, view);
    }

    isSegmentOverlapping(segment) {

        let head = this.getHead();
        let segmentFirst = segment.getFirst();

        if (Math.abs(head.x - segmentFirst.x) >= this.TILE_DIAMETER) {
            return false;
        } else if (Math.abs(head.y - segmentFirst.y) >= this.TILE_DIAMETER) {
            return false;
        }

        return true;
    }

    isOverlapping() {

        // SKIP the head and the segment immediately behind the head.
        // You can't overlap with the second segment.
        for (let i = 2; i < this.getLength(); i++) {
            if (this.isSegmentOverlapping(this.getSegmentsAt(i))) {
                return true;
            }
        }

        return false;
    }

    move() {

        for (let i = this.getLength() - 1; i > 0; i--) {
            this.getSegmentsAt(i).move(this.getSegmentsAt(i - 1).getLast());
        }

        this.getSegmentsAt(0).move(this.getHead());

        let newPos = this.getNewPos(this.getHead(), this.getMovDelta());

        this.getHead().setPosition(newPos.x, newPos.y);
    }

    destroy() {

        for (let i = 0; i < this.getLength(); i++) {
            this.getSegmentsAt(i).destroy();
        }
        this.getSegments().length = 0;
        this.direction = "none";
        this.nextDirection = "none";
    }

    setColor(color, view) {

        for (let i = 0; i < this.getLength(); i++) {
            this.getSegmentsAt(i).setColor(color, view);
        }

        this.color = color;
    }

    updateDirection() {
        this.setDirection(this.getNextDirection());
    }
}