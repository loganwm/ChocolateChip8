
/**
 * Module dependencies.
 * 
 * If Redis server is hosted elsewhere update createClient accordingly!
 *
 */

var cc = require('chocolatechip8')

var app = require('http').createServer(handler)
  , path = require('path')
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(80);

function handler (request, response) {
console.log('request starting...');
     
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.htm';
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': 'text/html' });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
}

io.sockets.on('connection', function (socket)
{
	var rom = cc.loadROM("roms/pong.ch8")

	socket.emit('deliver-rom', rom);

	socket.on('my other event', function (data)
	{
		console.log(data);
	});
});

//var c8 = new cc.Chip8Emulator();
//var c8 = new cc.Chip8Emulator();
//console.log();
//c8.executeROM();
//cc.fuck();