'use strict';

var test = require('tape');
var vfile = require('vfile');
var noop = require('./util/noop');
var unified = require('..');

test('stringify(node[, file])', function (t) {
  var p = unified();
  var f;
  var n;

  t.plan(6);

  t.throws(
    function () {
      p.stringify('');
    },
    /Cannot `stringify` without `Compiler`/,
    'should throw without `Compiler`'
  );

  f = vfile('charlie');
  n = {type: 'delta'};

  p.Compiler = function (node, file) {
    t.equal(node, n, 'should pass a node');
    t.ok('message' in file, 'should pass a file');
  };

  p.Compiler.prototype.compile = function () {
    t.equal(arguments.length, 0, 'should not pass anything to `compile`');
    return 'echo';
  };

  t.equal(
    p.stringify(n, f),
    'echo',
    'should return the result `Compiler#compile` returns'
  );

  p.Compiler = noop.Compiler;

  t.throws(
    function () {
      p.stringify();
    },
    /Expected node, got `undefined`/,
    'should throw without node'
  );
});
