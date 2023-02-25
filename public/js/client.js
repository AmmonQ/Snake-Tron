const BLUE = 0x0000FF;
const RED = 0xFF0000;
const BG_COLOR_STR = '#009C29';
const BORDER_SIZE = 32;

const ROW_COL_SIZE = 32;
const NUM_ROWS = 20;
const NUM_COLS = 30;
const WIDTH = ROW_COL_SIZE * NUM_COLS + BORDER_SIZE * 2;
const HEIGHT = ROW_COL_SIZE * NUM_ROWS + BORDER_SIZE * 2;

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
            debug: false,
            gravity: { y: 0 }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let appleCollected = false;

let game = new Phaser.Game(config);

function drawBorder(graphics, alpha) {

    const BORDER_COLOR = 0x004C29;

    graphics.fillStyle(BORDER_COLOR, alpha);

    graphics.fillRect(0, 0, WIDTH, BORDER_SIZE);
    graphics.fillRect(0, 0, BORDER_SIZE, HEIGHT);
    graphics.fillRect(WIDTH - BORDER_SIZE, 0, BORDER_SIZE, HEIGHT);
    graphics.fillRect(0, HEIGHT - BORDER_SIZE, WIDTH, BORDER_SIZE);
}

// draw checkerboard for game
function drawBoard(graphics) {

    const FG_COLOR = 0x008C29;
    const ALPHA = 1.0;

    graphics.fillStyle(FG_COLOR, ALPHA);

    let previous = false;

    for (let col = BORDER_SIZE; col < HEIGHT - BORDER_SIZE; col += ROW_COL_SIZE) {
        for (let row = BORDER_SIZE; row < WIDTH - BORDER_SIZE; row += ROW_COL_SIZE) {
            if (!previous) {
                graphics.fillRect(row, col, ROW_COL_SIZE, ROW_COL_SIZE);
            }

            previous = !previous;
        }
        previous = !previous;
    }

    drawBorder(graphics, ALPHA);
}

function preload() {

    let self = this;

    self.load.image('background', 'assets/grass.png');
    self.load.image('playerIcon', 'assets/pink_snake_tongue_pixel.png');
    self.load.image('otherPlayer', 'assets/pink_snake_pixel.png');
    self.load.image('apple', 'assets/apple.png');
    self.load.image('greenSnakeHead', 'assets/green_snake_head.png')
    self.load.image('foeSnakeHead', 'assets/foe_snake_head.png')
    self.load.image('foeSnakeTurn', 'assets/foe_snake_turn.png')
    self.load.image('foeSnakeTail', 'assets/foe_snake_tail.png')
    self.load.image('foeSnakeBody', 'assets/foe_snake_body.png')
    self.load.image('greenSnakeBody', 'assets/green_snake_body.png')
    self.load.image('greenSnakeTail', 'assets/green_snake_tail.png')
    self.load.image('greenSnakeTurn', 'assets/green_snake_turn.png')

    drawBoard(self.add.graphics());
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

    const otherPlayer = self.add.sprite(playerInfo.position.x, playerInfo.position.y, 'otherPlayer').setOrigin(0.0, 0.0);
    setPlayerColor(otherPlayer, playerInfo);

    otherPlayer.id = playerInfo.id;
    self.otherPlayers.add(otherPlayer);
}

function addSegment(self) {

    let direction = self.playerIconsArray[0].direction;

    for (let i = 0; i < 8; i++) {

        let position = self.playerIconsArray[self.playerIconsArray.length - 1];

        let newPosition = {
            x: position.x + (i * 4),
            y: position.y
        };

        self.playerIconsArray.push(addImage(self, newPosition, 'greenSnakeBody'));
    }
}

function addPlayer(self, playerInfo) {

    self.playerIconsArray = [];

    self.playerIconsArray.push(addImage(self, playerInfo.position, 'greenSnakeTurn'));
    addSegment(self);
    self.playerIconsArray[0].destroy();
    self.playerIconsArray[0] = addImage(self, playerInfo.position, 'greenSnakeTurn');

    setPlayerColor(self.playerIconsArray, playerInfo);
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

// TODO: Should be in Server
function updateScores(self, scores) {

    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
}

// TODO: Should be in Server
function isSamePosition(player, apple) {

    let playerRow = player.y / ROW_COL_SIZE;
    let playerCol = player.x / ROW_COL_SIZE;

    let appleRow = apple.y / ROW_COL_SIZE;
    let appleCol = apple.x / ROW_COL_SIZE;

    return ((playerRow === appleRow) && (playerCol === appleCol));
}

function addImage(self, position, image) {
    return self.physics.add.image(position.x, position.y, image).setOrigin(0.0, 0.0);
}

// TODO: Should be in Server
function updateApple(self, appleLocation) {

    if (self.apple) {
        self.apple.destroy();
    }

    self.apple = addImage(self, appleLocation, 'apple');

    self.physics.add.overlap(self.playerIconsArray, self.apple, function () {

        if (!isSamePosition(self.playerIconsArray[0], self.apple)) {
            return;
        }

        appleCollected = true;

        self.socket.emit('appleCollected');
    }, null, self);
}

function create() {

    let self = this;
    self.socket = io();

    self.otherPlayers = self.physics.add.group();
    self.cursors = self.input.keyboard.createCursorKeys();

    initScoreText(self);

    self.socket.on('currentPlayers', function (players) {
        addPlayers(self, players);
    });

    self.socket.on('newPlayer', function (playerInfo) {
        addOtherPlayers(self, playerInfo);
    });

    self.socket.on('disconnected', function (playerId) {
        disconnect(self, playerId);
    });

    self.socket.on('playerMoved', function (playerInfo) {
        movePlayer(self, playerInfo);
    });

    self.socket.on('scoreUpdate', function (scores) {
        updateScores(self, scores);
    });

    self.socket.on('appleLocation', function (appleLocation) {
        updateApple(self, appleLocation);
    });
}

// TODO: Should be in Server
function setPlayerColor(player, playerInfo) {
    console.log("BLUE: " + BLUE + " RED: " + RED);
    player.setTint(playerInfo.team === 'blue' ? BLUE : RED);
}

// Client gets input and passes it up to server
function setPlayerNextDirection(self) {

    if (self.cursors.left.isDown && self.playerIconsArray[0].direction !== Directions.RIGHT) {
        self.playerIconsArray[0].nextDirection = Directions.LEFT;
    } else if (self.cursors.right.isDown && self.playerIconsArray[0].direction !== Directions.LEFT) {
        self.playerIconsArray[0].nextDirection = Directions.RIGHT;
    } else if (self.cursors.up.isDown && self.playerIconsArray[0].direction !== Directions.DOWN) {
        self.playerIconsArray[0].nextDirection = Directions.UP;
    } else if (self.cursors.down.isDown && self.playerIconsArray[0].direction !== Directions.UP) {
        self.playerIconsArray[0].nextDirection = Directions.DOWN;
    }
}

// TODO: Should be in Server
function isCoordinateAligned(coordinate) {
    return ((coordinate % ROW_COL_SIZE) === 0);
}
// TODO: Should be in Server
function areCoordinatesAligned(player) {
    return (isCoordinateAligned(player.x) && isCoordinateAligned(player.y));
}

function setPlayerDirection(self, playerIconsArray) {

    let player = playerIconsArray[0];

    if (!areCoordinatesAligned(player)) {
        return;
    }

    addPlayerIcon(self, playerIconsArray);

    player.direction = player.nextDirection;
}
// TODO: Should be in Server
function isPlayerInBounds(player) {

    if (player.x < BORDER_SIZE) {
        return false;
    } else if (player.x > (WIDTH - BORDER_SIZE * 2)) {
        return false;
    } else if (player.y < BORDER_SIZE) {
        return false;
    } else if (player.y > (HEIGHT - BORDER_SIZE * 2)) {
        return false;
    }

    return true;
}
function getNewPosition(player) {

    const POS_DELTA = 4;

    let newPosition = {
        x: player.x,
        y: player.y
    };

    switch (player.direction) {
        case Directions.LEFT:
            newPosition.x -= POS_DELTA;
            break;
        case Directions.RIGHT:
            newPosition.x += POS_DELTA;
            break;
        case Directions.UP:
            newPosition.y -= POS_DELTA;
            break;
        case Directions.DOWN:
            newPosition.y += POS_DELTA
            break;
        default:
            break;
    }

    return newPosition;
}

function setPlayerPosition(playerIconsArray, player) {

    for (let i = playerIconsArray.length - 1; i > 0; i--) {

        let x = playerIconsArray[i - 1].x;
        let y = playerIconsArray[i - 1].y;
        
        playerIconsArray[i].setPosition(x, y);
    }

    let newPosition = getNewPosition(player);

    player.setPosition(newPosition.x, newPosition.y);
}

function addPlayerIcon(self, playerIconsArray) {

    if (!appleCollected) {
        return;
    }

    let headIcon = playerIconsArray[0];


    let position = {
        x: headIcon.x,
        y: headIcon.y
    };

    addSegment(self);
    // playerIconsArray.push(addImage(self, position, 'playerIcon'));

    appleCollected = false;
}

// update() handles the movement of the snake
// so the snake is always moving and only changes
// direction
function update() {

    let self = this;

    if (self.playerIconsArray) {
        let player = self.playerIconsArray[0];

        if (!isPlayerInBounds(player)) {
            console.log("out of bounds");
            for (let i = 0; i < self.playerIconsArray.length; i++) {
                self.playerIconsArray[i].destroy();
            }
            self.playerIconsArray.length = 0;
            self.socket.emit("playerDied");
            return;
        }

        // set direction and position
        setPlayerNextDirection(self);
        setPlayerDirection(self, self.playerIconsArray);
        setPlayerPosition(self.playerIconsArray, player);

        // emit player movement
        let x = player.x;
        let y = player.y;
        if (player.oldPosition && (x !== player.oldPosition.x || y !== player.oldPosition.y)) {
            self.socket.emit('playerMovement', { x: player.x, y: player.y });
        }

        // save old position data
        player.oldPosition = {
            x: player.x,
            y: player.y,
        };
    }
}
