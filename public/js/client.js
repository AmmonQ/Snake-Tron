const BLUE = 0x0000FF;
const RED = 0xFF0000;
const BG_COLOR_STR = '#009C29';

const ROW_COL_SIZE = 32;
const NUM_ROWS = 20;
const NUM_COLS = 30;
const WIDTH = ROW_COL_SIZE * NUM_COLS;
const HEIGHT = ROW_COL_SIZE * NUM_ROWS;

const Directions = {
	LEFT: 'left',
	RIGHT: 'right',
	UP: 'up',
	DOWN: 'down'
};

let config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: WIDTH,
    height: HEIGHT,
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

// draw checker board for game
function drawBoard(graphics) {

    const FG_COLOR = 0x008C29;
    const ALPHA = 1.0;
    
    graphics.fillStyle(FG_COLOR, ALPHA);
    
    let previous = false;

    for (let col = 0; col < HEIGHT; col += ROW_COL_SIZE) {
        for (let row = 0; row < WIDTH; row += ROW_COL_SIZE) {
            if (!previous) {
                graphics.fillRect(row, col, ROW_COL_SIZE, ROW_COL_SIZE);
            }

            previous = !previous;
        }
        previous = !previous;
    }
}

function preload() {

    this.load.image('background', 'assets/grass.png');
    this.load.image('player', 'assets/pink_snake_tongue_pixel.png');
    this.load.image('otherPlayer', 'assets/pink_snake_pixel.png');
    this.load.image('apple', 'assets/apple.png');

    drawBoard(this.add.graphics());
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

function addOtherPlayers(self, playerInfo) {

    const otherPlayer = self.add.sprite(playerInfo.position.x, playerInfo.position.y, 'otherPlayer').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    setPlayerColor(otherPlayer, playerInfo);

    otherPlayer.id = playerInfo.id;
    self.otherPlayers.add(otherPlayer);
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

function movePlayer(self, playerInfo) {

    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
        if (playerInfo.id === otherPlayer.id) {
            otherPlayer.setPosition(playerInfo.position.x, playerInfo.position.y);
        }
    });
}

function updateScores(self, scores) {

    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
}

function isSamePosition(player, apple) {

    let playerRow = player.y / ROW_COL_SIZE;
    let playerCol = player.x / ROW_COL_SIZE;

    let appleRow = apple.y / ROW_COL_SIZE;
    let appleCol = apple.x / ROW_COL_SIZE;

    return ((playerRow == appleRow) && (playerCol == appleCol));
}

function updateApple(self, appleLocation) {

    if (self.apple) {
        self.apple.destroy();
    }

    self.apple = self.physics.add.image(appleLocation.x, appleLocation.y, 'apple');

    self.physics.add.overlap(self.player, self.apple, function () {

        if (!isSamePosition(self.player, self.apple)) {
            return;
        }

        this.socket.emit('appleCollected');
    }, null, self);
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
        updateApple(self, appleLocation);
    });
}

function setPlayerColor(player, playerInfo) {
    player.setTint(playerInfo.team === 'blue' ? BLUE : RED);
}

function addPlayer(self, playerInfo) {

    self.player = self.physics.add.image(playerInfo.position.x, playerInfo.position.y, 'player').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
    setPlayerColor(self.player, playerInfo);
}

function setPlayerNextDirection(self) {

    if (self.cursors.left.isDown && self.player.direction !== Directions.RIGHT) {
        self.player.nextDirection = Directions.LEFT;
    } else if (self.cursors.right.isDown && self.player.direction !== Directions.LEFT) {
        self.player.nextDirection = Directions.RIGHT;
    } else if (self.cursors.up.isDown && self.player.direction !== Directions.DOWN) {
        self.player.nextDirection = Directions.UP;
    } else if (self.cursors.down.isDown && self.player.direction !== Directions.UP) {
        self.player.nextDirection = Directions.DOWN;
    }
}

function isCoordinateAligned(coordinate) {
    const HALF_ROW_COL_SIZE = ROW_COL_SIZE / 2;
    return (((coordinate - HALF_ROW_COL_SIZE) % ROW_COL_SIZE) == 0);
}

function areCoordinatesAligned(player) {
    return (isCoordinateAligned(player.x) && isCoordinateAligned(player.y));
}

function setPlayerDirection(player) {

    if (!areCoordinatesAligned(player)) {
        return;
    }

    player.direction = player.nextDirection;
}

function setPlayerPosition(player) {

    const POS_DELTA = 4;

    switch (player.direction) {
        case Directions.LEFT:
            player.setPosition(player.x - POS_DELTA, player.y);
            break;
        case Directions.RIGHT:
            player.setPosition(player.x + POS_DELTA, player.y);
            break;
        case Directions.UP:
            player.setPosition(player.x, player.y - POS_DELTA);
            break;
        case Directions.DOWN:
            player.setPosition(player.x, player.y + POS_DELTA);
            break;
    }
}

// this handles the movement of the snake
// so the snake is always moving and only changes
// direction
function update() {

    let player = this.player;

    if (player) {
        // set direction and position
        setPlayerNextDirection(this);
        setPlayerDirection(player);
        setPlayerPosition(player);

        // emit player movement
        let x = player.x;
        let y = player.y;
        if (player.oldPosition && (x !== player.oldPosition.x || y !== player.oldPosition.y)) {
            this.socket.emit('  ', { x: player.x, y: player.y });
        }

        // save old position data
        player.oldPosition = {
            x: player.x,
            y: player.y,
        };
    }
}