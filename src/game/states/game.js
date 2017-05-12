/**
 * Created by truda on 10/05/2017.
 */

const PIXI = require( 'pixi.js' );
const State = require('./state');
const Scoreboard = require('../ui/scoreboard');
const Level = require('../level/level');
const Viewport = require('../level/viewport');
const Paused = require('../states/paused');

module.exports = class Game extends State {
    constructor(game) {
        super(game);


        this.isPaused = false;
        this._parts = {};

    }

    setPaused(paused) {
        if(paused === undefined) {
            paused = !this.isPaused;
        }

        if(this.isPaused !== paused) {
            this.isPaused = paused;
            if (paused) {
                this._viewInternal.addChild(this._parts.paused);
            }
            else {
                this._viewInternal.removeChild(this._parts.paused);
            }
        }
    }

    onInit() {
        //this._viewInternal.backgroundColor = 0x000000;
        //this.game.level._viewInternal.pivot.set(0.5);
        //this._viewInternal.addChild(this.game.level._viewInternal);

        this.game.level.viewport.setPosition(75,150);
        this.game.level.viewport.setSize(this.game.renderer.width - (2*75) - 300, this.game.renderer.height - (3*75));

        this.scoreboard = new Scoreboard(this.game.level, 300, this.game.renderer.height - (3*75) - 150);
        this.scoreboard.x = this.game.renderer.width - 75 - 300;
        this.scoreboard.y = 150;

        this._parts.paused = new Paused(this.game.level.view);
        this._parts.paused.x = 75;
        this._parts.paused.y = 150;
        this._parts.paused.width = this.game.level.viewport.width;
        this._parts.paused.height = this.game.level.viewport.height;

        this._parts.title = new PIXI.Text("PaperCast", {
            fontFamily: "Press Start 2P",
            fill: 0xCDDC39,
            fontSize: 75,
            align: 'center',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 3,
            dropShadowColor: 0x827717,
            strokeThickness: 3,
            stroke: 0x827717
        });
        this._parts.title.anchor.set(0.5,0.5);
        this._parts.title.x = 50 + (this.game.renderer.width - 400)/2;
        this._parts.title.y = 75;

        this._parts.gameId = new PIXI.Text(this.game.id, {
            fontFamily: "Press Start 2P",
            fill: 0x00BCD4,
            fontSize: 75,
            align: 'center',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 3,
            dropShadowColor: 0x006064,
            strokeThickness: 3,
            stroke: 0x006064
        });

        this._parts.gameId.anchor.set(0.5,0.5);
        this._parts.gameId.x = this.game.renderer.width-75-150;
        this._parts.gameId.y = 75;

        this._parts.brandName = new PIXI.Text("PikaGames", {
            fontFamily: "Press Start 2P",
            fill: 0x00E5FF,
            fontSize: 24,
            align: 'center',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 3,
            dropShadowColor: 0x006064,
            strokeThickness: 1,
            stroke: 0x006064
        });
        this._parts.brandName.anchor.set(0.5,1);
        this._parts.brandName.x = this.game.renderer.width - 75 - 150;
        this._parts.brandName.y = this.game.renderer.height - 75 - 75;

        this._parts.brandUrl = new PIXI.Text("www.pika.games", {
            fontFamily: "Press Start 2P",
            fill: 0x00B8D4,
            fontSize: 14,
            align: 'center',
            dropShadow: true,
            dropShadowAlpha: 1,
            dropShadowDistance: 3,
            dropShadowColor: 0x006064,
            strokeThickness: 1,
            stroke: 0x006064
        });
        this._parts.brandUrl.anchor.set(0.5,0);
        this._parts.brandUrl.x = this.game.renderer.width - 75 - 150;
        this._parts.brandUrl.y = this.game.renderer.height - 75 - 65;

        this._viewInternal.addChild(this.game.level.view, this.scoreboard, this._parts.title, this._parts.gameId, this._parts.brandName, this._parts.brandUrl);
    }

    onUpdate(dt) {
        if(!this.isPaused) {
            this.game.level._update(dt);
        }
        else {
            this._parts.paused._update(dt);
        }

        this.scoreboard._update(dt);
    }

};