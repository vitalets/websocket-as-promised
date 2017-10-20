// todo: make this a separate project!

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
    autoAcceptConnections: false
  });

  wsServer.on('request', function (request) {
    const query = request.resourceURL.query;
    if (query.delay) {
      setTimeout(() => request.accept(), query.delay);
    } else if (query.reject) {
      request.reject();
    } else {
      request.accept();
    }
  });

  wsServer.on('connect', function (connection) {
    connection.on('message', function (message) {
      if (message.type === 'utf8') {
        handleString(connection, message);
      } else if (message.type === 'binary') {
        handleBinary(connection, message);
      } else {
        throw new Error(`Unknown message type: ${message.type}`);
      }
    });
  });

  getPort().then(port => {
    server.listen(port, function () {
      const url = `ws://localhost:${port}`;
      callback(url);
    });
  });

  function handleString(connection, message) {
    let data;
    try {
      data = JSON.parse(message.utf8Data);
    } catch(e) {
      connection.sendUTF(message.utf8Data);
      return;
    }
    handleJSON(connection, data, message);
  }

  function handleJSON(connection, data, message) { // eslint-disable-line complexity
    if (data.nonJSONResponse) {
      connection.sendUTF('non JSON response');
    } else if (data.noId) {
      delete data.id;
      connection.sendUTF(JSON.stringify(data));
    } else if (data.noResponse) {
      // nothing
    } else if (data.delay) {
      setTimeout(() => connection.sendUTF(message.utf8Data), data.delay);
    } else if (data.error) {
      throw new Error(data.error);
    } else if (data.close) {
      connection.close(data.code, data.reason);
    } else if (data.drop) {
      connection.drop();
    } else {
      connection.sendUTF(message.utf8Data);
    }
  }

  function handleBinary(connection, message) {
    connection.sendBytes(message.binaryData);
  }
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
