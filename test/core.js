import test from 'tape'
import {unified} from '../index.js'

test('unified()', (t) => {
  let count

  t.throws(
    () => {
      unified.use(Function.prototype)
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
