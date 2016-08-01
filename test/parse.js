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
var noop = require('./util/noop');
var unified = require('..');

/* Tests. */
test('parse(file[, options])', function (t) {
  var p = unified();
  var o;
  var n;

  t.plan(8);

  t.throws(
    function () {
      p.parse('');
    },
    /Cannot `parse` without `Parser`/,
    'should throw without `Parser`'
  );

  p.Parser = noop;

  t.throws(
    function () {
      p.parse();
    },
    /Cannot `parse` without `Parser`/,
    'should throw without `Parser#parse`'
  );

  o = {};
  n = {type: 'delta'};

  p.Parser = function (file, options, processor) {
    t.ok('message' in file, 'should pass a file');
    t.equal(file.contents, 'charlie', 'should pass options');
    t.equal(options, o, 'should pass options');
    t.equal(processor, p, 'should pass the processor');
  };

  p.Parser.prototype.parse = function (value) {
    t.equal(value, undefined, 'should not pass anything to `parse`');

    return n;
  };

  t.equal(
    p.parse('charlie', o),
    n,
    'should return the result `Parser#parse` returns'
  );
});
