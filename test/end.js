'use strict';

var test = require('tape');
var simple = require('./util/simple');
var unified = require('..');

test('end(chunk[, encoding][, callback])', function (t) {
  var p = unified();
  var phase;
  var q;
  var e;

  t.plan(15);

  t.throws(
    function () {
      p.end();
    },
    /Cannot `end` without `Parser`/,
    'should throw without `Parser`'
  );

  p.use(function (processor) {
    processor.Parser = simple.Parser;
  });

  t.throws(
    function () {
      p.end();
    },
    /Cannot `end` without `Compiler`/,
    'should throw without `Compiler`'
  );

  p.use(function (processor) {
    processor.Compiler = simple.Compiler;
  });

  q = p();

  t.equal(q.end(), true, 'should return true');

  t.throws(
    function () {
      q.end();
    },
    /Did not expect `write` after `end`/,
    'should throw on end after end'
  );

  p().on('data', function (value) {
    t.equal(value, '', 'should emit processed `data`');
  }).end();

  p().on('data', function (value) {
    t.equal(value, 'alpha', 'should emit given `data`');
  }).end('alpha');

  p().on('data', function (value) {
    t.equal(value, 'alpha', 'should emit given `data`');
  }).end('alpha');

  p().on('data', function (value) {
    t.equal(value, 'brC!vo', 'should honour encoding');
  }).end(new Buffer([0x62, 0x72, 0xc3, 0xa1, 0x76, 0x6f]), 'ascii');

  phase = 0;

  p()
    .on('data', function () {
      t.equal(phase, 1, 'should trigger data after callback');
      phase++;
    })
    .end('charlie', function () {
      t.equal(phase, 0, 'should trigger callback before data');
      phase++;
    });

  e = new Error('delta');

  p()
    .use(function () {
      return function () {
        return e;
      };
    })
    .on('error', function (err) {
      t.equal(
        err,
        e,
        'should trigger `error` if an error occurs'
      );
    })
    .on('data', /* istanbul ignore next */ function () {
      t.fail('should not trigger `data` if an error occurs');
    })
    .end();

  p()
    .use(function () {
      return function (tree, file) {
        file.message('echo');
      };
    })
    .on('warning', function (message) {
      t.equal(
        message.reason,
        'echo',
        'should trigger `warning` if a warning occurs'
      );
    })
    .on('error', /* istanbul ignore next */ function () {
      t.fail('should not trigger `error` if a warning occurs');
    })
    .on('data', function (value) {
      t.equal(
        value,
        'foxtrot',
        'should trigger `data` if a warning occurs'
      );
    })
    .end('foxtrot');

  p()
    .use(function () {
      return function (tree, file) {
        file.message('golf');
        file.fail(e);
      };
    })
    .on('warning', function (message) {
      t.equal(
        message.reason,
        'golf',
        'should trigger `warning` with warnings if both ' +
        'warnings and errors occur'
      );
    })
    .on('error', function (err) {
      t.equal(
        err.reason,
        'delta',
        'should trigger `error` with a fatal error if ' +
        'both warnings and errors occur'
      );
    })
    .on('data', /* istanbul ignore next */ function () {
      t.fail('should not trigger `data` if an error occurs');
    })
    .end();
});
