import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'

test('unified()', () => {
  /** @type {number} */
  let count

  assert.throws(
    () => {
      // @ts-expect-error: `use` does not exist on frozen processors.
      unified.use(() => {})
    },
    /Cannot call `use` on a frozen processor/,
    'should be frozen'
  )

  const processor = unified()

  assert.equal(typeof processor, 'function', 'should return a function')

  processor.use(function () {
    count++
    this.data('foo', 'bar')
  })

  count = 0
  const otherProcessor = processor().freeze()

  assert.equal(
    count,
    1,
    'should create a new processor implementing the ancestral processor when called (#1)'
  )

  assert.equal(
    otherProcessor.data('foo'),
    'bar',
    'should create a new processor implementing the ancestral processor when called (#2)'
  )
})
