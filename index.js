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

        // this.cellSize = c.width / cellCount; // renders entire map
        this.cellSize = 40; // for camera
        // this.width = cellCount * this.cellSize;
        // this.height = cellCount * this.cellSize;

        // this.camera = new Camera(vpWidth, vpHeight, this.width, this.height, cellCount);
        this.map = new Map(cellCount, this.cellSize);

        this.resize();
        this.inputHandler = new InputManager();
        this.viewport = new Viewport(this.cellSize, cellCount);
        this.player = new Player(this.cellSize, this.inputHandler, this.cellSize, cellCount);
        // this.camera.follow(this.player);

        window.addEventListener('resize', this.resize.bind(this));

        this.initialTime = Date.now();
    }

    resize() {
        const ratio = 16 / 9;
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        if (c.width > c.height / ratio) c.width = c.height * ratio;
        else if (c.height > c.width / ration) c.height = c.width * ratio;
        this.width = c.width;
        this.height = c.height;
    }



    update(dt) {
        this.player.update(dt);
        this.viewport.update(this.player.position.x, this.player.position.y);
        // this.camera.update();
    }

    render() {
        // this.map.render();
        cc.fillStyle = "#000";
        cc.fillRect(0, 0, c.width, c.height);
        this.viewport.render(this.map.grid);
        // this.camera.render(this.map.grid);
        this.player.render(this.viewport.offset.x, this.viewport.offset.y);
    }
}

class Viewport {
    constructor(cellSize, cellCount) {
        this.cellSize = cellSize;
        this.cellCount = cellCount;

        // this.screen = {
        //     x: c.width,
        //     y: c.height
        // };
        this.startTile = {
            row: 0,
            col: 0
        };
        this.endTile = {
            row: 0,
            col: 0
        };
        this.offset = {
            x: 0,
            y: 0
        };

        this.resize();
    }

    resize() {
        this.screen = {
            x: c.width,
            y: c.height
        };
    }

    update(px, py) {
        this.resize();
        this.offset.x = Math.floor(this.screen.x / 2 - px); // - this.screen.x / 2;
        this.offset.y = Math.floor(this.screen.y / 2 - py); // - this.screen.y / 2;
        // debugger
        // this.offset.x = -px;
        // this.offset.y = -py
        // const tile = {
        //     row: Math.floor(py / this.cellSize),
        //     col: Math.floor(px / this.cellSize)
        // };
        let row = Math.floor(py / this.cellSize);
        let col = Math.floor(px / this.cellSize);

        let maxHorizontalCells = Math.ceil(this.screen.x / this.cellSize);
        let maxVerticalCells = Math.ceil(this.screen.y / this.cellSize);
        // console.log(maxHorizontalCells, maxVerticalCells);
        // console.log(this.screen.x / this.cellSize);
        // console.log(this.screen.y / this.cellSize);

        this.startTile.col = col - Math.floor(maxHorizontalCells / 2);
        this.startTile.row = row - Math.floor(maxVerticalCells / 2);

        // this.startTile.row = row - 1 - Math.ceil((this.screen.x / 2) / this.cellSize);
        // this.startTile.col = col - 1 - Math.ceil((this.screen.y) / this.cellSize);
        // debugger
        if (this.startTile.row < 0) this.startTile.row = 0;
        if (this.startTile.col < 0) this.startTile.col = 0;

        this.endTile.col = col + 1 + Math.ceil(maxHorizontalCells / 2);
        this.endTile.row = row + 1 + Math.ceil(maxVerticalCells / 2);

        // this.endTile.row = row + 1 + Math.ceil((this.screen.x / 2) / this.cellSize);
        // this.endTile.col = col + 1 + Math.ceil((this.screen.y) / this.cellSize);
        // debugger

        // debugger
        if (this.endTile.row > this.cellCount) this.endTile.row = this.cellCount;
        if (this.endTile.col > this.cellCount) this.endTile.col = this.cellCount;
    }

    render(grid) {
        // debugger
        for (let j = this.startTile.col; j < this.endTile.col; j++) {
            for (let i = this.startTile.row; i < this.endTile.row; i++) {
                grid[i][j].render(this.offset.x, this.offset.y);
            }
        }
    }
}

// class Camera {
//     constructor(width, height, gameWidth, gameHeight, cellCount) {
//         this.width = width / 2;
//         this.height = height / 2;

//         this.maxX = gameWidth - this.width;
//         this.maxY = gameHeight - this.height;

//         this.position = {
//             x: 0,
//             y: 0
//         };

//         this.cellCount = cellCount;

//         this.size = Math.ceil(720 / 25);

//         this.following = null;
//     }

//     worldToScreen(x, y) {
//         return { x: x - this.position.x, y: y - this.position.y };
//     }


//     screenToWorld(x, y) {
//         return { x: x + this.position.x, y: y + this.position.y };
//     }

//     follow(player) {
//         this.following = player;
//         // this.following.screenPosition = this.worldToScreen(this.following.position.x, this.following.position.y);
//         this.following.screenX = 0;
//         this.following.screenY = 0;
//     }

//     update() {
//         this.following.screenX = this.width / 2;
//         this.following.screenY = this.height / 2;
//         // this.following.screenPosition = this.worldToScreen(this.following.position.x, this.following.position.y);
//         // make the camera follow the sprite
//         this.position.x = this.following.screenX - this.width / 2;
//         this.position.y = this.following.screenY - this.height / 2;
//         // clamp values
//         this.position.x = Math.max(0, Math.min(this.position.x, this.maxX));
//         this.position.y = Math.max(0, Math.min(this.position.y, this.maxY));

//         // in map corners, the sprite cannot be placed in the center of the screen
//         // and we have to change its screen coordinates

//         // left and right sides
//         if (this.following.position.x < this.width / 2 ||
//             this.following.position.x > this.maxX + this.width / 2) {
//             this.following.screenX = this.following.position.x - this.position.x;
//         }
//         // top and bottom sides
//         if (this.following.position.y < this.height / 2 ||
//             this.following.position.y > this.maxY + this.height / 2) {
//             this.following.screenY = this.following.position.y - this.position.y;

//         }
//     }

//     render(grid) {
//         let startCol = Math.floor(this.position.x / this.size); // - 1;
//         let endCol = startCol + this.size; // + 1;
//         let startRow = Math.floor(this.position.y / this.size); // - 1;
//         let endRow = startRow + this.size; // + 1;

//         // startCol = clamp(startCol, 0, this.cellCount - 1);
//         // endCol = clamp(endCol, 0, this.cellCount - 1);
//         // startRow = clamp(startRow, 0, this.cellCount - 1);
//         // endRow = clamp(endRow, 0, this.cellCount - 1)

//         const offsetX = -this.position.x + startCol * this.size;
//         const offsetY = -this.position.y + startRow * this.size;

//         // debugger
//         for (let j = startCol; j < endCol; j++) {
//             for (let i = startRow; i < endRow; i++) {
//                 // debugger
//                 // if (j % 15 === 0) cc.fillStyle = "#f00";
//                 // else if ((i + j) % 2 === 0) cc.fillStyle = "#0f0";
//                 // else cc.fillStyle = "#00f";

//                 // // cc.fillRect(i * this.size, j * this.size, this.size, this.size);
//                 let x = (j - startCol) * this.size + offsetX;
//                 let y = (i - startRow) * this.size + offsetY;
//                 cc.fillStyle = grid[i][j].color;
//                 cc.fillRect(x, y, this.size, this.size);
//                 // grid[i][j].render(offsetX, offsetY);
//             }
//         }
//     }
// }

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
        window.grid = this.grid;
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

    render(offsetX, offsetY) {
        cc.fillStyle = this.color;
        // debugger
        cc.fillRect(this.position.x + offsetX, this.position.y + offsetY, this.size, this.size);
        cc.font = "10px Georgia";
        cc.fillStyle = "#fff";
        cc.fillText(`row: ${this.row}`, this.position.x + offsetX, this.position.y + offsetY + 7);
        cc.fillText(`col: ${this.col}`, this.position.x + offsetX, this.position.y + offsetY + this.size - 5);
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
    constructor(size, inputHandler, cellSize, cellCount) {
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

        this.cellSize = cellSize;
        this.cellCount = cellCount;
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
        // const maxX = this.size * 100 * 3 - (c.width - 10 * (c.width / 100));
        // const maxY = this.size * 100 * 3 - (c.height - 10 * (c.height / 100));
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.position.x = Math.max(0, Math.min(this.position.x, (this.cellCount) * this.cellSize));
        this.position.y = Math.max(0, Math.min(this.position.y, (this.cellCount) * this.cellSize));
        // this.screenX = this.position.x;
        // this.screenY = this.position.y;
        // console.log(this.screenX, this.screenY);postition.
    }

    render(offsetX, offsetY) {
        // console.log(this.position.x + offsetX, this.position.y + offsetY);
        // debugger
        cc.fillStyle = "#0ff";
        cc.beginPath();
        cc.arc(this.position.x + offsetX, this.position.y + offsetY, this.size, 0, Math.PI * 2)
        cc.closePath();
        cc.fill();
    }
}