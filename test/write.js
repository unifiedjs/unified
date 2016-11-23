'use strict';

var test = require('tape');
var simple = require('./util/simple');
var unified = require('..');

test('write(chunk[, encoding][, callback])', function (t) {
  var p = unified();

  t.plan(5);

  p.write('alpha', 'utf8', function () {
    t.pass('should invoke callback on succesful write');
  });

  p.write('bravo', function () {
    t.pass('should invoke callback when without encoding');
  });

  t.ok(p.write('charlie'), 'should return `true`');

  p
    .use(function (processor) {
      processor.Parser = simple.Parser;
      processor.Compiler = simple.Compiler;
    })
    .on('data', function (value) {
      t.equal(
        value,
        'alphabravocharliedelta',
        'should process all data once `end` is invoked'
      );
    })
    .end('delta');

  t.throws(
    function () {
      p.write('echo');
    },
    /Did not expect `write` after `end`/,
    'should throw on write after end'
  );
});
