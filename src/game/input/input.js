/**
 * Created by truda on 10/05/2017.
 */
const PIXI = require('pixi.js');
const HotKey = require('./HotKey');
const KeyboardManager = require('./KeyboardManager');
const Key = require('./Key');

let keyboard = {
    KeyboardManager: KeyboardManager,
    Key: Key,
    HotKey: HotKey
};

if(!PIXI.keyboard){
    let keyboardManager = new KeyboardManager();
    keyboardManager.enable();

    PIXI.keyboard = keyboard;
    PIXI.keyboardManager = keyboardManager;
}

module.exports = keyboard;
