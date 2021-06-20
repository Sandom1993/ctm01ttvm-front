const debug = process.argv.indexOf('--debug') > -1;
if (debug) {
  require('debug').enable('eslint:*,-eslint:code-path');
}
require('eslint/lib/cli').execute(process.argv);
