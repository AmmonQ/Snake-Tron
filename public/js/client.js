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

let cursors;
let graphics;
let physics;
let self;


let apple;
let snake;
let socket;

function drawRect(x1, y1, x2, y2, color, alpha) {
    graphics.fillStyle(color, alpha);
    graphics.fillRect(x1, y1, x2, y2);
}

function addImage(position, image) {
    return physics.add.image(position.x, position.y, image).setOrigin(0.0, 0.0);
}

function addOverlap(item1, item2, callbackFunc) {
    physics.add.overlap(item1, item2, callbackFunc, null, self);
}

function emit(keyword, data) {

    if (data) {
        socket.emit(keyword, data);
    } else {
        socket.emit(keyword);
    }
}

function preload() {

    self = this;

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

    cursors = self.input.keyboard.createCursorKeys();
    graphics = self.add.graphics();
    physics = self.physics;

    snake = new Snake(presenter.getTileDiameter());

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

    presenter.addHeadSegment(snake, playerInfo.position, addImage);

    setPlayerColor(snake.getSegments(), playerInfo);
}

function addPlayers(self, players) {

    Object.keys(players).forEach(function (id) {
        if (players[id].id === socket.id) {
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

function moveOtherPlayer(self, playerInfo) {

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

// TODO: Should be in Server
function updateApple(self, appleLocation) {

    if (apple) {
        apple.destroy();
    }

    apple = addImage(appleLocation, 'apple');

    addOverlap(snake.getHead(), apple, function() {
        presenter.setAppleCollected(true);
        emit('appleCollected');
    })
}

function create() {

    socket = io();

    self.otherPlayers = physics.add.group();

    initScoreText(self);

    socket.on('currentPlayers', function (players) {
        addPlayers(self, players);
    });

    socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    socket.on('disconnected', function (playerId) {
        disconnect(self, playerId);
    });

    socket.on('playerMoved', function (playerInfo) {
        moveOtherPlayer(self, playerInfo);
    });

    socket.on('scoreUpdate', function (scores) {
        updateScores(self, scores);
    });

    socket.on('appleLocation', function (appleLocation) {
        updateApple(self, appleLocation);
    });
}

// TODO: Should be in Server
function setPlayerColor(player, playerInfo) {
    console.log("BLUE: " + presenter.getBlue() + " RED: " + presenter.getRed());
    player.setTint(playerInfo.team === 'blue' ? presenter.getBlue() : presenter.getRed());
}

function addPlayerIcon(playerSegments) {

    if (!presenter.isAppleCollected()) {
        return;
    }

    presenter.addSegment(snake, addImage);
    presenter.setAppleCollected(false);
}

// update() fires based on browser speed.
function update() {

    if (!snake.isAlive()) {
        return;
    }


    let player = snake.getHead();

    if (!presenter.isPlayerInBounds(player)) {
        snake.destroy();
        emit('playerDied');
        return;
    }

    // set direction and position
    let nextDir = presenter.getPlayerNextDirection(cursors, player.direction);
    snake.setNextDirection(nextDir);
    presenter.setSnakeDirection(snake, addPlayerIcon);

    snake.move(presenter.getNewPosition);

    // emit player movement
    let x = player.x;
    let y = player.y;
    if (x !== snake.getOldX() || y !== snake.getOldY()) {
        emit('playerMovement', {x: player.x, y: player.y});
    }

    snake.setOldPosition(player.x, player.y);

}