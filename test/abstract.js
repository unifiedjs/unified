'use strict';

var test = require('tape');
var unified = require('..');

test('abstract()', function (t) {
  var abstract = unified().abstract();
  var concrete = unified();

  t.doesNotThrow(
    function () {
      concrete.data();
    },
    '`data` can be invoked on concrete interfaces'
  );

  t.throws(
    function () {
      abstract.data();
    },
    /Cannot invoke `data` on abstract processor/,
    '`data` cannot be invoked on abstract interfaces'
  );

  t.throws(
    function () {
      abstract.use();
    },
    /Cannot invoke `use` on abstract processor/,
    '`use` cannot be invoked on abstract interfaces'
  );

  t.throws(
    function () {
      abstract.parse();
    },
    /Cannot invoke `parse` on abstract processor/,
    '`parse` cannot be invoked on abstract interfaces'
  );

  t.throws(
    function () {
      abstract.stringify();
    },
    /Cannot invoke `stringify` on abstract processor/,
    '`stringify` cannot be invoked on abstract interfaces'
  );

  t.throws(
    function () {
      abstract.run();
    },
    /Cannot invoke `run` on abstract processor/,
    '`run` cannot be invoked on abstract interfaces'
  );

  t.throws(
    function () {
      abstract.process();
    },
    /Cannot invoke `process` on abstract processor/,
    '`run` cannot be invoked on abstract interfaces'
  );

  t.end();
});
