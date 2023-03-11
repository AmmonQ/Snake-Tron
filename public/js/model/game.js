import { View } from "../view/view.js";
import { Snake } from "./snake.js";
import { Presenter } from "../presenter/presenter.js";

export class Game {

    constructor(gamePtr) {
        this.gamePtr = gamePtr;
        this.view = new View(gamePtr);
        this.presenter = new Presenter();
        this.serverInterface = null;

        this.cursors = this.gamePtr.input.keyboard.createCursorKeys();

        this.apple = null;
        this.snake = new Snake(this.getPresenter().getTileDiameter());
        this.otherSnakes = this.getView().addPhysicsGroup();
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

    getView() {
        return this.view;
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

        this.getSnake().addBodySegment(this.getView());

        this.getPresenter().setAppleCollected(false);
    }

    preload() {
        this.getView().loadImages();
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