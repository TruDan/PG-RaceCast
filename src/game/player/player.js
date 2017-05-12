/**
 * Created by truda on 09/05/2017.
 */
const PIXI = require( 'pixi.js' );
const Entity = require('../level/entity');
const PIXIExtras = require('pixi-extra-filters');
//const keyboard = require('pixi-keyboard');
const $ = require('jquery');

const Direction = {
    INVALID: -1,
    NONE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

const TINTS = [
    [0xf44336,0xffcdd2,0xb71c1c],
    [0xE91E63,0xF8BBD0,0x880E4F],
    [0x9C27B0,0xE1BEE7,0x4A148C],
    [0x673AB7,0xD1C4E9,0x311B92],
    [0x3F51B5,0xC5CAE9,0x1A237E],
    [0x2196F3,0xBBDEFB,0x0D47A1],
    [0x03A9F4,0xB3E5FC,0x01579B],
    [0x00BCD4,0xB2EBF2,0x006064],
    [0x009688,0xB2DFDB,0x004D40],
    [0x4CAF50,0xC8E6C9,0x1B5E20],
    [0x8BC34A,0xDCEDC8,0x33691E],
    [0xCDDC39,0xF0F4C3,0x827717],
    [0xFFEB3B,0xFFF9C4,0xF57F17],
    [0xFFC107,0xFFECB3,0xFF6F00],
    [0xFF9800,0xFFE0B2,0xE65100],
    [0xFF5722,0xFFCCBC,0xBF360C],
    [0x795548,0xD7CCC8,0x3E2723],
    [0x9E9E9E,0xF5F5F5,0x212121],
    [0x607D8B,0xCFD8DC,0x263238]
];

const SPEED = 0.25;

module.exports = class Player extends Entity {
    constructor(game, level, id, dsUser=false) {
        super(level, 32, 32);
        this._id = id;
        this._game = game;
        this._dsUser = dsUser;

        if(this._dsUser)
            this._record = global.ds.record.getRecord( 'player/' + this._id );

        // public properties
        this.name = "";
        this.tint = this._getTint();

        this.isAlive = false;
        this._isMoving = false;
        this._direction = Direction.NONE;
        this._nextDirection = Direction.NONE;
    }

    respawn(x, y) {
        this.x = x;
        this.y = y;

        this.alpha = 1;

        this.isAlive = true;
        console.log("Spawned Player ", this._id, this.name, this.x, this.y);
    }

    move(direction) {
        if(this._direction === direction) {
            // Ignore, they're going that way anyway.
            return;
        }

        // Target direction is different to before, let's queue it.
        this._nextDirection = direction;
        this._isMoving = true;
    }

    kill() {
        if(!this.isAlive) return;
        this.isAlive = false;

        this._isMoving = false;
        this._direction = Direction.NONE;

        this.level.revokeAllClaims(this);

        console.log("Killed Player ", this._id, this.name, this.x, this.y);
        this.remove();
    }

    remove() {
        if(this._record !== undefined)
            this._record.delete();

        this.renderable = false;
        this._game._removeDebugInfo(this._debugPos);
        this.level.removePlayer(this);
        // this.destroy();
    }

    getCurrentCell() {
        return this.level.getCellPosFromPoint(this.x, this.y);
    }

    _canMove(targetX, targetY) {
        if(!this.isAlive) return;
        return (this.level.containsPoint(targetX, targetY));
    }

    _updateMove(dt) {
        if(!this.isAlive || !this._isMoving) return;

        // Only change their direction when fully in a grid cell
        let cellSize = this.level.cellSize;
        if((this.x - this.level.gridOffset.x) % cellSize === 0 && (this.y - this.level.gridOffset.y) % cellSize === 0) {
            this._direction = this._nextDirection;
        }

        if(this._direction === Direction.NONE || this._direction === Direction.INVALID)
            return;

        let movePoint = this._getDirectionPoint(this._direction);
        let targetX = this.x + (movePoint.x * SPEED * dt);
        let targetY = this.y + (movePoint.y * SPEED * dt);

        // normalise to cell pos
        var cellPos = this.getCurrentCell();

        if((this.y - this.level.gridOffset.y) % cellSize !== 0) {
            if (this._direction === Direction.UP) {
                targetY = Math.max(targetY, this.level.gridOffset.y + (cellPos.y) * this.level.cellSize);
            }
            else if (this._direction === Direction.DOWN) {
                targetY = Math.min(targetY, this.level.gridOffset.y + (cellPos.y + 1) * this.level.cellSize);
            }
        }

        if((this.x - this.level.gridOffset.x) % cellSize !== 0) {
            if (this._direction === Direction.LEFT) {
                targetX = Math.max(targetX, this.level.gridOffset.x + (cellPos.x) * this.level.cellSize);
            }
            else if (this._direction === Direction.DOWN) {
                targetX = Math.min(targetX, this.level.gridOffset.x + (cellPos.x + 1) * this.level.cellSize);
            }
        }

        if(this._canMove(targetX, targetY)) {
            this.x = Math.floor(targetX);
            this.y = Math.floor(targetY);

            this.level.claimCell(this);
        }
        else {
            // snap to nearest grid tile
            var cp = this.level.getCellPointFromPoint(this.x, this.y);
            this.x = cp.x;
            this.y = cp.y;
            this._direction = Direction.NONE;
        }
    }

    _checkClaimConditions() {
        if(!this.isAlive) return;

        if(!this.level.hasClaim(this)) {
            this._game.removePlayer(this._id);
        }
    }

    _getDirectionPoint(direction) {
        let x = 0, y = 0;
        if(direction === Direction.UP) {
            y = - 1;
        }
        else if(direction === Direction.DOWN) {
            y = 1;
        }
        else if(direction === Direction.LEFT) {
            x = - 1;
        }
        else if(direction === Direction.RIGHT) {
            x = 1;
        }
        return new PIXI.Point(x,y);
    }

    _checkCollision() {
        if(!this.isAlive) return;

         var cellPos = this.getCurrentCell();
         var cell = this.level.getCell(cellPos.x, cellPos.y);
         if(cell.trailOwner !== null && cell.trailOwner !== this) {
             cell.trailOwner.kill();
         }
    }

    _getTint() {
        return TINTS[ Math.floor(Math.random() * TINTS.length) % TINTS.length];
        var sum = 0, i;

        for( i = 0; i < this.name.length; i++ ) {
            sum += this.name.charCodeAt( i );
        }

        return TINTS[ sum % TINTS.length ];
    }

    _initDebug() {
        this._debugPos = new PIXI.Text("");
        this._game._addDebugInfo(this._debugPos);
    }

    _updateDebug() {
        var cellPoint = this.getCurrentCell();

        this._debugPos.style.fill = this.isAlive ? this.tint[1] : "rgb(255,32,32)";
        this._debugPos.text = "Player(" + this.name + ")\tPosition: (x: " + this.x + ", y: " + this.y + ") \tCell: (x: " + cellPoint.x + ", y: "+ cellPoint.y + ") [" + ((this.x - this.level.gridOffset.x) % this.level.cellSize) + "," + ((this.y - this.level.gridOffset.y) % this.level.cellSize) + "]" + (!this.isAlive ? "!!DEAD!!" : "");
    }

    _update(dt) {
        if(!this.isAlive) return;

        //this.width = 32;
        //this.height = 32;
        this._updateGraphics();
        this._updateDebug();

        // let's make sure the record is properly loaded
        if(this._dsUser && this._record.isReady === false ) {
            return;
        }

        // data contains the user's input. We'll be using it a lot, so let's get it once

        if(this._dsUser) {
            var data = this._record.get();

            this.name = data.name;

            if (data.active) {
                this.move(data.direction);
            }
        }

        this._updateMove(dt);
        this._checkCollision();
        this._checkClaimConditions();
    }

    _updateGraphics() {
        // update gfx position
        this._parts.label.text = this.name === "" ? "---" : this.name;
    }

    _initGraphics() {
        //this._stage.alpha = 0.5;
        var texture = PIXI.Texture.fromImage('/res/img/player.png');

        this._parts.body = new PIXI.Sprite(texture);
        this._parts.body.tint = this.tint[0];
        this._parts.body.height = this._width;
        this._parts.body.width = this._width;
        this._parts.body.anchor.x = 0.5;
        this._parts.body.anchor.y = 0.5;
        this._parts.body.position.x = this._width / 2;
        this._parts.body.position.y = this._height / 2;
        //this._parts.body.filters = [new PIXIExtras.GlowFilter(4, 2, 0, this.tint[2], 0.5)];
        this.addChild(this._parts.body);


        this._parts.caption = new PIXI.Container();
        this._parts.caption.width = 32;
        this._parts.caption.height = 30;
        this.addChild(this._parts.caption);

        this._parts.label = new PIXI.Text( this.name === "" ? "---" : this.name, {
            fontFamily: "Press Start 2P",
            fill: this.tint[1],
            fontSize: 12,
            align: 'center',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 3,
            dropShadowColor: this.tint[2],
            strokeThickness: 1,
            stroke: this.tint[2]

        });
        this._parts.label.anchor.x = 0.5;
        this._parts.label.anchor.y = 0;
        this._parts.label.position.x = this._width / 2;
        this._parts.label.position.y = this._height + 4;
        //this._text.alpha = 50;
        this._parts.caption.addChild(this._parts.label);
    }

};
