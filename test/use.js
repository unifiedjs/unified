import assert from 'node:assert/strict'
import test from 'node:test'
import {unified} from 'unified'

test('`use`', async function (t) {
  const givenOptions = {alpha: 'bravo', charlie: true, delta: 1}
  const otherOptions = {echo: [1, 2, 3], foxtrot: {golf: 1}}
  const givenOptionsList = [1, 2, 3]
  const otherOptionsList = [1, 4, 5]
  const mergedOptions = {...givenOptions, ...otherOptions}

  await t.test('should ignore no value', function () {
    const processor = unified()
    assert.equal(processor.use(), processor)
  })

  await t.test('should ignore `undefined`', function () {
    const processor = unified()
    assert.equal(processor.use(undefined), processor)
  })

  await t.test('should ignore `null`', function () {
    const processor = unified()
    assert.equal(processor.use(null), processor)
  })

  await t.test('should throw when given invalid values (`false`)', function () {
    assert.throws(function () {
      // @ts-expect-error: check how the runtime handles `false`.
      unified().use(false)
    }, /Expected usable value, not `false`/)
  })

  await t.test(
    'should throw when given invalid values (`true`)',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles `true`.
        unified().use(true)
      }, /Expected usable value, not `true`/)
    }
  )

  await t.test(
    'should throw when given invalid values (`string`)',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles `string`s.
        unified().use('alfred')
      }, /Expected usable value, not `alfred`/)
    }
  )

  await t.test('should support a plugin', function () {
    const processor = unified()
    let called = false

    processor
      .use(function () {
        assert.equal(this, processor)
        assert.equal(arguments.length, 0)
        called = true
      })
      .freeze()

    assert(called)
  })

  await t.test('should support a plugin w/ options', function () {
    const processor = unified()
    let called = false

    processor
      .use(function (options) {
        assert.equal(this, processor)
        assert.equal(options, givenOptions)
        assert.equal(arguments.length, 1)
        called = true
      }, givenOptions)
      .freeze()

    assert(called)
  })

  await t.test('should support a list of plugins', function () {
    const processor = unified()
    let calls = 0

    processor
      .use([
        function () {
          assert.equal(this, processor)
          assert.equal(arguments.length, 0)
          calls++
        },
        function () {
          assert.equal(this, processor)
          assert.equal(arguments.length, 0)
          calls++
        }
      ])
      .freeze()

    assert.equal(calls, 2)
  })

  await t.test('should support a list w/ a single plugin', function () {
    const processor = unified()
    let called = false

    processor
      .use([
        function () {
          assert.equal(this, processor)
          assert.equal(arguments.length, 0)
          called = true
        }
      ])
      .freeze()

    assert(called)
  })

  await t.test('should support a list of tuples and plugins', function () {
    const processor = unified()
    let calls = 0

    processor
      .use([
        [
          /**
           * @param {unknown} options
           */
          function (options) {
            assert.equal(options, givenOptions)
            calls++
          },
          givenOptions
        ],
        [
          function () {
            calls++
          }
        ]
      ])
      .freeze()

    assert.equal(calls, 2)
  })

  await t.test(
    'should throw when given invalid values (`false`) in lists',
    function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles `false`.
        unified().use([false])
      }, /Expected usable value, not `false`/)
    }
  )

  await t.test(
    'should throw when given invalid values (`true`) in lists',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles `true`.
        unified().use([true])
      }, /Expected usable value, not `true`/)
    }
  )

  await t.test(
    'should throw when given invalid values (`string`) in lists',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how the runtime handles `string`.
        unified().use(['alfred'])
      }, /Expected usable value, not `alfred`/)
    }
  )

  await t.test('should attach transformers', function () {
    const processor = unified()
    let called = false

    processor
      .use(function () {
        return function () {
          called = true
        }
      })
      .freeze()

    processor.runSync({type: 'test'})

    assert.equal(called, true)
  })

  await t.test(
    'should throw when given a preset w/ invalid `plugins` (`false`)',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how invalid `plugins` is handled.
        unified().use({plugins: false})
      }, /Expected a list of plugins, not `false`/)
    }
  )

  await t.test(
    'should throw when given a preset w/ invalid `plugins` (`object`)',
    async function () {
      assert.throws(function () {
        // @ts-expect-error: check how invalid `plugins` is handled.
        unified().use({plugins: {foo: true}})
      }, /Expected a list of plugins, not `\[object Object]`/)
    }
  )

  await t.test(
    'should throw when given a preset w/o `settings` or `plugins`',
    async function () {
      assert.throws(function () {
        unified().use({}).freeze()
      }, /Expected usable value but received an empty preset/)
    }
  )

  await t.test('should support a preset w/ empty `plugins`', function () {
    const processor = unified().use({plugins: []}).freeze()
    assert.equal(processor.attachers.length, 0)
  })

  await t.test('should support a preset w/ empty `settings`', function () {
    const processor = unified().use({settings: {}}).freeze()
    assert.deepEqual(processor.data(), {settings: {}})
  })

  await t.test('should support a preset w/ a plugin', function () {
    let called = false
    const processor = unified()
      .use({plugins: [plugin]})
      .freeze()

    assert.equal(processor.attachers.length, 1)
    assert.ok(called)

    function plugin() {
      called = true
    }
  })

  await t.test('should support a preset w/ plugins', function () {
    let calls = 0
    const processor = unified()
      .use({plugins: [plugin1, plugin2]})
      .freeze()

    assert.equal(processor.attachers.length, 2)
    assert.equal(calls, 2)

    function plugin1() {
      calls++
    }

    function plugin2() {
      calls++
    }
  })

  await t.test('should support a preset w/ settings', function () {
    assert.deepEqual(
      unified()
        .use({settings: {foo: true}})
        .freeze()
        .data(),
      {settings: {foo: true}}
    )
  })

  await t.test('should support presets w/ settings and merge', function () {
    assert.deepEqual(
      unified()
        .use({settings: {foo: true, bar: true}})
        .use({settings: {qux: true, foo: false}})
        .data(),
      {settings: {foo: false, bar: true, qux: true}}
    )
  })

  await t.test('should support extending presets', function () {
    let calls = 0
    const processor = unified()
      .use({settings: {alpha: true}, plugins: [plugin1, plugin2]})
      .freeze()
    const otherProcessor = processor().freeze()

    assert.equal(processor.attachers.length, 2)
    assert.equal(otherProcessor.attachers.length, 2)
    assert.deepEqual(otherProcessor.data(), {settings: {alpha: true}})
    assert.equal(calls, 4)

    function plugin1() {
      calls++
    }

    function plugin2() {
      calls++
    }
  })

  await t.test('should support a preset w/ plugin tuples', function () {
    const one = {}
    const two = {}
    const processor = unified()
      .use({
        plugins: [
          [plugin1, one],
          [plugin2, two]
        ]
      })
      .freeze()
    const otherProcessor = processor().freeze()

    assert.equal(processor.attachers.length, 2)
    assert.equal(otherProcessor.attachers.length, 2)

    /**
     * @param {unknown} options
     */
    function plugin1(options) {
      assert.equal(options, one)
    }

    /**
     * @param {unknown} options
     */
    function plugin2(options) {
      assert.equal(options, two)
    }
  })

  await t.test('should support presets w/ presets', function () {
    const one = {}
    const two = {}
    const processor = unified()
      .use({
        plugins: [{plugins: [[plugin1, one]]}, {plugins: [[plugin2, two]]}]
      })
      .freeze()
    const otherProcessor = processor().freeze()

    assert.equal(processor.attachers.length, 2)
    assert.equal(otherProcessor.attachers.length, 2)

    /**
     * @param {unknown} options
     */
    function plugin1(options) {
      assert.equal(options, one)
    }

    /**
     * @param {unknown} options
     */
    function plugin2(options) {
      assert.equal(options, two)
    }
  })

  await t.test('reconfigure (to `object`)', async function (t) {
    await t.test(
      'should reconfigure plugins: nothing -> `object`, right wins',
      async function () {
        let calls = 0

        unified().use(change).use(change, givenOptions).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} [options]
         */
        function change(options) {
          assert.equal(options, givenOptions)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `undefined` -> `object`, right wins',
      async function () {
        let calls = 0

        unified().use(change, undefined).use(change, givenOptions).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptions)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `null` -> `object`, right wins',
      async function () {
        let calls = 0

        unified().use(change, null).use(change, givenOptions).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptions)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `false` -> `object`, right wins',
      async function () {
        let calls = 0

        unified().use(change, false).use(change, givenOptions).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptions)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `true` -> `object`, right wins',
      async function () {
        let calls = 0

        unified().use(change, true).use(change, givenOptions).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptions)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `string` -> `object`, right wins',
      async function () {
        let calls = 0

        unified().use(change, 'this').use(change, givenOptions).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptions)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `array` -> `object`, right wins',
      async function () {
        let calls = 0

        unified()
          .use(change, givenOptionsList)
          .use(change, givenOptions)
          .freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptions)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `object` -> `object`, merge',
      async function () {
        let calls = 0

        unified().use(change, givenOptions).use(change, otherOptions).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          // Deep, not strict, equal expected.
          assert.deepEqual(options, mergedOptions)
          calls++
        }
      }
    )
  })

  await t.test('reconfigure (to `array`)', async function (t) {
    await t.test(
      'should reconfigure plugins: nothing -> `array`, right wins',
      async function () {
        let calls = 0

        unified().use(change).use(change, givenOptionsList).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} [options]
         */
        function change(options) {
          assert.equal(options, givenOptionsList)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `undefined` -> `array`, right wins',
      async function () {
        let calls = 0

        unified().use(change, undefined).use(change, givenOptionsList).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptionsList)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `null` -> `array`, right wins',
      async function () {
        let calls = 0

        unified().use(change, null).use(change, givenOptionsList).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptionsList)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `false` -> `array`, right wins',
      async function () {
        let calls = 0

        unified().use(change, false).use(change, givenOptionsList).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptionsList)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `true` -> `array`, right wins',
      async function () {
        let calls = 0

        unified().use(change, true).use(change, givenOptionsList).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptionsList)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `string` -> `array`, right wins',
      async function () {
        let calls = 0

        unified().use(change, 'this').use(change, givenOptionsList).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptionsList)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `array` -> `array`, right wins',
      async function () {
        let calls = 0

        unified()
          .use(change, givenOptionsList)
          .use(change, otherOptionsList)
          .freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, otherOptionsList)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `object` -> `array`, right wins',
      async function () {
        let calls = 0

        unified()
          .use(change, givenOptions)
          .use(change, givenOptionsList)
          .freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, givenOptionsList)
          calls++
        }
      }
    )
  })

  await t.test('reconfigure (to `string`)', async function (t) {
    await t.test(
      'should reconfigure plugins: nothing -> `string`, right wins',
      async function () {
        let calls = 0

        unified().use(change).use(change, 'x').freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} [options]
         */
        function change(options) {
          assert.equal(options, 'x')
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `undefined` -> `string`, right wins',
      async function () {
        let calls = 0

        unified().use(change, undefined).use(change, 'x').freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, 'x')
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `null` -> `string`, right wins',
      async function () {
        let calls = 0

        unified().use(change, null).use(change, 'x').freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, 'x')
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `false` -> `string`, right wins',
      async function () {
        let calls = 0

        unified().use(change, false).use(change, 'x').freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, 'x')
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `true` -> `string`, right wins',
      async function () {
        let calls = 0

        unified().use(change, true).use(change, 'x').freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, 'x')
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `string` -> `string`, right wins',
      async function () {
        let calls = 0

        unified().use(change, 'this').use(change, 'x').freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, 'x')
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `array` -> `string`, right wins',
      async function () {
        let calls = 0

        unified().use(change, givenOptionsList).use(change, 'x').freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, 'x')
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `object` -> `string`, right wins',
      async function () {
        let calls = 0

        unified().use(change, givenOptions).use(change, 'x').freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, 'x')
          calls++
        }
      }
    )
  })

  await t.test('reconfigure (to `undefined`)', async function (t) {
    await t.test(
      'should reconfigure plugins: nothing -> `undefined`, right wins',
      async function () {
        let calls = 0

        unified().use(change).use(change, undefined).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} [options]
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `undefined` -> `undefined`, right wins',
      async function () {
        let calls = 0

        unified().use(change, undefined).use(change, undefined).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `null` -> `undefined`, right wins',
      async function () {
        let calls = 0

        unified().use(change, null).use(change, undefined).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `false` -> `undefined`, right wins',
      async function () {
        let calls = 0

        unified().use(change, false).use(change, undefined).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `true` -> `undefined`, right wins',
      async function () {
        let calls = 0

        unified().use(change, true).use(change, undefined).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `string` -> `undefined`, right wins',
      async function () {
        let calls = 0

        unified().use(change, 'this').use(change, undefined).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `array` -> `undefined`, right wins',
      async function () {
        let calls = 0

        unified().use(change, givenOptionsList).use(change, undefined).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `object` -> `undefined`, right wins',
      async function () {
        let calls = 0

        unified().use(change, givenOptions).use(change, undefined).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )
  })

  await t.test('reconfigure (to `true`, to turn on)', async function (t) {
    await t.test(
      'should reconfigure plugins: nothing -> `true`, used',
      async function () {
        let calls = 0

        unified().use(change).use(change, true).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} [options]
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `undefined` -> `true`, used',
      async function () {
        let calls = 0

        unified().use(change, undefined).use(change, true).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `null` -> `true`, used',
      async function () {
        let calls = 0

        unified().use(change, null).use(change, true).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `false` -> `true`, used',
      async function () {
        let calls = 0

        unified().use(change, false).use(change, true).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `true` -> `true`, used',
      async function () {
        let calls = 0

        unified().use(change, true).use(change, true).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `string` -> `true`, used',
      async function () {
        let calls = 0

        unified().use(change, 'this').use(change, true).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `array` -> `true`, used',
      async function () {
        let calls = 0

        unified().use(change, givenOptionsList).use(change, true).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `object` -> `true`, used',
      async function () {
        let calls = 0

        unified().use(change, givenOptions).use(change, true).freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} options
         */
        function change(options) {
          assert.equal(options, undefined)
          calls++
        }
      }
    )
  })

  await t.test('reconfigure (to `false`, to turn off)', async function (t) {
    await t.test(
      'should reconfigure plugins: nothing -> `false`, not used',
      async function () {
        let calls = 0

        unified().use(change).use(change, false).freeze()

        assert.equal(calls, 0)

        /**
         * @param {unknown} [_]
         */
        function change(_) {
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `undefined` -> `false`, not used',
      async function () {
        let calls = 0

        unified().use(change, undefined).use(change, false).freeze()

        assert.equal(calls, 0)

        /**
         * @param {unknown} [_]
         */
        function change(_) {
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `null` -> `false`, not used',
      async function () {
        let calls = 0

        unified().use(change, null).use(change, false).freeze()

        assert.equal(calls, 0)

        /**
         * @param {unknown} [_]
         */
        function change(_) {
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `false` -> `false`, not used',
      async function () {
        let calls = 0

        unified().use(change, false).use(change, false).freeze()

        assert.equal(calls, 0)

        /**
         * @param {unknown} [_]
         */
        function change(_) {
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `true` -> `false`, not used',
      async function () {
        let calls = 0

        unified().use(change, true).use(change, false).freeze()

        assert.equal(calls, 0)

        /**
         * @param {unknown} [_]
         */
        function change(_) {
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `string` -> `false`, not used',
      async function () {
        let calls = 0

        unified().use(change, 'this').use(change, false).freeze()

        assert.equal(calls, 0)

        /**
         * @param {unknown} [_]
         */
        function change(_) {
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `array` -> `false`, not used',
      async function () {
        let calls = 0

        unified().use(change, givenOptionsList).use(change, false).freeze()

        assert.equal(calls, 0)

        /**
         * @param {unknown} [_]
         */
        function change(_) {
          calls++
        }
      }
    )

    await t.test(
      'should reconfigure plugins: `object` -> `false`, not used',
      async function () {
        let calls = 0

        unified().use(change, givenOptions).use(change, false).freeze()

        assert.equal(calls, 0)

        /**
         * @param {unknown} [_]
         */
        function change(_) {
          calls++
        }
      }
    )
  })

  await t.test('reconfigure (non-first parameters)', async function (t) {
    await t.test(
      'should reconfigure plugins (non-first parameters)',
      async function () {
        let calls = 0

        unified()
          .use(value, givenOptions, givenOptions, givenOptions, undefined)
          .use(value, otherOptions, otherOptions, undefined, otherOptions)
          .freeze()

        assert.equal(calls, 1)

        /**
         * @param {unknown} a
         * @param {unknown} b
         * @param {unknown} c
         * @param {unknown} d
         */
        function value(a, b, c, d) {
          assert.equal(arguments.length, 4)
          assert.deepEqual(a, mergedOptions)
          assert.deepEqual(b, otherOptions)
          assert.deepEqual(c, undefined)
          assert.deepEqual(d, otherOptions)
          calls++
        }
      }
    )

    await t.test('should keep parameter length (#1)', async function () {
      let calls = 0

      unified().use(value).use(value).freeze()

      assert.equal(calls, 1)

      /**
       * @param {...unknown} parameters
       */
      function value(...parameters) {
        assert.deepEqual(parameters, [])
        calls++
      }
    })

    await t.test('should keep parameter length (#2)', async function () {
      let calls = 0

      unified().use(value, givenOptions).use(value).freeze()

      assert.equal(calls, 1)

      /**
       * @param {...unknown} parameters
       */
      function value(...parameters) {
        assert.deepEqual(parameters, [givenOptions])
        calls++
      }
    })

    await t.test('should keep parameter length (#3)', async function () {
      let calls = 0

      unified().use(value).use(value, givenOptions).freeze()

      assert.equal(calls, 1)

      /**
       * @param {...unknown} parameters
       */
      function value(...parameters) {
        assert.deepEqual(parameters, [givenOptions])
        calls++
      }
    })
  })
})
