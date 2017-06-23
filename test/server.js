'use strict';

const WebSocketServer = require('websocket').server;
const http = require('http');

const server = http.createServer(function (request, response) {
  console.log((new Date()) + ' Received request for ' + request.url);
  response.writeHead(404);
  response.end();
});

server.listen(8080, function () {
  console.log((new Date()) + ' Server is listening on port 8080');
});

const wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: true
});

wsServer.on('connect', function (connection) {
  console.log((new Date()) + ' Connection accepted' + ' - Protocol Version ' + connection.webSocketVersion);
  connection.on('message', function (message) {
    if (message.type === 'utf8') {
      console.log('Received Message: ' + message.utf8Data);
      const data = JSON.parse(message.utf8Data);
      if (data.error) {
        // todo: trigger error
      } else {
        connection.sendUTF(message.utf8Data);
      }
    } else if (message.type === 'binary') {
      console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
      connection.sendBytes(message.binaryData);
    }
  });
});
