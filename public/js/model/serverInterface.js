export class ServerInterface {

    // emission keywords
    static APPLE_COLLECTED = "appleCollected";
    static PLAYER_DIED = "playerDied";
    static DIR_CHANGED = "dirChange";

    // reception keywords
    static CURRENT_PLAYERS = "currentPlayers";
    static NEW_PLAYER = "newPlayer";
    static DISCONNECTED = "disconnected";
    static SCORE_UPDATE = "scoreUpdate";
    static APPLE_LOCATION = "appleLocation";
    static GROW_PLAYER = "growPlayer";

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
        this.emit(ServerInterface.APPLE_COLLECTED, snake);
    }

    notifyPlayerDied() {
        this.emit(ServerInterface.PLAYER_DIED);
    }

    notifyDirectionChanged(nextDir) {
        this.emit(ServerInterface.DIR_CHANGED, nextDir);
    }

    setUpEndpoints() {

        this.receive(ServerInterface.CURRENT_PLAYERS, (players) => (
            this.game.addPlayers(players)
        ));
        this.receive(ServerInterface.NEW_PLAYER, (newPlayer) => (
            this.game.addPlayer(newPlayer.position.row, newPlayer.position.col, newPlayer.id)
        ));
        this.receive(ServerInterface.DISCONNECTED, (playerID) => (this.game.disconnect(playerID)));
        this.receive(ServerInterface.DIR_CHANGED, (nextDir, playerID) => (this.game.setPlayerDirection(nextDir, playerID)));
        this.receive(ServerInterface.SCORE_UPDATE, (scores) => (this.game.updateScores(scores)));
        this.receive(ServerInterface.APPLE_LOCATION, (appleLocation) => (this.game.updateApple(appleLocation.row, appleLocation.col)));
        this.receive(ServerInterface.GROW_PLAYER, (playerID) => (this.game.growPlayer(playerID)));
    }
}