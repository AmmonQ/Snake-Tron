export class Segment {

    constructor() {
        this.icons = [];
    }

    addIcon(icon) {
        this.icons.push(icon);
    }

    getIcons() {
        return this.icons;
    }

    getFirst() {
        if (this.icons.length > 0) {
            return this.icons[0];
        }
        else {
            console.log("Segment is Empty\n");
        }
    }

    getLast() {
        if (this.icons.length > 0) {
            return this.icons[this.icons.length - 1];
        }
        else {
            console.log("Segment is Empty\n");
        }
    }

    destroy() {
        for (let i = 0; i < this.icons.length; i++) {
            this.icons[i].destroy();
        }
    }

    move(newPosition) {

        for (let i = this.icons.length - 1; i > 0; i--) {
            let x = this.icons[i - 1].x;
            let y = this.icons[i - 1].y;

            this.icons[i].setPosition(x, y);
        }

        this.getFirst().setPosition(newPosition.x, newPosition.y);
    }

    setColor(color, setIconColor) {

        for (let i = 0; i < this.icons.length; i++) {
            setIconColor(this.icons[i], color);
        }
    }
}