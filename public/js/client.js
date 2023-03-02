import { Presenter } from './presenter.js'
import { Segment } from "./segment.js";
import { Snake } from "./snake.js"

let presenter = new Presenter();

let config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: presenter.getWidth(),
    height: presenter.getHeight(),
    backgroundColor: presenter.getBgColorStr(),
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

let graphics;
let physics;

function drawRect(x1, y1, x2, y2, color, alpha) {
    graphics.fillStyle(color, alpha);
    graphics.fillRect(x1, y1, x2, y2);
}

function preload() {

    let self = this;
    graphics = self.add.graphics();
    physics = self.physics;

    self.load.image('background', 'assets/grass.png');
    self.load.image('playerIcon', 'assets/pink_snake_tongue_pixel.png');
    self.load.image('otherPlayer', 'assets/pink_snake_pixel.png');
    self.load.image('apple', 'assets/apple.png');
    self.load.image('greenSnakeHead', 'assets/green_snake_head.png')
    self.load.image('foeSnakeHead', 'assets/foe_snake_head.png')
    self.load.image('foeSnakeTurn', 'assets/foe_snake_turn.png')
    self.load.image('foeSnakeTail', 'assets/foe_snake_tail.png')
    self.load.image('foeSnakeBody', 'assets/foe_snake_body.png')
    self.load.image('greenSnakeBody', 'assets/green_snake_body.png')
    self.load.image('greenSnakeTail', 'assets/green_snake_tail.png')
    self.load.image('greenSnakeTurn', 'assets/green_snake_turn.png')

    presenter.drawBoard(drawRect);
}

function initScoreText(self) {

    const BLUE_X = 16;
    const RED_X = 584;
    const SCORE_Y = 16;
    const FONT_SIZE = '32px'
    const BLUE_STR = '#0000FF';
    const RED_STR = '#FF0000';

    self.blueScoreText = self.add.text(BLUE_X, SCORE_Y, '', { fontSize: FONT_SIZE, fill: BLUE_STR });
    self.redScoreText = self.add.text(RED_X, SCORE_Y, '', { fontSize: FONT_SIZE, fill: RED_STR });
}

function addOtherPlayers(self, playerInfo) {

    const otherPlayer = self.add.sprite(playerInfo.position.x, playerInfo.position.y, 'otherPlayer').setOrigin(0.0, 0.0);
    setPlayerColor(otherPlayer, playerInfo);

    otherPlayer.id = playerInfo.id;
    self.otherPlayers.add(otherPlayer);
}

function addPlayer(self, playerInfo) {

    console.log("Adding player");

    self.playerSegments = [];

    presenter.addSegment(self.playerSegments, playerInfo.position, addImage, 'greenSnakeBody');

    setPlayerColor(self.playerSegments, playerInfo);
}

function addPlayers(self, players) {

    Object.keys(players).forEach(function (id) {
        if (players[id].id === self.socket.id) {
            addPlayer(self, players[id]);
        } else {
            addOtherPlayers(self, players[id]);
        }
    });
}

function disconnect(self, playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.id) {
            otherPlayer.destroy();
        }
    });
}

function movePlayer(self, playerInfo) {

    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.id === otherPlayer.id) {
            otherPlayer.setPosition(playerInfo.position.x, playerInfo.position.y);
        }
    });
}

// TODO: Should be in Server
function updateScores(self, scores) {

    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
}

function addImage(position, image) {
    return physics.add.image(position.x, position.y, image).setOrigin(0.0, 0.0);
}

// TODO: Should be in Server
function updateApple(self, appleLocation) {

    if (self.apple) {
        self.apple.destroy();
    }

    self.apple = addImage(appleLocation, 'apple');

    physics.add.overlap(self.playerSegments[0].getFirst(), self.apple, function () {
        presenter.setAppleCollected(true);

        self.socket.emit('appleCollected');
    }, null, self);
}

function create() {

    let self = this;
    self.socket = io();

    self.otherPlayers = physics.add.group();
    self.cursors = self.input.keyboard.createCursorKeys();

    initScoreText(self);

    self.socket.on('currentPlayers', function (players) {
        addPlayers(self, players);
    });

    self.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    self.socket.on('disconnected', function (playerId) {
        disconnect(self, playerId);
    });

    self.socket.on('playerMoved', function (playerInfo) {
        movePlayer(self, playerInfo);
    });

    self.socket.on('scoreUpdate', function (scores) {
        updateScores(self, scores);
    });

    self.socket.on('appleLocation', function (appleLocation) {
        updateApple(self, appleLocation);
    });
}

// TODO: Should be in Server
function setPlayerColor(player, playerInfo) {
    console.log("BLUE: " + presenter.getBlue() + " RED: " + presenter.getRed());
    player.setTint(playerInfo.team === 'blue' ? presenter.getBlue() : presenter.getRed());
}

// TODO: Should be in Server
function isCoordinateAligned(coordinate) {
    return ((coordinate % presenter.getTileDiameter()) === 0);
}

// TODO: Should be in Server
function areCoordinatesAligned(player) {
    return (isCoordinateAligned(player.x) && isCoordinateAligned(player.y));
}

function setPlayerDirection(self, playerSegments) {

    let player = playerSegments[0].getFirst();

    if (!areCoordinatesAligned(player)) {
        return;
    }

    addPlayerIcon(self.playerSegments);

    player.direction = player.nextDirection;
}

function setPlayerPosition(playerSegments, player) {

    for (let i = playerSegments.length - 1; i > 0; i--) {
        playerSegments[i].move(playerSegments[i - 1].getLast());
    }

    // moving the player
    console.log("moving the player");
    playerSegments[0].move(playerSegments[0].getFirst());

    let newPosition = presenter.getNewPosition(player, presenter.getMovDelta());

    player.setPosition(newPosition.x, newPosition.y);
}

function addPlayerIcon(playerSegments) {

    if (!presenter.isAppleCollected()) {
        return;
    }

    let lastSegment = playerSegments[playerSegments.length - 1];
    let lastPosition = lastSegment.getLast();

    presenter.addSegment(playerSegments, lastPosition, addImage, 'greenSnakeBody');
    presenter.setAppleCollected(false);
}

// update() handles the movement of the snake
// so the snake is always moving and only changes
// direction
function update() {

    let self = this;

    if (self.playerSegments) {

        let player = self.playerSegments[0].getFirst();

        if (!presenter.isPlayerInBounds(player)) {
            console.log("out of bounds");
            for (let i = 0; i < self.playerSegments.length; i++) {
                self.playerSegments[i].destroy();
            }
            self.playerSegments.length = 0;
            self.socket.emit("playerDied");
            return;
        }

        // set direction and position
        self.playerSegments[0].getFirst().nextDirection = presenter.getPlayerNextDirection(self.cursors, self.playerSegments[0].getFirst().direction);
        setPlayerDirection(self, self.playerSegments);
        setPlayerPosition(self.playerSegments, player);

        // emit player movement
        let x = player.x;
        let y = player.y;
        if (player.oldPosition && (x !== player.oldPosition.x || y !== player.oldPosition.y)) {
            self.socket.emit('playerMovement', { x: player.x, y: player.y });
        }

        // save old position data
        player.oldPosition = {
            x: player.x,
            y: player.y,
        };
    }
}
