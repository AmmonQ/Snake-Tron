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
    this.load.image('player', 'assets/pink_snake_tongue_pixel.png');
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
        if (players[id].id === self.socket.id) {
            addPlayer(self, players[id]);
        } else {
            addOtherPlayers(self, players[id]);
        }
    });
}
function disconnect(self, playerId) {

    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerId === otherPlayer.id) {
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
        if (playerInfo.id === otherPlayer.id) {
            otherPlayer.setPosition(playerInfo.position.x, playerInfo.position.y);
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

        self.physics.add.overlap(self.player, self.apple, function () {
            this.socket.emit('appleCollected');
        }, null, self);
    });
}

function setPlayerColor(player, playerInfo) {
    player.setTint(playerInfo.team === 'blue' ? BLUE : RED);
}

function addPlayer(self, playerInfo) {

    self.player = self.physics.add.image(playerInfo.position.x, playerInfo.position.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    setPlayerColor(self.player, playerInfo);

    self.player.setDrag(100);
    self.player.setAngularDrag(100);
    self.player.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {

    const otherPlayer = self.add.sprite(playerInfo.position.x, playerInfo.position.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    setPlayerColor(otherPlayer, playerInfo);

    otherPlayer.id = playerInfo.id;
    self.otherPlayers.add(otherPlayer);
}

function setPlayerDirection(self) {

    if (self.cursors.left.isDown && self.player.direction !== 'right') {
        self.player.direction = 'left';
    } else if (self.cursors.right.isDown && self.player.direction !== 'left') {
        self.player.direction = 'right';
    } else if (self.cursors.up.isDown && self.player.direction !== 'down') {
        self.player.direction = 'up';
    } else if (self.cursors.down.isDown && self.player.direction !== 'up') {
        self.player.direction = 'down';
    }
}

function setPlayerPosition(self) {

    switch (self.player.direction) {
        case 'left':
            self.player.setPosition(self.player.x - 5, self.player.y);
            break;
        case 'right':
            self.player.setPosition(self.player.x + 5, self.player.y);
            break;
        case 'up':
            self.player.setPosition(self.player.x, self.player.y - 5);
            break;
        case 'down':
            self.player.setPosition(self.player.x, self.player.y + 5);
            break;
    }
}

// this handles the movement of the snake
// so the snake is always moving and only changes
// direction
function update() {

    if (this.player) {
        // set direction and position
        setPlayerDirection(this);
        setPlayerPosition(this);

        // emit player movement
        let x = this.player.x;
        let y = this.player.y;
        if (this.player.oldPosition && (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)) {
            this.socket.emit('  ', { x: this.player.x, y: this.player.y });
        }

        // save old position data
        this.player.oldPosition = {
            x: this.player.x,
            y: this.player.y,
        };
    }
}