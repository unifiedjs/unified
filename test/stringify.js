'use strict';

var test = require('tape');
var vfile = require('vfile');
var noop = require('./util/noop');
var unified = require('..');

test('stringify(node[, file][, options])', function (t) {
  var p = unified();
  var o;
  var f;
  var n;

  t.plan(17);

  t.throws(
    function () {
      p.stringify('');
    },
    /Cannot `stringify` without `Compiler`/,
    'should throw without `Compiler`'
  );

  p.Compiler = noop;

  t.throws(
    function () {
      p.stringify();
    },
    /Cannot `stringify` without `Compiler`/,
    'should throw without `Compiler#compile`'
  );

  o = {};
  f = vfile('charlie');
  n = {type: 'delta'};

  p.Compiler = function (file, options, processor) {
    t.ok('message' in file, 'should pass a file');
    t.equal(file, f, 'should pass options');
    t.equal(options, o, 'should pass options');
    t.equal(processor, p, 'should pass the processor');
  };

  p.Compiler.prototype.compile = function (node) {
    t.equal(node, n, 'should pass the node to `compile`');

    return 'echo';
  };

  t.equal(
    p.stringify(n, f, o),
    'echo',
    'should return the result `Compiler#compile` returns'
  );

  p.Compiler = function (file, options) {
    t.equal(
      file,
      f,
      'should work without options (#1)'
    );

    t.deepEqual(
      options,
      undefined,
      'should work without options (#2)'
    );
  };

  p.Compiler.prototype.compile = function () {
    return 'foxtrot';
  };

  t.equal(
    p.stringify(n, f),
    'foxtrot',
    'should work without options (#3)'
  );

  p.Compiler = function (file) {
    t.equal(
      file.toString(),
      '',
      'should work without file and options (#1)'
    );
  };

  p.Compiler.prototype.compile = function () {
    return 'golf';
  };

  t.equal(
    p.stringify(n),
    'golf',
    'should work without file and options (#2)'
  );

  p.Compiler = function (file, options) {
    t.equal(
      file.toString(),
      '',
      'should work without file and with options (#1)'
    );

    t.equal(
      options,
      o,
      'should work without file and with options (#2)'
    );
  };

  p.Compiler.prototype.compile = function () {
    return 'hotel';
  };

  t.equal(
    p.stringify(n, o),
    'hotel',
    'should work without file and with options (#3)'
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
