'use strict';

const WebSocketServer = require('websocket').server;
const http = require('http');
const getPort = require('get-port');

let server;
let wsServer;

exports.start = function (callback) {
  server = http.createServer(function (request, response) {
    response.writeHead(404);
    response.end();
  });

  wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: true
  });

  wsServer.on('connect', function (connection) {
    connection.on('message', function (message) {
      if (message.type === 'utf8') {
        const data = JSON.parse(message.utf8Data);
        if (data.error) {
          // todo: trigger error
        } else {
          connection.sendUTF(message.utf8Data);
        }
      } else if (message.type === 'binary') {
        connection.sendBytes(message.binaryData);
      }
    });
  });

  getPort().then(port => {
    server.listen(port, function () {
      const url = `ws://localhost:${port}`;
      callback(url);
    });
  });
};

exports.stop = function (callback) {
  wsServer.shutDown();
  server.close(callback);
};

// useful for debug
if (!module.parent) {
  exports.start(url => {
    console.log(`WebSocket started on url: ${url}`);
  });
}
