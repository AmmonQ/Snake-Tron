
const BLUE = 0x0000FF;
const RED = 0xFF0000;
const BG_COLOR_STR = '#005C29';

let config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 1000,
    height: 800,
    backgroundColor: BG_COLOR_STR,
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config);

function preload() {
    this.load.image('background', 'assets/grass.png');
    this.load.image('ship', 'assets/pink_snake_tongue_pixel.png');
    this.load.image('otherPlayer', 'assets/pink_snake_pixel.png');
    this.load.image('apple', 'assets/apple.png');
}

function initScoreText(self) {

    const BLUE_X = 16;
    const RED_X = 584;
    const SCORE_Y = 16;
    const FONT_SIZE = '32px'
    const BLUE_STR = '#0000FF';
    const RED_STR = '#FF0000';

    self.blueScoreText = self.add.text(BLUE_X, SCORE_Y, '', { fontSize: FONT_SIZE, fill: BLUE_STR });
    self.redScoreText = self.add.text(RED_X, SCORE_Y, '', { fontSize: FONT_SIZE, fill: RED_STR });
}

function addPlayers(self, players) {

    Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.socket.id) {
            addPlayer(self, players[id]);
        } else {
            addOtherPlayers(self, players[id]);
        }
    });
}
function disconnect(self, playerId) {

    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.playerId) {
            otherPlayer.destroy();
        }
    });
}
function updateScores(self, scores) {

    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
}

function movePlayer(self, playerInfo) {

    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
            otherPlayer.setRotation(playerInfo.rotation);
            otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
    });
}

function create() {

    let self = this;
    this.socket = io();

    this.otherPlayers = this.physics.add.group();
    this.cursors = this.input.keyboard.createCursorKeys();

    initScoreText(self);

    this.socket.on('currentPlayers', function (players) {
        addPlayers(self, players);
    });

    this.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    this.socket.on('disconnected', function (playerId) {
        disconnect(self, playerId);
    });

    this.socket.on('playerMoved', function (playerInfo) {
        movePlayer(self, playerInfo);
    });

    this.socket.on('scoreUpdate', function (scores) {
        updateScores(self, scores);
    });

    this.socket.on('appleLocation', function (appleLocation) {
        if (self.apple) {
            self.apple.destroy();
        }
        self.apple = self.physics.add.image(appleLocation.x, appleLocation.y, 'apple');

        self.physics.add.overlap(self.ship, self.apple, function () {
            this.socket.emit('appleCollected');
        }, null, self);
    });
}

function setPlayerColor(player, playerInfo) {
    player.setTint(playerInfo.team === 'blue' ? BLUE : RED);
}

function addPlayer(self, playerInfo) {

    self.ship = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    setPlayerColor(self.ship, playerInfo);

    self.ship.setDrag(100);
    self.ship.setAngularDrag(100);
    self.ship.setMaxVelocity(200);

}

function addOtherPlayers(self, playerInfo) {

    const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    setPlayerColor(otherPlayer, playerInfo);

    otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
}

function setShipDirection(self) {
    if (self.cursors.left.isDown && self.ship.direction !== 'right') {
        self.ship.direction = 'left';
    } else if (self.cursors.right.isDown && self.ship.direction !== 'left') {
        self.ship.direction = 'right';
    } else if (self.cursors.up.isDown && self.ship.direction !== 'down') {
        self.ship.direction = 'up';
    } else if (self.cursors.down.isDown && self.ship.direction !== 'up') {
        self.ship.direction = 'down';
    }
}

function setShipPosition(self) {
    switch (self.ship.direction) {
        case 'left':
            self.ship.setPosition(self.ship.x - 5, self.ship.y);
            break;
        case 'right':
            self.ship.setPosition(self.ship.x + 5, self.ship.y);
            break;
        case 'up':
            self.ship.setPosition(self.ship.x, self.ship.y - 5);
            break;
        case 'down':
            self.ship.setPosition(self.ship.x, self.ship.y + 5);
            break;
    }
}

// this handles the movement of the snake
// so the snake is always moving and only changes
// direction
function update() {
    if (this.ship) {

        setShipDirection(this);
        setShipPosition(this);

        // emit player movement
        let x = this.ship.x;
        let y = this.ship.y;
        let r = this.ship.rotation;
        if (this.ship.oldPosition && (x !== this.ship.oldPosition.x || y !== this.ship.oldPosition.y || r !== this.ship.oldPosition.rotation)) {
            this.socket.emit('  ', { x: this.ship.x, y: this.ship.y, rotation: this.ship.rotation });
        }

        // save old position data
        this.ship.oldPosition = {
            x: this.ship.x,
            y: this.ship.y,
            rotation: this.ship.rotation
        };
    }
}