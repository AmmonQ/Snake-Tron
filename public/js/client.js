import { Presenter } from './presenter/presenter.js'
import { Game } from "./model/game.js";

let game;

function preload() {
    game = new Game(this);
    game.preload();
}

function create() {
    game.create();
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