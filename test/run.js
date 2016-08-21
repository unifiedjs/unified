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
var vfile = require('vfile');
var unified = require('..');

/* Tests. */
test('run(node[, file][, done])', function (t) {
  var p;
  var f;
  var n;
  var a;

  t.plan(32);

  t.throws(
    function () {
      unified().run();
    },
    /Expected node, got `undefined`/,
    'should throw without node'
  );

  f = vfile('alpha');
  n = {type: 'bravo'};

  unified()
    .use(function () {
      return function (tree, file) {
        t.equal(tree, n, 'passes given tree to transformers');
        t.equal(file, f, 'passes given file to transformers');
      };
    })
    .run(n, f);

  unified()
    .use(function () {
      return function (tree, file) {
        t.equal(file.toString(), '', 'passes files to transformers if not given');
      };
    })
    .run(n);

  unified().run(n, f, function (err, tree, file) {
    t.error(err);
    t.equal(tree, n, 'passes given tree to `done`');
    t.equal(file, f, 'passes given file to `done`');
  });

  unified().run(n, null, function (err, tree, file) {
    t.error(err);
    t.equal(file.toString(), '', 'passes file to `done` if not given');
  });

  unified().run(n, function (err, tree, file) {
    t.error(err);
    t.equal(file.toString(), '', 'passes file to `done` if omitted');
  });

  p = unified().use(function () {
    return function () {
      return new Error('charlie');
    };
  });

  t.throws(
    function () {
      p.run(n);
    },
    /charlie/,
    'should throw an error, when without `done`, returned ' +
    'from a sync transformer'
  );

  p.run(n, function (err) {
    t.equal(
      String(err),
      'Error: charlie',
      'should pass an error to `done` from a sync transformer'
    );
  });

  a = {type: 'delta'};

  p = unified().use(function () {
    return function () {
      return a;
    };
  });

  t.equal(
    p.run(n),
    a,
    'should return a new tree, when without `done`, and ' +
    'returned from a sync transformer'
  );

  p.run(n, function (err, tree) {
    t.error(err);

    t.equal(
      tree,
      a,
      'should pass a new tree to `done`, when returned ' +
      'from a sync transformer'
    );
  });

  p = unified().use(function () {
    return function (tree, file, next) {
      next(new Error('delta'));
    };
  });

  t.throws(
    function () {
      p.run(n);
    },
    /delta/,
    'should throw an error, when without `done`, if given ' +
    'to a sync transformer’s `next`'
  );

  p.run(n, function (err) {
    t.equal(
      String(err),
      'Error: delta',
      'should pass an error to `done`, if given to a sync ' +
      'transformer’s `next`'
    );
  });

  unified()
    .use(function () {
      return function (tree, file, next) {
        next();
        next(new Error('delta'));
      };
    })
    .run(n, function (err) {
      t.error(
        err,
        'should ignore multiple invocations of `next`' +
        'when invoked in a synchroneous transformer'
      );
    });

  p = unified().use(function () {
    return function (tree, file, next) {
      next(null, a);
    };
  });

  t.equal(
    p.run(n),
    a,
    'should return a new tree, when without `done`, if ' +
    'given to a sync transformer’s `next`'
  );

  p.run(n, function (err, tree) {
    t.error(err);

    t.equal(
      tree,
      a,
      'should pass a new tree to `done`, if given ' +
      'to a sync transformer’s `next`'
    );
  });

  p = unified().use(function () {
    return function () {
      return {
        then: function (resolve, reject) {
          reject(new Error('delta'));
        }
      };
    };
  });

  t.throws(
    function () {
      p.run(n);
    },
    /delta/,
    'should throw an error, when without `done`, rejected ' +
    'from a sync transformer’s returned promise'
  );

  p.run(n, function (err) {
    t.equal(
      String(err),
      'Error: delta',
      'should pass an error to `done` rejected from a ' +
      'sync transformer’s returned promise'
    );
  });

  p = unified().use(function () {
    return function () {
      return {
        then: function (resolve) {
          resolve(a);
        }
      };
    };
  });

  t.equal(
    p.run(n),
    a,
    'should return a new tree, when without `done`, resolved ' +
    'from a sync transformer’s returned promise'
  );

  p.run(n, function (err, tree) {
    t.error(err);

    t.equal(
      tree,
      a,
      'should pass a new tree to `done`, when resolved ' +
      'sync transformer’s returned promise'
    );
  });

  p = unified()
    .use(function () {
      return function (tree, file, next) {
        setImmediate(function () {
          next(null, a);
        });
      };
    });

  t.throws(
    function () {
      p.run(n);
    },
    /Expected `done` to be given to `run`/,
    'should throw an error if an asynchroneous transformer ' +
    'is used but no `done` is given'
  );

  p.run(n, function (err, tree) {
    t.error(err);

    t.equal(
      tree,
      a,
      'should pass a new tree to `done` when given to ' +
      '`next` from an asynchroneous transformer'
    );
  });

  unified()
    .use(function () {
      return function (tree, file, next) {
        setImmediate(function () {
          next(new Error('echo'));
        });
      };
    })
    .run(n, function (err) {
      t.equal(
        String(err),
        'Error: echo',
        'should pass an error to `done` given to `next` ' +
        'from an asynchroneous transformer'
      );
    });

  unified()
    .use(function () {
      return function (tree, file, next) {
        setImmediate(function () {
          next();
          next(new Error('echo'));
        });
      };
    })
    .run(n, function (err) {
      t.error(
        err,
        'should ignore multiple invocations of `next`' +
        'when invoked from an asynchroneous transformer'
      );
    });
});
