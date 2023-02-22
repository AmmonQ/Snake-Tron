module.exports.Coordinate = class Coordinate {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    getX() {
        return this.x;
    }

    getY() {
        return this.y;
    }

    toString() {
        return "{" + "\n" +
                    "\tx: " + this.x + "\n" +
                    "\ty: " + this.y + "\n" +
               "}";
    }
}