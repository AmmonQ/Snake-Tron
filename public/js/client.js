import { Presenter } from './presenter/presenter.js'
import { ServerInterface }  from "./model/serverInterface.js"
import { Game } from "./model/game.js";
import { Images } from "./view/images.js";

let game;

function preload() {
    game = new Game(this);
    game.preload();
}

// update() fires based on browser speed.
function update() {
    game.update();
}

let config = {
    type: Phaser.AUTO,
    parent: document.getElementById("game-canvas"),
    width: Presenter.WIDTH,
    height: Presenter.HEIGHT,
    backgroundColor: Presenter.BG_COLOR_STR,
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

function addOtherPlayers(playerInfo) {

    const otherPlayer = game.getView().addSprite(playerInfo.position, Images.OTHER_PLAYER);
    otherPlayer.id = playerInfo.id;
    game.getOtherSnakes().add(otherPlayer);
}

function addPlayer(playerInfo) {

    game.getSnake().addHeadSegment(playerInfo.position, game.getView());
    game.getSnake().setColor(game.getPresenter().convertToColor(playerInfo.team), game.getView());

}

function addPlayers(players) {

    Object.keys(players).forEach(function (id) {
        if (players[id].id === game.getServerInterface().getSocketID()) {
            addPlayer(players[id]);
        } else {
            addOtherPlayers(players[id]);
        }
    });
}

function disconnect(playerId) {
    game.getOtherSnakes().getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.id) {
            otherPlayer.destroy();
        }
    });
}

function moveOtherPlayer(playerInfo) {

    game.getOtherSnakes().getChildren().forEach(function (otherPlayer) {
        if (playerInfo.id === otherPlayer.id) {
            otherPlayer.setPosition(playerInfo.position.x, playerInfo.position.y);
        }
    });
}
function updateScores(scores) {
    game.getView().setBlueScoreText("Blue: " + scores.blue);
    game.getView().setRedScoreText("Red: " + scores.red);
}

function updateApple(appleLocation) {

    if (game.getApple()) {
        game.getApple().destroy();
    }

    game.setApple(game.getView().addImage(appleLocation, Images.APPLE));

    game.getView().addOverlap(game.getSnake().getHead(), game.getApple(), function() {
        game.getPresenter().setAppleCollected(true);
        game.getServerInterface().notifyAppleCollected();
    })
}

function create() {

    game.getPresenter().drawBoard(game.getView());

    game.setServerInterface(new ServerInterface());

    game.getView().initScoreText();

    game.getServerInterface().getSocket().on('currentPlayers', addPlayers);
    game.getServerInterface().getSocket().on('newPlayer', addOtherPlayers);
    game.getServerInterface().getSocket().on('disconnected', disconnect);
    game.getServerInterface().getSocket().on('playerMoved', moveOtherPlayer);
    game.getServerInterface().getSocket().on('scoreUpdate', updateScores);
    game.getServerInterface().getSocket().on('appleLocation', updateApple);
}