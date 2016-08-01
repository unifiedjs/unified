/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unified
 * @fileoverview Test suite for `unified`.
 */

'use strict';

/* Dependencies. */
var test = require('tape');
var unified = require('..');

/* Tests. */
test('use(plugin[, options])', function (t) {
  var p = unified();
  var o = {};
  var n;

  t.plan(11);

  p.use(function (processor, options) {
    t.equal(processor, p, 'should invoke a plugin with `processor`');
    t.equal(options, o, 'should invoke a plugin with `options`');
  }, o);

  p.use([
    function (processor) {
      t.equal(processor, p, 'should support a list of plugins (#1)');
    },
    function (processor) {
      t.equal(processor, p, 'should support a list of plugins (#2)');
    }
  ]);

  p.use([function (processor) {
    t.equal(processor, p, 'should support a list of one plugin');
  }]);

  p.use([function (processor, options) {
    t.equal(options, o, 'should support a plugin--options tuple');
  }, o]);

  p.use([
    [function (processor, options) {
      t.equal(options, o, 'should support a matrix (#1)');
    }, o],
    [function (processor) {
      t.equal(processor, p, 'should support a matrix (#2)');
    }]
  ]);

  n = {type: 'test'};

  p.use(function () {
    return function (node, file) {
      t.equal(node, n, 'should attach a transformer (#1)');
      t.ok('message' in file, 'should attach a transformer (#2)');

      throw new Error('Alpha bravo charlie');
    };
  });

  t.throws(
    function () {
      p.run(n);
    },
    /Error: Alpha bravo charlie/,
    'should attach a transformer (#3)'
  );

  t.end();
});
