const WIDTH = 700;
const HEIGHT = 500;
const BORDER = 50;

const NUM_TEAMS = 2;
const TEAM_COLORS = ['blue', 'red'];

const BLUE_INDEX = 0;
const RED_INDEX = 1;

var scores = {
    blue: 0,
    red: 0
};

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io') (server);

console.log(__dirname);

var players = {};

var apple = {
    x: getRandomX(),
    y: getRandomY()
};

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected: ', socket.id);

    // create a new player and add it to our players object
    players[socket.id] = {
        rotation: 0,
        x: getRandomX(),
        y: getRandomY(),
        playerId: socket.id,
        team: getRandomTeam()
    };

    // send the players object to the new player
    socket.emit('currentPlayers', players);
    // send the apple to the new player
    socket.emit('appleLocation', apple);
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
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;
        players[socket.id].rotation = movementData.rotation;
        // emit a message to all players about the player that moved
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    socket.on('appleCollected', function () {

        const APPLE_SCORE = 10;

        var team = players[socket.id].team;

        if (team === TEAM_COLORS[BLUE_INDEX]) {
            scores.blue += APPLE_SCORE;
        } else if (team === TEAM_COLORS[RED_INDEX]) {
            scores.red += APPLE_SCORE;
        } else {
            console.log("TEAM NOT RECOGNIZED!");
        }

        setAppleCoordinates()

        io.emit('appleLocation', apple);
        io.emit('scoreUpdate', scores);
    });
});

server.listen(8081, function () {
    console.log(`Listening on ${server.address().port}`);
});

function setAppleCoordinates() {
    apple.x = getRandomX();
    apple.y = getRandomY();
}

function getRandomTeam() {
    return TEAM_COLORS[getRandomNum(NUM_TEAMS)];
}

function getRandomX() {
    return getRandomCoordinate(WIDTH);
}

function getRandomY() {
    return getRandomCoordinate(HEIGHT);
}

function getRandomCoordinate(scale) {
    return getRandomNum(scale) + BORDER;
}

function getRandomNum(scale) {
    return Math.floor(Math.random() * scale);
}