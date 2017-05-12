/**
 * Created by truda on 12/05/2017.
 */

var PIXI = require("pixi.js");
const PIXIExtras = require('pixi-extra-filters');


module.exports = class Overlays extends PIXI.Container {
    constructor() {
        super();

        this.texts = [];
    }

    addText(text, x, y, size, color, shadow, duration) {
        var txt = this._createText(text, size, color, shadow);
        txt.position.x = x;
        txt.position.y = y;

        this.texts.push({
            text: txt,
            time: duration * 1000
        });

        this.addChild(txt);
    }

    _update(dt) {
        for(var i=0; i<this.texts.length; i++) {
            var node = this.texts[i];

            if(node.time < 0) {
                this.removeChild(node.text);
                this.texts.splice(i, 1);
            }
            else {
                node.time -= dt;
            }
        }
    }


    _createText(msg, size, color, shadow) {
        var text = new PIXI.Text(msg, {
            fontFamily: "Press Start 2P",
            fill: color,
            fontSize: size,
            align: 'center',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 4,
            dropShadowColor: shadow,
            strokeThickness: 4,
            stroke: shadow
        });

        text.anchor.x = 0.5;
        text.anchor.y = 0.5;

        return text;
    }

}