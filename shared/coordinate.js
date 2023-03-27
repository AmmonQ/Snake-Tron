module.exports.Coordinate = class Coordinate {

    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    getRow() {
        return this.row;
    }

    getCol() {
        return this.col;
    }

    toString() {
        return "{" + "\n" +
                    "\trow: " + this.row + "\n" +
                    "\tcol: " + this.col + "\n" +
               "}";
    }
}