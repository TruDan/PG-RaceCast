/**
 * Created by truda on 10/05/2017.
 */

const PIXI = require( 'pixi.js' );
const State = require('./state');

module.exports = class Main extends State {
    constructor(game) {
        super(game);

    }

    onInit() {
        this._initTitle();

        this.count = 0;
        this.filterCount = 0;
    }

    onUpdate(msSinceLastFrame, currentTime) {
        this.count++;
        this.titleText.rotation = Math.sin(this.count / 10) * 0.02;
        this.titleText.scale.set(1 + Math.cos(this.count / 20) * 0.1);

        this.filterCount += 0.1;

        var matrix = this.filter.matrix;

        matrix[1] = Math.sin(this.filterCount) * 3;
        matrix[2] = Math.cos(this.filterCount);
        matrix[3] = Math.cos(this.filterCount) * 1.5;
        matrix[4] = Math.sin(this.filterCount / 3) * 2;
        matrix[5] = Math.sin(this.filterCount / 2);
        matrix[6] = Math.sin(this.filterCount / 4);
    }

    _initTitle() {
        // create a text object with a nice stroke
        this.titleText = new PIXI.Text('PaperCast', {
            fontWeight: 'bold',
            fontSize: 180,
            fontFamily: 'Arial',
            fill: '#cc00ff',
            align: 'center',
            stroke: '#FFFFFF',
            strokeThickness: 6,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 0,
        });

        // setting the anchor point to 0.5 will center align the text... great for spinning!
        this.titleText.anchor.set(0.5, 0.5);
        this.titleText.x = this.game.renderer.width / 2;
        this.titleText.y = this.game.renderer.height / 3;

        this.filter = new PIXI.filters.ColorMatrixFilter();
        this.filter.alpha = 0.5;

        this.titleText.filters = [this.filter];

        // Resume application update
        this._viewInternal.addChild(this.titleText);



        this.roomCodeText = new PIXI.Text("Room Code\n" + this.game.id, {
            fontWeight: 'bold',
            fontSize: 100,
            fontFamily: 'Arial',
            fill: '#03A9F4',
            align: 'center',
            stroke: '#B3E5FC',
            strokeThickness: 3,
            dropShadow: true,
            dropShadowColor: '#0091EA',
            dropShadowBlur: 3,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 0,
        });
        this.roomCodeText.anchor.set(0.5);
        this.roomCodeText.x = this.game.renderer.width / 2;
        this.roomCodeText.y = (this.game.renderer.height / 3) * 2;
        this._viewInternal.addChild(this.roomCodeText);


    }
};