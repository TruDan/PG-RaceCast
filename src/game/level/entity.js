/**
 * Created by truda on 11/05/2017.
 */

var PIXI = require("pixi.js");

module.exports = class Entity extends PIXI.Graphics {
    constructor(level, width, height) {
        super();
        this.level = level;

        this.width = width;
        this.height = height;

        this._parts = {};
        this._dirty = true;
    }

    markDirty() {
        this._dirty = true;
    }

    _update() {}
    _initGraphics() {}
    _drawGraphics() {}

    __update(dt) {
        this._update(dt);
        this.__drawGraphics();
    }

    __initGraphics() {
        this._initGraphics();
    }

    __drawGraphics() {
        if(this._dirty) {
            this._dirty = false;
            this._drawGraphics();

        }
    }

};