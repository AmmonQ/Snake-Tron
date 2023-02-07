module.exports.Apple = class Apple {

    #position;

    constructor(position) {
        this.#position = position;
    }

    getPosition() {
        return this.#position;
    }

    setPosition(position) {
        this.#position = position;
    }

    toString() {
        return "{" + "\n" +
                    "\tposition: " + this.#position + "\n" +
               "}";
    }
}