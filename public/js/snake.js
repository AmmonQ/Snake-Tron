import {Segment} from "./segment.js";

export class Snake {

    constructor() {
        this.head;
        this.segments = [];
        this.direction = "left";
        this.nextDirection;
    }

    getHead() {
        return this.segments[0].getFirst();
    }

    getSegments() {
        return this.segments;
    }

    addSegment(segment) {
        this.segments.push(segment);
    }

    getDirection() {
        return this.direction;
    }

    setDirection(direction) {
        this.direction = direction;
    }

    getNextDirection() {
        return this.nextDirection;
    }

    setNextDirection(nextDirection) {
        this.nextDirection = nextDirection;
    }
}