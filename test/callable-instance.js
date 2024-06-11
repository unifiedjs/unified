import assert from 'node:assert/strict'
import test from 'node:test'
import {CallableInstance} from '../lib/callable-instance.js'

test('callable-instance', async function (t) {
  await t.test('can invoke ES6 class', async function () {
    class Es6Class extends CallableInstance {
      constructor() {
        super('copy')

        /** @type {number} */
        this.foo = 42
        /** @type {number} */
        this.bar = 0
      }

      /** @returns {Es6Class} */
      copy() {
        const destination = new Es6Class()
        destination.foo = this.foo
        destination.bar = this.bar
        return destination
      }
    }

    const instance = new Es6Class()
    assert.strictEqual(instance.foo, 42)

    instance.bar = 100

    // Instance is callable
    /** @type {Es6Class} */
    const copied = instance()
    assert.strictEqual(copied.foo, 42)
    assert.strictEqual(copied.bar, 100)
  })

  await t.test('can invoke new (ES5 class)', async function () {
    function Es5Class() {
      /** @type {Function} */
      const callableInstance = CallableInstance
      return callableInstance.call(this, ['copy'])
    }

    Es5Class.prototype.foo = 42 // type-coverage:ignore-line
    Es5Class.prototype.bar = 0 // type-coverage:ignore-line

    // type-coverage:ignore-next-line
    Es5Class.prototype.copy = function () {
      const destination = new Es5Class()
      destination.foo = this.foo
      destination.bar = this.bar
      return destination
    }

    const instance = new Es5Class()
    assert.strictEqual(instance.foo, 42)

    /** @type {number} */
    instance.bar = 100

    // Instance is callable
    /** @type {Es5Class} */
    // @ts-ignore
    const copied = instance()
    assert.strictEqual(copied.foo, 42)
    assert.strictEqual(copied.bar, 100)
  })
})
