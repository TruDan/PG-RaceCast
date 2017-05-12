/**
 * Created by truda on 10/05/2017.
 */

const PIXI = require( 'pixi.js' );

module.exports = class Background {
    constructor(game) {
        this.game = game;
        this._viewInternal = new PIXI.Container();

        // Constants
        this.numStars = 1000;

        // Init stars
        this.stars = [];
        for(var i=0; i<this.numStars; i++) {
            var s = this._createStar();
            this.stars.push(s);
            this._viewInternal.addChild(s);
        }
    }

    _tick() {

        var time = Date.now() / 1000;
        for (var i=0; i < this.numStars; ++i) {
            var s = this.stars[i];
            var freq = i/this.numStars;
            var ampl = i*this.numStars;
            s.alpha = freq * Math.sin(time + ampl);
        }
    }

    _createStar() {
        var s = new PIXI.Sprite(PIXI.Texture.WHITE);
        s.width = 8;
        s.height = 8;
        var scale = Math.random() * 1.2;
        s.position.x = Math.random() * this.game.renderer.width;
        s.position.y = Math.random() * this.game.renderer.height;
        s.alpha = Math.random();
        s.scale.x = scale;
        s.scale.y = scale;
        return s;
    }
};
