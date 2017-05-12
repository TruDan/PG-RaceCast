/**
 * Created by truda on 09/05/2017.
 */
const PIXI = require( 'pixi.js' );
const Background = require( './ui/background' );
const Player = require('./player/player');
const Level = require('./level/level');
const keyboard = require('./input/input');
const EventEmitter = require( 'events' ).EventEmitter;

const MainStage = require('./states/main');
const GameStage = require('./states/game');

module.exports = class Game extends EventEmitter{
    /**
     * Creates the game
     *
     * @param   {DOMelement} element the container the game will live in
     *
     * @constructor
     */
    constructor(element) {
        super();
        this._element = element;

        this.isDebug = false;

        this.players = [];
        this.renderer = PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, {
            transparent: false,
            antialias: true,
            autoResize: true,
            resolution: window.devicePixelRatio
        });
        this.renderer.backgroundColor = 0x212121;

        var _this = this;
        window.onresize = function(e) {
            //_this.renderer.view.style.width = window.innerWidth + "px";
            //_this.renderer.view.style.height = window.innerHeight + "px";
            _this.renderer.resize(window.innerWidth, window.innerHeight);
        };

        this.id = this.makeid();

        this.layers = {
            bg: new PIXI.Container(),
            game: new PIXI.Container(),
            ui: new PIXI.Container(),
            debug: new PIXI.Container()
        };

        this.background = new Background(this);
        //this.background._viewInternal.width = this.renderer.width;
       //this.background._viewInternal.height = this.renderer.height;
        this.layers.bg.addChild(this.background._viewInternal);

        this.layers.bg.alpha = 0.4;


        this.activeStage = null;

        this.rootStage = new PIXI.Container();
        //this.rootStage.addChild(this.layers.bg);
        this.rootStage.addChild(this.layers.bg, this.layers.game, this.layers.ui);

        this._element.append( this.renderer.view );

        this._lastFrameTime = 0;

        this._initDebug();

        this.level = new Level(this);
        this.init();

        global.ds.event.listen( 'status/' + this.id + '/.*', this._playerOnlineStatusChanged.bind( this ) );

        this.start();

        requestAnimationFrame(this._tick.bind( this ));
    }

    setDebug(debug) {
        if(debug === undefined) {
            debug = !this.isDebug;
        }

        if(debug !== this.isDebug) {
            this.isDebug = debug;
            if(debug) {
                this.rootStage.addChild(this.layers.debug);
            }
            else {
                this.rootStage.removeChild(this.layers.debug);
            }
        }
    }

    makeid()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        for( var i=0; i < 4; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    init() {
        this.mainStage = new MainStage(this);
        this.gameStage = new GameStage(this);

        this.mainStage._init();
        this.gameStage._init();
    }

    start() {
        this.activateStage(this.mainStage);
        //this.activateStage(this.gameStage);
    }

    /**
     * Callback for listen. Is invoked whenever a player connects
     * or disconnects
     *
     * @param   {String}  match        name of the event, e.g. status/mike
     * @param   {Boolean} isSubscribed true if the player connected, false if disconnected
     *
     * @private
     * @returns {void}
     */
    _playerOnlineStatusChanged( match, isSubscribed ) {
        // Extract the player name from the status event
        var id = match.replace( 'status/' + this.id + '/', '' );

        if( isSubscribed ) {
            this.addPlayer( id, true );
        } else {
            this.removePlayer( id );
        }
    }

    activateStage(stage) {
        if(this.activeStage !== null) {
            this.activeStage._deactivate();
            this.layers.game.removeChild(this.activeStage._viewInternal);
        }

        this.layers.game.addChild(stage._viewInternal);
        stage._activate();
        this.activeStage = stage;
    }

    _verifyStage() {
        if(this.players.length === 0) {
            if(this.activeStage === this.gameStage) {
                this.activateStage(this.mainStage);
            }
        }
        else {
            if(this.activeStage === this.mainStage) {
                this.activateStage(this.gameStage);
            }
        }
    }

    addPlayer( id , dsUser =false) {
        var p = new Player( this, this.level, id, dsUser );
        this.players.push( p );
        this.level.addPlayer(p);
        console.log("Added player", p);
        this._verifyStage();
        return p;
    }

    removePlayer( id ) {
        for( var i = 0; i < this.players.length; i++ ) {
            var p = this.players[i];
            if( p._id === id ) {
                p.level.removePlayer(p);
                this.players.splice( i, 1 );
                console.log("Removed player", p);
            }
        }
        this._verifyStage();
    }

    _tick(currentTime) {

        var msSinceLastFrame = currentTime - this._lastFrameTime;
        this.emit( 'update', msSinceLastFrame/1000, currentTime );

        if(this.activeStage !== null) {
            this.activeStage._update(msSinceLastFrame, currentTime);
        }

        // store the time
        this._lastFrameTime = currentTime;

        this.background._tick(0);
        this._updateDebug();

        this.renderer.render( this.rootStage );

        requestAnimationFrame( this._tick.bind( this ) );
        PIXI.keyboardManager.update();
    }

    _initDebug() {
        this._debugInfoIndex = 0;
        this._debug = new PIXI.Container();
        this._debugTextStyle = {
            fontSize: 14,
            fontFamily: 'Courier New',
            fontStyle: 'bold',
            fill: 'rgb(255,255,255)',
            align : 'left',
            dropShadow: true,
            dropShadowAlpha: 0.5,
            dropShadowBlur: 1,
            dropShadowDistance: 1,
            strokeThickness: 2
        };
        this.layers.debug.addChild(this._debug);

        this._mouseDebug = new PIXI.Text("");
        this._addDebugInfo(this._mouseDebug);
    }

    _addDebugInfo(info) {
        this._debugInfoIndex += 20;
        this._debug.addChild(info);
        info.style = extend({}, this._debugTextStyle);
        info.position.x = 16;
        info.position.y = this._debugInfoIndex;
    }

    _removeDebugInfo(info) {
        this._debug.removeChild(info);
        this._reOrderDebug();
    }

    _reOrderDebug() {
        this._debugInfoIndex = 0;

        var children = this._debug.children;
        for(var i=0;i<children.length;i++) {
            this._debugInfoIndex += 20;
            children[i].position.y = this._debugInfoIndex;
        }
    }

    _updateDebug() {
        var mouse = this.renderer.plugins.interaction.mouse.global;
        var cellPos = this.level.getCellPosFromPoint(mouse.x, mouse.y);
        this._mouseDebug.text = "Cursor: (x: " + mouse.x + ", y: " + mouse.y + ") Cell: (x: " + cellPos.x + ", y: " + cellPos.y + ")";
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