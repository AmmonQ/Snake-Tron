export class Game {

    constructor(gamePtr) {
        this.gamePtr = gamePtr;
        this.apple = null;
        this.cursors = this.gamePtr.input.keyboard.createCursorKeys();
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
}