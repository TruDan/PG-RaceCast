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

        this.trailOwner = null;
        this.trailFill = 0xffffff;
        this.trailJoin = {
            top: false,
            right: false,
            bottom: false,
            left: false
        };
    }

    claim(player) {
        this.owner = player;
        this.fill = player === null ? 0x777777 : player.tint[0];

        if(this.trailOwner === player) {
            this.untrail();
        }

        this.markDirty();
    }

    trail(player) {
        this.trailOwner = player;
        this.trailFill = player === null ? 0xffffff : player.tint[2];
        this.markDirty();

        // Mark connected cells
        for(var x=-1; x<=1; x++) {
            for(var y=-1; y<=1; y++) {
                var cell = this._getAdjacentCell(x, y);
                if(cell !== null && cell.trailOwner === this.trailOwner) {
                    this._joinTrail(cell);
                }
            }
        }

        if(this._countTrailJoins() > 0) return;

        for(var x=-1; x<=1; x++) {
            for(var y=-1; y<=1; y++) {
                var cell = this._getAdjacentCell(x, y);
                if(cell !== null && cell.owner === this.trailOwner) {
                    this._joinTrail(cell);
                }
            }
        }
    }

    untrail() {
        this.trailOwner = null;
        this._resetTrailJoins();
        this.markDirty();
    }

    _joinTrail(cell) {
        if(Math.abs(cell.row-this.row) === 1 ? !(Math.abs(cell.col-this.col) === 1) : Math.abs(cell.col-this.col) === 1) {
            if(!this._checkTrailJoins() || !cell._checkTrailJoins()) return;

            if(cell.row > this.row) {
                this.trailJoin.bottom = true;
                cell.trailJoin.top = true;
                this.markDirty();
                cell.markDirty();
            }
            else if(cell.row < this.row) {
                this.trailJoin.top = true;
                cell.trailJoin.bottom = true;
                this.markDirty();
                cell.markDirty();
            }

            if(cell.col > this.col) {
                this.trailJoin.right = true;
                cell.trailJoin.left = true;
                this.markDirty();
                cell.markDirty();
            }
            else if(cell.col < this.col) {
                this.trailJoin.left = true;
                cell.trailJoin.right = true;
                this.markDirty();
                cell.markDirty();
            }
        }
    }

    _resetTrailJoins() {
        this.trailJoin.top = false;
        this.trailJoin.right = false;
        this.trailJoin.bottom = false;
        this.trailJoin.left = false;
    }

    _countTrailJoins() {
        var i = 0;
        if(this.trailJoin.top) i++;
        if(this.trailJoin.right) i++;
        if(this.trailJoin.bottom) i++;
        if(this.trailJoin.left) i++;
        return i;
    }

    _checkTrailJoins() {
        return (this._countTrailJoins() < 2);
    }

    _getAdjacentCell(x,y) {
        return this.level.getCell(this.col-x, this.row-y);
    }

    unclaim() {
        this.claim(null);
    }

    _initGraphics() {

    }

    _drawGraphics() {
        this.clear();
        this.lineStyle(0.5, this.fill, 0.2);

        this.beginFill(this.fill, this.owner === null ? 0.1 : 1);
        this.drawRect(0, 0, 32, 32);
        this.endFill();

        if(this.trailOwner !== null && this.trailOwner !== this.owner) {
            this.lineStyle(0);
            this.beginFill(this.trailFill, this.trailOwner === null ? 0 : 1);
            this.drawRect(TRAIL_OUTLINE, TRAIL_OUTLINE, 32 - (2 * TRAIL_OUTLINE), 32 - (2 * TRAIL_OUTLINE));

            if (this.trailJoin.left) {
                this.drawRect(0, TRAIL_OUTLINE, TRAIL_OUTLINE, 32 - (2 * TRAIL_OUTLINE));
            }
            if (this.trailJoin.top) {
                this.drawRect(TRAIL_OUTLINE, 0, 32 - (2 * TRAIL_OUTLINE), TRAIL_OUTLINE);
            }
            if (this.trailJoin.right) {
                this.drawRect(32 - TRAIL_OUTLINE, TRAIL_OUTLINE, TRAIL_OUTLINE, 32 - (2 * TRAIL_OUTLINE));
            }
            if (this.trailJoin.bottom) {
                this.drawRect(TRAIL_OUTLINE, 32 - TRAIL_OUTLINE, 32 - (2 * TRAIL_OUTLINE), TRAIL_OUTLINE);
            }

            this.endFill();
        }
    }
};
