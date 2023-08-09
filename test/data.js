import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from '../index.js'

test('data(key[, value])', () => {
  const processor = unified()

  assert.equal(
    processor.data('foo', 'bar'),
    processor,
    'should return self as setter'
  )

  assert.equal(processor.data('foo'), 'bar', 'should return data as getter')

  assert.equal(
    processor.data('toString'),
    null,
    'should not return own inherited properties.'
  )

  assert.deepEqual(
    processor.data(),
    {foo: 'bar'},
    'should return the memory without arguments'
  )

  assert.deepEqual(
    processor.data({baz: 'qux'}),
    processor,
    'should set the memory with just a value (#1)'
  )

  assert.deepEqual(
    processor.data(),
    {baz: 'qux'},
    'should set the memory with just a value (#2)'
  )
})
