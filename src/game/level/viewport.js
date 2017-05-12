/**
 * Created by truda on 10/05/2017.
 */

var PIXI = require("pixi.js");

module.exports = class Viewport {
    constructor(game, width, height) {
        this.game = game;

        this.contentView = new PIXI.Container();

        this.view = new PIXI.Container();
        this.view.addChild(this.contentView);

        this.width = width || 800;
        this.height = height || 600;

        this.mask = new PIXI.Graphics();
        this.contentView.mask = this.mask;

        this.zoom = 1;
        this.camera = new PIXI.Point(0,0);

        this.entities = [];
        this.tracking = [];

        this.trackEntities = true;
        this.trackBound = new PIXI.Rectangle(100, 100, this.width-200, this.height-200);

        this.contentView.pivot.set(this.contentView/2, this.contentView/2);

        //this.contentWidth = this.width;
        //this.contentHeight = this.height;

        this._initBorder();
        this._drawBorder();
        this.__updateMask();

        this._initDebug();
    }

    setPosition(x,y) {
        this.view.position.set(x,y);
        this.mask.position.set(x,y);
        this.trackBound = new PIXI.Rectangle(x+100, x+100, this.width-200, this.height-200);
        this.__updateMask();
    }

    setSize(width,height) {
        this.width = width;
        this.height = height;
        this.trackBound = new PIXI.Rectangle(100, 100, this.width-200, this.height-200);
        this._drawBorder();
        this.__updateMask();

        this.centerCamera();
    }

    trackEntity(entity) {
        this.tracking.push(entity);
    }

    untrackEntity(entity) {
        this.tracking.splice(this.tracking.indexOf(entity), 1);
    }

    addEntity(entity) {
        this.entities.push(entity);
        entity.__initGraphics();
        entity.__drawGraphics();
    }

    removeEntity(entity) {
        this.entities.splice(this.entities.indexOf(entity), 1);
    }

    pointCamera(x,y) {
        this.camera.x = x * this.zoom;
        this.camera.y = y * this.zoom;
        this.__updateCamera();
    }

    centerCamera() {
        this.pointCamera(this.contentView.width/2, this.contentView.height/2)
    }

    moveCamera(x,y) {
        this.camera.x += x;
        this.camera.y += y;
        this.__updateCamera();
    }

    zoomCamera(zoom) {
        this.zoom += zoom;
        this.__updateCamera();
    }

    isPointVisible(x,y) {
        return this.view.getLocalBounds().contains(x, y);
    }

    _fixContentPosition() {

    }


    __isEntityVisible(entity) {
        var bounds = this.view.getLocalBounds();
        return bounds.contains(entity.x, entity.y);
    }

    __updateMask() {
        this.mask.clear();
        this.mask.lineStyle(0);
        this.mask.beginFill(0xffffff, 1);
        this.mask.moveTo(this.view.position.x,this.view.position.y);
        this.mask.lineTo(this.width + this.view.position.x, this.view.position.y);
        this.mask.lineTo(this.width + this.view.position.x, this.height + this.view.position.y);
        this.mask.lineTo(this.view.position.x, this.height + this.view.position.y);
        this.mask.endFill();
    }

    __updateCamera() {
        this.contentView.scale.set(this.zoom);
        this.contentView.position.set(-this.camera.x + (this.width/2), -this.camera.y + (this.height/2));
    }

    __updateEntities(dt) {
        for(var i=0;i<this.entities.length;i++) {
            var e = this.entities[i];
            //console.log(bounds, e.position, bounds.contains(e.position.x, e.position.y));
            var x1 = (e.x * this.zoom) + this.contentView.x;
            var y1 = (e.y * this.zoom) + this.contentView.y;
            var x2 = x1 + e.width;
            var y2 = y1 + e.height;
            e.renderable = (
                (x1 > 0 || x2 > 0) && (y1 > 0 || y2 > 0) && (x1 < this.width || x2 < this.width) && (y1 < this.height || y2 < this.height)
            );
            e.__update(dt);
        }
    }

    _update(dt) {
        this._updateDebug();

        this.__updateEntities(dt);

        if(this.trackEntities) {
            if(this.tracking.length > 0) {

                var minX=0, minY=0, maxX=0, maxY=0;
                for(var i=0;i<this.tracking.length;i++) {
                    var p = this.tracking[i];

                    if(i === 0 || p.x < minX) minX = p.x;
                    if(i === 0 || p.y < minY) minY = p.y;
                    if(i === 0 || p.x > maxX) maxX = p.x;
                    if(i === 0 || p.y > maxY) maxY = p.y;
                }

                minX -= 100;
                maxX += 100;
                minY -= 100;
                maxY += 100;

                // fit that region on screen
                var w = maxX-minX;
                var h = maxY-minY;

                if(w < this.trackBound.width) {
                    var diff = (this.trackBound.width - w)/2;
                    minX -= diff;
                    maxX += diff;
                    w = maxX-minX;
                }

                if(h < this.trackBound.height) {
                    var diff = (this.trackBound.height-h)/2;
                    minY -= diff;
                    maxY += diff;
                    h = maxY-minY;
                }

                // targetWidth, targetHeight

                // get scale factor for zoom
                var sfX = 1/(w/this.trackBound.width);
                var sfY = 1/(h/this.trackBound.height);

                var sf = Math.min(sfX, sfY).toFixed(2);
                this.zoom = sf;
                this.pointCamera(maxX-(w/2), maxY-(h/2));

                //if(!this.trackBound.contains(p.x, p.y)) {
                   // this.pointCamera(p.x, p.y);
               // }
            }
            else {
               // this.pointCamera(this.game.level.width/2,  this.game.level.height/2);
            }
        }
    }

    _initBorder() {
        this.gfx = new PIXI.Graphics();
        this.view.addChild(this.gfx);
    }

    _drawBorder() {
        this.gfx.clear();
        this.gfx.lineStyle(4, 0x000000);
        this.gfx.moveTo(0,0);
        this.gfx.lineTo(this.width, 0);
        this.gfx.lineTo(this.width, this.height);
        this.gfx.lineTo(0, this.height);
        this.gfx.lineTo(0,0);
    }

    _initDebug() {
        this.debugText = new PIXI.Text("ViewPort");
        this.game._addDebugInfo(this.debugText);
    }

    _updateDebug() {
        this.debugText.text = "ViewPort(" + this.width + "," + this.height + ") - Camera (x: " + this.camera.x + ", y: " + this.camera.y + ") - ContentPos: (x: " + this.contentView.x + ", y: " + this.contentView.y + ") Zoom: " + this.zoom;
    }
};