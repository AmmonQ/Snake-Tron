export class Segment {

    constructor() {
        this.icons = [];
        this.overlap = false;
    }

    addIcon(icon) {
        this.icons.push(icon);
    }

    getIcons() {
        return this.icons;
    }

    hasOverlap() {
        return this.overlap;
    }

    setOverlap(overlap) {
        this.overlap = overlap;
    }

    getFirst() {
        if (this.icons.length > 0) {
            return this.icons[0];
        }
        else {
            console.log("Segment is Empty\n");
        }
    }

    setFirst(icon) {
        if (this.icons.length > 0) {
            this.icons[0] = icon;
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

    setColor(color, view) {

        for (let i = 0; i < this.icons.length; i++) {
            view.setIconColor(this.icons[i], color);
        }
    }
}