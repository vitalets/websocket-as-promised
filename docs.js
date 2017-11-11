/**
 * Generates markdown by JSDoc and inserts into README.md between '## API' and  '## Changelog'
 */

const fs = require('fs');
const jsdoc2md = require('jsdoc-to-markdown');

const FILENAME = 'README.md';
const REGEXP = /(## API\s+)([^]+)(## Changelog)/;
const JSDOC_OPTIONS = {
  files: 'src/**',
  'heading-depth': 3
};

insertApiDocs()
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

async function insertApiDocs() {
  const apiDocs = await jsdoc2md.render(JSDOC_OPTIONS);
  const oldContent = fs.readFileSync(FILENAME, 'utf8');
  if (!REGEXP.test(oldContent)) {
    throw new Error(`Can not match ${FILENAME} with regexp: ${REGEXP}`);
  }
  const newContent = oldContent.replace(REGEXP, `$1${apiDocs}$3`);
  if (newContent !== oldContent) {
    fs.writeFileSync(FILENAME, newContent, 'utf8');
    console.log(`Changes written to ${FILENAME}`);
  } else {
    console.log(`No changes in ${FILENAME}`);
  }
}
