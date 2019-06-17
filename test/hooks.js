const server = require('./server');

const wspOptionsJson = {
  packMessage: data => JSON.stringify(data),
  unpackMessage: data => JSON.parse(data),
  attachRequestId: (data, requestId) => Object.assign({requestId}, data),
  extractRequestId: data => data && data.requestId,
};

before(function (done) {
  server.start(url => {
    this.url = url;
    done();
  });
});

after(function (done) {
  server.stop(() => done());
});

beforeEach(function () {
  this.wsp = createWSP(this.url);
  this.wspOptionsJson = wspOptionsJson;
});

afterEach(function () {
  return this.wsp.close();
});
