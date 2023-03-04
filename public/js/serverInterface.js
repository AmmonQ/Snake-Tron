export class ServerInterface {

    static APPLE_COLLECTED = "appleCollected";
    static PLAYER_DIED = "playerDied";
    static PLAYER_MOVED = "playerMoved";

    constructor() {
        this.socket = io();
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

    notifyAppleCollected() {
        this.emit(ServerInterface.APPLE_COLLECTED);
    }

    notifyPlayerDied() {
        this.emit(ServerInterface.PLAYER_DIED);
    }

    notifyPlayerMoved(newPos) {
        this.emit(ServerInterface.PLAYER_MOVED, newPos);
    }
}