export class ServerInterface {

    static APPLE_COLLECTED = "appleCollected";
    static PLAYER_DIED = "playerDied";
    static PLAYER_MOVED = "playerMoved";

    constructor(game) {
        this.socket = io();
        this.game = game;

        this.setUpEndpoints();
    }

    getSocket() {
        return this.socket;
    }

    getSocketID() {
        return this.getSocket().id;
    }

    emit(keyword, data) {

        if (data) {
            this.getSocket().emit(keyword, data);
        } else {
            this.getSocket().emit(keyword);
        }
    }

    receive(keyword, funcCallback) {
        this.getSocket().on(keyword, funcCallback);
    }

    notifyAppleCollected(snake) {
        this.emit(ServerInterface.APPLE_COLLECTED, {
            "snake": snake,
            "socketID": this.getSocketID()
        });
    }

    notifyPlayerDied() {
        this.emit(ServerInterface.PLAYER_DIED);
    }

    notifyPlayerMoved(newPos) {
        this.emit(ServerInterface.PLAYER_MOVED, newPos);
    }

    setUpEndpoints() {

        this.receive('currentPlayers', (players) => (this.game.addPlayers(players)));
        this.receive('newPlayer', (playerInfo) => (this.game.addOtherPlayers(playerInfo)));
        this.receive('disconnected', (playerID) => (this.game.disconnect(playerID)));
        this.receive('playerMoved', (playerInfo) => (this.game.moveOtherPlayer(playerInfo)));
        this.receive('scoreUpdate', (scores) => (this.game.updateScores(scores)));
        this.receive('appleLocation', (appleLocation) => (this.game.updateApple(appleLocation)));
    }
}