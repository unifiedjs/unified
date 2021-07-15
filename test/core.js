import test from 'tape'
import {unified} from '../index.js'

test('unified()', (t) => {
  /** @type {number} */
  let count

  t.throws(
    () => {
      // @ts-expect-error: `use` does not exist on frozen processors.
      unified.use(() => {})
    },
    /Cannot call `use` on a frozen processor/,
    'should be frozen'
  )

  const processor = unified()

  t.equal(typeof processor, 'function', 'should return a function')

  processor.use(function () {
    count++
    this.data('foo', 'bar')
  })

  count = 0
  const otherProcessor = processor().freeze()

  t.equal(
    count,
    1,
    'should create a new processor implementing the ancestral processor when called (#1)'
  )

  t.equal(
    otherProcessor.data('foo'),
    'bar',
    'should create a new processor implementing the ancestral processor when called (#2)'
  )

  t.end()
})
