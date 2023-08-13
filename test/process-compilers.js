import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'
import {simpleParser} from './util/simple.js'

test('process (compilers)', async function (t) {
  await t.test('should compile `string`', async function () {
    const processor = unified()
    const result = 'bravo'

    processor.Parser = simpleParser
    processor.Compiler = function () {
      return result
    }

    const file = await processor.process('')

    assert.equal(file.value, result)
    assert.equal(file.result, undefined)
  })

  await t.test('should compile `Uint8Array`', async function () {
    const processor = unified()
    const result = new Uint8Array([0xef, 0xbb, 0xbf, 0x61, 0x62, 0x63])

    processor.Parser = simpleParser
    processor.Compiler = function () {
      return result
    }

    const file = await processor.process('')

    assert.equal(file.value, result)
    assert.equal(file.result, undefined)
  })

  await t.test('should compile `null`', async function () {
    const processor = unified()

    processor.Parser = simpleParser
    processor.Compiler = function () {
      return null
    }

    const file = await processor.process('alpha')

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

    processor.Parser = simpleParser

    // @ts-expect-error: custom node, which should be registered!.
    processor.Compiler = function () {
      return result
    }

    const file = await processor.process('alpha')

    assert.equal(file.value, 'alpha')
    assert.equal(file.result, result)
  })
})
