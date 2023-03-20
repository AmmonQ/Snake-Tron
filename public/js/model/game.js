import { Snake } from "./snake.js";
import { PhaserPresenter } from "../presenter/phaserPresenter.js";
import { ServerInterface } from "./serverInterface.js";
import { Images } from "../view/images.js";
import { IndexView } from "../view/indexView.js";

export class Game {

    constructor(gamePtr) {
        this.gamePtr = gamePtr;
        this.indexView = new IndexView();
        this.presenter = new PhaserPresenter(gamePtr);
        this.serverInterface = null;

        this.cursors = this.gamePtr.input.keyboard.createCursorKeys();

        this.apple = null;
        this.snake = new Snake(this.getPresenter().getRowColSize());
        this.otherSnakes = {};
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
        return this.snake;
    }

    getOtherSnakes() {
        return this.otherSnakes;
    }

    killPlayer() {

        this.getSnake().destroy();
        this.getServerInterface().notifyPlayerDied();
    }

    getServerInterface() {
        return this.serverInterface;
    }

    setServerInterface(serverInterface) {
        this.serverInterface = serverInterface;
    }

    addPlayerIcon() {

        if (!this.getPresenter().isAppleCollected()) {
            return;
        }

        this.getSnake().addBodySegment(this.getPresenter().getPhaserView());
        this.getPresenter().setAppleCollected(false);
    }

    addOtherPlayers(row, col, id) {

        let presenter = this.getPresenter();
        const player = new Snake(this.getPresenter().getRowColSize());
        player.addHeadSegment(presenter.convertColToX(col), presenter.convertRowToY(row), presenter.getPhaserView());
        this.getOtherSnakes()[id] = player;
    }

    addPlayer(row, col, team) {

        this.getSnake().addHeadSegment(this.getPresenter().convertColToX(col), this.getPresenter().convertRowToY(row), this.getPresenter().getPhaserView());
        this.getSnake().setColor(this.getPresenter().convertToColor(team), this.getPresenter().getPhaserView());
    }

    addPlayers(players) {

        for (const [key, value] of Object.entries(players)) {

            let row = value.position.row;
            let col = value.position.col;

            if (key === this.getServerInterface().getSocketID()) {
                this.addPlayer(row, col, value.team);
            } else {
                this.addOtherPlayers(row, col, value.id);
            }
        }
    }

    disconnect(snakeID) {

        let player = this.getOtherSnakes()[snakeID];
        player.destroy();
    }

    growPlayer(playerID) {
        console.log("grow player");
        console.log("playerID: " + playerID);
        let player = this.getOtherSnakes()[playerID];
        if (typeof player !== "undefined") {
            console.log("I'm in");
            player.addBodySegment(this.getPresenter().getPhaserView());
        }
    }

    setPlayerDirection(nextDir, socketID) {
        let player = this.getOtherSnakes()[socketID];
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

        let head = this.getSnake().getHead();
        let game = this;
        let callbackFunc = () => {
            game.getPresenter().setAppleCollected(true);
            game.getApple().destroy();
            game.setApple(null);
            game.getServerInterface().notifyAppleCollected(game.getSnake());
        }

        this.getPresenter().addOverlap(head, this.getApple(), callbackFunc)
    }

    preload() {
        this.getPresenter().loadImages();
    }

    create() {
        this.setServerInterface(new ServerInterface(this));
        this.getPresenter().drawBoard();
        this.getIndexView().initScoreText();
    }

    update() {

        if (!this.getSnake().isAlive()) {
            return;
        }

        if (!this.getPresenter().isPlayerInBounds(this.getSnake().getHead())) {
            this.killPlayer();
            return;
        }

        // set direction and position
        let nextDir = this.getPresenter().getPlayerNextDirection(this.getCursors(), this.getSnake().getDirection());
        if (nextDir !== this.getSnake().getNextDirection()) {
            this.getServerInterface().notifyDirectionChanged(this.getSnake().getDirection(), nextDir);
        }
        this.getSnake().setNextDirection(nextDir);
        this.getPresenter().setSnakeDirection(this.getSnake(), this);

        if (this.getSnake().isOverlapping()) {
            this.killPlayer();
            return;
        }

        this.getSnake().updateOldPos();

    }

    tick() {

        for (const [playerID, player] of Object.entries(this.getOtherSnakes())) {
            if (player.getLength() > 0) {
                player.move();
                this.getPresenter().setSnakeDirection(player, this);
            }
        }

        this.getSnake().move();
    }
}