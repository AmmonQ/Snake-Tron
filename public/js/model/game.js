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
        this.snake = new Snake(this.getPresenter().getTileDiameter());
        this.otherSnakes = this.getPresenter().getPhysicsGroup();
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

    addOtherPlayers(playerInfo) {

        const otherPlayer = this.getPresenter().addSprite(playerInfo.position, Images.OTHER_PLAYER);
        otherPlayer.id = playerInfo.id;
        this.getOtherSnakes().add(otherPlayer);
    }

    addPlayer(playerInfo) {

        this.getSnake().addHeadSegment(playerInfo.position, this.getPresenter().getPhaserView());
        this.getSnake().setColor(this.getPresenter().convertToColor(playerInfo.team), this.getPresenter().getPhaserView());

        let game = this;
        let head = this.getSnake().getHead();
        let callbackFunc = () => {
            game.killPlayer();
        }

        this.getPresenter().addCollision(head, this.getOtherSnakes(), callbackFunc);
    }

    addPlayers(players) {

        for (const [key, value] of Object.entries(players)) {
            if (key === this.getServerInterface().getSocketID()) {
                this.addPlayer(value);
            } else {
                this.addOtherPlayers(value);
            }
        }
    }

    disconnect(snakeID) {

        for (let otherSnake of this.getOtherSnakes().getChildren()) {
            if (snakeID === otherSnake.id) {
                otherSnake.destroy();
                return;
            }
        }
    }

    moveOtherPlayer(playerInfo) {

        this.getOtherSnakes().getChildren().forEach(function (otherPlayer) {
            if (playerInfo.id === otherPlayer.id) {
                otherPlayer.setPosition(playerInfo.position.x, playerInfo.position.y);
            }
        });
    }
    updateScores(scores) {
        this.getIndexView().setBlueScoreText("Blue: " + scores.blue);
        this.getIndexView().setRedScoreText("Red: " + scores.red);
    }

    updateApple(appleLocation) {

        if (this.getApple()) {
            this.getApple().destroy();
        }

        this.setApple(this.getPresenter().addImage(appleLocation, Images.APPLE));


        let head = this.getSnake().getHead();
        let game = this;
        let callbackFunc = () => {
            game.getPresenter().setAppleCollected(true);
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
        this.getSnake().setNextDirection(nextDir);
        this.getPresenter().setSnakeDirection(this.getSnake(), this);

        this.getSnake().move();

        if (this.getSnake().isOverlapping()) {
            this.killPlayer();
            return;
        }

        if (this.getSnake().hasMoved()) {
            this.getServerInterface().notifyPlayerMoved(this.getSnake().getPos());
        }

        this.getSnake().updateOldPos();
    }
}