'use strict'

var test = require('tape')
var unified = require('..')

test('unified()', function (t) {
  var count
  var processor
  var otherProcessor

  t.throws(
    function () {
      unified.use(Function.prototype)
    },
    /Cannot invoke `use` on a frozen processor/,
    'should be frozen'
  )

  processor = unified()

  t.equal(typeof processor, 'function', 'should return a function')

  processor.use(function () {
    count++
    this.data('foo', 'bar')
  })

  count = 0
  otherProcessor = processor().freeze()

  t.equal(
    count,
    1,
    'should create a new processor implementing the ancestral processor when invoked (#1)'
  )

  t.equal(
    otherProcessor.data('foo'),
    'bar',
    'should create a new processor implementing the ancestral processor when invoked (#2)'
  )

  t.end()
})
