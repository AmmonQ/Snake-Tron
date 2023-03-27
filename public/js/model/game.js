import { Snake } from "./snake.js";
import { PhaserPresenter } from "../presenter/phaserPresenter.js";
import { ServerInterface } from "./serverInterface.js";
import { Images } from "../view/images.js";
import { IndexView } from "../view/indexView.js";

export class Game {

    static GAME_SPEED = 20;

    constructor(gamePtr) {
        this.gamePtr = gamePtr;
        this.indexView = new IndexView();
        this.presenter = new PhaserPresenter(gamePtr);
        this.serverInterface = null;

        this.cursors = this.gamePtr.input.keyboard.createCursorKeys();

        this.apple = null;
        this.snakes = {};
    }

    getApple() {
        return this.apple;
    }

    setApple(apple) {
        this.apple = apple;
    }

    getCursors() {
        return this.cursors;
    }

    getIndexView() {
        return this.indexView;
    }

    getPresenter() {
        return this.presenter;
    }

    getSnake() {
        return this.getSnakes()[this.getServerInterface().getSocketID()];
    }

    getSnakes() {
        return this.snakes;
    }

    getServerInterface() {
        return this.serverInterface;
    }

    setServerInterface(serverInterface) {
        this.serverInterface = serverInterface;
    }

    addPlayerIcon() {
        this.getSnake().addBodySegment(this.getPresenter().getPhaserView());
    }

    addPlayer(row, col, id) {
        let presenter = this.getPresenter();
        const player = new Snake(this.getPresenter().getRowColSize());
        player.addHeadSegment(presenter.convertColToX(col), presenter.convertRowToY(row), presenter.getPhaserView());
        this.getSnakes()[id] = player;
    }

    addPlayers(players) {

        for (const [key, value] of Object.entries(players)) {
            this.addPlayer(value.position.row, value.position.col, value.id);
        }
    }

    disconnect(snakeID) {

        let player = this.getSnakes()[snakeID];
        player.destroy();
    }

    growPlayer(playerID) {
        let player = this.getSnakes()[playerID];
        if (typeof player !== "undefined") {
            player.addBodySegment(this.getPresenter().getPhaserView());
        }
    }

    setPlayerDirection(nextDir, socketID) {
        let player = this.getSnakes()[socketID];

        if (typeof player !== "undefined") {
            if (player.getDirection() === "none") {
                player.setDirection(nextDir);
            }
            player.setNextDirection(nextDir);
        }
    }

    updateScores(scores) {
        this.getIndexView().setBlueScoreText("Blue: " + scores.blue);
        this.getIndexView().setRedScoreText("Red: " + scores.red);
    }

    updateApple(row, col) {

        if (this.getApple()) {
            this.getApple().destroy();
            this.setApple(null);
        }

        this.setApple(this.getPresenter().addImage(row, col, Images.APPLE));
    }

    preload() {
        this.getPresenter().loadImages();
    }

    create() {
        this.setServerInterface(new ServerInterface(this));
        this.getPresenter().drawBoard();
        this.getIndexView().initScoreText();
        this.startTick();
    }

    update() {

        if (typeof this.getSnake() === "undefined") {
            return;
        }

        if (!this.getSnake().isAlive()) {
            return;
        }

        // set direction and position
        let nextDir = this.getPresenter().getPlayerNextDirection(this.getCursors(), this.getSnake().getDirection(),
            this.getSnake().getNextDirection());

        if (nextDir !== this.getSnake().getNextDirection()) {
            this.getServerInterface().notifyDirectionChanged(nextDir);
        }

        if (this.getSnake().isOverlapping()) {
            this.getServerInterface().notifyPlayerDied();
            return;
        }

        this.getSnake().updateOldPos();
    }

    isOverlapping(x1, y1, x2, y2) {

        if (Math.abs(x1 - x2) >= this.getPresenter().getRowColSize()) {
            return false;
        } else if (Math.abs(y1 - y2) >= this.getPresenter().getRowColSize()) {
            return false;
        } else {
            return true;
        }
    }

    onAppleCollected() {
        this.getApple().destroy();
        this.setApple(null);
        this.getServerInterface().notifyAppleCollected(this.getSnake());
    }

    playerDead(player) {
        let playerID = player.id;
        let playerPos = player.position;

        let snake = this.getSnakes()[playerID];
        snake.destroy();
        this.addPlayer(playerPos.row, playerPos.col, playerID);
    }


    startTick() {

        let game = this;

        function tick() {

            for (const [playerID, player] of Object.entries(game.getSnakes())) {

                if (player.getLength() > 0) {

                    game.getPresenter().setSnakeDirection(player);
                    player.move();

                    if (playerID !== game.getServerInterface().getSocketID()) {
                        continue;
                    }

                    if (!game.getPresenter().isPlayerInBounds(game.getSnake().getHead())) {
                        game.getServerInterface().notifyPlayerDied();
                        return;
                    }

                    if (game.getApple()) {
                        if (game.isOverlapping(game.getApple().x, game.getApple().y, player.getHead().x, player.getHead().y)) {
                            game.onAppleCollected();
                        }
                    }
                }
            }
        }

        setInterval(tick, Game.GAME_SPEED);
    }
}