import {Presenter} from './presenter.js'

let presenter = new Presenter();

let config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: presenter.getWidth(),
    height: presenter.getHeight(),
    backgroundColor: presenter.getBgColorStr(),
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
let graphics;

function drawRect(x1, y1, x2, y2, color, alpha) {
    graphics.fillStyle(color, alpha);
    graphics.fillRect(x1, y1, x2, y2);
}

function preload() {

    let self = this;
    graphics = self.add.graphics();

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

    presenter.drawBoard(drawRect);
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

function getSegmentNewPosition(position, index) {

    let newX = position.x;
    let newY = position.y;

    let movDelta = index * 4;

    switch (position.direction) {
        case Presenter.Directions.LEFT:
            newX += movDelta;
            break;
        case Presenter.Directions.RIGHT:
            newX -= movDelta;
            break;
        case Presenter.Directions.UP:
            newY -= movDelta;
            break;
        case Presenter.Directions.DOWN:
            newY += movDelta;
            break;
    }

    return {
        x: newX,
        y: newY
    };
}

function addSegment(self) {

    const NUM_ICONS_PER_SEGMENTS = 8;

    for (let i = 0; i < NUM_ICONS_PER_SEGMENTS; i++) {

        let position = self.playerIconsArray[self.playerIconsArray.length - 1];

        let newPosition = getSegmentNewPosition(position, i);

        self.playerIconsArray.push(addImage(self, newPosition, 'greenSnakeBody'));
    }
}

function addPlayer(self, playerInfo) {

    self.playerIconsArray = [];

    self.playerIconsArray.push(addImage(self, playerInfo.position, 'greenSnakeBody'));
    addSegment(self);
    self.playerIconsArray[0].destroy();
    self.playerIconsArray[0] = addImage(self, playerInfo.position, 'greenSnakeHead');

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

        if (!presenter.isSamePosition(self.playerIconsArray[0], self.apple)) {
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
    console.log("BLUE: " + presenter.getBlue() + " RED: " + presenter.getRed());
    player.setTint(playerInfo.team === 'blue' ? presenter.getBlue() : presenter.getRed());
}

// TODO: Should be in Server
function isCoordinateAligned(coordinate) {
    return ((coordinate % presenter.getTileDiameter()) === 0);
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

    addPlayerIcon(self);

    player.direction = player.nextDirection;
}
// TODO: Should be in Server
function isPlayerInBounds(player) {

    if (player.x < presenter.getBorderSize()) {
        return false;
    } else if (player.x > (presenter.getWidth() - presenter.getBorderSize() * 2)) {
        return false;
    } else if (player.y < presenter.getBorderSize()) {
        return false;
    } else if (player.y > (presenter.getHeight() - presenter.getBorderSize() * 2)) {
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
        case Presenter.Directions.LEFT:
            newPosition.x -= POS_DELTA;
            break;
        case Presenter.Directions.RIGHT:
            newPosition.x += POS_DELTA;
            break;
        case Presenter.Directions.UP:
            newPosition.y -= POS_DELTA;
            break;
        case Presenter.Directions.DOWN:
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

function addPlayerIcon(self) {

    if (!appleCollected) {
        return;
    }

    addSegment(self);

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
        self.playerIconsArray[0].nextDirection = presenter.getPlayerNextDirection(self.cursors, self.playerIconsArray[0].direction);
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
