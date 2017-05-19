/**
 * Created by truda on 10/05/2017.
 */
const Entity = require('./entity');
var PIXI = require("pixi.js");

const TRAIL_OUTLINE = 5;

module.exports = class Cell extends Entity {
    constructor(level, col, row, size) {
        super(level, 32, 32);

        this.col = col;
        this.row = row;

        this.position.x = this.level.gridOffset.x + (this.col * size);
        this.position.y = this.level.gridOffset.y + (this.row * size);

        this.fill = 0x777777;
        this.owner = null;

        this.friction = -0.05;
        this._texture = "grass.png";
    }

    _getAdjacentCell(x,y) {
        return this.level.getCell(this.col-x, this.row-y);
    }

    _initGraphics() {

    }

    _drawGraphics() {
        var sprite = PIXI.Sprite.fromImage('/res/img/' + this._texture);

        this.clear();

        this.addChild(sprite);

        this.lineStyle(0.5, this.fill, 0.2);

        this.beginFill(this.fill, this.owner === null ? 0.1 : 1);
        this.drawRect(0, 0, 32, 32);
        this.endFill();
    }
};
