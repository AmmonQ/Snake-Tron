export class ServerInterface {

    // emission keywords
    static APPLE_COLLECTED = "appleCollected";
    static PLAYER_DIED = "playerDied";
    static PLAYER_MOVED = "playerMoved";

    // reception keywords
    static CURRENT_PLAYERS = "currentPlayers";
    static NEW_PLAYER = "newPlayer";
    static DISCONNECTED = "disconnected";
    static SCORE_UPDATE = "scoreUpdate";
    static APPLE_LOCATION = "appleLocation";


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

        this.receive(ServerInterface.CURRENT_PLAYERS, (players) => (this.game.addPlayers(players)));
        this.receive(ServerInterface.NEW_PLAYER, (playerInfo) => (this.game.addOtherPlayers(playerInfo)));
        this.receive(ServerInterface.DISCONNECTED, (playerID) => (this.game.disconnect(playerID)));
        this.receive(ServerInterface.PLAYER_MOVED, (playerInfo) => (this.game.moveOtherPlayer(playerInfo)));
        this.receive(ServerInterface.SCORE_UPDATE, (scores) => (this.game.updateScores(scores)));
        this.receive(ServerInterface.APPLE_LOCATION, (appleLocation) => (this.game.updateApple(appleLocation)));
    }
}