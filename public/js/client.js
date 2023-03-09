import { Presenter } from './presenter/presenter.js'
import { ServerInterface }  from "./model/serverInterface.js"
import { Snake } from "./model/snake.js"
import { View } from "./view/view.js"
import {Game} from "./model/game.js";


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
let game;

let physics;
let view;
let self;

let snake;
let otherPlayersSnakes;

function preload() {

    self = this;
    game = new Game(self);
    view = new View(self);
    view.loadImages();
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

function updateApple(appleLocation) {

    if (game.getApple()) {
        game.getApple().destroy();
    }

    game.setApple(view.addImage(appleLocation, 'apple'));

    view.addOverlap(snake.getHead(), game.getApple(), function() {
        presenter.setAppleCollected(true);
        serverInterface.notifyAppleCollected();
    })
}

function create() {

    physics = self.physics;

    view = new View(self);

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
        killPlayer();
        return;
    }

    // set direction and position
    let nextDir = presenter.getPlayerNextDirection(game.getCursors(), snake.getDirection());
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