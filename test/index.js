'use strict'

/* eslint-disable import/no-unassigned-import */
require('./core')
require('./freeze')
require('./data')
require('./use')
require('./parse')
require('./run')
require('./stringify')
require('./process')

var asyncfunctions = false

try {
  eval('typeof async function() {}') // eslint-disable-line no-eval
  asyncfunctions = true
} catch (error) {}

console.log('asyncfunctions:', asyncfunctions)
if (asyncfunctions) {
  require('./async-function')
}

/* eslint-enable import/no-unassigned-import */
