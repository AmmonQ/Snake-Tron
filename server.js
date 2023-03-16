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

const NUM_ROWS = 20;
const NUM_COLS = 30;

let scores = {
    blue: 0,
    red: 0
};

let players = {};
let clientSnakes = {};

let apple = new appleJS.Apple(
    new coordinateJS.Coordinate(getRandomRow(), getRandomCol())
);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/html/index.html');
});

io.on('connection', function (socket) {
    console.log('a user connected: ', socket.id);

    // create a new player and add it to our players object
    players[socket.id] = new playerJS.Player(
        new coordinateJS.Coordinate(getRandomRow(), getRandomCol()), 
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

    socket.on('appleCollected', function (data) {

        let clientSnake = data.snake;
        let segments = clientSnake.segments;
        let socketID = data.socketID;

        // console.log("socketID: " + socketID);
        // console.log("clientSnake: " + clientSnake);
        // console.log("segments: " + segments);
        // console.log("length: " + segments.length);
        // console.log("headX: " + segments[0].icons[0].x);
        // console.log("headY: " + segments[0].icons[0].y);

        let team = players[socket.id].team;
        updateScores(team);
        updateApple(clientSnake);
    });

    socket.on('playerDied', function () {
        players[socket.id] = new playerJS.Player(
            new coordinateJS.Coordinate(getRandomRow(), getRandomCol()),
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

function updateApple(snake) {
    setAppleCoordinates(snake)
    io.emit('appleLocation', apple.getPosition());
}

function isOverlapping(item1, item2) {

    // if (Math.abs(item1.x - item2.x) >= ROW_COL_SIZE) {
    //     return false;
    // } else if (Math.abs(item1.y - item2.y) >= ROW_COL_SIZE) {
    //     return false;
    // }

    return true;
}

function isAppleOverlappingPlayer(apple, snake) {

    for (let segment of snake.segments) {

        console.log("apple.getPosition().getX(): " + apple.getPosition().getRow());
        console.log("apple.getPosition().getY(): " + apple.getPosition().getCol());
        console.log("segment.icons[0].x: " + segment.icons[0].x);
        console.log("segment.icons[0].y: " + segment.icons[0].y);

        if (isOverlapping(apple.getPosition(), segment.icons[0])) {
            return true;
        }
    }

    return false;
}

// This is what the server should do, make decisions and send information about the decision to clients
function setAppleCoordinates(snake) {

    apple.setPosition(new coordinateJS.Coordinate(getRandomRow(), getRandomCol()));

    // if (!isAppleOverlappingPlayer(apple, snake)) {
    //     return;
    // }

    // for (let row = apple.getPosition().getRow(); row < NUM_ROWS; row++) {
    //     for (let col = apple.getPosition().getCol(); col < NUM_COLS; col++) {
    //         apple.setPosition(new coordinateJS.Coordinate(row, col));
    //         if (!isAppleOverlappingPlayer(apple, snake)) {
    //             return;
    //         }
    //     }
    // }

    // console.log("There is no room for an apple anywhere");
    // apple.setPosition(-1, -1);
}

function getRandomTeam() {
    return TEAM_COLORS[getRandomNum(NUM_TEAMS)];
}

function getRandomRow() {
    return getRandomCoordinate(NUM_ROWS);
}

function getRandomCol() {
    return getRandomCoordinate(NUM_COLS);
}

function getRandomCoordinate(scale) {
    return getRandomNum(scale);
}

function getRandomNum(scale) {
    return Math.floor(Math.random() * scale);
}