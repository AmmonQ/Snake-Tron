import { PhaserView } from "../view/phaserView.js";
import { Snake } from "./snake.js";
import { Presenter } from "../presenter/presenter.js";
import { ServerInterface } from "./serverInterface.js";
import { Images } from "../view/images.js";
import { IndexView } from "../view/indexView.js";

export class Game {

    constructor(gamePtr) {
        this.gamePtr = gamePtr;
        this.phaserView = new PhaserView(gamePtr);
        this.indexView = new IndexView();
        this.presenter = new Presenter();
        this.serverInterface = null;

        this.cursors = this.gamePtr.input.keyboard.createCursorKeys();

        this.apple = null;
        this.snake = new Snake(this.getPresenter().getTileDiameter());
        this.otherSnakes = this.getPhaserView().addPhysicsGroup();
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

    getPhaserView() {
        return this.phaserView;
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

        this.getSnake().addBodySegment(this.getPhaserView());

        this.getPresenter().setAppleCollected(false);
    }



    addOtherPlayers(playerInfo) {

        const otherPlayer = this.getPhaserView().addSprite(playerInfo.position, Images.OTHER_PLAYER);
        otherPlayer.id = playerInfo.id;
        this.getOtherSnakes().add(otherPlayer);
    }

    addPlayer(playerInfo) {

        this.getSnake().addHeadSegment(playerInfo.position, this.getPhaserView());
        this.getSnake().setColor(this.getPresenter().convertToColor(playerInfo.team), this.getPhaserView());

        let game = this;

        this.getPhaserView().addCollision(this.getSnake().getHead(), this.getOtherSnakes(), function() {
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
        this.getIndexView().setBlueScoreText("Blue: " + scores.blue);
        this.getIndexView().setRedScoreText("Red: " + scores.red);
    }

    updateApple(appleLocation) {

        if (this.getApple()) {
            this.getApple().destroy();
        }

        this.setApple(this.getPhaserView().addImage(appleLocation, Images.APPLE));

        let game = this;
        this.getPhaserView().addOverlap(this.getSnake().getHead(), this.getApple(), function() {
            game.getPresenter().setAppleCollected(true);
            game.getServerInterface().notifyAppleCollected(game.getSnake());
        })
    }



    preload() {
        this.getPhaserView().loadImages();
    }

    create() {
        this.setServerInterface(new ServerInterface(this));
        this.getPresenter().drawBoard(this.getPhaserView());
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