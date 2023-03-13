module.exports.Player = class Player {

    // TODO: add segments here!
    constructor(position, id, team) {
        this.position = position;
        this.id = id;
        this.team = team;
        this.direction = 'right';
        this.nextDirection = 'right';
    }

    toString() {
        return "{" + "\n" +
                    "\tposition: " + this.position + "\n" +
                    "\tid: " + this.id + "\n" +
                    "\tteam: " + this.team + "\n" +
                    "\tdirection: " + this.direction + "\n" +
               "}";
    }
}