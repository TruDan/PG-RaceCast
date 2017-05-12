/**
 * Created by truda on 09/05/2017.
 */
const deepstream = require( 'deepstream.io-client-js' );
const PIXI = require( 'pixi.js' );

/**
 * This class loads all required images into
 * PIXI's texture cache so that they're available when
 * needed within the game
 *
 * In parallel it also establishes a connection to the deepstream server
 */
class Loader{

    /**
     * Creates the loader and adds the initial set of bitmap images
     *
     * @private
     * @returns {void}
     */
    constructor() {
        this._connectionReady = false;
        this._imagesReady = false;
        this._fontsReady = false;
        //this._imagesReady = true;
        this._callback = null;

        // Create the image loader and add the initial assets
        this._assetLoader = new PIXI.loaders.Loader();
        this._assetLoader.add( 'player', '/res/img/player.png' );

        var _this = this;
        window.WebFontConfig = {
            google: {
                families: ['Press+Start+2P']
            },

            active: function() {
                // do something
                _this._onFontsLoaded();
            }
        };

        var wf = document.createElement('script');
        wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
            '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);

        // Once all images are loaded, check if we're good to go
        this._assetLoader.once( 'complete', this._onImagesLoaded.bind( this ) );
    }

    /**
     * Starts the loading process
     *
     * @param   {String}   deepstreamUrl host:port for the deepstream server
     * @param   {Function} callback      Will be invoked once everything has been loaded
     *
     * @public
     * @returns {void}
     */
    load( deepstreamUrl, callback ) {
        this._callback = callback;
        this._assetLoader.load();
        global.ds = deepstream( deepstreamUrl ).login( null, this._onLoggedIn.bind( this ) );
    }

    /**
     * Callback once all images have loaded
     *
     * @private
     * @returns {void}
     */
    _onImagesLoaded() {
        this._imagesReady = true;
        this._checkReady();
    }

    _onFontsLoaded() {
        this._fontsReady = true;
        this._checkReady();
    }

    /**
     * Callback once the connection to the deepstream server
     * is established and authenticated
     *
     * @private
     * @returns {void}
     */
    _onLoggedIn() {
        this._connectionReady = true;
        this._checkReady();
    }

    /**
     * Invokes the callback once both images and deepstream
     * connection are ready
     *
     * @private
     * @returns {void}
     */
    _checkReady() {
        if(
            this._connectionReady &&
            this._fontsReady &&
            this._imagesReady
        ) {
            this._callback();
        }
    }
}

module.exports = new Loader();