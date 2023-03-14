export class IndexView {

    static getElement(idStr) {
        return document.getElementById(idStr);
    }

    static getGameCanvas() {
        return IndexView.getElement("game-canvas");
    }

    setText(idStr, text) {
        IndexView.getElement(idStr).textContent = text;
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
}