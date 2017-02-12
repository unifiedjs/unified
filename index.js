'use strict';

/* Dependencies. */
var has = require('has');
var extend = require('extend');
var bail = require('bail');
var vfile = require('vfile');
var trough = require('trough');
var string = require('x-is-string');
var func = require('x-is-function');

/* Expose an abstract processor. */
module.exports = unified().abstract();

/* Methods. */
var slice = [].slice;

/* Process pipeline. */
var pipeline = trough()
  .use(function (p, ctx) {
    ctx.tree = p.parse(ctx.file);
  })
  .use(function (p, ctx, next) {
    p.run(ctx.tree, ctx.file, function (err, tree, file) {
      if (err) {
        next(err);
      } else {
        ctx.tree = tree;
        ctx.file = file;
        next();
      }
    });
  })
  .use(function (p, ctx) {
    ctx.file.contents = p.stringify(ctx.tree, ctx.file);
  });

/* Function to create the first processor. */
function unified() {
  var attachers = [];
  var transformers = trough();
  var namespace = {};
  var concrete = true;

  /* Data management. */
  processor.data = data;

  /* Lock. */
  processor.abstract = abstract;

  /* Plug-ins. */
  processor.attachers = attachers;
  processor.use = use;

  /* API. */
  processor.parse = parse;
  processor.stringify = stringify;
  processor.run = run;
  processor.runSync = runSync;
  processor.process = process;
  processor.processSync = processSync;

  /* Expose. */
  return processor;

  /* Create a new processor based on the processor
   * in the current scope. */
  function processor() {
    var destination = unified();
    var length = attachers.length;
    var index = -1;

    while (++index < length) {
      destination.use.apply(null, attachers[index]);
    }

    destination.data(extend(true, {}, namespace));

    return destination;
  }

  /* Abstract: used to signal an abstract processor which
   * should made concrete before using.
   *
   * For example, take unified itself.  It’s abstract.
   * Plug-ins should not be added to it.  Rather, it should
   * be made concrete (by invoking it) before modifying it.
   *
   * In essence, always invoke this when exporting a
   * processor. */
  function abstract() {
    concrete = false;

    return processor;
  }

  /* Data management.
   * Getter / setter for processor-specific informtion. */
  function data(key, value) {
    assertConcrete('data', concrete);

    if (string(key)) {
      /* Set `key`. */
      if (arguments.length === 2) {
        namespace[key] = value;

        return processor;
      }

      /* Get `key`. */
      return (has(namespace, key) && namespace[key]) || null;
    }

    /* Get space. */
    if (!key) {
      return namespace;
    }

    /* Set space. */
    namespace = key;

    return processor;
  }

  /* Plug-in management.
   *
   * Pass it:
   * *   an attacher and options,
   * *   a list of attachers and options for all of them;
   * *   a tuple of one attacher and options.
   * *   a matrix: list containing any of the above and
   *     matrices.
   * *   a processor: another processor to use all its
   *     plugins (except parser if there’s already one).
   * *   a preset: an object with `plugins` (any of the
   *     above, optional), and `settings` (object, optional). */
  function use(value) {
    var args = slice.call(arguments, 0);
    var params = args.slice(1);
    var parser;
    var index;
    var length;
    var transformer;
    var result;

    assertConcrete('use', concrete);

    if (!func(value)) {
      /* Multiple attachers. */
      if ('length' in value) {
        index = -1;
        length = value.length;

        if (!func(value[0])) {
          /* Matrix of things. */
          while (++index < length) {
            use(value[index]);
          }
        } else if (func(value[1])) {
          /* List of things. */
          while (++index < length) {
            use.apply(null, [value[index]].concat(params));
          }
        } else {
          /* Arguments. */
          use.apply(null, value);
        }

        return processor;
      }

      /* Preset. */
      use(value.plugins || []);
      namespace.settings = extend(namespace.settings || {}, value.settings || {});

      return processor;
    }

    /* Store attacher. */
    attachers.push(args);

    /* Use a processor (except its parser if there’s already one.
     * Note that the processor is stored on `attachers`, making
     * it possibly mutating in the future, but also ensuring
     * the parser isn’t overwritten in the future either. */
    if (proc(value)) {
      parser = processor.Parser;
      result = use(value.attachers);

      if (parser) {
        processor.Parser = parser;
      }

      return result;
    }

    /* Single attacher. */
    transformer = value.apply(processor, params);

    if (func(transformer)) {
      transformers.use(transformer);
    }

    return processor;
  }

  /* Parse a file (in string or VFile representation)
   * into a Unist node using the `Parser` on the
   * processor. */
  function parse(doc) {
    var Parser = processor.Parser;
    var file = vfile(doc);

    assertConcrete('parse', concrete);
    assertParser('parse', Parser);

    if (newable(Parser)) {
      return new Parser(String(file), file).parse();
    }

    return Parser(String(file), file); // eslint-disable-line new-cap
  }

  /* Run transforms on a Unist node representation of a file
   * (in string or VFile representation), async. */
  function run(node, file, cb) {
    assertConcrete('run', concrete);
    assertNode(node);

    if (!cb && func(file)) {
      cb = file;
      file = null;
    }

    if (!cb) {
      return new Promise(executor);
    }

    executor(null, cb);

    function executor(resolve, reject) {
      transformers.run(node, vfile(file), done);

      function done(err, tree, file) {
        tree = tree || node;
        if (err) {
          reject(err);
        } else if (resolve) {
          resolve(tree);
        } else {
          cb(null, tree, file);
        }
      }
    }
  }

  /* Run transforms on a Unist node representation of a file
   * (in string or VFile representation), sync. */
  function runSync(node, file) {
    var complete = false;
    var result;

    assertConcrete('runSync', concrete);

    run(node, file, done);

    assertDone('runSync', 'run', complete);

    return result;

    function done(err, tree) {
      complete = true;
      bail(err);
      result = tree;
    }
  }

  /* Stringify a Unist node representation of a file
   * (in string or VFile representation) into a string
   * using the `Compiler` on the processor. */
  function stringify(node, doc) {
    var Compiler = processor.Compiler;
    var file = vfile(doc);

    assertConcrete('stringify', concrete);
    assertCompiler('stringify', Compiler);
    assertNode(node);

    if (newable(Compiler)) {
      return new Compiler(node, file).compile();
    }

    return Compiler(node, file); // eslint-disable-line new-cap
  }

  /* Parse a file (in string or VFile representation)
   * into a Unist node using the `Parser` on the processor,
   * then run transforms on that node, and compile the
   * resulting node using the `Compiler` on the processor,
   * and store that result on the VFile. */
  function process(doc, cb) {
    assertConcrete('process', concrete);
    assertParser('process', processor.Parser);
    assertCompiler('process', processor.Compiler);

    if (!cb) {
      return new Promise(executor);
    }

    executor(null, cb);

    function executor(resolve, reject) {
      var file = vfile(doc);

      pipeline.run(processor, {file: file}, done);

      function done(err) {
        if (err) {
          reject(err);
        } else if (resolve) {
          resolve(file);
        } else {
          cb(null, file);
        }
      }
    }
  }

  /* Process the given document (in string or VFile
   * representation), sync. */
  function processSync(doc) {
    var complete = false;
    var file;

    assertConcrete('processSync', concrete);
    assertParser('processSync', processor.Parser);
    assertCompiler('processSync', processor.Compiler);
    file = vfile(doc);

    process(file, done);

    assertDone('processSync', 'process', complete);

    return file;

    function done(err) {
      complete = true;
      bail(err);
    }
  }
}

/* Check if `processor` is a unified processor. */
function proc(processor) {
  return func(processor) && func(processor.use) && func(processor.process);
}

/* Check if `func` is a constructor. */
function newable(value) {
  return func(value) && keys(value.prototype);
}

/* Check if `func` is a constructor. */
function keys(value) {
  var key;
  for (key in value) {
    return true;
  }
  return false;
}

/* Assert a parser is available. */
function assertParser(name, Parser) {
  if (!func(Parser)) {
    throw new Error('Cannot `' + name + '` without `Parser`');
  }
}

/* Assert a compiler is available. */
function assertCompiler(name, Compiler) {
  if (!func(Compiler)) {
    throw new Error('Cannot `' + name + '` without `Compiler`');
  }
}

/* Assert the processor is concrete. */
function assertConcrete(name, concrete) {
  if (!concrete) {
    throw new Error(
      'Cannot invoke `' + name + '` on abstract processor.\n' +
      'To make the processor concrete, invoke it: ' +
      'use `processor()` instead of `processor`.'
    );
  }
}

/* Assert `node` is a Unist node. */
function assertNode(node) {
  if (!node || !node.type || !string(node.type)) {
    throw new Error('Expected node, got `' + node + '`');
  }
}

/* Assert, if no `done` is given, that `complete` is
 * `true`. */
function assertDone(name, asyncName, complete) {
  if (!complete) {
    throw new Error('`' + name + '` finished async. Use `' + asyncName + '` instead');
  }
}
