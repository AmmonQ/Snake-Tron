import {Segment} from "./segment.js";

export class Snake {

    constructor() {
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

    getHead() {
        return this.segments[0].getFirst();
    }

    getSegments() {
        return this.segments;
    }

    getLength() {
        return this.getSegments().length;
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

    move(funcGetNewPos, movDelta) {

        for (let i = this.getSegments().length - 1; i > 0; i--) {
            this.getSegments()[i].move(this.getSegments()[i - 1].getLast());
        }

        this.getSegments()[0].move(this.getHead());

        let newPosition = funcGetNewPos(this.getHead(), movDelta);

        this.getHead().setPosition(newPosition.x, newPosition.y);
    }

    destroy() {

        for (let i = 0; i < this.getLength(); i++) {
            this.getSegments()[i].destroy();
        }
        this.getSegments().length = 0;
    }
}