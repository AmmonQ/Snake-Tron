import { View } from "../view/view.js";
import { Snake } from "./snake.js";
import { Presenter } from "../presenter/presenter.js";
import {ServerInterface} from "./serverInterface.js";
import {Images} from "../view/images.js";

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



    addOtherPlayers(playerInfo) {

        const otherPlayer = this.getView().addSprite(playerInfo.position, Images.OTHER_PLAYER);
        otherPlayer.id = playerInfo.id;
        this.getOtherSnakes().add(otherPlayer);
    }

    addPlayer(playerInfo) {

        this.getSnake().addHeadSegment(playerInfo.position, this.getView());
        this.getSnake().setColor(this.getPresenter().convertToColor(playerInfo.team), this.getView());

        let game = this;

        this.getView().addCollision(this.getSnake().getHead(), this.getOtherSnakes(), function() {
            game.killPlayer();
        });
    }

    addPlayers(players) {

        console.log("Adding other players");
        console.log("this.getServerInterface().getSocketID() " + this.getServerInterface().getSocketID());

        for (const [key, value] of Object.entries(players)) {
            console.log(`${key}: ${value}`);
            if (key === this.getServerInterface().getSocketID()) {
                this.addPlayer(value);
            } else {
                this.addOtherPlayers(value);
            }
        }
    }

    disconnect(playerId) {

        this.getOtherSnakes().getChildren().forEach(function (otherPlayer) {
            if (playerId === otherPlayer.id) {
                otherPlayer.destroy();
            }
        });
    }

    moveOtherPlayer(playerInfo) {

        this.getOtherSnakes().getChildren().forEach(function (otherPlayer) {
            if (playerInfo.id === otherPlayer.id) {
                otherPlayer.setPosition(playerInfo.position.x, playerInfo.position.y);
            }
        });
    }
    updateScores(scores) {
        this.getView().setBlueScoreText("Blue: " + scores.blue);
        this.getView().setRedScoreText("Red: " + scores.red);
    }

    updateApple(appleLocation) {

        if (this.getApple()) {
            this.getApple().destroy();
        }

        this.setApple(this.getView().addImage(appleLocation, Images.APPLE));

        let game = this;
        this.getView().addOverlap(this.getSnake().getHead(), this.getApple(), function() {
            game.getPresenter().setAppleCollected(true);
            game.getServerInterface().notifyAppleCollected(game.getSnake());
        })
    }



    preload() {
        this.getView().loadImages();
    }

    create() {
        this.setServerInterface(new ServerInterface(this));
        this.getPresenter().drawBoard(this.getView());
        this.getView().initScoreText();
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