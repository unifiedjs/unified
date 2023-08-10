import {Buffer} from 'node:buffer'
import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {SimpleParser} from './util/simple.js'

test('process (compilers)', async function (t) {
  await t.test('should compile `string`', async function () {
    const processor = unified()
    const result = 'bravo'

    processor.Parser = SimpleParser
    processor.Compiler = function () {
      return result
    }

    const file = await processor.process('')

    assert.equal(file.value, result)
    assert.equal(file.result, undefined)
  })

  await t.test('should compile `buffer`', async function () {
    const processor = unified()
    const result = Buffer.from('bravo')

    processor.Parser = SimpleParser
    processor.Compiler = function () {
      return result
    }

    const file = await processor.process('')

    assert.equal(file.value, result)
    assert.equal(file.result, undefined)
  })

  await t.test('should compile `null`', async function () {
    const processor = unified()

    processor.Parser = SimpleParser
    processor.Compiler = function () {
      return null
    }

    const file = await processor.process('alpha')

    // To do: is this right?
    assert.equal(file.value, 'alpha')
    assert.equal(file.result, undefined)
  })

  await t.test('should compile non-text', async function () {
    const processor = unified()
    const result = {
      _owner: null,
      type: 'p',
      ref: null,
      key: 'h-1',
      props: {children: ['bravo']}
    }

    processor.Parser = SimpleParser
    processor.Compiler = function () {
      return result
    }

    const file = await processor.process('alpha')

    assert.equal(file.value, 'alpha')
    assert.equal(file.result, result)
  })
})
