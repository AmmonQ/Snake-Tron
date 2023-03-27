import { Image } from "../model/image.js";

export class Images {

    static DIR_NAME = 'assets/';
    static BACKGROUND = 'background';
    static PLAYER_ICON = 'playerIcon';
    static OTHER_PLAYER = 'otherPlayer';
    static APPLE = 'apple';
    static ENEMY_HEAD = 'foeSnakeHead';
    static ENEMY_BODY = 'foeSnakeBody';
    static ENEMY_TAIL = 'foeSnakeTail';
    static PLAYER_HEAD = 'greenSnakeHead';
    static PLAYER_BODY = 'greenSnakeBody';
    static PLAYER_TAIL = 'greenSnakeTail';

    constructor() {
        this.images = [
            new Image(Images.BACKGROUND, 'grass.png'),
            new Image(Images.PLAYER_ICON, 'pink_snake_tongue_pixel.png'),
            new Image(Images.OTHER_PLAYER, 'pink_snake_pixel.png'),
            new Image(Images.APPLE, 'apple.png'),
            new Image(Images.ENEMY_HEAD, 'o_snake_head.png'),
            new Image(Images.ENEMY_BODY, 'o_snake_body.png'),
            new Image(Images.ENEMY_TAIL, 'o_snake_tail.png'),
            new Image(Images.PLAYER_HEAD, 'white_snake_head.png'),
            new Image(Images.PLAYER_BODY, 'white_snake_body.png'),
            new Image(Images.PLAYER_TAIL, 'g_snake_tail.png')
        ];
    }

    getImages() {
        return this.images;
    }
}