import { Presenter } from './presenter.js'
import { ServerInterface }  from "./serverInterface.js"
import { Snake } from "./snake.js"
import { View } from "./view.js"


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

let phaser = new Phaser.Game(config);

let cursors;
let graphics;
let physics;
let view;
let self;

let apple;
let snake;
let otherPlayersSnakes;

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
        'foeSnakeHead': 'o_snake_head.png',
        'foeSnakeBody': 'o_snake_body.png',
        'foeSnakeTail': 'o_snake_tail.png',
        'greenSnakeHead': 'g_snake_head.png',
        'greenSnakeBody': 'g_snake_body.png',
        'greenSnakeTail': 'g_snake_tail.png'
    };

    for (const [imageName, fileName] of Object.entries(imageMap)) {
        loadImage(imageName, dirName + fileName);
    }
}

function addOtherPlayers(playerInfo) {

    const otherPlayer = view.addSprite(playerInfo.position, 'otherPlayer');
    otherPlayer.id = playerInfo.id;
    otherPlayersSnakes.add(otherPlayer);
}

function addPlayer(playerInfo) {

    snake.addHeadSegment(playerInfo.position, view);
    snake.setColor(presenter.convertToColor(playerInfo.team), view);

}

function addPlayers(players) {

    Object.keys(players).forEach(function (id) {
        if (players[id].id === serverInterface.getSocketID()) {
            addPlayer(players[id]);
        } else {
            addOtherPlayers(players[id]);
        }
    });
}

function disconnect(playerId) {
    otherPlayersSnakes.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.id) {
            otherPlayer.destroy();
        }
    });
}

function moveOtherPlayer(playerInfo) {

    otherPlayersSnakes.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.id === otherPlayer.id) {
            otherPlayer.setPosition(playerInfo.position.x, playerInfo.position.y);
        }
    });
}
function updateScores(scores) {
    view.setBlueScoreText("Blue: " + scores.blue);
    view.setRedScoreText("Red: " + scores.red);
}

// TODO: Should be in Server
function updateApple(appleLocation) {

    if (apple) {
        apple.destroy();
    }

    apple = view.addImage(appleLocation, 'apple');

    view.addOverlap(snake.getHead(), apple, function() {
        presenter.setAppleCollected(true);
        serverInterface.notifyAppleCollected();
    })
}

function create() {

    cursors = self.input.keyboard.createCursorKeys();
    graphics = self.add.graphics();
    physics = self.physics;

    view = new View(self, graphics, physics);

    presenter.drawBoard(view);

    snake = new Snake(presenter.getTileDiameter());
    serverInterface = new ServerInterface();
    otherPlayersSnakes = physics.add.group();

    view.initScoreText();

    serverInterface.getSocket().on('currentPlayers', addPlayers);
    serverInterface.getSocket().on('newPlayer', addOtherPlayers);
    serverInterface.getSocket().on('disconnected', disconnect);
    serverInterface.getSocket().on('playerMoved', moveOtherPlayer);
    serverInterface.getSocket().on('scoreUpdate', updateScores);
    serverInterface.getSocket().on('appleLocation', updateApple);
}

function addPlayerIcon() {

    if (!presenter.isAppleCollected()) {
        return;
    }

    snake.addBodySegment(view);

    presenter.setAppleCollected(false);
}

function killPlayer() {
    console.log("killing player");

    snake.destroy();
    serverInterface.notifyPlayerDied();
}

// update() fires based on browser speed.
function update() {

    if (!snake.isAlive()) {
        return;
    }

    if (!presenter.isPlayerInBounds(snake.getHead())) {
        console.log("Player is out of bounds");
        killPlayer();
        return;
    }

    // set direction and position
    let nextDir = presenter.getPlayerNextDirection(cursors, snake.getDirection());
    snake.setNextDirection(nextDir);
    presenter.setSnakeDirection(snake, addPlayerIcon);

    snake.move();

    if (snake.isOverlapping()) {
        killPlayer();
        return;
    }

    if (snake.hasMoved()) {
        serverInterface.notifyPlayerMoved(snake.getPos());
    }

    snake.updateOldPos();
}