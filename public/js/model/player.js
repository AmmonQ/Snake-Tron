module.exports.Player = class Player {

    constructor(position, id, team) {
        this.rotation = 0;
        this.position = position;
        this.id = id;
        this.team = team;
        this.direction = 'right';
    }
    
    toString() {
        return "{" + "\n" +
                    "\trotation: " + this.rotation + "\n" +
                    "\tposition: " + this.position + "\n" +
                    "\tid: " + this.id + "\n" +
                    "\tteam: " + this.team + "\n" +
                    "\tdirection: " + this.direction + "\n" +
               "}";
    }
}