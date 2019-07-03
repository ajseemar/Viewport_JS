var c, cc;

var KEYS = {
    SPACE: "SPACE",
    LEFT: "LEFT",
    UP: "UP",
    RIGHT: "RIGHT",
    DOWN: "DOWN"
};

const clamp = (num, min, max) => {
    return Math.max(min, Math.min(num, max))
}

document.addEventListener("DOMContentLoaded", () => {
    c = document.getElementById('canvas');
    cc = c.getContext('2d');

    const ViewportDemo = new Game(c.width, c.height, 100);

    const startDemo = () => {
        let time = Date.now();
        let dt = (ViewportDemo.initialTime - time) / 1000.0;

        ViewportDemo.update(dt);
        ViewportDemo.render();

        ViewportDemo.initialTime = time;
        requestAnimationFrame(startDemo);
    }

    startDemo();
});

class Game {
    constructor(vpWidth, vpHeight, cellCount) {
        // this.cellSize = vpWidth / cellCount; // renders entire map
        this.cellSize = 25; // for camera
        this.width = cellCount * this.cellSize;
        this.height = cellCount * this.cellSize;

        this.camera = new Camera(vpWidth, vpHeight, this.width, this.height, cellCount);
        this.map = new Map(cellCount, this.cellSize);

        this.inputHandler = new InputManager();
        this.player = new Player(this.cellSize, this.inputHandler);
        this.camera.follow(this.player);

        this.initialTime = Date.now();
    }



    update(dt) {
        this.player.update(dt);
        this.camera.update();
    }

    render() {
        // this.map.render();
        cc.clearRect(0, 0, c.width, c.height);
        this.camera.render(this.map.grid);
        this.player.render();
    }
}

class Camera {
    constructor(width, height, gameWidth, gameHeight, cellCount) {
        this.width = width / 2;
        this.height = height / 2;

        this.maxX = gameWidth - this.width;
        this.maxY = gameHeight - this.height;

        this.position = {
            x: 0,
            y: 0
        };

        this.cellCount = cellCount;

        this.size = Math.ceil(720 / 25);

        this.following = null;
    }

    worldToScreen(x, y) {
        return { x: x - this.position.x, y: y - this.position.y };
    }


    screenToWorld(x, y) {
        return { x: x + this.position.x, y: y + this.position.y };
    }

    follow(player) {
        this.following = player;
        this.following.screenPosition = this.worldToScreen(this.following.position.x, this.following.position.y);
    }

    update() {
        this.following.screenX = this.width / 2;
        this.following.screenY = this.height / 2;
        // this.following.screenPosition = this.worldToScreen(this.following.position.x, this.following.position.y);
        // make the camera follow the sprite
        this.position.x = this.following.screenX - this.width / 2;
        this.position.y = this.following.screenY - this.height / 2;
        // clamp values
        this.position.x = Math.max(0, Math.min(this.position.x, this.maxX));
        this.position.y = Math.max(0, Math.min(this.position.y, this.maxY));

        // in map corners, the sprite cannot be placed in the center of the screen
        // and we have to change its screen coordinates

        // left and right sides
        if (this.following.position.x < this.width / 2 ||
            this.following.position.x > this.maxX + this.width / 2) {
            this.following.screenX = this.following.position.x - this.position.x;
        }
        // top and bottom sides
        if (this.following.position.y < this.height / 2 ||
            this.following.position.y > this.maxY + this.height / 2) {
            this.following.screenY = this.following.position.y - this.position.y;

        }
    }

    render(grid) {
        let startCol = Math.floor(this.position.x / this.size); // - 1;
        let endCol = startCol + this.size; // + 1;
        let startRow = Math.floor(this.position.y / this.size); // - 1;
        let endRow = startRow + this.size; // + 1;

        // startCol = clamp(startCol, 0, this.cellCount - 1);
        // endCol = clamp(endCol, 0, this.cellCount - 1);
        // startRow = clamp(startRow, 0, this.cellCount - 1);
        // endRow = clamp(endRow, 0, this.cellCount - 1)

        const offsetX = -this.position.x + startCol * this.size;
        const offsetY = -this.position.y + startRow * this.size;

        // debugger
        for (let j = startCol; j < endCol; j++) {
            for (let i = startRow; i < endRow; i++) {
                // debugger
                // if (j % 15 === 0) cc.fillStyle = "#f00";
                // else if ((i + j) % 2 === 0) cc.fillStyle = "#0f0";
                // else cc.fillStyle = "#00f";

                // // cc.fillRect(i * this.size, j * this.size, this.size, this.size);
                let x = (j - startCol) * this.size + offsetX;
                let y = (i - startRow) * this.size + offsetY;
                cc.fillStyle = grid[i][j].color;
                cc.fillRect(x, y, this.size, this.size);
                // grid[i][j].render(offsetX, offsetY);
            }
        }
    }
}

class Map {
    constructor(cellCount, cellSize) {
        this.cellSize = cellSize;
        this.rows = this.cols = cellCount;
        this.grid = new Array(cellCount);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(cellCount);
        }
        // this.grid.map(() => new Array(cellCount));
        // debugger
        for (let j = 0; j < this.cols; j++) {
            for (let i = 0; i < this.rows; i++) {
                this.grid[i][j] = new Tile(i, j, this.cellSize);
            }
        }
    }

    render() {
        this.grid.forEach(col => col.forEach(el => el.render()));
    }
}

class Tile {
    static COLORS = [
        "#1E1E24",
        "#FB9F89",
        "#C4AF9A",
        "#81AE9D",
        "#21A179"
    ];

    constructor(row, col, size) {
        this.row = row;
        this.col = col;
        this.size = size;
        this.color = Tile.COLORS[Math.floor(Math.random() * Tile.COLORS.length)];
        this.position = {
            x: this.col * this.size,
            y: this.row * this.size
        };
    }

    render() {
        cc.fillStyle = this.color;
        cc.fillRect(this.position.x, this.position.y, this.size, this.size);
    }
}

class InputManager {
    constructor() {
        this.pressedKeys = {};

        document.addEventListener('keydown', e => this.setKey(e, true));
        document.addEventListener('keyup', e => this.setKey(e, false));
    }

    setKey(e, status) {
        e.preventDefault();
        let key;
        switch (e.keyCode) {
            case 32:
                key = KEYS.SPACE;
                break;
            case 37:
                key = KEYS.LEFT;
                break;
            case 38:
                key = KEYS.UP;
                break;
            case 39:
                key = KEYS.RIGHT;
                break;
            case 40:
                key = KEYS.DOWN;
                break;
            default:
                // Convert ASCII codes to letters
                key = String.fromCharCode(e.keyCode);

        }

        this.pressedKeys[key] = status;
    }

    isPressed(key) {
        return this.pressedKeys[key];
    }
}

class Player {
    constructor(size, inputHandler) {
        this.size = size / 3; //c.width / (size * 2);
        // this.screenX = 0;
        // this.screenY = 0;

        this.position = {
            x: this.size,
            y: this.size
        };

        this.velocity = {
            x: 0,
            y: 0
        };

        this.speed = this.size * 20;


        this.ih = inputHandler;
    }

    handleInput() {
        if (this.ih.isPressed(KEYS.UP)) {
            // this.velocity.x = 0;
            this.velocity.y = this.speed;
        } else if (this.ih.isPressed(KEYS.DOWN)) {
            // this.velocity.x = 0;
            this.velocity.y = -this.speed;
        } else {
            this.velocity.y = 0;
            // this.velocity.x = 0;
        }

        if (this.ih.isPressed(KEYS.RIGHT)) {
            // this.velocity.y = 0;
            this.velocity.x = -this.speed;
        } else if (this.ih.isPressed(KEYS.LEFT)) {
            // this.velocity.y = 0;
            this.velocity.x = this.speed;
        } else {
            this.velocity.x = 0;
            // this.velocity.y = 0;
        }
    }

    update(dt) {
        this.handleInput();
        const maxX = this.size * 100 * 3 - (c.width - 10 * (c.width / 100));
        const maxY = this.size * 100 * 3 - (c.height - 10 * (c.height / 100));
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.position.x = Math.max(0, Math.min(this.position.x, maxX));
        this.position.y = Math.max(0, Math.min(this.position.y, maxY));
        // this.screenX = this.position.x;
        // this.screenY = this.position.y;
        // console.log(this.screenX, this.screenY);postition.
    }

    render() {
        cc.fillStyle = "#0ff";
        cc.beginPath();
        cc.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2)
        cc.closePath();
        cc.fill();
    }
}