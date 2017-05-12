/**
 * Created by truda on 10/05/2017.
 */

const PIXI = require( 'pixi.js' );

module.exports = class State {
    constructor(game) {
        this.game = game;
        this.isActive = false;
        this._viewInternal = new PIXI.Container();
    }

    onInit() {}
    onActivate() {}
    onDeactivate() {}
    onUpdate(dt) {}

    _init() {
        this.onInit();
    }

    _activate() {
        this.isActive = true;
        this.onActivate();
    }

    _deactivate() {
        this.isActive = false;
        this.onDeactivate();
    }

    _update(msSinceLastFrame, currentTime) {
        this.onUpdate(msSinceLastFrame);
    }

};