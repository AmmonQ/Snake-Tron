import { Images } from "./images.js";

export class View {

    constructor(gamePtr) {
        this.gamePtr = gamePtr;
        this.graphics = gamePtr.add.graphics();
        this.physics = gamePtr.physics;

        this.images = new Images();
    }

    drawRect(x1, y1, x2, y2, color, alpha) {
        this.graphics.fillStyle(color, alpha);
        this.graphics.fillRect(x1, y1, x2, y2);
    }

    addImage(position, imageName) {
        return this.physics.add.image(position.x, position.y, imageName).setOrigin(0.0, 0.0);
    }

    addSprite(position, imageName) {
        return this.gamePtr.add.sprite(position.x, position.y, imageName).setOrigin(0.0, 0.0);
    }

    addOverlap(item1, item2, callbackFunc) {
        this.physics.add.overlap(item1, item2, callbackFunc, null, this.gamePtr);
    }

    setIconColor(icon,  color) {
        icon.setTint(color);
    }

    getElement(idStr) {
        return document.getElementById(idStr);
    }

    getGameCanvas() {
        return this.getElement("game-canvas");
    }

    setText(idStr, text) {
        this.getElement(idStr).textContent = text;
    }

    setBlueScoreText(text) {
        this.setText("blue-score", text);
    }

    setRedScoreText(text) {
        this.setText("red-score", text);
    }

    initScoreText() {
        this.setBlueScoreText('0');
        this.setRedScoreText('0');
    }

    loadImage(imageName, imagePath) {
        this.gamePtr.load.image(imageName, imagePath);
    }

    loadImages() {

        for (let image of this.images.getImages()) {
            this.loadImage(image.getName(), Images.DIR_NAME + image.getFileName());
        }
    }
}