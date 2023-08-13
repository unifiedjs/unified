import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'

test('core', async function (t) {
  await t.test('should expose the public api', async function () {
    assert.deepEqual(Object.keys(await import('unified')).sort(), ['unified'])
  })

  await t.test('should expose a frozen processor', async function () {
    assert.throws(function () {
      unified.use(function () {})
    }, /Cannot call `use` on a frozen processor/)
  })

  await t.test(
    'should create a new processor implementing the ancestral processor when called',
    async function () {
      let count = 0

      const processor = unified().use(function () {
        count++
        this.data('foo', 'bar')
      })

      const otherProcessor = processor().freeze()

      assert.equal(count, 1)
      assert.deepEqual(otherProcessor.data(), {foo: 'bar'})
    }
  )
})
