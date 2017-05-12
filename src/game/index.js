/**
 * Created by truda on 09/05/2017.
 */
const Debug = require('./debug');
const Game = require( './game' );
const loader = require( './loader' );

// Entry to the app. Loads all assets and creates the game
loader.load(window.location.hostname + ':3002', () => {
    //document.body.aBackground = new Background(window.document.getElementById('background_container'));
    //document.body.aGame = new Game(window.document.getElementById('game_container'));
    document.body._debug = new Debug();

});