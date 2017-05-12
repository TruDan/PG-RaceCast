/**
 * Created by truda on 11/05/2017.
 */

const PIXI = require('pixi.js');

module.exports = class Scoreboard extends PIXI.Graphics {

    constructor(level, width, height) {
        super();

        this._width = width;
        this._height = height;

        this.level = level;

        this._parts = {};

        this.scores = [];

        this._initGraphics();
    }

    addPlayer(player) {
        var sb = new ScoreboardItem(this, player);
        this.scores.push(sb);
        this.addChild(sb);
        return sb;
    }

    _updatePlayer(player) {
        var score = this.level.countClaims(player);

        for(var i=0; i < this.scores.length; i++) {
            var sbi = this.scores[i];
            if(sbi.player === player) {
                sbi.updateScore(score);
                return;
            }
        }

        var sb = this.addPlayer(player);
        sb.updateScore(score);
    }


    _update() {

        // update scores
        if(this.level.players.length > 0) {
            for (var i = 0; i < this.level.players.length; i++) {
                var player = this.level.players[i];
                this._updatePlayer(player);
            }
        }

        if (this.scores.length > 0) {
            for (var i = 0; i < this.scores.length; i++) {
                var p = this.scores[i].player;

                // in level
                var inLevel = false;
                for (var j = 0; j < this.level.players.length; j++) {
                    if (this.level.players[j] === p) {
                        inLevel = true;
                        break;
                    }
                }

                if (!inLevel) {
                    this._updatePlayer(p);
                }
            }

            // order by highest
            this.scores.sort(function (a, b) {
                return b.score - a.score
            });

            for (var i = 0; i < this.scores.length; i++) {
                var sb = this.scores[i];
                sb.y = 50 + (i * 40);
            }
        }
    }

    _initGraphics() {
        this.clear();
        this.lineStyle(0);
        this.beginFill(0x000000, 0.3);
        this.drawRect(0,0,this._width, this._height);
        this.endFill();

        this.lineStyle(4, 0x000000);
        this.moveTo(0,0);
        this.lineTo(this._width, 0);
        this.lineTo(this._width, this._height);
        this.lineTo(0, this._height);
        this.lineTo(0,0);

        this.lineStyle(0);
        this.beginFill(0x000000, 0.6);
        this.drawRect(0,0,this._width, 50);
        this.endFill();

        this._parts.header = new PIXI.Text("Top Scores", {
            fontFamily: "Press Start 2P",
            fill: 0xE0E0E0,
            fontSize: 18,
            align: 'left',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 3,
            dropShadowColor: 0x212121,
            strokeThickness: 1,
            stroke: 0x212121
        });

        this._parts.header.anchor.set(0.5,0.5);
        this._parts.header.position.x = this._width / 2;
        this._parts.header.position.y = 25;
        this.addChild(this._parts.header);
    }

};

class ScoreboardItem extends PIXI.Graphics {
    constructor(scoreboard, player) {
        super();

        this.scoreboard = scoreboard;
        this.player = player;

        this.name = "";
        this.isAlive = true;
        this.bgFill = 0x000000;
        this.textFill = 0x4DD0E1;
        this.shadowFill = 0x000000;
        this.score = 0;

        this._parts = {};
        this._initGraphics();
    }

    updateScore(newScore) {
        var update = false;

        if(this.score !== newScore) {
            update = true;
            this.score = newScore;
        }

        if(this.name !== this.player.name) {
            update = true;
            this.name = this.player.name;
        }

        if(this.isAlive !== this.player.isAlive) {
            update = true;

            this.isAlive = this.player.isAlive;
        }

        if(this.bgFill !== this.player.tint[0]) {
            update = true;

            this.bgFill = this.player.tint[0];
            this.textFill = this.player.tint[1];
            this.shadowFill = this.player.tint[2];
        }

        if(update) {
            this._drawGraphics();
        }
    }

    _drawGraphics() {
        this.clear();
        this.beginFill(this.bgFill, this.isAlive ? 0.5 : 0.05);
        this.drawRect(2,0, this.scoreboard._width-4, 40);
        this.endFill();

        this._parts.name.text = this.name;
        this._parts.score.text = this.score;

        this._parts.name.alpha = this.isAlive ? 1 : 0.5;
        this._parts.score.alpha = this.isAlive ? 1 : 0.5;

        this._parts.name.style.fill = this.textFill;
        this._parts.name.style.dropShadowColor = this.shadowFill;
        this._parts.name.style.stroke = this.shadowFill;

        this._parts.score.style.fill = this.textFill;
        this._parts.score.style.dropShadowColor = this.shadowFill;
        this._parts.score.style.stroke = this.shadowFill;
    }

    _initGraphics() {
        this.clear();

        this._parts.name = new PIXI.Text("", {
            fontFamily: "Press Start 2P",
            fill: this.textFill,
            fontSize: 14,
            align: 'left',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 3,
            dropShadowColor: this.shadowFill,
            strokeThickness: 1,
            stroke: this.shadowFill
        });

        this._parts.name.anchor.x = 0;
        this._parts.name.anchor.y = 0.5;
        this._parts.name.position.x = 10;
        this._parts.name.position.y = 22;

        this._parts.score = new PIXI.Text(0, {
            fontFamily: "Press Start 2P",
            fill: this.textFill,
            fontSize: 18,
            align: 'right',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 3,
            dropShadowColor: this.shadowFill,
            strokeThickness: 1,
            stroke: this.shadowFill
        });

        this._parts.score.anchor.x = 1;
        this._parts.score.anchor.y = 0.5;
        this._parts.score.position.x = this.scoreboard._width - 10;
        this._parts.score.position.y = 21;

        this.addChild(this._parts.name, this._parts.score);
    }


}