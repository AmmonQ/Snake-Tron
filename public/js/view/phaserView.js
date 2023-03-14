import { Images } from "./images.js";

export class PhaserView {

    constructor(phaserPtr) {
        this.phaserPtr = phaserPtr;
        this.graphics = phaserPtr.add.graphics();
        this.physics = phaserPtr.physics;

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
        return this.phaserPtr.add.sprite(position.x, position.y, imageName).setOrigin(0.0, 0.0);
    }

    addOverlap(item1, item2, callbackFunc) {
        this.physics.add.overlap(item1, item2, callbackFunc, null, this.phaserPtr);
    }

    addCollision(item1, item2, callbackFunc) {
        this.physics.add.collider(item1, item2, callbackFunc, null, this.phaserPtr);
    }

    setIconColor(icon,  color) {
        icon.setTint(color);
    }

    loadImage(imageName, imagePath) {
        this.phaserPtr.load.image(imageName, imagePath);
    }

    loadImages() {

        for (let image of this.images.getImages()) {
            this.loadImage(image.getName(), Images.DIR_NAME + image.getFileName());
        }
    }

    addPhysicsGroup() {
        return this.physics.add.group();
    }
}