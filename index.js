'use strict';

/* Dependencies. */
var has = require('has');
var extend = require('extend');
var bail = require('bail');
var vfile = require('vfile');
var trough = require('trough');
var string = require('x-is-string');

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
  processor.process = process;

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

  /* Helpers. */

  /* Assert a parser is available. */
  function assertParser(name) {
    if (!isFunction(processor.Parser)) {
      throw new Error('Cannot `' + name + '` without `Parser`');
    }
  }

  /* Assert a compiler is available. */
  function assertCompiler(name) {
    if (!isFunction(processor.Compiler)) {
      throw new Error('Cannot `' + name + '` without `Compiler`');
    }
  }

  /* Assert the processor is concrete. */
  function assertConcrete(name) {
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
    if (!isNode(node)) {
      throw new Error('Expected node, got `' + node + '`');
    }
  }

  /* Assert, if no `done` is given, that `complete` is
   * `true`. */
  function assertDone(name, complete, done) {
    if (!complete && !done) {
      throw new Error(
        'Expected `done` to be given to `' + name + '` ' +
        'as async plug-ins are used'
      );
    }
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
    assertConcrete('data');

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
   *     plugins (except parser if there’s already one). */
  function use(value) {
    var args = slice.call(arguments, 0);
    var params = args.slice(1);
    var parser;
    var index;
    var length;
    var transformer;
    var result;

    assertConcrete('use');

    /* Multiple attachers. */
    if ('length' in value && !isFunction(value)) {
      index = -1;
      length = value.length;

      if (!isFunction(value[0])) {
        /* Matrix of things. */
        while (++index < length) {
          use(value[index]);
        }
      } else if (isFunction(value[1])) {
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

    /* Store attacher. */
    attachers.push(args);

    /* Use a processor (except its parser if there’s already one.
     * Note that the processor is stored on `attachers`, making
     * it possibly mutating in the future, but also ensuring
     * the parser isn’t overwritten in the future either. */
    if (isProcessor(value)) {
      parser = processor.Parser;
      result = use(value.attachers);

      if (parser) {
        processor.Parser = parser;
      }

      return result;
    }

    /* Single attacher. */
    transformer = value.apply(processor, params);

    if (isFunction(transformer)) {
      transformers.use(transformer);
    }

    return processor;
  }

  /* Parse a file (in string or VFile representation)
   * into a Unist node using the `Parser` on the
   * processor. */
  function parse(doc) {
    var file = vfile(doc);

    assertConcrete('parse');
    assertParser('parse');

    return new processor.Parser(doc.toString(), file).parse();
  }

  /* Run transforms on a Unist node representation of a file
   * (in string or VFile representation). */
  function run(node, file, done) {
    var complete = false;
    var result;

    assertConcrete('run');
    assertNode(node);

    result = node;

    if (!done && isFunction(file)) {
      done = file;
      file = null;
    }

    transformers.run(node, vfile(file), function (err, tree, file) {
      complete = true;
      result = tree || node;

      (done || bail)(err, tree, file);
    });

    assertDone('run', complete, done);

    return result;
  }

  /* Stringify a Unist node representation of a file
   * (in string or VFile representation) into a string
   * using the `Compiler` on the processor. */
  function stringify(node, file) {
    assertConcrete('stringify');
    assertCompiler('stringify');
    assertNode(node);

    return new processor.Compiler(node, vfile(file)).compile();
  }

  /* Parse a file (in string or VFile representation)
   * into a Unist node using the `Parser` on the processor,
   * then run transforms on that node, and compile the
   * resulting node using the `Compiler` on the processor,
   * and store that result on the VFile. */
  function process(doc, done) {
    var complete = false;
    var file;

    assertConcrete('process');
    assertParser('process');
    assertCompiler('process');

    file = vfile(doc);

    pipeline.run(processor, {file: file}, function (err) {
      complete = true;

      if (done) {
        done(err, file);
      } else {
        bail(err);
      }
    });

    assertDone('process', complete, done);

    return file;
  }
}

/* Check if `node` is a Unist node. */
function isNode(node) {
  return node && string(node.type) && node.type.length !== 0;
}

/* Check if `fn` is a function. */
function isFunction(fn) {
  return typeof fn === 'function';
}

/* Check if `processor` is a unified processor. */
function isProcessor(processor) {
  return isFunction(processor) && isFunction(processor.use) && isFunction(processor.process);
}
