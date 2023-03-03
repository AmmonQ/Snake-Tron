// (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// let constantsJS = require('../shared/constants.js');
//
// // const BLUE = 0x0000FF;
// // const RED = 0xFF0000;
// // const BG_COLOR_STR = '#009C29';
// // const BORDER_SIZE = 32;
// //
// // const ROW_COL_SIZE = 32;
// // const NUM_ROWS = 20;
// // const NUM_COLS = 30;
// // const WIDTH = ROW_COL_SIZE * NUM_COLS + BORDER_SIZE * 2;
// // const HEIGHT = ROW_COL_SIZE * NUM_ROWS + BORDER_SIZE * 2;
//
// const BLUE = constantsJS.Constants.BLUE;
// const RED = constantsJS.Constants.RED;
// const BG_COLOR_STR = constantsJS.Constants.BG_COLOR_STR;
// const BORDER_SIZE = constantsJS.Constants.BORDER_SIZE;
// const ROW_COL_SIZE = constantsJS.Constants.ROW_COL_SIZE;
// const NUM_ROWS = constantsJS.Constants.NUM_ROWS;
// const NUM_COLS = constantsJS.Constants.NUM_COLS;
// const WIDTH = constantsJS.Constants.WIDTH;
// const HEIGHT = constantsJS.Constants.HEIGHT;
//
// const Directions = {
// 	LEFT: 'left',
// 	RIGHT: 'right',
// 	UP: 'up',
// 	DOWN: 'down'
// };
//
// let config = {
//     type: Phaser.AUTO,
//     parent: 'phaser-example',
//     width: WIDTH,
//     height: HEIGHT,
//     backgroundColor: BG_COLOR_STR,
//     physics: {
//         default: 'arcade',
//         arcade: {
//             debug: false,
//             gravity: { y: 0 }
//         }
//     },
//     scene: {
//         preload: preload,
//         create: create,
//         update: update
//     }
// };
//
// let game = new Phaser.Game(config);
//
// function drawBorder(graphics, alpha) {
//
//     const BORDER_COLOR = 0x004C29;
//
//     graphics.fillStyle(BORDER_COLOR, alpha);
//
//     graphics.fillRect(0, 0, WIDTH, BORDER_SIZE);
//     graphics.fillRect(0, 0, BORDER_SIZE, HEIGHT);
//     graphics.fillRect(WIDTH - BORDER_SIZE, 0, BORDER_SIZE, HEIGHT);
//     graphics.fillRect(0, HEIGHT - BORDER_SIZE, WIDTH, BORDER_SIZE);
// }
//
// // draw checkerboard for game
// function drawBoard(graphics) {
//
//     const FG_COLOR = 0x008C29;
//     const ALPHA = 1.0;
//
//     graphics.fillStyle(FG_COLOR, ALPHA);
//
//     let previous = false;
//
//     for (let col = BORDER_SIZE; col < HEIGHT - BORDER_SIZE; col += ROW_COL_SIZE) {
//         for (let row = BORDER_SIZE; row < WIDTH - BORDER_SIZE; row += ROW_COL_SIZE) {
//             if (!previous) {
//                 graphics.fillRect(row, col, ROW_COL_SIZE, ROW_COL_SIZE);
//             }
//
//             previous = !previous;
//         }
//         previous = !previous;
//     }
//
//     drawBorder(graphics, ALPHA);
// }
//
// function preload() {
//
//     this.load.image('background', 'assets/grass.png');
//     this.load.image('player', 'assets/pink_snake_tongue_pixel.png');
//     this.load.image('otherPlayer', 'assets/pink_snake_pixel.png');
//     this.load.image('apple', 'assets/apple.png');
//
//     drawBoard(this.add.graphics());
// }
//
// function initScoreText(self) {
//
//     const BLUE_X = 16;
//     const RED_X = 584;
//     const SCORE_Y = 16;
//     const FONT_SIZE = '32px'
//     const BLUE_STR = '#0000FF';
//     const RED_STR = '#FF0000';
//
//     self.blueScoreText = self.add.text(BLUE_X, SCORE_Y, '', { fontSize: FONT_SIZE, fill: BLUE_STR });
//     self.redScoreText = self.add.text(RED_X, SCORE_Y, '', { fontSize: FONT_SIZE, fill: RED_STR });
// }
//
// function addOtherPlayers(self, playerInfo) {
//
//     const otherPlayer = self.add.sprite(playerInfo.position.x, playerInfo.position.y, 'otherPlayer').setOrigin(0.0, 0.0);
//     setPlayerColor(otherPlayer, playerInfo);
//
//     otherPlayer.id = playerInfo.id;
//     self.otherPlayers.add(otherPlayer);
// }
//
// function addPlayer(self, playerInfo) {
//
//     self.player = addImage(self, playerInfo.position, 'player');
//     setPlayerColor(self.player, playerInfo);
// }
//
// function addPlayers(self, players) {
//
//     Object.keys(players).forEach(function (id) {
//         if (players[id].id === self.socket.id) {
//             addPlayer(self, players[id]);
//         } else {
//             addOtherPlayers(self, players[id]);
//         }
//     });
// }
//
// function disconnect(self, playerId) {
//
//     self.otherPlayers.getChildren().forEach(function (otherPlayer) {
//         if (playerId === otherPlayer.id) {
//             otherPlayer.destroy();
//         }
//     });
// }
//
// function movePlayer(self, playerInfo) {
//
//     self.otherPlayers.getChildren().forEach(function (otherPlayer) {
//         if (playerInfo.id === otherPlayer.id) {
//             otherPlayer.setPosition(playerInfo.position.x, playerInfo.position.y);
//         }
//     });
// }
//
// function updateScores(self, scores) {
//
//     self.blueScoreText.setText('Blue: ' + scores.blue);
//     self.redScoreText.setText('Red: ' + scores.red);
// }
//
// function isSamePosition(player, apple) {
//
//     let playerRow = player.y / ROW_COL_SIZE;
//     let playerCol = player.x / ROW_COL_SIZE;
//
//     let appleRow = apple.y / ROW_COL_SIZE;
//     let appleCol = apple.x / ROW_COL_SIZE;
//
//     return ((playerRow === appleRow) && (playerCol === appleCol));
// }
//
// function addImage(self, position, image) {
//     return self.physics.add.image(position.x, position.y, image).setOrigin(0.0, 0.0);
// }
//
// function updateApple(self, appleLocation) {
//
//     if (self.apple) {
//         self.apple.destroy();
//     }
//
//     self.apple = addImage(self, appleLocation, 'apple');
//
//     self.physics.add.overlap(self.player, self.apple, function () {
//
//         if (!isSamePosition(self.player, self.apple)) {
//             return;
//         }
//
//         this.socket.emit('appleCollected');
//     }, null, self);
// }
//
// function create() {
//
//     let self = this;
//     this.socket = io();
//
//     this.otherPlayers = this.physics.add.group();
//     this.cursors = this.input.keyboard.createCursorKeys();
//
//     initScoreText(self);
//
//     this.socket.on('currentPlayers', function (players) {
//         addPlayers(self, players);
//     });
//
//     this.socket.on('newPlayer', function (playerInfo) {
//         addOtherPlayers(self, playerInfo);
//     });
//
//     this.socket.on('disconnected', function (playerId) {
//         disconnect(self, playerId);
//     });
//
//     this.socket.on('playerMoved', function (playerInfo) {
//         movePlayer(self, playerInfo);
//     });
//
//     this.socket.on('scoreUpdate', function (scores) {
//         updateScores(self, scores);
//     });
//
//     this.socket.on('appleLocation', function (appleLocation) {
//         updateApple(self, appleLocation);
//     });
// }
//
// function setPlayerColor(player, playerInfo) {
//     console.log("BLUE: " + BLUE + " RED: " + RED);
//     player.setTint(playerInfo.team === 'blue' ? BLUE : RED);
// }
//
// function setPlayerNextDirection(self) {
//
//     if (self.cursors.left.isDown && self.player.direction !== Directions.RIGHT) {
//         self.player.nextDirection = Directions.LEFT;
//     } else if (self.cursors.right.isDown && self.player.direction !== Directions.LEFT) {
//         self.player.nextDirection = Directions.RIGHT;
//     } else if (self.cursors.up.isDown && self.player.direction !== Directions.DOWN) {
//         self.player.nextDirection = Directions.UP;
//     } else if (self.cursors.down.isDown && self.player.direction !== Directions.UP) {
//         self.player.nextDirection = Directions.DOWN;
//     }
// }
//
// function isCoordinateAligned(coordinate) {
//     return ((coordinate % ROW_COL_SIZE) === 0);
// }
//
// function areCoordinatesAligned(player) {
//     return (isCoordinateAligned(player.x) && isCoordinateAligned(player.y));
// }
//
// function setPlayerDirection(player) {
//
//     if (!areCoordinatesAligned(player)) {
//         return;
//     }
//
//     player.direction = player.nextDirection;
// }
//
// function isPlayerInBounds(player) {
//
//     if (player.x < BORDER_SIZE) {
//         return false;
//     } else if (player.x > (WIDTH - BORDER_SIZE * 2)) {
//         return false;
//     } else if (player.y < BORDER_SIZE) {
//         return false;
//     } else if (player.y > (HEIGHT - BORDER_SIZE * 2)) {
//         return false;
//     }
//
//     return true;
// }
//
// function setPlayerPosition(player) {
//
//     const POS_DELTA = 4;
//
//     switch (player.direction) {
//         case Directions.LEFT:
//             player.setPosition(player.x - POS_DELTA, player.y);
//             break;
//         case Directions.RIGHT:
//             player.setPosition(player.x + POS_DELTA, player.y);
//             break;
//         case Directions.UP:
//             player.setPosition(player.x, player.y - POS_DELTA);
//             break;
//         case Directions.DOWN:
//             player.setPosition(player.x, player.y + POS_DELTA);
//             break;
//         default:
//             break;
//     }
// }
//
// // this handles the movement of the snake
// // so the snake is always moving and only changes
// // direction
// function update() {
//
//     if (this.player) {
//         let player = this.player;
//
//         if (!isPlayerInBounds(player)) {
//             console.log("out of bounds");
//             this.player.destroy();
//             this.socket.emit("playerDied");
//             return;
//         }
//
//         // set direction and position
//         setPlayerNextDirection(this);
//         setPlayerDirection(player);
//         setPlayerPosition(player);
//
//         // emit player movement
//         let x = player.x;
//         let y = player.y;
//         if (player.oldPosition && (x !== player.oldPosition.x || y !== player.oldPosition.y)) {
//             this.socket.emit('playerMovement', { x: player.x, y: player.y });
//         }
//
//         // save old position data
//         player.oldPosition = {
//             x: player.x,
//             y: player.y,
//         };
//     }
// }
//
// },{"../shared/constants.js":2}],2:[function(require,module,exports){
// module.exports.Constants = class {
//
//     // static BLUE = 0x0000FF;
//     static BLUE = 0x00FF00;
//     static RED = 0xFF0000;
//     static BG_COLOR_STR = '#009C29';
//     static BORDER_SIZE = 32;
//
//     static ROW_COL_SIZE = 32;
//     static NUM_ROWS = 20;
//     static NUM_COLS = 30;
//     static WIDTH = this.ROW_COL_SIZE * this.NUM_COLS + this.BORDER_SIZE * 2;
//     static HEIGHT = this.ROW_COL_SIZE * this.NUM_ROWS + this.BORDER_SIZE * 2;
// }
// },{}]},{},[1,2]);
