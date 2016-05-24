/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unified
 * @fileoverview Test suite for `unified`.
 */

'use strict';

/* eslint-env node */
/* jscs:disable jsDoc */

/*
 * Dependencies.
 */

var stream = require('stream');
var test = require('tape');
var vfile = require('vfile');
var unified = require('./');

/*
 * Methods.
 */

var Stream = stream.Stream;
var PassThrough = stream.PassThrough;

/*
 * No-ops.
 */

function noop() {}
function NoopCompiler() {}
function NoopParser() {}

NoopParser.prototype.parse = noop;
NoopCompiler.prototype.compile = noop;

/*
 * Coverage.
 */

noop();
new NoopParser();
new NoopCompiler();

/*
 * Simple Parser / Compiler.
 */

function SimpleParser(file) {
    this.value = file.contents;
}

function simpleParse() {
    return {
        'type': 'text',
        'value': this.value
    };
}

SimpleParser.prototype.parse = simpleParse;

function SimpleCompiler() {}

function simpleCompile(node) {
    return node.value;
}

SimpleCompiler.prototype.compile = simpleCompile;

/*
 * Tests.
 */

test('unified', function (t) {
    t.test('unified()', function (st) {
        var count;
        var p;
        var q;

        st.throws(
            function () {
                unified.use(Function.prototype);
            },
            /Cannot invoke `use` on abstract processor/,
            'should be abstract'
        );

        p = unified();

        st.equal(typeof p, 'function', 'should return a function');

        p.use(function (processor) {
            count++;
            processor.data('foo', 'bar');
        });

        count = 0;
        q = p();

        st.equal(
            count,
            1,
            'should create a new processor implementing the ' +
            'ancestral processor when invoked (#1)'
        );

        st.equal(
            q.data('foo'),
            'bar',
            'should create a new processor implementing the ' +
            'ancestral processor when invoked (#2)'
        );

        t.equal(unified.writable, true, 'should be `writable`');
        t.equal(unified.readable, true, 'should be `readable`');
        t.equal(typeof unified.on, 'function', 'should have `on`');
        t.equal(typeof unified.emit, 'function', 'should have `emit`');

        st.end();
    });

    t.test('data(key[, value])', function (st) {
        var p = unified();

        st.equal(p.data('foo', 'bar'), p, 'should return self as setter');
        st.equal(p.data('foo'), 'bar', 'should return data as getter');

        st.equal(
            p.data('toString'),
            null,
            'should not return own inherited properties.'
        );

        st.deepEqual(
            p.data(),
            {
                'foo': 'bar'
            },
            'should return the memory without arguments'
        );

        st.deepEqual(
            p.data({
                'baz': 'qux'
            }),
            p,
            'should set the memory with just a value (#1)'
        );

        st.deepEqual(
            p.data(),
            {
                'baz': 'qux'
            },
            'should set the memory with just a value (#2)'
        );

        st.end();
    });

    t.test('abstract()', function (st) {
        var abstract = unified().abstract();
        var concrete = unified();

        st.doesNotThrow(
            function () {
                concrete.data();
            },
            '`data` can be invoked on concrete interfaces'
        );

        st.throws(
            function () {
                abstract.data();
            },
            /Cannot invoke `data` on abstract processor/,
            '`data` cannot be invoked on abstract interfaces'
        );

        st.throws(
            function () {
                abstract.use();
            },
            /Cannot invoke `use` on abstract processor/,
            '`use` cannot be invoked on abstract interfaces'
        );

        st.throws(
            function () {
                abstract.parse();
            },
            /Cannot invoke `parse` on abstract processor/,
            '`parse` cannot be invoked on abstract interfaces'
        );

        st.throws(
            function () {
                abstract.stringify();
            },
            /Cannot invoke `stringify` on abstract processor/,
            '`stringify` cannot be invoked on abstract interfaces'
        );

        st.throws(
            function () {
                abstract.run();
            },
            /Cannot invoke `run` on abstract processor/,
            '`run` cannot be invoked on abstract interfaces'
        );

        st.throws(
            function () {
                abstract.process();
            },
            /Cannot invoke `process` on abstract processor/,
            '`run` cannot be invoked on abstract interfaces'
        );

        st.throws(
            function () {
                abstract.pipe();
            },
            /Cannot invoke `pipe` on abstract processor/,
            '`pipe` cannot be invoked on abstract interfaces'
        );

        st.throws(
            function () {
                abstract.write();
            },
            /Cannot invoke `write` on abstract processor/,
            '`write` cannot be invoked on abstract interfaces'
        );

        st.throws(
            function () {
                abstract.end();
            },
            /Cannot invoke `end` on abstract processor/,
            '`end` cannot be invoked on abstract interfaces'
        );

        st.throws(
            function () {
                new Stream().pipe(abstract);
            },
            /Cannot pipe into abstract processor/,
            'cannot pipe into abstract interfaces'
        );

        st.end();
    });

    t.test('use(plugin[, options])', function (st) {
        var p = unified();
        var o = {};
        var n;

        st.plan(11);

        p.use(function (processor, options) {
            st.equal(
                processor,
                p,
                'should invoke a plugin with `processor`'
            );

            st.equal(
                options,
                o,
                'should invoke a plugin with `options`'
            );
        }, o);

        p.use([
            function (processor) {
                st.equal(
                    processor,
                    p,
                    'should support a list of plugins (#1)'
                );
            },
            function (processor) {
                st.equal(
                    processor,
                    p,
                    'should support a list of plugins (#2)'
                );
            }
        ]);

        p.use([
            function (processor) {
                st.equal(
                    processor,
                    p,
                    'should support a list of one plugin'
                );
            }
        ]);

        p.use([
            function (processor, options) {
                st.equal(
                    options,
                    o,
                    'should support a plugin--options tuple'
                );
            },
            o
        ]);

        p.use([
            [
                function (processor, options) {
                    st.equal(
                        options,
                        o,
                        'should support a matrix (#1)'
                    );
                },
                o
            ],
            [
                function (processor) {
                    st.equal(
                        processor,
                        p,
                        'should support a matrix (#2)'
                    );
                }
            ]
        ]);

        n = {'type': 'test'}

        p.use(function () {
            return function (node, file) {
                st.equal(node, n, 'should attach a transformer (#1)');
                st.ok('message' in file, 'should attach a transformer (#2)');

                throw new Error('Alpha bravo charlie');
            }
        });

        st.throws(
            function () {
                p.run(n);
            },
            /Error: Alpha bravo charlie/,
            'should attach a transformer (#3)'
        )

        st.end();
    });

    t.test('parse(file[, options])', function (st) {
        var p = unified();
        var o;
        var n;

        st.plan(8);

        st.throws(
            function () {
                p.parse('');
            },
            /Cannot `parse` without `Parser`/,
            'should throw without `Parser`'
        );

        p.Parser = noop;

        st.throws(
            function () {
                p.parse();
            },
            /Cannot `parse` without `Parser`/,
            'should throw without `Parser#parse`'
        );

        o = {};
        n = {
            'type': 'deta'
        }

        p.Parser = function (file, options, processor) {
            st.ok('message' in file, 'should pass a file');
            st.equal(file.contents, 'charlie', 'should pass options');
            st.equal(options, o, 'should pass options');
            st.equal(processor, p, 'should pass the processor');
        };

        p.Parser.prototype.parse = function (value) {
            st.equal(value, undefined, 'should not pass anything to `parse`');

            return n;
        };

        st.equal(
            p.parse('charlie', o),
            n,
            'should return the result `Parser#parse` returns'
        );
    });

    t.test('stringify(node[, file][, options])', function (st) {
        var p = unified();
        var o;
        var f;
        var n;

        st.plan(17);

        st.throws(
            function () {
                p.stringify('');
            },
            /Cannot `stringify` without `Compiler`/,
            'should throw without `Compiler`'
        );

        p.Compiler = noop;

        st.throws(
            function () {
                p.stringify();
            },
            /Cannot `stringify` without `Compiler`/,
            'should throw without `Compiler#compile`'
        );

        o = {};
        f = vfile('charlie');
        n = {
            'type': 'deta'
        };

        p.Compiler = function (file, options, processor) {
            st.ok('message' in file, 'should pass a file');
            st.equal(file, f, 'should pass options');
            st.equal(options, o, 'should pass options');
            st.equal(processor, p, 'should pass the processor');
        };

        p.Compiler.prototype.compile = function (node) {
            st.equal(node, n, 'should pass the node to `compile`');

            return 'echo';
        };

        st.equal(
            p.stringify(n, f, o),
            'echo',
            'should return the result `Compiler#compile` returns'
        );

        p.Compiler = function (file, options) {
            st.equal(
                file,
                f,
                'should work without options (#1)'
            );
            st.deepEqual(
                options,
                undefined,
                'should work without options (#2)'
            );
        };

        p.Compiler.prototype.compile = function () {
            return 'foxtrot';
        }

        st.equal(
            p.stringify(n, f),
            'foxtrot',
            'should work without options (#3)'
        );

        p.Compiler = function (file) {
            st.equal(
                file.contents,
                '',
                'should work without file and options (#1)'
            );
        };

        p.Compiler.prototype.compile = function () {
            return 'golf';
        };

        st.equal(
            p.stringify(n),
            'golf',
            'should work without file and options (#2)'
        );

        p.Compiler = function (file, options) {
            st.equal(
                file.contents,
                '',
                'should work without file and with options (#1)'
            );

            st.equal(
                options,
                o,
                'should work without file and with options (#2)'
            );
        };

        p.Compiler.prototype.compile = function () {
            return 'hotel';
        }

        st.equal(
            p.stringify(n, o),
            'hotel',
            'should work without file and with options (#3)'
        );

        p.Compiler = NoopCompiler;

        st.throws(
            function () {
                p.stringify();
            },
            /Expected node, got `undefined`/,
            'should throw without node'
        );
    });

    t.test('run(node[, file][, done])', function (st) {
        var p;
        var f;
        var n;
        var t;

        st.plan(30);

        st.throws(
            function () {
                unified().run();
            },
            /Expected node, got `undefined`/,
            'should throw without node'
        );

        f = vfile('alpha');

        n = {
            'type': 'bravo'
        };

        unified()
            .use(function () {
                return function (tree, file) {
                    st.equal(
                        tree,
                        n,
                        'should pass the given tree to a transformer'
                    );

                    st.equal(
                        file,
                        f,
                        'should pass the given file to a transformer'
                    );
                }
            })
            .run(n, f);

        unified()
            .use(function () {
                return function (tree, file) {
                    st.equal(
                        file.contents,
                        '',
                        'should pass a new file to a transformer if ' +
                        'none is given'
                    );
                }
            })
            .run(n);

        unified().run(n, f, function (err, tree, file) {
            st.error(err, 'should pass a nully error to `done` (#1)');

            st.equal(
                tree,
                n,
                'should pass the given tree to `done`'
            );

            st.equal(
                file,
                f,
                'should pass the given file to `done`'
            );
        });

        unified().run(n, null, function (err, tree, file) {
            st.equal(
                file.contents,
                '',
                'should pass a new file to `done` if `null` is given'
            );
        });

        unified().run(n, function (err, tree, file) {
            st.equal(
                file.contents,
                '',
                'should pass a new file to `done` if it’s omitted'
            );
        });

        p = unified().use(function () {
            return function () {
                return new Error('charlie');
            }
        });

        st.throws(
            function () {
                p.run(n);
            },
            /charlie/,
            'should throw an error, when without `done`, returned ' +
            'from a sync transformer'
        );

        p.run(n, function (err) {
            st.equal(
                String(err),
                'Error: charlie',
                'should pass an error to `done` from a sync transformer'
            )
        });

        t = {
            'type': 'delta'
        };

        p = unified().use(function () {
            return function () {
                return t;
            }
        });

        st.equal(
            p.run(n),
            t,
            'should return a new tree, when without `done`, and ' +
            'returned from a sync transformer'
        );

        p.run(n, function (err, tree) {
            st.error(err);

            st.equal(
                tree,
                t,
                'should pass a new tree to `done`, when returned ' +
                'from a sync transformer'
            );
        });

        p = unified().use(function () {
            return function (tree, file, next) {
                next(new Error('delta'));
            };
        });

        st.throws(
            function () {
                p.run(n);
            },
            /delta/,
            'should throw an error, when without `done`, if given ' +
            'to a sync transformer’s `next`'
        );

        p.run(n, function (err) {
            st.equal(
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
                st.error(
                    err,
                    'should ignore multiple invocations of `next`' +
                    'when invoked in a synchroneous transformer'
                );
            });

        p = unified().use(function () {
            return function (tree, file, next) {
                next(null, t);
            };
        });

        st.equal(
            p.run(n),
            t,
            'should return a new tree, when without `done`, if ' +
            'given to a sync transformer’s `next`'
        );

        p.run(n, function (err, tree) {
            st.error(err);

            st.equal(
                tree,
                t,
                'should pass a new tree to `done`, if given ' +
                'to a sync transformer’s `next`'
            );
        });

        p = unified().use(function () {
            return function () {
                return {
                    'then': function (resolve, reject) {
                        reject(new Error('delta'));
                    }
                }
            }
        });

        st.throws(
            function () {
                p.run(n);
            },
            /delta/,
            'should throw an error, when without `done`, rejected ' +
            'from a sync transformer’s returned promise'
        );

        p.run(n, function (err) {
            st.equal(
                String(err),
                'Error: delta',
                'should pass an error to `done` rejected from a ' +
                'sync transformer’s returned promise'
            )
        });

        p = unified().use(function () {
            return function () {
                return {
                    'then': function (resolve) {
                        resolve(t);
                    }
                }
            }
        });

        st.equal(
            p.run(n),
            t,
            'should return a new tree, when without `done`, resolved ' +
            'from a sync transformer’s returned promise'
        );

        p.run(n, function (err, tree) {
            st.error(err);

            st.equal(
                tree,
                t,
                'should pass a new tree to `done`, when resolved ' +
                'sync transformer’s returned promise'
            );
        });

        p = unified()
            .use(function () {
                return function (tree, file, next) {
                    setImmediate(function () {
                        next(null, t);
                    });
                }
            });

        st.throws(
            function () {
                p.run(n);
            },
            /Expected `done` to be given to `run`/,
            'should throw an error if an asynchroneous transformer ' +
            'is used but no `done` is given'
        );

        p.run(n, function (err, tree) {
            st.error(err);

            st.equal(
                tree,
                t,
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
                }
            })
            .run(n, function (err) {
                st.equal(
                    String(err),
                    'Error: echo',
                    'should pass an error to `done` given to `next` ' +
                    'from an asynchroneous transformer'
                )
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
                st.error(
                    err,
                    'should ignore multiple invocations of `next`' +
                    'when invoked from an asynchroneous transformer'
                );
            });
    });

    t.test('process(file[, options][, done])', function (st) {
        var p = unified();

        st.plan(7);

        st.throws(
            function () {
                p.process();
            },
            /Cannot `process` without `Parser`/,
            'should throw without `Parser`'
        );

        p.Parser = noop;

        st.throws(
            function () {
                p.process();
            },
            /Cannot `process` without `Parser`/,
            'should throw without `Parser#parse`'
        );

        p.Parser = NoopParser;

        st.throws(
            function () {
                p.process();
            },
            /Cannot `process` without `Compiler`/,
            'should throw without `Compiler`'
        );

        p.Compiler = noop;

        st.throws(
            function () {
                p.process();
            },
            /Cannot `process` without `Compiler`/,
            'should throw without `Compiler#compile`'
        );

        st.test('process(file, options, done)', function (sst) {
            var f = vfile('alpha');
            var n = { 'type': 'bravo' };
            var o = { 'charlie': 'delta' };
            var p;

            sst.plan(11);

            p = unified()
                .use(function (processor) {
                    function Parser(file, options, processor) {
                        sst.equal(
                            file,
                            f,
                            'should pass `file` to `Parser`'
                        );

                        sst.equal(
                            options,
                            o,
                            'should pass `options` to `Parser`'
                        );

                        sst.equal(
                            processor,
                            p,
                            'should pass `processor` to `Parser`'
                        );
                    }

                    function parse() {
                        return n;
                    }

                    Parser.prototype.parse = parse;
                    processor.Parser = Parser;
                })
                .use(function () {
                    return function (tree, file) {
                        sst.equal(
                            tree,
                            n,
                            'should pass `tree` to transformers'
                        );

                        sst.equal(
                            file,
                            f,
                            'should pass `file` to transformers'
                        );
                    };
                })
                .use(function (processor) {
                    function Compiler(file, options, processor) {
                        sst.equal(
                            file,
                            f,
                            'should pass `file` to `Compiler`'
                        );

                        sst.equal(
                            options,
                            o,
                            'should pass `options` to `Compiler`'
                        );

                        sst.equal(
                            processor,
                            p,
                            'should pass `processor` to `Compiler`'
                        );
                    }

                    function compile(tree) {
                        sst.equal(
                            tree,
                            n,
                            'should pass `tree` to `Compiler#compile`'
                        );

                        return 'echo';
                    }

                    Compiler.prototype.compile = compile;

                    processor.Compiler = Compiler;
                });

            p.process(f, o, function (err, file) {
                sst.error(err);

                sst.equal(
                    file.contents,
                    'echo',
                    'should store the result of `compile()` on `file`'
                );
            });
        });

        st.test('process(file, done)', function (sst) {
            var f = vfile('alpha');
            var n = { 'type': 'bravo' };
            var p;

            sst.plan(11);

            p = unified()
                .use(function (processor) {
                    function Parser(file, options, processor) {
                        sst.equal(
                            file,
                            f,
                            'should pass `file` to `Parser`'
                        );

                        sst.deepEqual(
                            options,
                            {},
                            'should pass empty `options` to `Parser`'
                        );

                        sst.equal(
                            processor,
                            p,
                            'should pass `processor` to `Parser`'
                        );
                    }

                    function parse() {
                        return n;
                    }

                    Parser.prototype.parse = parse;
                    processor.Parser = Parser;
                })
                .use(function () {
                    return function (tree, file) {
                        sst.equal(
                            tree,
                            n,
                            'should pass `tree` to transformers'
                        );

                        sst.equal(
                            file,
                            f,
                            'should pass `file` to transformers'
                        );
                    };
                })
                .use(function (processor) {
                    function Compiler(file, options, processor) {
                        sst.equal(
                            file,
                            f,
                            'should pass `file` to `Compiler`'
                        );

                        sst.deepEqual(
                            options,
                            {},
                            'should pass empty `options` to `Compiler`'
                        );

                        sst.equal(
                            processor,
                            p,
                            'should pass `processor` to `Compiler`'
                        );
                    }

                    function compile(tree) {
                        sst.equal(
                            tree,
                            n,
                            'should pass `tree` to `Compiler#compile`'
                        );

                        return 'charlie';
                    }

                    Compiler.prototype.compile = compile;

                    processor.Compiler = Compiler;
                });

            p.process(f, function (err, file) {
                sst.error(err);

                sst.equal(
                    file.contents,
                    'charlie',
                    'should store the result of `compile()` on `file`'
                );
            });
        });

        st.test('process(file)', function (sst) {
            var p = unified()
                .use(function (processor) {
                    processor.Parser = SimpleParser;
                })
                .use(function () {
                    return function () {
                        return new Error('bravo');
                    };
                })
                .use(function (processor) {
                    processor.Compiler = NoopCompiler;
                });

            sst.throws(
                function () {
                    p.process('delta');
                },
                /Error: bravo/,
                'should throw error from the process without `done`'
            );

            sst.end();
        });
    });

    t.test('end(chunk[, encoding][, callback])', function (st) {
        var p = unified();
        var phase;
        var q;
        var e;

        st.plan(15);

        st.throws(
            function () {
                p.end();
            },
            /Cannot `end` without `Parser`/,
            'should throw without `Parser`'
        );

        p.use(function (processor) {
            processor.Parser = SimpleParser;
        });

        st.throws(
            function () {
                p.end();
            },
            /Cannot `end` without `Compiler`/,
            'should throw without `Compiler`'
        );

        p.use(function (processor) {
            processor.Compiler = SimpleCompiler;
        });

        q = p();

        st.equal(q.end(), true, 'should return true');

        st.throws(
            function () {
                q.end();
            },
            /Did not expect `write` after `end`/,
            'should throw on end after end'
        );

        p().on('data', function (value) {
            st.equal(value, '', 'should emit processed `data`');
        }).end();

        p().on('data', function (value) {
            st.equal(value, 'alpha', 'should emit given `data`');
        }).end('alpha');

        p().on('data', function (value) {
            st.equal(value, 'alpha', 'should emit given `data`');
        }).end('alpha');

        p().on('data', function (value) {
            st.equal(value, 'brC!vo', 'should honour encoding');
        }).end(new Buffer([0x62, 0x72, 0xc3, 0xa1, 0x76, 0x6f]), 'ascii');

        phase = 0;

        p()
            .on('data', function () {
                st.equal(phase, 1, 'should trigger data after callback');
                phase++;
            })
            .end('charlie', function () {
                st.equal(phase, 0, 'should trigger callback before data');
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
                st.equal(
                    err,
                    e,
                    'should trigger `error` if an error occurs'
                );
            })
            .on('data', /* istanbul ignore next */ function () {
                st.fail('should not trigger `data` if an error occurs');
            })
            .end();

        p()
            .use(function () {
                return function (tree, file) {
                    file.warn('echo');
                };
            })
            .on('warning', function (message) {
                st.equal(
                    message.reason,
                    'echo',
                    'should trigger `warning` if a warning occurs'
                );
            })
            .on('error', /* istanbul ignore next */ function () {
                st.fail('should not trigger `error` if a warning occurs');
            })
            .on('data', function (value) {
                st.equal(
                    value,
                    'foxtrot',
                    'should trigger `data` if a warning occurs'
                );
            })
            .end('foxtrot');

        p()
            .use(function () {
                return function (tree, file) {
                    file.warn('golf');
                    file.fail(e);
                };
            })
            .on('warning', function (message) {
                st.equal(
                    message.reason,
                    'golf',
                    'should trigger `warning` with warnings if both ' +
                    'warnings and errors occur'
                );
            })
            .on('error', function (err) {
                st.equal(
                    err.reason,
                    'delta',
                    'should trigger `error` with a fatal error if ' +
                    'both warnings and errors occur'
                );
            })
            .on('data', /* istanbul ignore next */ function () {
                st.fail('should not trigger `data` if an error occurs');
            })
            .end();
    });

    t.test('write(chunk[, encoding][, callback])', function (st) {
        var p = unified();

        st.plan(5);

        p.write('alpha', 'utf8', function () {
            st.pass('should invoke callback on succesful write');
        });

        p.write('bravo', function () {
            st.pass('should invoke callback when without encoding');
        });

        st.ok(p.write('charlie'), 'should return `true`');

        p
            .use(function (processor) {
                processor.Parser = SimpleParser;
            })
            .use(function (processor) {
                processor.Compiler = SimpleCompiler;
            })
            .on('data', function (value) {
                st.equal(
                    value,
                    'alphabravocharliedelta',
                    'should process all data once `end` is invoked'
                );
            })
            .end('delta');

        st.throws(
            function () {
                p.write('echo');
            },
            /Did not expect `write` after `end`/,
            'should throw on write after end'
        );
    });

    t.test('pipe(destination[, options])', function (st) {
        var p;

        p = unified();

        p
            .use(function (processor) {
                processor.Parser = SimpleParser;
                processor.Compiler = SimpleCompiler;
            })
            .pipe(new PassThrough())
            .on('data', function (buf) {
                st.equal(
                    String(buf),
                    'alphabravocharlie',
                    'should trigger `data` with the processed result'
                );
            })
            .on('error', /* istanbul ignore next */ function () {
                st.fail('should not trigger `error`');
            });

        p.write('alpha');
        p.write('bravo');
        p.end('charlie');

        p = unified();

        p
            .use(function (processor) {
                processor.Parser = SimpleParser;

                function Compiler(file, options) {
                    this.options = options;
                }

                function compile(node) {
                    return node.value + this.options.flag;
                }

                Compiler.prototype.compile = compile;

                processor.Compiler = Compiler;
            })
            .pipe(new PassThrough(), {
                'flag': 'echo'
            })
            .on('data', function (buf) {
                st.equal(String(buf), 'deltaecho', 'should pass options');
            });

        p.end('delta');

        st.end();
    });

    t.end();
});
