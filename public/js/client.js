import { Presenter } from './presenter.js'
import { Segment } from "./segment.js";
import { ServerInterface }  from "./serverInterface.js"
import { Snake } from "./snake.js"


let presenter = new Presenter();
let serverInterface;

let config = {
    type: Phaser.AUTO,
    parent: document.getElementById("game-canvas"),
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
let otherPlayersSnakes;

function drawRect(x1, y1, x2, y2, color, alpha) {
    graphics.fillStyle(color, alpha);
    graphics.fillRect(x1, y1, x2, y2);
}

function addImage(position, imageName) {
    return physics.add.image(position.x, position.y, imageName).setOrigin(0.0, 0.0);
}

function addSprite(position, imageName) {
    return self.add.sprite(position.x, position.y, imageName).setOrigin(0.0, 0.0);
}

function addOverlap(item1, item2, callbackFunc) {
    physics.add.overlap(item1, item2, callbackFunc, null, self);
}

function setIconColor(icon,  color) {
    icon.setTint(color);
}

function loadImage(imageName, imagePath) {
    self.load.image(imageName, imagePath);
}

function preload() {

    self = this;

    let dirName = 'assets/';

    const imageMap = {
        'background': 'grass.png',
        'playerIcon': 'pink_snake_tongue_pixel.png',
        'otherPlayer': 'pink_snake_pixel.png',
        'apple': 'apple.png',
        'greenSnakeHead': 'g_snake_head.png',
        'foeSnakeHead': 'o_snake_head.png',
        'foeSnakeTail': 'o_snake_tail.png',
        'foeSnakeBody': 'o_snake_body.png',
        'greenSnakeBody': 'g_snake_body.png',
        'greenSnakeTail': 'g_snake_tail.png'
    };

    for (const [imageName, fileName] of Object.entries(imageMap)) {
        loadImage(imageName, dirName + fileName);
    }
}


function getElement(idStr) {
    return document.getElementById(idStr);
}

function setText(idStr, text) {
    getElement(idStr).textContent = text;
}

function setBlueScoreText(text) {
    setText("blue-score", text);
}

function setRedScoreText(text) {
    setText("red-score", text);
}

function initScoreText() {

    setBlueScoreText('0');
    setRedScoreText('0');
}

function addOtherPlayers(self, playerInfo) {

    const otherPlayer = addSprite(playerInfo.position, 'otherPlayer');
    otherPlayer.id = playerInfo.id;
    otherPlayersSnakes.add(otherPlayer);
}

function addPlayer(self, playerInfo) {

    snake.addHeadSegment(playerInfo.position, addImage);
    snake.setColor(presenter.convertToColor(playerInfo.team), setIconColor);

}

function addPlayers(self, players) {

    Object.keys(players).forEach(function (id) {
        if (players[id].id === serverInterface.getSocketID()) {
            addPlayer(self, players[id]);
        } else {
            addOtherPlayers(self, players[id]);
        }
    });
}

function disconnect(self, playerId) {
    otherPlayersSnakes.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.id) {
            otherPlayer.destroy();
        }
    });
}

function moveOtherPlayer(self, playerInfo) {

    otherPlayersSnakes.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.id === otherPlayer.id) {
            otherPlayer.setPosition(playerInfo.position.x, playerInfo.position.y);
        }
    });
}

// TODO: Should be in Server
function updateScores(self, scores) {
    setBlueScoreText("Blue: " + scores.blue);
    setRedScoreText("Red: " + scores.red);
}

// TODO: Should be in Server
function updateApple(self, appleLocation) {

    if (apple) {
        apple.destroy();
    }

    apple = addImage(appleLocation, 'apple');

    addOverlap(snake.getHead(), apple, function() {
        presenter.setAppleCollected(true);
        serverInterface.notifyAppleCollected();
    })
}

function create() {

    cursors = self.input.keyboard.createCursorKeys();
    graphics = self.add.graphics();
    physics = self.physics;

    presenter.drawBoard(drawRect);

    snake = new Snake(presenter.getTileDiameter());
    serverInterface = new ServerInterface();
    otherPlayersSnakes = physics.add.group();

    initScoreText(self);

    serverInterface.getSocket().on('currentPlayers', function (players) {
        addPlayers(self, players);
    });

    serverInterface.getSocket().on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    serverInterface.getSocket().on('disconnected', function (playerId) {
        disconnect(self, playerId);
    });

    serverInterface.getSocket().on('playerMoved', function (playerInfo) {
        moveOtherPlayer(self, playerInfo);
    });

    serverInterface.getSocket().on('scoreUpdate', function (scores) {
        updateScores(self, scores);
    });

    serverInterface.getSocket().on('appleLocation', function (appleLocation) {
        updateApple(self, appleLocation);
    });
}

function addPlayerIcon() {

    if (!presenter.isAppleCollected()) {
        return;
    }

    snake.addBodySegment(addImage);
    addOverlap(snake.getHead(), snake.getLastSegment().getLast(), killPlayer);
    presenter.setAppleCollected(false);
}

function killPlayer() {

    snake.destroy();
    serverInterface.notifyPlayerDied();
}

// update() fires based on browser speed.
function update() {

    if (!snake.isAlive()) {
        return;
    }

    let player = snake.getHead();

    if (!presenter.isPlayerInBounds(snake.getHead())) {
        killPlayer();
        return;
    }

    // set direction and position
    let nextDir = presenter.getPlayerNextDirection(cursors, player.direction);
    snake.setNextDirection(nextDir);
    presenter.setSnakeDirection(snake, addPlayerIcon);

    snake.move();

    if (snake.hasMoved()) {
        serverInterface.notifyPlayerMoved(snake.getPos());
    }

    snake.updateOldPos();
}