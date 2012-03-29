
/**
 * Module dependencies.
 * 
 * If Redis server is hosted elsewhere update createClient accordingly!
 *
 */

var cc = require('chocolatechip8');

//cc.hello();

var x = 10;
console.log(x.toString(16));

var c8 = new cc.Chip8Emulator();
//var c8 = new cc.Chip8Emulator();
c8.loadROM("roms/pong.ch8");
c8.executeROM();
//cc.fuck();