const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

global.assert = chai.assert;
global.noop = () => {};
global.wait = ms => new Promise(r => setTimeout(r, ms));
