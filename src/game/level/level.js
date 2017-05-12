/**
 * Created by truda on 10/05/2017.
 */
const Cell = require('./cell');
const PIXI = require('pixi.js');
const Viewport = require('./viewport');
const Overlays = require('./overlays');

var fill = require('flood-fill');
var zero = require('zeros');

const defaultOptions = {
    rows: 64,
    cols: 64,

    borderWidth: 32,
    cellSize: 32,
    cellLineColor: 0x909090
};

module.exports = class Level {
    constructor(game, options) {
        this._game = game;
        this.options = extend(defaultOptions, options);

        this.rows = this.options.rows;
        this.cols = this.options.cols;
        this.cellSize = this.options.cellSize;
        this.borderWidth = this.options.borderWidth;

        this.width = (this.cols * this.cellSize) + (2*this.borderWidth);
        this.height = (this.rows * this.cellSize) + (2*this.borderWidth);

        this.gridOffset = new PIXI.Point(this.borderWidth, this.borderWidth);

        this._parts = {
            grid: new PIXI.Graphics(),
            cells: new PIXI.Container(),
            players: new PIXI.Container(),
            overlays: new Overlays()
        };

        this.options = null;
        this.cells = [];

        this.players = [];

        this.viewport = new Viewport(this._game);
        this.viewport.contentView.addChild(this._parts.grid, this._parts.cells, this._parts.players, this._parts.overlays);

        this.view = this.viewport.view;

        this.init();
    }

    init() {
        this._initCells();
        this._drawGrid();
    };


    updateClaims(player) {
        var cols = this.cols + 2;
        var rows = this.rows + 2;


        var grid = zero([cols, rows]); // +2 here so we can use the empty region outside!

        for(var x = 0; x < cols; x++) {
            for(var y = 0; y < rows; y++) {
                if(x === cols-1 || y === rows-1 || x === 0 || y === 0) {
                    grid.set(x,y,1);
                }
                else {
                    var cell = this.getCell(x-1, y-1);
                    if (cell.owner === null || cell.owner !== player) {
                        grid.set(x, y, 1);
                    }
                }
            }
        }

        fill(grid, 0, 0, 2);

        var c = 0;
        // Now inverse the fill, and this is the players claimed area.
        for(var x = 1; x < cols; x++) {
            for(var y = 1; y < rows; y++) {
                if(grid.get(x,y) !== 2) {
                    var cell = this.getCell(x-1, y-1);
                    if(cell.owner !== player) c++;
                    cell.claim(player);
                }
            }
        }
        return c;
    }

    revokeAllClaims(player) {
        for(var x = 0; x < this.cols; x++) {
            for(var y = 0; y < this.rows; y++) {
                var cell = this.getCell(x,y);
                if(cell.owner === player) {
                    cell.unclaim();
                }
                if(cell.trailOwner === player) {
                    cell.untrail();
                }
            }
        }
        this.updateClaims(player);
    }

    hasClaim(player) {
        for(var x = 0; x < this.cols; x++) {
            for(var y = 0; y < this.rows; y++) {
                var cell = this.getCell(x,y);
                if(cell.owner === player) {
                    return true;
                }
            }
        }
        return false;
    }

    countClaims(player) {
        var i = 0;
        for(var x = 0; x < this.cols; x++) {
            for(var y = 0; y < this.rows; y++) {
                var cell = this.getCell(x,y);
                if(cell.owner === player) {
                    i++;
                }
            }
        }
        return i;
    }

    _claimTrail(player) {
        var c = 0;
        for(var x = 0; x < this.cols; x++) {
            for(var y = 0; y < this.rows; y++) {
                var cell = this.getCell(x,y);
                if(cell.trailOwner === player && cell.owner !== player) {
                    c++;
                    cell.claim(player);
                }
            }
        }
        return c;
    }

    claimCell(player) {
        if(!player.isAlive) return;

        var p = this.getCellPosFromPoint(player.x, player.y);
        var cell = this.getCell(p.x, p.y);

        if(cell === null) return;

        if(cell.owner === player) {
            // Check player claims
            var c = 0;
            cell.claim(player);
            c += this._claimTrail(player);
            c += this.updateClaims(player);

            if(c > 0) {
                this._parts.overlays.addText("+" + c, player.x, player.y - 50, 25, player.tint[0], player.tint[2], 0.5);
            }
        }
        else if(cell.trailOwner !== null && cell.trailOwner !== player) {
            this._parts.overlays.addText(cell.trailOwner.name + " Eliminated!", cell.trailOwner.x, cell.trailOwner.y - 50, 25, player.tint[0], player.tint[2], 0.75);
            cell.trailOwner.kill();
        }
        cell.trail(player);
    }

    addPlayer(player) {
        var x = Math.floor((this.cols * 0.7) * Math.random()) + Math.floor(this.cols * 0.15);
        var y = Math.floor((this.rows * 0.7) * Math.random()) + Math.floor(this.rows * 0.15);
        var pos = this.getPointFromCell(x, y);

        this.players.push(player);

        this._parts.players.addChild(player);

        this.viewport.addEntity(player);
        this.viewport.trackEntity(player);

        player.respawn(pos.x, pos.y);

        // Claim a 3x3
        for(var i=-1;i<=1;i++) {
            for(var j=-1;j<=1;j++) {
                var cell = this.getCell(x + i, y + j);
                cell.claim(player);
            }
        }


        player._initDebug();
    }

    removePlayer(player) {
        for( var i = 0; i < this.players.length; i++ ) {
            if( this.players[i]._id === player._id ) {
                var p = this.players[i];
                this.players.splice( i, 1 );
                p.kill();

                this.viewport.removeEntity(player);
                this.viewport.untrackEntity(player);

                this._parts.players.removeChild(player);
            }
        }
    }

    getCell(x, y) {
        if(x >= this.cols || x < 0 || y >= this.rows || y < 0) {
            return null;
        }

        return this.cells[(x * this.rows) + y];
    }

    getPointFromCell(x,y) {
        return new PIXI.Point(this.gridOffset.x + (x * this.cellSize), this.gridOffset.y + (y * this.cellSize));
    }

    getCellPosFromPoint(x, y) {
        return new PIXI.Point(Math.floor((x-this.gridOffset.x)/this.cellSize), Math.floor((y-this.gridOffset.y)/this.cellSize));
    }

    getCellPointFromPoint(x, y) {
        return new PIXI.Point(Math.floor((x-this.gridOffset.x)/this.cellSize)*this.cellSize+this.gridOffset.x, Math.floor((y-this.gridOffset.y)/this.cellSize)*this.cellSize+this.gridOffset.y);
    }

    containsPoint(x, y) {
        return(x >= this.gridOffset.x && y >= this.gridOffset.y && x <= this.gridOffset.x + ((this.cols-1) * this.cellSize) && y <= this.gridOffset.y + ((this.rows-1) * this.cellSize));
    }

    _drawGrid() {
        this._parts.grid.clear();

        // draw borders
        var hw = this.borderWidth/2;
        this._parts.grid.lineStyle(this.borderWidth, 0x111111, 0.8);
        this._parts.grid.moveTo(hw,hw);
        this._parts.grid.lineTo(hw,this.height-hw);
        this._parts.grid.lineTo(this.width-hw,this.height-hw);
        this._parts.grid.lineTo(this.width-hw,hw);
        this._parts.grid.lineTo(hw,hw);
    }

    _initCells() {
        for(var x=0;x<this.cols;x++) {
            for(var y=0;y<this.rows;y++) {
                var cell = new Cell(this, x, y, this.cellSize);
                this.cells[(x * this.rows) + y] = cell;
                this._parts.cells.addChild(cell);
                this.viewport.addEntity(cell);
            }
        }
    }

    _update(dt) {
        this._parts.overlays._update(dt);
        this.viewport._update(dt);
    }
};

function extend (obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function (source) {
        if (source) {
            for (var prop in source) {
                if (typeof source[prop] !== "undefined" && source[prop].constructor === Object) {
                    if (typeof obj[prop] === "undefined" || obj[prop].constructor === Object) {
                        obj[prop] = obj[prop] || {};
                        this.extend(obj[prop], source[prop]);
                    } else {
                        obj[prop] = source[prop];
                    }
                } else {
                    obj[prop] = source[prop];
                }
            }
        }
    });
    return obj;
}