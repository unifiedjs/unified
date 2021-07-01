'use strict'

/* eslint-disable import/no-unassigned-import */
require('./core.js')
require('./freeze.js')
require('./data.js')
require('./use.js')
require('./parse.js')
require('./run.js')
require('./stringify.js')
require('./process.js')
require('./vfile-5.js')

var asyncfunctions = false

try {
  eval('typeof async function() {}') // eslint-disable-line no-eval
  asyncfunctions = true
} catch (_) {}

console.log('asyncfunctions:', asyncfunctions)
if (asyncfunctions) {
  require('./async-function.js')
}

/* eslint-enable import/no-unassigned-import */
