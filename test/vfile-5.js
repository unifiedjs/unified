'use strict'

var test = require('tape')
var simple = require('./util/simple.js')
var unified = require('..')

test('vfile@5', async function (t) {
  t.plan(2)

  var pipeline = unified().use(function () {
    this.Parser = simple.Parser
    this.Compiler = () => 'bravo'
  })
  var {VFile} = await import('vfile5')
  var file = new VFile('alpha')

  pipeline.processSync(file)

  t.equal(
    file.value,
    'bravo',
    'should set `file.value` when a vfile@5 is passed'
  )
  t.equal(
    file.contents,
    'bravo',
    'should also set `file.contents` when a vfile@5 is passed'
  )
})
