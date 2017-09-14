const server = require('../server');
const {createWSP} = require('../helper');

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
});

afterEach(function () {
  return this.wsp.close();
});
