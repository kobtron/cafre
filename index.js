// Game server and content server.
var WebSocketServer = require('websocket').server;
var http = require('http');
var finalhandler = require('finalhandler');
var serveStatic = require('serve-static');
const hostname = '127.0.0.1';
const port = 3000;
var game = require("./game");

function process(events) {
   var r = game.update(events);
   return r;
}

var serve = serveStatic('content');

const server = http.createServer((req, res) => {
   serve(req, res, finalhandler(req, res));
});

server.listen(port, hostname, () => {
  console.log(`Cafre Server running at http://${hostname}:${port}/`);
});

wsServer = new WebSocketServer({
  httpServer: server
});

wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      var instructions = process(JSON.parse(message.utf8Data));
      connection.sendUTF(JSON.stringify(instructions));
    }
  });

  connection.on('close', function(connection) {
  });
});
