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

    constructor() {}

    getImages() {
        return [
            { name: Images.BACKGROUND, fileName: 'grass.png' },
            { name: Images.PLAYER_ICON, fileName: 'pink_snake_tongue_pixel.png' },
            { name: Images.OTHER_PLAYER, fileName: 'pink_snake_pixel.png' },
            { name: Images.APPLE, fileName: 'apple.png' },
            { name: Images.ENEMY_HEAD, fileName: 'o_snake_head.png' },
            { name: Images.ENEMY_BODY, fileName: 'o_snake_body.png' },
            { name: Images.ENEMY_TAIL, fileName: 'o_snake_tail.png' },
            { name: Images.PLAYER_HEAD, fileName: 'g_snake_head.png' },
            { name: Images.PLAYER_BODY, fileName: 'g_snake_body.png' },
            { name: Images.PLAYER_TAIL, fileName: 'g_snake_tail.png' }
        ];
    }
}