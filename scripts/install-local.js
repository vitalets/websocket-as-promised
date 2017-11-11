/**
 * Installs self to `.installed` directory like from npm
 *
 * See: https://github.com/nicojs/node-install-local/issues/3
 */

const fs = require('fs');
const {LocalInstaller, progress} = require('install-local');

const TARGET_DIR = '.installed';
const DUMMY_PKG = `${TARGET_DIR}/package.json`;

installLocal()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

async function installLocal() {
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR);
  }
  if (!fs.existsSync(DUMMY_PKG)) {
    const content = JSON.stringify({name: 'dummy'});
    fs.writeFileSync(DUMMY_PKG, content, 'utf8');
  }
  const localInstaller = new LocalInstaller({
    [`./${TARGET_DIR}`]: ['.']
  });
  progress(localInstaller);
  await localInstaller.install();
}
