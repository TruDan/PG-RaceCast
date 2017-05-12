/**
 * Created by truda on 12/05/2017.
 */

const PIXI = require('pixi.js');

module.exports = class Paused extends PIXI.Graphics {
    constructor() {
        super();

        this._parts = {};

        this.init = false;
        this._initGraphics();
        this._drawGraphics();
    }

    _update() {
        if(!this.init) {
            this._drawGraphics();
            this.init = true;
        }
        this._parts.title.position.x = this._width /2;
        this._parts.title.position.y = this._height /2;
    }

    _drawGraphics() {
        this.clear();
        this.beginFill(0x000000, 0.75);
        this.drawRect(0, 0, this._width, this._height);
        this.endFill();

    }

    _initGraphics() {
        this.clear();

        this._parts.title = new PIXI.Text("Paused", {
            fontFamily: "Press Start 2P",
            fill: 0x00BCD4,
            fontSize: 48,
            align: 'right',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 3,
            dropShadowColor: 0x006064,
            strokeThickness: 3,
            stroke: 0x006064
        });

        this._parts.title.anchor.x = 0.5;
        this._parts.title.anchor.y = 0.5;
        this._parts.title.position.x = this._width /2;
        this._parts.title.position.y = this._height /2;

        this.addChild(this._parts.title);
    }

}