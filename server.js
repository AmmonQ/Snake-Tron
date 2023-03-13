let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io') (server);

let coordinateJS = require('./shared/coordinate.js');
let appleJS = require('./shared/apple.js');
let playerJS = require('./shared/player.js');

const NUM_TEAMS = 2;
const TEAM_COLORS = ['blue', 'red'];

const BLUE_INDEX = 0;
const RED_INDEX = 1;

const BORDER_SIZE = 32;

const ROW_COL_SIZE = 32;
const NUM_ROWS = 20;
const NUM_COLS = 30;

let scores = {
    blue: 0,
    red: 0
};

let players = {};

let apple = new appleJS.Apple(
    new coordinateJS.Coordinate(getRandomX(), getRandomY())
);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected: ', socket.id);

    // create a new player and add it to our players object
    players[socket.id] = new playerJS.Player(
        new coordinateJS.Coordinate(getRandomX(), getRandomY()), 
        socket.id, 
        getRandomTeam()
    );

    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // send the apple to the new player
    socket.emit('appleLocation', apple.getPosition());
    // send the current scores
    socket.emit('scoreUpdate', scores);
    // update all other players of the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // when a player disconnects, remove them from our players object
    socket.on('disconnect', function () {
        console.log('User disconnected: ', socket.id);
        delete players[socket.id];
        // emit a message to all players to remove this player
        io.emit('disconnected', socket.id);
    });

    // when a player moves, update the player data
    socket.on('playerMovement', function (movementData) {
        players[socket.id].position = new coordinateJS.Coordinate(movementData.x, movementData.y);
        // emit a message to all players about the player that moved
        io.emit('playerMoved', players[socket.id]);
    });

    socket.on('appleCollected', function () {

        let team = players[socket.id].team;
        updateScores(team);
        updateApple();
    });

    socket.on('playerDied', function () {
        players[socket.id] = new playerJS.Player(
            new coordinateJS.Coordinate(getRandomX(), getRandomY()),
            socket.id,
            players[socket.id].team
        );
        socket.emit('currentPlayers', players);
        socket.emit('appleLocation', apple.getPosition());
        io.emit("playerMoved", players[socket.id]);
    });
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});

function updateScores(team) {

    const APPLE_SCORE = 10;


    if (team === TEAM_COLORS[BLUE_INDEX]) {
        scores.blue += APPLE_SCORE;
    } else if (team === TEAM_COLORS[RED_INDEX]) {
        scores.red += APPLE_SCORE;
    } else {
        console.log("TEAM NOT RECOGNIZED!");
    }

    io.emit('scoreUpdate', scores);
}

function updateApple() {
    setAppleCoordinates()
    io.emit('appleLocation', apple.getPosition());
}

// This is what the server should do, make decisions and send information about the decision to clients
function setAppleCoordinates() {
    console.log("Hello there");
    apple.setPosition(new coordinateJS.Coordinate(getRandomX(), getRandomY()));
}

function getRandomTeam() {
    return TEAM_COLORS[getRandomNum(NUM_TEAMS)];
}

function getRandomX() {
    return (getRandomCoordinate(NUM_COLS) * ROW_COL_SIZE) + BORDER_SIZE;
}

function getRandomY() {
    return (getRandomCoordinate(NUM_ROWS) * ROW_COL_SIZE) + BORDER_SIZE;
}

function getRandomCoordinate(scale) {
    return getRandomNum(scale);
}

function getRandomNum(scale) {
    return Math.floor(Math.random() * scale);
}