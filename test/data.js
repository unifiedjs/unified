'use strict'

var test = require('tape')
var unified = require('..')

test('data(key[, value])', function (t) {
  var processor = unified()

  t.equal(
    processor.data('foo', 'bar'),
    processor,
    'should return self as setter'
  )

  t.equal(processor.data('foo'), 'bar', 'should return data as getter')

  t.equal(
    processor.data('toString'),
    null,
    'should not return own inherited properties.'
  )

  t.deepEqual(
    processor.data(),
    {foo: 'bar'},
    'should return the memory without arguments'
  )

  t.deepEqual(
    processor.data({baz: 'qux'}),
    processor,
    'should set the memory with just a value (#1)'
  )

  t.deepEqual(
    processor.data(),
    {baz: 'qux'},
    'should set the memory with just a value (#2)'
  )

  t.end()
})
