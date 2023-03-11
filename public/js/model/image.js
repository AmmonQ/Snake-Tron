export class Image {

    constructor(name, fileName) {
        this.name = name;
        this.fileName = fileName;
    }

    getName() {
        return this.name;
    }

    getFileName() {
        return this.fileName;
    }
}