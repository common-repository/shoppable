var $ = jQuery;
/*!

 handlebars v2.0.0

Copyright (C) 2011-2014 by Yehuda Katz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@license
*/
/* exported Handlebars */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Handlebars = root.Handlebars || factory();
  }
}(this, function () {
// handlebars/safe-string.js
var __module4__ = (function() {
  "use strict";
  var __exports__;
  // Build out our basic SafeString type
  function SafeString(string) {
    this.string = string;
  }

  SafeString.prototype.toString = function() {
    return "" + this.string;
  };

  __exports__ = SafeString;
  return __exports__;
})();

// handlebars/utils.js
var __module3__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  /*jshint -W004 */
  var SafeString = __dependency1__;

  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  function escapeChar(chr) {
    return escape[chr];
  }

  function extend(obj /* , ...source */) {
    for (var i = 1; i < arguments.length; i++) {
      for (var key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          obj[key] = arguments[i][key];
        }
      }
    }

    return obj;
  }

  __exports__.extend = extend;var toString = Object.prototype.toString;
  __exports__.toString = toString;
  // Sourced from lodash
  // https://github.com/bestiejs/lodash/blob/master/LICENSE.txt
  var isFunction = function(value) {
    return typeof value === 'function';
  };
  // fallback for older versions of Chrome and Safari
  /* istanbul ignore next */
  if (isFunction(/x/)) {
    isFunction = function(value) {
      return typeof value === 'function' && toString.call(value) === '[object Function]';
    };
  }
  var isFunction;
  __exports__.isFunction = isFunction;
  /* istanbul ignore next */
  var isArray = Array.isArray || function(value) {
    return (value && typeof value === 'object') ? toString.call(value) === '[object Array]' : false;
  };
  __exports__.isArray = isArray;

  function escapeExpression(string) {
    // don't escape SafeStrings, since they're already safe
    if (string instanceof SafeString) {
      return string.toString();
    } else if (string == null) {
      return "";
    } else if (!string) {
      return string + '';
    }

    // Force a string conversion as this will be done by the append regardless and
    // the regex test will do this transparently behind the scenes, causing issues if
    // an object's to string has escaped characters in it.
    string = "" + string;

    if(!possible.test(string)) { return string; }
    return string.replace(badChars, escapeChar);
  }

  __exports__.escapeExpression = escapeExpression;function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }

  __exports__.isEmpty = isEmpty;function appendContextPath(contextPath, id) {
    return (contextPath ? contextPath + '.' : '') + id;
  }

  __exports__.appendContextPath = appendContextPath;
  return __exports__;
})(__module4__);

// handlebars/exception.js
var __module5__ = (function() {
  "use strict";
  var __exports__;

  var errorProps = ['description', 'fileName', 'lineNumber', 'message', 'name', 'number', 'stack'];

  function Exception(message, node) {
    var line;
    if (node && node.firstLine) {
      line = node.firstLine;

      message += ' - ' + line + ':' + node.firstColumn;
    }

    var tmp = Error.prototype.constructor.call(this, message);

    // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
    for (var idx = 0; idx < errorProps.length; idx++) {
      this[errorProps[idx]] = tmp[errorProps[idx]];
    }

    if (line) {
      this.lineNumber = line;
      this.column = node.firstColumn;
    }
  }

  Exception.prototype = new Error();

  __exports__ = Exception;
  return __exports__;
})();

// handlebars/base.js
var __module2__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;

  var VERSION = "2.0.0";
  __exports__.VERSION = VERSION;var COMPILER_REVISION = 6;
  __exports__.COMPILER_REVISION = COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: '<= 1.0.rc.2', // 1.0.rc.2 is actually rev2 but doesn't report it
    2: '== 1.0.0-rc.3',
    3: '== 1.0.0-rc.4',
    4: '== 1.x.x',
    5: '== 2.0.0-alpha.x',
    6: '>= 2.0.0-beta.1'
  };
  __exports__.REVISION_CHANGES = REVISION_CHANGES;
  var isArray = Utils.isArray,
      isFunction = Utils.isFunction,
      toString = Utils.toString,
      objectType = '[object Object]';

  function HandlebarsEnvironment(helpers, partials) {
    this.helpers = helpers || {};
    this.partials = partials || {};

    registerDefaultHelpers(this);
  }

  __exports__.HandlebarsEnvironment = HandlebarsEnvironment;HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,

    logger: logger,
    log: log,

    registerHelper: function(name, fn) {
      if (toString.call(name) === objectType) {
        if (fn) { throw new Exception('Arg not supported with multiple helpers'); }
        Utils.extend(this.helpers, name);
      } else {
        this.helpers[name] = fn;
      }
    },
    unregisterHelper: function(name) {
      delete this.helpers[name];
    },

    registerPartial: function(name, partial) {
      if (toString.call(name) === objectType) {
        Utils.extend(this.partials,  name);
      } else {
        this.partials[name] = partial;
      }
    },
    unregisterPartial: function(name) {
      delete this.partials[name];
    }
  };

  function registerDefaultHelpers(instance) {
    instance.registerHelper('helperMissing', function(/* [args, ]options */) {
      if(arguments.length === 1) {
        // A missing field in a {{foo}} constuct.
        return undefined;
      } else {
        // Someone is actually trying to call something, blow up.
        throw new Exception("Missing helper: '" + arguments[arguments.length-1].name + "'");
      }
    });

    instance.registerHelper('blockHelperMissing', function(context, options) {
      var inverse = options.inverse,
          fn = options.fn;

      if(context === true) {
        return fn(this);
      } else if(context === false || context == null) {
        return inverse(this);
      } else if (isArray(context)) {
        if(context.length > 0) {
          if (options.ids) {
            options.ids = [options.name];
          }

          return instance.helpers.each(context, options);
        } else {
          return inverse(this);
        }
      } else {
        if (options.data && options.ids) {
          var data = createFrame(options.data);
          data.contextPath = Utils.appendContextPath(options.data.contextPath, options.name);
          options = {data: data};
        }

        return fn(context, options);
      }
    });

    instance.registerHelper('each', function(context, options) {
      if (!options) {
        throw new Exception('Must pass iterator to #each');
      }

      var fn = options.fn, inverse = options.inverse;
      var i = 0, ret = "", data;

      var contextPath;
      if (options.data && options.ids) {
        contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]) + '.';
      }

      if (isFunction(context)) { context = context.call(this); }

      if (options.data) {
        data = createFrame(options.data);
      }

      if(context && typeof context === 'object') {
        if (isArray(context)) {
          for(var j = context.length; i<j; i++) {
            if (data) {
              data.index = i;
              data.first = (i === 0);
              data.last  = (i === (context.length-1));

              if (contextPath) {
                data.contextPath = contextPath + i;
              }
            }
            ret = ret + fn(context[i], { data: data });
          }
        } else {
          for(var key in context) {
            if(context.hasOwnProperty(key)) {
              if(data) {
                data.key = key;
                data.index = i;
                data.first = (i === 0);

                if (contextPath) {
                  data.contextPath = contextPath + key;
                }
              }
              ret = ret + fn(context[key], {data: data});
              i++;
            }
          }
        }
      }

      if(i === 0){
        ret = inverse(this);
      }

      return ret;
    });

    instance.registerHelper('if', function(conditional, options) {
      if (isFunction(conditional)) { conditional = conditional.call(this); }

      // Default behavior is to render the positive path if the value is truthy and not empty.
      // The `includeZero` option may be set to treat the condtional as purely not empty based on the
      // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
      if ((!options.hash.includeZero && !conditional) || Utils.isEmpty(conditional)) {
        return options.inverse(this);
      } else {
        return options.fn(this);
      }
    });

    instance.registerHelper('unless', function(conditional, options) {
      return instance.helpers['if'].call(this, conditional, {fn: options.inverse, inverse: options.fn, hash: options.hash});
    });

    instance.registerHelper('with', function(context, options) {
      if (isFunction(context)) { context = context.call(this); }

      var fn = options.fn;

      if (!Utils.isEmpty(context)) {
        if (options.data && options.ids) {
          var data = createFrame(options.data);
          data.contextPath = Utils.appendContextPath(options.data.contextPath, options.ids[0]);
          options = {data:data};
        }

        return fn(context, options);
      } else {
        return options.inverse(this);
      }
    });

    instance.registerHelper('log', function(message, options) {
      var level = options.data && options.data.level != null ? parseInt(options.data.level, 10) : 1;
      instance.log(level, message);
    });

    instance.registerHelper('lookup', function(obj, field) {
      return obj && obj[field];
    });
  }

  var logger = {
    methodMap: { 0: 'debug', 1: 'info', 2: 'warn', 3: 'error' },

    // State enum
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    level: 3,

    // can be overridden in the host environment
    log: function(level, message) {
      if (logger.level <= level) {
        var method = logger.methodMap[level];
        if (typeof console !== 'undefined' && console[method]) {
          console[method].call(console, message);
        }
      }
    }
  };
  __exports__.logger = logger;
  var log = logger.log;
  __exports__.log = log;
  var createFrame = function(object) {
    var frame = Utils.extend({}, object);
    frame._parent = object;
    return frame;
  };
  __exports__.createFrame = createFrame;
  return __exports__;
})(__module3__, __module5__);

// handlebars/runtime.js
var __module6__ = (function(__dependency1__, __dependency2__, __dependency3__) {
  "use strict";
  var __exports__ = {};
  var Utils = __dependency1__;
  var Exception = __dependency2__;
  var COMPILER_REVISION = __dependency3__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency3__.REVISION_CHANGES;
  var createFrame = __dependency3__.createFrame;

  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1,
        currentRevision = COMPILER_REVISION;

    if (compilerRevision !== currentRevision) {
      if (compilerRevision < currentRevision) {
        var runtimeVersions = REVISION_CHANGES[currentRevision],
            compilerVersions = REVISION_CHANGES[compilerRevision];
        throw new Exception("Template was precompiled with an older version of Handlebars than the current runtime. "+
              "Please update your precompiler to a newer version ("+runtimeVersions+") or downgrade your runtime to an older version ("+compilerVersions+").");
      } else {
        // Use the embedded version info since the runtime doesn't know about this revision yet
        throw new Exception("Template was precompiled with a newer version of Handlebars than the current runtime. "+
              "Please update your runtime to a newer version ("+compilerInfo[1]+").");
      }
    }
  }

  __exports__.checkRevision = checkRevision;// TODO: Remove this line and break up compilePartial

  function template(templateSpec, env) {
    /* istanbul ignore next */
    if (!env) {
      throw new Exception("No environment passed to template");
    }
    if (!templateSpec || !templateSpec.main) {
      throw new Exception('Unknown template object: ' + typeof templateSpec);
    }

    // Note: Using env.VM references rather than local var references throughout this section to allow
    // for external users to override these as psuedo-supported APIs.
    env.VM.checkRevision(templateSpec.compiler);

    var invokePartialWrapper = function(partial, indent, name, context, hash, helpers, partials, data, depths) {
      if (hash) {
        context = Utils.extend({}, context, hash);
      }

      var result = env.VM.invokePartial.call(this, partial, name, context, helpers, partials, data, depths);

      if (result == null && env.compile) {
        var options = { helpers: helpers, partials: partials, data: data, depths: depths };
        partials[name] = env.compile(partial, { data: data !== undefined, compat: templateSpec.compat }, env);
        result = partials[name](context, options);
      }
      if (result != null) {
        if (indent) {
          var lines = result.split('\n');
          for (var i = 0, l = lines.length; i < l; i++) {
            if (!lines[i] && i + 1 === l) {
              break;
            }

            lines[i] = indent + lines[i];
          }
          result = lines.join('\n');
        }
        return result;
      } else {
        throw new Exception("The partial " + name + " could not be compiled when running in runtime-only mode");
      }
    };

    // Just add water
    var container = {
      lookup: function(depths, name) {
        var len = depths.length;
        for (var i = 0; i < len; i++) {
          if (depths[i] && depths[i][name] != null) {
            return depths[i][name];
          }
        }
      },
      lambda: function(current, context) {
        return typeof current === 'function' ? current.call(context) : current;
      },

      escapeExpression: Utils.escapeExpression,
      invokePartial: invokePartialWrapper,

      fn: function(i) {
        return templateSpec[i];
      },

      programs: [],
      program: function(i, data, depths) {
        var programWrapper = this.programs[i],
            fn = this.fn(i);
        if (data || depths) {
          programWrapper = program(this, i, fn, data, depths);
        } else if (!programWrapper) {
          programWrapper = this.programs[i] = program(this, i, fn);
        }
        return programWrapper;
      },

      data: function(data, depth) {
        while (data && depth--) {
          data = data._parent;
        }
        return data;
      },
      merge: function(param, common) {
        var ret = param || common;

        if (param && common && (param !== common)) {
          ret = Utils.extend({}, common, param);
        }

        return ret;
      },

      noop: env.VM.noop,
      compilerInfo: templateSpec.compiler
    };

    var ret = function(context, options) {
      options = options || {};
      var data = options.data;

      ret._setup(options);
      if (!options.partial && templateSpec.useData) {
        data = initData(context, data);
      }
      var depths;
      if (templateSpec.useDepths) {
        depths = options.depths ? [context].concat(options.depths) : [context];
      }

      return templateSpec.main.call(container, context, container.helpers, container.partials, data, depths);
    };
    ret.isTop = true;

    ret._setup = function(options) {
      if (!options.partial) {
        container.helpers = container.merge(options.helpers, env.helpers);

        if (templateSpec.usePartial) {
          container.partials = container.merge(options.partials, env.partials);
        }
      } else {
        container.helpers = options.helpers;
        container.partials = options.partials;
      }
    };

    ret._child = function(i, data, depths) {
      if (templateSpec.useDepths && !depths) {
        throw new Exception('must pass parent depths');
      }

      return program(container, i, templateSpec[i], data, depths);
    };
    return ret;
  }

  __exports__.template = template;function program(container, i, fn, data, depths) {
    var prog = function(context, options) {
      options = options || {};

      return fn.call(container, context, container.helpers, container.partials, options.data || data, depths && [context].concat(depths));
    };
    prog.program = i;
    prog.depth = depths ? depths.length : 0;
    return prog;
  }

  __exports__.program = program;function invokePartial(partial, name, context, helpers, partials, data, depths) {
    var options = { partial: true, helpers: helpers, partials: partials, data: data, depths: depths };

    if(partial === undefined) {
      throw new Exception("The partial " + name + " could not be found");
    } else if(partial instanceof Function) {
      return partial(context, options);
    }
  }

  __exports__.invokePartial = invokePartial;function noop() { return ""; }

  __exports__.noop = noop;function initData(context, data) {
    if (!data || !('root' in data)) {
      data = data ? createFrame(data) : {};
      data.root = context;
    }
    return data;
  }
  return __exports__;
})(__module3__, __module5__, __module2__);

// handlebars.runtime.js
var __module1__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  /*globals Handlebars: true */
  var base = __dependency1__;

  // Each of these augment the Handlebars object. No need to setup here.
  // (This is done to easily share code between commonjs and browse envs)
  var SafeString = __dependency2__;
  var Exception = __dependency3__;
  var Utils = __dependency4__;
  var runtime = __dependency5__;

  // For compatibility and usage outside of module systems, make the Handlebars object a namespace
  var create = function() {
    var hb = new base.HandlebarsEnvironment();

    Utils.extend(hb, base);
    hb.SafeString = SafeString;
    hb.Exception = Exception;
    hb.Utils = Utils;
    hb.escapeExpression = Utils.escapeExpression;

    hb.VM = runtime;
    hb.template = function(spec) {
      return runtime.template(spec, hb);
    };

    return hb;
  };

  var Handlebars = create();
  Handlebars.create = create;

  Handlebars['default'] = Handlebars;

  __exports__ = Handlebars;
  return __exports__;
})(__module2__, __module4__, __module5__, __module3__, __module6__);

// handlebars/compiler/ast.js
var __module7__ = (function(__dependency1__) {
  "use strict";
  var __exports__;
  var Exception = __dependency1__;

  function LocationInfo(locInfo) {
    locInfo = locInfo || {};
    this.firstLine   = locInfo.first_line;
    this.firstColumn = locInfo.first_column;
    this.lastColumn  = locInfo.last_column;
    this.lastLine    = locInfo.last_line;
  }

  var AST = {
    ProgramNode: function(statements, strip, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "program";
      this.statements = statements;
      this.strip = strip;
    },

    MustacheNode: function(rawParams, hash, open, strip, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "mustache";
      this.strip = strip;

      // Open may be a string parsed from the parser or a passed boolean flag
      if (open != null && open.charAt) {
        // Must use charAt to support IE pre-10
        var escapeFlag = open.charAt(3) || open.charAt(2);
        this.escaped = escapeFlag !== '{' && escapeFlag !== '&';
      } else {
        this.escaped = !!open;
      }

      if (rawParams instanceof AST.SexprNode) {
        this.sexpr = rawParams;
      } else {
        // Support old AST API
        this.sexpr = new AST.SexprNode(rawParams, hash);
      }

      // Support old AST API that stored this info in MustacheNode
      this.id = this.sexpr.id;
      this.params = this.sexpr.params;
      this.hash = this.sexpr.hash;
      this.eligibleHelper = this.sexpr.eligibleHelper;
      this.isHelper = this.sexpr.isHelper;
    },

    SexprNode: function(rawParams, hash, locInfo) {
      LocationInfo.call(this, locInfo);

      this.type = "sexpr";
      this.hash = hash;

      var id = this.id = rawParams[0];
      var params = this.params = rawParams.slice(1);

      // a mustache is definitely a helper if:
      // * it is an eligible helper, and
      // * it has at least one parameter or hash segment
      this.isHelper = !!(params.length || hash);

      // a mustache is an eligible helper if:
      // * its id is simple (a single part, not `this` or `..`)
      this.eligibleHelper = this.isHelper || id.isSimple;

      // if a mustache is an eligible helper but not a definite
      // helper, it is ambiguous, and will be resolved in a later
      // pass or at runtime.
    },

    PartialNode: function(partialName, context, hash, strip, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type         = "partial";
      this.partialName  = partialName;
      this.context      = context;
      this.hash = hash;
      this.strip = strip;

      this.strip.inlineStandalone = true;
    },

    BlockNode: function(mustache, program, inverse, strip, locInfo) {
      LocationInfo.call(this, locInfo);

      this.type = 'block';
      this.mustache = mustache;
      this.program  = program;
      this.inverse  = inverse;
      this.strip = strip;

      if (inverse && !program) {
        this.isInverse = true;
      }
    },

    RawBlockNode: function(mustache, content, close, locInfo) {
      LocationInfo.call(this, locInfo);

      if (mustache.sexpr.id.original !== close) {
        throw new Exception(mustache.sexpr.id.original + " doesn't match " + close, this);
      }

      content = new AST.ContentNode(content, locInfo);

      this.type = 'block';
      this.mustache = mustache;
      this.program = new AST.ProgramNode([content], {}, locInfo);
    },

    ContentNode: function(string, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "content";
      this.original = this.string = string;
    },

    HashNode: function(pairs, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "hash";
      this.pairs = pairs;
    },

    IdNode: function(parts, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "ID";

      var original = "",
          dig = [],
          depth = 0,
          depthString = '';

      for(var i=0,l=parts.length; i<l; i++) {
        var part = parts[i].part;
        original += (parts[i].separator || '') + part;

        if (part === ".." || part === "." || part === "this") {
          if (dig.length > 0) {
            throw new Exception("Invalid path: " + original, this);
          } else if (part === "..") {
            depth++;
            depthString += '../';
          } else {
            this.isScoped = true;
          }
        } else {
          dig.push(part);
        }
      }

      this.original = original;
      this.parts    = dig;
      this.string   = dig.join('.');
      this.depth    = depth;
      this.idName   = depthString + this.string;

      // an ID is simple if it only has one part, and that part is not
      // `..` or `this`.
      this.isSimple = parts.length === 1 && !this.isScoped && depth === 0;

      this.stringModeValue = this.string;
    },

    PartialNameNode: function(name, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "PARTIAL_NAME";
      this.name = name.original;
    },

    DataNode: function(id, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "DATA";
      this.id = id;
      this.stringModeValue = id.stringModeValue;
      this.idName = '@' + id.stringModeValue;
    },

    StringNode: function(string, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "STRING";
      this.original =
        this.string =
        this.stringModeValue = string;
    },

    NumberNode: function(number, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "NUMBER";
      this.original =
        this.number = number;
      this.stringModeValue = Number(number);
    },

    BooleanNode: function(bool, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "BOOLEAN";
      this.bool = bool;
      this.stringModeValue = bool === "true";
    },

    CommentNode: function(comment, locInfo) {
      LocationInfo.call(this, locInfo);
      this.type = "comment";
      this.comment = comment;

      this.strip = {
        inlineStandalone: true
      };
    }
  };


  // Must be exported as an object rather than the root of the module as the jison lexer
  // most modify the object to operate properly.
  __exports__ = AST;
  return __exports__;
})(__module5__);

// handlebars/compiler/parser.js
var __module9__ = (function() {
  "use strict";
  var __exports__;
  /* jshint ignore:start */
  /* istanbul ignore next */
  /* Jison generated parser */
  var handlebars = (function(){
  var parser = {trace: function trace() { },
  yy: {},
  symbols_: {"error":2,"root":3,"program":4,"EOF":5,"program_repetition0":6,"statement":7,"mustache":8,"block":9,"rawBlock":10,"partial":11,"CONTENT":12,"COMMENT":13,"openRawBlock":14,"END_RAW_BLOCK":15,"OPEN_RAW_BLOCK":16,"sexpr":17,"CLOSE_RAW_BLOCK":18,"openBlock":19,"block_option0":20,"closeBlock":21,"openInverse":22,"block_option1":23,"OPEN_BLOCK":24,"CLOSE":25,"OPEN_INVERSE":26,"inverseAndProgram":27,"INVERSE":28,"OPEN_ENDBLOCK":29,"path":30,"OPEN":31,"OPEN_UNESCAPED":32,"CLOSE_UNESCAPED":33,"OPEN_PARTIAL":34,"partialName":35,"param":36,"partial_option0":37,"partial_option1":38,"sexpr_repetition0":39,"sexpr_option0":40,"dataName":41,"STRING":42,"NUMBER":43,"BOOLEAN":44,"OPEN_SEXPR":45,"CLOSE_SEXPR":46,"hash":47,"hash_repetition_plus0":48,"hashSegment":49,"ID":50,"EQUALS":51,"DATA":52,"pathSegments":53,"SEP":54,"$accept":0,"$end":1},
  terminals_: {2:"error",5:"EOF",12:"CONTENT",13:"COMMENT",15:"END_RAW_BLOCK",16:"OPEN_RAW_BLOCK",18:"CLOSE_RAW_BLOCK",24:"OPEN_BLOCK",25:"CLOSE",26:"OPEN_INVERSE",28:"INVERSE",29:"OPEN_ENDBLOCK",31:"OPEN",32:"OPEN_UNESCAPED",33:"CLOSE_UNESCAPED",34:"OPEN_PARTIAL",42:"STRING",43:"NUMBER",44:"BOOLEAN",45:"OPEN_SEXPR",46:"CLOSE_SEXPR",50:"ID",51:"EQUALS",52:"DATA",54:"SEP"},
  productions_: [0,[3,2],[4,1],[7,1],[7,1],[7,1],[7,1],[7,1],[7,1],[10,3],[14,3],[9,4],[9,4],[19,3],[22,3],[27,2],[21,3],[8,3],[8,3],[11,5],[11,4],[17,3],[17,1],[36,1],[36,1],[36,1],[36,1],[36,1],[36,3],[47,1],[49,3],[35,1],[35,1],[35,1],[41,2],[30,1],[53,3],[53,1],[6,0],[6,2],[20,0],[20,1],[23,0],[23,1],[37,0],[37,1],[38,0],[38,1],[39,0],[39,2],[40,0],[40,1],[48,1],[48,2]],
  performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

  var $0 = $$.length - 1;
  switch (yystate) {
  case 1: yy.prepareProgram($$[$0-1].statements, true); return $$[$0-1];
  break;
  case 2:this.$ = new yy.ProgramNode(yy.prepareProgram($$[$0]), {}, this._$);
  break;
  case 3:this.$ = $$[$0];
  break;
  case 4:this.$ = $$[$0];
  break;
  case 5:this.$ = $$[$0];
  break;
  case 6:this.$ = $$[$0];
  break;
  case 7:this.$ = new yy.ContentNode($$[$0], this._$);
  break;
  case 8:this.$ = new yy.CommentNode($$[$0], this._$);
  break;
  case 9:this.$ = new yy.RawBlockNode($$[$0-2], $$[$0-1], $$[$0], this._$);
  break;
  case 10:this.$ = new yy.MustacheNode($$[$0-1], null, '', '', this._$);
  break;
  case 11:this.$ = yy.prepareBlock($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], false, this._$);
  break;
  case 12:this.$ = yy.prepareBlock($$[$0-3], $$[$0-2], $$[$0-1], $$[$0], true, this._$);
  break;
  case 13:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], yy.stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 14:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], yy.stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 15:this.$ = { strip: yy.stripFlags($$[$0-1], $$[$0-1]), program: $$[$0] };
  break;
  case 16:this.$ = {path: $$[$0-1], strip: yy.stripFlags($$[$0-2], $$[$0])};
  break;
  case 17:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], yy.stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 18:this.$ = new yy.MustacheNode($$[$0-1], null, $$[$0-2], yy.stripFlags($$[$0-2], $$[$0]), this._$);
  break;
  case 19:this.$ = new yy.PartialNode($$[$0-3], $$[$0-2], $$[$0-1], yy.stripFlags($$[$0-4], $$[$0]), this._$);
  break;
  case 20:this.$ = new yy.PartialNode($$[$0-2], undefined, $$[$0-1], yy.stripFlags($$[$0-3], $$[$0]), this._$);
  break;
  case 21:this.$ = new yy.SexprNode([$$[$0-2]].concat($$[$0-1]), $$[$0], this._$);
  break;
  case 22:this.$ = new yy.SexprNode([$$[$0]], null, this._$);
  break;
  case 23:this.$ = $$[$0];
  break;
  case 24:this.$ = new yy.StringNode($$[$0], this._$);
  break;
  case 25:this.$ = new yy.NumberNode($$[$0], this._$);
  break;
  case 26:this.$ = new yy.BooleanNode($$[$0], this._$);
  break;
  case 27:this.$ = $$[$0];
  break;
  case 28:$$[$0-1].isHelper = true; this.$ = $$[$0-1];
  break;
  case 29:this.$ = new yy.HashNode($$[$0], this._$);
  break;
  case 30:this.$ = [$$[$0-2], $$[$0]];
  break;
  case 31:this.$ = new yy.PartialNameNode($$[$0], this._$);
  break;
  case 32:this.$ = new yy.PartialNameNode(new yy.StringNode($$[$0], this._$), this._$);
  break;
  case 33:this.$ = new yy.PartialNameNode(new yy.NumberNode($$[$0], this._$));
  break;
  case 34:this.$ = new yy.DataNode($$[$0], this._$);
  break;
  case 35:this.$ = new yy.IdNode($$[$0], this._$);
  break;
  case 36: $$[$0-2].push({part: $$[$0], separator: $$[$0-1]}); this.$ = $$[$0-2];
  break;
  case 37:this.$ = [{part: $$[$0]}];
  break;
  case 38:this.$ = [];
  break;
  case 39:$$[$0-1].push($$[$0]);
  break;
  case 48:this.$ = [];
  break;
  case 49:$$[$0-1].push($$[$0]);
  break;
  case 52:this.$ = [$$[$0]];
  break;
  case 53:$$[$0-1].push($$[$0]);
  break;
  }
  },
  table: [{3:1,4:2,5:[2,38],6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],31:[2,38],32:[2,38],34:[2,38]},{1:[3]},{5:[1,4]},{5:[2,2],7:5,8:6,9:7,10:8,11:9,12:[1,10],13:[1,11],14:16,16:[1,20],19:14,22:15,24:[1,18],26:[1,19],28:[2,2],29:[2,2],31:[1,12],32:[1,13],34:[1,17]},{1:[2,1]},{5:[2,39],12:[2,39],13:[2,39],16:[2,39],24:[2,39],26:[2,39],28:[2,39],29:[2,39],31:[2,39],32:[2,39],34:[2,39]},{5:[2,3],12:[2,3],13:[2,3],16:[2,3],24:[2,3],26:[2,3],28:[2,3],29:[2,3],31:[2,3],32:[2,3],34:[2,3]},{5:[2,4],12:[2,4],13:[2,4],16:[2,4],24:[2,4],26:[2,4],28:[2,4],29:[2,4],31:[2,4],32:[2,4],34:[2,4]},{5:[2,5],12:[2,5],13:[2,5],16:[2,5],24:[2,5],26:[2,5],28:[2,5],29:[2,5],31:[2,5],32:[2,5],34:[2,5]},{5:[2,6],12:[2,6],13:[2,6],16:[2,6],24:[2,6],26:[2,6],28:[2,6],29:[2,6],31:[2,6],32:[2,6],34:[2,6]},{5:[2,7],12:[2,7],13:[2,7],16:[2,7],24:[2,7],26:[2,7],28:[2,7],29:[2,7],31:[2,7],32:[2,7],34:[2,7]},{5:[2,8],12:[2,8],13:[2,8],16:[2,8],24:[2,8],26:[2,8],28:[2,8],29:[2,8],31:[2,8],32:[2,8],34:[2,8]},{17:21,30:22,41:23,50:[1,26],52:[1,25],53:24},{17:27,30:22,41:23,50:[1,26],52:[1,25],53:24},{4:28,6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],28:[2,38],29:[2,38],31:[2,38],32:[2,38],34:[2,38]},{4:29,6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],28:[2,38],29:[2,38],31:[2,38],32:[2,38],34:[2,38]},{12:[1,30]},{30:32,35:31,42:[1,33],43:[1,34],50:[1,26],53:24},{17:35,30:22,41:23,50:[1,26],52:[1,25],53:24},{17:36,30:22,41:23,50:[1,26],52:[1,25],53:24},{17:37,30:22,41:23,50:[1,26],52:[1,25],53:24},{25:[1,38]},{18:[2,48],25:[2,48],33:[2,48],39:39,42:[2,48],43:[2,48],44:[2,48],45:[2,48],46:[2,48],50:[2,48],52:[2,48]},{18:[2,22],25:[2,22],33:[2,22],46:[2,22]},{18:[2,35],25:[2,35],33:[2,35],42:[2,35],43:[2,35],44:[2,35],45:[2,35],46:[2,35],50:[2,35],52:[2,35],54:[1,40]},{30:41,50:[1,26],53:24},{18:[2,37],25:[2,37],33:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],46:[2,37],50:[2,37],52:[2,37],54:[2,37]},{33:[1,42]},{20:43,27:44,28:[1,45],29:[2,40]},{23:46,27:47,28:[1,45],29:[2,42]},{15:[1,48]},{25:[2,46],30:51,36:49,38:50,41:55,42:[1,52],43:[1,53],44:[1,54],45:[1,56],47:57,48:58,49:60,50:[1,59],52:[1,25],53:24},{25:[2,31],42:[2,31],43:[2,31],44:[2,31],45:[2,31],50:[2,31],52:[2,31]},{25:[2,32],42:[2,32],43:[2,32],44:[2,32],45:[2,32],50:[2,32],52:[2,32]},{25:[2,33],42:[2,33],43:[2,33],44:[2,33],45:[2,33],50:[2,33],52:[2,33]},{25:[1,61]},{25:[1,62]},{18:[1,63]},{5:[2,17],12:[2,17],13:[2,17],16:[2,17],24:[2,17],26:[2,17],28:[2,17],29:[2,17],31:[2,17],32:[2,17],34:[2,17]},{18:[2,50],25:[2,50],30:51,33:[2,50],36:65,40:64,41:55,42:[1,52],43:[1,53],44:[1,54],45:[1,56],46:[2,50],47:66,48:58,49:60,50:[1,59],52:[1,25],53:24},{50:[1,67]},{18:[2,34],25:[2,34],33:[2,34],42:[2,34],43:[2,34],44:[2,34],45:[2,34],46:[2,34],50:[2,34],52:[2,34]},{5:[2,18],12:[2,18],13:[2,18],16:[2,18],24:[2,18],26:[2,18],28:[2,18],29:[2,18],31:[2,18],32:[2,18],34:[2,18]},{21:68,29:[1,69]},{29:[2,41]},{4:70,6:3,12:[2,38],13:[2,38],16:[2,38],24:[2,38],26:[2,38],29:[2,38],31:[2,38],32:[2,38],34:[2,38]},{21:71,29:[1,69]},{29:[2,43]},{5:[2,9],12:[2,9],13:[2,9],16:[2,9],24:[2,9],26:[2,9],28:[2,9],29:[2,9],31:[2,9],32:[2,9],34:[2,9]},{25:[2,44],37:72,47:73,48:58,49:60,50:[1,74]},{25:[1,75]},{18:[2,23],25:[2,23],33:[2,23],42:[2,23],43:[2,23],44:[2,23],45:[2,23],46:[2,23],50:[2,23],52:[2,23]},{18:[2,24],25:[2,24],33:[2,24],42:[2,24],43:[2,24],44:[2,24],45:[2,24],46:[2,24],50:[2,24],52:[2,24]},{18:[2,25],25:[2,25],33:[2,25],42:[2,25],43:[2,25],44:[2,25],45:[2,25],46:[2,25],50:[2,25],52:[2,25]},{18:[2,26],25:[2,26],33:[2,26],42:[2,26],43:[2,26],44:[2,26],45:[2,26],46:[2,26],50:[2,26],52:[2,26]},{18:[2,27],25:[2,27],33:[2,27],42:[2,27],43:[2,27],44:[2,27],45:[2,27],46:[2,27],50:[2,27],52:[2,27]},{17:76,30:22,41:23,50:[1,26],52:[1,25],53:24},{25:[2,47]},{18:[2,29],25:[2,29],33:[2,29],46:[2,29],49:77,50:[1,74]},{18:[2,37],25:[2,37],33:[2,37],42:[2,37],43:[2,37],44:[2,37],45:[2,37],46:[2,37],50:[2,37],51:[1,78],52:[2,37],54:[2,37]},{18:[2,52],25:[2,52],33:[2,52],46:[2,52],50:[2,52]},{12:[2,13],13:[2,13],16:[2,13],24:[2,13],26:[2,13],28:[2,13],29:[2,13],31:[2,13],32:[2,13],34:[2,13]},{12:[2,14],13:[2,14],16:[2,14],24:[2,14],26:[2,14],28:[2,14],29:[2,14],31:[2,14],32:[2,14],34:[2,14]},{12:[2,10]},{18:[2,21],25:[2,21],33:[2,21],46:[2,21]},{18:[2,49],25:[2,49],33:[2,49],42:[2,49],43:[2,49],44:[2,49],45:[2,49],46:[2,49],50:[2,49],52:[2,49]},{18:[2,51],25:[2,51],33:[2,51],46:[2,51]},{18:[2,36],25:[2,36],33:[2,36],42:[2,36],43:[2,36],44:[2,36],45:[2,36],46:[2,36],50:[2,36],52:[2,36],54:[2,36]},{5:[2,11],12:[2,11],13:[2,11],16:[2,11],24:[2,11],26:[2,11],28:[2,11],29:[2,11],31:[2,11],32:[2,11],34:[2,11]},{30:79,50:[1,26],53:24},{29:[2,15]},{5:[2,12],12:[2,12],13:[2,12],16:[2,12],24:[2,12],26:[2,12],28:[2,12],29:[2,12],31:[2,12],32:[2,12],34:[2,12]},{25:[1,80]},{25:[2,45]},{51:[1,78]},{5:[2,20],12:[2,20],13:[2,20],16:[2,20],24:[2,20],26:[2,20],28:[2,20],29:[2,20],31:[2,20],32:[2,20],34:[2,20]},{46:[1,81]},{18:[2,53],25:[2,53],33:[2,53],46:[2,53],50:[2,53]},{30:51,36:82,41:55,42:[1,52],43:[1,53],44:[1,54],45:[1,56],50:[1,26],52:[1,25],53:24},{25:[1,83]},{5:[2,19],12:[2,19],13:[2,19],16:[2,19],24:[2,19],26:[2,19],28:[2,19],29:[2,19],31:[2,19],32:[2,19],34:[2,19]},{18:[2,28],25:[2,28],33:[2,28],42:[2,28],43:[2,28],44:[2,28],45:[2,28],46:[2,28],50:[2,28],52:[2,28]},{18:[2,30],25:[2,30],33:[2,30],46:[2,30],50:[2,30]},{5:[2,16],12:[2,16],13:[2,16],16:[2,16],24:[2,16],26:[2,16],28:[2,16],29:[2,16],31:[2,16],32:[2,16],34:[2,16]}],
  defaultActions: {4:[2,1],44:[2,41],47:[2,43],57:[2,47],63:[2,10],70:[2,15],73:[2,45]},
  parseError: function parseError(str, hash) {
      throw new Error(str);
  },
  parse: function parse(input) {
      var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
      this.lexer.setInput(input);
      this.lexer.yy = this.yy;
      this.yy.lexer = this.lexer;
      this.yy.parser = this;
      if (typeof this.lexer.yylloc == "undefined")
          this.lexer.yylloc = {};
      var yyloc = this.lexer.yylloc;
      lstack.push(yyloc);
      var ranges = this.lexer.options && this.lexer.options.ranges;
      if (typeof this.yy.parseError === "function")
          this.parseError = this.yy.parseError;
      function popStack(n) {
          stack.length = stack.length - 2 * n;
          vstack.length = vstack.length - n;
          lstack.length = lstack.length - n;
      }
      function lex() {
          var token;
          token = self.lexer.lex() || 1;
          if (typeof token !== "number") {
              token = self.symbols_[token] || token;
          }
          return token;
      }
      var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
      while (true) {
          state = stack[stack.length - 1];
          if (this.defaultActions[state]) {
              action = this.defaultActions[state];
          } else {
              if (symbol === null || typeof symbol == "undefined") {
                  symbol = lex();
              }
              action = table[state] && table[state][symbol];
          }
          if (typeof action === "undefined" || !action.length || !action[0]) {
              var errStr = "";
              if (!recovering) {
                  expected = [];
                  for (p in table[state])
                      if (this.terminals_[p] && p > 2) {
                          expected.push("'" + this.terminals_[p] + "'");
                      }
                  if (this.lexer.showPosition) {
                      errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                  } else {
                      errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1?"end of input":"'" + (this.terminals_[symbol] || symbol) + "'");
                  }
                  this.parseError(errStr, {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
              }
          }
          if (action[0] instanceof Array && action.length > 1) {
              throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
          }
          switch (action[0]) {
          case 1:
              stack.push(symbol);
              vstack.push(this.lexer.yytext);
              lstack.push(this.lexer.yylloc);
              stack.push(action[1]);
              symbol = null;
              if (!preErrorSymbol) {
                  yyleng = this.lexer.yyleng;
                  yytext = this.lexer.yytext;
                  yylineno = this.lexer.yylineno;
                  yyloc = this.lexer.yylloc;
                  if (recovering > 0)
                      recovering--;
              } else {
                  symbol = preErrorSymbol;
                  preErrorSymbol = null;
              }
              break;
          case 2:
              len = this.productions_[action[1]][1];
              yyval.$ = vstack[vstack.length - len];
              yyval._$ = {first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column};
              if (ranges) {
                  yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
              }
              r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
              if (typeof r !== "undefined") {
                  return r;
              }
              if (len) {
                  stack = stack.slice(0, -1 * len * 2);
                  vstack = vstack.slice(0, -1 * len);
                  lstack = lstack.slice(0, -1 * len);
              }
              stack.push(this.productions_[action[1]][0]);
              vstack.push(yyval.$);
              lstack.push(yyval._$);
              newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
              stack.push(newState);
              break;
          case 3:
              return true;
          }
      }
      return true;
  }
  };
  /* Jison generated lexer */
  var lexer = (function(){
  var lexer = ({EOF:1,
  parseError:function parseError(str, hash) {
          if (this.yy.parser) {
              this.yy.parser.parseError(str, hash);
          } else {
              throw new Error(str);
          }
      },
  setInput:function (input) {
          this._input = input;
          this._more = this._less = this.done = false;
          this.yylineno = this.yyleng = 0;
          this.yytext = this.matched = this.match = '';
          this.conditionStack = ['INITIAL'];
          this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
          if (this.options.ranges) this.yylloc.range = [0,0];
          this.offset = 0;
          return this;
      },
  input:function () {
          var ch = this._input[0];
          this.yytext += ch;
          this.yyleng++;
          this.offset++;
          this.match += ch;
          this.matched += ch;
          var lines = ch.match(/(?:\r\n?|\n).*/g);
          if (lines) {
              this.yylineno++;
              this.yylloc.last_line++;
          } else {
              this.yylloc.last_column++;
          }
          if (this.options.ranges) this.yylloc.range[1]++;

          this._input = this._input.slice(1);
          return ch;
      },
  unput:function (ch) {
          var len = ch.length;
          var lines = ch.split(/(?:\r\n?|\n)/g);

          this._input = ch + this._input;
          this.yytext = this.yytext.substr(0, this.yytext.length-len-1);
          //this.yyleng -= len;
          this.offset -= len;
          var oldLines = this.match.split(/(?:\r\n?|\n)/g);
          this.match = this.match.substr(0, this.match.length-1);
          this.matched = this.matched.substr(0, this.matched.length-1);

          if (lines.length-1) this.yylineno -= lines.length-1;
          var r = this.yylloc.range;

          this.yylloc = {first_line: this.yylloc.first_line,
            last_line: this.yylineno+1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length:
                this.yylloc.first_column - len
            };

          if (this.options.ranges) {
              this.yylloc.range = [r[0], r[0] + this.yyleng - len];
          }
          return this;
      },
  more:function () {
          this._more = true;
          return this;
      },
  less:function (n) {
          this.unput(this.match.slice(n));
      },
  pastInput:function () {
          var past = this.matched.substr(0, this.matched.length - this.match.length);
          return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
      },
  upcomingInput:function () {
          var next = this.match;
          if (next.length < 20) {
              next += this._input.substr(0, 20-next.length);
          }
          return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
      },
  showPosition:function () {
          var pre = this.pastInput();
          var c = new Array(pre.length + 1).join("-");
          return pre + this.upcomingInput() + "\n" + c+"^";
      },
  next:function () {
          if (this.done) {
              return this.EOF;
          }
          if (!this._input) this.done = true;

          var token,
              match,
              tempMatch,
              index,
              col,
              lines;
          if (!this._more) {
              this.yytext = '';
              this.match = '';
          }
          var rules = this._currentRules();
          for (var i=0;i < rules.length; i++) {
              tempMatch = this._input.match(this.rules[rules[i]]);
              if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                  match = tempMatch;
                  index = i;
                  if (!this.options.flex) break;
              }
          }
          if (match) {
              lines = match[0].match(/(?:\r\n?|\n).*/g);
              if (lines) this.yylineno += lines.length;
              this.yylloc = {first_line: this.yylloc.last_line,
                             last_line: this.yylineno+1,
                             first_column: this.yylloc.last_column,
                             last_column: lines ? lines[lines.length-1].length-lines[lines.length-1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length};
              this.yytext += match[0];
              this.match += match[0];
              this.matches = match;
              this.yyleng = this.yytext.length;
              if (this.options.ranges) {
                  this.yylloc.range = [this.offset, this.offset += this.yyleng];
              }
              this._more = false;
              this._input = this._input.slice(match[0].length);
              this.matched += match[0];
              token = this.performAction.call(this, this.yy, this, rules[index],this.conditionStack[this.conditionStack.length-1]);
              if (this.done && this._input) this.done = false;
              if (token) return token;
              else return;
          }
          if (this._input === "") {
              return this.EOF;
          } else {
              return this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(),
                      {text: "", token: null, line: this.yylineno});
          }
      },
  lex:function lex() {
          var r = this.next();
          if (typeof r !== 'undefined') {
              return r;
          } else {
              return this.lex();
          }
      },
  begin:function begin(condition) {
          this.conditionStack.push(condition);
      },
  popState:function popState() {
          return this.conditionStack.pop();
      },
  _currentRules:function _currentRules() {
          return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
      },
  topState:function () {
          return this.conditionStack[this.conditionStack.length-2];
      },
  pushState:function begin(condition) {
          this.begin(condition);
      }});
  lexer.options = {};
  lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {


  function strip(start, end) {
    return yy_.yytext = yy_.yytext.substr(start, yy_.yyleng-end);
  }


  var YYSTATE=YY_START
  switch($avoiding_name_collisions) {
  case 0:
                                     if(yy_.yytext.slice(-2) === "\\\\") {
                                       strip(0,1);
                                       this.begin("mu");
                                     } else if(yy_.yytext.slice(-1) === "\\") {
                                       strip(0,1);
                                       this.begin("emu");
                                     } else {
                                       this.begin("mu");
                                     }
                                     if(yy_.yytext) return 12;

  break;
  case 1:return 12;
  break;
  case 2:
                                     this.popState();
                                     return 12;

  break;
  case 3:
                                    yy_.yytext = yy_.yytext.substr(5, yy_.yyleng-9);
                                    this.popState();
                                    return 15;

  break;
  case 4: return 12;
  break;
  case 5:strip(0,4); this.popState(); return 13;
  break;
  case 6:return 45;
  break;
  case 7:return 46;
  break;
  case 8: return 16;
  break;
  case 9:
                                    this.popState();
                                    this.begin('raw');
                                    return 18;

  break;
  case 10:return 34;
  break;
  case 11:return 24;
  break;
  case 12:return 29;
  break;
  case 13:this.popState(); return 28;
  break;
  case 14:this.popState(); return 28;
  break;
  case 15:return 26;
  break;
  case 16:return 26;
  break;
  case 17:return 32;
  break;
  case 18:return 31;
  break;
  case 19:this.popState(); this.begin('com');
  break;
  case 20:strip(3,5); this.popState(); return 13;
  break;
  case 21:return 31;
  break;
  case 22:return 51;
  break;
  case 23:return 50;
  break;
  case 24:return 50;
  break;
  case 25:return 54;
  break;
  case 26:// ignore whitespace
  break;
  case 27:this.popState(); return 33;
  break;
  case 28:this.popState(); return 25;
  break;
  case 29:yy_.yytext = strip(1,2).replace(/\\"/g,'"'); return 42;
  break;
  case 30:yy_.yytext = strip(1,2).replace(/\\'/g,"'"); return 42;
  break;
  case 31:return 52;
  break;
  case 32:return 44;
  break;
  case 33:return 44;
  break;
  case 34:return 43;
  break;
  case 35:return 50;
  break;
  case 36:yy_.yytext = strip(1,2); return 50;
  break;
  case 37:return 'INVALID';
  break;
  case 38:return 5;
  break;
  }
  };
  lexer.rules = [/^(?:[^\x00]*?(?=(\{\{)))/,/^(?:[^\x00]+)/,/^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/,/^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/,/^(?:[^\x00]*?(?=(\{\{\{\{\/)))/,/^(?:[\s\S]*?--\}\})/,/^(?:\()/,/^(?:\))/,/^(?:\{\{\{\{)/,/^(?:\}\}\}\})/,/^(?:\{\{(~)?>)/,/^(?:\{\{(~)?#)/,/^(?:\{\{(~)?\/)/,/^(?:\{\{(~)?\^\s*(~)?\}\})/,/^(?:\{\{(~)?\s*else\s*(~)?\}\})/,/^(?:\{\{(~)?\^)/,/^(?:\{\{(~)?\s*else\b)/,/^(?:\{\{(~)?\{)/,/^(?:\{\{(~)?&)/,/^(?:\{\{!--)/,/^(?:\{\{![\s\S]*?\}\})/,/^(?:\{\{(~)?)/,/^(?:=)/,/^(?:\.\.)/,/^(?:\.(?=([=~}\s\/.)])))/,/^(?:[\/.])/,/^(?:\s+)/,/^(?:\}(~)?\}\})/,/^(?:(~)?\}\})/,/^(?:"(\\["]|[^"])*")/,/^(?:'(\\[']|[^'])*')/,/^(?:@)/,/^(?:true(?=([~}\s)])))/,/^(?:false(?=([~}\s)])))/,/^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/,/^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)]))))/,/^(?:\[[^\]]*\])/,/^(?:.)/,/^(?:$)/];
  lexer.conditions = {"mu":{"rules":[6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38],"inclusive":false},"emu":{"rules":[2],"inclusive":false},"com":{"rules":[5],"inclusive":false},"raw":{"rules":[3,4],"inclusive":false},"INITIAL":{"rules":[0,1,38],"inclusive":true}};
  return lexer;})()
  parser.lexer = lexer;
  function Parser () { this.yy = {}; }Parser.prototype = parser;parser.Parser = Parser;
  return new Parser;
  })();__exports__ = handlebars;
  /* jshint ignore:end */
  return __exports__;
})();

// handlebars/compiler/helpers.js
var __module10__ = (function(__dependency1__) {
  "use strict";
  var __exports__ = {};
  var Exception = __dependency1__;

  function stripFlags(open, close) {
    return {
      left: open.charAt(2) === '~',
      right: close.charAt(close.length-3) === '~'
    };
  }

  __exports__.stripFlags = stripFlags;
  function prepareBlock(mustache, program, inverseAndProgram, close, inverted, locInfo) {
    /*jshint -W040 */
    if (mustache.sexpr.id.original !== close.path.original) {
      throw new Exception(mustache.sexpr.id.original + ' doesn\'t match ' + close.path.original, mustache);
    }

    var inverse = inverseAndProgram && inverseAndProgram.program;

    var strip = {
      left: mustache.strip.left,
      right: close.strip.right,

      // Determine the standalone candiacy. Basically flag our content as being possibly standalone
      // so our parent can determine if we actually are standalone
      openStandalone: isNextWhitespace(program.statements),
      closeStandalone: isPrevWhitespace((inverse || program).statements)
    };

    if (mustache.strip.right) {
      omitRight(program.statements, null, true);
    }

    if (inverse) {
      var inverseStrip = inverseAndProgram.strip;

      if (inverseStrip.left) {
        omitLeft(program.statements, null, true);
      }
      if (inverseStrip.right) {
        omitRight(inverse.statements, null, true);
      }
      if (close.strip.left) {
        omitLeft(inverse.statements, null, true);
      }

      // Find standalone else statments
      if (isPrevWhitespace(program.statements)
          && isNextWhitespace(inverse.statements)) {

        omitLeft(program.statements);
        omitRight(inverse.statements);
      }
    } else {
      if (close.strip.left) {
        omitLeft(program.statements, null, true);
      }
    }

    if (inverted) {
      return new this.BlockNode(mustache, inverse, program, strip, locInfo);
    } else {
      return new this.BlockNode(mustache, program, inverse, strip, locInfo);
    }
  }

  __exports__.prepareBlock = prepareBlock;
  function prepareProgram(statements, isRoot) {
    for (var i = 0, l = statements.length; i < l; i++) {
      var current = statements[i],
          strip = current.strip;

      if (!strip) {
        continue;
      }

      var _isPrevWhitespace = isPrevWhitespace(statements, i, isRoot, current.type === 'partial'),
          _isNextWhitespace = isNextWhitespace(statements, i, isRoot),

          openStandalone = strip.openStandalone && _isPrevWhitespace,
          closeStandalone = strip.closeStandalone && _isNextWhitespace,
          inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;

      if (strip.right) {
        omitRight(statements, i, true);
      }
      if (strip.left) {
        omitLeft(statements, i, true);
      }

      if (inlineStandalone) {
        omitRight(statements, i);

        if (omitLeft(statements, i)) {
          // If we are on a standalone node, save the indent info for partials
          if (current.type === 'partial') {
            current.indent = (/([ \t]+$)/).exec(statements[i-1].original) ? RegExp.$1 : '';
          }
        }
      }
      if (openStandalone) {
        omitRight((current.program || current.inverse).statements);

        // Strip out the previous content node if it's whitespace only
        omitLeft(statements, i);
      }
      if (closeStandalone) {
        // Always strip the next node
        omitRight(statements, i);

        omitLeft((current.inverse || current.program).statements);
      }
    }

    return statements;
  }

  __exports__.prepareProgram = prepareProgram;function isPrevWhitespace(statements, i, isRoot) {
    if (i === undefined) {
      i = statements.length;
    }

    // Nodes that end with newlines are considered whitespace (but are special
    // cased for strip operations)
    var prev = statements[i-1],
        sibling = statements[i-2];
    if (!prev) {
      return isRoot;
    }

    if (prev.type === 'content') {
      return (sibling || !isRoot ? (/\r?\n\s*?$/) : (/(^|\r?\n)\s*?$/)).test(prev.original);
    }
  }
  function isNextWhitespace(statements, i, isRoot) {
    if (i === undefined) {
      i = -1;
    }

    var next = statements[i+1],
        sibling = statements[i+2];
    if (!next) {
      return isRoot;
    }

    if (next.type === 'content') {
      return (sibling || !isRoot ? (/^\s*?\r?\n/) : (/^\s*?(\r?\n|$)/)).test(next.original);
    }
  }

  // Marks the node to the right of the position as omitted.
  // I.e. {{foo}}' ' will mark the ' ' node as omitted.
  //
  // If i is undefined, then the first child will be marked as such.
  //
  // If mulitple is truthy then all whitespace will be stripped out until non-whitespace
  // content is met.
  function omitRight(statements, i, multiple) {
    var current = statements[i == null ? 0 : i + 1];
    if (!current || current.type !== 'content' || (!multiple && current.rightStripped)) {
      return;
    }

    var original = current.string;
    current.string = current.string.replace(multiple ? (/^\s+/) : (/^[ \t]*\r?\n?/), '');
    current.rightStripped = current.string !== original;
  }

  // Marks the node to the left of the position as omitted.
  // I.e. ' '{{foo}} will mark the ' ' node as omitted.
  //
  // If i is undefined then the last child will be marked as such.
  //
  // If mulitple is truthy then all whitespace will be stripped out until non-whitespace
  // content is met.
  function omitLeft(statements, i, multiple) {
    var current = statements[i == null ? statements.length - 1 : i - 1];
    if (!current || current.type !== 'content' || (!multiple && current.leftStripped)) {
      return;
    }

    // We omit the last node if it's whitespace only and not preceeded by a non-content node.
    var original = current.string;
    current.string = current.string.replace(multiple ? (/\s+$/) : (/[ \t]+$/), '');
    current.leftStripped = current.string !== original;
    return current.leftStripped;
  }
  return __exports__;
})(__module5__);

// handlebars/compiler/base.js
var __module8__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__) {
  "use strict";
  var __exports__ = {};
  var parser = __dependency1__;
  var AST = __dependency2__;
  var Helpers = __dependency3__;
  var extend = __dependency4__.extend;

  __exports__.parser = parser;

  var yy = {};
  extend(yy, Helpers, AST);

  function parse(input) {
    // Just return if an already-compile AST was passed in.
    if (input.constructor === AST.ProgramNode) { return input; }

    parser.yy = yy;

    return parser.parse(input);
  }

  __exports__.parse = parse;
  return __exports__;
})(__module9__, __module7__, __module10__, __module3__);

// handlebars/compiler/compiler.js
var __module11__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__ = {};
  var Exception = __dependency1__;
  var isArray = __dependency2__.isArray;

  var slice = [].slice;

  function Compiler() {}

  __exports__.Compiler = Compiler;// the foundHelper register will disambiguate helper lookup from finding a
  // function in a context. This is necessary for mustache compatibility, which
  // requires that context functions in blocks are evaluated by blockHelperMissing,
  // and then proceed as if the resulting value was provided to blockHelperMissing.

  Compiler.prototype = {
    compiler: Compiler,

    equals: function(other) {
      var len = this.opcodes.length;
      if (other.opcodes.length !== len) {
        return false;
      }

      for (var i = 0; i < len; i++) {
        var opcode = this.opcodes[i],
            otherOpcode = other.opcodes[i];
        if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
          return false;
        }
      }

      // We know that length is the same between the two arrays because they are directly tied
      // to the opcode behavior above.
      len = this.children.length;
      for (i = 0; i < len; i++) {
        if (!this.children[i].equals(other.children[i])) {
          return false;
        }
      }

      return true;
    },

    guid: 0,

    compile: function(program, options) {
      this.opcodes = [];
      this.children = [];
      this.depths = {list: []};
      this.options = options;
      this.stringParams = options.stringParams;
      this.trackIds = options.trackIds;

      // These changes will propagate to the other compiler components
      var knownHelpers = this.options.knownHelpers;
      this.options.knownHelpers = {
        'helperMissing': true,
        'blockHelperMissing': true,
        'each': true,
        'if': true,
        'unless': true,
        'with': true,
        'log': true,
        'lookup': true
      };
      if (knownHelpers) {
        for (var name in knownHelpers) {
          this.options.knownHelpers[name] = knownHelpers[name];
        }
      }

      return this.accept(program);
    },

    accept: function(node) {
      return this[node.type](node);
    },

    program: function(program) {
      var statements = program.statements;

      for(var i=0, l=statements.length; i<l; i++) {
        this.accept(statements[i]);
      }
      this.isSimple = l === 1;

      this.depths.list = this.depths.list.sort(function(a, b) {
        return a - b;
      });

      return this;
    },

    compileProgram: function(program) {
      var result = new this.compiler().compile(program, this.options);
      var guid = this.guid++, depth;

      this.usePartial = this.usePartial || result.usePartial;

      this.children[guid] = result;

      for(var i=0, l=result.depths.list.length; i<l; i++) {
        depth = result.depths.list[i];

        if(depth < 2) { continue; }
        else { this.addDepth(depth - 1); }
      }

      return guid;
    },

    block: function(block) {
      var mustache = block.mustache,
          program = block.program,
          inverse = block.inverse;

      if (program) {
        program = this.compileProgram(program);
      }

      if (inverse) {
        inverse = this.compileProgram(inverse);
      }

      var sexpr = mustache.sexpr;
      var type = this.classifySexpr(sexpr);

      if (type === "helper") {
        this.helperSexpr(sexpr, program, inverse);
      } else if (type === "simple") {
        this.simpleSexpr(sexpr);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('blockValue', sexpr.id.original);
      } else {
        this.ambiguousSexpr(sexpr, program, inverse);

        // now that the simple mustache is resolved, we need to
        // evaluate it by executing `blockHelperMissing`
        this.opcode('pushProgram', program);
        this.opcode('pushProgram', inverse);
        this.opcode('emptyHash');
        this.opcode('ambiguousBlockValue');
      }

      this.opcode('append');
    },

    hash: function(hash) {
      var pairs = hash.pairs, i, l;

      this.opcode('pushHash');

      for(i=0, l=pairs.length; i<l; i++) {
        this.pushParam(pairs[i][1]);
      }
      while(i--) {
        this.opcode('assignToHash', pairs[i][0]);
      }
      this.opcode('popHash');
    },

    partial: function(partial) {
      var partialName = partial.partialName;
      this.usePartial = true;

      if (partial.hash) {
        this.accept(partial.hash);
      } else {
        this.opcode('push', 'undefined');
      }

      if (partial.context) {
        this.accept(partial.context);
      } else {
        this.opcode('getContext', 0);
        this.opcode('pushContext');
      }

      this.opcode('invokePartial', partialName.name, partial.indent || '');
      this.opcode('append');
    },

    content: function(content) {
      if (content.string) {
        this.opcode('appendContent', content.string);
      }
    },

    mustache: function(mustache) {
      this.sexpr(mustache.sexpr);

      if(mustache.escaped && !this.options.noEscape) {
        this.opcode('appendEscaped');
      } else {
        this.opcode('append');
      }
    },

    ambiguousSexpr: function(sexpr, program, inverse) {
      var id = sexpr.id,
          name = id.parts[0],
          isBlock = program != null || inverse != null;

      this.opcode('getContext', id.depth);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      this.ID(id);

      this.opcode('invokeAmbiguous', name, isBlock);
    },

    simpleSexpr: function(sexpr) {
      var id = sexpr.id;

      if (id.type === 'DATA') {
        this.DATA(id);
      } else if (id.parts.length) {
        this.ID(id);
      } else {
        // Simplified ID for `this`
        this.addDepth(id.depth);
        this.opcode('getContext', id.depth);
        this.opcode('pushContext');
      }

      this.opcode('resolvePossibleLambda');
    },

    helperSexpr: function(sexpr, program, inverse) {
      var params = this.setupFullMustacheParams(sexpr, program, inverse),
          id = sexpr.id,
          name = id.parts[0];

      if (this.options.knownHelpers[name]) {
        this.opcode('invokeKnownHelper', params.length, name);
      } else if (this.options.knownHelpersOnly) {
        throw new Exception("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
      } else {
        id.falsy = true;

        this.ID(id);
        this.opcode('invokeHelper', params.length, id.original, id.isSimple);
      }
    },

    sexpr: function(sexpr) {
      var type = this.classifySexpr(sexpr);

      if (type === "simple") {
        this.simpleSexpr(sexpr);
      } else if (type === "helper") {
        this.helperSexpr(sexpr);
      } else {
        this.ambiguousSexpr(sexpr);
      }
    },

    ID: function(id) {
      this.addDepth(id.depth);
      this.opcode('getContext', id.depth);

      var name = id.parts[0];
      if (!name) {
        // Context reference, i.e. `{{foo .}}` or `{{foo ..}}`
        this.opcode('pushContext');
      } else {
        this.opcode('lookupOnContext', id.parts, id.falsy, id.isScoped);
      }
    },

    DATA: function(data) {
      this.options.data = true;
      this.opcode('lookupData', data.id.depth, data.id.parts);
    },

    STRING: function(string) {
      this.opcode('pushString', string.string);
    },

    NUMBER: function(number) {
      this.opcode('pushLiteral', number.number);
    },

    BOOLEAN: function(bool) {
      this.opcode('pushLiteral', bool.bool);
    },

    comment: function() {},

    // HELPERS
    opcode: function(name) {
      this.opcodes.push({ opcode: name, args: slice.call(arguments, 1) });
    },

    addDepth: function(depth) {
      if(depth === 0) { return; }

      if(!this.depths[depth]) {
        this.depths[depth] = true;
        this.depths.list.push(depth);
      }
    },

    classifySexpr: function(sexpr) {
      var isHelper   = sexpr.isHelper;
      var isEligible = sexpr.eligibleHelper;
      var options    = this.options;

      // if ambiguous, we can possibly resolve the ambiguity now
      // An eligible helper is one that does not have a complex path, i.e. `this.foo`, `../foo` etc.
      if (isEligible && !isHelper) {
        var name = sexpr.id.parts[0];

        if (options.knownHelpers[name]) {
          isHelper = true;
        } else if (options.knownHelpersOnly) {
          isEligible = false;
        }
      }

      if (isHelper) { return "helper"; }
      else if (isEligible) { return "ambiguous"; }
      else { return "simple"; }
    },

    pushParams: function(params) {
      for(var i=0, l=params.length; i<l; i++) {
        this.pushParam(params[i]);
      }
    },

    pushParam: function(val) {
      if (this.stringParams) {
        if(val.depth) {
          this.addDepth(val.depth);
        }
        this.opcode('getContext', val.depth || 0);
        this.opcode('pushStringParam', val.stringModeValue, val.type);

        if (val.type === 'sexpr') {
          // Subexpressions get evaluated and passed in
          // in string params mode.
          this.sexpr(val);
        }
      } else {
        if (this.trackIds) {
          this.opcode('pushId', val.type, val.idName || val.stringModeValue);
        }
        this.accept(val);
      }
    },

    setupFullMustacheParams: function(sexpr, program, inverse) {
      var params = sexpr.params;
      this.pushParams(params);

      this.opcode('pushProgram', program);
      this.opcode('pushProgram', inverse);

      if (sexpr.hash) {
        this.hash(sexpr.hash);
      } else {
        this.opcode('emptyHash');
      }

      return params;
    }
  };

  function precompile(input, options, env) {
    if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
      throw new Exception("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
    }

    options = options || {};
    if (!('data' in options)) {
      options.data = true;
    }
    if (options.compat) {
      options.useDepths = true;
    }

    var ast = env.parse(input);
    var environment = new env.Compiler().compile(ast, options);
    return new env.JavaScriptCompiler().compile(environment, options);
  }

  __exports__.precompile = precompile;function compile(input, options, env) {
    if (input == null || (typeof input !== 'string' && input.constructor !== env.AST.ProgramNode)) {
      throw new Exception("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
    }

    options = options || {};

    if (!('data' in options)) {
      options.data = true;
    }
    if (options.compat) {
      options.useDepths = true;
    }

    var compiled;

    function compileInput() {
      var ast = env.parse(input);
      var environment = new env.Compiler().compile(ast, options);
      var templateSpec = new env.JavaScriptCompiler().compile(environment, options, undefined, true);
      return env.template(templateSpec);
    }

    // Template is only compiled on first use and cached after that point.
    var ret = function(context, options) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled.call(this, context, options);
    };
    ret._setup = function(options) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled._setup(options);
    };
    ret._child = function(i, data, depths) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled._child(i, data, depths);
    };
    return ret;
  }

  __exports__.compile = compile;function argEquals(a, b) {
    if (a === b) {
      return true;
    }

    if (isArray(a) && isArray(b) && a.length === b.length) {
      for (var i = 0; i < a.length; i++) {
        if (!argEquals(a[i], b[i])) {
          return false;
        }
      }
      return true;
    }
  }
  return __exports__;
})(__module5__, __module3__);

// handlebars/compiler/javascript-compiler.js
var __module12__ = (function(__dependency1__, __dependency2__) {
  "use strict";
  var __exports__;
  var COMPILER_REVISION = __dependency1__.COMPILER_REVISION;
  var REVISION_CHANGES = __dependency1__.REVISION_CHANGES;
  var Exception = __dependency2__;

  function Literal(value) {
    this.value = value;
  }

  function JavaScriptCompiler() {}

  JavaScriptCompiler.prototype = {
    // PUBLIC API: You can override these methods in a subclass to provide
    // alternative compiled forms for name lookup and buffering semantics
    nameLookup: function(parent, name /* , type*/) {
      if (JavaScriptCompiler.isValidJavaScriptVariableName(name)) {
        return parent + "." + name;
      } else {
        return parent + "['" + name + "']";
      }
    },
    depthedLookup: function(name) {
      this.aliases.lookup = 'this.lookup';

      return 'lookup(depths, "' + name + '")';
    },

    compilerInfo: function() {
      var revision = COMPILER_REVISION,
          versions = REVISION_CHANGES[revision];
      return [revision, versions];
    },

    appendToBuffer: function(string) {
      if (this.environment.isSimple) {
        return "return " + string + ";";
      } else {
        return {
          appendToBuffer: true,
          content: string,
          toString: function() { return "buffer += " + string + ";"; }
        };
      }
    },

    initializeBuffer: function() {
      return this.quotedString("");
    },

    namespace: "Handlebars",
    // END PUBLIC API

    compile: function(environment, options, context, asObject) {
      this.environment = environment;
      this.options = options;
      this.stringParams = this.options.stringParams;
      this.trackIds = this.options.trackIds;
      this.precompile = !asObject;

      this.name = this.environment.name;
      this.isChild = !!context;
      this.context = context || {
        programs: [],
        environments: []
      };

      this.preamble();

      this.stackSlot = 0;
      this.stackVars = [];
      this.aliases = {};
      this.registers = { list: [] };
      this.hashes = [];
      this.compileStack = [];
      this.inlineStack = [];

      this.compileChildren(environment, options);

      this.useDepths = this.useDepths || environment.depths.list.length || this.options.compat;

      var opcodes = environment.opcodes,
          opcode,
          i,
          l;

      for (i = 0, l = opcodes.length; i < l; i++) {
        opcode = opcodes[i];

        this[opcode.opcode].apply(this, opcode.args);
      }

      // Flush any trailing content that might be pending.
      this.pushSource('');

      /* istanbul ignore next */
      if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
        throw new Exception('Compile completed with content left on stack');
      }

      var fn = this.createFunctionContext(asObject);
      if (!this.isChild) {
        var ret = {
          compiler: this.compilerInfo(),
          main: fn
        };
        var programs = this.context.programs;
        for (i = 0, l = programs.length; i < l; i++) {
          if (programs[i]) {
            ret[i] = programs[i];
          }
        }

        if (this.environment.usePartial) {
          ret.usePartial = true;
        }
        if (this.options.data) {
          ret.useData = true;
        }
        if (this.useDepths) {
          ret.useDepths = true;
        }
        if (this.options.compat) {
          ret.compat = true;
        }

        if (!asObject) {
          ret.compiler = JSON.stringify(ret.compiler);
          ret = this.objectLiteral(ret);
        }

        return ret;
      } else {
        return fn;
      }
    },

    preamble: function() {
      // track the last context pushed into place to allow skipping the
      // getContext opcode when it would be a noop
      this.lastContext = 0;
      this.source = [];
    },

    createFunctionContext: function(asObject) {
      var varDeclarations = '';

      var locals = this.stackVars.concat(this.registers.list);
      if(locals.length > 0) {
        varDeclarations += ", " + locals.join(", ");
      }

      // Generate minimizer alias mappings
      for (var alias in this.aliases) {
        if (this.aliases.hasOwnProperty(alias)) {
          varDeclarations += ', ' + alias + '=' + this.aliases[alias];
        }
      }

      var params = ["depth0", "helpers", "partials", "data"];

      if (this.useDepths) {
        params.push('depths');
      }

      // Perform a second pass over the output to merge content when possible
      var source = this.mergeSource(varDeclarations);

      if (asObject) {
        params.push(source);

        return Function.apply(this, params);
      } else {
        return 'function(' + params.join(',') + ') {\n  ' + source + '}';
      }
    },
    mergeSource: function(varDeclarations) {
      var source = '',
          buffer,
          appendOnly = !this.forceBuffer,
          appendFirst;

      for (var i = 0, len = this.source.length; i < len; i++) {
        var line = this.source[i];
        if (line.appendToBuffer) {
          if (buffer) {
            buffer = buffer + '\n    + ' + line.content;
          } else {
            buffer = line.content;
          }
        } else {
          if (buffer) {
            if (!source) {
              appendFirst = true;
              source = buffer + ';\n  ';
            } else {
              source += 'buffer += ' + buffer + ';\n  ';
            }
            buffer = undefined;
          }
          source += line + '\n  ';

          if (!this.environment.isSimple) {
            appendOnly = false;
          }
        }
      }

      if (appendOnly) {
        if (buffer || !source) {
          source += 'return ' + (buffer || '""') + ';\n';
        }
      } else {
        varDeclarations += ", buffer = " + (appendFirst ? '' : this.initializeBuffer());
        if (buffer) {
          source += 'return buffer + ' + buffer + ';\n';
        } else {
          source += 'return buffer;\n';
        }
      }

      if (varDeclarations) {
        source = 'var ' + varDeclarations.substring(2) + (appendFirst ? '' : ';\n  ') + source;
      }

      return source;
    },

    // [blockValue]
    //
    // On stack, before: hash, inverse, program, value
    // On stack, after: return value of blockHelperMissing
    //
    // The purpose of this opcode is to take a block of the form
    // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
    // replace it on the stack with the result of properly
    // invoking blockHelperMissing.
    blockValue: function(name) {
      this.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      var params = [this.contextName(0)];
      this.setupParams(name, 0, params);

      var blockName = this.popStack();
      params.splice(1, 0, blockName);

      this.push('blockHelperMissing.call(' + params.join(', ') + ')');
    },

    // [ambiguousBlockValue]
    //
    // On stack, before: hash, inverse, program, value
    // Compiler value, before: lastHelper=value of last found helper, if any
    // On stack, after, if no lastHelper: same as [blockValue]
    // On stack, after, if lastHelper: value
    ambiguousBlockValue: function() {
      this.aliases.blockHelperMissing = 'helpers.blockHelperMissing';

      // We're being a bit cheeky and reusing the options value from the prior exec
      var params = [this.contextName(0)];
      this.setupParams('', 0, params, true);

      this.flushInline();

      var current = this.topStack();
      params.splice(1, 0, current);

      this.pushSource("if (!" + this.lastHelper + ") { " + current + " = blockHelperMissing.call(" + params.join(", ") + "); }");
    },

    // [appendContent]
    //
    // On stack, before: ...
    // On stack, after: ...
    //
    // Appends the string value of `content` to the current buffer
    appendContent: function(content) {
      if (this.pendingContent) {
        content = this.pendingContent + content;
      }

      this.pendingContent = content;
    },

    // [append]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Coerces `value` to a String and appends it to the current buffer.
    //
    // If `value` is truthy, or 0, it is coerced into a string and appended
    // Otherwise, the empty string is appended
    append: function() {
      // Force anything that is inlined onto the stack so we don't have duplication
      // when we examine local
      this.flushInline();
      var local = this.popStack();
      this.pushSource('if (' + local + ' != null) { ' + this.appendToBuffer(local) + ' }');
      if (this.environment.isSimple) {
        this.pushSource("else { " + this.appendToBuffer("''") + " }");
      }
    },

    // [appendEscaped]
    //
    // On stack, before: value, ...
    // On stack, after: ...
    //
    // Escape `value` and append it to the buffer
    appendEscaped: function() {
      this.aliases.escapeExpression = 'this.escapeExpression';

      this.pushSource(this.appendToBuffer("escapeExpression(" + this.popStack() + ")"));
    },

    // [getContext]
    //
    // On stack, before: ...
    // On stack, after: ...
    // Compiler value, after: lastContext=depth
    //
    // Set the value of the `lastContext` compiler value to the depth
    getContext: function(depth) {
      this.lastContext = depth;
    },

    // [pushContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext, ...
    //
    // Pushes the value of the current context onto the stack.
    pushContext: function() {
      this.pushStackLiteral(this.contextName(this.lastContext));
    },

    // [lookupOnContext]
    //
    // On stack, before: ...
    // On stack, after: currentContext[name], ...
    //
    // Looks up the value of `name` on the current context and pushes
    // it onto the stack.
    lookupOnContext: function(parts, falsy, scoped) {
      /*jshint -W083 */
      var i = 0,
          len = parts.length;

      if (!scoped && this.options.compat && !this.lastContext) {
        // The depthed query is expected to handle the undefined logic for the root level that
        // is implemented below, so we evaluate that directly in compat mode
        this.push(this.depthedLookup(parts[i++]));
      } else {
        this.pushContext();
      }

      for (; i < len; i++) {
        this.replaceStack(function(current) {
          var lookup = this.nameLookup(current, parts[i], 'context');
          // We want to ensure that zero and false are handled properly if the context (falsy flag)
          // needs to have the special handling for these values.
          if (!falsy) {
            return ' != null ? ' + lookup + ' : ' + current;
          } else {
            // Otherwise we can use generic falsy handling
            return ' && ' + lookup;
          }
        });
      }
    },

    // [lookupData]
    //
    // On stack, before: ...
    // On stack, after: data, ...
    //
    // Push the data lookup operator
    lookupData: function(depth, parts) {
      /*jshint -W083 */
      if (!depth) {
        this.pushStackLiteral('data');
      } else {
        this.pushStackLiteral('this.data(data, ' + depth + ')');
      }

      var len = parts.length;
      for (var i = 0; i < len; i++) {
        this.replaceStack(function(current) {
          return ' && ' + this.nameLookup(current, parts[i], 'data');
        });
      }
    },

    // [resolvePossibleLambda]
    //
    // On stack, before: value, ...
    // On stack, after: resolved value, ...
    //
    // If the `value` is a lambda, replace it on the stack by
    // the return value of the lambda
    resolvePossibleLambda: function() {
      this.aliases.lambda = 'this.lambda';

      this.push('lambda(' + this.popStack() + ', ' + this.contextName(0) + ')');
    },

    // [pushStringParam]
    //
    // On stack, before: ...
    // On stack, after: string, currentContext, ...
    //
    // This opcode is designed for use in string mode, which
    // provides the string value of a parameter along with its
    // depth rather than resolving it immediately.
    pushStringParam: function(string, type) {
      this.pushContext();
      this.pushString(type);

      // If it's a subexpression, the string result
      // will be pushed after this opcode.
      if (type !== 'sexpr') {
        if (typeof string === 'string') {
          this.pushString(string);
        } else {
          this.pushStackLiteral(string);
        }
      }
    },

    emptyHash: function() {
      this.pushStackLiteral('{}');

      if (this.trackIds) {
        this.push('{}'); // hashIds
      }
      if (this.stringParams) {
        this.push('{}'); // hashContexts
        this.push('{}'); // hashTypes
      }
    },
    pushHash: function() {
      if (this.hash) {
        this.hashes.push(this.hash);
      }
      this.hash = {values: [], types: [], contexts: [], ids: []};
    },
    popHash: function() {
      var hash = this.hash;
      this.hash = this.hashes.pop();

      if (this.trackIds) {
        this.push('{' + hash.ids.join(',') + '}');
      }
      if (this.stringParams) {
        this.push('{' + hash.contexts.join(',') + '}');
        this.push('{' + hash.types.join(',') + '}');
      }

      this.push('{\n    ' + hash.values.join(',\n    ') + '\n  }');
    },

    // [pushString]
    //
    // On stack, before: ...
    // On stack, after: quotedString(string), ...
    //
    // Push a quoted version of `string` onto the stack
    pushString: function(string) {
      this.pushStackLiteral(this.quotedString(string));
    },

    // [push]
    //
    // On stack, before: ...
    // On stack, after: expr, ...
    //
    // Push an expression onto the stack
    push: function(expr) {
      this.inlineStack.push(expr);
      return expr;
    },

    // [pushLiteral]
    //
    // On stack, before: ...
    // On stack, after: value, ...
    //
    // Pushes a value onto the stack. This operation prevents
    // the compiler from creating a temporary variable to hold
    // it.
    pushLiteral: function(value) {
      this.pushStackLiteral(value);
    },

    // [pushProgram]
    //
    // On stack, before: ...
    // On stack, after: program(guid), ...
    //
    // Push a program expression onto the stack. This takes
    // a compile-time guid and converts it into a runtime-accessible
    // expression.
    pushProgram: function(guid) {
      if (guid != null) {
        this.pushStackLiteral(this.programExpression(guid));
      } else {
        this.pushStackLiteral(null);
      }
    },

    // [invokeHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // Pops off the helper's parameters, invokes the helper,
    // and pushes the helper's return value onto the stack.
    //
    // If the helper is not found, `helperMissing` is called.
    invokeHelper: function(paramSize, name, isSimple) {
      this.aliases.helperMissing = 'helpers.helperMissing';

      var nonHelper = this.popStack();
      var helper = this.setupHelper(paramSize, name);

      var lookup = (isSimple ? helper.name + ' || ' : '') + nonHelper + ' || helperMissing';
      this.push('((' + lookup + ').call(' + helper.callParams + '))');
    },

    // [invokeKnownHelper]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of helper invocation
    //
    // This operation is used when the helper is known to exist,
    // so a `helperMissing` fallback is not required.
    invokeKnownHelper: function(paramSize, name) {
      var helper = this.setupHelper(paramSize, name);
      this.push(helper.name + ".call(" + helper.callParams + ")");
    },

    // [invokeAmbiguous]
    //
    // On stack, before: hash, inverse, program, params..., ...
    // On stack, after: result of disambiguation
    //
    // This operation is used when an expression like `{{foo}}`
    // is provided, but we don't know at compile-time whether it
    // is a helper or a path.
    //
    // This operation emits more code than the other options,
    // and can be avoided by passing the `knownHelpers` and
    // `knownHelpersOnly` flags at compile-time.
    invokeAmbiguous: function(name, helperCall) {
      this.aliases.functionType = '"function"';
      this.aliases.helperMissing = 'helpers.helperMissing';
      this.useRegister('helper');

      var nonHelper = this.popStack();

      this.emptyHash();
      var helper = this.setupHelper(0, name, helperCall);

      var helperName = this.lastHelper = this.nameLookup('helpers', name, 'helper');

      this.push(
        '((helper = (helper = ' + helperName + ' || ' + nonHelper + ') != null ? helper : helperMissing'
          + (helper.paramsInit ? '),(' + helper.paramsInit : '') + '),'
        + '(typeof helper === functionType ? helper.call(' + helper.callParams + ') : helper))');
    },

    // [invokePartial]
    //
    // On stack, before: context, ...
    // On stack after: result of partial invocation
    //
    // This operation pops off a context, invokes a partial with that context,
    // and pushes the result of the invocation back.
    invokePartial: function(name, indent) {
      var params = [this.nameLookup('partials', name, 'partial'), "'" + indent + "'", "'" + name + "'", this.popStack(), this.popStack(), "helpers", "partials"];

      if (this.options.data) {
        params.push("data");
      } else if (this.options.compat) {
        params.push('undefined');
      }
      if (this.options.compat) {
        params.push('depths');
      }

      this.push("this.invokePartial(" + params.join(", ") + ")");
    },

    // [assignToHash]
    //
    // On stack, before: value, ..., hash, ...
    // On stack, after: ..., hash, ...
    //
    // Pops a value off the stack and assigns it to the current hash
    assignToHash: function(key) {
      var value = this.popStack(),
          context,
          type,
          id;

      if (this.trackIds) {
        id = this.popStack();
      }
      if (this.stringParams) {
        type = this.popStack();
        context = this.popStack();
      }

      var hash = this.hash;
      if (context) {
        hash.contexts.push("'" + key + "': " + context);
      }
      if (type) {
        hash.types.push("'" + key + "': " + type);
      }
      if (id) {
        hash.ids.push("'" + key + "': " + id);
      }
      hash.values.push("'" + key + "': (" + value + ")");
    },

    pushId: function(type, name) {
      if (type === 'ID' || type === 'DATA') {
        this.pushString(name);
      } else if (type === 'sexpr') {
        this.pushStackLiteral('true');
      } else {
        this.pushStackLiteral('null');
      }
    },

    // HELPERS

    compiler: JavaScriptCompiler,

    compileChildren: function(environment, options) {
      var children = environment.children, child, compiler;

      for(var i=0, l=children.length; i<l; i++) {
        child = children[i];
        compiler = new this.compiler();

        var index = this.matchExistingProgram(child);

        if (index == null) {
          this.context.programs.push('');     // Placeholder to prevent name conflicts for nested children
          index = this.context.programs.length;
          child.index = index;
          child.name = 'program' + index;
          this.context.programs[index] = compiler.compile(child, options, this.context, !this.precompile);
          this.context.environments[index] = child;

          this.useDepths = this.useDepths || compiler.useDepths;
        } else {
          child.index = index;
          child.name = 'program' + index;
        }
      }
    },
    matchExistingProgram: function(child) {
      for (var i = 0, len = this.context.environments.length; i < len; i++) {
        var environment = this.context.environments[i];
        if (environment && environment.equals(child)) {
          return i;
        }
      }
    },

    programExpression: function(guid) {
      var child = this.environment.children[guid],
          depths = child.depths.list,
          useDepths = this.useDepths,
          depth;

      var programParams = [child.index, 'data'];

      if (useDepths) {
        programParams.push('depths');
      }

      return 'this.program(' + programParams.join(', ') + ')';
    },

    useRegister: function(name) {
      if(!this.registers[name]) {
        this.registers[name] = true;
        this.registers.list.push(name);
      }
    },

    pushStackLiteral: function(item) {
      return this.push(new Literal(item));
    },

    pushSource: function(source) {
      if (this.pendingContent) {
        this.source.push(this.appendToBuffer(this.quotedString(this.pendingContent)));
        this.pendingContent = undefined;
      }

      if (source) {
        this.source.push(source);
      }
    },

    pushStack: function(item) {
      this.flushInline();

      var stack = this.incrStack();
      this.pushSource(stack + " = " + item + ";");
      this.compileStack.push(stack);
      return stack;
    },

    replaceStack: function(callback) {
      var prefix = '',
          inline = this.isInline(),
          stack,
          createdStack,
          usedLiteral;

      /* istanbul ignore next */
      if (!this.isInline()) {
        throw new Exception('replaceStack on non-inline');
      }

      // We want to merge the inline statement into the replacement statement via ','
      var top = this.popStack(true);

      if (top instanceof Literal) {
        // Literals do not need to be inlined
        prefix = stack = top.value;
        usedLiteral = true;
      } else {
        // Get or create the current stack name for use by the inline
        createdStack = !this.stackSlot;
        var name = !createdStack ? this.topStackName() : this.incrStack();

        prefix = '(' + this.push(name) + ' = ' + top + ')';
        stack = this.topStack();
      }

      var item = callback.call(this, stack);

      if (!usedLiteral) {
        this.popStack();
      }
      if (createdStack) {
        this.stackSlot--;
      }
      this.push('(' + prefix + item + ')');
    },

    incrStack: function() {
      this.stackSlot++;
      if(this.stackSlot > this.stackVars.length) { this.stackVars.push("stack" + this.stackSlot); }
      return this.topStackName();
    },
    topStackName: function() {
      return "stack" + this.stackSlot;
    },
    flushInline: function() {
      var inlineStack = this.inlineStack;
      if (inlineStack.length) {
        this.inlineStack = [];
        for (var i = 0, len = inlineStack.length; i < len; i++) {
          var entry = inlineStack[i];
          if (entry instanceof Literal) {
            this.compileStack.push(entry);
          } else {
            this.pushStack(entry);
          }
        }
      }
    },
    isInline: function() {
      return this.inlineStack.length;
    },

    popStack: function(wrapped) {
      var inline = this.isInline(),
          item = (inline ? this.inlineStack : this.compileStack).pop();

      if (!wrapped && (item instanceof Literal)) {
        return item.value;
      } else {
        if (!inline) {
          /* istanbul ignore next */
          if (!this.stackSlot) {
            throw new Exception('Invalid stack pop');
          }
          this.stackSlot--;
        }
        return item;
      }
    },

    topStack: function() {
      var stack = (this.isInline() ? this.inlineStack : this.compileStack),
          item = stack[stack.length - 1];

      if (item instanceof Literal) {
        return item.value;
      } else {
        return item;
      }
    },

    contextName: function(context) {
      if (this.useDepths && context) {
        return 'depths[' + context + ']';
      } else {
        return 'depth' + context;
      }
    },

    quotedString: function(str) {
      return '"' + str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\u2028/g, '\\u2028')   // Per Ecma-262 7.3 + 7.8.4
        .replace(/\u2029/g, '\\u2029') + '"';
    },

    objectLiteral: function(obj) {
      var pairs = [];

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          pairs.push(this.quotedString(key) + ':' + obj[key]);
        }
      }

      return '{' + pairs.join(',') + '}';
    },

    setupHelper: function(paramSize, name, blockHelper) {
      var params = [],
          paramsInit = this.setupParams(name, paramSize, params, blockHelper);
      var foundHelper = this.nameLookup('helpers', name, 'helper');

      return {
        params: params,
        paramsInit: paramsInit,
        name: foundHelper,
        callParams: [this.contextName(0)].concat(params).join(", ")
      };
    },

    setupOptions: function(helper, paramSize, params) {
      var options = {}, contexts = [], types = [], ids = [], param, inverse, program;

      options.name = this.quotedString(helper);
      options.hash = this.popStack();

      if (this.trackIds) {
        options.hashIds = this.popStack();
      }
      if (this.stringParams) {
        options.hashTypes = this.popStack();
        options.hashContexts = this.popStack();
      }

      inverse = this.popStack();
      program = this.popStack();

      // Avoid setting fn and inverse if neither are set. This allows
      // helpers to do a check for `if (options.fn)`
      if (program || inverse) {
        if (!program) {
          program = 'this.noop';
        }

        if (!inverse) {
          inverse = 'this.noop';
        }

        options.fn = program;
        options.inverse = inverse;
      }

      // The parameters go on to the stack in order (making sure that they are evaluated in order)
      // so we need to pop them off the stack in reverse order
      var i = paramSize;
      while (i--) {
        param = this.popStack();
        params[i] = param;

        if (this.trackIds) {
          ids[i] = this.popStack();
        }
        if (this.stringParams) {
          types[i] = this.popStack();
          contexts[i] = this.popStack();
        }
      }

      if (this.trackIds) {
        options.ids = "[" + ids.join(",") + "]";
      }
      if (this.stringParams) {
        options.types = "[" + types.join(",") + "]";
        options.contexts = "[" + contexts.join(",") + "]";
      }

      if (this.options.data) {
        options.data = "data";
      }

      return options;
    },

    // the params and contexts arguments are passed in arrays
    // to fill in
    setupParams: function(helperName, paramSize, params, useRegister) {
      var options = this.objectLiteral(this.setupOptions(helperName, paramSize, params));

      if (useRegister) {
        this.useRegister('options');
        params.push('options');
        return 'options=' + options;
      } else {
        params.push(options);
        return '';
      }
    }
  };

  var reservedWords = (
    "break else new var" +
    " case finally return void" +
    " catch for switch while" +
    " continue function this with" +
    " default if throw" +
    " delete in try" +
    " do instanceof typeof" +
    " abstract enum int short" +
    " boolean export interface static" +
    " byte extends long super" +
    " char final native synchronized" +
    " class float package throws" +
    " const goto private transient" +
    " debugger implements protected volatile" +
    " double import public let yield"
  ).split(" ");

  var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};

  for(var i=0, l=reservedWords.length; i<l; i++) {
    compilerWords[reservedWords[i]] = true;
  }

  JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
    return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
  };

  __exports__ = JavaScriptCompiler;
  return __exports__;
})(__module2__, __module5__);

// handlebars.js
var __module0__ = (function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__) {
  "use strict";
  var __exports__;
  /*globals Handlebars: true */
  var Handlebars = __dependency1__;

  // Compiler imports
  var AST = __dependency2__;
  var Parser = __dependency3__.parser;
  var parse = __dependency3__.parse;
  var Compiler = __dependency4__.Compiler;
  var compile = __dependency4__.compile;
  var precompile = __dependency4__.precompile;
  var JavaScriptCompiler = __dependency5__;

  var _create = Handlebars.create;
  var create = function() {
    var hb = _create();

    hb.compile = function(input, options) {
      return compile(input, options, hb);
    };
    hb.precompile = function (input, options) {
      return precompile(input, options, hb);
    };

    hb.AST = AST;
    hb.Compiler = Compiler;
    hb.JavaScriptCompiler = JavaScriptCompiler;
    hb.Parser = Parser;
    hb.parse = parse;

    return hb;
  };

  Handlebars = create();
  Handlebars.create = create;

  Handlebars['default'] = Handlebars;

  __exports__ = Handlebars;
  return __exports__;
})(__module1__, __module7__, __module8__, __module11__, __module12__);

  return __module0__;
}));

var framesApiToken = "";

var framesApiCall = "https://api.shoppable.com";
var egrocerCall = "https://egrocer.shoppable.co";
var checkoutUrl = "https://secure.shoppable.com";
var ShoppableApi = {
  framesApiToken: "",
   framesApiCall: "https://api.shoppable.com",
   checkoutUrl: "https://secure.shoppable.com"
};
var _existingAngular ={}

if(window.angular){
   _existingAngular = window.angular;
}

/*
 AngularJS v1.7.2
 (c) 2010-2018 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(D){'use strict';function qe(a){if(G(a))u(a.objectMaxDepth)&&(Wb.objectMaxDepth=Xb(a.objectMaxDepth)?a.objectMaxDepth:NaN),u(a.urlErrorParamsEnabled)&&Ga(a.urlErrorParamsEnabled)&&(Wb.urlErrorParamsEnabled=a.urlErrorParamsEnabled);else return Wb}function Xb(a){return aa(a)&&0<a}function L(a,b){b=b||Error;return function(){var d=arguments[0],c;c="["+(a?a+":":"")+d+"] http://errors.angularjs.org/1.7.2/"+(a?a+"/":"")+d;for(d=1;d<arguments.length;d++){c=c+(1==d?"?":"&")+"p"+(d-1)+"=";var e=encodeURIComponent,
f;f=arguments[d];f="function"==typeof f?f.toString().replace(/ \{[\s\S]*$/,""):"undefined"==typeof f?"undefined":"string"!=typeof f?JSON.stringify(f):f;c+=e(f)}return new b(c)}}function ra(a){if(null==a||ab(a))return!1;if(F(a)||B(a)||y&&a instanceof y)return!0;var b="length"in Object(a)&&a.length;return aa(b)&&(0<=b&&b-1 in a||"function"===typeof a.item)}function q(a,b,d){var c,e;if(a)if(z(a))for(c in a)"prototype"!==c&&"length"!==c&&"name"!==c&&a.hasOwnProperty(c)&&b.call(d,a[c],c,a);else if(F(a)||
ra(a)){var f="object"!==typeof a;c=0;for(e=a.length;c<e;c++)(f||c in a)&&b.call(d,a[c],c,a)}else if(a.forEach&&a.forEach!==q)a.forEach(b,d,a);else if(Oc(a))for(c in a)b.call(d,a[c],c,a);else if("function"===typeof a.hasOwnProperty)for(c in a)a.hasOwnProperty(c)&&b.call(d,a[c],c,a);else for(c in a)sa.call(a,c)&&b.call(d,a[c],c,a);return a}function Pc(a,b,d){for(var c=Object.keys(a).sort(),e=0;e<c.length;e++)b.call(d,a[c[e]],c[e]);return c}function Yb(a){return function(b,d){a(d,b)}}function re(){return++rb}
function Zb(a,b,d){for(var c=a.$$hashKey,e=0,f=b.length;e<f;++e){var g=b[e];if(G(g)||z(g))for(var k=Object.keys(g),h=0,l=k.length;h<l;h++){var m=k[h],p=g[m];d&&G(p)?$(p)?a[m]=new Date(p.valueOf()):bb(p)?a[m]=new RegExp(p):p.nodeName?a[m]=p.cloneNode(!0):$b(p)?a[m]=p.clone():(G(a[m])||(a[m]=F(p)?[]:{}),Zb(a[m],[p],!0)):a[m]=p}}c?a.$$hashKey=c:delete a.$$hashKey;return a}function P(a){return Zb(a,ya.call(arguments,1),!1)}function se(a){return Zb(a,ya.call(arguments,1),!0)}function ea(a){return parseInt(a,
10)}function ac(a,b){return P(Object.create(a),b)}function x(){}function Qa(a){return a}function ia(a){return function(){return a}}function bc(a){return z(a.toString)&&a.toString!==ga}function v(a){return"undefined"===typeof a}function u(a){return"undefined"!==typeof a}function G(a){return null!==a&&"object"===typeof a}function Oc(a){return null!==a&&"object"===typeof a&&!Qc(a)}function B(a){return"string"===typeof a}function aa(a){return"number"===typeof a}function $(a){return"[object Date]"===ga.call(a)}
function F(a){return Array.isArray(a)||a instanceof Array}function cc(a){switch(ga.call(a)){case "[object Error]":return!0;case "[object Exception]":return!0;case "[object DOMException]":return!0;default:return a instanceof Error}}function z(a){return"function"===typeof a}function bb(a){return"[object RegExp]"===ga.call(a)}function ab(a){return a&&a.window===a}function cb(a){return a&&a.$evalAsync&&a.$watch}function Ga(a){return"boolean"===typeof a}function te(a){return a&&aa(a.length)&&ue.test(ga.call(a))}
function $b(a){return!(!a||!(a.nodeName||a.prop&&a.attr&&a.find))}function ve(a){var b={};a=a.split(",");var d;for(d=0;d<a.length;d++)b[a[d]]=!0;return b}function ta(a){return O(a.nodeName||a[0]&&a[0].nodeName)}function db(a,b){var d=a.indexOf(b);0<=d&&a.splice(d,1);return d}function za(a,b,d){function c(a,b,c){c--;if(0>c)return"...";var d=b.$$hashKey,f;if(F(a)){f=0;for(var g=a.length;f<g;f++)b.push(e(a[f],c))}else if(Oc(a))for(f in a)b[f]=e(a[f],c);else if(a&&"function"===typeof a.hasOwnProperty)for(f in a)a.hasOwnProperty(f)&&
(b[f]=e(a[f],c));else for(f in a)sa.call(a,f)&&(b[f]=e(a[f],c));d?b.$$hashKey=d:delete b.$$hashKey;return b}function e(a,b){if(!G(a))return a;var d=g.indexOf(a);if(-1!==d)return k[d];if(ab(a)||cb(a))throw Ha("cpws");var d=!1,e=f(a);void 0===e&&(e=F(a)?[]:Object.create(Qc(a)),d=!0);g.push(a);k.push(e);return d?c(a,e,b):e}function f(a){switch(ga.call(a)){case "[object Int8Array]":case "[object Int16Array]":case "[object Int32Array]":case "[object Float32Array]":case "[object Float64Array]":case "[object Uint8Array]":case "[object Uint8ClampedArray]":case "[object Uint16Array]":case "[object Uint32Array]":return new a.constructor(e(a.buffer),
a.byteOffset,a.length);case "[object ArrayBuffer]":if(!a.slice){var b=new ArrayBuffer(a.byteLength);(new Uint8Array(b)).set(new Uint8Array(a));return b}return a.slice(0);case "[object Boolean]":case "[object Number]":case "[object String]":case "[object Date]":return new a.constructor(a.valueOf());case "[object RegExp]":return b=new RegExp(a.source,a.toString().match(/[^/]*$/)[0]),b.lastIndex=a.lastIndex,b;case "[object Blob]":return new a.constructor([a],{type:a.type})}if(z(a.cloneNode))return a.cloneNode(!0)}
var g=[],k=[];d=Xb(d)?d:NaN;if(b){if(te(b)||"[object ArrayBuffer]"===ga.call(b))throw Ha("cpta");if(a===b)throw Ha("cpi");F(b)?b.length=0:q(b,function(a,c){"$$hashKey"!==c&&delete b[c]});g.push(a);k.push(b);return c(a,b,d)}return e(a,d)}function dc(a,b){return a===b||a!==a&&b!==b}function ua(a,b){if(a===b)return!0;if(null===a||null===b)return!1;if(a!==a&&b!==b)return!0;var d=typeof a,c;if(d===typeof b&&"object"===d)if(F(a)){if(!F(b))return!1;if((d=a.length)===b.length){for(c=0;c<d;c++)if(!ua(a[c],
b[c]))return!1;return!0}}else{if($(a))return $(b)?dc(a.getTime(),b.getTime()):!1;if(bb(a))return bb(b)?a.toString()===b.toString():!1;if(cb(a)||cb(b)||ab(a)||ab(b)||F(b)||$(b)||bb(b))return!1;d=U();for(c in a)if("$"!==c.charAt(0)&&!z(a[c])){if(!ua(a[c],b[c]))return!1;d[c]=!0}for(c in b)if(!(c in d)&&"$"!==c.charAt(0)&&u(b[c])&&!z(b[c]))return!1;return!0}return!1}function eb(a,b,d){return a.concat(ya.call(b,d))}function Ra(a,b){var d=2<arguments.length?ya.call(arguments,2):[];return!z(b)||b instanceof
RegExp?b:d.length?function(){return arguments.length?b.apply(a,eb(d,arguments,0)):b.apply(a,d)}:function(){return arguments.length?b.apply(a,arguments):b.call(a)}}function Rc(a,b){var d=b;"string"===typeof a&&"$"===a.charAt(0)&&"$"===a.charAt(1)?d=void 0:ab(b)?d="$WINDOW":b&&D.document===b?d="$DOCUMENT":cb(b)&&(d="$SCOPE");return d}function fb(a,b){if(!v(a))return aa(b)||(b=b?2:null),JSON.stringify(a,Rc,b)}function Sc(a){return B(a)?JSON.parse(a):a}function ec(a,b){a=a.replace(we,"");var d=Date.parse("Jan 01, 1970 00:00:00 "+
a)/6E4;return ha(d)?b:d}function Tc(a,b){a=new Date(a.getTime());a.setMinutes(a.getMinutes()+b);return a}function fc(a,b,d){d=d?-1:1;var c=a.getTimezoneOffset();b=ec(b,c);return Tc(a,d*(b-c))}function Aa(a){a=y(a).clone().empty();var b=y("<div></div>").append(a).html();try{return a[0].nodeType===Ma?O(b):b.match(/^(<[^>]+>)/)[1].replace(/^<([\w-]+)/,function(a,b){return"<"+O(b)})}catch(d){return O(b)}}function Uc(a){try{return decodeURIComponent(a)}catch(b){}}function gc(a){var b={};q((a||"").split("&"),
function(a){var c,e,f;a&&(e=a=a.replace(/\+/g,"%20"),c=a.indexOf("="),-1!==c&&(e=a.substring(0,c),f=a.substring(c+1)),e=Uc(e),u(e)&&(f=u(f)?Uc(f):!0,sa.call(b,e)?F(b[e])?b[e].push(f):b[e]=[b[e],f]:b[e]=f))});return b}function hc(a){var b=[];q(a,function(a,c){F(a)?q(a,function(a){b.push(ka(c,!0)+(!0===a?"":"="+ka(a,!0)))}):b.push(ka(c,!0)+(!0===a?"":"="+ka(a,!0)))});return b.length?b.join("&"):""}function gb(a){return ka(a,!0).replace(/%26/gi,"&").replace(/%3D/gi,"=").replace(/%2B/gi,"+")}function ka(a,
b){return encodeURIComponent(a).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%3B/gi,";").replace(/%20/g,b?"%20":"+")}function xe(a,b){var d,c,e=Ia.length;for(c=0;c<e;++c)if(d=Ia[c]+b,B(d=a.getAttribute(d)))return d;return null}function ye(a,b){var d,c,e={};q(Ia,function(b){b+="app";!d&&a.hasAttribute&&a.hasAttribute(b)&&(d=a,c=a.getAttribute(b))});q(Ia,function(b){b+="app";var e;!d&&(e=a.querySelector("["+b.replace(":","\\:")+"]"))&&(d=e,c=e.getAttribute(b))});
d&&(ze?(e.strictDi=null!==xe(d,"strict-di"),b(d,c?[c]:[],e)):D.console.error("AngularJS: disabling automatic bootstrap. <script> protocol indicates an extension, document.location.href does not match."))}function Vc(a,b,d){G(d)||(d={});d=P({strictDi:!1},d);var c=function(){a=y(a);if(a.injector()){var c=a[0]===D.document?"document":Aa(a);throw Ha("btstrpd",c.replace(/</,"&lt;").replace(/>/,"&gt;"));}b=b||[];b.unshift(["$provide",function(b){b.value("$rootElement",a)}]);d.debugInfoEnabled&&b.push(["$compileProvider",
function(a){a.debugInfoEnabled(!0)}]);b.unshift("ng");c=hb(b,d.strictDi);c.invoke(["$rootScope","$rootElement","$compile","$injector",function(a,b,c,d){a.$apply(function(){b.data("$injector",d);c(b)(a)})}]);return c},e=/^NG_ENABLE_DEBUG_INFO!/,f=/^NG_DEFER_BOOTSTRAP!/;D&&e.test(D.name)&&(d.debugInfoEnabled=!0,D.name=D.name.replace(e,""));if(D&&!f.test(D.name))return c();D.name=D.name.replace(f,"");fa.resumeBootstrap=function(a){q(a,function(a){b.push(a)});return c()};z(fa.resumeDeferredBootstrap)&&
fa.resumeDeferredBootstrap()}function Ae(){D.name="NG_ENABLE_DEBUG_INFO!"+D.name;D.location.reload()}function Be(a){a=fa.element(a).injector();if(!a)throw Ha("test");return a.get("$$testability")}function Wc(a,b){b=b||"_";return a.replace(Ce,function(a,c){return(c?b:"")+a.toLowerCase()})}function De(){var a;if(!Xc){var b=sb();(tb=v(b)?D.jQuery:b?D[b]:void 0)&&tb.fn.on?(y=tb,P(tb.fn,{scope:Sa.scope,isolateScope:Sa.isolateScope,controller:Sa.controller,injector:Sa.injector,inheritedData:Sa.inheritedData})):
y=W;a=y.cleanData;y.cleanData=function(b){for(var c,e=0,f;null!=(f=b[e]);e++)(c=y._data(f).events)&&c.$destroy&&y(f).triggerHandler("$destroy");a(b)};fa.element=y;Xc=!0}}function ib(a,b,d){if(!a)throw Ha("areq",b||"?",d||"required");return a}function ub(a,b,d){d&&F(a)&&(a=a[a.length-1]);ib(z(a),b,"not a function, got "+(a&&"object"===typeof a?a.constructor.name||"Object":typeof a));return a}function Na(a,b){if("hasOwnProperty"===a)throw Ha("badname",b);}function Ee(a,b,d){if(!b)return a;b=b.split(".");
for(var c,e=a,f=b.length,g=0;g<f;g++)c=b[g],a&&(a=(e=a)[c]);return!d&&z(a)?Ra(e,a):a}function vb(a){for(var b=a[0],d=a[a.length-1],c,e=1;b!==d&&(b=b.nextSibling);e++)if(c||a[e]!==b)c||(c=y(ya.call(a,0,e))),c.push(b);return c||a}function U(){return Object.create(null)}function ic(a){if(null==a)return"";switch(typeof a){case "string":break;case "number":a=""+a;break;default:a=!bc(a)||F(a)||$(a)?fb(a):a.toString()}return a}function Fe(a){function b(a,b,c){return a[b]||(a[b]=c())}var d=L("$injector"),
c=L("ng");a=b(a,"angular",Object);a.$$minErr=a.$$minErr||L;return b(a,"module",function(){var a={};return function(f,g,k){var h={};if("hasOwnProperty"===f)throw c("badname","module");g&&a.hasOwnProperty(f)&&(a[f]=null);return b(a,f,function(){function a(b,c,d,f){f||(f=e);return function(){f[d||"push"]([b,c,arguments]);return C}}function b(a,c,d){d||(d=e);return function(b,e){e&&z(e)&&(e.$$moduleName=f);d.push([a,c,arguments]);return C}}if(!g)throw d("nomod",f);var e=[],n=[],t=[],s=a("$injector","invoke",
"push",n),C={_invokeQueue:e,_configBlocks:n,_runBlocks:t,info:function(a){if(u(a)){if(!G(a))throw c("aobj","value");h=a;return this}return h},requires:g,name:f,provider:b("$provide","provider"),factory:b("$provide","factory"),service:b("$provide","service"),value:a("$provide","value"),constant:a("$provide","constant","unshift"),decorator:b("$provide","decorator",n),animation:b("$animateProvider","register"),filter:b("$filterProvider","register"),controller:b("$controllerProvider","register"),directive:b("$compileProvider",
"directive"),component:b("$compileProvider","component"),config:s,run:function(a){t.push(a);return this}};k&&s(k);return C})}})}function ja(a,b){if(F(a)){b=b||[];for(var d=0,c=a.length;d<c;d++)b[d]=a[d]}else if(G(a))for(d in b=b||{},a)if("$"!==d.charAt(0)||"$"!==d.charAt(1))b[d]=a[d];return b||a}function Ge(a,b){var d=[];Xb(b)&&(a=fa.copy(a,null,b));return JSON.stringify(a,function(a,b){b=Rc(a,b);if(G(b)){if(0<=d.indexOf(b))return"...";d.push(b)}return b})}function He(a){P(a,{errorHandlingConfig:qe,
bootstrap:Vc,copy:za,extend:P,merge:se,equals:ua,element:y,forEach:q,injector:hb,noop:x,bind:Ra,toJson:fb,fromJson:Sc,identity:Qa,isUndefined:v,isDefined:u,isString:B,isFunction:z,isObject:G,isNumber:aa,isElement:$b,isArray:F,version:Ie,isDate:$,callbacks:{$$counter:0},getTestability:Be,reloadWithDebugInfo:Ae,$$minErr:L,$$csp:Ba,$$encodeUriSegment:gb,$$encodeUriQuery:ka,$$lowercase:O,$$stringify:ic,$$uppercase:wb});jc=Fe(D);jc("ng",["ngLocale"],["$provide",function(a){a.provider({$$sanitizeUri:Je});
a.provider("$compile",Yc).directive({a:Ke,input:Zc,textarea:Zc,form:Le,script:Me,select:Ne,option:Oe,ngBind:Pe,ngBindHtml:Qe,ngBindTemplate:Re,ngClass:Se,ngClassEven:Te,ngClassOdd:Ue,ngCloak:Ve,ngController:We,ngForm:Xe,ngHide:Ye,ngIf:Ze,ngInclude:$e,ngInit:af,ngNonBindable:bf,ngPluralize:cf,ngRef:df,ngRepeat:ef,ngShow:ff,ngStyle:gf,ngSwitch:hf,ngSwitchWhen:jf,ngSwitchDefault:kf,ngOptions:lf,ngTransclude:mf,ngModel:nf,ngList:of,ngChange:pf,pattern:$c,ngPattern:$c,required:ad,ngRequired:ad,minlength:bd,
ngMinlength:bd,maxlength:cd,ngMaxlength:cd,ngValue:qf,ngModelOptions:rf}).directive({ngInclude:sf}).directive(xb).directive(dd);a.provider({$anchorScroll:tf,$animate:uf,$animateCss:vf,$$animateJs:wf,$$animateQueue:xf,$$AnimateRunner:yf,$$animateAsyncRun:zf,$browser:Af,$cacheFactory:Bf,$controller:Cf,$document:Df,$$isDocumentHidden:Ef,$exceptionHandler:Ff,$filter:ed,$$forceReflow:Gf,$interpolate:Hf,$interval:If,$http:Jf,$httpParamSerializer:Kf,$httpParamSerializerJQLike:Lf,$httpBackend:Mf,$xhrFactory:Nf,
$jsonpCallbacks:Of,$location:Pf,$log:Qf,$parse:Rf,$rootScope:Sf,$q:Tf,$$q:Uf,$sce:Vf,$sceDelegate:Wf,$sniffer:Xf,$templateCache:Yf,$templateRequest:Zf,$$testability:$f,$timeout:ag,$window:bg,$$rAF:cg,$$jqLite:dg,$$Map:eg,$$cookieReader:fg})}]).info({angularVersion:"1.7.2"})}function yb(a,b){return b.toUpperCase()}function zb(a){return a.replace(gg,yb)}function kc(a){a=a.nodeType;return 1===a||!a||9===a}function fd(a,b){var d,c,e=b.createDocumentFragment(),f=[];if(lc.test(a)){d=e.appendChild(b.createElement("div"));
c=(hg.exec(a)||["",""])[1].toLowerCase();c=na[c]||na._default;d.innerHTML=c[1]+a.replace(ig,"<$1></$2>")+c[2];for(c=c[0];c--;)d=d.lastChild;f=eb(f,d.childNodes);d=e.firstChild;d.textContent=""}else f.push(b.createTextNode(a));e.textContent="";e.innerHTML="";q(f,function(a){e.appendChild(a)});return e}function W(a){if(a instanceof W)return a;var b;B(a)&&(a=Q(a),b=!0);if(!(this instanceof W)){if(b&&"<"!==a.charAt(0))throw mc("nosel");return new W(a)}if(b){b=D.document;var d;a=(d=jg.exec(a))?[b.createElement(d[1])]:
(d=fd(a,b))?d.childNodes:[];nc(this,a)}else z(a)?gd(a):nc(this,a)}function oc(a){return a.cloneNode(!0)}function Ab(a,b){!b&&kc(a)&&y.cleanData([a]);a.querySelectorAll&&y.cleanData(a.querySelectorAll("*"))}function hd(a){for(var b in a)return!1;return!0}function id(a){var b=a.ng339,d=b&&Oa[b],c=d&&d.events,d=d&&d.data;d&&!hd(d)||c&&!hd(c)||(delete Oa[b],a.ng339=void 0)}function jd(a,b,d,c){if(u(c))throw mc("offargs");var e=(c=Bb(a))&&c.events,f=c&&c.handle;if(f){if(b){var g=function(b){var c=e[b];
u(d)&&db(c||[],d);u(d)&&c&&0<c.length||(a.removeEventListener(b,f),delete e[b])};q(b.split(" "),function(a){g(a);Cb[a]&&g(Cb[a])})}else for(b in e)"$destroy"!==b&&a.removeEventListener(b,f),delete e[b];id(a)}}function pc(a,b){var d=a.ng339;if(d=d&&Oa[d])b?delete d.data[b]:d.data={},id(a)}function Bb(a,b){var d=a.ng339,d=d&&Oa[d];b&&!d&&(a.ng339=d=++kg,d=Oa[d]={events:{},data:{},handle:void 0});return d}function qc(a,b,d){if(kc(a)){var c,e=u(d),f=!e&&b&&!G(b),g=!b;a=(a=Bb(a,!f))&&a.data;if(e)a[zb(b)]=
d;else{if(g)return a;if(f)return a&&a[zb(b)];for(c in b)a[zb(c)]=b[c]}}}function Db(a,b){return a.getAttribute?-1<(" "+(a.getAttribute("class")||"")+" ").replace(/[\n\t]/g," ").indexOf(" "+b+" "):!1}function Eb(a,b){if(b&&a.setAttribute){var d=(" "+(a.getAttribute("class")||"")+" ").replace(/[\n\t]/g," "),c=d;q(b.split(" "),function(a){a=Q(a);c=c.replace(" "+a+" "," ")});c!==d&&a.setAttribute("class",Q(c))}}function Fb(a,b){if(b&&a.setAttribute){var d=(" "+(a.getAttribute("class")||"")+" ").replace(/[\n\t]/g,
" "),c=d;q(b.split(" "),function(a){a=Q(a);-1===c.indexOf(" "+a+" ")&&(c+=a+" ")});c!==d&&a.setAttribute("class",Q(c))}}function nc(a,b){if(b)if(b.nodeType)a[a.length++]=b;else{var d=b.length;if("number"===typeof d&&b.window!==b){if(d)for(var c=0;c<d;c++)a[a.length++]=b[c]}else a[a.length++]=b}}function kd(a,b){return Gb(a,"$"+(b||"ngController")+"Controller")}function Gb(a,b,d){9===a.nodeType&&(a=a.documentElement);for(b=F(b)?b:[b];a;){for(var c=0,e=b.length;c<e;c++)if(u(d=y.data(a,b[c])))return d;
a=a.parentNode||11===a.nodeType&&a.host}}function ld(a){for(Ab(a,!0);a.firstChild;)a.removeChild(a.firstChild)}function Hb(a,b){b||Ab(a);var d=a.parentNode;d&&d.removeChild(a)}function lg(a,b){b=b||D;if("complete"===b.document.readyState)b.setTimeout(a);else y(b).on("load",a)}function gd(a){function b(){D.document.removeEventListener("DOMContentLoaded",b);D.removeEventListener("load",b);a()}"complete"===D.document.readyState?D.setTimeout(a):(D.document.addEventListener("DOMContentLoaded",b),D.addEventListener("load",
b))}function md(a,b){var d=Ib[b.toLowerCase()];return d&&nd[ta(a)]&&d}function mg(a,b){var d=function(c,d){c.isDefaultPrevented=function(){return c.defaultPrevented};var f=b[d||c.type],g=f?f.length:0;if(g){if(v(c.immediatePropagationStopped)){var k=c.stopImmediatePropagation;c.stopImmediatePropagation=function(){c.immediatePropagationStopped=!0;c.stopPropagation&&c.stopPropagation();k&&k.call(c)}}c.isImmediatePropagationStopped=function(){return!0===c.immediatePropagationStopped};var h=f.specialHandlerWrapper||
ng;1<g&&(f=ja(f));for(var l=0;l<g;l++)c.isImmediatePropagationStopped()||h(a,c,f[l])}};d.elem=a;return d}function ng(a,b,d){d.call(a,b)}function og(a,b,d){var c=b.relatedTarget;c&&(c===a||pg.call(a,c))||d.call(a,b)}function dg(){this.$get=function(){return P(W,{hasClass:function(a,b){a.attr&&(a=a[0]);return Db(a,b)},addClass:function(a,b){a.attr&&(a=a[0]);return Fb(a,b)},removeClass:function(a,b){a.attr&&(a=a[0]);return Eb(a,b)}})}}function Ta(a,b){var d=a&&a.$$hashKey;if(d)return"function"===typeof d&&
(d=a.$$hashKey()),d;d=typeof a;return d="function"===d||"object"===d&&null!==a?a.$$hashKey=d+":"+(b||re)():d+":"+a}function od(){this._keys=[];this._values=[];this._lastKey=NaN;this._lastIndex=-1}function pd(a){a=Function.prototype.toString.call(a).replace(qg,"");return a.match(rg)||a.match(sg)}function tg(a){return(a=pd(a))?"function("+(a[1]||"").replace(/[\s\r\n]+/," ")+")":"fn"}function hb(a,b){function d(a){return function(b,c){if(G(b))q(b,Yb(a));else return a(b,c)}}function c(a,b){Na(a,"service");
if(z(b)||F(b))b=n.instantiate(b);if(!b.$get)throw Ja("pget",a);return p[a+"Provider"]=b}function e(a,b){return function(){var c=C.invoke(b,this);if(v(c))throw Ja("undef",a);return c}}function f(a,b,d){return c(a,{$get:!1!==d?e(a,b):b})}function g(a){ib(v(a)||F(a),"modulesToLoad","not an array");var b=[],c;q(a,function(a){function d(a){var b,c;b=0;for(c=a.length;b<c;b++){var e=a[b],f=n.get(e[0]);f[e[1]].apply(f,e[2])}}if(!m.get(a)){m.set(a,!0);try{B(a)?(c=jc(a),C.modules[a]=c,b=b.concat(g(c.requires)).concat(c._runBlocks),
d(c._invokeQueue),d(c._configBlocks)):z(a)?b.push(n.invoke(a)):F(a)?b.push(n.invoke(a)):ub(a,"module")}catch(e){throw F(a)&&(a=a[a.length-1]),e.message&&e.stack&&-1===e.stack.indexOf(e.message)&&(e=e.message+"\n"+e.stack),Ja("modulerr",a,e.stack||e.message||e);}}});return b}function k(a,c){function d(b,e){if(a.hasOwnProperty(b)){if(a[b]===h)throw Ja("cdep",b+" <- "+l.join(" <- "));return a[b]}try{return l.unshift(b),a[b]=h,a[b]=c(b,e),a[b]}catch(f){throw a[b]===h&&delete a[b],f;}finally{l.shift()}}
function e(a,c,f){var g=[];a=hb.$$annotate(a,b,f);for(var h=0,k=a.length;h<k;h++){var l=a[h];if("string"!==typeof l)throw Ja("itkn",l);g.push(c&&c.hasOwnProperty(l)?c[l]:d(l,f))}return g}return{invoke:function(a,b,c,d){"string"===typeof c&&(d=c,c=null);c=e(a,c,d);F(a)&&(a=a[a.length-1]);d=a;if(Ca||"function"!==typeof d)d=!1;else{var f=d.$$ngIsClass;Ga(f)||(f=d.$$ngIsClass=/^class\b/.test(Function.prototype.toString.call(d)));d=f}return d?(c.unshift(null),new (Function.prototype.bind.apply(a,c))):
a.apply(b,c)},instantiate:function(a,b,c){var d=F(a)?a[a.length-1]:a;a=e(a,b,c);a.unshift(null);return new (Function.prototype.bind.apply(d,a))},get:d,annotate:hb.$$annotate,has:function(b){return p.hasOwnProperty(b+"Provider")||a.hasOwnProperty(b)}}}b=!0===b;var h={},l=[],m=new Jb,p={$provide:{provider:d(c),factory:d(f),service:d(function(a,b){return f(a,["$injector",function(a){return a.instantiate(b)}])}),value:d(function(a,b){return f(a,ia(b),!1)}),constant:d(function(a,b){Na(a,"constant");p[a]=
b;t[a]=b}),decorator:function(a,b){var c=n.get(a+"Provider"),d=c.$get;c.$get=function(){var a=C.invoke(d,c);return C.invoke(b,null,{$delegate:a})}}}},n=p.$injector=k(p,function(a,b){fa.isString(b)&&l.push(b);throw Ja("unpr",l.join(" <- "));}),t={},s=k(t,function(a,b){var c=n.get(a+"Provider",b);return C.invoke(c.$get,c,void 0,a)}),C=s;p.$injectorProvider={$get:ia(s)};C.modules=n.modules=U();var w=g(a),C=s.get("$injector");C.strictDi=b;q(w,function(a){a&&C.invoke(a)});C.loadNewModules=function(a){q(g(a),
function(a){a&&C.invoke(a)})};return C}function tf(){var a=!0;this.disableAutoScrolling=function(){a=!1};this.$get=["$window","$location","$rootScope",function(b,d,c){function e(a){var b=null;Array.prototype.some.call(a,function(a){if("a"===ta(a))return b=a,!0});return b}function f(a){if(a){a.scrollIntoView();var c;c=g.yOffset;z(c)?c=c():$b(c)?(c=c[0],c="fixed"!==b.getComputedStyle(c).position?0:c.getBoundingClientRect().bottom):aa(c)||(c=0);c&&(a=a.getBoundingClientRect().top,b.scrollBy(0,a-c))}else b.scrollTo(0,
0)}function g(a){a=B(a)?a:aa(a)?a.toString():d.hash();var b;a?(b=k.getElementById(a))?f(b):(b=e(k.getElementsByName(a)))?f(b):"top"===a&&f(null):f(null)}var k=b.document;a&&c.$watch(function(){return d.hash()},function(a,b){a===b&&""===a||lg(function(){c.$evalAsync(g)})});return g}]}function jb(a,b){if(!a&&!b)return"";if(!a)return b;if(!b)return a;F(a)&&(a=a.join(" "));F(b)&&(b=b.join(" "));return a+" "+b}function ug(a){B(a)&&(a=a.split(" "));var b=U();q(a,function(a){a.length&&(b[a]=!0)});return b}
function Ka(a){return G(a)?a:{}}function vg(a,b,d,c){function e(a){try{a.apply(null,ya.call(arguments,1))}finally{if(s--,0===s)for(;C.length;)try{C.pop()()}catch(b){d.error(b)}}}function f(){A=null;k()}function g(){w=E();w=v(w)?null:w;ua(w,I)&&(w=I);V=I=w}function k(){var a=V;g();if(K!==h.url()||a!==w)K=h.url(),V=w,q(H,function(a){a(h.url(),w)})}var h=this,l=a.location,m=a.history,p=a.setTimeout,n=a.clearTimeout,t={};h.isMock=!1;var s=0,C=[];h.$$completeOutstandingRequest=e;h.$$incOutstandingRequestCount=
function(){s++};h.notifyWhenNoOutstandingRequests=function(a){0===s?a():C.push(a)};var w,V,K=l.href,ma=b.find("base"),A=null,E=c.history?function(){try{return m.state}catch(a){}}:x;g();h.url=function(b,d,e){v(e)&&(e=null);l!==a.location&&(l=a.location);m!==a.history&&(m=a.history);if(b){var f=V===e;if(K===b&&(!c.history||f))return h;var k=K&&Da(K)===Da(b);K=b;V=e;!c.history||k&&f?(k||(A=b),d?l.replace(b):k?(d=l,e=b.indexOf("#"),e=-1===e?"":b.substr(e),d.hash=e):l.href=b,l.href!==b&&(A=b)):(m[d?"replaceState":
"pushState"](e,"",b),g());A&&(A=b);return h}return A||l.href};h.state=function(){return w};var H=[],la=!1,I=null;h.onUrlChange=function(b){if(!la){if(c.history)y(a).on("popstate",f);y(a).on("hashchange",f);la=!0}H.push(b);return b};h.$$applicationDestroyed=function(){y(a).off("hashchange popstate",f)};h.$$checkUrlChange=k;h.baseHref=function(){var a=ma.attr("href");return a?a.replace(/^(https?:)?\/\/[^/]*/,""):""};h.defer=function(a,b){var c;s++;c=p(function(){delete t[c];e(a)},b||0);t[c]=!0;return c};
h.defer.cancel=function(a){return t[a]?(delete t[a],n(a),e(x),!0):!1}}function Af(){this.$get=["$window","$log","$sniffer","$document",function(a,b,d,c){return new vg(a,c,b,d)}]}function Bf(){this.$get=function(){function a(a,c){function e(a){a!==p&&(n?n===a&&(n=a.n):n=a,f(a.n,a.p),f(a,p),p=a,p.n=null)}function f(a,b){a!==b&&(a&&(a.p=b),b&&(b.n=a))}if(a in b)throw L("$cacheFactory")("iid",a);var g=0,k=P({},c,{id:a}),h=U(),l=c&&c.capacity||Number.MAX_VALUE,m=U(),p=null,n=null;return b[a]={put:function(a,
b){if(!v(b)){if(l<Number.MAX_VALUE){var c=m[a]||(m[a]={key:a});e(c)}a in h||g++;h[a]=b;g>l&&this.remove(n.key);return b}},get:function(a){if(l<Number.MAX_VALUE){var b=m[a];if(!b)return;e(b)}return h[a]},remove:function(a){if(l<Number.MAX_VALUE){var b=m[a];if(!b)return;b===p&&(p=b.p);b===n&&(n=b.n);f(b.n,b.p);delete m[a]}a in h&&(delete h[a],g--)},removeAll:function(){h=U();g=0;m=U();p=n=null},destroy:function(){m=k=h=null;delete b[a]},info:function(){return P({},k,{size:g})}}}var b={};a.info=function(){var a=
{};q(b,function(b,e){a[e]=b.info()});return a};a.get=function(a){return b[a]};return a}}function Yf(){this.$get=["$cacheFactory",function(a){return a("templates")}]}function Yc(a,b){function d(a,b,c){var d=/^([@&]|[=<](\*?))(\??)\s*([\w$]*)$/,e=U();q(a,function(a,f){a=a.trim();if(a in p)e[f]=p[a];else{var g=a.match(d);if(!g)throw ba("iscp",b,f,a,c?"controller bindings definition":"isolate scope definition");e[f]={mode:g[1][0],collection:"*"===g[2],optional:"?"===g[3],attrName:g[4]||f};g[4]&&(p[a]=
e[f])}});return e}function c(a){var b=a.charAt(0);if(!b||b!==O(b))throw ba("baddir",a);if(a!==a.trim())throw ba("baddir",a);}function e(a){var b=a.require||a.controller&&a.name;!F(b)&&G(b)&&q(b,function(a,c){var d=a.match(l);a.substring(d[0].length)||(b[c]=d[0]+c)});return b}var f={},g=/^\s*directive:\s*([\w-]+)\s+(.*)$/,k=/(([\w-]+)(?::([^;]+))?;?)/,h=ve("ngSrc,ngSrcset,src,srcset"),l=/^(?:(\^\^?)?(\?)?(\^\^?)?)?/,m=/^(on[a-z]+|formaction)$/,p=U();this.directive=function K(b,d){ib(b,"name");Na(b,
"directive");B(b)?(c(b),ib(d,"directiveFactory"),f.hasOwnProperty(b)||(f[b]=[],a.factory(b+"Directive",["$injector","$exceptionHandler",function(a,c){var d=[];q(f[b],function(f,g){try{var h=a.invoke(f);z(h)?h={compile:ia(h)}:!h.compile&&h.link&&(h.compile=ia(h.link));h.priority=h.priority||0;h.index=g;h.name=h.name||b;h.require=e(h);var k=h,l=h.restrict;if(l&&(!B(l)||!/[EACM]/.test(l)))throw ba("badrestrict",l,b);k.restrict=l||"EA";h.$$moduleName=f.$$moduleName;d.push(h)}catch(m){c(m)}});return d}])),
f[b].push(d)):q(b,Yb(K));return this};this.component=function ma(a,b){function c(a){function e(b){return z(b)||F(b)?function(c,d){return a.invoke(b,this,{$element:c,$attrs:d})}:b}var f=b.template||b.templateUrl?b.template:"",g={controller:d,controllerAs:wg(b.controller)||b.controllerAs||"$ctrl",template:e(f),templateUrl:e(b.templateUrl),transclude:b.transclude,scope:{},bindToController:b.bindings||{},restrict:"E",require:b.require};q(b,function(a,b){"$"===b.charAt(0)&&(g[b]=a)});return g}if(!B(a))return q(a,
Yb(Ra(this,ma))),this;var d=b.controller||function(){};q(b,function(a,b){"$"===b.charAt(0)&&(c[b]=a,z(d)&&(d[b]=a))});c.$inject=["$injector"];return this.directive(a,c)};this.aHrefSanitizationWhitelist=function(a){return u(a)?(b.aHrefSanitizationWhitelist(a),this):b.aHrefSanitizationWhitelist()};this.imgSrcSanitizationWhitelist=function(a){return u(a)?(b.imgSrcSanitizationWhitelist(a),this):b.imgSrcSanitizationWhitelist()};var n=!0;this.debugInfoEnabled=function(a){return u(a)?(n=a,this):n};var t=
!1;this.strictComponentBindingsEnabled=function(a){return u(a)?(t=a,this):t};var s=10;this.onChangesTtl=function(a){return arguments.length?(s=a,this):s};var C=!0;this.commentDirectivesEnabled=function(a){return arguments.length?(C=a,this):C};var w=!0;this.cssClassDirectivesEnabled=function(a){return arguments.length?(w=a,this):w};this.$get=["$injector","$interpolate","$exceptionHandler","$templateRequest","$parse","$controller","$rootScope","$sce","$animate",function(a,b,c,e,p,I,J,R,M){function Y(){try{if(!--Da)throw ca=
void 0,ba("infchng",s);J.$apply(function(){for(var a=0,b=ca.length;a<b;++a)try{ca[a]()}catch(d){c(d)}ca=void 0})}finally{Da++}}function r(a,b){if(b){var c=Object.keys(b),d,e,f;d=0;for(e=c.length;d<e;d++)f=c[d],this[f]=b[f]}else this.$attr={};this.$$element=a}function va(a,b,c){Ba.innerHTML="<span "+b+">";b=Ba.firstChild.attributes;var d=b[0];b.removeNamedItem(d.name);d.value=c;a.attributes.setNamedItem(d)}function u(a,b){try{a.addClass(b)}catch(c){}}function N(a,b,c,d,e){a instanceof y||(a=y(a));
var f=Z(a,b,a,c,d,e);N.$$addScopeClass(a);var g=null;return function(b,c,d){if(!a)throw ba("multilink");ib(b,"scope");e&&e.needsNewScope&&(b=b.$parent.$new());d=d||{};var h=d.parentBoundTranscludeFn,k=d.transcludeControllers;d=d.futureParentElement;h&&h.$$boundTransclude&&(h=h.$$boundTransclude);g||(g=(d=d&&d[0])?"foreignobject"!==ta(d)&&ga.call(d).match(/SVG/)?"svg":"html":"html");d="html"!==g?y(ia(g,y("<div></div>").append(a).html())):c?Sa.clone.call(a):a;if(k)for(var l in k)d.data("$"+l+"Controller",
k[l].instance);N.$$addScopeInfo(d,b);c&&c(d,b);f&&f(b,d,d,h);c||(a=f=null);return d}}function Z(a,b,c,d,e,f){function g(a,c,d,e){var f,k,l,m,p,n,E;if(H)for(E=Array(c.length),m=0;m<h.length;m+=3)f=h[m],E[f]=c[f];else E=c;m=0;for(p=h.length;m<p;)k=E[h[m++]],c=h[m++],f=h[m++],c?(c.scope?(l=a.$new(),N.$$addScopeInfo(y(k),l)):l=a,n=c.transcludeOnThisElement?La(a,c.transclude,e):!c.templateOnThisElement&&e?e:!e&&b?La(a,b):null,c(f,l,k,d,n)):f&&f(a,k.childNodes,void 0,e)}for(var h=[],k=F(a)||a instanceof
y,l,m,p,n,H,E=0;E<a.length;E++){l=new r;11===Ca&&Ua(a,E,k);m=rc(a[E],[],l,0===E?d:void 0,e);(f=m.length?W(m,a[E],l,b,c,null,[],[],f):null)&&f.scope&&N.$$addScopeClass(l.$$element);l=f&&f.terminal||!(p=a[E].childNodes)||!p.length?null:Z(p,f?(f.transcludeOnThisElement||!f.templateOnThisElement)&&f.transclude:b);if(f||l)h.push(E,f,l),n=!0,H=H||f;f=null}return n?g:null}function Ua(a,b,c){var d=a[b],e=d.parentNode,f;if(d.nodeType===Ma)for(;;){f=e?d.nextSibling:a[b+1];if(!f||f.nodeType!==Ma)break;d.nodeValue+=
f.nodeValue;f.parentNode&&f.parentNode.removeChild(f);c&&f===a[b+1]&&a.splice(b+1,1)}}function La(a,b,c){function d(e,f,g,h,k){e||(e=a.$new(!1,k),e.$$transcluded=!0);return b(e,f,{parentBoundTranscludeFn:c,transcludeControllers:g,futureParentElement:h})}var e=d.$$slots=U(),f;for(f in b.$$slots)e[f]=b.$$slots[f]?La(a,b.$$slots[f],c):null;return d}function rc(a,b,c,d,e){var f=c.$attr,g;switch(a.nodeType){case 1:g=ta(a);T(b,wa(g),"E",d,e);for(var h,l,m,p,n=a.attributes,H=0,E=n&&n.length;H<E;H++){var C=
!1,w=!1;h=n[H];l=h.name;m=h.value;h=wa(l);(p=Na.test(h))&&(l=l.replace(qd,"").substr(8).replace(/_(.)/g,function(a,b){return b.toUpperCase()}));(h=h.match(Oa))&&X(h[1])&&(C=l,w=l.substr(0,l.length-5)+"end",l=l.substr(0,l.length-6));h=wa(l.toLowerCase());f[h]=l;if(p||!c.hasOwnProperty(h))c[h]=m,md(a,h)&&(c[h]=!0);oa(a,b,m,h,p);T(b,h,"A",d,e,C,w)}"input"===g&&"hidden"===a.getAttribute("type")&&a.setAttribute("autocomplete","off");if(!Ka)break;f=a.className;G(f)&&(f=f.animVal);if(B(f)&&""!==f)for(;a=
k.exec(f);)h=wa(a[2]),T(b,h,"C",d,e)&&(c[h]=Q(a[3])),f=f.substr(a.index+a[0].length);break;case Ma:ka(b,a.nodeValue);break;case 8:if(!Ja)break;xa(a,b,c,d,e)}b.sort(fa);return b}function xa(a,b,c,d,e){try{var f=g.exec(a.nodeValue);if(f){var h=wa(f[1]);T(b,h,"M",d,e)&&(c[h]=Q(f[2]))}}catch(k){}}function rd(a,b,c){var d=[],e=0;if(b&&a.hasAttribute&&a.hasAttribute(b)){do{if(!a)throw ba("uterdir",b,c);1===a.nodeType&&(a.hasAttribute(b)&&e++,a.hasAttribute(c)&&e--);d.push(a);a=a.nextSibling}while(0<e)}else d.push(a);
return y(d)}function L(a,b,c){return function(d,e,f,g,h){e=rd(e[0],b,c);return a(d,e,f,g,h)}}function sc(a,b,c,d,e,f){var g;return a?N(b,c,d,e,f):function(){g||(g=N(b,c,d,e,f),b=c=f=null);return g.apply(this,arguments)}}function W(a,b,d,e,f,g,h,k,l){function m(a,b,c,d){if(a){c&&(a=L(a,c,d));a.require=s.require;a.directiveName=J;if(w===s||s.$$isolateScope)a=qa(a,{isolateScope:!0});h.push(a)}if(b){c&&(b=L(b,c,d));b.require=s.require;b.directiveName=J;if(w===s||s.$$isolateScope)b=qa(b,{isolateScope:!0});
k.push(b)}}function p(a,e,f,g,l){function m(a,b,c,d){var e;cb(a)||(d=c,c=b,b=a,a=void 0);la&&(e=A);c||(c=la?J.parent():J);if(d){var f=l.$$slots[d];if(f)return f(a,b,e,c,Y);if(v(f))throw ba("noslot",d,Aa(J));}else return l(a,b,e,c,Y)}var n,s,t,I,ma,A,M,J;b===f?(g=d,J=d.$$element):(J=y(f),g=new r(J,d));ma=e;w?I=e.$new(!0):H&&(ma=e.$parent);l&&(M=m,M.$$boundTransclude=l,M.isSlotFilled=function(a){return!!l.$$slots[a]});C&&(A=aa(J,g,M,C,I,e,w));w&&(N.$$addScopeInfo(J,I,!0,!(R&&(R===w||R===w.$$originalDirective))),
N.$$addScopeClass(J,!0),I.$$isolateBindings=w.$$isolateBindings,s=za(e,g,I,I.$$isolateBindings,w),s.removeWatches&&I.$on("$destroy",s.removeWatches));for(n in A){s=C[n];t=A[n];var xg=s.$$bindings.bindToController;t.instance=t();J.data("$"+s.name+"Controller",t.instance);t.bindingInfo=za(ma,g,t.instance,xg,s)}q(C,function(a,b){var c=a.require;a.bindToController&&!F(c)&&G(c)&&P(A[b].instance,S(b,c,J,A))});q(A,function(a){var b=a.instance;if(z(b.$onChanges))try{b.$onChanges(a.bindingInfo.initialChanges)}catch(d){c(d)}if(z(b.$onInit))try{b.$onInit()}catch(e){c(e)}z(b.$doCheck)&&
(ma.$watch(function(){b.$doCheck()}),b.$doCheck());z(b.$onDestroy)&&ma.$on("$destroy",function(){b.$onDestroy()})});n=0;for(s=h.length;n<s;n++)t=h[n],ra(t,t.isolateScope?I:e,J,g,t.require&&S(t.directiveName,t.require,J,A),M);var Y=e;w&&(w.template||null===w.templateUrl)&&(Y=I);a&&a(Y,f.childNodes,void 0,l);for(n=k.length-1;0<=n;n--)t=k[n],ra(t,t.isolateScope?I:e,J,g,t.require&&S(t.directiveName,t.require,J,A),M);q(A,function(a){a=a.instance;z(a.$postLink)&&a.$postLink()})}l=l||{};for(var n=-Number.MAX_VALUE,
H=l.newScopeDirective,C=l.controllerDirectives,w=l.newIsolateScopeDirective,R=l.templateDirective,t=l.nonTlbTranscludeDirective,ma=!1,A=!1,la=l.hasElementTranscludeDirective,I=d.$$element=y(b),s,J,M,Y=e,va,u=!1,Pa=!1,Z,x=0,B=a.length;x<B;x++){s=a[x];var Ua=s.$$start,La=s.$$end;Ua&&(I=rd(b,Ua,La));M=void 0;if(n>s.priority)break;if(Z=s.scope)s.templateUrl||(G(Z)?($("new/isolated scope",w||H,s,I),w=s):$("new/isolated scope",w,s,I)),H=H||s;J=s.name;if(!u&&(s.replace&&(s.templateUrl||s.template)||s.transclude&&
!s.$$tlb)){for(Z=x+1;u=a[Z++];)if(u.transclude&&!u.$$tlb||u.replace&&(u.templateUrl||u.template)){Pa=!0;break}u=!0}!s.templateUrl&&s.controller&&(C=C||U(),$("'"+J+"' controller",C[J],s,I),C[J]=s);if(Z=s.transclude)if(ma=!0,s.$$tlb||($("transclusion",t,s,I),t=s),"element"===Z)la=!0,n=s.priority,M=I,I=d.$$element=y(N.$$createComment(J,d[J])),b=I[0],ja(f,ya.call(M,0),b),Y=sc(Pa,M,e,n,g&&g.name,{nonTlbTranscludeDirective:t});else{var xa=U();if(G(Z)){M=D.document.createDocumentFragment();var O=U(),T=U();
q(Z,function(a,b){var c="?"===a.charAt(0);a=c?a.substring(1):a;O[a]=b;xa[b]=null;T[b]=c});q(I.contents(),function(a){var b=O[wa(ta(a))];b?(T[b]=!0,xa[b]=xa[b]||D.document.createDocumentFragment(),xa[b].appendChild(a)):M.appendChild(a)});q(T,function(a,b){if(!a)throw ba("reqslot",b);});for(var X in xa)xa[X]&&(xa[X]=sc(Pa,xa[X].childNodes,e));M=M.childNodes}else M=y(oc(b)).contents();I.empty();Y=sc(Pa,M,e,void 0,void 0,{needsNewScope:s.$$isolateScope||s.$$newScope});Y.$$slots=xa}if(s.template)if(A=
!0,$("template",R,s,I),R=s,Z=z(s.template)?s.template(I,d):s.template,Z=Ia(Z),s.replace){g=s;M=lc.test(Z)?sd(ia(s.templateNamespace,Q(Z))):[];b=M[0];if(1!==M.length||1!==b.nodeType)throw ba("tplrt",J,"");ja(f,I,b);B={$attr:{}};Z=rc(b,[],B);var fa=a.splice(x+1,a.length-(x+1));(w||H)&&da(Z,w,H);a=a.concat(Z).concat(fa);ea(d,B);B=a.length}else I.html(Z);if(s.templateUrl)A=!0,$("template",R,s,I),R=s,s.replace&&(g=s),p=ha(a.splice(x,a.length-x),I,d,f,ma&&Y,h,k,{controllerDirectives:C,newScopeDirective:H!==
s&&H,newIsolateScopeDirective:w,templateDirective:R,nonTlbTranscludeDirective:t}),B=a.length;else if(s.compile)try{va=s.compile(I,d,Y);var ca=s.$$originalDirective||s;z(va)?m(null,Ra(ca,va),Ua,La):va&&m(Ra(ca,va.pre),Ra(ca,va.post),Ua,La)}catch(ga){c(ga,Aa(I))}s.terminal&&(p.terminal=!0,n=Math.max(n,s.priority))}p.scope=H&&!0===H.scope;p.transcludeOnThisElement=ma;p.templateOnThisElement=A;p.transclude=Y;l.hasElementTranscludeDirective=la;return p}function S(a,b,c,d){var e;if(B(b)){var f=b.match(l);
b=b.substring(f[0].length);var g=f[1]||f[3],f="?"===f[2];"^^"===g?c=c.parent():e=(e=d&&d[b])&&e.instance;if(!e){var h="$"+b+"Controller";e=g?c.inheritedData(h):c.data(h)}if(!e&&!f)throw ba("ctreq",b,a);}else if(F(b))for(e=[],g=0,f=b.length;g<f;g++)e[g]=S(a,b[g],c,d);else G(b)&&(e={},q(b,function(b,f){e[f]=S(a,b,c,d)}));return e||null}function aa(a,b,c,d,e,f,g){var h=U(),k;for(k in d){var l=d[k],m={$scope:l===g||l.$$isolateScope?e:f,$element:a,$attrs:b,$transclude:c},p=l.controller;"@"===p&&(p=b[l.name]);
m=I(p,m,!0,l.controllerAs);h[l.name]=m;a.data("$"+l.name+"Controller",m.instance)}return h}function da(a,b,c){for(var d=0,e=a.length;d<e;d++)a[d]=ac(a[d],{$$isolateScope:b,$$newScope:c})}function T(b,c,e,g,h,k,l){if(c===h)return null;var m=null;if(f.hasOwnProperty(c)){h=a.get(c+"Directive");for(var p=0,n=h.length;p<n;p++)if(c=h[p],(v(g)||g>c.priority)&&-1!==c.restrict.indexOf(e)){k&&(c=ac(c,{$$start:k,$$end:l}));if(!c.$$bindings){var H=m=c,E=c.name,C={isolateScope:null,bindToController:null};G(H.scope)&&
(!0===H.bindToController?(C.bindToController=d(H.scope,E,!0),C.isolateScope={}):C.isolateScope=d(H.scope,E,!1));G(H.bindToController)&&(C.bindToController=d(H.bindToController,E,!0));if(C.bindToController&&!H.controller)throw ba("noctrl",E);m=m.$$bindings=C;G(m.isolateScope)&&(c.$$isolateBindings=m.isolateScope)}b.push(c);m=c}}return m}function X(b){if(f.hasOwnProperty(b))for(var c=a.get(b+"Directive"),d=0,e=c.length;d<e;d++)if(b=c[d],b.multiElement)return!0;return!1}function ea(a,b){var c=b.$attr,
d=a.$attr;q(a,function(d,e){"$"!==e.charAt(0)&&(b[e]&&b[e]!==d&&(d=d.length?d+(("style"===e?";":" ")+b[e]):b[e]),a.$set(e,d,!0,c[e]))});q(b,function(b,e){a.hasOwnProperty(e)||"$"===e.charAt(0)||(a[e]=b,"class"!==e&&"style"!==e&&(d[e]=c[e]))})}function ha(a,b,d,f,g,h,k,l){var m=[],p,n,C=b[0],s=a.shift(),w=ac(s,{templateUrl:null,transclude:null,replace:null,$$originalDirective:s}),t=z(s.templateUrl)?s.templateUrl(b,d):s.templateUrl,R=s.templateNamespace;b.empty();e(t).then(function(c){var e,H;c=Ia(c);
if(s.replace){c=lc.test(c)?sd(ia(R,Q(c))):[];e=c[0];if(1!==c.length||1!==e.nodeType)throw ba("tplrt",s.name,t);c={$attr:{}};ja(f,b,e);var E=rc(e,[],c);G(s.scope)&&da(E,!0);a=E.concat(a);ea(d,c)}else e=C,b.html(c);a.unshift(w);p=W(a,e,d,g,b,s,h,k,l);q(f,function(a,c){a===e&&(f[c]=b[0])});for(n=Z(b[0].childNodes,g);m.length;){c=m.shift();H=m.shift();var I=m.shift(),A=m.shift(),E=b[0];if(!c.$$destroyed){if(H!==C){var J=H.className;l.hasElementTranscludeDirective&&s.replace||(E=oc(e));ja(I,y(H),E);u(y(E),
J)}H=p.transcludeOnThisElement?La(c,p.transclude,A):A;p(n,c,E,f,H)}}m=null}).catch(function(a){cc(a)&&c(a)});return function(a,b,c,d,e){a=e;b.$$destroyed||(m?m.push(b,c,d,a):(p.transcludeOnThisElement&&(a=La(b,p.transclude,e)),p(n,b,c,d,a)))}}function fa(a,b){var c=b.priority-a.priority;return 0!==c?c:a.name!==b.name?a.name<b.name?-1:1:a.index-b.index}function $(a,b,c,d){function e(a){return a?" (module: "+a+")":""}if(b)throw ba("multidir",b.name,e(b.$$moduleName),c.name,e(c.$$moduleName),a,Aa(d));
}function ka(a,c){var d=b(c,!0);d&&a.push({priority:0,compile:function(a){a=a.parent();var b=!!a.length;b&&N.$$addBindingClass(a);return function(a,c){var e=c.parent();b||N.$$addBindingClass(e);N.$$addBindingInfo(e,d.expressions);a.$watch(d,function(a){c[0].nodeValue=a})}}})}function ia(a,b){a=O(a||"html");switch(a){case "svg":case "math":var c=D.document.createElement("div");c.innerHTML="<"+a+">"+b+"</"+a+">";return c.childNodes[0].childNodes;default:return b}}function na(a,b){if("srcdoc"===b)return R.HTML;
var c=ta(a);if("src"===b||"ngSrc"===b)return-1===["img","video","audio","source","track"].indexOf(c)?R.RESOURCE_URL:R.MEDIA_URL;if("xlinkHref"===b)return"image"===c?R.MEDIA_URL:"a"===c?R.URL:R.RESOURCE_URL;if("form"===c&&"action"===b||"base"===c&&"href"===b||"link"===c&&"href"===b)return R.RESOURCE_URL;if("a"===c&&("href"===b||"ngHref"===b))return R.URL}function oa(a,c,d,e,f){var g=na(a,e),k=h[e]||f,l=b(d,!f,g,k);if(l){if("multiple"===e&&"select"===ta(a))throw ba("selmulti",Aa(a));if(m.test(e))throw ba("nodomevents");
c.push({priority:100,compile:function(){return{pre:function(a,c,f){c=f.$$observers||(f.$$observers=U());var h=f[e];h!==d&&(l=h&&b(h,!0,g,k),d=h);l&&(f[e]=l(a),(c[e]||(c[e]=[])).$$inter=!0,(f.$$observers&&f.$$observers[e].$$scope||a).$watch(l,function(a,b){"class"===e&&a!==b?f.$updateClass(a,b):f.$set(e,a)}))}}}})}}function ja(a,b,c){var d=b[0],e=b.length,f=d.parentNode,g,h;if(a)for(g=0,h=a.length;g<h;g++)if(a[g]===d){a[g++]=c;h=g+e-1;for(var k=a.length;g<k;g++,h++)h<k?a[g]=a[h]:delete a[g];a.length-=
e-1;a.context===d&&(a.context=c);break}f&&f.replaceChild(c,d);a=D.document.createDocumentFragment();for(g=0;g<e;g++)a.appendChild(b[g]);y.hasData(d)&&(y.data(c,y.data(d)),y(d).off("$destroy"));y.cleanData(a.querySelectorAll("*"));for(g=1;g<e;g++)delete b[g];b[0]=c;b.length=1}function qa(a,b){return P(function(){return a.apply(null,arguments)},a,b)}function ra(a,b,d,e,f,g){try{a(b,d,e,f,g)}catch(h){c(h,Aa(d))}}function pa(a,b){if(t)throw ba("missingattr",a,b);}function za(a,c,d,e,f){function g(b,c,
e){z(d.$onChanges)&&!dc(c,e)&&(ca||(a.$$postDigest(Y),ca=[]),m||(m={},ca.push(h)),m[b]&&(e=m[b].previousValue),m[b]=new Kb(e,c))}function h(){d.$onChanges(m);m=void 0}var k=[],l={},m;q(e,function(e,h){var m=e.attrName,n=e.optional,H,E,s,C;switch(e.mode){case "@":n||sa.call(c,m)||(pa(m,f.name),d[h]=c[m]=void 0);n=c.$observe(m,function(a){if(B(a)||Ga(a))g(h,a,d[h]),d[h]=a});c.$$observers[m].$$scope=a;H=c[m];B(H)?d[h]=b(H)(a):Ga(H)&&(d[h]=H);l[h]=new Kb(tc,d[h]);k.push(n);break;case "=":if(!sa.call(c,
m)){if(n)break;pa(m,f.name);c[m]=void 0}if(n&&!c[m])break;E=p(c[m]);C=E.literal?ua:dc;s=E.assign||function(){H=d[h]=E(a);throw ba("nonassign",c[m],m,f.name);};H=d[h]=E(a);n=function(b){C(b,d[h])||(C(b,H)?s(a,b=d[h]):d[h]=b);return H=b};n.$stateful=!0;n=e.collection?a.$watchCollection(c[m],n):a.$watch(p(c[m],n),null,E.literal);k.push(n);break;case "<":if(!sa.call(c,m)){if(n)break;pa(m,f.name);c[m]=void 0}if(n&&!c[m])break;E=p(c[m]);var w=E.literal,t=d[h]=E(a);l[h]=new Kb(tc,d[h]);n=a[e.collection?
"$watchCollection":"$watch"](E,function(a,b){if(b===a){if(b===t||w&&ua(b,t))return;b=t}g(h,a,b);d[h]=a});k.push(n);break;case "&":n||sa.call(c,m)||pa(m,f.name);E=c.hasOwnProperty(m)?p(c[m]):x;if(E===x&&n)break;d[h]=function(b){return E(a,b)}}});return{initialChanges:l,removeWatches:k.length&&function(){for(var a=0,b=k.length;a<b;++a)k[a]()}}}var Ha=/^\w/,Ba=D.document.createElement("div"),Ja=C,Ka=w,Da=s,ca;r.prototype={$normalize:wa,$addClass:function(a){a&&0<a.length&&M.addClass(this.$$element,a)},
$removeClass:function(a){a&&0<a.length&&M.removeClass(this.$$element,a)},$updateClass:function(a,b){var c=td(a,b);c&&c.length&&M.addClass(this.$$element,c);(c=td(b,a))&&c.length&&M.removeClass(this.$$element,c)},$set:function(a,b,d,e){var f=md(this.$$element[0],a),g=ud[a],h=a;f?(this.$$element.prop(a,b),e=f):g&&(this[g]=b,h=g);this[a]=b;e?this.$attr[a]=e:(e=this.$attr[a])||(this.$attr[a]=e=Wc(a,"-"));if("img"===ta(this.$$element)&&"srcset"===a&&b){if(!B(b))throw ba("srcset",b.toString());for(var f=
"",g=Q(b),k=/(\s+\d+x\s*,|\s+\d+w\s*,|\s+,|,\s+)/,k=/\s/.test(g)?k:/(,)/,g=g.split(k),k=Math.floor(g.length/2),l=0;l<k;l++)var m=2*l,f=f+R.getTrustedMediaUrl(Q(g[m])),f=f+(" "+Q(g[m+1]));g=Q(g[2*l]).split(/\s/);f+=R.getTrustedMediaUrl(Q(g[0]));2===g.length&&(f+=" "+Q(g[1]));this[a]=b=f}!1!==d&&(null===b||v(b)?this.$$element.removeAttr(e):Ha.test(e)?this.$$element.attr(e,b):va(this.$$element[0],e,b));(a=this.$$observers)&&q(a[h],function(a){try{a(b)}catch(d){c(d)}})},$observe:function(a,b){var c=this,
d=c.$$observers||(c.$$observers=U()),e=d[a]||(d[a]=[]);e.push(b);J.$evalAsync(function(){e.$$inter||!c.hasOwnProperty(a)||v(c[a])||b(c[a])});return function(){db(e,b)}}};var Ea=b.startSymbol(),Fa=b.endSymbol(),Ia="{{"===Ea&&"}}"===Fa?Qa:function(a){return a.replace(/\{\{/g,Ea).replace(/}}/g,Fa)},Na=/^ngAttr[A-Z]/,Oa=/^(.+)Start$/;N.$$addBindingInfo=n?function(a,b){var c=a.data("$binding")||[];F(b)?c=c.concat(b):c.push(b);a.data("$binding",c)}:x;N.$$addBindingClass=n?function(a){u(a,"ng-binding")}:
x;N.$$addScopeInfo=n?function(a,b,c,d){a.data(c?d?"$isolateScopeNoTemplate":"$isolateScope":"$scope",b)}:x;N.$$addScopeClass=n?function(a,b){u(a,b?"ng-isolate-scope":"ng-scope")}:x;N.$$createComment=function(a,b){var c="";n&&(c=" "+(a||"")+": ",b&&(c+=b+" "));return D.document.createComment(c)};return N}]}function Kb(a,b){this.previousValue=a;this.currentValue=b}function wa(a){return a.replace(qd,"").replace(yg,function(a,d,c){return c?d.toUpperCase():d})}function td(a,b){var d="",c=a.split(/\s+/),
e=b.split(/\s+/),f=0;a:for(;f<c.length;f++){for(var g=c[f],k=0;k<e.length;k++)if(g===e[k])continue a;d+=(0<d.length?" ":"")+g}return d}function sd(a){a=y(a);var b=a.length;if(1>=b)return a;for(;b--;){var d=a[b];(8===d.nodeType||d.nodeType===Ma&&""===d.nodeValue.trim())&&zg.call(a,b,1)}return a}function wg(a,b){if(b&&B(b))return b;if(B(a)){var d=vd.exec(a);if(d)return d[3]}}function Cf(){var a={};this.has=function(b){return a.hasOwnProperty(b)};this.register=function(b,d){Na(b,"controller");G(b)?P(a,
b):a[b]=d};this.$get=["$injector",function(b){function d(a,b,d,g){if(!a||!G(a.$scope))throw L("$controller")("noscp",g,b);a.$scope[b]=d}return function(c,e,f,g){var k,h,l;f=!0===f;g&&B(g)&&(l=g);if(B(c)){g=c.match(vd);if(!g)throw wd("ctrlfmt",c);h=g[1];l=l||g[3];c=a.hasOwnProperty(h)?a[h]:Ee(e.$scope,h,!0);if(!c)throw wd("ctrlreg",h);ub(c,h,!0)}if(f)return f=(F(c)?c[c.length-1]:c).prototype,k=Object.create(f||null),l&&d(e,l,k,h||c.name),P(function(){var a=b.invoke(c,k,e,h);a!==k&&(G(a)||z(a))&&(k=
a,l&&d(e,l,k,h||c.name));return k},{instance:k,identifier:l});k=b.instantiate(c,e,h);l&&d(e,l,k,h||c.name);return k}}]}function Df(){this.$get=["$window",function(a){return y(a.document)}]}function Ef(){this.$get=["$document","$rootScope",function(a,b){function d(){e=c.hidden}var c=a[0],e=c&&c.hidden;a.on("visibilitychange",d);b.$on("$destroy",function(){a.off("visibilitychange",d)});return function(){return e}}]}function Ff(){this.$get=["$log",function(a){return function(b,d){a.error.apply(a,arguments)}}]}
function uc(a){return G(a)?$(a)?a.toISOString():fb(a):a}function Kf(){this.$get=function(){return function(a){if(!a)return"";var b=[];Pc(a,function(a,c){null===a||v(a)||z(a)||(F(a)?q(a,function(a){b.push(ka(c)+"="+ka(uc(a)))}):b.push(ka(c)+"="+ka(uc(a))))});return b.join("&")}}}function Lf(){this.$get=function(){return function(a){function b(a,e,f){F(a)?q(a,function(a,c){b(a,e+"["+(G(a)?c:"")+"]")}):G(a)&&!$(a)?Pc(a,function(a,c){b(a,e+(f?"":"[")+c+(f?"":"]"))}):(z(a)&&(a=a()),d.push(ka(e)+"="+(null==
a?"":ka(uc(a)))))}if(!a)return"";var d=[];b(a,"",!0);return d.join("&")}}}function vc(a,b){if(B(a)){var d=a.replace(Ag,"").trim();if(d){var c=b("Content-Type"),c=c&&0===c.indexOf(xd),e;(e=c)||(e=(e=d.match(Bg))&&Cg[e[0]].test(d));if(e)try{a=Sc(d)}catch(f){if(!c)return a;throw Lb("baddata",a,f);}}}return a}function yd(a){var b=U(),d;B(a)?q(a.split("\n"),function(a){d=a.indexOf(":");var e=O(Q(a.substr(0,d)));a=Q(a.substr(d+1));e&&(b[e]=b[e]?b[e]+", "+a:a)}):G(a)&&q(a,function(a,d){var f=O(d),g=Q(a);
f&&(b[f]=b[f]?b[f]+", "+g:g)});return b}function zd(a){var b;return function(d){b||(b=yd(a));return d?(d=b[O(d)],void 0===d&&(d=null),d):b}}function Ad(a,b,d,c){if(z(c))return c(a,b,d);q(c,function(c){a=c(a,b,d)});return a}function Jf(){var a=this.defaults={transformResponse:[vc],transformRequest:[function(a){return G(a)&&"[object File]"!==ga.call(a)&&"[object Blob]"!==ga.call(a)&&"[object FormData]"!==ga.call(a)?fb(a):a}],headers:{common:{Accept:"application/json, text/plain, */*"},post:ja(wc),put:ja(wc),
patch:ja(wc)},xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",paramSerializer:"$httpParamSerializer",jsonpCallbackParam:"callback"},b=!1;this.useApplyAsync=function(a){return u(a)?(b=!!a,this):b};var d=this.interceptors=[],c=this.xsrfWhitelistedOrigins=[];this.$get=["$browser","$httpBackend","$$cookieReader","$cacheFactory","$rootScope","$q","$injector","$sce",function(e,f,g,k,h,l,m,p){function n(b){function c(a,b){for(var d=0,e=b.length;d<e;){var f=b[d++],g=b[d++];a=a.then(f,g)}b.length=
0;return a}function d(a,b){var c,e={};q(a,function(a,d){z(a)?(c=a(b),null!=c&&(e[d]=c)):e[d]=a});return e}function f(a){var b=P({},a);b.data=Ad(a.data,a.headers,a.status,g.transformResponse);a=a.status;return 200<=a&&300>a?b:l.reject(b)}if(!G(b))throw L("$http")("badreq",b);if(!B(p.valueOf(b.url)))throw L("$http")("badreq",b.url);var g=P({method:"get",transformRequest:a.transformRequest,transformResponse:a.transformResponse,paramSerializer:a.paramSerializer,jsonpCallbackParam:a.jsonpCallbackParam},
b);g.headers=function(b){var c=a.headers,e=P({},b.headers),f,g,h,c=P({},c.common,c[O(b.method)]);a:for(f in c){g=O(f);for(h in e)if(O(h)===g)continue a;e[f]=c[f]}return d(e,ja(b))}(b);g.method=wb(g.method);g.paramSerializer=B(g.paramSerializer)?m.get(g.paramSerializer):g.paramSerializer;e.$$incOutstandingRequestCount();var h=[],k=[];b=l.resolve(g);q(V,function(a){(a.request||a.requestError)&&h.unshift(a.request,a.requestError);(a.response||a.responseError)&&k.push(a.response,a.responseError)});b=
c(b,h);b=b.then(function(b){var c=b.headers,d=Ad(b.data,zd(c),void 0,b.transformRequest);v(d)&&q(c,function(a,b){"content-type"===O(b)&&delete c[b]});v(b.withCredentials)&&!v(a.withCredentials)&&(b.withCredentials=a.withCredentials);return t(b,d).then(f,f)});b=c(b,k);return b=b.finally(function(){e.$$completeOutstandingRequest(x)})}function t(c,d){function e(a){if(a){var c={};q(a,function(a,d){c[d]=function(c){function d(){a(c)}b?h.$applyAsync(d):h.$$phase?d():h.$apply(d)}});return c}}function k(a,
c,d,e,f){function g(){m(c,a,d,e,f)}Y&&(200<=a&&300>a?Y.put(N,[a,c,yd(d),e,f]):Y.remove(N));b?h.$applyAsync(g):(g(),h.$$phase||h.$apply())}function m(a,b,d,e,f){b=-1<=b?b:0;(200<=b&&300>b?V.resolve:V.reject)({data:a,status:b,headers:zd(d),config:c,statusText:e,xhrStatus:f})}function t(a){m(a.data,a.status,ja(a.headers()),a.statusText,a.xhrStatus)}function J(){var a=n.pendingRequests.indexOf(c);-1!==a&&n.pendingRequests.splice(a,1)}var V=l.defer(),M=V.promise,Y,r,va=c.headers,Pa="jsonp"===O(c.method),
N=c.url;Pa?N=p.getTrustedResourceUrl(N):B(N)||(N=p.valueOf(N));N=s(N,c.paramSerializer(c.params));Pa&&(N=C(N,c.jsonpCallbackParam));n.pendingRequests.push(c);M.then(J,J);!c.cache&&!a.cache||!1===c.cache||"GET"!==c.method&&"JSONP"!==c.method||(Y=G(c.cache)?c.cache:G(a.cache)?a.cache:w);Y&&(r=Y.get(N),u(r)?r&&z(r.then)?r.then(t,t):F(r)?m(r[1],r[0],ja(r[2]),r[3],r[4]):m(r,200,{},"OK","complete"):Y.put(N,M));v(r)&&((r=K(c.url)?g()[c.xsrfCookieName||a.xsrfCookieName]:void 0)&&(va[c.xsrfHeaderName||a.xsrfHeaderName]=
r),f(c.method,N,d,k,va,c.timeout,c.withCredentials,c.responseType,e(c.eventHandlers),e(c.uploadEventHandlers)));return M}function s(a,b){0<b.length&&(a+=(-1===a.indexOf("?")?"?":"&")+b);return a}function C(a,b){var c=a.split("?");if(2<c.length)throw Lb("badjsonp",a);c=gc(c[1]);q(c,function(c,d){if("JSON_CALLBACK"===c)throw Lb("badjsonp",a);if(d===b)throw Lb("badjsonp",b,a);});return a+=(-1===a.indexOf("?")?"?":"&")+b+"=JSON_CALLBACK"}var w=k("$http");a.paramSerializer=B(a.paramSerializer)?m.get(a.paramSerializer):
a.paramSerializer;var V=[];q(d,function(a){V.unshift(B(a)?m.get(a):m.invoke(a))});var K=Dg(c);n.pendingRequests=[];(function(a){q(arguments,function(a){n[a]=function(b,c){return n(P({},c||{},{method:a,url:b}))}})})("get","delete","head","jsonp");(function(a){q(arguments,function(a){n[a]=function(b,c,d){return n(P({},d||{},{method:a,url:b,data:c}))}})})("post","put","patch");n.defaults=a;return n}]}function Nf(){this.$get=function(){return function(){return new D.XMLHttpRequest}}}function Mf(){this.$get=
["$browser","$jsonpCallbacks","$document","$xhrFactory",function(a,b,d,c){return Eg(a,c,a.defer,b,d[0])}]}function Eg(a,b,d,c,e){function f(a,b,d){a=a.replace("JSON_CALLBACK",b);var f=e.createElement("script"),m=null;f.type="text/javascript";f.src=a;f.async=!0;m=function(a){f.removeEventListener("load",m);f.removeEventListener("error",m);e.body.removeChild(f);f=null;var g=-1,t="unknown";a&&("load"!==a.type||c.wasCalled(b)||(a={type:"error"}),t=a.type,g="error"===a.type?404:200);d&&d(g,t)};f.addEventListener("load",
m);f.addEventListener("error",m);e.body.appendChild(f);return m}return function(e,k,h,l,m,p,n,t,s,C){function w(a){E="timeout"===a;r&&r();A&&A.abort()}function V(a,b,c,e,f,g){u(la)&&d.cancel(la);r=A=null;a(b,c,e,f,g)}k=k||a.url();if("jsonp"===O(e))var K=c.createCallback(k),r=f(k,K,function(a,b){var d=200===a&&c.getResponse(K);V(l,a,d,"",b,"complete");c.removeCallback(K)});else{var A=b(e,k),E=!1;A.open(e,k,!0);q(m,function(a,b){u(a)&&A.setRequestHeader(b,a)});A.onload=function(){var a=A.statusText||
"",b="response"in A?A.response:A.responseText,c=1223===A.status?204:A.status;0===c&&(c=b?200:"file"===oa(k).protocol?404:0);V(l,c,b,A.getAllResponseHeaders(),a,"complete")};A.onerror=function(){V(l,-1,null,null,"","error")};A.ontimeout=function(){V(l,-1,null,null,"","timeout")};A.onabort=function(){V(l,-1,null,null,"",E?"timeout":"abort")};q(s,function(a,b){A.addEventListener(b,a)});q(C,function(a,b){A.upload.addEventListener(b,a)});n&&(A.withCredentials=!0);if(t)try{A.responseType=t}catch(H){if("json"!==
t)throw H;}A.send(v(h)?null:h)}if(0<p)var la=d(function(){w("timeout")},p);else p&&z(p.then)&&p.then(function(){w(u(p.$$timeoutId)?"timeout":"abort")})}}function Hf(){var a="{{",b="}}";this.startSymbol=function(b){return b?(a=b,this):a};this.endSymbol=function(a){return a?(b=a,this):b};this.$get=["$parse","$exceptionHandler","$sce",function(d,c,e){function f(a){return"\\\\\\"+a}function g(c){return c.replace(p,a).replace(n,b)}function k(a,b,c,d){var e=a.$watch(function(a){e();return d(a)},b,c);return e}
function h(f,h,p,n){function V(a){try{return a=p&&!K?e.getTrusted(p,a):e.valueOf(a),n&&!u(a)?a:ic(a)}catch(b){c(ca.interr(f,b))}}var K=p===e.URL||p===e.MEDIA_URL;if(!f.length||-1===f.indexOf(a)){if(h&&!K)return;h=g(f);K&&(h=e.getTrusted(p,h));h=ia(h);h.exp=f;h.expressions=[];h.$$watchDelegate=k;return h}n=!!n;for(var q,A,E=0,H=[],la,I=f.length,J=[],R=[],M;E<I;)if(-1!==(q=f.indexOf(a,E))&&-1!==(A=f.indexOf(b,q+l)))E!==q&&J.push(g(f.substring(E,q))),E=f.substring(q+l,A),H.push(E),E=A+m,R.push(J.length),
J.push("");else{E!==I&&J.push(g(f.substring(E)));break}M=1===J.length&&1===R.length;var r=K&&M?void 0:V;la=H.map(function(a){return d(a,r)});if(!h||H.length){var y=function(a){for(var b=0,c=H.length;b<c;b++){if(n&&v(a[b]))return;J[R[b]]=a[b]}if(K)return e.getTrusted(p,M?J[0]:J.join(""));p&&1<J.length&&ca.throwNoconcat(f);return J.join("")};return P(function(a){var b=0,d=H.length,e=Array(d);try{for(;b<d;b++)e[b]=la[b](a);return y(e)}catch(g){c(ca.interr(f,g))}},{exp:f,expressions:H,$$watchDelegate:function(a,
b){var c;return a.$watchGroup(la,function(d,e){var f=y(d);b.call(this,f,d!==e?c:f,a);c=f})}})}}var l=a.length,m=b.length,p=new RegExp(a.replace(/./g,f),"g"),n=new RegExp(b.replace(/./g,f),"g");h.startSymbol=function(){return a};h.endSymbol=function(){return b};return h}]}function If(){this.$get=["$rootScope","$window","$q","$$q","$browser",function(a,b,d,c,e){function f(f,h,l,m){function p(){n?f.apply(null,t):f(w)}var n=4<arguments.length,t=n?ya.call(arguments,4):[],s=b.setInterval,C=b.clearInterval,
w=0,V=u(m)&&!m,K=(V?c:d).defer(),q=K.promise;l=u(l)?l:0;q.$$intervalId=s(function(){V?e.defer(p):a.$evalAsync(p);K.notify(w++);0<l&&w>=l&&(K.resolve(w),C(q.$$intervalId),delete g[q.$$intervalId]);V||a.$apply()},h);g[q.$$intervalId]=K;return q}var g={};f.cancel=function(a){if(!a)return!1;if(!a.hasOwnProperty("$$intervalId"))throw Fg("badprom");if(!g.hasOwnProperty(a.$$intervalId))return!1;a=a.$$intervalId;var c=g[a];c.promise.$$state.pur=!0;c.reject("canceled");b.clearInterval(a);delete g[a];return!0};
return f}]}function xc(a){a=a.split("/");for(var b=a.length;b--;)a[b]=gb(a[b].replace(/%2F/g,"/"));return a.join("/")}function Bd(a,b){var d=oa(a);b.$$protocol=d.protocol;b.$$host=d.hostname;b.$$port=ea(d.port)||Gg[d.protocol]||null}function Cd(a,b,d){if(Hg.test(a))throw kb("badpath",a);var c="/"!==a.charAt(0);c&&(a="/"+a);a=oa(a);for(var c=(c&&"/"===a.pathname.charAt(0)?a.pathname.substring(1):a.pathname).split("/"),e=c.length;e--;)c[e]=decodeURIComponent(c[e]),d&&(c[e]=c[e].replace(/\//g,"%2F"));
d=c.join("/");b.$$path=d;b.$$search=gc(a.search);b.$$hash=decodeURIComponent(a.hash);b.$$path&&"/"!==b.$$path.charAt(0)&&(b.$$path="/"+b.$$path)}function yc(a,b){return a.slice(0,b.length)===b}function qa(a,b){if(yc(b,a))return b.substr(a.length)}function Da(a){var b=a.indexOf("#");return-1===b?a:a.substr(0,b)}function lb(a){return a.replace(/(#.+)|#$/,"$1")}function zc(a,b,d){this.$$html5=!0;d=d||"";Bd(a,this);this.$$parse=function(a){var d=qa(b,a);if(!B(d))throw kb("ipthprfx",a,b);Cd(d,this,!0);
this.$$path||(this.$$path="/");this.$$compose()};this.$$compose=function(){var a=hc(this.$$search),d=this.$$hash?"#"+gb(this.$$hash):"";this.$$url=xc(this.$$path)+(a?"?"+a:"")+d;this.$$absUrl=b+this.$$url.substr(1);this.$$urlUpdatedByLocation=!0};this.$$parseLinkUrl=function(c,e){if(e&&"#"===e[0])return this.hash(e.slice(1)),!0;var f,g;u(f=qa(a,c))?(g=f,g=d&&u(f=qa(d,f))?b+(qa("/",f)||f):a+g):u(f=qa(b,c))?g=b+f:b===c+"/"&&(g=b);g&&this.$$parse(g);return!!g}}function Ac(a,b,d){Bd(a,this);this.$$parse=
function(c){var e=qa(a,c)||qa(b,c),f;v(e)||"#"!==e.charAt(0)?this.$$html5?f=e:(f="",v(e)&&(a=c,this.replace())):(f=qa(d,e),v(f)&&(f=e));Cd(f,this,!1);c=this.$$path;var e=a,g=/^\/[A-Z]:(\/.*)/;yc(f,e)&&(f=f.replace(e,""));g.exec(f)||(c=(f=g.exec(c))?f[1]:c);this.$$path=c;this.$$compose()};this.$$compose=function(){var b=hc(this.$$search),e=this.$$hash?"#"+gb(this.$$hash):"";this.$$url=xc(this.$$path)+(b?"?"+b:"")+e;this.$$absUrl=a+(this.$$url?d+this.$$url:"");this.$$urlUpdatedByLocation=!0};this.$$parseLinkUrl=
function(b,d){return Da(a)===Da(b)?(this.$$parse(b),!0):!1}}function Dd(a,b,d){this.$$html5=!0;Ac.apply(this,arguments);this.$$parseLinkUrl=function(c,e){if(e&&"#"===e[0])return this.hash(e.slice(1)),!0;var f,g;a===Da(c)?f=c:(g=qa(b,c))?f=a+d+g:b===c+"/"&&(f=b);f&&this.$$parse(f);return!!f};this.$$compose=function(){var b=hc(this.$$search),e=this.$$hash?"#"+gb(this.$$hash):"";this.$$url=xc(this.$$path)+(b?"?"+b:"")+e;this.$$absUrl=a+d+this.$$url;this.$$urlUpdatedByLocation=!0}}function Mb(a){return function(){return this[a]}}
function Ed(a,b){return function(d){if(v(d))return this[a];this[a]=b(d);this.$$compose();return this}}function Pf(){var a="!",b={enabled:!1,requireBase:!0,rewriteLinks:!0};this.hashPrefix=function(b){return u(b)?(a=b,this):a};this.html5Mode=function(a){if(Ga(a))return b.enabled=a,this;if(G(a)){Ga(a.enabled)&&(b.enabled=a.enabled);Ga(a.requireBase)&&(b.requireBase=a.requireBase);if(Ga(a.rewriteLinks)||B(a.rewriteLinks))b.rewriteLinks=a.rewriteLinks;return this}return b};this.$get=["$rootScope","$browser",
"$sniffer","$rootElement","$window",function(d,c,e,f,g){function k(a,b,d){var e=l.url(),f=l.$$state;try{c.url(a,b,d),l.$$state=c.state()}catch(g){throw l.url(e),l.$$state=f,g;}}function h(a,b){d.$broadcast("$locationChangeSuccess",l.absUrl(),a,l.$$state,b)}var l,m;m=c.baseHref();var p=c.url(),n;if(b.enabled){if(!m&&b.requireBase)throw kb("nobase");n=p.substring(0,p.indexOf("/",p.indexOf("//")+2))+(m||"/");m=e.history?zc:Dd}else n=Da(p),m=Ac;var t=n.substr(0,Da(n).lastIndexOf("/")+1);l=new m(n,t,"#"+
a);l.$$parseLinkUrl(p,p);l.$$state=c.state();var s=/^\s*(javascript|mailto):/i;f.on("click",function(a){var e=b.rewriteLinks;if(e&&!a.ctrlKey&&!a.metaKey&&!a.shiftKey&&2!==a.which&&2!==a.button){for(var g=y(a.target);"a"!==ta(g[0]);)if(g[0]===f[0]||!(g=g.parent())[0])return;if(!B(e)||!v(g.attr(e))){var e=g.prop("href"),h=g.attr("href")||g.attr("xlink:href");G(e)&&"[object SVGAnimatedString]"===e.toString()&&(e=oa(e.animVal).href);s.test(e)||!e||g.attr("target")||a.isDefaultPrevented()||!l.$$parseLinkUrl(e,
h)||(a.preventDefault(),l.absUrl()!==c.url()&&d.$apply())}}});lb(l.absUrl())!==lb(p)&&c.url(l.absUrl(),!0);var C=!0;c.onUrlChange(function(a,b){yc(a,t)?(d.$evalAsync(function(){var c=l.absUrl(),e=l.$$state,f;a=lb(a);l.$$parse(a);l.$$state=b;f=d.$broadcast("$locationChangeStart",a,c,b,e).defaultPrevented;l.absUrl()===a&&(f?(l.$$parse(c),l.$$state=e,k(c,!1,e)):(C=!1,h(c,e)))}),d.$$phase||d.$digest()):g.location.href=a});d.$watch(function(){if(C||l.$$urlUpdatedByLocation){l.$$urlUpdatedByLocation=!1;
var a=lb(c.url()),b=lb(l.absUrl()),f=c.state(),g=l.$$replace,m=a!==b||l.$$html5&&e.history&&f!==l.$$state;if(C||m)C=!1,d.$evalAsync(function(){var b=l.absUrl(),c=d.$broadcast("$locationChangeStart",b,a,l.$$state,f).defaultPrevented;l.absUrl()===b&&(c?(l.$$parse(a),l.$$state=f):(m&&k(b,g,f===l.$$state?null:l.$$state),h(a,f)))})}l.$$replace=!1});return l}]}function Qf(){var a=!0,b=this;this.debugEnabled=function(b){return u(b)?(a=b,this):a};this.$get=["$window",function(d){function c(a){cc(a)&&(a.stack&&
f?a=a.message&&-1===a.stack.indexOf(a.message)?"Error: "+a.message+"\n"+a.stack:a.stack:a.sourceURL&&(a=a.message+"\n"+a.sourceURL+":"+a.line));return a}function e(a){var b=d.console||{},e=b[a]||b.log||x;return function(){var a=[];q(arguments,function(b){a.push(c(b))});return Function.prototype.apply.call(e,b,a)}}var f=Ca||/\bEdge\//.test(d.navigator&&d.navigator.userAgent);return{log:e("log"),info:e("info"),warn:e("warn"),error:e("error"),debug:function(){var c=e("debug");return function(){a&&c.apply(b,
arguments)}}()}}]}function Ig(a){return a+""}function Jg(a,b){return"undefined"!==typeof a?a:b}function Fd(a,b){return"undefined"===typeof a?b:"undefined"===typeof b?a:a+b}function Kg(a,b){switch(a.type){case r.MemberExpression:if(a.computed)return!1;break;case r.UnaryExpression:return 1;case r.BinaryExpression:return"+"!==a.operator?1:!1;case r.CallExpression:return!1}return void 0===b?Gd:b}function S(a,b,d){var c,e,f=a.isPure=Kg(a,d);switch(a.type){case r.Program:c=!0;q(a.body,function(a){S(a.expression,
b,f);c=c&&a.expression.constant});a.constant=c;break;case r.Literal:a.constant=!0;a.toWatch=[];break;case r.UnaryExpression:S(a.argument,b,f);a.constant=a.argument.constant;a.toWatch=a.argument.toWatch;break;case r.BinaryExpression:S(a.left,b,f);S(a.right,b,f);a.constant=a.left.constant&&a.right.constant;a.toWatch=a.left.toWatch.concat(a.right.toWatch);break;case r.LogicalExpression:S(a.left,b,f);S(a.right,b,f);a.constant=a.left.constant&&a.right.constant;a.toWatch=a.constant?[]:[a];break;case r.ConditionalExpression:S(a.test,
b,f);S(a.alternate,b,f);S(a.consequent,b,f);a.constant=a.test.constant&&a.alternate.constant&&a.consequent.constant;a.toWatch=a.constant?[]:[a];break;case r.Identifier:a.constant=!1;a.toWatch=[a];break;case r.MemberExpression:S(a.object,b,f);a.computed&&S(a.property,b,f);a.constant=a.object.constant&&(!a.computed||a.property.constant);a.toWatch=a.constant?[]:[a];break;case r.CallExpression:c=d=a.filter?!b(a.callee.name).$stateful:!1;e=[];q(a.arguments,function(a){S(a,b,f);c=c&&a.constant;e.push.apply(e,
a.toWatch)});a.constant=c;a.toWatch=d?e:[a];break;case r.AssignmentExpression:S(a.left,b,f);S(a.right,b,f);a.constant=a.left.constant&&a.right.constant;a.toWatch=[a];break;case r.ArrayExpression:c=!0;e=[];q(a.elements,function(a){S(a,b,f);c=c&&a.constant;e.push.apply(e,a.toWatch)});a.constant=c;a.toWatch=e;break;case r.ObjectExpression:c=!0;e=[];q(a.properties,function(a){S(a.value,b,f);c=c&&a.value.constant;e.push.apply(e,a.value.toWatch);a.computed&&(S(a.key,b,!1),c=c&&a.key.constant,e.push.apply(e,
a.key.toWatch))});a.constant=c;a.toWatch=e;break;case r.ThisExpression:a.constant=!1;a.toWatch=[];break;case r.LocalsExpression:a.constant=!1,a.toWatch=[]}}function Hd(a){if(1===a.length){a=a[0].expression;var b=a.toWatch;return 1!==b.length?b:b[0]!==a?b:void 0}}function Id(a){return a.type===r.Identifier||a.type===r.MemberExpression}function Jd(a){if(1===a.body.length&&Id(a.body[0].expression))return{type:r.AssignmentExpression,left:a.body[0].expression,right:{type:r.NGValueParameter},operator:"="}}
function Kd(a){this.$filter=a}function Ld(a){this.$filter=a}function Nb(a,b,d){this.ast=new r(a,d);this.astCompiler=d.csp?new Ld(b):new Kd(b)}function Bc(a){return z(a.valueOf)?a.valueOf():Lg.call(a)}function Rf(){var a=U(),b={"true":!0,"false":!1,"null":null,undefined:void 0},d,c;this.addLiteral=function(a,c){b[a]=c};this.setIdentifierFns=function(a,b){d=a;c=b;return this};this.$get=["$filter",function(e){function f(b,c){var d,f;switch(typeof b){case "string":return f=b=b.trim(),d=a[f],d||(d=new Ob(s),
d=(new Nb(d,e,s)).parse(b),a[f]=p(d)),t(d,c);case "function":return t(b,c);default:return t(x,c)}}function g(a,b,c){return null==a||null==b?a===b:"object"!==typeof a||(a=Bc(a),"object"!==typeof a||c)?a===b||a!==a&&b!==b:!1}function k(a,b,c,d,e){var f=d.inputs,h;if(1===f.length){var k=g,f=f[0];return a.$watch(function(a){var b=f(a);g(b,k,f.isPure)||(h=d(a,void 0,void 0,[b]),k=b&&Bc(b));return h},b,c,e)}for(var l=[],m=[],p=0,n=f.length;p<n;p++)l[p]=g,m[p]=null;return a.$watch(function(a){for(var b=
!1,c=0,e=f.length;c<e;c++){var k=f[c](a);if(b||(b=!g(k,l[c],f[c].isPure)))m[c]=k,l[c]=k&&Bc(k)}b&&(h=d(a,void 0,void 0,m));return h},b,c,e)}function h(a,b,c,d,e){function f(){h(m)&&k()}function g(a,b,c,d){m=t&&d?d[0]:n(a,b,c,d);h(m)&&a.$$postDigest(f);return s(m)}var h=d.literal?l:u,k,m,n=d.$$intercepted||d,s=d.$$interceptor||Qa,t=d.inputs&&!n.inputs;g.literal=d.literal;g.constant=d.constant;g.inputs=d.inputs;p(g);return k=a.$watch(g,b,c,e)}function l(a){var b=!0;q(a,function(a){u(a)||(b=!1)});return b}
function m(a,b,c,d){var e=a.$watch(function(a){e();return d(a)},b,c);return e}function p(a){a.constant?a.$$watchDelegate=m:a.oneTime?a.$$watchDelegate=h:a.inputs&&(a.$$watchDelegate=k);return a}function n(a,b){function c(d){return b(a(d))}c.$stateful=a.$stateful||b.$stateful;c.$$pure=a.$$pure&&b.$$pure;return c}function t(a,b){if(!b)return a;a.$$interceptor&&(b=n(a.$$interceptor,b),a=a.$$intercepted);var c=!1,d=function(d,e,f,g){d=c&&g?g[0]:a(d,e,f,g);return b(d)};d.$$intercepted=a;d.$$interceptor=
b;d.literal=a.literal;d.oneTime=a.oneTime;d.constant=a.constant;b.$stateful||(c=!a.inputs,d.inputs=a.inputs?a.inputs:[a],b.$$pure||(d.inputs=d.inputs.map(function(a){return a.isPure===Gd?function(b){return a(b)}:a})));return p(d)}var s={csp:Ba().noUnsafeEval,literals:za(b),isIdentifierStart:z(d)&&d,isIdentifierContinue:z(c)&&c};f.$$getAst=function(a){var b=new Ob(s);return(new Nb(b,e,s)).getAst(a).ast};return f}]}function Tf(){var a=!0;this.$get=["$rootScope","$exceptionHandler",function(b,d){return Md(function(a){b.$evalAsync(a)},
d,a)}];this.errorOnUnhandledRejections=function(b){return u(b)?(a=b,this):a}}function Uf(){var a=!0;this.$get=["$browser","$exceptionHandler",function(b,d){return Md(function(a){b.defer(a)},d,a)}];this.errorOnUnhandledRejections=function(b){return u(b)?(a=b,this):a}}function Md(a,b,d){function c(){return new e}function e(){var a=this.promise=new f;this.resolve=function(b){h(a,b)};this.reject=function(b){m(a,b)};this.notify=function(b){n(a,b)}}function f(){this.$$state={status:0}}function g(){for(;!K&&
u.length;){var a=u.shift();if(!a.pur){a.pur=!0;var c=a.value,c="Possibly unhandled rejection: "+("function"===typeof c?c.toString().replace(/ \{[\s\S]*$/,""):v(c)?"undefined":"string"!==typeof c?Ge(c,void 0):c);cc(a.value)?b(a.value,c):b(c)}}}function k(c){!d||c.pending||2!==c.status||c.pur||(0===K&&0===u.length&&a(g),u.push(c));!c.processScheduled&&c.pending&&(c.processScheduled=!0,++K,a(function(){var e,f,k;k=c.pending;c.processScheduled=!1;c.pending=void 0;try{for(var l=0,p=k.length;l<p;++l){c.pur=
!0;f=k[l][0];e=k[l][c.status];try{z(e)?h(f,e(c.value)):1===c.status?h(f,c.value):m(f,c.value)}catch(n){m(f,n),n&&!0===n.$$passToExceptionHandler&&b(n)}}}finally{--K,d&&0===K&&a(g)}}))}function h(a,b){a.$$state.status||(b===a?p(a,r("qcycle",b)):l(a,b))}function l(a,b){function c(b){g||(g=!0,l(a,b))}function d(b){g||(g=!0,p(a,b))}function e(b){n(a,b)}var f,g=!1;try{if(G(b)||z(b))f=b.then;z(f)?(a.$$state.status=-1,f.call(b,c,d,e)):(a.$$state.value=b,a.$$state.status=1,k(a.$$state))}catch(h){d(h)}}function m(a,
b){a.$$state.status||p(a,b)}function p(a,b){a.$$state.value=b;a.$$state.status=2;k(a.$$state)}function n(c,d){var e=c.$$state.pending;0>=c.$$state.status&&e&&e.length&&a(function(){for(var a,c,f=0,g=e.length;f<g;f++){c=e[f][0];a=e[f][3];try{n(c,z(a)?a(d):d)}catch(h){b(h)}}})}function t(a){var b=new f;m(b,a);return b}function s(a,b,c){var d=null;try{z(c)&&(d=c())}catch(e){return t(e)}return d&&z(d.then)?d.then(function(){return b(a)},t):b(a)}function C(a,b,c,d){var e=new f;h(e,a);return e.then(b,c,
d)}function w(a){if(!z(a))throw r("norslvr",a);var b=new f;a(function(a){h(b,a)},function(a){m(b,a)});return b}var r=L("$q",TypeError),K=0,u=[];P(f.prototype,{then:function(a,b,c){if(v(a)&&v(b)&&v(c))return this;var d=new f;this.$$state.pending=this.$$state.pending||[];this.$$state.pending.push([d,a,b,c]);0<this.$$state.status&&k(this.$$state);return d},"catch":function(a){return this.then(null,a)},"finally":function(a,b){return this.then(function(b){return s(b,A,a)},function(b){return s(b,t,a)},
b)}});var A=C;w.prototype=f.prototype;w.defer=c;w.reject=t;w.when=C;w.resolve=A;w.all=function(a){var b=new f,c=0,d=F(a)?[]:{};q(a,function(a,e){c++;C(a).then(function(a){d[e]=a;--c||h(b,d)},function(a){m(b,a)})});0===c&&h(b,d);return b};w.race=function(a){var b=c();q(a,function(a){C(a).then(b.resolve,b.reject)});return b.promise};return w}function cg(){this.$get=["$window","$timeout",function(a,b){var d=a.requestAnimationFrame||a.webkitRequestAnimationFrame,c=a.cancelAnimationFrame||a.webkitCancelAnimationFrame||
a.webkitCancelRequestAnimationFrame,e=!!d,f=e?function(a){var b=d(a);return function(){c(b)}}:function(a){var c=b(a,16.66,!1);return function(){b.cancel(c)}};f.supported=e;return f}]}function Sf(){function a(a){function b(){this.$$watchers=this.$$nextSibling=this.$$childHead=this.$$childTail=null;this.$$listeners={};this.$$listenerCount={};this.$$watchersCount=0;this.$id=++rb;this.$$ChildScope=null;this.$$suspended=!1}b.prototype=a;return b}var b=10,d=L("$rootScope"),c=null,e=null;this.digestTtl=
function(a){arguments.length&&(b=a);return b};this.$get=["$exceptionHandler","$parse","$browser",function(f,g,k){function h(a){a.currentScope.$$destroyed=!0}function l(a){9===Ca&&(a.$$childHead&&l(a.$$childHead),a.$$nextSibling&&l(a.$$nextSibling));a.$parent=a.$$nextSibling=a.$$prevSibling=a.$$childHead=a.$$childTail=a.$root=a.$$watchers=null}function m(){this.$id=++rb;this.$$phase=this.$parent=this.$$watchers=this.$$nextSibling=this.$$prevSibling=this.$$childHead=this.$$childTail=null;this.$root=
this;this.$$suspended=this.$$destroyed=!1;this.$$listeners={};this.$$listenerCount={};this.$$watchersCount=0;this.$$isolateBindings=null}function p(a){if(r.$$phase)throw d("inprog",r.$$phase);r.$$phase=a}function n(a,b){do a.$$watchersCount+=b;while(a=a.$parent)}function t(a,b,c){do a.$$listenerCount[c]-=b,0===a.$$listenerCount[c]&&delete a.$$listenerCount[c];while(a=a.$parent)}function s(){}function C(){for(;A.length;)try{A.shift()()}catch(a){f(a)}e=null}function w(){null===e&&(e=k.defer(function(){r.$apply(C)}))}
m.prototype={constructor:m,$new:function(b,c){var d;c=c||this;b?(d=new m,d.$root=this.$root):(this.$$ChildScope||(this.$$ChildScope=a(this)),d=new this.$$ChildScope);d.$parent=c;d.$$prevSibling=c.$$childTail;c.$$childHead?(c.$$childTail.$$nextSibling=d,c.$$childTail=d):c.$$childHead=c.$$childTail=d;(b||c!==this)&&d.$on("$destroy",h);return d},$watch:function(a,b,d,e){var f=g(a);b=z(b)?b:x;if(f.$$watchDelegate)return f.$$watchDelegate(this,b,d,f,a);var h=this,k=h.$$watchers,l={fn:b,last:s,get:f,exp:e||
a,eq:!!d};c=null;k||(k=h.$$watchers=[],k.$$digestWatchIndex=-1);k.unshift(l);k.$$digestWatchIndex++;n(this,1);return function(){var a=db(k,l);0<=a&&(n(h,-1),a<k.$$digestWatchIndex&&k.$$digestWatchIndex--);c=null}},$watchGroup:function(a,b){function c(){h=!1;try{k?(k=!1,b(e,e,g)):b(e,d,g)}finally{for(var f=0;f<a.length;f++)d[f]=e[f]}}var d=Array(a.length),e=Array(a.length),f=[],g=this,h=!1,k=!0;if(!a.length){var l=!0;g.$evalAsync(function(){l&&b(e,e,g)});return function(){l=!1}}if(1===a.length)return this.$watch(a[0],
function(a,c,f){e[0]=a;d[0]=c;b(e,a===c?e:d,f)});q(a,function(a,b){var d=g.$watch(a,function(a){e[b]=a;h||(h=!0,g.$evalAsync(c))});f.push(d)});return function(){for(;f.length;)f.shift()()}},$watchCollection:function(a,b){function c(a){e=a;var b,d,g,h;if(!v(e)){if(G(e))if(ra(e))for(f!==p&&(f=p,t=f.length=0,l++),a=e.length,t!==a&&(l++,f.length=t=a),b=0;b<a;b++)h=f[b],g=e[b],d=h!==h&&g!==g,d||h===g||(l++,f[b]=g);else{f!==n&&(f=n={},t=0,l++);a=0;for(b in e)sa.call(e,b)&&(a++,g=e[b],h=f[b],b in f?(d=h!==
h&&g!==g,d||h===g||(l++,f[b]=g)):(t++,f[b]=g,l++));if(t>a)for(b in l++,f)sa.call(e,b)||(t--,delete f[b])}else f!==e&&(f=e,l++);return l}}c.$$pure=g(a).literal;c.$stateful=!c.$$pure;var d=this,e,f,h,k=1<b.length,l=0,m=g(a,c),p=[],n={},s=!0,t=0;return this.$watch(m,function(){s?(s=!1,b(e,e,d)):b(e,h,d);if(k)if(G(e))if(ra(e)){h=Array(e.length);for(var a=0;a<e.length;a++)h[a]=e[a]}else for(a in h={},e)sa.call(e,a)&&(h[a]=e[a]);else h=e})},$digest:function(){var a,g,h,l,m,n,t,q=b,w,A=K.length?r:this,v=
[],y,x;p("$digest");k.$$checkUrlChange();this===r&&null!==e&&(k.defer.cancel(e),C());c=null;do{t=!1;w=A;for(n=0;n<K.length;n++){try{x=K[n],l=x.fn,l(x.scope,x.locals)}catch(D){f(D)}c=null}K.length=0;a:do{if(n=!w.$$suspended&&w.$$watchers)for(n.$$digestWatchIndex=n.length;n.$$digestWatchIndex--;)try{if(a=n[n.$$digestWatchIndex])if(m=a.get,(g=m(w))!==(h=a.last)&&!(a.eq?ua(g,h):ha(g)&&ha(h)))t=!0,c=a,a.last=a.eq?za(g,null):g,l=a.fn,l(g,h===s?g:h,w),5>q&&(y=4-q,v[y]||(v[y]=[]),v[y].push({msg:z(a.exp)?
"fn: "+(a.exp.name||a.exp.toString()):a.exp,newVal:g,oldVal:h}));else if(a===c){t=!1;break a}}catch(B){f(B)}if(!(n=!w.$$suspended&&w.$$watchersCount&&w.$$childHead||w!==A&&w.$$nextSibling))for(;w!==A&&!(n=w.$$nextSibling);)w=w.$parent}while(w=n);if((t||K.length)&&!q--)throw r.$$phase=null,d("infdig",b,v);}while(t||K.length);for(r.$$phase=null;E<u.length;)try{u[E++]()}catch(G){f(G)}u.length=E=0;k.$$checkUrlChange()},$suspend:function(){this.$$suspended=!0},$isSuspended:function(){return this.$$suspended},
$resume:function(){this.$$suspended=!1},$destroy:function(){if(!this.$$destroyed){var a=this.$parent;this.$broadcast("$destroy");this.$$destroyed=!0;this===r&&k.$$applicationDestroyed();n(this,-this.$$watchersCount);for(var b in this.$$listenerCount)t(this,this.$$listenerCount[b],b);a&&a.$$childHead===this&&(a.$$childHead=this.$$nextSibling);a&&a.$$childTail===this&&(a.$$childTail=this.$$prevSibling);this.$$prevSibling&&(this.$$prevSibling.$$nextSibling=this.$$nextSibling);this.$$nextSibling&&(this.$$nextSibling.$$prevSibling=
this.$$prevSibling);this.$destroy=this.$digest=this.$apply=this.$evalAsync=this.$applyAsync=x;this.$on=this.$watch=this.$watchGroup=function(){return x};this.$$listeners={};this.$$nextSibling=null;l(this)}},$eval:function(a,b){return g(a)(this,b)},$evalAsync:function(a,b){r.$$phase||K.length||k.defer(function(){K.length&&r.$digest()});K.push({scope:this,fn:g(a),locals:b})},$$postDigest:function(a){u.push(a)},$apply:function(a){try{p("$apply");try{return this.$eval(a)}finally{r.$$phase=null}}catch(b){f(b)}finally{try{r.$digest()}catch(c){throw f(c),
c;}}},$applyAsync:function(a){function b(){c.$eval(a)}var c=this;a&&A.push(b);a=g(a);w()},$on:function(a,b){var c=this.$$listeners[a];c||(this.$$listeners[a]=c=[]);c.push(b);var d=this;do d.$$listenerCount[a]||(d.$$listenerCount[a]=0),d.$$listenerCount[a]++;while(d=d.$parent);var e=this;return function(){var d=c.indexOf(b);-1!==d&&(delete c[d],t(e,1,a))}},$emit:function(a,b){var c=[],d,e=this,g=!1,h={name:a,targetScope:e,stopPropagation:function(){g=!0},preventDefault:function(){h.defaultPrevented=
!0},defaultPrevented:!1},k=eb([h],arguments,1),l,m;do{d=e.$$listeners[a]||c;h.currentScope=e;l=0;for(m=d.length;l<m;l++)if(d[l])try{d[l].apply(null,k)}catch(n){f(n)}else d.splice(l,1),l--,m--;if(g)break;e=e.$parent}while(e);h.currentScope=null;return h},$broadcast:function(a,b){var c=this,d=this,e={name:a,targetScope:this,preventDefault:function(){e.defaultPrevented=!0},defaultPrevented:!1};if(!this.$$listenerCount[a])return e;for(var g=eb([e],arguments,1),h,k;c=d;){e.currentScope=c;d=c.$$listeners[a]||
[];h=0;for(k=d.length;h<k;h++)if(d[h])try{d[h].apply(null,g)}catch(l){f(l)}else d.splice(h,1),h--,k--;if(!(d=c.$$listenerCount[a]&&c.$$childHead||c!==this&&c.$$nextSibling))for(;c!==this&&!(d=c.$$nextSibling);)c=c.$parent}e.currentScope=null;return e}};var r=new m,K=r.$$asyncQueue=[],u=r.$$postDigestQueue=[],A=r.$$applyAsyncQueue=[],E=0;return r}]}function Je(){var a=/^\s*(https?|s?ftp|mailto|tel|file):/,b=/^\s*((https?|ftp|file|blob):|data:image\/)/;this.aHrefSanitizationWhitelist=function(b){return u(b)?
(a=b,this):a};this.imgSrcSanitizationWhitelist=function(a){return u(a)?(b=a,this):b};this.$get=function(){return function(d,c){var e=c?b:a,f=oa(d&&d.trim()).href;return""===f||f.match(e)?d:"unsafe:"+f}}}function Mg(a){if("self"===a)return a;if(B(a)){if(-1<a.indexOf("***"))throw pa("iwcard",a);a=Nd(a).replace(/\\\*\\\*/g,".*").replace(/\\\*/g,"[^:/.?&;]*");return new RegExp("^"+a+"$")}if(bb(a))return new RegExp("^"+a.source+"$");throw pa("imatcher");}function Od(a){var b=[];u(a)&&q(a,function(a){b.push(Mg(a))});
return b}function Wf(){this.SCE_CONTEXTS=da;var a=["self"],b=[];this.resourceUrlWhitelist=function(b){arguments.length&&(a=Od(b));return a};this.resourceUrlBlacklist=function(a){arguments.length&&(b=Od(a));return b};this.$get=["$injector","$$sanitizeUri",function(d,c){function e(a,b){var c;"self"===a?(c=Cc(b,Pd))||(D.document.baseURI?c=D.document.baseURI:(Va||(Va=D.document.createElement("a"),Va.href=".",Va=Va.cloneNode(!1)),c=Va.href),c=Cc(b,c)):c=!!a.exec(b.href);return c}function f(a){var b=function(a){this.$$unwrapTrustedValue=
function(){return a}};a&&(b.prototype=new a);b.prototype.valueOf=function(){return this.$$unwrapTrustedValue()};b.prototype.toString=function(){return this.$$unwrapTrustedValue().toString()};return b}var g=function(a){throw pa("unsafe");};d.has("$sanitize")&&(g=d.get("$sanitize"));var k=f(),h={};h[da.HTML]=f(k);h[da.CSS]=f(k);h[da.MEDIA_URL]=f(k);h[da.URL]=f(h[da.MEDIA_URL]);h[da.JS]=f(k);h[da.RESOURCE_URL]=f(h[da.URL]);return{trustAs:function(a,b){var c=h.hasOwnProperty(a)?h[a]:null;if(!c)throw pa("icontext",
a,b);if(null===b||v(b)||""===b)return b;if("string"!==typeof b)throw pa("itype",a);return new c(b)},getTrusted:function(d,f){if(null===f||v(f)||""===f)return f;var k=h.hasOwnProperty(d)?h[d]:null;if(k&&f instanceof k)return f.$$unwrapTrustedValue();z(f.$$unwrapTrustedValue)&&(f=f.$$unwrapTrustedValue());if(d===da.MEDIA_URL||d===da.URL)return c(f,d===da.MEDIA_URL);if(d===da.RESOURCE_URL){var k=oa(f.toString()),n,t,s=!1;n=0;for(t=a.length;n<t;n++)if(e(a[n],k)){s=!0;break}if(s)for(n=0,t=b.length;n<t;n++)if(e(b[n],
k)){s=!1;break}if(s)return f;throw pa("insecurl",f.toString());}if(d===da.HTML)return g(f);throw pa("unsafe");},valueOf:function(a){return a instanceof k?a.$$unwrapTrustedValue():a}}}]}function Vf(){var a=!0;this.enabled=function(b){arguments.length&&(a=!!b);return a};this.$get=["$parse","$sceDelegate",function(b,d){if(a&&8>Ca)throw pa("iequirks");var c=ja(da);c.isEnabled=function(){return a};c.trustAs=d.trustAs;c.getTrusted=d.getTrusted;c.valueOf=d.valueOf;a||(c.trustAs=c.getTrusted=function(a,b){return b},
c.valueOf=Qa);c.parseAs=function(a,d){var e=b(d);return e.literal&&e.constant?e:b(d,function(b){return c.getTrusted(a,b)})};var e=c.parseAs,f=c.getTrusted,g=c.trustAs;q(da,function(a,b){var d=O(b);c[("parse_as_"+d).replace(Dc,yb)]=function(b){return e(a,b)};c[("get_trusted_"+d).replace(Dc,yb)]=function(b){return f(a,b)};c[("trust_as_"+d).replace(Dc,yb)]=function(b){return g(a,b)}});return c}]}function Xf(){this.$get=["$window","$document",function(a,b){var d={},c=!((!a.nw||!a.nw.process)&&a.chrome&&
(a.chrome.app&&a.chrome.app.runtime||!a.chrome.app&&a.chrome.runtime&&a.chrome.runtime.id))&&a.history&&a.history.pushState,e=ea((/android (\d+)/.exec(O((a.navigator||{}).userAgent))||[])[1]),f=/Boxee/i.test((a.navigator||{}).userAgent),g=b[0]||{},k=g.body&&g.body.style,h=!1,l=!1;k&&(h=!!("transition"in k||"webkitTransition"in k),l=!!("animation"in k||"webkitAnimation"in k));return{history:!(!c||4>e||f),hasEvent:function(a){if("input"===a&&Ca)return!1;if(v(d[a])){var b=g.createElement("div");d[a]=
"on"+a in b}return d[a]},csp:Ba(),transitions:h,animations:l,android:e}}]}function Zf(){var a;this.httpOptions=function(b){return b?(a=b,this):a};this.$get=["$exceptionHandler","$templateCache","$http","$q","$sce",function(b,d,c,e,f){function g(k,h){g.totalPendingRequests++;if(!B(k)||v(d.get(k)))k=f.getTrustedResourceUrl(k);var l=c.defaults&&c.defaults.transformResponse;F(l)?l=l.filter(function(a){return a!==vc}):l===vc&&(l=null);return c.get(k,P({cache:d,transformResponse:l},a)).finally(function(){g.totalPendingRequests--}).then(function(a){return d.put(k,
a.data)},function(a){h||(a=Ng("tpload",k,a.status,a.statusText),b(a));return e.reject(a)})}g.totalPendingRequests=0;return g}]}function $f(){this.$get=["$rootScope","$browser","$location",function(a,b,d){return{findBindings:function(a,b,d){a=a.getElementsByClassName("ng-binding");var g=[];q(a,function(a){var c=fa.element(a).data("$binding");c&&q(c,function(c){d?(new RegExp("(^|\\s)"+Nd(b)+"(\\s|\\||$)")).test(c)&&g.push(a):-1!==c.indexOf(b)&&g.push(a)})});return g},findModels:function(a,b,d){for(var g=
["ng-","data-ng-","ng\\:"],k=0;k<g.length;++k){var h=a.querySelectorAll("["+g[k]+"model"+(d?"=":"*=")+'"'+b+'"]');if(h.length)return h}},getLocation:function(){return d.url()},setLocation:function(b){b!==d.url()&&(d.url(b),a.$digest())},whenStable:function(a){b.notifyWhenNoOutstandingRequests(a)}}}]}function ag(){this.$get=["$rootScope","$browser","$q","$$q","$exceptionHandler",function(a,b,d,c,e){function f(f,h,l){z(f)||(l=h,h=f,f=x);var m=ya.call(arguments,3),p=u(l)&&!l,n=(p?c:d).defer(),t=n.promise,
s;s=b.defer(function(){try{n.resolve(f.apply(null,m))}catch(b){n.reject(b),e(b)}finally{delete g[t.$$timeoutId]}p||a.$apply()},h);t.$$timeoutId=s;g[s]=n;return t}var g={};f.cancel=function(a){if(!a)return!1;if(!a.hasOwnProperty("$$timeoutId"))throw Og("badprom");if(!g.hasOwnProperty(a.$$timeoutId))return!1;a=a.$$timeoutId;var c=g[a];c.promise.$$state.pur=!0;c.reject("canceled");delete g[a];return b.defer.cancel(a)};return f}]}function oa(a){if(!B(a))return a;Ca&&(T.setAttribute("href",a),a=T.href);
T.setAttribute("href",a);return{href:T.href,protocol:T.protocol?T.protocol.replace(/:$/,""):"",host:T.host,search:T.search?T.search.replace(/^\?/,""):"",hash:T.hash?T.hash.replace(/^#/,""):"",hostname:T.hostname,port:T.port,pathname:"/"===T.pathname.charAt(0)?T.pathname:"/"+T.pathname}}function Dg(a){var b=[Pd].concat(a.map(oa));return function(a){a=oa(a);return b.some(Cc.bind(null,a))}}function Cc(a,b){a=oa(a);b=oa(b);return a.protocol===b.protocol&&a.host===b.host}function bg(){this.$get=ia(D)}
function Qd(a){function b(a){try{return decodeURIComponent(a)}catch(b){return a}}var d=a[0]||{},c={},e="";return function(){var a,g,k,h,l;try{a=d.cookie||""}catch(m){a=""}if(a!==e)for(e=a,a=e.split("; "),c={},k=0;k<a.length;k++)g=a[k],h=g.indexOf("="),0<h&&(l=b(g.substring(0,h)),v(c[l])&&(c[l]=b(g.substring(h+1))));return c}}function fg(){this.$get=Qd}function ed(a){function b(d,c){if(G(d)){var e={};q(d,function(a,c){e[c]=b(c,a)});return e}return a.factory(d+"Filter",c)}this.register=b;this.$get=
["$injector",function(a){return function(b){return a.get(b+"Filter")}}];b("currency",Rd);b("date",Sd);b("filter",Pg);b("json",Qg);b("limitTo",Rg);b("lowercase",Sg);b("number",Td);b("orderBy",Ud);b("uppercase",Tg)}function Pg(){return function(a,b,d,c){if(!ra(a)){if(null==a)return a;throw L("filter")("notarray",a);}c=c||"$";var e;switch(Ec(b)){case "function":break;case "boolean":case "null":case "number":case "string":e=!0;case "object":b=Ug(b,d,c,e);break;default:return a}return Array.prototype.filter.call(a,
b)}}function Ug(a,b,d,c){var e=G(a)&&d in a;!0===b?b=ua:z(b)||(b=function(a,b){if(v(a))return!1;if(null===a||null===b)return a===b;if(G(b)||G(a)&&!bc(a))return!1;a=O(""+a);b=O(""+b);return-1!==a.indexOf(b)});return function(f){return e&&!G(f)?Ea(f,a[d],b,d,!1):Ea(f,a,b,d,c)}}function Ea(a,b,d,c,e,f){var g=Ec(a),k=Ec(b);if("string"===k&&"!"===b.charAt(0))return!Ea(a,b.substring(1),d,c,e);if(F(a))return a.some(function(a){return Ea(a,b,d,c,e)});switch(g){case "object":var h;if(e){for(h in a)if(h.charAt&&
"$"!==h.charAt(0)&&Ea(a[h],b,d,c,!0))return!0;return f?!1:Ea(a,b,d,c,!1)}if("object"===k){for(h in b)if(f=b[h],!z(f)&&!v(f)&&(g=h===c,!Ea(g?a:a[h],f,d,c,g,g)))return!1;return!0}return d(a,b);case "function":return!1;default:return d(a,b)}}function Ec(a){return null===a?"null":typeof a}function Rd(a){var b=a.NUMBER_FORMATS;return function(a,c,e){v(c)&&(c=b.CURRENCY_SYM);v(e)&&(e=b.PATTERNS[1].maxFrac);var f=c?/\u00A4/g:/\s*\u00A4\s*/g;return null==a?a:Vd(a,b.PATTERNS[1],b.GROUP_SEP,b.DECIMAL_SEP,e).replace(f,
c)}}function Td(a){var b=a.NUMBER_FORMATS;return function(a,c){return null==a?a:Vd(a,b.PATTERNS[0],b.GROUP_SEP,b.DECIMAL_SEP,c)}}function Vg(a){var b=0,d,c,e,f,g;-1<(c=a.indexOf(Wd))&&(a=a.replace(Wd,""));0<(e=a.search(/e/i))?(0>c&&(c=e),c+=+a.slice(e+1),a=a.substring(0,e)):0>c&&(c=a.length);for(e=0;a.charAt(e)===Fc;e++);if(e===(g=a.length))d=[0],c=1;else{for(g--;a.charAt(g)===Fc;)g--;c-=e;d=[];for(f=0;e<=g;e++,f++)d[f]=+a.charAt(e)}c>Xd&&(d=d.splice(0,Xd-1),b=c-1,c=1);return{d:d,e:b,i:c}}function Wg(a,
b,d,c){var e=a.d,f=e.length-a.i;b=v(b)?Math.min(Math.max(d,f),c):+b;d=b+a.i;c=e[d];if(0<d){e.splice(Math.max(a.i,d));for(var g=d;g<e.length;g++)e[g]=0}else for(f=Math.max(0,f),a.i=1,e.length=Math.max(1,d=b+1),e[0]=0,g=1;g<d;g++)e[g]=0;if(5<=c)if(0>d-1){for(c=0;c>d;c--)e.unshift(0),a.i++;e.unshift(1);a.i++}else e[d-1]++;for(;f<Math.max(0,b);f++)e.push(0);if(b=e.reduceRight(function(a,b,c,d){b+=a;d[c]=b%10;return Math.floor(b/10)},0))e.unshift(b),a.i++}function Vd(a,b,d,c,e){if(!B(a)&&!aa(a)||isNaN(a))return"";
var f=!isFinite(a),g=!1,k=Math.abs(a)+"",h="";if(f)h="\u221e";else{g=Vg(k);Wg(g,e,b.minFrac,b.maxFrac);h=g.d;k=g.i;e=g.e;f=[];for(g=h.reduce(function(a,b){return a&&!b},!0);0>k;)h.unshift(0),k++;0<k?f=h.splice(k,h.length):(f=h,h=[0]);k=[];for(h.length>=b.lgSize&&k.unshift(h.splice(-b.lgSize,h.length).join(""));h.length>b.gSize;)k.unshift(h.splice(-b.gSize,h.length).join(""));h.length&&k.unshift(h.join(""));h=k.join(d);f.length&&(h+=c+f.join(""));e&&(h+="e+"+e)}return 0>a&&!g?b.negPre+h+b.negSuf:b.posPre+
h+b.posSuf}function Pb(a,b,d,c){var e="";if(0>a||c&&0>=a)c?a=-a+1:(a=-a,e="-");for(a=""+a;a.length<b;)a=Fc+a;d&&(a=a.substr(a.length-b));return e+a}function X(a,b,d,c,e){d=d||0;return function(f){f=f["get"+a]();if(0<d||f>-d)f+=d;0===f&&-12===d&&(f=12);return Pb(f,b,c,e)}}function mb(a,b,d){return function(c,e){var f=c["get"+a](),g=wb((d?"STANDALONE":"")+(b?"SHORT":"")+a);return e[g][f]}}function Yd(a){var b=(new Date(a,0,1)).getDay();return new Date(a,0,(4>=b?5:12)-b)}function Zd(a){return function(b){var d=
Yd(b.getFullYear());b=+new Date(b.getFullYear(),b.getMonth(),b.getDate()+(4-b.getDay()))-+d;b=1+Math.round(b/6048E5);return Pb(b,a)}}function Gc(a,b){return 0>=a.getFullYear()?b.ERAS[0]:b.ERAS[1]}function Sd(a){function b(a){var b;if(b=a.match(d)){a=new Date(0);var f=0,g=0,k=b[8]?a.setUTCFullYear:a.setFullYear,h=b[8]?a.setUTCHours:a.setHours;b[9]&&(f=ea(b[9]+b[10]),g=ea(b[9]+b[11]));k.call(a,ea(b[1]),ea(b[2])-1,ea(b[3]));f=ea(b[4]||0)-f;g=ea(b[5]||0)-g;k=ea(b[6]||0);b=Math.round(1E3*parseFloat("0."+
(b[7]||0)));h.call(a,f,g,k,b)}return a}var d=/^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;return function(c,d,f){var g="",k=[],h,l;d=d||"mediumDate";d=a.DATETIME_FORMATS[d]||d;B(c)&&(c=Xg.test(c)?ea(c):b(c));aa(c)&&(c=new Date(c));if(!$(c)||!isFinite(c.getTime()))return c;for(;d;)(l=Yg.exec(d))?(k=eb(k,l,1),d=k.pop()):(k.push(d),d=null);var m=c.getTimezoneOffset();f&&(m=ec(f,m),c=fc(c,f,!0));q(k,function(b){h=Zg[b];g+=h?h(c,a.DATETIME_FORMATS,
m):"''"===b?"'":b.replace(/(^'|'$)/g,"").replace(/''/g,"'")});return g}}function Qg(){return function(a,b){v(b)&&(b=2);return fb(a,b)}}function Rg(){return function(a,b,d){b=Infinity===Math.abs(Number(b))?Number(b):ea(b);if(ha(b))return a;aa(a)&&(a=a.toString());if(!ra(a))return a;d=!d||isNaN(d)?0:ea(d);d=0>d?Math.max(0,a.length+d):d;return 0<=b?Hc(a,d,d+b):0===d?Hc(a,b,a.length):Hc(a,Math.max(0,d+b),d)}}function Hc(a,b,d){return B(a)?a.slice(b,d):ya.call(a,b,d)}function Ud(a){function b(b){return b.map(function(b){var c=
1,d=Qa;if(z(b))d=b;else if(B(b)){if("+"===b.charAt(0)||"-"===b.charAt(0))c="-"===b.charAt(0)?-1:1,b=b.substring(1);if(""!==b&&(d=a(b),d.constant))var e=d(),d=function(a){return a[e]}}return{get:d,descending:c}})}function d(a){switch(typeof a){case "number":case "boolean":case "string":return!0;default:return!1}}function c(a,b){var c=0,d=a.type,h=b.type;if(d===h){var h=a.value,l=b.value;"string"===d?(h=h.toLowerCase(),l=l.toLowerCase()):"object"===d&&(G(h)&&(h=a.index),G(l)&&(l=b.index));h!==l&&(c=
h<l?-1:1)}else c="undefined"===d?1:"undefined"===h?-1:"null"===d?1:"null"===h?-1:d<h?-1:1;return c}return function(a,f,g,k){if(null==a)return a;if(!ra(a))throw L("orderBy")("notarray",a);F(f)||(f=[f]);0===f.length&&(f=["+"]);var h=b(f),l=g?-1:1,m=z(k)?k:c;a=Array.prototype.map.call(a,function(a,b){return{value:a,tieBreaker:{value:b,type:"number",index:b},predicateValues:h.map(function(c){var e=c.get(a);c=typeof e;if(null===e)c="null";else if("object"===c)a:{if(z(e.valueOf)&&(e=e.valueOf(),d(e)))break a;
bc(e)&&(e=e.toString(),d(e))}return{value:e,type:c,index:b}})}});a.sort(function(a,b){for(var d=0,e=h.length;d<e;d++){var f=m(a.predicateValues[d],b.predicateValues[d]);if(f)return f*h[d].descending*l}return(m(a.tieBreaker,b.tieBreaker)||c(a.tieBreaker,b.tieBreaker))*l});return a=a.map(function(a){return a.value})}}function Wa(a){z(a)&&(a={link:a});a.restrict=a.restrict||"AC";return ia(a)}function Qb(a,b,d,c,e){this.$$controls=[];this.$error={};this.$$success={};this.$pending=void 0;this.$name=e(b.name||
b.ngForm||"")(d);this.$dirty=!1;this.$valid=this.$pristine=!0;this.$submitted=this.$invalid=!1;this.$$parentForm=nb;this.$$element=a;this.$$animate=c;$d(this)}function $d(a){a.$$classCache={};a.$$classCache[ae]=!(a.$$classCache[ob]=a.$$element.hasClass(ob))}function be(a){function b(a,b,c){c&&!a.$$classCache[b]?(a.$$animate.addClass(a.$$element,b),a.$$classCache[b]=!0):!c&&a.$$classCache[b]&&(a.$$animate.removeClass(a.$$element,b),a.$$classCache[b]=!1)}function d(a,c,d){c=c?"-"+Wc(c,"-"):"";b(a,ob+
c,!0===d);b(a,ae+c,!1===d)}var c=a.set,e=a.unset;a.clazz.prototype.$setValidity=function(a,g,k){v(g)?(this.$pending||(this.$pending={}),c(this.$pending,a,k)):(this.$pending&&e(this.$pending,a,k),ce(this.$pending)&&(this.$pending=void 0));Ga(g)?g?(e(this.$error,a,k),c(this.$$success,a,k)):(c(this.$error,a,k),e(this.$$success,a,k)):(e(this.$error,a,k),e(this.$$success,a,k));this.$pending?(b(this,"ng-pending",!0),this.$valid=this.$invalid=void 0,d(this,"",null)):(b(this,"ng-pending",!1),this.$valid=
ce(this.$error),this.$invalid=!this.$valid,d(this,"",this.$valid));g=this.$pending&&this.$pending[a]?void 0:this.$error[a]?!1:this.$$success[a]?!0:null;d(this,a,g);this.$$parentForm.$setValidity(a,g,this)}}function ce(a){if(a)for(var b in a)if(a.hasOwnProperty(b))return!1;return!0}function Ic(a){a.$formatters.push(function(b){return a.$isEmpty(b)?b:b.toString()})}function Xa(a,b,d,c,e,f){var g=O(b[0].type);if(!e.android){var k=!1;b.on("compositionstart",function(){k=!0});b.on("compositionupdate",
function(a){if(v(a.data)||""===a.data)k=!1});b.on("compositionend",function(){k=!1;l()})}var h,l=function(a){h&&(f.defer.cancel(h),h=null);if(!k){var e=b.val();a=a&&a.type;"password"===g||d.ngTrim&&"false"===d.ngTrim||(e=Q(e));(c.$viewValue!==e||""===e&&c.$$hasNativeValidators)&&c.$setViewValue(e,a)}};if(e.hasEvent("input"))b.on("input",l);else{var m=function(a,b,c){h||(h=f.defer(function(){h=null;b&&b.value===c||l(a)}))};b.on("keydown",function(a){var b=a.keyCode;91===b||15<b&&19>b||37<=b&&40>=b||
m(a,this,this.value)});if(e.hasEvent("paste"))b.on("paste cut drop",m)}b.on("change",l);if(de[g]&&c.$$hasNativeValidators&&g===d.type)b.on("keydown wheel mousedown",function(a){if(!h){var b=this.validity,c=b.badInput,d=b.typeMismatch;h=f.defer(function(){h=null;b.badInput===c&&b.typeMismatch===d||l(a)})}});c.$render=function(){var a=c.$isEmpty(c.$viewValue)?"":c.$viewValue;b.val()!==a&&b.val(a)}}function Rb(a,b){return function(d,c){var e,f;if($(d))return d;if(B(d)){'"'===d.charAt(0)&&'"'===d.charAt(d.length-
1)&&(d=d.substring(1,d.length-1));if($g.test(d))return new Date(d);a.lastIndex=0;if(e=a.exec(d))return e.shift(),f=c?{yyyy:c.getFullYear(),MM:c.getMonth()+1,dd:c.getDate(),HH:c.getHours(),mm:c.getMinutes(),ss:c.getSeconds(),sss:c.getMilliseconds()/1E3}:{yyyy:1970,MM:1,dd:1,HH:0,mm:0,ss:0,sss:0},q(e,function(a,c){c<b.length&&(f[b[c]]=+a)}),e=new Date(f.yyyy,f.MM-1,f.dd,f.HH,f.mm,f.ss||0,1E3*f.sss||0),100>f.yyyy&&e.setFullYear(f.yyyy),e}return NaN}}function pb(a,b,d,c){return function(e,f,g,k,h,l,m){function p(a){return a&&
!(a.getTime&&a.getTime()!==a.getTime())}function n(a){return u(a)&&!$(a)?t(a)||void 0:a}function t(a,b){var c=k.$options.getOption("timezone");q&&q!==c&&(b=Tc(b,ec(q)));var e=d(a,b);!isNaN(e)&&c&&(e=fc(e,c));return e}Jc(e,f,g,k,a);Xa(e,f,g,k,h,l);var s,q;k.$parsers.push(function(c){if(k.$isEmpty(c))return null;if(b.test(c))return t(c,s);k.$$parserName=a});k.$formatters.push(function(a){if(a&&!$(a))throw qb("datefmt",a);if(p(a)){s=a;var b=k.$options.getOption("timezone");b&&(q=b,s=fc(s,b,!0));return m("date")(a,
c,b)}q=s=null;return""});if(u(g.min)||g.ngMin){var w;k.$validators.min=function(a){return!p(a)||v(w)||d(a)>=w};g.$observe("min",function(a){w=n(a);k.$validate()})}if(u(g.max)||g.ngMax){var r;k.$validators.max=function(a){return!p(a)||v(r)||d(a)<=r};g.$observe("max",function(a){r=n(a);k.$validate()})}}}function Jc(a,b,d,c,e){(c.$$hasNativeValidators=G(b[0].validity))&&c.$parsers.push(function(a){var d=b.prop("validity")||{};if(d.badInput||d.typeMismatch)c.$$parserName=e;else return a})}function ee(a){a.$parsers.push(function(b){if(a.$isEmpty(b))return null;
if(ah.test(b))return parseFloat(b);a.$$parserName="number"});a.$formatters.push(function(b){if(!a.$isEmpty(b)){if(!aa(b))throw qb("numfmt",b);b=b.toString()}return b})}function Ya(a){u(a)&&!aa(a)&&(a=parseFloat(a));return ha(a)?void 0:a}function Kc(a){var b=a.toString(),d=b.indexOf(".");return-1===d?-1<a&&1>a&&(a=/e-(\d+)$/.exec(b))?Number(a[1]):0:b.length-d-1}function fe(a,b,d){a=Number(a);var c=(a|0)!==a,e=(b|0)!==b,f=(d|0)!==d;if(c||e||f){var g=c?Kc(a):0,k=e?Kc(b):0,h=f?Kc(d):0,g=Math.max(g,k,
h),g=Math.pow(10,g);a*=g;b*=g;d*=g;c&&(a=Math.round(a));e&&(b=Math.round(b));f&&(d=Math.round(d))}return 0===(a-b)%d}function ge(a,b,d,c,e){if(u(c)){a=a(c);if(!a.constant)throw qb("constexpr",d,c);return a(b)}return e}function Lc(a,b){function d(a,b){if(!a||!a.length)return[];if(!b||!b.length)return a;var c=[],d=0;a:for(;d<a.length;d++){for(var e=a[d],m=0;m<b.length;m++)if(e===b[m])continue a;c.push(e)}return c}function c(a){var b=a;F(a)?b=a.map(c).join(" "):G(a)&&(b=Object.keys(a).filter(function(b){return a[b]}).join(" "));
return b}a="ngClass"+a;var e;return["$parse",function(f){return{restrict:"AC",link:function(g,k,h){function l(a,b){var c=[];q(a,function(a){if(0<b||p[a])p[a]=(p[a]||0)+b,p[a]===+(0<b)&&c.push(a)});return c.join(" ")}function m(a){if(a===b){var c=t,c=l(c&&c.split(" "),1);h.$addClass(c)}else c=t,c=l(c&&c.split(" "),-1),h.$removeClass(c);n=a}var p=k.data("$classCounts"),n=!0,t;p||(p=U(),k.data("$classCounts",p));"ngClass"!==a&&(e||(e=f("$index",function(a){return a&1})),g.$watch(e,m));g.$watch(f(h[a],
c),function(a){if(n===b){var c=t&&t.split(" "),e=a&&a.split(" "),f=d(c,e),c=d(e,c),f=l(f,-1),c=l(c,1);h.$addClass(c);h.$removeClass(f)}t=a})}}}]}function Sb(a,b,d,c,e,f,g,k,h){this.$modelValue=this.$viewValue=Number.NaN;this.$$rawModelValue=void 0;this.$validators={};this.$asyncValidators={};this.$parsers=[];this.$formatters=[];this.$viewChangeListeners=[];this.$untouched=!0;this.$touched=!1;this.$pristine=!0;this.$dirty=!1;this.$valid=!0;this.$invalid=!1;this.$error={};this.$$success={};this.$pending=
void 0;this.$name=h(d.name||"",!1)(a);this.$$parentForm=nb;this.$options=Tb;this.$$updateEvents="";this.$$updateEventHandler=this.$$updateEventHandler.bind(this);this.$$parsedNgModel=e(d.ngModel);this.$$parsedNgModelAssign=this.$$parsedNgModel.assign;this.$$ngModelGet=this.$$parsedNgModel;this.$$ngModelSet=this.$$parsedNgModelAssign;this.$$pendingDebounce=null;this.$$parserValid=void 0;this.$$parserName="parse";this.$$currentValidationRunId=0;this.$$scope=a;this.$$rootScope=a.$root;this.$$attr=d;
this.$$element=c;this.$$animate=f;this.$$timeout=g;this.$$parse=e;this.$$q=k;this.$$exceptionHandler=b;$d(this);bh(this)}function bh(a){a.$$scope.$watch(function(b){b=a.$$ngModelGet(b);b===a.$modelValue||a.$modelValue!==a.$modelValue&&b!==b||a.$$setModelValue(b);return b})}function Mc(a){this.$$options=a}function he(a,b){q(b,function(b,c){u(a[c])||(a[c]=b)})}function Fa(a,b){a.prop("selected",b);a.attr("selected",b)}var Wb={objectMaxDepth:5,urlErrorParamsEnabled:!0},ch=/^\/(.+)\/([a-z]*)$/,sa=Object.prototype.hasOwnProperty,
O=function(a){return B(a)?a.toLowerCase():a},wb=function(a){return B(a)?a.toUpperCase():a},Ca,y,tb,ya=[].slice,zg=[].splice,dh=[].push,ga=Object.prototype.toString,Qc=Object.getPrototypeOf,Ha=L("ng"),fa=D.angular||(D.angular={}),jc,rb=0;Ca=D.document.documentMode;var ha=Number.isNaN||function(a){return a!==a};x.$inject=[];Qa.$inject=[];var ue=/^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array]$/,Q=function(a){return B(a)?a.trim():a},Nd=function(a){return a.replace(/([-()[\]{}+?*.$^|,:#<!\\])/g,
"\\$1").replace(/\x08/g,"\\x08")},Ba=function(){if(!u(Ba.rules)){var a=D.document.querySelector("[ng-csp]")||D.document.querySelector("[data-ng-csp]");if(a){var b=a.getAttribute("ng-csp")||a.getAttribute("data-ng-csp");Ba.rules={noUnsafeEval:!b||-1!==b.indexOf("no-unsafe-eval"),noInlineStyle:!b||-1!==b.indexOf("no-inline-style")}}else{a=Ba;try{new Function(""),b=!1}catch(d){b=!0}a.rules={noUnsafeEval:b,noInlineStyle:!1}}}return Ba.rules},sb=function(){if(u(sb.name_))return sb.name_;var a,b,d=Ia.length,
c,e;for(b=0;b<d;++b)if(c=Ia[b],a=D.document.querySelector("["+c.replace(":","\\:")+"jq]")){e=a.getAttribute(c+"jq");break}return sb.name_=e},we=/:/g,Ia=["ng-","data-ng-","ng:","x-ng-"],ze=function(a){var b=a.currentScript;if(!b)return!0;if(!(b instanceof D.HTMLScriptElement||b instanceof D.SVGScriptElement))return!1;b=b.attributes;return[b.getNamedItem("src"),b.getNamedItem("href"),b.getNamedItem("xlink:href")].every(function(b){if(!b)return!0;if(!b.value)return!1;var c=a.createElement("a");c.href=
b.value;if(a.location.origin===c.origin)return!0;switch(c.protocol){case "http:":case "https:":case "ftp:":case "blob:":case "file:":case "data:":return!0;default:return!1}})}(D.document),Ce=/[A-Z]/g,Xc=!1,Ma=3,Ie={full:"1.7.2",major:1,minor:7,dot:2,codeName:"extreme-compatiplication"};W.expando="ng339";var Oa=W.cache={},kg=1;W._data=function(a){return this.cache[a[this.expando]]||{}};var gg=/-([a-z])/g,eh=/^-ms-/,Cb={mouseleave:"mouseout",mouseenter:"mouseover"},mc=L("jqLite"),jg=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,
lc=/<|&#?\w+;/,hg=/<([\w:-]+)/,ig=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,na={option:[1,'<select multiple="multiple">',"</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};na.optgroup=na.option;na.tbody=na.tfoot=na.colgroup=na.caption=na.thead;na.th=na.td;var pg=D.Node.prototype.contains||function(a){return!!(this.compareDocumentPosition(a)&
16)},Sa=W.prototype={ready:gd,toString:function(){var a=[];q(this,function(b){a.push(""+b)});return"["+a.join(", ")+"]"},eq:function(a){return 0<=a?y(this[a]):y(this[this.length+a])},length:0,push:dh,sort:[].sort,splice:[].splice},Ib={};q("multiple selected checked disabled readOnly required open".split(" "),function(a){Ib[O(a)]=a});var nd={};q("input select option textarea button form details".split(" "),function(a){nd[a]=!0});var ud={ngMinlength:"minlength",ngMaxlength:"maxlength",ngMin:"min",ngMax:"max",
ngPattern:"pattern",ngStep:"step"};q({data:qc,removeData:pc,hasData:function(a){for(var b in Oa[a.ng339])return!0;return!1},cleanData:function(a){for(var b=0,d=a.length;b<d;b++)pc(a[b]),jd(a[b])}},function(a,b){W[b]=a});q({data:qc,inheritedData:Gb,scope:function(a){return y.data(a,"$scope")||Gb(a.parentNode||a,["$isolateScope","$scope"])},isolateScope:function(a){return y.data(a,"$isolateScope")||y.data(a,"$isolateScopeNoTemplate")},controller:kd,injector:function(a){return Gb(a,"$injector")},removeAttr:function(a,
b){a.removeAttribute(b)},hasClass:Db,css:function(a,b,d){b=zb(b.replace(eh,"ms-"));if(u(d))a.style[b]=d;else return a.style[b]},attr:function(a,b,d){var c=a.nodeType;if(c!==Ma&&2!==c&&8!==c&&a.getAttribute){var c=O(b),e=Ib[c];if(u(d))null===d||!1===d&&e?a.removeAttribute(b):a.setAttribute(b,e?c:d);else return a=a.getAttribute(b),e&&null!==a&&(a=c),null===a?void 0:a}},prop:function(a,b,d){if(u(d))a[b]=d;else return a[b]},text:function(){function a(a,d){if(v(d)){var c=a.nodeType;return 1===c||c===Ma?
a.textContent:""}a.textContent=d}a.$dv="";return a}(),val:function(a,b){if(v(b)){if(a.multiple&&"select"===ta(a)){var d=[];q(a.options,function(a){a.selected&&d.push(a.value||a.text)});return d}return a.value}a.value=b},html:function(a,b){if(v(b))return a.innerHTML;Ab(a,!0);a.innerHTML=b},empty:ld},function(a,b){W.prototype[b]=function(b,c){var e,f,g=this.length;if(a!==ld&&v(2===a.length&&a!==Db&&a!==kd?b:c)){if(G(b)){for(e=0;e<g;e++)if(a===qc)a(this[e],b);else for(f in b)a(this[e],f,b[f]);return this}e=
a.$dv;g=v(e)?Math.min(g,1):g;for(f=0;f<g;f++){var k=a(this[f],b,c);e=e?e+k:k}return e}for(e=0;e<g;e++)a(this[e],b,c);return this}});q({removeData:pc,on:function(a,b,d,c){if(u(c))throw mc("onargs");if(kc(a)){c=Bb(a,!0);var e=c.events,f=c.handle;f||(f=c.handle=mg(a,e));c=0<=b.indexOf(" ")?b.split(" "):[b];for(var g=c.length,k=function(b,c,g){var k=e[b];k||(k=e[b]=[],k.specialHandlerWrapper=c,"$destroy"===b||g||a.addEventListener(b,f));k.push(d)};g--;)b=c[g],Cb[b]?(k(Cb[b],og),k(b,void 0,!0)):k(b)}},
off:jd,one:function(a,b,d){a=y(a);a.on(b,function e(){a.off(b,d);a.off(b,e)});a.on(b,d)},replaceWith:function(a,b){var d,c=a.parentNode;Ab(a);q(new W(b),function(b){d?c.insertBefore(b,d.nextSibling):c.replaceChild(b,a);d=b})},children:function(a){var b=[];q(a.childNodes,function(a){1===a.nodeType&&b.push(a)});return b},contents:function(a){return a.contentDocument||a.childNodes||[]},append:function(a,b){var d=a.nodeType;if(1===d||11===d){b=new W(b);for(var d=0,c=b.length;d<c;d++)a.appendChild(b[d])}},
prepend:function(a,b){if(1===a.nodeType){var d=a.firstChild;q(new W(b),function(b){a.insertBefore(b,d)})}},wrap:function(a,b){var d=y(b).eq(0).clone()[0],c=a.parentNode;c&&c.replaceChild(d,a);d.appendChild(a)},remove:Hb,detach:function(a){Hb(a,!0)},after:function(a,b){var d=a,c=a.parentNode;if(c){b=new W(b);for(var e=0,f=b.length;e<f;e++){var g=b[e];c.insertBefore(g,d.nextSibling);d=g}}},addClass:Fb,removeClass:Eb,toggleClass:function(a,b,d){b&&q(b.split(" "),function(b){var e=d;v(e)&&(e=!Db(a,b));
(e?Fb:Eb)(a,b)})},parent:function(a){return(a=a.parentNode)&&11!==a.nodeType?a:null},next:function(a){return a.nextElementSibling},find:function(a,b){return a.getElementsByTagName?a.getElementsByTagName(b):[]},clone:oc,triggerHandler:function(a,b,d){var c,e,f=b.type||b,g=Bb(a);if(g=(g=g&&g.events)&&g[f])c={preventDefault:function(){this.defaultPrevented=!0},isDefaultPrevented:function(){return!0===this.defaultPrevented},stopImmediatePropagation:function(){this.immediatePropagationStopped=!0},isImmediatePropagationStopped:function(){return!0===
this.immediatePropagationStopped},stopPropagation:x,type:f,target:a},b.type&&(c=P(c,b)),b=ja(g),e=d?[c].concat(d):[c],q(b,function(b){c.isImmediatePropagationStopped()||b.apply(a,e)})}},function(a,b){W.prototype[b]=function(b,c,e){for(var f,g=0,k=this.length;g<k;g++)v(f)?(f=a(this[g],b,c,e),u(f)&&(f=y(f))):nc(f,a(this[g],b,c,e));return u(f)?f:this}});W.prototype.bind=W.prototype.on;W.prototype.unbind=W.prototype.off;var fh=Object.create(null);od.prototype={_idx:function(a){if(a===this._lastKey)return this._lastIndex;
this._lastKey=a;return this._lastIndex=this._keys.indexOf(a)},_transformKey:function(a){return ha(a)?fh:a},get:function(a){a=this._transformKey(a);a=this._idx(a);if(-1!==a)return this._values[a]},set:function(a,b){a=this._transformKey(a);var d=this._idx(a);-1===d&&(d=this._lastIndex=this._keys.length);this._keys[d]=a;this._values[d]=b},delete:function(a){a=this._transformKey(a);a=this._idx(a);if(-1===a)return!1;this._keys.splice(a,1);this._values.splice(a,1);this._lastKey=NaN;this._lastIndex=-1;return!0}};
var Jb=od,eg=[function(){this.$get=[function(){return Jb}]}],rg=/^([^(]+?)=>/,sg=/^[^(]*\(\s*([^)]*)\)/m,gh=/,/,hh=/^\s*(_?)(\S+?)\1\s*$/,qg=/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg,Ja=L("$injector");hb.$$annotate=function(a,b,d){var c;if("function"===typeof a){if(!(c=a.$inject)){c=[];if(a.length){if(b)throw B(d)&&d||(d=a.name||tg(a)),Ja("strictdi",d);b=pd(a);q(b[1].split(gh),function(a){a.replace(hh,function(a,b,d){c.push(d)})})}a.$inject=c}}else F(a)?(b=a.length-1,ub(a[b],"fn"),c=a.slice(0,b)):ub(a,"fn",
!0);return c};var ie=L("$animate"),wf=function(){this.$get=x},xf=function(){var a=new Jb,b=[];this.$get=["$$AnimateRunner","$rootScope",function(d,c){function e(a,b,c){var d=!1;b&&(b=B(b)?b.split(" "):F(b)?b:[],q(b,function(b){b&&(d=!0,a[b]=c)}));return d}function f(){q(b,function(b){var c=a.get(b);if(c){var d=ug(b.attr("class")),e="",f="";q(c,function(a,b){a!==!!d[b]&&(a?e+=(e.length?" ":"")+b:f+=(f.length?" ":"")+b)});q(b,function(a){e&&Fb(a,e);f&&Eb(a,f)});a.delete(b)}});b.length=0}return{enabled:x,
on:x,off:x,pin:x,push:function(g,k,h,l){l&&l();h=h||{};h.from&&g.css(h.from);h.to&&g.css(h.to);if(h.addClass||h.removeClass)if(k=h.addClass,l=h.removeClass,h=a.get(g)||{},k=e(h,k,!0),l=e(h,l,!1),k||l)a.set(g,h),b.push(g),1===b.length&&c.$$postDigest(f);g=new d;g.complete();return g}}}]},uf=["$provide",function(a){var b=this,d=null,c=null;this.$$registeredAnimations=Object.create(null);this.register=function(c,d){if(c&&"."!==c.charAt(0))throw ie("notcsel",c);var g=c+"-animation";b.$$registeredAnimations[c.substr(1)]=
g;a.factory(g,d)};this.customFilter=function(a){1===arguments.length&&(c=z(a)?a:null);return c};this.classNameFilter=function(a){if(1===arguments.length&&(d=a instanceof RegExp?a:null)&&/[(\s|\/)]ng-animate[(\s|\/)]/.test(d.toString()))throw d=null,ie("nongcls","ng-animate");return d};this.$get=["$$animateQueue",function(a){function b(a,c,d){if(d){var e;a:{for(e=0;e<d.length;e++){var f=d[e];if(1===f.nodeType){e=f;break a}}e=void 0}!e||e.parentNode||e.previousElementSibling||(d=null)}d?d.after(a):
c.prepend(a)}return{on:a.on,off:a.off,pin:a.pin,enabled:a.enabled,cancel:function(a){a.cancel&&a.cancel()},enter:function(c,d,h,l){d=d&&y(d);h=h&&y(h);d=d||h.parent();b(c,d,h);return a.push(c,"enter",Ka(l))},move:function(c,d,h,l){d=d&&y(d);h=h&&y(h);d=d||h.parent();b(c,d,h);return a.push(c,"move",Ka(l))},leave:function(b,c){return a.push(b,"leave",Ka(c),function(){b.remove()})},addClass:function(b,c,d){d=Ka(d);d.addClass=jb(d.addclass,c);return a.push(b,"addClass",d)},removeClass:function(b,c,d){d=
Ka(d);d.removeClass=jb(d.removeClass,c);return a.push(b,"removeClass",d)},setClass:function(b,c,d,f){f=Ka(f);f.addClass=jb(f.addClass,c);f.removeClass=jb(f.removeClass,d);return a.push(b,"setClass",f)},animate:function(b,c,d,f,m){m=Ka(m);m.from=m.from?P(m.from,c):c;m.to=m.to?P(m.to,d):d;m.tempClasses=jb(m.tempClasses,f||"ng-inline-animate");return a.push(b,"animate",m)}}}]}],zf=function(){this.$get=["$$rAF",function(a){function b(b){d.push(b);1<d.length||a(function(){for(var a=0;a<d.length;a++)d[a]();
d=[]})}var d=[];return function(){var a=!1;b(function(){a=!0});return function(d){a?d():b(d)}}}]},yf=function(){this.$get=["$q","$sniffer","$$animateAsyncRun","$$isDocumentHidden","$timeout",function(a,b,d,c,e){function f(a){this.setHost(a);var b=d();this._doneCallbacks=[];this._tick=function(a){c()?e(a,0,!1):b(a)};this._state=0}f.chain=function(a,b){function c(){if(d===a.length)b(!0);else a[d](function(a){!1===a?b(!1):(d++,c())})}var d=0;c()};f.all=function(a,b){function c(f){e=e&&f;++d===a.length&&
b(e)}var d=0,e=!0;q(a,function(a){a.done(c)})};f.prototype={setHost:function(a){this.host=a||{}},done:function(a){2===this._state?a():this._doneCallbacks.push(a)},progress:x,getPromise:function(){if(!this.promise){var b=this;this.promise=a(function(a,c){b.done(function(b){!1===b?c():a()})})}return this.promise},then:function(a,b){return this.getPromise().then(a,b)},"catch":function(a){return this.getPromise()["catch"](a)},"finally":function(a){return this.getPromise()["finally"](a)},pause:function(){this.host.pause&&
this.host.pause()},resume:function(){this.host.resume&&this.host.resume()},end:function(){this.host.end&&this.host.end();this._resolve(!0)},cancel:function(){this.host.cancel&&this.host.cancel();this._resolve(!1)},complete:function(a){var b=this;0===b._state&&(b._state=1,b._tick(function(){b._resolve(a)}))},_resolve:function(a){2!==this._state&&(q(this._doneCallbacks,function(b){b(a)}),this._doneCallbacks.length=0,this._state=2)}};return f}]},vf=function(){this.$get=["$$rAF","$q","$$AnimateRunner",
function(a,b,d){return function(b,e){function f(){a(function(){g.addClass&&(b.addClass(g.addClass),g.addClass=null);g.removeClass&&(b.removeClass(g.removeClass),g.removeClass=null);g.to&&(b.css(g.to),g.to=null);k||h.complete();k=!0});return h}var g=e||{};g.$$prepared||(g=za(g));g.cleanupStyles&&(g.from=g.to=null);g.from&&(b.css(g.from),g.from=null);var k,h=new d;return{start:f,end:f}}}]},ba=L("$compile"),tc=new function(){};Yc.$inject=["$provide","$$sanitizeUriProvider"];Kb.prototype.isFirstChange=
function(){return this.previousValue===tc};var qd=/^((?:x|data)[:\-_])/i,yg=/[:\-_]+(.)/g,wd=L("$controller"),vd=/^(\S+)(\s+as\s+([\w$]+))?$/,Gf=function(){this.$get=["$document",function(a){return function(b){b?!b.nodeType&&b instanceof y&&(b=b[0]):b=a[0].body;return b.offsetWidth+1}}]},xd="application/json",wc={"Content-Type":xd+";charset=utf-8"},Bg=/^\[|^\{(?!\{)/,Cg={"[":/]$/,"{":/}$/},Ag=/^\)]\}',?\n/,Lb=L("$http"),ca=fa.$interpolateMinErr=L("$interpolate");ca.throwNoconcat=function(a){throw ca("noconcat",
a);};ca.interr=function(a,b){return ca("interr",a,b.toString())};var Fg=L("$interval"),Of=function(){this.$get=function(){function a(a){var b=function(a){b.data=a;b.called=!0};b.id=a;return b}var b=fa.callbacks,d={};return{createCallback:function(c){c="_"+(b.$$counter++).toString(36);var e="angular.callbacks."+c,f=a(c);d[e]=b[c]=f;return e},wasCalled:function(a){return d[a].called},getResponse:function(a){return d[a].data},removeCallback:function(a){delete b[d[a].id];delete d[a]}}}},ih=/^([^?#]*)(\?([^#]*))?(#(.*))?$/,
Gg={http:80,https:443,ftp:21},kb=L("$location"),Hg=/^\s*[\\/]{2,}/,jh={$$absUrl:"",$$html5:!1,$$replace:!1,absUrl:Mb("$$absUrl"),url:function(a){if(v(a))return this.$$url;var b=ih.exec(a);(b[1]||""===a)&&this.path(decodeURIComponent(b[1]));(b[2]||b[1]||""===a)&&this.search(b[3]||"");this.hash(b[5]||"");return this},protocol:Mb("$$protocol"),host:Mb("$$host"),port:Mb("$$port"),path:Ed("$$path",function(a){a=null!==a?a.toString():"";return"/"===a.charAt(0)?a:"/"+a}),search:function(a,b){switch(arguments.length){case 0:return this.$$search;
case 1:if(B(a)||aa(a))a=a.toString(),this.$$search=gc(a);else if(G(a))a=za(a,{}),q(a,function(b,c){null==b&&delete a[c]}),this.$$search=a;else throw kb("isrcharg");break;default:v(b)||null===b?delete this.$$search[a]:this.$$search[a]=b}this.$$compose();return this},hash:Ed("$$hash",function(a){return null!==a?a.toString():""}),replace:function(){this.$$replace=!0;return this}};q([Dd,Ac,zc],function(a){a.prototype=Object.create(jh);a.prototype.state=function(b){if(!arguments.length)return this.$$state;
if(a!==zc||!this.$$html5)throw kb("nostate");this.$$state=v(b)?null:b;this.$$urlUpdatedByLocation=!0;return this}});var Za=L("$parse"),Lg={}.constructor.prototype.valueOf,Ub=U();q("+ - * / % === !== == != < > <= >= && || ! = |".split(" "),function(a){Ub[a]=!0});var kh={n:"\n",f:"\f",r:"\r",t:"\t",v:"\v","'":"'",'"':'"'},Ob=function(a){this.options=a};Ob.prototype={constructor:Ob,lex:function(a){this.text=a;this.index=0;for(this.tokens=[];this.index<this.text.length;)if(a=this.text.charAt(this.index),
'"'===a||"'"===a)this.readString(a);else if(this.isNumber(a)||"."===a&&this.isNumber(this.peek()))this.readNumber();else if(this.isIdentifierStart(this.peekMultichar()))this.readIdent();else if(this.is(a,"(){}[].,;:?"))this.tokens.push({index:this.index,text:a}),this.index++;else if(this.isWhitespace(a))this.index++;else{var b=a+this.peek(),d=b+this.peek(2),c=Ub[b],e=Ub[d];Ub[a]||c||e?(a=e?d:c?b:a,this.tokens.push({index:this.index,text:a,operator:!0}),this.index+=a.length):this.throwError("Unexpected next character ",
this.index,this.index+1)}return this.tokens},is:function(a,b){return-1!==b.indexOf(a)},peek:function(a){a=a||1;return this.index+a<this.text.length?this.text.charAt(this.index+a):!1},isNumber:function(a){return"0"<=a&&"9">=a&&"string"===typeof a},isWhitespace:function(a){return" "===a||"\r"===a||"\t"===a||"\n"===a||"\v"===a||"\u00a0"===a},isIdentifierStart:function(a){return this.options.isIdentifierStart?this.options.isIdentifierStart(a,this.codePointAt(a)):this.isValidIdentifierStart(a)},isValidIdentifierStart:function(a){return"a"<=
a&&"z">=a||"A"<=a&&"Z">=a||"_"===a||"$"===a},isIdentifierContinue:function(a){return this.options.isIdentifierContinue?this.options.isIdentifierContinue(a,this.codePointAt(a)):this.isValidIdentifierContinue(a)},isValidIdentifierContinue:function(a,b){return this.isValidIdentifierStart(a,b)||this.isNumber(a)},codePointAt:function(a){return 1===a.length?a.charCodeAt(0):(a.charCodeAt(0)<<10)+a.charCodeAt(1)-56613888},peekMultichar:function(){var a=this.text.charAt(this.index),b=this.peek();if(!b)return a;
var d=a.charCodeAt(0),c=b.charCodeAt(0);return 55296<=d&&56319>=d&&56320<=c&&57343>=c?a+b:a},isExpOperator:function(a){return"-"===a||"+"===a||this.isNumber(a)},throwError:function(a,b,d){d=d||this.index;b=u(b)?"s "+b+"-"+this.index+" ["+this.text.substring(b,d)+"]":" "+d;throw Za("lexerr",a,b,this.text);},readNumber:function(){for(var a="",b=this.index;this.index<this.text.length;){var d=O(this.text.charAt(this.index));if("."===d||this.isNumber(d))a+=d;else{var c=this.peek();if("e"===d&&this.isExpOperator(c))a+=
d;else if(this.isExpOperator(d)&&c&&this.isNumber(c)&&"e"===a.charAt(a.length-1))a+=d;else if(!this.isExpOperator(d)||c&&this.isNumber(c)||"e"!==a.charAt(a.length-1))break;else this.throwError("Invalid exponent")}this.index++}this.tokens.push({index:b,text:a,constant:!0,value:Number(a)})},readIdent:function(){var a=this.index;for(this.index+=this.peekMultichar().length;this.index<this.text.length;){var b=this.peekMultichar();if(!this.isIdentifierContinue(b))break;this.index+=b.length}this.tokens.push({index:a,
text:this.text.slice(a,this.index),identifier:!0})},readString:function(a){var b=this.index;this.index++;for(var d="",c=a,e=!1;this.index<this.text.length;){var f=this.text.charAt(this.index),c=c+f;if(e)"u"===f?(e=this.text.substring(this.index+1,this.index+5),e.match(/[\da-f]{4}/i)||this.throwError("Invalid unicode escape [\\u"+e+"]"),this.index+=4,d+=String.fromCharCode(parseInt(e,16))):d+=kh[f]||f,e=!1;else if("\\"===f)e=!0;else{if(f===a){this.index++;this.tokens.push({index:b,text:c,constant:!0,
value:d});return}d+=f}this.index++}this.throwError("Unterminated quote",b)}};var r=function(a,b){this.lexer=a;this.options=b};r.Program="Program";r.ExpressionStatement="ExpressionStatement";r.AssignmentExpression="AssignmentExpression";r.ConditionalExpression="ConditionalExpression";r.LogicalExpression="LogicalExpression";r.BinaryExpression="BinaryExpression";r.UnaryExpression="UnaryExpression";r.CallExpression="CallExpression";r.MemberExpression="MemberExpression";r.Identifier="Identifier";r.Literal=
"Literal";r.ArrayExpression="ArrayExpression";r.Property="Property";r.ObjectExpression="ObjectExpression";r.ThisExpression="ThisExpression";r.LocalsExpression="LocalsExpression";r.NGValueParameter="NGValueParameter";r.prototype={ast:function(a){this.text=a;this.tokens=this.lexer.lex(a);a=this.program();0!==this.tokens.length&&this.throwError("is an unexpected token",this.tokens[0]);return a},program:function(){for(var a=[];;)if(0<this.tokens.length&&!this.peek("}",")",";","]")&&a.push(this.expressionStatement()),
!this.expect(";"))return{type:r.Program,body:a}},expressionStatement:function(){return{type:r.ExpressionStatement,expression:this.filterChain()}},filterChain:function(){for(var a=this.expression();this.expect("|");)a=this.filter(a);return a},expression:function(){return this.assignment()},assignment:function(){var a=this.ternary();if(this.expect("=")){if(!Id(a))throw Za("lval");a={type:r.AssignmentExpression,left:a,right:this.assignment(),operator:"="}}return a},ternary:function(){var a=this.logicalOR(),
b,d;return this.expect("?")&&(b=this.expression(),this.consume(":"))?(d=this.expression(),{type:r.ConditionalExpression,test:a,alternate:b,consequent:d}):a},logicalOR:function(){for(var a=this.logicalAND();this.expect("||");)a={type:r.LogicalExpression,operator:"||",left:a,right:this.logicalAND()};return a},logicalAND:function(){for(var a=this.equality();this.expect("&&");)a={type:r.LogicalExpression,operator:"&&",left:a,right:this.equality()};return a},equality:function(){for(var a=this.relational(),
b;b=this.expect("==","!=","===","!==");)a={type:r.BinaryExpression,operator:b.text,left:a,right:this.relational()};return a},relational:function(){for(var a=this.additive(),b;b=this.expect("<",">","<=",">=");)a={type:r.BinaryExpression,operator:b.text,left:a,right:this.additive()};return a},additive:function(){for(var a=this.multiplicative(),b;b=this.expect("+","-");)a={type:r.BinaryExpression,operator:b.text,left:a,right:this.multiplicative()};return a},multiplicative:function(){for(var a=this.unary(),
b;b=this.expect("*","/","%");)a={type:r.BinaryExpression,operator:b.text,left:a,right:this.unary()};return a},unary:function(){var a;return(a=this.expect("+","-","!"))?{type:r.UnaryExpression,operator:a.text,prefix:!0,argument:this.unary()}:this.primary()},primary:function(){var a;this.expect("(")?(a=this.filterChain(),this.consume(")")):this.expect("[")?a=this.arrayDeclaration():this.expect("{")?a=this.object():this.selfReferential.hasOwnProperty(this.peek().text)?a=za(this.selfReferential[this.consume().text]):
this.options.literals.hasOwnProperty(this.peek().text)?a={type:r.Literal,value:this.options.literals[this.consume().text]}:this.peek().identifier?a=this.identifier():this.peek().constant?a=this.constant():this.throwError("not a primary expression",this.peek());for(var b;b=this.expect("(","[",".");)"("===b.text?(a={type:r.CallExpression,callee:a,arguments:this.parseArguments()},this.consume(")")):"["===b.text?(a={type:r.MemberExpression,object:a,property:this.expression(),computed:!0},this.consume("]")):
"."===b.text?a={type:r.MemberExpression,object:a,property:this.identifier(),computed:!1}:this.throwError("IMPOSSIBLE");return a},filter:function(a){a=[a];for(var b={type:r.CallExpression,callee:this.identifier(),arguments:a,filter:!0};this.expect(":");)a.push(this.expression());return b},parseArguments:function(){var a=[];if(")"!==this.peekToken().text){do a.push(this.filterChain());while(this.expect(","))}return a},identifier:function(){var a=this.consume();a.identifier||this.throwError("is not a valid identifier",
a);return{type:r.Identifier,name:a.text}},constant:function(){return{type:r.Literal,value:this.consume().value}},arrayDeclaration:function(){var a=[];if("]"!==this.peekToken().text){do{if(this.peek("]"))break;a.push(this.expression())}while(this.expect(","))}this.consume("]");return{type:r.ArrayExpression,elements:a}},object:function(){var a=[],b;if("}"!==this.peekToken().text){do{if(this.peek("}"))break;b={type:r.Property,kind:"init"};this.peek().constant?(b.key=this.constant(),b.computed=!1,this.consume(":"),
b.value=this.expression()):this.peek().identifier?(b.key=this.identifier(),b.computed=!1,this.peek(":")?(this.consume(":"),b.value=this.expression()):b.value=b.key):this.peek("[")?(this.consume("["),b.key=this.expression(),this.consume("]"),b.computed=!0,this.consume(":"),b.value=this.expression()):this.throwError("invalid key",this.peek());a.push(b)}while(this.expect(","))}this.consume("}");return{type:r.ObjectExpression,properties:a}},throwError:function(a,b){throw Za("syntax",b.text,a,b.index+
1,this.text,this.text.substring(b.index));},consume:function(a){if(0===this.tokens.length)throw Za("ueoe",this.text);var b=this.expect(a);b||this.throwError("is unexpected, expecting ["+a+"]",this.peek());return b},peekToken:function(){if(0===this.tokens.length)throw Za("ueoe",this.text);return this.tokens[0]},peek:function(a,b,d,c){return this.peekAhead(0,a,b,d,c)},peekAhead:function(a,b,d,c,e){if(this.tokens.length>a){a=this.tokens[a];var f=a.text;if(f===b||f===d||f===c||f===e||!(b||d||c||e))return a}return!1},
expect:function(a,b,d,c){return(a=this.peek(a,b,d,c))?(this.tokens.shift(),a):!1},selfReferential:{"this":{type:r.ThisExpression},$locals:{type:r.LocalsExpression}}};var Gd=2;Kd.prototype={compile:function(a){var b=this;this.state={nextId:0,filters:{},fn:{vars:[],body:[],own:{}},assign:{vars:[],body:[],own:{}},inputs:[]};S(a,b.$filter);var d="",c;this.stage="assign";if(c=Jd(a))this.state.computing="assign",d=this.nextId(),this.recurse(c,d),this.return_(d),d="fn.assign="+this.generateFunction("assign",
"s,v,l");c=Hd(a.body);b.stage="inputs";q(c,function(a,c){var d="fn"+c;b.state[d]={vars:[],body:[],own:{}};b.state.computing=d;var k=b.nextId();b.recurse(a,k);b.return_(k);b.state.inputs.push({name:d,isPure:a.isPure});a.watchId=c});this.state.computing="fn";this.stage="main";this.recurse(a);a='"'+this.USE+" "+this.STRICT+'";\n'+this.filterPrefix()+"var fn="+this.generateFunction("fn","s,l,a,i")+d+this.watchFns()+"return fn;";a=(new Function("$filter","getStringValue","ifDefined","plus",a))(this.$filter,
Ig,Jg,Fd);this.state=this.stage=void 0;return a},USE:"use",STRICT:"strict",watchFns:function(){var a=[],b=this.state.inputs,d=this;q(b,function(b){a.push("var "+b.name+"="+d.generateFunction(b.name,"s"));b.isPure&&a.push(b.name,".isPure="+JSON.stringify(b.isPure)+";")});b.length&&a.push("fn.inputs=["+b.map(function(a){return a.name}).join(",")+"];");return a.join("")},generateFunction:function(a,b){return"function("+b+"){"+this.varsPrefix(a)+this.body(a)+"};"},filterPrefix:function(){var a=[],b=this;
q(this.state.filters,function(d,c){a.push(d+"=$filter("+b.escape(c)+")")});return a.length?"var "+a.join(",")+";":""},varsPrefix:function(a){return this.state[a].vars.length?"var "+this.state[a].vars.join(",")+";":""},body:function(a){return this.state[a].body.join("")},recurse:function(a,b,d,c,e,f){var g,k,h=this,l,m,p;c=c||x;if(!f&&u(a.watchId))b=b||this.nextId(),this.if_("i",this.lazyAssign(b,this.computedMember("i",a.watchId)),this.lazyRecurse(a,b,d,c,e,!0));else switch(a.type){case r.Program:q(a.body,
function(b,c){h.recurse(b.expression,void 0,void 0,function(a){k=a});c!==a.body.length-1?h.current().body.push(k,";"):h.return_(k)});break;case r.Literal:m=this.escape(a.value);this.assign(b,m);c(b||m);break;case r.UnaryExpression:this.recurse(a.argument,void 0,void 0,function(a){k=a});m=a.operator+"("+this.ifDefined(k,0)+")";this.assign(b,m);c(m);break;case r.BinaryExpression:this.recurse(a.left,void 0,void 0,function(a){g=a});this.recurse(a.right,void 0,void 0,function(a){k=a});m="+"===a.operator?
this.plus(g,k):"-"===a.operator?this.ifDefined(g,0)+a.operator+this.ifDefined(k,0):"("+g+")"+a.operator+"("+k+")";this.assign(b,m);c(m);break;case r.LogicalExpression:b=b||this.nextId();h.recurse(a.left,b);h.if_("&&"===a.operator?b:h.not(b),h.lazyRecurse(a.right,b));c(b);break;case r.ConditionalExpression:b=b||this.nextId();h.recurse(a.test,b);h.if_(b,h.lazyRecurse(a.alternate,b),h.lazyRecurse(a.consequent,b));c(b);break;case r.Identifier:b=b||this.nextId();d&&(d.context="inputs"===h.stage?"s":this.assign(this.nextId(),
this.getHasOwnProperty("l",a.name)+"?l:s"),d.computed=!1,d.name=a.name);h.if_("inputs"===h.stage||h.not(h.getHasOwnProperty("l",a.name)),function(){h.if_("inputs"===h.stage||"s",function(){e&&1!==e&&h.if_(h.isNull(h.nonComputedMember("s",a.name)),h.lazyAssign(h.nonComputedMember("s",a.name),"{}"));h.assign(b,h.nonComputedMember("s",a.name))})},b&&h.lazyAssign(b,h.nonComputedMember("l",a.name)));c(b);break;case r.MemberExpression:g=d&&(d.context=this.nextId())||this.nextId();b=b||this.nextId();h.recurse(a.object,
g,void 0,function(){h.if_(h.notNull(g),function(){a.computed?(k=h.nextId(),h.recurse(a.property,k),h.getStringValue(k),e&&1!==e&&h.if_(h.not(h.computedMember(g,k)),h.lazyAssign(h.computedMember(g,k),"{}")),m=h.computedMember(g,k),h.assign(b,m),d&&(d.computed=!0,d.name=k)):(e&&1!==e&&h.if_(h.isNull(h.nonComputedMember(g,a.property.name)),h.lazyAssign(h.nonComputedMember(g,a.property.name),"{}")),m=h.nonComputedMember(g,a.property.name),h.assign(b,m),d&&(d.computed=!1,d.name=a.property.name))},function(){h.assign(b,
"undefined")});c(b)},!!e);break;case r.CallExpression:b=b||this.nextId();a.filter?(k=h.filter(a.callee.name),l=[],q(a.arguments,function(a){var b=h.nextId();h.recurse(a,b);l.push(b)}),m=k+"("+l.join(",")+")",h.assign(b,m),c(b)):(k=h.nextId(),g={},l=[],h.recurse(a.callee,k,g,function(){h.if_(h.notNull(k),function(){q(a.arguments,function(b){h.recurse(b,a.constant?void 0:h.nextId(),void 0,function(a){l.push(a)})});m=g.name?h.member(g.context,g.name,g.computed)+"("+l.join(",")+")":k+"("+l.join(",")+
")";h.assign(b,m)},function(){h.assign(b,"undefined")});c(b)}));break;case r.AssignmentExpression:k=this.nextId();g={};this.recurse(a.left,void 0,g,function(){h.if_(h.notNull(g.context),function(){h.recurse(a.right,k);m=h.member(g.context,g.name,g.computed)+a.operator+k;h.assign(b,m);c(b||m)})},1);break;case r.ArrayExpression:l=[];q(a.elements,function(b){h.recurse(b,a.constant?void 0:h.nextId(),void 0,function(a){l.push(a)})});m="["+l.join(",")+"]";this.assign(b,m);c(b||m);break;case r.ObjectExpression:l=
[];p=!1;q(a.properties,function(a){a.computed&&(p=!0)});p?(b=b||this.nextId(),this.assign(b,"{}"),q(a.properties,function(a){a.computed?(g=h.nextId(),h.recurse(a.key,g)):g=a.key.type===r.Identifier?a.key.name:""+a.key.value;k=h.nextId();h.recurse(a.value,k);h.assign(h.member(b,g,a.computed),k)})):(q(a.properties,function(b){h.recurse(b.value,a.constant?void 0:h.nextId(),void 0,function(a){l.push(h.escape(b.key.type===r.Identifier?b.key.name:""+b.key.value)+":"+a)})}),m="{"+l.join(",")+"}",this.assign(b,
m));c(b||m);break;case r.ThisExpression:this.assign(b,"s");c(b||"s");break;case r.LocalsExpression:this.assign(b,"l");c(b||"l");break;case r.NGValueParameter:this.assign(b,"v"),c(b||"v")}},getHasOwnProperty:function(a,b){var d=a+"."+b,c=this.current().own;c.hasOwnProperty(d)||(c[d]=this.nextId(!1,a+"&&("+this.escape(b)+" in "+a+")"));return c[d]},assign:function(a,b){if(a)return this.current().body.push(a,"=",b,";"),a},filter:function(a){this.state.filters.hasOwnProperty(a)||(this.state.filters[a]=
this.nextId(!0));return this.state.filters[a]},ifDefined:function(a,b){return"ifDefined("+a+","+this.escape(b)+")"},plus:function(a,b){return"plus("+a+","+b+")"},return_:function(a){this.current().body.push("return ",a,";")},if_:function(a,b,d){if(!0===a)b();else{var c=this.current().body;c.push("if(",a,"){");b();c.push("}");d&&(c.push("else{"),d(),c.push("}"))}},not:function(a){return"!("+a+")"},isNull:function(a){return a+"==null"},notNull:function(a){return a+"!=null"},nonComputedMember:function(a,
b){var d=/[^$_a-zA-Z0-9]/g;return/^[$_a-zA-Z][$_a-zA-Z0-9]*$/.test(b)?a+"."+b:a+'["'+b.replace(d,this.stringEscapeFn)+'"]'},computedMember:function(a,b){return a+"["+b+"]"},member:function(a,b,d){return d?this.computedMember(a,b):this.nonComputedMember(a,b)},getStringValue:function(a){this.assign(a,"getStringValue("+a+")")},lazyRecurse:function(a,b,d,c,e,f){var g=this;return function(){g.recurse(a,b,d,c,e,f)}},lazyAssign:function(a,b){var d=this;return function(){d.assign(a,b)}},stringEscapeRegex:/[^ a-zA-Z0-9]/g,
stringEscapeFn:function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)},escape:function(a){if(B(a))return"'"+a.replace(this.stringEscapeRegex,this.stringEscapeFn)+"'";if(aa(a))return a.toString();if(!0===a)return"true";if(!1===a)return"false";if(null===a)return"null";if("undefined"===typeof a)return"undefined";throw Za("esc");},nextId:function(a,b){var d="v"+this.state.nextId++;a||this.current().vars.push(d+(b?"="+b:""));return d},current:function(){return this.state[this.state.computing]}};
Ld.prototype={compile:function(a){var b=this;S(a,b.$filter);var d,c;if(d=Jd(a))c=this.recurse(d);d=Hd(a.body);var e;d&&(e=[],q(d,function(a,c){var d=b.recurse(a);d.isPure=a.isPure;a.input=d;e.push(d);a.watchId=c}));var f=[];q(a.body,function(a){f.push(b.recurse(a.expression))});a=0===a.body.length?x:1===a.body.length?f[0]:function(a,b){var c;q(f,function(d){c=d(a,b)});return c};c&&(a.assign=function(a,b,d){return c(a,d,b)});e&&(a.inputs=e);return a},recurse:function(a,b,d){var c,e,f=this,g;if(a.input)return this.inputs(a.input,
a.watchId);switch(a.type){case r.Literal:return this.value(a.value,b);case r.UnaryExpression:return e=this.recurse(a.argument),this["unary"+a.operator](e,b);case r.BinaryExpression:return c=this.recurse(a.left),e=this.recurse(a.right),this["binary"+a.operator](c,e,b);case r.LogicalExpression:return c=this.recurse(a.left),e=this.recurse(a.right),this["binary"+a.operator](c,e,b);case r.ConditionalExpression:return this["ternary?:"](this.recurse(a.test),this.recurse(a.alternate),this.recurse(a.consequent),
b);case r.Identifier:return f.identifier(a.name,b,d);case r.MemberExpression:return c=this.recurse(a.object,!1,!!d),a.computed||(e=a.property.name),a.computed&&(e=this.recurse(a.property)),a.computed?this.computedMember(c,e,b,d):this.nonComputedMember(c,e,b,d);case r.CallExpression:return g=[],q(a.arguments,function(a){g.push(f.recurse(a))}),a.filter&&(e=this.$filter(a.callee.name)),a.filter||(e=this.recurse(a.callee,!0)),a.filter?function(a,c,d,f){for(var p=[],n=0;n<g.length;++n)p.push(g[n](a,c,
d,f));a=e.apply(void 0,p,f);return b?{context:void 0,name:void 0,value:a}:a}:function(a,c,d,f){var p=e(a,c,d,f),n;if(null!=p.value){n=[];for(var t=0;t<g.length;++t)n.push(g[t](a,c,d,f));n=p.value.apply(p.context,n)}return b?{value:n}:n};case r.AssignmentExpression:return c=this.recurse(a.left,!0,1),e=this.recurse(a.right),function(a,d,f,g){var p=c(a,d,f,g);a=e(a,d,f,g);p.context[p.name]=a;return b?{value:a}:a};case r.ArrayExpression:return g=[],q(a.elements,function(a){g.push(f.recurse(a))}),function(a,
c,d,e){for(var f=[],n=0;n<g.length;++n)f.push(g[n](a,c,d,e));return b?{value:f}:f};case r.ObjectExpression:return g=[],q(a.properties,function(a){a.computed?g.push({key:f.recurse(a.key),computed:!0,value:f.recurse(a.value)}):g.push({key:a.key.type===r.Identifier?a.key.name:""+a.key.value,computed:!1,value:f.recurse(a.value)})}),function(a,c,d,e){for(var f={},n=0;n<g.length;++n)g[n].computed?f[g[n].key(a,c,d,e)]=g[n].value(a,c,d,e):f[g[n].key]=g[n].value(a,c,d,e);return b?{value:f}:f};case r.ThisExpression:return function(a){return b?
{value:a}:a};case r.LocalsExpression:return function(a,c){return b?{value:c}:c};case r.NGValueParameter:return function(a,c,d){return b?{value:d}:d}}},"unary+":function(a,b){return function(d,c,e,f){d=a(d,c,e,f);d=u(d)?+d:0;return b?{value:d}:d}},"unary-":function(a,b){return function(d,c,e,f){d=a(d,c,e,f);d=u(d)?-d:-0;return b?{value:d}:d}},"unary!":function(a,b){return function(d,c,e,f){d=!a(d,c,e,f);return b?{value:d}:d}},"binary+":function(a,b,d){return function(c,e,f,g){var k=a(c,e,f,g);c=b(c,
e,f,g);k=Fd(k,c);return d?{value:k}:k}},"binary-":function(a,b,d){return function(c,e,f,g){var k=a(c,e,f,g);c=b(c,e,f,g);k=(u(k)?k:0)-(u(c)?c:0);return d?{value:k}:k}},"binary*":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)*b(c,e,f,g);return d?{value:c}:c}},"binary/":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)/b(c,e,f,g);return d?{value:c}:c}},"binary%":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)%b(c,e,f,g);return d?{value:c}:c}},"binary===":function(a,b,d){return function(c,
e,f,g){c=a(c,e,f,g)===b(c,e,f,g);return d?{value:c}:c}},"binary!==":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)!==b(c,e,f,g);return d?{value:c}:c}},"binary==":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)==b(c,e,f,g);return d?{value:c}:c}},"binary!=":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)!=b(c,e,f,g);return d?{value:c}:c}},"binary<":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)<b(c,e,f,g);return d?{value:c}:c}},"binary>":function(a,b,d){return function(c,e,
f,g){c=a(c,e,f,g)>b(c,e,f,g);return d?{value:c}:c}},"binary<=":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)<=b(c,e,f,g);return d?{value:c}:c}},"binary>=":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)>=b(c,e,f,g);return d?{value:c}:c}},"binary&&":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)&&b(c,e,f,g);return d?{value:c}:c}},"binary||":function(a,b,d){return function(c,e,f,g){c=a(c,e,f,g)||b(c,e,f,g);return d?{value:c}:c}},"ternary?:":function(a,b,d,c){return function(e,f,
g,k){e=a(e,f,g,k)?b(e,f,g,k):d(e,f,g,k);return c?{value:e}:e}},value:function(a,b){return function(){return b?{context:void 0,name:void 0,value:a}:a}},identifier:function(a,b,d){return function(c,e,f,g){c=e&&a in e?e:c;d&&1!==d&&c&&null==c[a]&&(c[a]={});e=c?c[a]:void 0;return b?{context:c,name:a,value:e}:e}},computedMember:function(a,b,d,c){return function(e,f,g,k){var h=a(e,f,g,k),l,m;null!=h&&(l=b(e,f,g,k),l+="",c&&1!==c&&h&&!h[l]&&(h[l]={}),m=h[l]);return d?{context:h,name:l,value:m}:m}},nonComputedMember:function(a,
b,d,c){return function(e,f,g,k){e=a(e,f,g,k);c&&1!==c&&e&&null==e[b]&&(e[b]={});f=null!=e?e[b]:void 0;return d?{context:e,name:b,value:f}:f}},inputs:function(a,b){return function(d,c,e,f){return f?f[b]:a(d,c,e)}}};Nb.prototype={constructor:Nb,parse:function(a){a=this.getAst(a);var b=this.astCompiler.compile(a.ast),d=a.ast;b.literal=0===d.body.length||1===d.body.length&&(d.body[0].expression.type===r.Literal||d.body[0].expression.type===r.ArrayExpression||d.body[0].expression.type===r.ObjectExpression);
b.constant=a.ast.constant;b.oneTime=a.oneTime;return b},getAst:function(a){var b=!1;a=a.trim();":"===a.charAt(0)&&":"===a.charAt(1)&&(b=!0,a=a.substring(2));return{ast:this.ast.ast(a),oneTime:b}}};var pa=L("$sce"),da={HTML:"html",CSS:"css",MEDIA_URL:"mediaUrl",URL:"url",RESOURCE_URL:"resourceUrl",JS:"js"},Dc=/_([a-z])/g,Ng=L("$templateRequest"),Og=L("$timeout"),T=D.document.createElement("a"),Pd=oa(D.location.href),Va;Qd.$inject=["$document"];ed.$inject=["$provide"];var Xd=22,Wd=".",Fc="0";Rd.$inject=
["$locale"];Td.$inject=["$locale"];var Zg={yyyy:X("FullYear",4,0,!1,!0),yy:X("FullYear",2,0,!0,!0),y:X("FullYear",1,0,!1,!0),MMMM:mb("Month"),MMM:mb("Month",!0),MM:X("Month",2,1),M:X("Month",1,1),LLLL:mb("Month",!1,!0),dd:X("Date",2),d:X("Date",1),HH:X("Hours",2),H:X("Hours",1),hh:X("Hours",2,-12),h:X("Hours",1,-12),mm:X("Minutes",2),m:X("Minutes",1),ss:X("Seconds",2),s:X("Seconds",1),sss:X("Milliseconds",3),EEEE:mb("Day"),EEE:mb("Day",!0),a:function(a,b){return 12>a.getHours()?b.AMPMS[0]:b.AMPMS[1]},
Z:function(a,b,d){a=-1*d;return a=(0<=a?"+":"")+(Pb(Math[0<a?"floor":"ceil"](a/60),2)+Pb(Math.abs(a%60),2))},ww:Zd(2),w:Zd(1),G:Gc,GG:Gc,GGG:Gc,GGGG:function(a,b){return 0>=a.getFullYear()?b.ERANAMES[0]:b.ERANAMES[1]}},Yg=/((?:[^yMLdHhmsaZEwG']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|L+|d+|H+|h+|m+|s+|a|Z|G+|w+))([\s\S]*)/,Xg=/^-?\d+$/;Sd.$inject=["$locale"];var Sg=ia(O),Tg=ia(wb);Ud.$inject=["$parse"];var Ke=ia({restrict:"E",compile:function(a,b){if(!b.href&&!b.xlinkHref)return function(a,b){if("a"===b[0].nodeName.toLowerCase()){var e=
"[object SVGAnimatedString]"===ga.call(b.prop("href"))?"xlink:href":"href";b.on("click",function(a){b.attr(e)||a.preventDefault()})}}}}),xb={};q(Ib,function(a,b){function d(a,d,e){a.$watch(e[c],function(a){e.$set(b,!!a)})}if("multiple"!==a){var c=wa("ng-"+b),e=d;"checked"===a&&(e=function(a,b,e){e.ngModel!==e[c]&&d(a,b,e)});xb[c]=function(){return{restrict:"A",priority:100,link:e}}}});q(ud,function(a,b){xb[b]=function(){return{priority:100,link:function(a,c,e){if("ngPattern"===b&&"/"===e.ngPattern.charAt(0)&&
(c=e.ngPattern.match(ch))){e.$set("ngPattern",new RegExp(c[1],c[2]));return}a.$watch(e[b],function(a){e.$set(b,a)})}}}});q(["src","srcset","href"],function(a){var b=wa("ng-"+a);xb[b]=function(){return{priority:99,link:function(d,c,e){var f=a,g=a;"href"===a&&"[object SVGAnimatedString]"===ga.call(c.prop("href"))&&(g="xlinkHref",e.$attr[g]="xlink:href",f=null);e.$observe(b,function(b){b?(e.$set(g,b),Ca&&f&&c.prop(f,e[g])):"href"===a&&e.$set(g,null)})}}}});var nb={$addControl:x,$$renameControl:function(a,
b){a.$name=b},$removeControl:x,$setValidity:x,$setDirty:x,$setPristine:x,$setSubmitted:x,$$setSubmitted:x};Qb.$inject=["$element","$attrs","$scope","$animate","$interpolate"];Qb.prototype={$rollbackViewValue:function(){q(this.$$controls,function(a){a.$rollbackViewValue()})},$commitViewValue:function(){q(this.$$controls,function(a){a.$commitViewValue()})},$addControl:function(a){Na(a.$name,"input");this.$$controls.push(a);a.$name&&(this[a.$name]=a);a.$$parentForm=this},$$renameControl:function(a,b){var d=
a.$name;this[d]===a&&delete this[d];this[b]=a;a.$name=b},$removeControl:function(a){a.$name&&this[a.$name]===a&&delete this[a.$name];q(this.$pending,function(b,d){this.$setValidity(d,null,a)},this);q(this.$error,function(b,d){this.$setValidity(d,null,a)},this);q(this.$$success,function(b,d){this.$setValidity(d,null,a)},this);db(this.$$controls,a);a.$$parentForm=nb},$setDirty:function(){this.$$animate.removeClass(this.$$element,$a);this.$$animate.addClass(this.$$element,Vb);this.$dirty=!0;this.$pristine=
!1;this.$$parentForm.$setDirty()},$setPristine:function(){this.$$animate.setClass(this.$$element,$a,Vb+" ng-submitted");this.$dirty=!1;this.$pristine=!0;this.$submitted=!1;q(this.$$controls,function(a){a.$setPristine()})},$setUntouched:function(){q(this.$$controls,function(a){a.$setUntouched()})},$setSubmitted:function(){for(var a=this;a.$$parentForm&&a.$$parentForm!==nb;)a=a.$$parentForm;a.$$setSubmitted()},$$setSubmitted:function(){this.$$animate.addClass(this.$$element,"ng-submitted");this.$submitted=
!0;q(this.$$controls,function(a){a.$$setSubmitted&&a.$$setSubmitted()})}};be({clazz:Qb,set:function(a,b,d){var c=a[b];c?-1===c.indexOf(d)&&c.push(d):a[b]=[d]},unset:function(a,b,d){var c=a[b];c&&(db(c,d),0===c.length&&delete a[b])}});var je=function(a){return["$timeout","$parse",function(b,d){function c(a){return""===a?d('this[""]').assign:d(a).assign||x}return{name:"form",restrict:a?"EAC":"E",require:["form","^^?form"],controller:Qb,compile:function(d,f){d.addClass($a).addClass(ob);var g=f.name?
"name":a&&f.ngForm?"ngForm":!1;return{pre:function(a,d,e,f){var p=f[0];if(!("action"in e)){var n=function(b){a.$apply(function(){p.$commitViewValue();p.$setSubmitted()});b.preventDefault()};d[0].addEventListener("submit",n);d.on("$destroy",function(){b(function(){d[0].removeEventListener("submit",n)},0,!1)})}(f[1]||p.$$parentForm).$addControl(p);var t=g?c(p.$name):x;g&&(t(a,p),e.$observe(g,function(b){p.$name!==b&&(t(a,void 0),p.$$parentForm.$$renameControl(p,b),t=c(p.$name),t(a,p))}));d.on("$destroy",
function(){p.$$parentForm.$removeControl(p);t(a,void 0);P(p,nb)})}}}}}]},Le=je(),Xe=je(!0),$g=/^\d{4,}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+(?:[+-][0-2]\d:[0-5]\d|Z)$/,lh=/^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i,mh=/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/,ah=/^\s*(-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/,
ke=/^(\d{4,})-(\d{2})-(\d{2})$/,le=/^(\d{4,})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,Nc=/^(\d{4,})-W(\d\d)$/,me=/^(\d{4,})-(\d\d)$/,ne=/^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/,de=U();q(["date","datetime-local","month","time","week"],function(a){de[a]=!0});var oe={text:function(a,b,d,c,e,f){Xa(a,b,d,c,e,f);Ic(c)},date:pb("date",ke,Rb(ke,["yyyy","MM","dd"]),"yyyy-MM-dd"),"datetime-local":pb("datetimelocal",le,Rb(le,"yyyy MM dd HH mm ss sss".split(" ")),"yyyy-MM-ddTHH:mm:ss.sss"),time:pb("time",
ne,Rb(ne,["HH","mm","ss","sss"]),"HH:mm:ss.sss"),week:pb("week",Nc,function(a,b){if($(a))return a;if(B(a)){Nc.lastIndex=0;var d=Nc.exec(a);if(d){var c=+d[1],e=+d[2],f=d=0,g=0,k=0,h=Yd(c),e=7*(e-1);b&&(d=b.getHours(),f=b.getMinutes(),g=b.getSeconds(),k=b.getMilliseconds());return new Date(c,0,h.getDate()+e,d,f,g,k)}}return NaN},"yyyy-Www"),month:pb("month",me,Rb(me,["yyyy","MM"]),"yyyy-MM"),number:function(a,b,d,c,e,f){Jc(a,b,d,c,"number");ee(c);Xa(a,b,d,c,e,f);var g,k;if(u(d.min)||d.ngMin)c.$validators.min=
function(a,b){return c.$isEmpty(b)||v(g)||b>=g},d.$observe("min",function(a){g=Ya(a);c.$validate()});if(u(d.max)||d.ngMax)c.$validators.max=function(a,b){return c.$isEmpty(b)||v(k)||b<=k},d.$observe("max",function(a){k=Ya(a);c.$validate()});if(u(d.step)||d.ngStep){var h;c.$validators.step=function(a,b){return c.$isEmpty(b)||v(h)||fe(b,g||0,h)};d.$observe("step",function(a){h=Ya(a);c.$validate()})}},url:function(a,b,d,c,e,f){Xa(a,b,d,c,e,f);Ic(c);c.$validators.url=function(a,b){var d=a||b;return c.$isEmpty(d)||
lh.test(d)}},email:function(a,b,d,c,e,f){Xa(a,b,d,c,e,f);Ic(c);c.$validators.email=function(a,b){var d=a||b;return c.$isEmpty(d)||mh.test(d)}},radio:function(a,b,d,c){var e=!d.ngTrim||"false"!==Q(d.ngTrim);v(d.name)&&b.attr("name",++rb);b.on("change",function(a){var g;b[0].checked&&(g=d.value,e&&(g=Q(g)),c.$setViewValue(g,a&&a.type))});c.$render=function(){var a=d.value;e&&(a=Q(a));b[0].checked=a===c.$viewValue};d.$observe("value",c.$render)},range:function(a,b,d,c,e,f){function g(a,c){b.attr(a,d[a]);
d.$observe(a,c)}function k(a){p=Ya(a);ha(c.$modelValue)||(m?(a=b.val(),p>a&&(a=p,b.val(a)),c.$setViewValue(a)):c.$validate())}function h(a){n=Ya(a);ha(c.$modelValue)||(m?(a=b.val(),n<a&&(b.val(n),a=n<p?p:n),c.$setViewValue(a)):c.$validate())}function l(a){t=Ya(a);ha(c.$modelValue)||(m&&c.$viewValue!==b.val()?c.$setViewValue(b.val()):c.$validate())}Jc(a,b,d,c,"range");ee(c);Xa(a,b,d,c,e,f);var m=c.$$hasNativeValidators&&"range"===b[0].type,p=m?0:void 0,n=m?100:void 0,t=m?1:void 0,s=b[0].validity;a=
u(d.min);e=u(d.max);f=u(d.step);var q=c.$render;c.$render=m&&u(s.rangeUnderflow)&&u(s.rangeOverflow)?function(){q();c.$setViewValue(b.val())}:q;a&&(c.$validators.min=m?function(){return!0}:function(a,b){return c.$isEmpty(b)||v(p)||b>=p},g("min",k));e&&(c.$validators.max=m?function(){return!0}:function(a,b){return c.$isEmpty(b)||v(n)||b<=n},g("max",h));f&&(c.$validators.step=m?function(){return!s.stepMismatch}:function(a,b){return c.$isEmpty(b)||v(t)||fe(b,p||0,t)},g("step",l))},checkbox:function(a,
b,d,c,e,f,g,k){var h=ge(k,a,"ngTrueValue",d.ngTrueValue,!0),l=ge(k,a,"ngFalseValue",d.ngFalseValue,!1);b.on("change",function(a){c.$setViewValue(b[0].checked,a&&a.type)});c.$render=function(){b[0].checked=c.$viewValue};c.$isEmpty=function(a){return!1===a};c.$formatters.push(function(a){return ua(a,h)});c.$parsers.push(function(a){return a?h:l})},hidden:x,button:x,submit:x,reset:x,file:x},Zc=["$browser","$sniffer","$filter","$parse",function(a,b,d,c){return{restrict:"E",require:["?ngModel"],link:{pre:function(e,
f,g,k){k[0]&&(oe[O(g.type)]||oe.text)(e,f,g,k[0],b,a,d,c)}}}}],nh=/^(true|false|\d+)$/,qf=function(){function a(a,d,c){var e=u(c)?c:9===Ca?"":null;a.prop("value",e);d.$set("value",c)}return{restrict:"A",priority:100,compile:function(b,d){return nh.test(d.ngValue)?function(b,d,f){b=b.$eval(f.ngValue);a(d,f,b)}:function(b,d,f){b.$watch(f.ngValue,function(b){a(d,f,b)})}}}},Pe=["$compile",function(a){return{restrict:"AC",compile:function(b){a.$$addBindingClass(b);return function(b,c,e){a.$$addBindingInfo(c,
e.ngBind);c=c[0];b.$watch(e.ngBind,function(a){c.textContent=ic(a)})}}}}],Re=["$interpolate","$compile",function(a,b){return{compile:function(d){b.$$addBindingClass(d);return function(c,d,f){c=a(d.attr(f.$attr.ngBindTemplate));b.$$addBindingInfo(d,c.expressions);d=d[0];f.$observe("ngBindTemplate",function(a){d.textContent=v(a)?"":a})}}}}],Qe=["$sce","$parse","$compile",function(a,b,d){return{restrict:"A",compile:function(c,e){var f=b(e.ngBindHtml),g=b(e.ngBindHtml,function(b){return a.valueOf(b)});
d.$$addBindingClass(c);return function(b,c,e){d.$$addBindingInfo(c,e.ngBindHtml);b.$watch(g,function(){var d=f(b);c.html(a.getTrustedHtml(d)||"")})}}}}],pf=ia({restrict:"A",require:"ngModel",link:function(a,b,d,c){c.$viewChangeListeners.push(function(){a.$eval(d.ngChange)})}}),Se=Lc("",!0),Ue=Lc("Odd",0),Te=Lc("Even",1),Ve=Wa({compile:function(a,b){b.$set("ngCloak",void 0);a.removeClass("ng-cloak")}}),We=[function(){return{restrict:"A",scope:!0,controller:"@",priority:500}}],dd={},oh={blur:!0,focus:!0};
q("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "),function(a){var b=wa("ng-"+a);dd[b]=["$parse","$rootScope",function(d,c){return{restrict:"A",compile:function(e,f){var g=d(f[b]);return function(b,d){d.on(a,function(d){var e=function(){g(b,{$event:d})};oh[a]&&c.$$phase?b.$evalAsync(e):b.$apply(e)})}}}}]});var Ze=["$animate","$compile",function(a,b){return{multiElement:!0,transclude:"element",priority:600,
terminal:!0,restrict:"A",$$tlb:!0,link:function(d,c,e,f,g){var k,h,l;d.$watch(e.ngIf,function(d){d?h||g(function(d,f){h=f;d[d.length++]=b.$$createComment("end ngIf",e.ngIf);k={clone:d};a.enter(d,c.parent(),c)}):(l&&(l.remove(),l=null),h&&(h.$destroy(),h=null),k&&(l=vb(k.clone),a.leave(l).done(function(a){!1!==a&&(l=null)}),k=null))})}}}],$e=["$templateRequest","$anchorScroll","$animate",function(a,b,d){return{restrict:"ECA",priority:400,terminal:!0,transclude:"element",controller:fa.noop,compile:function(c,
e){var f=e.ngInclude||e.src,g=e.onload||"",k=e.autoscroll;return function(c,e,m,p,n){var t=0,s,q,r,v=function(){q&&(q.remove(),q=null);s&&(s.$destroy(),s=null);r&&(d.leave(r).done(function(a){!1!==a&&(q=null)}),q=r,r=null)};c.$watch(f,function(f){var m=function(a){!1===a||!u(k)||k&&!c.$eval(k)||b()},q=++t;f?(a(f,!0).then(function(a){if(!c.$$destroyed&&q===t){var b=c.$new();p.template=a;a=n(b,function(a){v();d.enter(a,null,e).done(m)});s=b;r=a;s.$emit("$includeContentLoaded",f);c.$eval(g)}},function(){c.$$destroyed||
q!==t||(v(),c.$emit("$includeContentError",f))}),c.$emit("$includeContentRequested",f)):(v(),p.template=null)})}}}}],sf=["$compile",function(a){return{restrict:"ECA",priority:-400,require:"ngInclude",link:function(b,d,c,e){ga.call(d[0]).match(/SVG/)?(d.empty(),a(fd(e.template,D.document).childNodes)(b,function(a){d.append(a)},{futureParentElement:d})):(d.html(e.template),a(d.contents())(b))}}}],af=Wa({priority:450,compile:function(){return{pre:function(a,b,d){a.$eval(d.ngInit)}}}}),of=function(){return{restrict:"A",
priority:100,require:"ngModel",link:function(a,b,d,c){var e=d.ngList||", ",f="false"!==d.ngTrim,g=f?Q(e):e;c.$parsers.push(function(a){if(!v(a)){var b=[];a&&q(a.split(g),function(a){a&&b.push(f?Q(a):a)});return b}});c.$formatters.push(function(a){if(F(a))return a.join(e)});c.$isEmpty=function(a){return!a||!a.length}}}},ob="ng-valid",ae="ng-invalid",$a="ng-pristine",Vb="ng-dirty",qb=L("ngModel");Sb.$inject="$scope $exceptionHandler $attrs $element $parse $animate $timeout $q $interpolate".split(" ");
Sb.prototype={$$initGetterSetters:function(){if(this.$options.getOption("getterSetter")){var a=this.$$parse(this.$$attr.ngModel+"()"),b=this.$$parse(this.$$attr.ngModel+"($$$p)");this.$$ngModelGet=function(b){var c=this.$$parsedNgModel(b);z(c)&&(c=a(b));return c};this.$$ngModelSet=function(a,c){z(this.$$parsedNgModel(a))?b(a,{$$$p:c}):this.$$parsedNgModelAssign(a,c)}}else if(!this.$$parsedNgModel.assign)throw qb("nonassign",this.$$attr.ngModel,Aa(this.$$element));},$render:x,$isEmpty:function(a){return v(a)||
""===a||null===a||a!==a},$$updateEmptyClasses:function(a){this.$isEmpty(a)?(this.$$animate.removeClass(this.$$element,"ng-not-empty"),this.$$animate.addClass(this.$$element,"ng-empty")):(this.$$animate.removeClass(this.$$element,"ng-empty"),this.$$animate.addClass(this.$$element,"ng-not-empty"))},$setPristine:function(){this.$dirty=!1;this.$pristine=!0;this.$$animate.removeClass(this.$$element,Vb);this.$$animate.addClass(this.$$element,$a)},$setDirty:function(){this.$dirty=!0;this.$pristine=!1;this.$$animate.removeClass(this.$$element,
$a);this.$$animate.addClass(this.$$element,Vb);this.$$parentForm.$setDirty()},$setUntouched:function(){this.$touched=!1;this.$untouched=!0;this.$$animate.setClass(this.$$element,"ng-untouched","ng-touched")},$setTouched:function(){this.$touched=!0;this.$untouched=!1;this.$$animate.setClass(this.$$element,"ng-touched","ng-untouched")},$rollbackViewValue:function(){this.$$timeout.cancel(this.$$pendingDebounce);this.$viewValue=this.$$lastCommittedViewValue;this.$render()},$validate:function(){if(!ha(this.$modelValue)){var a=
this.$$lastCommittedViewValue,b=this.$$rawModelValue,d=this.$valid,c=this.$modelValue,e=this.$options.getOption("allowInvalid"),f=this;this.$$runValidators(b,a,function(a){e||d===a||(f.$modelValue=a?b:void 0,f.$modelValue!==c&&f.$$writeModelToScope())})}},$$runValidators:function(a,b,d){function c(){var c=!0;q(h.$validators,function(d,e){var g=Boolean(d(a,b));c=c&&g;f(e,g)});return c?!0:(q(h.$asyncValidators,function(a,b){f(b,null)}),!1)}function e(){var c=[],d=!0;q(h.$asyncValidators,function(e,
g){var h=e(a,b);if(!h||!z(h.then))throw qb("nopromise",h);f(g,void 0);c.push(h.then(function(){f(g,!0)},function(){d=!1;f(g,!1)}))});c.length?h.$$q.all(c).then(function(){g(d)},x):g(!0)}function f(a,b){k===h.$$currentValidationRunId&&h.$setValidity(a,b)}function g(a){k===h.$$currentValidationRunId&&d(a)}this.$$currentValidationRunId++;var k=this.$$currentValidationRunId,h=this;(function(){var a=h.$$parserName;if(v(h.$$parserValid))f(a,null);else return h.$$parserValid||(q(h.$validators,function(a,
b){f(b,null)}),q(h.$asyncValidators,function(a,b){f(b,null)})),f(a,h.$$parserValid),h.$$parserValid;return!0})()?c()?e():g(!1):g(!1)},$commitViewValue:function(){var a=this.$viewValue;this.$$timeout.cancel(this.$$pendingDebounce);if(this.$$lastCommittedViewValue!==a||""===a&&this.$$hasNativeValidators)this.$$updateEmptyClasses(a),this.$$lastCommittedViewValue=a,this.$pristine&&this.$setDirty(),this.$$parseAndValidate()},$$parseAndValidate:function(){var a=this.$$lastCommittedViewValue,b=this;this.$$parserValid=
v(a)?void 0:!0;this.$setValidity(this.$$parserName,null);this.$$parserName="parse";if(this.$$parserValid)for(var d=0;d<this.$parsers.length;d++)if(a=this.$parsers[d](a),v(a)){this.$$parserValid=!1;break}ha(this.$modelValue)&&(this.$modelValue=this.$$ngModelGet(this.$$scope));var c=this.$modelValue,e=this.$options.getOption("allowInvalid");this.$$rawModelValue=a;e&&(this.$modelValue=a,b.$modelValue!==c&&b.$$writeModelToScope());this.$$runValidators(a,this.$$lastCommittedViewValue,function(d){e||(b.$modelValue=
d?a:void 0,b.$modelValue!==c&&b.$$writeModelToScope())})},$$writeModelToScope:function(){this.$$ngModelSet(this.$$scope,this.$modelValue);q(this.$viewChangeListeners,function(a){try{a()}catch(b){this.$$exceptionHandler(b)}},this)},$setViewValue:function(a,b){this.$viewValue=a;this.$options.getOption("updateOnDefault")&&this.$$debounceViewValueCommit(b)},$$debounceViewValueCommit:function(a){var b=this.$options.getOption("debounce");aa(b[a])?b=b[a]:aa(b["default"])&&-1===this.$options.getOption("updateOn").indexOf(a)?
b=b["default"]:aa(b["*"])&&(b=b["*"]);this.$$timeout.cancel(this.$$pendingDebounce);var d=this;0<b?this.$$pendingDebounce=this.$$timeout(function(){d.$commitViewValue()},b):this.$$rootScope.$$phase?this.$commitViewValue():this.$$scope.$apply(function(){d.$commitViewValue()})},$overrideModelOptions:function(a){this.$options=this.$options.createChild(a);this.$$setUpdateOnEvents()},$processModelValue:function(){var a=this.$$format();this.$viewValue!==a&&(this.$$updateEmptyClasses(a),this.$viewValue=
this.$$lastCommittedViewValue=a,this.$render(),this.$$runValidators(this.$modelValue,this.$viewValue,x))},$$format:function(){for(var a=this.$formatters,b=a.length,d=this.$modelValue;b--;)d=a[b](d);return d},$$setModelValue:function(a){this.$modelValue=this.$$rawModelValue=a;this.$$parserValid=void 0;this.$processModelValue()},$$setUpdateOnEvents:function(){this.$$updateEvents&&this.$$element.off(this.$$updateEvents,this.$$updateEventHandler);if(this.$$updateEvents=this.$options.getOption("updateOn"))this.$$element.on(this.$$updateEvents,
this.$$updateEventHandler)},$$updateEventHandler:function(a){this.$$debounceViewValueCommit(a&&a.type)}};be({clazz:Sb,set:function(a,b){a[b]=!0},unset:function(a,b){delete a[b]}});var nf=["$rootScope",function(a){return{restrict:"A",require:["ngModel","^?form","^?ngModelOptions"],controller:Sb,priority:1,compile:function(b){b.addClass($a).addClass("ng-untouched").addClass(ob);return{pre:function(a,b,e,f){var g=f[0];b=f[1]||g.$$parentForm;if(f=f[2])g.$options=f.$options;g.$$initGetterSetters();b.$addControl(g);
e.$observe("name",function(a){g.$name!==a&&g.$$parentForm.$$renameControl(g,a)});a.$on("$destroy",function(){g.$$parentForm.$removeControl(g)})},post:function(b,c,e,f){function g(){k.$setTouched()}var k=f[0];k.$$setUpdateOnEvents();c.on("blur",function(){k.$touched||(a.$$phase?b.$evalAsync(g):b.$apply(g))})}}}}}],Tb,ph=/(\s+|^)default(\s+|$)/;Mc.prototype={getOption:function(a){return this.$$options[a]},createChild:function(a){var b=!1;a=P({},a);q(a,function(d,c){"$inherit"===d?"*"===c?b=!0:(a[c]=
this.$$options[c],"updateOn"===c&&(a.updateOnDefault=this.$$options.updateOnDefault)):"updateOn"===c&&(a.updateOnDefault=!1,a[c]=Q(d.replace(ph,function(){a.updateOnDefault=!0;return" "})))},this);b&&(delete a["*"],he(a,this.$$options));he(a,Tb.$$options);return new Mc(a)}};Tb=new Mc({updateOn:"",updateOnDefault:!0,debounce:0,getterSetter:!1,allowInvalid:!1,timezone:null});var rf=function(){function a(a,d){this.$$attrs=a;this.$$scope=d}a.$inject=["$attrs","$scope"];a.prototype={$onInit:function(){var a=
this.parentCtrl?this.parentCtrl.$options:Tb,d=this.$$scope.$eval(this.$$attrs.ngModelOptions);this.$options=a.createChild(d)}};return{restrict:"A",priority:10,require:{parentCtrl:"?^^ngModelOptions"},bindToController:!0,controller:a}},bf=Wa({terminal:!0,priority:1E3}),qh=L("ngOptions"),rh=/^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?(?:\s+disable\s+when\s+([\s\S]+?))?\s+for\s+(?:([$\w][$\w]*)|(?:\(\s*([$\w][$\w]*)\s*,\s*([$\w][$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
lf=["$compile","$document","$parse",function(a,b,d){function c(a,b,c){function e(a,b,c,d,f){this.selectValue=a;this.viewValue=b;this.label=c;this.group=d;this.disabled=f}function f(a){var b;if(!q&&ra(a))b=a;else{b=[];for(var c in a)a.hasOwnProperty(c)&&"$"!==c.charAt(0)&&b.push(c)}return b}var p=a.match(rh);if(!p)throw qh("iexp",a,Aa(b));var n=p[5]||p[7],q=p[6];a=/ as /.test(p[0])&&p[1];var s=p[9];b=d(p[2]?p[1]:n);var r=a&&d(a)||b,w=s&&d(s),u=s?function(a,b){return w(c,b)}:function(a){return Ta(a)},
v=function(a,b){return u(a,z(a,b))},y=d(p[2]||p[1]),A=d(p[3]||""),E=d(p[4]||""),H=d(p[8]),x={},z=q?function(a,b){x[q]=b;x[n]=a;return x}:function(a){x[n]=a;return x};return{trackBy:s,getTrackByValue:v,getWatchables:d(H,function(a){var b=[];a=a||[];for(var d=f(a),e=d.length,g=0;g<e;g++){var k=a===d?g:d[g],l=a[k],k=z(l,k),l=u(l,k);b.push(l);if(p[2]||p[1])l=y(c,k),b.push(l);p[4]&&(k=E(c,k),b.push(k))}return b}),getOptions:function(){for(var a=[],b={},d=H(c)||[],g=f(d),k=g.length,n=0;n<k;n++){var p=d===
g?n:g[n],q=z(d[p],p),t=r(c,q),p=u(t,q),w=y(c,q),x=A(c,q),q=E(c,q),t=new e(p,t,w,x,q);a.push(t);b[p]=t}return{items:a,selectValueMap:b,getOptionFromViewValue:function(a){return b[v(a)]},getViewValueFromOption:function(a){return s?za(a.viewValue):a.viewValue}}}}}var e=D.document.createElement("option"),f=D.document.createElement("optgroup");return{restrict:"A",terminal:!0,require:["select","ngModel"],link:{pre:function(a,b,c,d){d[0].registerOption=x},post:function(d,k,h,l){function m(a){var b=(a=v.getOptionFromViewValue(a))&&
a.element;b&&!b.selected&&(b.selected=!0);return a}function p(a,b){a.element=b;b.disabled=a.disabled;a.label!==b.label&&(b.label=a.label,b.textContent=a.label);b.value=a.selectValue}var n=l[0],t=l[1],s=h.multiple;l=0;for(var r=k.children(),w=r.length;l<w;l++)if(""===r[l].value){n.hasEmptyOption=!0;n.emptyOption=r.eq(l);break}k.empty();l=!!n.emptyOption;y(e.cloneNode(!1)).val("?");var v,x=c(h.ngOptions,k,d),z=b[0].createDocumentFragment();n.generateUnknownOptionValue=function(a){return"?"};s?(n.writeValue=
function(a){if(v){var b=a&&a.map(m)||[];v.items.forEach(function(a){a.element.selected&&-1===Array.prototype.indexOf.call(b,a)&&(a.element.selected=!1)})}},n.readValue=function(){var a=k.val()||[],b=[];q(a,function(a){(a=v.selectValueMap[a])&&!a.disabled&&b.push(v.getViewValueFromOption(a))});return b},x.trackBy&&d.$watchCollection(function(){if(F(t.$viewValue))return t.$viewValue.map(function(a){return x.getTrackByValue(a)})},function(){t.$render()})):(n.writeValue=function(a){if(v){var b=k[0].options[k[0].selectedIndex],
c=v.getOptionFromViewValue(a);b&&b.removeAttribute("selected");c?(k[0].value!==c.selectValue&&(n.removeUnknownOption(),k[0].value=c.selectValue,c.element.selected=!0),c.element.setAttribute("selected","selected")):n.selectUnknownOrEmptyOption(a)}},n.readValue=function(){var a=v.selectValueMap[k.val()];return a&&!a.disabled?(n.unselectEmptyOption(),n.removeUnknownOption(),v.getViewValueFromOption(a)):null},x.trackBy&&d.$watch(function(){return x.getTrackByValue(t.$viewValue)},function(){t.$render()}));
l&&(a(n.emptyOption)(d),k.prepend(n.emptyOption),8===n.emptyOption[0].nodeType?(n.hasEmptyOption=!1,n.registerOption=function(a,b){""===b.val()&&(n.hasEmptyOption=!0,n.emptyOption=b,n.emptyOption.removeClass("ng-scope"),t.$render(),b.on("$destroy",function(){var a=n.$isEmptyOptionSelected();n.hasEmptyOption=!1;n.emptyOption=void 0;a&&t.$render()}))}):n.emptyOption.removeClass("ng-scope"));d.$watchCollection(x.getWatchables,function(){var a=v&&n.readValue();if(v)for(var b=v.items.length-1;0<=b;b--){var c=
v.items[b];u(c.group)?Hb(c.element.parentNode):Hb(c.element)}v=x.getOptions();var d={};v.items.forEach(function(a){var b;if(u(a.group)){b=d[a.group];b||(b=f.cloneNode(!1),z.appendChild(b),b.label=null===a.group?"null":a.group,d[a.group]=b);var c=e.cloneNode(!1);b.appendChild(c);p(a,c)}else b=e.cloneNode(!1),z.appendChild(b),p(a,b)});k[0].appendChild(z);t.$render();t.$isEmpty(a)||(b=n.readValue(),(x.trackBy||s?ua(a,b):a===b)||(t.$setViewValue(b),t.$render()))})}}}}],cf=["$locale","$interpolate","$log",
function(a,b,d){var c=/{}/g,e=/^when(Minus)?(.+)$/;return{link:function(f,g,k){function h(a){g.text(a||"")}var l=k.count,m=k.$attr.when&&g.attr(k.$attr.when),p=k.offset||0,n=f.$eval(m)||{},t={},s=b.startSymbol(),r=b.endSymbol(),w=s+l+"-"+p+r,u=fa.noop,y;q(k,function(a,b){var c=e.exec(b);c&&(c=(c[1]?"-":"")+O(c[2]),n[c]=g.attr(k.$attr[b]))});q(n,function(a,d){t[d]=b(a.replace(c,w))});f.$watch(l,function(b){var c=parseFloat(b),e=ha(c);e||c in n||(c=a.pluralCat(c-p));c===y||e&&ha(y)||(u(),e=t[c],v(e)?
(null!=b&&d.debug("ngPluralize: no rule defined for '"+c+"' in "+m),u=x,h()):u=f.$watch(e,h),y=c)})}}}],pe=L("ngRef"),df=["$parse",function(a){return{priority:-1,restrict:"A",compile:function(b,d){var c=wa(ta(b)),e=a(d.ngRef),f=e.assign||function(){throw pe("nonassign",d.ngRef);};return function(a,b,h){var l;if(h.hasOwnProperty("ngRefRead"))if("$element"===h.ngRefRead)l=b;else{if(l=b.data("$"+h.ngRefRead+"Controller"),!l)throw pe("noctrl",h.ngRefRead,d.ngRef);}else l=b.data("$"+c+"Controller");l=
l||b;f(a,l);b.on("$destroy",function(){e(a)===l&&f(a,null)})}}}}],ef=["$parse","$animate","$compile",function(a,b,d){var c=L("ngRepeat"),e=function(a,b,c,d,e,m,p){a[c]=d;e&&(a[e]=m);a.$index=b;a.$first=0===b;a.$last=b===p-1;a.$middle=!(a.$first||a.$last);a.$odd=!(a.$even=0===(b&1))};return{restrict:"A",multiElement:!0,transclude:"element",priority:1E3,terminal:!0,$$tlb:!0,compile:function(f,g){var k=g.ngRepeat,h=d.$$createComment("end ngRepeat",k),l=k.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+track\s+by\s+([\s\S]+?))?\s*$/);
if(!l)throw c("iexp",k);var m=l[1],p=l[2],n=l[3],r=l[4],l=m.match(/^(?:(\s*[$\w]+)|\(\s*([$\w]+)\s*,\s*([$\w]+)\s*\))$/);if(!l)throw c("iidexp",m);var s=l[3]||l[1],u=l[2];if(n&&(!/^[$a-zA-Z_][$a-zA-Z0-9_]*$/.test(n)||/^(null|undefined|this|\$index|\$first|\$middle|\$last|\$even|\$odd|\$parent|\$root|\$id)$/.test(n)))throw c("badident",n);var w,v,x,y,A={$id:Ta};r?w=a(r):(x=function(a,b){return Ta(b)},y=function(a){return a});return function(a,d,f,g,l){w&&(v=function(b,c,d){u&&(A[u]=b);A[s]=c;A.$index=
d;return w(a,A)});var m=U();a.$watchCollection(p,function(f){var g,p,r=d[0],t,w=U(),A,z,D,B,G,F,I;n&&(a[n]=f);if(ra(f))G=f,p=v||x;else for(I in p=v||y,G=[],f)sa.call(f,I)&&"$"!==I.charAt(0)&&G.push(I);A=G.length;I=Array(A);for(g=0;g<A;g++)if(z=f===G?g:G[g],D=f[z],B=p(z,D,g),m[B])F=m[B],delete m[B],w[B]=F,I[g]=F;else{if(w[B])throw q(I,function(a){a&&a.scope&&(m[a.id]=a)}),c("dupes",k,B,D);I[g]={id:B,scope:void 0,clone:void 0};w[B]=!0}for(t in m){F=m[t];B=vb(F.clone);b.leave(B);if(B[0].parentNode)for(g=
0,p=B.length;g<p;g++)B[g].$$NG_REMOVED=!0;F.scope.$destroy()}for(g=0;g<A;g++)if(z=f===G?g:G[g],D=f[z],F=I[g],F.scope){t=r;do t=t.nextSibling;while(t&&t.$$NG_REMOVED);F.clone[0]!==t&&b.move(vb(F.clone),null,r);r=F.clone[F.clone.length-1];e(F.scope,g,s,D,u,z,A)}else l(function(a,c){F.scope=c;var d=h.cloneNode(!1);a[a.length++]=d;b.enter(a,null,r);r=d;F.clone=a;w[F.id]=F;e(F.scope,g,s,D,u,z,A)});m=w})}}}}],ff=["$animate",function(a){return{restrict:"A",multiElement:!0,link:function(b,d,c){b.$watch(c.ngShow,
function(b){a[b?"removeClass":"addClass"](d,"ng-hide",{tempClasses:"ng-hide-animate"})})}}}],Ye=["$animate",function(a){return{restrict:"A",multiElement:!0,link:function(b,d,c){b.$watch(c.ngHide,function(b){a[b?"addClass":"removeClass"](d,"ng-hide",{tempClasses:"ng-hide-animate"})})}}}],gf=Wa(function(a,b,d){a.$watchCollection(d.ngStyle,function(a,d){d&&a!==d&&q(d,function(a,c){b.css(c,"")});a&&b.css(a)})}),hf=["$animate","$compile",function(a,b){return{require:"ngSwitch",controller:["$scope",function(){this.cases=
{}}],link:function(d,c,e,f){var g=[],k=[],h=[],l=[],m=function(a,b){return function(c){!1!==c&&a.splice(b,1)}};d.$watch(e.ngSwitch||e.on,function(c){for(var d,e;h.length;)a.cancel(h.pop());d=0;for(e=l.length;d<e;++d){var r=vb(k[d].clone);l[d].$destroy();(h[d]=a.leave(r)).done(m(h,d))}k.length=0;l.length=0;(g=f.cases["!"+c]||f.cases["?"])&&q(g,function(c){c.transclude(function(d,e){l.push(e);var f=c.element;d[d.length++]=b.$$createComment("end ngSwitchWhen");k.push({clone:d});a.enter(d,f.parent(),
f)})})})}}}],jf=Wa({transclude:"element",priority:1200,require:"^ngSwitch",multiElement:!0,link:function(a,b,d,c,e){a=d.ngSwitchWhen.split(d.ngSwitchWhenSeparator).sort().filter(function(a,b,c){return c[b-1]!==a});q(a,function(a){c.cases["!"+a]=c.cases["!"+a]||[];c.cases["!"+a].push({transclude:e,element:b})})}}),kf=Wa({transclude:"element",priority:1200,require:"^ngSwitch",multiElement:!0,link:function(a,b,d,c,e){c.cases["?"]=c.cases["?"]||[];c.cases["?"].push({transclude:e,element:b})}}),sh=L("ngTransclude"),
mf=["$compile",function(a){return{restrict:"EAC",compile:function(b){var d=a(b.contents());b.empty();return function(a,b,f,g,k){function h(){d(a,function(a){b.append(a)})}if(!k)throw sh("orphan",Aa(b));f.ngTransclude===f.$attr.ngTransclude&&(f.ngTransclude="");f=f.ngTransclude||f.ngTranscludeSlot;k(function(a,c){var d;if(d=a.length)a:{d=0;for(var f=a.length;d<f;d++){var g=a[d];if(g.nodeType!==Ma||g.nodeValue.trim()){d=!0;break a}}d=void 0}d?b.append(a):(h(),c.$destroy())},null,f);f&&!k.isSlotFilled(f)&&
h()}}}}],Me=["$templateCache",function(a){return{restrict:"E",terminal:!0,compile:function(b,d){"text/ng-template"===d.type&&a.put(d.id,b[0].text)}}}],th={$setViewValue:x,$render:x},uh=["$element","$scope",function(a,b){function d(){g||(g=!0,b.$$postDigest(function(){g=!1;e.ngModelCtrl.$render()}))}function c(a){k||(k=!0,b.$$postDigest(function(){b.$$destroyed||(k=!1,e.ngModelCtrl.$setViewValue(e.readValue()),a&&e.ngModelCtrl.$render())}))}var e=this,f=new Jb;e.selectValueMap={};e.ngModelCtrl=th;
e.multiple=!1;e.unknownOption=y(D.document.createElement("option"));e.hasEmptyOption=!1;e.emptyOption=void 0;e.renderUnknownOption=function(b){b=e.generateUnknownOptionValue(b);e.unknownOption.val(b);a.prepend(e.unknownOption);Fa(e.unknownOption,!0);a.val(b)};e.updateUnknownOption=function(b){b=e.generateUnknownOptionValue(b);e.unknownOption.val(b);Fa(e.unknownOption,!0);a.val(b)};e.generateUnknownOptionValue=function(a){return"? "+Ta(a)+" ?"};e.removeUnknownOption=function(){e.unknownOption.parent()&&
e.unknownOption.remove()};e.selectEmptyOption=function(){e.emptyOption&&(a.val(""),Fa(e.emptyOption,!0))};e.unselectEmptyOption=function(){e.hasEmptyOption&&Fa(e.emptyOption,!1)};b.$on("$destroy",function(){e.renderUnknownOption=x});e.readValue=function(){var b=a.val(),b=b in e.selectValueMap?e.selectValueMap[b]:b;return e.hasOption(b)?b:null};e.writeValue=function(b){var c=a[0].options[a[0].selectedIndex];c&&Fa(y(c),!1);e.hasOption(b)?(e.removeUnknownOption(),c=Ta(b),a.val(c in e.selectValueMap?
c:b),Fa(y(a[0].options[a[0].selectedIndex]),!0)):e.selectUnknownOrEmptyOption(b)};e.addOption=function(a,b){if(8!==b[0].nodeType){Na(a,'"option value"');""===a&&(e.hasEmptyOption=!0,e.emptyOption=b);var c=f.get(a)||0;f.set(a,c+1);d()}};e.removeOption=function(a){var b=f.get(a);b&&(1===b?(f.delete(a),""===a&&(e.hasEmptyOption=!1,e.emptyOption=void 0)):f.set(a,b-1))};e.hasOption=function(a){return!!f.get(a)};e.$hasEmptyOption=function(){return e.hasEmptyOption};e.$isUnknownOptionSelected=function(){return a[0].options[0]===
e.unknownOption[0]};e.$isEmptyOptionSelected=function(){return e.hasEmptyOption&&a[0].options[a[0].selectedIndex]===e.emptyOption[0]};e.selectUnknownOrEmptyOption=function(a){null==a&&e.emptyOption?(e.removeUnknownOption(),e.selectEmptyOption()):e.unknownOption.parent().length?e.updateUnknownOption(a):e.renderUnknownOption(a)};var g=!1,k=!1;e.registerOption=function(a,b,f,g,k){if(f.$attr.ngValue){var q,r=NaN;f.$observe("value",function(a){var d,f=b.prop("selected");u(r)&&(e.removeOption(q),delete e.selectValueMap[r],
d=!0);r=Ta(a);q=a;e.selectValueMap[r]=a;e.addOption(a,b);b.attr("value",r);d&&f&&c()})}else g?f.$observe("value",function(a){e.readValue();var d,f=b.prop("selected");u(q)&&(e.removeOption(q),d=!0);q=a;e.addOption(a,b);d&&f&&c()}):k?a.$watch(k,function(a,d){f.$set("value",a);var g=b.prop("selected");d!==a&&e.removeOption(d);e.addOption(a,b);d&&g&&c()}):e.addOption(f.value,b);f.$observe("disabled",function(a){if("true"===a||a&&b.prop("selected"))e.multiple?c(!0):(e.ngModelCtrl.$setViewValue(null),e.ngModelCtrl.$render())});
b.on("$destroy",function(){var a=e.readValue(),b=f.value;e.removeOption(b);d();(e.multiple&&a&&-1!==a.indexOf(b)||a===b)&&c(!0)})}}],Ne=function(){return{restrict:"E",require:["select","?ngModel"],controller:uh,priority:1,link:{pre:function(a,b,d,c){var e=c[0],f=c[1];if(f){if(e.ngModelCtrl=f,b.on("change",function(){e.removeUnknownOption();a.$apply(function(){f.$setViewValue(e.readValue())})}),d.multiple){e.multiple=!0;e.readValue=function(){var a=[];q(b.find("option"),function(b){b.selected&&!b.disabled&&
(b=b.value,a.push(b in e.selectValueMap?e.selectValueMap[b]:b))});return a};e.writeValue=function(a){q(b.find("option"),function(b){var c=!!a&&(-1!==Array.prototype.indexOf.call(a,b.value)||-1!==Array.prototype.indexOf.call(a,e.selectValueMap[b.value]));c!==b.selected&&Fa(y(b),c)})};var g,k=NaN;a.$watch(function(){k!==f.$viewValue||ua(g,f.$viewValue)||(g=ja(f.$viewValue),f.$render());k=f.$viewValue});f.$isEmpty=function(a){return!a||0===a.length}}}else e.registerOption=x},post:function(a,b,d,c){var e=
c[1];if(e){var f=c[0];e.$render=function(){f.writeValue(e.$viewValue)}}}}}},Oe=["$interpolate",function(a){return{restrict:"E",priority:100,compile:function(b,d){var c,e;u(d.ngValue)||(u(d.value)?c=a(d.value,!0):(e=a(b.text(),!0))||d.$set("value",b.text()));return function(a,b,d){var h=b.parent();(h=h.data("$selectController")||h.parent().data("$selectController"))&&h.registerOption(a,b,d,c,e)}}}}],ad=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){c&&(d.required=!0,c.$validators.required=
function(a,b){return!d.required||!c.$isEmpty(b)},d.$observe("required",function(){c.$validate()}))}}},$c=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){if(c){var e,f=d.ngPattern||d.pattern;d.$observe("pattern",function(a){B(a)&&0<a.length&&(a=new RegExp("^"+a+"$"));if(a&&!a.test)throw L("ngPattern")("noregexp",f,a,Aa(b));e=a||void 0;c.$validate()});c.$validators.pattern=function(a,b){return c.$isEmpty(b)||v(e)||e.test(b)}}}}},cd=function(){return{restrict:"A",require:"?ngModel",
link:function(a,b,d,c){if(c){var e=-1;d.$observe("maxlength",function(a){a=ea(a);e=ha(a)?-1:a;c.$validate()});c.$validators.maxlength=function(a,b){return 0>e||c.$isEmpty(b)||b.length<=e}}}}},bd=function(){return{restrict:"A",require:"?ngModel",link:function(a,b,d,c){if(c){var e=0;d.$observe("minlength",function(a){e=ea(a)||0;c.$validate()});c.$validators.minlength=function(a,b){return c.$isEmpty(b)||b.length>=e}}}}};D.angular.bootstrap?D.console&&console.log("WARNING: Tried to load AngularJS more than once."):
(De(),He(fa),fa.module("ngLocale",[],["$provide",function(a){function b(a){a+="";var b=a.indexOf(".");return-1==b?0:a.length-b-1}a.value("$locale",{DATETIME_FORMATS:{AMPMS:["AM","PM"],DAY:"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),ERANAMES:["Before Christ","Anno Domini"],ERAS:["BC","AD"],FIRSTDAYOFWEEK:6,MONTH:"January February March April May June July August September October November December".split(" "),SHORTDAY:"Sun Mon Tue Wed Thu Fri Sat".split(" "),SHORTMONTH:"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
STANDALONEMONTH:"January February March April May June July August September October November December".split(" "),WEEKENDRANGE:[5,6],fullDate:"EEEE, MMMM d, y",longDate:"MMMM d, y",medium:"MMM d, y h:mm:ss a",mediumDate:"MMM d, y",mediumTime:"h:mm:ss a","short":"M/d/yy h:mm a",shortDate:"M/d/yy",shortTime:"h:mm a"},NUMBER_FORMATS:{CURRENCY_SYM:"$",DECIMAL_SEP:".",GROUP_SEP:",",PATTERNS:[{gSize:3,lgSize:3,maxFrac:3,minFrac:0,minInt:1,negPre:"-",negSuf:"",posPre:"",posSuf:""},{gSize:3,lgSize:3,maxFrac:2,
minFrac:2,minInt:1,negPre:"-\u00a4",negSuf:"",posPre:"\u00a4",posSuf:""}]},id:"en-us",localeID:"en_US",pluralCat:function(a,c){var e=a|0,f=c;void 0===f&&(f=Math.min(b(a),3));Math.pow(10,f);return 1==e&&0==f?"one":"other"}})}]),y(function(){ye(D.document,Vc)}))})(window);!window.angular.$$csp().noInlineStyle&&window.angular.element(document.head).prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide:not(.ng-hide-animate){display:none !important;}ng\\:form{display:block;}.ng-animate-shim{visibility:hidden;}.ng-anchor{position:absolute;}</style>');
//# sourceMappingURL=angular.min.js.map
/*
 AngularJS v1.7.2
 (c) 2010-2018 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(S,m){'use strict';function Ea(a,b,c){if(!a)throw Pa("areq",b||"?",c||"required");return a}function Fa(a,b){if(!a&&!b)return"";if(!a)return b;if(!b)return a;V(a)&&(a=a.join(" "));V(b)&&(b=b.join(" "));return a+" "+b}function Qa(a){var b={};a&&(a.to||a.from)&&(b.to=a.to,b.from=a.from);return b}function W(a,b,c){var d="";a=V(a)?a:a&&B(a)&&a.length?a.split(/\s+/):[];t(a,function(a,e){a&&0<a.length&&(d+=0<e?" ":"",d+=c?b+a:a+b)});return d}function Ga(a){if(a instanceof z)switch(a.length){case 0:return a;
case 1:if(1===a[0].nodeType)return a;break;default:return z(ua(a))}if(1===a.nodeType)return z(a)}function ua(a){if(!a[0])return a;for(var b=0;b<a.length;b++){var c=a[b];if(1===c.nodeType)return c}}function Ra(a,b,c){t(b,function(b){a.addClass(b,c)})}function Sa(a,b,c){t(b,function(b){a.removeClass(b,c)})}function X(a){return function(b,c){c.addClass&&(Ra(a,b,c.addClass),c.addClass=null);c.removeClass&&(Sa(a,b,c.removeClass),c.removeClass=null)}}function oa(a){a=a||{};if(!a.$$prepared){var b=a.domOperation||
O;a.domOperation=function(){a.$$domOperationFired=!0;b();b=O};a.$$prepared=!0}return a}function ha(a,b){Ha(a,b);Ia(a,b)}function Ha(a,b){b.from&&(a.css(b.from),b.from=null)}function Ia(a,b){b.to&&(a.css(b.to),b.to=null)}function T(a,b,c){var d=b.options||{};c=c.options||{};var g=(d.addClass||"")+" "+(c.addClass||""),e=(d.removeClass||"")+" "+(c.removeClass||"");a=Ta(a.attr("class"),g,e);c.preparationClasses&&(d.preparationClasses=ca(c.preparationClasses,d.preparationClasses),delete c.preparationClasses);
g=d.domOperation!==O?d.domOperation:null;va(d,c);g&&(d.domOperation=g);d.addClass=a.addClass?a.addClass:null;d.removeClass=a.removeClass?a.removeClass:null;b.addClass=d.addClass;b.removeClass=d.removeClass;return d}function Ta(a,b,c){function d(a){B(a)&&(a=a.split(" "));var b={};t(a,function(a){a.length&&(b[a]=!0)});return b}var g={};a=d(a);b=d(b);t(b,function(a,b){g[b]=1});c=d(c);t(c,function(a,b){g[b]=1===g[b]?null:-1});var e={addClass:"",removeClass:""};t(g,function(b,c){var d,g;1===b?(d="addClass",
g=!a[c]||a[c+"-remove"]):-1===b&&(d="removeClass",g=a[c]||a[c+"-add"]);g&&(e[d].length&&(e[d]+=" "),e[d]+=c)});return e}function I(a){return a instanceof z?a[0]:a}function Ua(a,b,c){var d="";b&&(d=W(b,"ng-",!0));c.addClass&&(d=ca(d,W(c.addClass,"-add")));c.removeClass&&(d=ca(d,W(c.removeClass,"-remove")));d.length&&(c.preparationClasses=d,a.addClass(d))}function pa(a,b){var c=b?"-"+b+"s":"";ka(a,[la,c]);return[la,c]}function wa(a,b){var c=b?"paused":"",d=Y+"PlayState";ka(a,[d,c]);return[d,c]}function ka(a,
b){a.style[b[0]]=b[1]}function ca(a,b){return a?b?a+" "+b:a:b}function Ja(a,b,c){var d=Object.create(null),g=a.getComputedStyle(b)||{};t(c,function(a,b){var c=g[a];if(c){var N=c.charAt(0);if("-"===N||"+"===N||0<=N)c=Va(c);0===c&&(c=null);d[b]=c}});return d}function Va(a){var b=0;a=a.split(/\s*,\s*/);t(a,function(a){"s"===a.charAt(a.length-1)&&(a=a.substring(0,a.length-1));a=parseFloat(a)||0;b=b?Math.max(a,b):a});return b}function xa(a){return 0===a||null!=a}function Ka(a,b){var c=Q,d=a+"s";b?c+="Duration":
d+=" linear all";return[c,d]}function La(){var a=Object.create(null);return{flush:function(){a=Object.create(null)},count:function(b){return(b=a[b])?b.total:0},get:function(b){return(b=a[b])&&b.value},put:function(b,c){a[b]?a[b].total++:a[b]={total:1,value:c}}}}function Ma(a,b,c){t(c,function(c){a[c]=ya(a[c])?a[c]:b.style.getPropertyValue(c)})}var Q,za,Y,Aa;void 0===S.ontransitionend&&void 0!==S.onwebkittransitionend?(Q="WebkitTransition",za="webkitTransitionEnd transitionend"):(Q="transition",za=
"transitionend");void 0===S.onanimationend&&void 0!==S.onwebkitanimationend?(Y="WebkitAnimation",Aa="webkitAnimationEnd animationend"):(Y="animation",Aa="animationend");var qa=Y+"Delay",Ba=Y+"Duration",la=Q+"Delay",Na=Q+"Duration",Pa=m.$$minErr("ng"),Wa={transitionDuration:Na,transitionDelay:la,transitionProperty:Q+"Property",animationDuration:Ba,animationDelay:qa,animationIterationCount:Y+"IterationCount"},Xa={transitionDuration:Na,transitionDelay:la,animationDuration:Ba,animationDelay:qa},Ca,va,
t,V,ya,Z,Da,ra,B,P,z,O;m.module("ngAnimate",[],function(){O=m.noop;Ca=m.copy;va=m.extend;z=m.element;t=m.forEach;V=m.isArray;B=m.isString;ra=m.isObject;P=m.isUndefined;ya=m.isDefined;Da=m.isFunction;Z=m.isElement}).info({angularVersion:"1.7.2"}).directive("ngAnimateSwap",["$animate",function(a){return{restrict:"A",transclude:"element",terminal:!0,priority:600,link:function(b,c,d,g,e){var r,G;b.$watchCollection(d.ngAnimateSwap||d["for"],function(b){r&&a.leave(r);G&&(G.$destroy(),G=null);(b||0===b)&&
e(function(b,d){r=b;G=d;a.enter(b,null,c)})})}}}]).directive("ngAnimateChildren",["$interpolate",function(a){return{link:function(b,c,d){function g(a){c.data("$$ngAnimateChildren","on"===a||"true"===a)}var e=d.ngAnimateChildren;B(e)&&0===e.length?c.data("$$ngAnimateChildren",!0):(g(a(e)(b)),d.$observe("ngAnimateChildren",g))}}}]).factory("$$rAFScheduler",["$$rAF",function(a){function b(a){d=d.concat(a);c()}function c(){if(d.length){for(var b=d.shift(),r=0;r<b.length;r++)b[r]();g||a(function(){g||
c()})}}var d,g;d=b.queue=[];b.waitUntilQuiet=function(b){g&&g();g=a(function(){g=null;b();c()})};return b}]).provider("$$animateQueue",["$animateProvider",function(a){function b(a){if(!a)return null;a=a.split(" ");var b=Object.create(null);t(a,function(a){b[a]=!0});return b}function c(a,c){if(a&&c){var d=b(c);return a.split(" ").some(function(a){return d[a]})}}function d(a,b,c){return e[a].some(function(a){return a(b,c)})}function g(a,b){var c=0<(a.addClass||"").length,d=0<(a.removeClass||"").length;
return b?c&&d:c||d}var e=this.rules={skip:[],cancel:[],join:[]};e.join.push(function(a,b){return!a.structural&&g(a)});e.skip.push(function(a,b){return!a.structural&&!g(a)});e.skip.push(function(a,b){return"leave"===b.event&&a.structural});e.skip.push(function(a,b){return b.structural&&2===b.state&&!a.structural});e.cancel.push(function(a,b){return b.structural&&a.structural});e.cancel.push(function(a,b){return 2===b.state&&a.structural});e.cancel.push(function(a,b){if(b.structural)return!1;var d=
a.addClass,g=a.removeClass,e=b.addClass,sa=b.removeClass;return P(d)&&P(g)||P(e)&&P(sa)?!1:c(d,sa)||c(g,e)});this.$get=["$$rAF","$rootScope","$rootElement","$document","$$Map","$$animation","$$AnimateRunner","$templateRequest","$$jqLite","$$forceReflow","$$isDocumentHidden",function(b,c,e,l,J,sa,da,v,E,h,L){function x(){var a=!1;return function(b){a?b():c.$$postDigest(function(){a=!0;b()})}}function C(a,b,c){var f=[],d=k[c];d&&t(d,function(d){u.call(d.node,b)?f.push(d.callback):"leave"===c&&u.call(d.node,
a)&&f.push(d.callback)});return f}function H(a,b,c){var f=ua(b);return a.filter(function(a){return!(a.node===f&&(!c||a.callback===c))})}function p(a,k,w){function p(a,c,f,d){N(function(){var a=C(na,q,c);a.length?b(function(){t(a,function(a){a(e,f,d)});"close"!==f||q.parentNode||ba.off(q)}):"close"!==f||q.parentNode||ba.off(q)});a.progress(c,f,d)}function H(a){var b=e,c=h;c.preparationClasses&&(b.removeClass(c.preparationClasses),c.preparationClasses=null);c.activeClasses&&(b.removeClass(c.activeClasses),
c.activeClasses=null);Oa(e,h);ha(e,h);h.domOperation();l.complete(!a)}var h=Ca(w),e=Ga(a),q=I(e),na=q&&q.parentNode,h=oa(h),l=new da,N=x();V(h.addClass)&&(h.addClass=h.addClass.join(" "));h.addClass&&!B(h.addClass)&&(h.addClass=null);V(h.removeClass)&&(h.removeClass=h.removeClass.join(" "));h.removeClass&&!B(h.removeClass)&&(h.removeClass=null);h.from&&!ra(h.from)&&(h.from=null);h.to&&!ra(h.to)&&(h.to=null);if(!(f&&q&&Ya(q,k,w)&&D(q,h)))return H(),l;var v=0<=["enter","move","leave"].indexOf(k),u=
L(),J=u||ga.get(q);w=!J&&y.get(q)||{};var E=!!w.state;J||E&&1===w.state||(J=!K(q,na,k));if(J)return u&&p(l,k,"start"),H(),u&&p(l,k,"close"),l;v&&ta(q);u={structural:v,element:e,event:k,addClass:h.addClass,removeClass:h.removeClass,close:H,options:h,runner:l};if(E){if(d("skip",u,w)){if(2===w.state)return H(),l;T(e,w,u);return w.runner}if(d("cancel",u,w))if(2===w.state)w.runner.end();else if(w.structural)w.close();else return T(e,w,u),w.runner;else if(d("join",u,w))if(2===w.state)T(e,u,{});else return Ua(e,
v?k:null,h),k=u.event=w.event,h=T(e,w,u),w.runner}else T(e,u,{});(E=u.structural)||(E="animate"===u.event&&0<Object.keys(u.options.to||{}).length||g(u));if(!E)return H(),n(q),l;var m=(w.counter||0)+1;u.counter=m;F(q,1,u);c.$$postDigest(function(){e=Ga(a);var b=y.get(q),c=!b,b=b||{},f=0<(e.parent()||[]).length&&("animate"===b.event||b.structural||g(b));if(c||b.counter!==m||!f){c&&(Oa(e,h),ha(e,h));if(c||v&&b.event!==k)h.domOperation(),l.end();f||n(q)}else k=!b.structural&&g(b,!0)?"setClass":b.event,
F(q,2),b=sa(e,k,b.options),l.setHost(b),p(l,k,"start",{}),b.done(function(a){H(!a);(a=y.get(q))&&a.counter===m&&n(q);p(l,k,"close",{})})});return l}function ta(a){a=a.querySelectorAll("[data-ng-animate]");t(a,function(a){var b=parseInt(a.getAttribute("data-ng-animate"),10),c=y.get(a);if(c)switch(b){case 2:c.runner.end();case 1:y.delete(a)}})}function n(a){a.removeAttribute("data-ng-animate");y.delete(a)}function K(a,b,c){c=l[0].body;var f=I(e),d=a===c||"HTML"===a.nodeName,k=a===f,h=!1,q=ga.get(a),
C;for((a=z.data(a,"$ngAnimatePin"))&&(b=I(a));b;){k||(k=b===f);if(1!==b.nodeType)break;a=y.get(b)||{};if(!h){var p=ga.get(b);if(!0===p&&!1!==q){q=!0;break}else!1===p&&(q=!1);h=a.structural}if(P(C)||!0===C)a=z.data(b,"$$ngAnimateChildren"),ya(a)&&(C=a);if(h&&!1===C)break;d||(d=b===c);if(d&&k)break;if(!k&&(a=z.data(b,"$ngAnimatePin"))){b=I(a);continue}b=b.parentNode}return(!h||C)&&!0!==q&&k&&d}function F(a,b,c){c=c||{};c.state=b;a.setAttribute("data-ng-animate",b);c=(b=y.get(a))?va(b,c):c;y.set(a,c)}
var y=new J,ga=new J,f=null,q=c.$watch(function(){return 0===v.totalPendingRequests},function(a){a&&(q(),c.$$postDigest(function(){c.$$postDigest(function(){null===f&&(f=!0)})}))}),k=Object.create(null);J=a.customFilter();var na=a.classNameFilter();h=function(){return!0};var Ya=J||h,D=na?function(a,b){var c=[a.getAttribute("class"),b.addClass,b.removeClass].join(" ");return na.test(c)}:h,Oa=X(E),u=S.Node.prototype.contains||function(a){return this===a||!!(this.compareDocumentPosition(a)&16)},ba={on:function(a,
b,c){var f=ua(b);k[a]=k[a]||[];k[a].push({node:f,callback:c});z(b).on("$destroy",function(){y.get(f)||ba.off(a,b,c)})},off:function(a,b,c){if(1!==arguments.length||B(arguments[0])){var f=k[a];f&&(k[a]=1===arguments.length?null:H(f,b,c))}else for(f in b=arguments[0],k)k[f]=H(k[f],b)},pin:function(a,b){Ea(Z(a),"element","not an element");Ea(Z(b),"parentElement","not an element");a.data("$ngAnimatePin",b)},push:function(a,b,c,f){c=c||{};c.domOperation=f;return p(a,b,c)},enabled:function(a,b){var c=arguments.length;
if(0===c)b=!!f;else if(Z(a)){var d=I(a);1===c?b=!ga.get(d):ga.set(d,!b)}else b=f=!!a;return b}};return ba}]}]).provider("$$animation",["$animateProvider",function(a){var b=this.drivers=[];this.$get=["$$jqLite","$rootScope","$injector","$$AnimateRunner","$$Map","$$rAFScheduler",function(a,d,g,e,r,G){function N(a){function b(a){if(a.processed)return a;a.processed=!0;var d=a.domNode,e=d.parentNode;h.set(d,a);for(var p;e;){if(p=h.get(e)){p.processed||(p=b(p));break}e=e.parentNode}(p||c).children.push(a);
return a}var c={children:[]},d,h=new r;for(d=0;d<a.length;d++){var e=a[d];h.set(e.domNode,a[d]={domNode:e.domNode,fn:e.fn,children:[]})}for(d=0;d<a.length;d++)b(a[d]);return function(a){var b=[],c=[],d;for(d=0;d<a.children.length;d++)c.push(a.children[d]);a=c.length;var h=0,e=[];for(d=0;d<c.length;d++){var g=c[d];0>=a&&(a=h,h=0,b.push(e),e=[]);e.push(g.fn);g.children.forEach(function(a){h++;c.push(a)});a--}e.length&&b.push(e);return b}(c)}var l=[],J=X(a);return function(r,m,v){function E(a){a=a.hasAttribute("ng-animate-ref")?
[a]:a.querySelectorAll("[ng-animate-ref]");var b=[];t(a,function(a){var c=a.getAttribute("ng-animate-ref");c&&c.length&&b.push(a)});return b}function h(a){var b=[],c={};t(a,function(a,d){var k=I(a.element),h=0<=["enter","move"].indexOf(a.event),k=a.structural?E(k):[];if(k.length){var e=h?"to":"from";t(k,function(a){var b=a.getAttribute("ng-animate-ref");c[b]=c[b]||{};c[b][e]={animationID:d,element:z(a)}})}else b.push(a)});var d={},h={};t(c,function(c,e){var g=c.from,q=c.to;if(g&&q){var C=a[g.animationID],
p=a[q.animationID],y=g.animationID.toString();if(!h[y]){var n=h[y]={structural:!0,beforeStart:function(){C.beforeStart();p.beforeStart()},close:function(){C.close();p.close()},classes:L(C.classes,p.classes),from:C,to:p,anchors:[]};n.classes.length?b.push(n):(b.push(C),b.push(p))}h[y].anchors.push({out:g.element,"in":q.element})}else g=g?g.animationID:q.animationID,q=g.toString(),d[q]||(d[q]=!0,b.push(a[g]))});return b}function L(a,b){a=a.split(" ");b=b.split(" ");for(var c=[],d=0;d<a.length;d++){var h=
a[d];if("ng-"!==h.substring(0,3))for(var e=0;e<b.length;e++)if(h===b[e]){c.push(h);break}}return c.join(" ")}function x(a){for(var c=b.length-1;0<=c;c--){var d=g.get(b[c])(a);if(d)return d}}function C(a,b){function c(a){(a=a.data("$$animationRunner"))&&a.setHost(b)}a.from&&a.to?(c(a.from.element),c(a.to.element)):c(a.element)}function H(){var a=r.data("$$animationRunner");!a||"leave"===m&&v.$$domOperationFired||a.end()}function p(b){r.off("$destroy",H);r.removeData("$$animationRunner");J(r,v);ha(r,
v);v.domOperation();F&&a.removeClass(r,F);r.removeClass("ng-animate");n.complete(!b)}v=oa(v);var ta=0<=["enter","move","leave"].indexOf(m),n=new e({end:function(){p()},cancel:function(){p(!0)}});if(!b.length)return p(),n;r.data("$$animationRunner",n);var K=Fa(r.attr("class"),Fa(v.addClass,v.removeClass)),F=v.tempClasses;F&&(K+=" "+F,v.tempClasses=null);var y;ta&&(y="ng-"+m+"-prepare",a.addClass(r,y));l.push({element:r,classes:K,event:m,structural:ta,options:v,beforeStart:function(){r.addClass("ng-animate");
F&&a.addClass(r,F);y&&(a.removeClass(r,y),y=null)},close:p});r.on("$destroy",H);if(1<l.length)return n;d.$$postDigest(function(){var a=[];t(l,function(b){b.element.data("$$animationRunner")?a.push(b):b.close()});l.length=0;var b=h(a),c=[];t(b,function(a){c.push({domNode:I(a.from?a.from.element:a.element),fn:function(){a.beforeStart();var b,c=a.close;if((a.anchors?a.from.element||a.to.element:a.element).data("$$animationRunner")){var d=x(a);d&&(b=d.start)}b?(b=b(),b.done(function(a){c(!a)}),C(a,b)):
c()}})});G(N(c))});return n}}]}]).provider("$animateCss",["$animateProvider",function(a){var b=La(),c=La();this.$get=["$window","$$jqLite","$$AnimateRunner","$timeout","$$forceReflow","$sniffer","$$rAFScheduler","$$animateQueue",function(a,g,e,r,G,N,l,J){function m(a,b){var c=a.parentNode;return(c.$$ngAnimateParentKey||(c.$$ngAnimateParentKey=++L))+"-"+a.getAttribute("class")+"-"+b}function da(h,e,p,r){var n;0<b.count(p)&&(n=c.get(p),n||(e=W(e,"-stagger"),g.addClass(h,e),n=Ja(a,h,r),n.animationDuration=
Math.max(n.animationDuration,0),n.transitionDuration=Math.max(n.transitionDuration,0),g.removeClass(h,e),c.put(p,n)));return n||{}}function v(a){x.push(a);l.waitUntilQuiet(function(){b.flush();c.flush();for(var a=G(),d=0;d<x.length;d++)x[d](a);x.length=0})}function E(c,h,e){h=b.get(e);h||(h=Ja(a,c,Wa),"infinite"===h.animationIterationCount&&(h.animationIterationCount=1));b.put(e,h);c=h;e=c.animationDelay;h=c.transitionDelay;c.maxDelay=e&&h?Math.max(e,h):e||h;c.maxDuration=Math.max(c.animationDuration*
c.animationIterationCount,c.transitionDuration);return c}var h=X(g),L=0,x=[];return function(a,c){function d(){n()}function l(){n(!0)}function n(b){if(!(L||ba&&u)){L=!0;u=!1;f.$$skipPreparationClasses||g.removeClass(a,fa);g.removeClass(a,ca);wa(k,!1);pa(k,!1);t(x,function(a){k.style[a[0]]=""});h(a,f);ha(a,f);Object.keys(q).length&&t(q,function(a,b){a?k.style.setProperty(b,a):k.style.removeProperty(b)});if(f.onDone)f.onDone();ea&&ea.length&&a.off(ea.join(" "),y);var c=a.data("$$animateCss");c&&(r.cancel(c[0].timer),
a.removeData("$$animateCss"));z&&z.complete(!b)}}function K(a){s.blockTransition&&pa(k,a);s.blockKeyframeAnimation&&wa(k,!!a)}function F(){z=new e({end:d,cancel:l});v(O);n();return{$$willAnimate:!1,start:function(){return z},end:d}}function y(a){a.stopPropagation();var b=a.originalEvent||a;b.target===k&&(a=b.$manualTimeStamp||Date.now(),b=parseFloat(b.elapsedTime.toFixed(3)),Math.max(a-T,0)>=P&&b>=M&&(ba=!0,n()))}function ga(){function b(){if(!L){K(!1);t(x,function(a){k.style[a[0]]=a[1]});h(a,f);
g.addClass(a,ca);if(s.recalculateTimingStyles){ma=k.getAttribute("class")+" "+fa;ja=m(k,ma);A=E(k,ma,ja);$=A.maxDelay;w=Math.max($,0);M=A.maxDuration;if(0===M){n();return}s.hasTransitions=0<A.transitionDuration;s.hasAnimations=0<A.animationDuration}s.applyAnimationDelay&&($="boolean"!==typeof f.delay&&xa(f.delay)?parseFloat(f.delay):$,w=Math.max($,0),A.animationDelay=$,aa=[qa,$+"s"],x.push(aa),k.style[aa[0]]=aa[1]);P=1E3*w;S=1E3*M;if(f.easing){var d,e=f.easing;s.hasTransitions&&(d=Q+"TimingFunction",
x.push([d,e]),k.style[d]=e);s.hasAnimations&&(d=Y+"TimingFunction",x.push([d,e]),k.style[d]=e)}A.transitionDuration&&ea.push(za);A.animationDuration&&ea.push(Aa);T=Date.now();var l=P+1.5*S;d=T+l;var e=a.data("$$animateCss")||[],p=!0;if(e.length){var F=e[0];(p=d>F.expectedEndTime)?r.cancel(F.timer):e.push(n)}p&&(l=r(c,l,!1),e[0]={timer:l,expectedEndTime:d},e.push(n),a.data("$$animateCss",e));if(ea.length)a.on(ea.join(" "),y);f.to&&(f.cleanupStyles&&Ma(q,k,Object.keys(f.to)),Ia(a,f))}}function c(){var b=
a.data("$$animateCss");if(b){for(var d=1;d<b.length;d++)b[d]();a.removeData("$$animateCss")}}if(!L)if(k.parentNode){var d=function(a){if(ba)u&&a&&(u=!1,n());else if(u=!a,A.animationDuration)if(a=wa(k,u),u)x.push(a);else{var b=x,c=b.indexOf(a);0<=a&&b.splice(c,1)}},e=0<Z&&(A.transitionDuration&&0===U.transitionDuration||A.animationDuration&&0===U.animationDuration)&&Math.max(U.animationDelay,U.transitionDelay);e?r(b,Math.floor(e*Z*1E3),!1):b();B.resume=function(){d(!0)};B.pause=function(){d(!1)}}else n()}
var f=c||{};f.$$prepared||(f=oa(Ca(f)));var q={},k=I(a);if(!k||!k.parentNode||!J.enabled())return F();var x=[],G=a.attr("class"),D=Qa(f),L,u,ba,z,B,w,P,M,S,T,ea=[];if(0===f.duration||!N.animations&&!N.transitions)return F();var ia=f.event&&V(f.event)?f.event.join(" "):f.event,X="",R="";ia&&f.structural?X=W(ia,"ng-",!0):ia&&(X=ia);f.addClass&&(R+=W(f.addClass,"-add"));f.removeClass&&(R.length&&(R+=" "),R+=W(f.removeClass,"-remove"));f.applyClassesEarly&&R.length&&h(a,f);var fa=[X,R].join(" ").trim(),
ma=G+" "+fa,ca=W(fa,"-active"),G=D.to&&0<Object.keys(D.to).length;if(!(0<(f.keyframeStyle||"").length||G||fa))return F();var ja,U;0<f.stagger?(D=parseFloat(f.stagger),U={transitionDelay:D,animationDelay:D,transitionDuration:0,animationDuration:0}):(ja=m(k,ma),U=da(k,fa,ja,Xa));f.$$skipPreparationClasses||g.addClass(a,fa);f.transitionStyle&&(D=[Q,f.transitionStyle],ka(k,D),x.push(D));0<=f.duration&&(D=0<k.style[Q].length,D=Ka(f.duration,D),ka(k,D),x.push(D));f.keyframeStyle&&(D=[Y,f.keyframeStyle],
ka(k,D),x.push(D));var Z=U?0<=f.staggerIndex?f.staggerIndex:b.count(ja):0;(ia=0===Z)&&!f.skipBlocking&&pa(k,9999);var A=E(k,ma,ja),$=A.maxDelay;w=Math.max($,0);M=A.maxDuration;var s={};s.hasTransitions=0<A.transitionDuration;s.hasAnimations=0<A.animationDuration;s.hasTransitionAll=s.hasTransitions&&"all"===A.transitionProperty;s.applyTransitionDuration=G&&(s.hasTransitions&&!s.hasTransitionAll||s.hasAnimations&&!s.hasTransitions);s.applyAnimationDuration=f.duration&&s.hasAnimations;s.applyTransitionDelay=
xa(f.delay)&&(s.applyTransitionDuration||s.hasTransitions);s.applyAnimationDelay=xa(f.delay)&&s.hasAnimations;s.recalculateTimingStyles=0<R.length;if(s.applyTransitionDuration||s.applyAnimationDuration)M=f.duration?parseFloat(f.duration):M,s.applyTransitionDuration&&(s.hasTransitions=!0,A.transitionDuration=M,D=0<k.style[Q+"Property"].length,x.push(Ka(M,D))),s.applyAnimationDuration&&(s.hasAnimations=!0,A.animationDuration=M,x.push([Ba,M+"s"]));if(0===M&&!s.recalculateTimingStyles)return F();if(null!=
f.delay){var aa;"boolean"!==typeof f.delay&&(aa=parseFloat(f.delay),w=Math.max(aa,0));s.applyTransitionDelay&&x.push([la,aa+"s"]);s.applyAnimationDelay&&x.push([qa,aa+"s"])}null==f.duration&&0<A.transitionDuration&&(s.recalculateTimingStyles=s.recalculateTimingStyles||ia);P=1E3*w;S=1E3*M;f.skipBlocking||(s.blockTransition=0<A.transitionDuration,s.blockKeyframeAnimation=0<A.animationDuration&&0<U.animationDelay&&0===U.animationDuration);f.from&&(f.cleanupStyles&&Ma(q,k,Object.keys(f.from)),Ha(a,f));
s.blockTransition||s.blockKeyframeAnimation?K(M):f.skipBlocking||pa(k,!1);return{$$willAnimate:!0,end:d,start:function(){if(!L)return B={end:d,cancel:l,resume:null,pause:null},z=new e(B),v(ga),z}}}}]}]).provider("$$animateCssDriver",["$$animationProvider",function(a){a.drivers.push("$$animateCssDriver");this.$get=["$animateCss","$rootScope","$$AnimateRunner","$rootElement","$sniffer","$$jqLite","$document",function(a,c,d,g,e,r,G){function N(a){return a.replace(/\bng-\S+\b/g,"")}function l(a,b){B(a)&&
(a=a.split(" "));B(b)&&(b=b.split(" "));return a.filter(function(a){return-1===b.indexOf(a)}).join(" ")}function J(c,e,g){function r(a){var b={},c=I(a).getBoundingClientRect();t(["width","height","top","left"],function(a){var d=c[a];switch(a){case "top":d+=v.scrollTop;break;case "left":d+=v.scrollLeft}b[a]=Math.floor(d)+"px"});return b}function G(){var c=N(g.attr("class")||""),d=l(c,n),c=l(n,c),d=a(m,{to:r(g),addClass:"ng-anchor-in "+d,removeClass:"ng-anchor-out "+c,delay:!0});return d.$$willAnimate?
d:null}function p(){m.remove();e.removeClass("ng-animate-shim");g.removeClass("ng-animate-shim")}var m=z(I(e).cloneNode(!0)),n=N(m.attr("class")||"");e.addClass("ng-animate-shim");g.addClass("ng-animate-shim");m.addClass("ng-anchor");E.append(m);var K;c=function(){var c=a(m,{addClass:"ng-anchor-out",delay:!0,from:r(e)});return c.$$willAnimate?c:null}();if(!c&&(K=G(),!K))return p();var F=c||K;return{start:function(){function a(){c&&c.end()}var b,c=F.start();c.done(function(){c=null;if(!K&&(K=G()))return c=
K.start(),c.done(function(){c=null;p();b.complete()}),c;p();b.complete()});return b=new d({end:a,cancel:a})}}}function m(a,b,c,e){var g=da(a,O),l=da(b,O),r=[];t(e,function(a){(a=J(c,a.out,a["in"]))&&r.push(a)});if(g||l||0!==r.length)return{start:function(){function a(){t(b,function(a){a.end()})}var b=[];g&&b.push(g.start());l&&b.push(l.start());t(r,function(a){b.push(a.start())});var c=new d({end:a,cancel:a});d.all(b,function(a){c.complete(a)});return c}}}function da(c){var d=c.element,e=c.options||
{};c.structural&&(e.event=c.event,e.structural=!0,e.applyClassesEarly=!0,"leave"===c.event&&(e.onDone=e.domOperation));e.preparationClasses&&(e.event=ca(e.event,e.preparationClasses));c=a(d,e);return c.$$willAnimate?c:null}if(!e.animations&&!e.transitions)return O;var v=G[0].body;c=I(g);var E=z(c.parentNode&&11===c.parentNode.nodeType||v.contains(c)?c:v);return function(a){return a.from&&a.to?m(a.from,a.to,a.classes,a.anchors):da(a)}}]}]).provider("$$animateJs",["$animateProvider",function(a){this.$get=
["$injector","$$AnimateRunner","$$jqLite",function(b,c,d){function g(c){c=V(c)?c:c.split(" ");for(var d=[],e={},g=0;g<c.length;g++){var m=c[g],t=a.$$registeredAnimations[m];t&&!e[m]&&(d.push(b.get(t)),e[m]=!0)}return d}var e=X(d);return function(a,b,d,l){function m(){l.domOperation();e(a,l)}function z(a,b,d,e,f){switch(d){case "animate":b=[b,e.from,e.to,f];break;case "setClass":b=[b,h,L,f];break;case "addClass":b=[b,h,f];break;case "removeClass":b=[b,L,f];break;default:b=[b,f]}b.push(e);if(a=a.apply(a,
b))if(Da(a.start)&&(a=a.start()),a instanceof c)a.done(f);else if(Da(a))return a;return O}function B(a,b,d,e,f){var g=[];t(e,function(e){var h=e[f];h&&g.push(function(){var e,f,g=!1,k=function(a){g||(g=!0,(f||O)(a),e.complete(!a))};e=new c({end:function(){k()},cancel:function(){k(!0)}});f=z(h,a,b,d,function(a){k(!1===a)});return e})});return g}function v(a,b,d,e,f){var g=B(a,b,d,e,f);if(0===g.length){var h,l;"beforeSetClass"===f?(h=B(a,"removeClass",d,e,"beforeRemoveClass"),l=B(a,"addClass",d,e,"beforeAddClass")):
"setClass"===f&&(h=B(a,"removeClass",d,e,"removeClass"),l=B(a,"addClass",d,e,"addClass"));h&&(g=g.concat(h));l&&(g=g.concat(l))}if(0!==g.length)return function(a){var b=[];g.length&&t(g,function(a){b.push(a())});b.length?c.all(b,a):a();return function(a){t(b,function(b){a?b.cancel():b.end()})}}}var E=!1;3===arguments.length&&ra(d)&&(l=d,d=null);l=oa(l);d||(d=a.attr("class")||"",l.addClass&&(d+=" "+l.addClass),l.removeClass&&(d+=" "+l.removeClass));var h=l.addClass,L=l.removeClass,x=g(d),C,H;if(x.length){var p,
I;"leave"===b?(I="leave",p="afterLeave"):(I="before"+b.charAt(0).toUpperCase()+b.substr(1),p=b);"enter"!==b&&"move"!==b&&(C=v(a,b,l,x,I));H=v(a,b,l,x,p)}if(C||H){var n;return{$$willAnimate:!0,end:function(){n?n.end():(E=!0,m(),ha(a,l),n=new c,n.complete(!0));return n},start:function(){function b(c){E=!0;m();ha(a,l);n.complete(c)}if(n)return n;n=new c;var d,e=[];C&&e.push(function(a){d=C(a)});e.length?e.push(function(a){m();a(!0)}):m();H&&e.push(function(a){d=H(a)});n.setHost({end:function(){E||((d||
O)(void 0),b(void 0))},cancel:function(){E||((d||O)(!0),b(!0))}});c.chain(e,b);return n}}}}}]}]).provider("$$animateJsDriver",["$$animationProvider",function(a){a.drivers.push("$$animateJsDriver");this.$get=["$$animateJs","$$AnimateRunner",function(a,c){function d(c){return a(c.element,c.event,c.classes,c.options)}return function(a){if(a.from&&a.to){var b=d(a.from),m=d(a.to);if(b||m)return{start:function(){function a(){return function(){t(d,function(a){a.end()})}}var d=[];b&&d.push(b.start());m&&
d.push(m.start());c.all(d,function(a){g.complete(a)});var g=new c({end:a(),cancel:a()});return g}}}else return d(a)}}]}])})(window,window.angular);
//# sourceMappingURL=angular-animate.min.js.map
/*
 AngularJS v1.7.2
 (c) 2010-2018 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(s,p){'use strict';var e="BUTTON A INPUT TEXTAREA SELECT DETAILS SUMMARY".split(" "),l=function(a,b){if(-1!==b.indexOf(a[0].nodeName))return!0};p.module("ngAria",["ng"]).info({angularVersion:"1.7.2"}).provider("$aria",function(){function a(a,g,n,k){return function(c,f,d){if(!d.hasOwnProperty("ngAriaDisable")){var h=d.$normalize(g);!b[h]||l(f,n)||d[h]||c.$watch(d[a],function(a){a=k?!a:!!a;f.attr(g,a)})}}}var b={ariaHidden:!0,ariaChecked:!0,ariaReadonly:!0,ariaDisabled:!0,ariaRequired:!0,ariaInvalid:!0,
ariaValue:!0,tabindex:!0,bindKeydown:!0,bindRoleForClick:!0};this.config=function(a){b=p.extend(b,a)};this.$get=function(){return{config:function(a){return b[a]},$$watchExpr:a}}}).directive("ngShow",["$aria",function(a){return a.$$watchExpr("ngShow","aria-hidden",[],!0)}]).directive("ngHide",["$aria",function(a){return a.$$watchExpr("ngHide","aria-hidden",[],!1)}]).directive("ngValue",["$aria",function(a){return a.$$watchExpr("ngValue","aria-checked",e,!1)}]).directive("ngChecked",["$aria",function(a){return a.$$watchExpr("ngChecked",
"aria-checked",e,!1)}]).directive("ngReadonly",["$aria",function(a){return a.$$watchExpr("ngReadonly","aria-readonly",e,!1)}]).directive("ngRequired",["$aria",function(a){return a.$$watchExpr("ngRequired","aria-required",e,!1)}]).directive("ngModel",["$aria",function(a){function b(b,k,c,f){return a.config(k)&&!c.attr(b)&&(f||!l(c,e))&&("hidden"!==c.attr("type")||"INPUT"!==c[0].nodeName)}function m(a,b){return!b.attr("role")&&b.attr("type")===a&&!l(b,e)}function g(a,b){var c=a.type,f=a.role;return"checkbox"===
(c||f)||"menuitemcheckbox"===f?"checkbox":"radio"===(c||f)||"menuitemradio"===f?"radio":"range"===c||"progressbar"===f||"slider"===f?"range":""}return{restrict:"A",require:"ngModel",priority:200,compile:function(e,k){if(!k.hasOwnProperty("ngAriaDisable")){var c=g(k,e);return{post:function(f,d,h,e){function g(){return e.$modelValue}function k(a){d.attr("aria-checked",h.value==e.$viewValue)}function l(){d.attr("aria-checked",!e.$isEmpty(e.$viewValue))}var n=b("tabindex","tabindex",d,!1);switch(c){case "radio":case "checkbox":m(c,
d)&&d.attr("role",c);b("aria-checked","ariaChecked",d,!1)&&f.$watch(g,"radio"===c?k:l);n&&d.attr("tabindex",0);break;case "range":m(c,d)&&d.attr("role","slider");if(a.config("ariaValue")){var p=!d.attr("aria-valuemin")&&(h.hasOwnProperty("min")||h.hasOwnProperty("ngMin")),q=!d.attr("aria-valuemax")&&(h.hasOwnProperty("max")||h.hasOwnProperty("ngMax")),r=!d.attr("aria-valuenow");p&&h.$observe("min",function(a){d.attr("aria-valuemin",a)});q&&h.$observe("max",function(a){d.attr("aria-valuemax",a)});
r&&f.$watch(g,function(a){d.attr("aria-valuenow",a)})}n&&d.attr("tabindex",0)}!h.hasOwnProperty("ngRequired")&&e.$validators.required&&b("aria-required","ariaRequired",d,!1)&&h.$observe("required",function(){d.attr("aria-required",!!h.required)});b("aria-invalid","ariaInvalid",d,!0)&&f.$watch(function(){return e.$invalid},function(a){d.attr("aria-invalid",!!a)})}}}}}}]).directive("ngDisabled",["$aria",function(a){return a.$$watchExpr("ngDisabled","aria-disabled",e,!1)}]).directive("ngMessages",function(){return{restrict:"A",
require:"?ngMessages",link:function(a,b,e,g){e.hasOwnProperty("ngAriaDisable")||b.attr("aria-live")||b.attr("aria-live","assertive")}}}).directive("ngClick",["$aria","$parse",function(a,b){return{restrict:"A",compile:function(m,g){if(!g.hasOwnProperty("ngAriaDisable")){var n=b(g.ngClick);return function(b,c,f){if(!l(c,e)&&(a.config("bindRoleForClick")&&!c.attr("role")&&c.attr("role","button"),a.config("tabindex")&&!c.attr("tabindex")&&c.attr("tabindex",0),a.config("bindKeydown")&&!f.ngKeydown&&!f.ngKeypress&&
!f.ngKeyup))c.on("keydown",function(a){function c(){n(b,{$event:a})}var e=a.which||a.keyCode;32!==e&&13!==e||b.$apply(c)})}}}}}]).directive("ngDblclick",["$aria",function(a){return function(b,m,g){g.hasOwnProperty("ngAriaDisable")||!a.config("tabindex")||m.attr("tabindex")||l(m,e)||m.attr("tabindex",0)}}])})(window,window.angular);
//# sourceMappingURL=angular-aria.min.js.map
/*!
 * Angular Material Design
 * https://github.com/angular/material
 * @license MIT
 * v1.1.0-rc2
 */
!function(e,t,n){"use strict";!function(){t.module("ngMaterial",["ng","ngAnimate","ngAria","material.core","material.core.gestures","material.core.layout","material.core.theming.palette","material.core.theming","material.core.animate","material.components.autocomplete","material.components.bottomSheet","material.components.backdrop","material.components.button","material.components.card","material.components.checkbox","material.components.chips","material.components.content","material.components.datepicker","material.components.dialog","material.components.divider","material.components.fabActions","material.components.fabShared","material.components.fabSpeedDial","material.components.fabToolbar","material.components.gridList","material.components.fabTrigger","material.components.icon","material.components.input","material.components.list","material.components.menuBar","material.components.menu","material.components.progressCircular","material.components.progressLinear","material.components.radioButton","material.components.select","material.components.showHide","material.components.sidenav","material.components.sticky","material.components.slider","material.components.subheader","material.components.swipe","material.components.switch","material.components.tabs","material.components.toast","material.components.toolbar","material.components.virtualRepeat","material.components.tooltip","material.components.whiteframe"])}(),function(){function e(e,t){if(t.has("$swipe")){var n="You are using the ngTouch module. \nAngular Material already has mobile click, tap, and swipe support... \nngTouch is not supported with Angular Material!";e.warn(n)}}function n(e,t){e.decorator("$$rAF",["$delegate",o]),t.theme("default").primaryPalette("indigo").accentPalette("pink").warnPalette("deep-orange").backgroundPalette("grey")}function o(e){return e.throttle=function(t){var n,o,r,i;return function(){n=arguments,i=this,r=t,o||(o=!0,e(function(){r.apply(i,Array.prototype.slice.call(n)),o=!1}))}},e}t.module("material.core",["ngAnimate","material.core.animate","material.core.layout","material.core.gestures","material.core.theming"]).config(n).run(e),e.$inject=["$log","$injector"],n.$inject=["$provide","$mdThemingProvider"],o.$inject=["$delegate"]}(),function(){function e(){return{restrict:"A",link:n}}function n(e,t,n){var o=n.mdAutoFocus||n.mdAutofocus||n.mdSidenavFocus;e.$watch(o,function(e){t.toggleClass("_md-autofocus",e)})}t.module("material.core").directive("mdAutofocus",e).directive("mdAutoFocus",e).directive("mdSidenavFocus",e)}(),function(){function e(e){function t(e){return n?"webkit"+e.charAt(0).toUpperCase()+e.substring(1):e}var n=/webkit/i.test(e.vendorPrefix);return{KEY_CODE:{COMMA:188,SEMICOLON:186,ENTER:13,ESCAPE:27,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT_ARROW:37,UP_ARROW:38,RIGHT_ARROW:39,DOWN_ARROW:40,TAB:9,BACKSPACE:8,DELETE:46},CSS:{TRANSITIONEND:"transitionend"+(n?" webkitTransitionEnd":""),ANIMATIONEND:"animationend"+(n?" webkitAnimationEnd":""),TRANSFORM:t("transform"),TRANSFORM_ORIGIN:t("transformOrigin"),TRANSITION:t("transition"),TRANSITION_DURATION:t("transitionDuration"),ANIMATION_PLAY_STATE:t("animationPlayState"),ANIMATION_DURATION:t("animationDuration"),ANIMATION_NAME:t("animationName"),ANIMATION_TIMING:t("animationTimingFunction"),ANIMATION_DIRECTION:t("animationDirection")},MEDIA:{xs:"(max-width: 599px)","gt-xs":"(min-width: 600px)",sm:"(min-width: 600px) and (max-width: 959px)","gt-sm":"(min-width: 960px)",md:"(min-width: 960px) and (max-width: 1279px)","gt-md":"(min-width: 1280px)",lg:"(min-width: 1280px) and (max-width: 1919px)","gt-lg":"(min-width: 1920px)",xl:"(min-width: 1920px)",print:"print"},MEDIA_PRIORITY:["xl","gt-lg","lg","gt-md","md","gt-sm","sm","gt-xs","xs","print"]}}t.module("material.core").factory("$mdConstant",e),e.$inject=["$sniffer"]}(),function(){function e(e,n){function o(){return[].concat(v)}function r(){return v.length}function i(e){return v.length&&e>-1&&e<v.length}function a(e){return e?i(u(e)+1):!1}function d(e){return e?i(u(e)-1):!1}function c(e){return i(e)?v[e]:null}function s(e,t){return v.filter(function(n){return n[e]===t})}function l(e,n){return e?(t.isNumber(n)||(n=v.length),v.splice(n,0,e),u(e)):-1}function m(e){p(e)&&v.splice(u(e),1)}function u(e){return v.indexOf(e)}function p(e){return e&&u(e)>-1}function h(){return v.length?v[0]:null}function f(){return v.length?v[v.length-1]:null}function g(e,o,r,a){r=r||b;for(var d=u(o);;){if(!i(d))return null;var c=d+(e?-1:1),s=null;if(i(c)?s=v[c]:n&&(s=e?f():h(),c=u(s)),null===s||c===a)return null;if(r(s))return s;t.isUndefined(a)&&(a=c),d=c}}var b=function(){return!0};e&&!t.isArray(e)&&(e=Array.prototype.slice.call(e)),n=!!n;var v=e||[];return{items:o,count:r,inRange:i,contains:p,indexOf:u,itemAt:c,findBy:s,add:l,remove:m,first:h,last:f,next:t.bind(null,g,!1),previous:t.bind(null,g,!0),hasPrevious:d,hasNext:a}}t.module("material.core").config(["$provide",function(t){t.decorator("$mdUtil",["$delegate",function(t){return t.iterator=e,t}])}])}(),function(){function e(e,n,o){function r(e){var n=u[e];t.isUndefined(n)&&(n=u[e]=i(e));var o=h[n];return t.isUndefined(o)&&(o=a(n)),o}function i(t){return e.MEDIA[t]||("("!==t.charAt(0)?"("+t+")":t)}function a(e){var t=p[e];return t||(t=p[e]=o.matchMedia(e)),t.addListener(d),h[t.media]=!!t.matches}function d(e){n.$evalAsync(function(){h[e.media]=!!e.matches})}function c(e){return p[e]}function s(t,n){for(var o=0;o<e.MEDIA_PRIORITY.length;o++){var r=e.MEDIA_PRIORITY[o];if(p[u[r]].matches){var i=m(t,n+"-"+r);if(t[i])return t[i]}}return t[m(t,n)]}function l(n,o,r){var i=[];return n.forEach(function(n){var a=m(o,n);t.isDefined(o[a])&&i.push(o.$observe(a,t.bind(void 0,r,null)));for(var d in e.MEDIA)a=m(o,n+"-"+d),t.isDefined(o[a])&&i.push(o.$observe(a,t.bind(void 0,r,d)))}),function(){i.forEach(function(e){e()})}}function m(e,t){return f[t]||(f[t]=e.$normalize(t))}var u={},p={},h={},f={};return r.getResponsiveAttribute=s,r.getQuery=c,r.watchResponsiveAttributes=l,r}t.module("material.core").factory("$mdMedia",e),e.$inject=["$mdConstant","$rootScope","$window"]}(),function(){function o(o,i,a,d,c,s,l,m,u){function p(e){return e[0]||e}var h=s.startSymbol(),f=s.endSymbol(),g="{{"===h&&"}}"===f,b=function(e,n,o){var r=!1;if(e&&e.length){var i=u.getComputedStyle(e[0]);r=t.isDefined(i[n])&&(o?i[n]==o:!0)}return r},v={dom:{},now:e.performance?t.bind(e.performance,e.performance.now):Date.now||function(){return(new Date).getTime()},bidi:function(e,n,r,i){function a(e){return e?d(e)?e:e+"px":"0"}function d(e){return String(e).indexOf("px")>-1}var c=!("rtl"==o[0].dir||"rtl"==o[0].body.dir);return 0==arguments.length?c?"ltr":"rtl":void(c&&t.isDefined(r)?t.element(e).css(n,a(r)):!c&&t.isDefined(i)&&t.element(e).css(n,a(i)))},clientRect:function(e,t,n){var o=p(e);t=p(t||o.offsetParent||document.body);var r=o.getBoundingClientRect(),i=n?t.getBoundingClientRect():{left:0,top:0,width:0,height:0};return{left:r.left-i.left,top:r.top-i.top,width:r.width,height:r.height}},offsetRect:function(e,t){return v.clientRect(e,t,!0)},nodesToArray:function(e){e=e||[];for(var t=[],n=0;n<e.length;++n)t.push(e.item(n));return t},scrollTop:function(e){e=t.element(e||o[0].body);var r=e[0]==o[0].body?o[0].body:n,i=r?r.scrollTop+r.parentElement.scrollTop:0;return i||Math.abs(e[0].getBoundingClientRect().top)},findFocusTarget:function(e,n){function o(e,n){var o,r=e[0].querySelectorAll(n);return r&&r.length&&r.length&&t.forEach(r,function(e){e=t.element(e);var n=e.hasClass("_md-autofocus");n&&(o=e)}),o}var r,i="[md-autofocus]";return r=o(e,n||i),r||n==i||(r=o(e,"[md-auto-focus]"),r||(r=o(e,i))),r},disableScrollAround:function(e,n){function r(e){function n(e){e.preventDefault()}e=t.element(e||d)[0];var o=50,r=t.element('<div class="md-scroll-mask">  <div class="md-scroll-mask-bar"></div></div>').css("z-index",o);return e.appendChild(r[0]),r.on("wheel",n),r.on("touchmove",n),function(){r.off("wheel"),r.off("touchmove"),r[0].parentNode.removeChild(r[0]),delete v.disableScrollAround._enableScrolling}}function i(){var e=d.parentNode,t=e.style.cssText||"",n=d.style.cssText||"",o=v.scrollTop(d),r=d.clientWidth;return d.scrollHeight>d.clientHeight+1&&(a(d,{position:"fixed",width:"100%",top:-o+"px"}),a(e,{overflowY:"scroll"})),d.clientWidth<r&&a(d,{overflow:"hidden"}),function(){d.style.cssText=n,e.style.cssText=t,d.scrollTop=o,e.scrollTop=o}}function a(e,t){for(var n in t)e.style[n]=t[n]}if(v.disableScrollAround._count=v.disableScrollAround._count||0,++v.disableScrollAround._count,v.disableScrollAround._enableScrolling)return v.disableScrollAround._enableScrolling;e=t.element(e);var d=o[0].body,c=i(),s=r(n);return v.disableScrollAround._enableScrolling=function(){--v.disableScrollAround._count||(c(),s(),delete v.disableScrollAround._enableScrolling)}},enableScrolling:function(){var e=this.disableScrollAround._enableScrolling;e&&e()},floatingScrollbars:function(){if(this.floatingScrollbars.cached===n){var e=t.element("<div><div></div></div>").css({width:"100%","z-index":-1,position:"absolute",height:"35px","overflow-y":"scroll"});e.children().css("height","60px"),o[0].body.appendChild(e[0]),this.floatingScrollbars.cached=e[0].offsetWidth==e[0].childNodes[0].offsetWidth,e.remove()}return this.floatingScrollbars.cached},forceFocus:function(t){var n=t[0]||t;document.addEventListener("click",function r(e){e.target===n&&e.$focus&&(n.focus(),e.stopImmediatePropagation(),e.preventDefault(),n.removeEventListener("click",r))},!0);var o=document.createEvent("MouseEvents");o.initMouseEvent("click",!1,!0,e,{},0,0,0,0,!1,!1,!1,!1,0,null),o.$material=!0,o.$focus=!0,n.dispatchEvent(o)},createBackdrop:function(e,t){return a(v.supplant('<md-backdrop class="{0}">',[t]))(e)},supplant:function(e,t,n){return n=n||/\{([^\{\}]*)\}/g,e.replace(n,function(e,n){var o=n.split("."),r=t;try{for(var i in o)o.hasOwnProperty(i)&&(r=r[o[i]])}catch(a){r=e}return"string"==typeof r||"number"==typeof r?r:e})},fakeNgModel:function(){return{$fake:!0,$setTouched:t.noop,$setViewValue:function(e){this.$viewValue=e,this.$render(e),this.$viewChangeListeners.forEach(function(e){e()})},$isEmpty:function(e){return 0===(""+e).length},$parsers:[],$formatters:[],$viewChangeListeners:[],$render:t.noop}},debounce:function(e,t,o,r){var a;return function(){var d=o,c=Array.prototype.slice.call(arguments);i.cancel(a),a=i(function(){a=n,e.apply(d,c)},t||10,r)}},throttle:function(e,t){var n;return function(){var o=this,r=arguments,i=v.now();(!n||i-n>t)&&(e.apply(o,r),n=i)}},time:function(e){var t=v.now();return e(),v.now()-t},valueOnUse:function(e,t,n){var o=null,r=Array.prototype.slice.call(arguments),i=r.length>3?r.slice(3):[];Object.defineProperty(e,t,{get:function(){return null===o&&(o=n.apply(e,i)),o}})},nextUid:function(){return""+r++},disconnectScope:function(e){if(e&&e.$root!==e&&!e.$$destroyed){var t=e.$parent;e.$$disconnected=!0,t.$$childHead===e&&(t.$$childHead=e.$$nextSibling),t.$$childTail===e&&(t.$$childTail=e.$$prevSibling),e.$$prevSibling&&(e.$$prevSibling.$$nextSibling=e.$$nextSibling),e.$$nextSibling&&(e.$$nextSibling.$$prevSibling=e.$$prevSibling),e.$$nextSibling=e.$$prevSibling=null}},reconnectScope:function(e){if(e&&e.$root!==e&&e.$$disconnected){var t=e,n=t.$parent;t.$$disconnected=!1,t.$$prevSibling=n.$$childTail,n.$$childHead?(n.$$childTail.$$nextSibling=t,n.$$childTail=t):n.$$childHead=n.$$childTail=t}},getClosest:function(e,n,o){if(e instanceof t.element&&(e=e[0]),n=n.toUpperCase(),o&&(e=e.parentNode),!e)return null;do if(e.nodeName===n)return e;while(e=e.parentNode);return null},elementContains:function(n,o){var r=e.Node&&e.Node.prototype&&Node.prototype.contains,i=r?t.bind(n,n.contains):t.bind(n,function(e){return n===o||!!(16&this.compareDocumentPosition(e))});return i(o)},extractElementByName:function(e,n,o,r){function i(e){return a(e)||(o?d(e):null)}function a(e){if(e)for(var t=0,o=e.length;o>t;t++)if(e[t].nodeName.toLowerCase()===n)return e[t];return null}function d(e){var t;if(e)for(var n=0,o=e.length;o>n;n++){var r=e[n];if(!t)for(var a=0,d=r.childNodes.length;d>a;a++)t=t||i([r.childNodes[a]])}return t}var c=i(e);return!c&&r&&l.warn(v.supplant("Unable to find node '{0}' in element '{1}'.",[n,e[0].outerHTML])),t.element(c||e)},initOptionalProperties:function(e,n,o){o=o||{},t.forEach(e.$$isolateBindings,function(r,i){if(r.optional&&t.isUndefined(e[i])){var a=t.isDefined(n[r.attrName]);e[i]=t.isDefined(o[i])?o[i]:a}})},nextTick:function(e,t,n){function o(){var e=n&&n.$$destroyed,t=e?[]:r.queue,o=e?null:r.digest;r.queue=[],r.timeout=null,r.digest=!1,t.forEach(function(e){e()}),o&&d.$digest()}var r=v.nextTick,a=r.timeout,c=r.queue||[];return c.push(e),null==t&&(t=!0),r.digest=r.digest||t,r.queue=c,a||(r.timeout=i(o,0,!1))},processTemplate:function(e){return g?e:e&&t.isString(e)?e.replace(/\{\{/g,h).replace(/}}/g,f):e},getParentWithPointerEvents:function(e){for(var t=e.parent();b(t,"pointer-events","none");)t=t.parent();return t},getNearestContentElement:function(e){for(var t=e.parent()[0];t&&t!==m[0]&&t!==document.body&&"MD-CONTENT"!==t.nodeName.toUpperCase();)t=t.parentNode;return t},parseAttributeBoolean:function(e,t){return""===e||!!e&&(t===!1||"false"!==e&&"0"!==e)},hasComputedStyle:b};return v.dom.animator=c(v),v}var r=0;t.module("material.core").factory("$mdUtil",o),o.$inject=["$document","$timeout","$compile","$rootScope","$$mdAnimate","$interpolate","$log","$rootElement","$window"],t.element.prototype.focus=t.element.prototype.focus||function(){return this.length&&this[0].focus(),this},t.element.prototype.blur=t.element.prototype.blur||function(){return this.length&&this[0].blur(),this}}(),function(){function e(e,n,o,r){function i(e,o,r){var i=t.element(e)[0]||e;!i||i.hasAttribute(o)&&0!==i.getAttribute(o).length||s(i,o)||(r=t.isString(r)?r.trim():"",r.length?e.attr(o,r):n.warn('ARIA: Attribute "',o,'", required for accessibility, is missing on node:',i))}function a(t,n,o){e(function(){i(t,n,o())})}function d(e,t){var n=c(e)||"",o=n.indexOf(r.startSymbol())>-1;o?a(e,t,function(){return c(e)}):i(e,t,n)}function c(e){return(e.text()||"").trim()}function s(e,t){function n(e){var t=e.currentStyle?e.currentStyle:o.getComputedStyle(e);return"none"===t.display}var r=e.hasChildNodes(),i=!1;if(r)for(var a=e.childNodes,d=0;d<a.length;d++){var c=a[d];1===c.nodeType&&c.hasAttribute(t)&&(n(c)||(i=!0))}return i}return{expect:i,expectAsync:a,expectWithText:d}}t.module("material.core").service("$mdAria",e),e.$inject=["$$rAF","$log","$window","$interpolate"]}(),function(){function e(e,n,o,r,i,a){this.compile=function(d){var c=d.templateUrl,s=d.template||"",l=d.controller,m=d.controllerAs,u=t.extend({},d.resolve||{}),p=t.extend({},d.locals||{}),h=d.transformTemplate||t.identity,f=d.bindToController;return t.forEach(u,function(e,n){t.isString(e)?u[n]=o.get(e):u[n]=o.invoke(e)}),t.extend(u,p),c?u.$template=n.get(c,{cache:a}).then(function(e){return e.data}):u.$template=e.when(s),e.all(u).then(function(e){var n,o=h(e.$template,d),a=d.element||t.element("<div>").html(o.trim()).contents(),c=r(a);return n={locals:e,element:a,link:function(o){if(e.$scope=o,l){var r=i(l,e,!0);f&&t.extend(r.instance,e);var d=r();a.data("$ngControllerController",d),a.children().data("$ngControllerController",d),m&&(o[m]=d),n.controller=d}return c(o)}}})}}t.module("material.core").service("$mdCompiler",e),e.$inject=["$q","$http","$injector","$compile","$controller","$templateCache"]}(),function(){function n(){}function o(n,o,r){function i(e){return function(t,n){n.distance<this.state.options.maxDistance&&this.dispatchEvent(t,e,n)}}function a(e,t,n){var o=h[t.replace(/^\$md./,"")];if(!o)throw new Error("Failed to register element with handler "+t+". Available handlers: "+Object.keys(h).join(", "));return o.registerElement(e,n)}function c(e,o){var r=new n(e);return t.extend(r,o),h[e]=r,g}var s=navigator.userAgent||navigator.vendor||e.opera,m=s.match(/ipad|iphone|ipod/i),u=s.match(/android/i),p="undefined"!=typeof e.jQuery&&t.element===e.jQuery,g={handler:c,register:a,isHijackingClicks:(m||u)&&!p&&!f};if(g.isHijackingClicks){var b=6;g.handler("click",{options:{maxDistance:b},onEnd:i("click")}),g.handler("focus",{options:{maxDistance:b},onEnd:function(e,t){function n(e){var t=["INPUT","SELECT","BUTTON","TEXTAREA","VIDEO","AUDIO"];return"-1"!=e.getAttribute("tabindex")&&!e.hasAttribute("DISABLED")&&(e.hasAttribute("tabindex")||e.hasAttribute("href")||-1!=t.indexOf(e.nodeName))}t.distance<this.state.options.maxDistance&&n(e.target)&&(this.dispatchEvent(e,"focus",t),e.target.focus())}}),g.handler("mouseup",{options:{maxDistance:b},onEnd:i("mouseup")}),g.handler("mousedown",{onStart:function(e){this.dispatchEvent(e,"mousedown")}})}return g.handler("press",{onStart:function(e,t){this.dispatchEvent(e,"$md.pressdown")},onEnd:function(e,t){this.dispatchEvent(e,"$md.pressup")}}).handler("hold",{options:{maxDistance:6,delay:500},onCancel:function(){r.cancel(this.state.timeout)},onStart:function(e,n){return this.state.registeredParent?(this.state.pos={x:n.x,y:n.y},void(this.state.timeout=r(t.bind(this,function(){this.dispatchEvent(e,"$md.hold"),this.cancel()}),this.state.options.delay,!1))):this.cancel()},onMove:function(e,t){e.preventDefault();var n=this.state.pos.x-t.x,o=this.state.pos.y-t.y;Math.sqrt(n*n+o*o)>this.options.maxDistance&&this.cancel()},onEnd:function(){this.onCancel()}}).handler("drag",{options:{minDistance:6,horizontal:!0,cancelMultiplier:1.5},onStart:function(e){this.state.registeredParent||this.cancel()},onMove:function(e,t){var n,o;e.preventDefault(),this.state.dragPointer?this.dispatchDragMove(e):(this.state.options.horizontal?(n=Math.abs(t.distanceX)>this.state.options.minDistance,o=Math.abs(t.distanceY)>this.state.options.minDistance*this.state.options.cancelMultiplier):(n=Math.abs(t.distanceY)>this.state.options.minDistance,o=Math.abs(t.distanceX)>this.state.options.minDistance*this.state.options.cancelMultiplier),n?(this.state.dragPointer=d(e),l(e,this.state.dragPointer),this.dispatchEvent(e,"$md.dragstart",this.state.dragPointer)):o&&this.cancel())},dispatchDragMove:o.throttle(function(e){this.state.isRunning&&(l(e,this.state.dragPointer),this.dispatchEvent(e,"$md.drag",this.state.dragPointer))}),onEnd:function(e,t){this.state.dragPointer&&(l(e,this.state.dragPointer),this.dispatchEvent(e,"$md.dragend",this.state.dragPointer))}}).handler("swipe",{options:{minVelocity:.65,minDistance:10},onEnd:function(e,t){var n;Math.abs(t.velocityX)>this.state.options.minVelocity&&Math.abs(t.distanceX)>this.state.options.minDistance?(n="left"==t.directionX?"$md.swipeleft":"$md.swiperight",this.dispatchEvent(e,n)):Math.abs(t.velocityY)>this.state.options.minVelocity&&Math.abs(t.distanceY)>this.state.options.minDistance&&(n="up"==t.directionY?"$md.swipeup":"$md.swipedown",this.dispatchEvent(e,n))}})}function r(e){this.name=e,this.state={}}function i(){function n(e,n,o){o=o||u;var r=new t.element.Event(n);r.$material=!0,r.pointer=o,r.srcEvent=e,t.extend(r,{clientX:o.x,clientY:o.y,screenX:o.x,screenY:o.y,pageX:o.x,pageY:o.y,ctrlKey:e.ctrlKey,altKey:e.altKey,shiftKey:e.shiftKey,metaKey:e.metaKey}),t.element(o.target).trigger(r)}function o(t,n,o){o=o||u;var r;"click"===n||"mouseup"==n||"mousedown"==n?(r=document.createEvent("MouseEvents"),r.initMouseEvent(n,!0,!0,e,t.detail,o.x,o.y,o.x,o.y,t.ctrlKey,t.altKey,t.shiftKey,t.metaKey,t.button,t.relatedTarget||null)):(r=document.createEvent("CustomEvent"),r.initCustomEvent(n,!0,!0,{})),r.$material=!0,r.pointer=o,r.srcEvent=t,o.target.dispatchEvent(r)}var i="undefined"!=typeof e.jQuery&&t.element===e.jQuery;return r.prototype={options:{},dispatchEvent:i?n:o,onStart:t.noop,onMove:t.noop,onEnd:t.noop,onCancel:t.noop,start:function(e,n){if(!this.state.isRunning){var o=this.getNearestParent(e.target),r=o&&o.$mdGesture[this.name]||{};this.state={isRunning:!0,options:t.extend({},this.options,r),registeredParent:o},this.onStart(e,n)}},move:function(e,t){this.state.isRunning&&this.onMove(e,t)},end:function(e,t){this.state.isRunning&&(this.onEnd(e,t),this.state.isRunning=!1)},cancel:function(e,t){this.onCancel(e,t),this.state={}},getNearestParent:function(e){for(var t=e;t;){if((t.$mdGesture||{})[this.name])return t;t=t.parentNode}return null},registerElement:function(e,t){function n(){delete e[0].$mdGesture[o.name],e.off("$destroy",n)}var o=this;return e[0].$mdGesture=e[0].$mdGesture||{},e[0].$mdGesture[this.name]=t||{},e.on("$destroy",n),n}},r}function a(e,n){function o(e){var t=!e.clientX&&!e.clientY;t||e.$material||e.isIonicTap||s(e)||(e.preventDefault(),e.stopPropagation())}function r(e){var t=0===e.clientX&&0===e.clientY;t||e.$material||e.isIonicTap||s(e)?(g=null,"label"==e.target.tagName.toLowerCase()&&(g={x:e.x,y:e.y})):(e.preventDefault(),e.stopPropagation(),g=null)}function i(e,t){var o;for(var r in h)o=h[r],o instanceof n&&("start"===e&&o.cancel(),o[e](t,u))}function a(e){if(!u){var t=+Date.now();p&&!c(e,p)&&t-p.endTime<1500||(u=d(e),i("start",e))}}function m(e){u&&c(e,u)&&(l(e,u),i("move",e))}function f(e){u&&c(e,u)&&(l(e,u),u.endTime=+Date.now(),i("end",e),p=u,u=null)}document.contains||(document.contains=function(e){return document.body.contains(e)}),!b&&e.isHijackingClicks&&(document.addEventListener("click",r,!0),document.addEventListener("mouseup",o,!0),document.addEventListener("mousedown",o,!0),document.addEventListener("focus",o,!0),b=!0);var v="mousedown touchstart pointerdown",E="mousemove touchmove pointermove",$="mouseup mouseleave touchend touchcancel pointerup pointercancel";t.element(document).on(v,a).on(E,m).on($,f).on("$$mdGestureReset",function(){p=u=null})}function d(e){var t=m(e),n={startTime:+Date.now(),target:e.target,type:e.type.charAt(0)};return n.startX=n.x=t.pageX,n.startY=n.y=t.pageY,n}function c(e,t){return e&&t&&e.type.charAt(0)===t.type}function s(e){return g&&g.x==e.x&&g.y==e.y}function l(e,t){var n=m(e),o=t.x=n.pageX,r=t.y=n.pageY;t.distanceX=o-t.startX,t.distanceY=r-t.startY,t.distance=Math.sqrt(t.distanceX*t.distanceX+t.distanceY*t.distanceY),t.directionX=t.distanceX>0?"right":t.distanceX<0?"left":"",t.directionY=t.distanceY>0?"down":t.distanceY<0?"up":"",t.duration=+Date.now()-t.startTime,t.velocityX=t.distanceX/t.duration,t.velocityY=t.distanceY/t.duration}function m(e){return e=e.originalEvent||e,e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e}var u,p,h={},f=!1,g=null,b=!1;t.module("material.core.gestures",[]).provider("$mdGesture",n).factory("$$MdGestureHandler",i).run(a),n.prototype={skipClickHijack:function(){return f=!0},$get:["$$MdGestureHandler","$$rAF","$timeout",function(e,t,n){return new o(e,t,n)}]},o.$inject=["$$MdGestureHandler","$$rAF","$timeout"],a.$inject=["$mdGesture","$$MdGestureHandler"]}(),function(){function e(){function e(e){function n(e){return c.optionsFactory=e.options,c.methods=(e.methods||[]).concat(a),s}function o(e,t){return d[e]=t,s}function r(t,n){if(n=n||{},n.methods=n.methods||[],n.options=n.options||function(){return{}},/^cancel|hide|show$/.test(t))throw new Error("Preset '"+t+"' in "+e+" is reserved!");if(n.methods.indexOf("_options")>-1)throw new Error("Method '_options' in "+e+" is reserved!");return c.presets[t]={methods:n.methods.concat(a),optionsFactory:n.options,argOption:n.argOption},s}function i(n,o){function r(e){return e=e||{},e._options&&(e=e._options),m.show(t.extend({},l,e))}function i(e){return m.destroy(e)}function a(t,n){var r={};return r[e]=u,o.invoke(t||function(){return n},{},r)}var s,l,m=n(),u={hide:m.hide,cancel:m.cancel,show:r,destroy:i};return s=c.methods||[],l=a(c.optionsFactory,{}),t.forEach(d,function(e,t){u[t]=e}),t.forEach(c.presets,function(e,n){function o(e){this._options=t.extend({},r,e)}var r=a(e.optionsFactory,{}),i=(e.methods||[]).concat(s);if(t.extend(r,{$type:n}),t.forEach(i,function(e){o.prototype[e]=function(t){return this._options[e]=t,this}}),e.argOption){var d="show"+n.charAt(0).toUpperCase()+n.slice(1);u[d]=function(e){var t=u[n](e);return u.show(t)}}u[n]=function(n){return arguments.length&&e.argOption&&!t.isObject(n)&&!t.isArray(n)?(new o)[e.argOption](n):new o(n)}}),u}var a=["onHide","onShow","onRemove"],d={},c={presets:{}},s={setDefaults:n,addPreset:r,addMethod:o,$get:i};return s.addPreset("build",{methods:["controller","controllerAs","resolve","template","templateUrl","themable","transformTemplate","parent"]}),i.$inject=["$$interimElement","$injector"],s}function o(e,o,r,i,a,d,c,s,l,m,u){return function(){function p(e){e=e||{};var t=new b(e||{}),n=!e.skipHide&&$.length?v.hide():o.when(!0);return n["finally"](function(){$.push(t),t.show()["catch"](function(e){return e})}),t.deferred.promise}function h(e,t){function r(n){return n.remove(e,!1,t||{})["catch"](function(e){return e}),n.deferred.promise}if(!$.length)return o.when(e);if(t=t||{},t.closeAll){var i=o.all($.reverse().map(r));return $=[],i}if(t.closeTo!==n)return o.all($.splice(t.closeTo).map(r));var a=$.pop();return r(a)}function f(e,t){var n=$.pop();return n?(n.remove(e,!0,t||{})["catch"](function(e){return e}),n.deferred.promise):o.when(e)}function g(e){var n=e?null:$.shift(),r=t.element(e).length?t.element(e)[0].parentNode:null;if(r){var i=$.filter(function(e){var t=e.options.element[0];return t===r});i.length>0&&(n=i[0],$.splice($.indexOf(n),1))}return n?n.remove(E,!1,{$destroy:!0}):o.when(E)}function b(u){function p(){return o(function(e,t){function n(e){C.deferred.reject(e),t(e)}g(u).then(function(t){A=b(t,u),k=M(A,u,t.controller).then(e,n)},n)})}function h(e,n,r){function i(e){C.deferred.resolve(e)}function a(e){C.deferred.reject(e)}return A?(u=t.extend(u||{},r||{}),u.cancelAutoHide&&u.cancelAutoHide(),u.element.triggerHandler("$mdInterimElementRemove"),u.$destroy===!0?y(u.element,u).then(function(){n&&a(e)||i(e)}):(o.when(k)["finally"](function(){y(u.element,u).then(function(){n&&a(e)||i(e)},a)}),C.deferred.promise)):o.when(!1)}function f(e){return e=e||{},e.template&&(e.template=s.processTemplate(e.template)),t.extend({preserveScope:!1,cancelAutoHide:t.noop,scope:e.scope||i.$new(e.isolateScope),onShow:function(e,t,n){return c.enter(t,n.parent)},onRemove:function(e,t){return t&&c.leave(t)||o.when()}},e)}function g(e){var t=e.skipCompile?null:l.compile(e);return t||o(function(t){t({locals:{},link:function(){return e.element}})})}function b(e,n){t.extend(e.locals,n);var o=e.link(n.scope);return n.element=o,n.parent=E(o,n),n.themable&&m(o),o}function E(n,o){var r=o.parent;if(r=t.isFunction(r)?r(o.scope,n,o):t.isString(r)?t.element(e[0].querySelector(r)):t.element(r),!(r||{}).length){var i;return d[0]&&d[0].querySelector&&(i=d[0].querySelector(":not(svg) > body")),i||(i=d[0]),"#comment"==i.nodeName&&(i=e[0].body),t.element(i)}return r}function $(){var e,o=t.noop;u.hideDelay&&(e=a(v.hide,u.hideDelay),o=function(){a.cancel(e)}),u.cancelAutoHide=function(){o(),u.cancelAutoHide=n}}function M(e,n,r){var i=n.onShowing||t.noop,a=n.onComplete||t.noop;return i(n.scope,e,n,r),o(function(t,i){try{o.when(n.onShow(n.scope,e,n,r)).then(function(){a(n.scope,e,n),$(),t(e)},i)}catch(d){i(d.message)}})}function y(e,n){var o=n.onRemoving||t.noop;return r(function(t,i){try{var a=r.when(n.onRemove(n.scope,e,n)||!0);o(e,a),1==n.$destroy?t(e):a.then(function(){!n.preserveScope&&n.scope&&n.scope.$destroy(),t(e)},i)}catch(d){i(d.message)}})}var C,A,k=o.when(!0);return u=f(u),C={options:u,deferred:o.defer(),show:p,remove:h}}var v,E=!1,$=[];return v={show:p,hide:h,cancel:f,destroy:g,$injector_:u}}}return e.$get=o,o.$inject=["$document","$q","$$q","$rootScope","$timeout","$rootElement","$animate","$mdUtil","$mdCompiler","$mdTheming","$injector"],e}t.module("material.core").provider("$$interimElement",e)}(),function(){!function(){function e(e){function a(e){return e.replace(c,"").replace(s,function(e,t,n,o){return o?n.toUpperCase():n})}var c=/^((?:x|data)[\:\-_])/i,s=/([\:\-\_]+(.))/g,l=["","xs","gt-xs","sm","gt-sm","md","gt-md","lg","gt-lg","xl","print"],m=["layout","flex","flex-order","flex-offset","layout-align"],u=["show","hide","layout-padding","layout-margin"];t.forEach(l,function(n){t.forEach(m,function(t){var o=n?t+"-"+n:t;e.directive(a(o),r(o))}),t.forEach(u,function(t){var o=n?t+"-"+n:t;e.directive(a(o),i(o))})}),e.directive("mdLayoutCss",n).directive("ngCloak",o("ng-cloak")).directive("layoutWrap",i("layout-wrap")).directive("layoutNowrap",i("layout-nowrap")).directive("layoutNoWrap",i("layout-no-wrap")).directive("layoutFill",i("layout-fill")).directive("layoutLtMd",d("layout-lt-md",!0)).directive("layoutLtLg",d("layout-lt-lg",!0)).directive("flexLtMd",d("flex-lt-md",!0)).directive("flexLtLg",d("flex-lt-lg",!0)).directive("layoutAlignLtMd",d("layout-align-lt-md")).directive("layoutAlignLtLg",d("layout-align-lt-lg")).directive("flexOrderLtMd",d("flex-order-lt-md")).directive("flexOrderLtLg",d("flex-order-lt-lg")).directive("offsetLtMd",d("flex-offset-lt-md")).directive("offsetLtLg",d("flex-offset-lt-lg")).directive("hideLtMd",d("hide-lt-md")).directive("hideLtLg",d("hide-lt-lg")).directive("showLtMd",d("show-lt-md")).directive("showLtLg",d("show-lt-lg"))}function n(){return{restrict:"A",priority:"900",compile:function(e,n){return A.enabled=!1,t.noop}}}function o(e){return["$timeout",function(n){return{restrict:"A",priority:-10,compile:function(o){return A.enabled?(o.addClass(e),function(t,o){n(function(){o.removeClass(e)},10,!1)}):t.noop}}}]}function r(e){function n(t,n,o){var r=a(n,e,o),i=o.$observe(o.$normalize(e),r);r(u(e,o,"")),t.$on("$destroy",function(){i()})}return["$mdUtil","$interpolate","$log",function(o,r,i){return f=o,g=r,b=i,{restrict:"A",compile:function(o,r){var i;return A.enabled&&(c(e,r,o,b),s(e,u(e,r,""),l(o,e,r)),i=n),i||t.noop}}}]}function i(e){function n(t,n){n.addClass(e)}return["$mdUtil","$interpolate","$log",function(o,r,i){return f=o,g=r,b=i,{restrict:"A",compile:function(o,r){var i;return A.enabled&&(s(e,u(e,r,""),l(o,e,r)),n(null,o),i=n),i||t.noop}}}]}function a(e,n){var o;return function(r){var i=s(n,r||"");t.isDefined(i)&&(o&&e.removeClass(o),o=i?n+"-"+i.replace(E,"-"):n,e.addClass(o))}}function d(e){var n=e.split("-");return["$log",function(o){return o.warn(e+"has been deprecated. Please use a `"+n[0]+"-gt-<xxx>` variant."),t.noop}]}function c(e,t,n,o){var r,i,a,d=n[0].nodeName.toLowerCase();switch(e.replace(v,"")){case"flex":"md-button"!=d&&"fieldset"!=d||(i="<"+d+" "+e+"></"+d+">",a="https://github.com/philipwalton/flexbugs#9-some-html-elements-cant-be-flex-containers",r="Markup '{0}' may not work as expected in IE Browsers. Consult '{1}' for details.",o.warn(f.supplant(r,[i,a])))}}function s(e,n,o){var r=n;if(!m(n)){switch(e.replace(v,"")){case"layout":p(n,M)||(n=M[0]);break;case"flex":p(n,$)||isNaN(n)&&(n="");break;case"flex-offset":case"flex-order":n&&!isNaN(+n)||(n="0");break;case"layout-align":var i=h(n);n=f.supplant("{main}-{cross}",i);break;case"layout-padding":case"layout-margin":case"layout-fill":case"layout-wrap":case"layout-nowrap":case"layout-nowrap":n=""}n!=r&&(o||t.noop)(n)}return n}function l(e,t,n){return function(e){m(e)||(n[n.$normalize(t)]=e)}}function m(e){return(e||"").indexOf(g.startSymbol())>-1}function u(e,t,n){var o=t.$normalize(e);return t[o]?t[o].replace(E,"-"):n||null}function p(e,t,n){e=n&&e?e.replace(E,n):e;var o=!1;return e&&t.forEach(function(t){t=n?t.replace(E,n):t,o=o||t===e}),o}function h(e){var t,n={main:"start",cross:"stretch"};return e=e||"",0!=e.indexOf("-")&&0!=e.indexOf(" ")||(e="none"+e),t=e.toLowerCase().trim().replace(E,"-").split("-"),t.length&&"space"===t[0]&&(t=[t[0]+"-"+t[1],t[2]]),t.length>0&&(n.main=t[0]||n.main),t.length>1&&(n.cross=t[1]||n.cross),y.indexOf(n.main)<0&&(n.main="start"),C.indexOf(n.cross)<0&&(n.cross="stretch"),n}var f,g,b,v=/(-gt)?-(sm|md|lg|print)/g,E=/\s+/g,$=["grow","initial","auto","none","noshrink","nogrow"],M=["row","column"],y=["","start","center","end","stretch","space-around","space-between"],C=["","start","center","end","stretch"],A={enabled:!0,breakpoints:[]};e(t.module("material.core.layout",["ng"]))}()}(),function(){function e(e,n){function o(e){return e&&""!==e}var r,i=[],a={};return r={notFoundError:function(t){e.error("No instance found for handle",t);
},getInstances:function(){return i},get:function(e){if(!o(e))return null;var t,n,r;for(t=0,n=i.length;n>t;t++)if(r=i[t],r.$$mdHandle===e)return r;return null},register:function(e,n){function o(){var t=i.indexOf(e);-1!==t&&i.splice(t,1)}function r(){var t=a[n];t&&(t.resolve(e),delete a[n])}return n?(e.$$mdHandle=n,i.push(e),r(),o):t.noop},when:function(e){if(o(e)){var t=n.defer(),i=r.get(e);return i?t.resolve(i):a[e]=t,t.promise}return n.reject("Invalid `md-component-id` value.")}}}t.module("material.core").factory("$mdComponentRegistry",e),e.$inject=["$log","$q"]}(),function(){!function(){function e(e){function n(e){return e.hasClass("md-icon-button")?{isMenuItem:e.hasClass("md-menu-item"),fitRipple:!0,center:!0}:{isMenuItem:e.hasClass("md-menu-item"),dimBackground:!0}}return{attach:function(o,r,i){return i=t.extend(n(r),i),e.attach(o,r,i)}}}t.module("material.core").factory("$mdButtonInkRipple",e),e.$inject=["$mdInkRipple"]}()}(),function(){!function(){function e(e){function n(n,o,r){return e.attach(n,o,t.extend({center:!0,dimBackground:!1,fitRipple:!0},r))}return{attach:n}}t.module("material.core").factory("$mdCheckboxInkRipple",e),e.$inject=["$mdInkRipple"]}()}(),function(){!function(){function e(e){function n(n,o,r){return e.attach(n,o,t.extend({center:!1,dimBackground:!0,outline:!1,rippleSize:"full"},r))}return{attach:n}}t.module("material.core").factory("$mdListInkRipple",e),e.$inject=["$mdInkRipple"]}()}(),function(){function e(e,n){return{controller:t.noop,link:function(t,o,r){r.hasOwnProperty("mdInkRippleCheckbox")?n.attach(t,o):e.attach(t,o)}}}function n(e){function n(n,r,i){return r.controller("mdNoInk")?t.noop:e.instantiate(o,{$scope:n,$element:r,rippleOptions:i})}return{attach:n}}function o(e,n,o,r,i,a){this.$window=r,this.$timeout=i,this.$mdUtil=a,this.$scope=e,this.$element=n,this.options=o,this.mousedown=!1,this.ripples=[],this.timeout=null,this.lastRipple=null,a.valueOnUse(this,"container",this.createContainer),this.$element.addClass("md-ink-ripple"),(n.controller("mdInkRipple")||{}).createRipple=t.bind(this,this.createRipple),(n.controller("mdInkRipple")||{}).setColor=t.bind(this,this.color),this.bindEvents()}function r(e,n){(e.mousedown||e.lastRipple)&&(e.mousedown=!1,e.$mdUtil.nextTick(t.bind(e,n),!1))}function i(){return{controller:t.noop}}t.module("material.core").factory("$mdInkRipple",n).directive("mdInkRipple",e).directive("mdNoInk",i).directive("mdNoBar",i).directive("mdNoStretch",i);var a=450;e.$inject=["$mdButtonInkRipple","$mdCheckboxInkRipple"],n.$inject=["$injector"],o.$inject=["$scope","$element","rippleOptions","$window","$timeout","$mdUtil"],o.prototype.color=function(e){function n(){var e=o.options&&o.options.colorElement?o.options.colorElement:[],t=e.length?e[0]:o.$element[0];return t?o.$window.getComputedStyle(t).color:"rgb(0,0,0)"}var o=this;return t.isDefined(e)&&(o._color=o._parseColor(e)),o._color||o._parseColor(o.inkRipple())||o._parseColor(n())},o.prototype.calculateColor=function(){return this.color()},o.prototype._parseColor=function(e,t){function n(e){var t="#"===e[0]?e.substr(1):e,n=t.length/3,o=t.substr(0,n),r=t.substr(n,n),i=t.substr(2*n);return 1===n&&(o+=o,r+=r,i+=i),"rgba("+parseInt(o,16)+","+parseInt(r,16)+","+parseInt(i,16)+",0.1)"}function o(e){return e.replace(")",", 0.1)").replace("(","a(")}return t=t||1,e?0===e.indexOf("rgba")?e.replace(/\d?\.?\d*\s*\)\s*$/,(.1*t).toString()+")"):0===e.indexOf("rgb")?o(e):0===e.indexOf("#")?n(e):void 0:void 0},o.prototype.bindEvents=function(){this.$element.on("mousedown",t.bind(this,this.handleMousedown)),this.$element.on("mouseup touchend",t.bind(this,this.handleMouseup)),this.$element.on("mouseleave",t.bind(this,this.handleMouseup)),this.$element.on("touchmove",t.bind(this,this.handleTouchmove))},o.prototype.handleMousedown=function(e){if(!this.mousedown)if(e.hasOwnProperty("originalEvent")&&(e=e.originalEvent),this.mousedown=!0,this.options.center)this.createRipple(this.container.prop("clientWidth")/2,this.container.prop("clientWidth")/2);else if(e.srcElement!==this.$element[0]){var t=this.$element[0].getBoundingClientRect(),n=e.clientX-t.left,o=e.clientY-t.top;this.createRipple(n,o)}else this.createRipple(e.offsetX,e.offsetY)},o.prototype.handleMouseup=function(){r(this,this.clearRipples)},o.prototype.handleTouchmove=function(){r(this,this.deleteRipples)},o.prototype.deleteRipples=function(){for(var e=0;e<this.ripples.length;e++)this.ripples[e].remove()},o.prototype.clearRipples=function(){for(var e=0;e<this.ripples.length;e++)this.fadeInComplete(this.ripples[e])},o.prototype.createContainer=function(){var e=t.element('<div class="md-ripple-container"></div>');return this.$element.append(e),e},o.prototype.clearTimeout=function(){this.timeout&&(this.$timeout.cancel(this.timeout),this.timeout=null)},o.prototype.isRippleAllowed=function(){var e=this.$element[0];do{if(!e.tagName||"BODY"===e.tagName)break;if(e&&t.isFunction(e.hasAttribute)){if(e.hasAttribute("disabled"))return!1;if("false"===this.inkRipple()||"0"===this.inkRipple())return!1}}while(e=e.parentNode);return!0},o.prototype.inkRipple=function(){return this.$element.attr("md-ink-ripple")},o.prototype.createRipple=function(e,n){function o(e){return e?e.replace("rgba","rgb").replace(/,[^\),]+\)/,")"):"rgb(0,0,0)"}function r(e,t,n){return e?Math.max(t,n):Math.sqrt(Math.pow(t,2)+Math.pow(n,2))}if(this.isRippleAllowed()){var i=this,d=t.element('<div class="md-ripple"></div>'),c=this.$element.prop("clientWidth"),s=this.$element.prop("clientHeight"),l=2*Math.max(Math.abs(c-e),e),m=2*Math.max(Math.abs(s-n),n),u=r(this.options.fitRipple,l,m),p=this.calculateColor();d.css({left:e+"px",top:n+"px",background:"black",width:u+"px",height:u+"px",backgroundColor:o(p),borderColor:o(p)}),this.lastRipple=d,this.clearTimeout(),this.timeout=this.$timeout(function(){i.clearTimeout(),i.mousedown||i.fadeInComplete(d)},.35*a,!1),this.options.dimBackground&&this.container.css({backgroundColor:p}),this.container.append(d),this.ripples.push(d),d.addClass("md-ripple-placed"),this.$mdUtil.nextTick(function(){d.addClass("md-ripple-scaled md-ripple-active"),i.$timeout(function(){i.clearRipples()},a,!1)},!1)}},o.prototype.fadeInComplete=function(e){this.lastRipple===e?this.timeout||this.mousedown||this.removeRipple(e):this.removeRipple(e)},o.prototype.removeRipple=function(e){var t=this,n=this.ripples.indexOf(e);0>n||(this.ripples.splice(this.ripples.indexOf(e),1),e.removeClass("md-ripple-active"),0===this.ripples.length&&this.container.css({backgroundColor:""}),this.$timeout(function(){t.fadeOutComplete(e)},a,!1))},o.prototype.fadeOutComplete=function(e){e.remove(),this.lastRipple=null}}(),function(){!function(){function e(e){function n(n,o,r){return e.attach(n,o,t.extend({center:!1,dimBackground:!0,outline:!1,rippleSize:"full"},r))}return{attach:n}}t.module("material.core").factory("$mdTabInkRipple",e),e.$inject=["$mdInkRipple"]}()}(),function(){t.module("material.core.theming.palette",[]).constant("$mdColorPalette",{red:{50:"#ffebee",100:"#ffcdd2",200:"#ef9a9a",300:"#e57373",400:"#ef5350",500:"#f44336",600:"#e53935",700:"#d32f2f",800:"#c62828",900:"#b71c1c",A100:"#ff8a80",A200:"#ff5252",A400:"#ff1744",A700:"#d50000",contrastDefaultColor:"light",contrastDarkColors:"50 100 200 300 A100",contrastStrongLightColors:"400 500 600 700 A200 A400 A700"},pink:{50:"#fce4ec",100:"#f8bbd0",200:"#f48fb1",300:"#f06292",400:"#ec407a",500:"#e91e63",600:"#d81b60",700:"#c2185b",800:"#ad1457",900:"#880e4f",A100:"#ff80ab",A200:"#ff4081",A400:"#f50057",A700:"#c51162",contrastDefaultColor:"light",contrastDarkColors:"50 100 200 A100",contrastStrongLightColors:"500 600 A200 A400 A700"},purple:{50:"#f3e5f5",100:"#e1bee7",200:"#ce93d8",300:"#ba68c8",400:"#ab47bc",500:"#9c27b0",600:"#8e24aa",700:"#7b1fa2",800:"#6a1b9a",900:"#4a148c",A100:"#ea80fc",A200:"#e040fb",A400:"#d500f9",A700:"#aa00ff",contrastDefaultColor:"light",contrastDarkColors:"50 100 200 A100",contrastStrongLightColors:"300 400 A200 A400 A700"},"deep-purple":{50:"#ede7f6",100:"#d1c4e9",200:"#b39ddb",300:"#9575cd",400:"#7e57c2",500:"#673ab7",600:"#5e35b1",700:"#512da8",800:"#4527a0",900:"#311b92",A100:"#b388ff",A200:"#7c4dff",A400:"#651fff",A700:"#6200ea",contrastDefaultColor:"light",contrastDarkColors:"50 100 200 A100",contrastStrongLightColors:"300 400 A200"},indigo:{50:"#e8eaf6",100:"#c5cae9",200:"#9fa8da",300:"#7986cb",400:"#5c6bc0",500:"#3f51b5",600:"#3949ab",700:"#303f9f",800:"#283593",900:"#1a237e",A100:"#8c9eff",A200:"#536dfe",A400:"#3d5afe",A700:"#304ffe",contrastDefaultColor:"light",contrastDarkColors:"50 100 200 A100",contrastStrongLightColors:"300 400 A200 A400"},blue:{50:"#e3f2fd",100:"#bbdefb",200:"#90caf9",300:"#64b5f6",400:"#42a5f5",500:"#2196f3",600:"#1e88e5",700:"#1976d2",800:"#1565c0",900:"#0d47a1",A100:"#82b1ff",A200:"#448aff",A400:"#2979ff",A700:"#2962ff",contrastDefaultColor:"light",contrastDarkColors:"50 100 200 300 400 A100",contrastStrongLightColors:"500 600 700 A200 A400 A700"},"light-blue":{50:"#e1f5fe",100:"#b3e5fc",200:"#81d4fa",300:"#4fc3f7",400:"#29b6f6",500:"#03a9f4",600:"#039be5",700:"#0288d1",800:"#0277bd",900:"#01579b",A100:"#80d8ff",A200:"#40c4ff",A400:"#00b0ff",A700:"#0091ea",contrastDefaultColor:"dark",contrastLightColors:"600 700 800 900 A700",contrastStrongLightColors:"600 700 800 A700"},cyan:{50:"#e0f7fa",100:"#b2ebf2",200:"#80deea",300:"#4dd0e1",400:"#26c6da",500:"#00bcd4",600:"#00acc1",700:"#0097a7",800:"#00838f",900:"#006064",A100:"#84ffff",A200:"#18ffff",A400:"#00e5ff",A700:"#00b8d4",contrastDefaultColor:"dark",contrastLightColors:"700 800 900",contrastStrongLightColors:"700 800 900"},teal:{50:"#e0f2f1",100:"#b2dfdb",200:"#80cbc4",300:"#4db6ac",400:"#26a69a",500:"#009688",600:"#00897b",700:"#00796b",800:"#00695c",900:"#004d40",A100:"#a7ffeb",A200:"#64ffda",A400:"#1de9b6",A700:"#00bfa5",contrastDefaultColor:"dark",contrastLightColors:"500 600 700 800 900",contrastStrongLightColors:"500 600 700"},green:{50:"#e8f5e9",100:"#c8e6c9",200:"#a5d6a7",300:"#81c784",400:"#66bb6a",500:"#4caf50",600:"#43a047",700:"#388e3c",800:"#2e7d32",900:"#1b5e20",A100:"#b9f6ca",A200:"#69f0ae",A400:"#00e676",A700:"#00c853",contrastDefaultColor:"dark",contrastLightColors:"500 600 700 800 900",contrastStrongLightColors:"500 600 700"},"light-green":{50:"#f1f8e9",100:"#dcedc8",200:"#c5e1a5",300:"#aed581",400:"#9ccc65",500:"#8bc34a",600:"#7cb342",700:"#689f38",800:"#558b2f",900:"#33691e",A100:"#ccff90",A200:"#b2ff59",A400:"#76ff03",A700:"#64dd17",contrastDefaultColor:"dark",contrastLightColors:"700 800 900",contrastStrongLightColors:"700 800 900"},lime:{50:"#f9fbe7",100:"#f0f4c3",200:"#e6ee9c",300:"#dce775",400:"#d4e157",500:"#cddc39",600:"#c0ca33",700:"#afb42b",800:"#9e9d24",900:"#827717",A100:"#f4ff81",A200:"#eeff41",A400:"#c6ff00",A700:"#aeea00",contrastDefaultColor:"dark",contrastLightColors:"900",contrastStrongLightColors:"900"},yellow:{50:"#fffde7",100:"#fff9c4",200:"#fff59d",300:"#fff176",400:"#ffee58",500:"#ffeb3b",600:"#fdd835",700:"#fbc02d",800:"#f9a825",900:"#f57f17",A100:"#ffff8d",A200:"#ffff00",A400:"#ffea00",A700:"#ffd600",contrastDefaultColor:"dark"},amber:{50:"#fff8e1",100:"#ffecb3",200:"#ffe082",300:"#ffd54f",400:"#ffca28",500:"#ffc107",600:"#ffb300",700:"#ffa000",800:"#ff8f00",900:"#ff6f00",A100:"#ffe57f",A200:"#ffd740",A400:"#ffc400",A700:"#ffab00",contrastDefaultColor:"dark"},orange:{50:"#fff3e0",100:"#ffe0b2",200:"#ffcc80",300:"#ffb74d",400:"#ffa726",500:"#ff9800",600:"#fb8c00",700:"#f57c00",800:"#ef6c00",900:"#e65100",A100:"#ffd180",A200:"#ffab40",A400:"#ff9100",A700:"#ff6d00",contrastDefaultColor:"dark",contrastLightColors:"800 900",contrastStrongLightColors:"800 900"},"deep-orange":{50:"#fbe9e7",100:"#ffccbc",200:"#ffab91",300:"#ff8a65",400:"#ff7043",500:"#ff5722",600:"#f4511e",700:"#e64a19",800:"#d84315",900:"#bf360c",A100:"#ff9e80",A200:"#ff6e40",A400:"#ff3d00",A700:"#dd2c00",contrastDefaultColor:"light",contrastDarkColors:"50 100 200 300 400 A100 A200",contrastStrongLightColors:"500 600 700 800 900 A400 A700"},brown:{50:"#efebe9",100:"#d7ccc8",200:"#bcaaa4",300:"#a1887f",400:"#8d6e63",500:"#795548",600:"#6d4c41",700:"#5d4037",800:"#4e342e",900:"#3e2723",A100:"#d7ccc8",A200:"#bcaaa4",A400:"#8d6e63",A700:"#5d4037",contrastDefaultColor:"light",contrastDarkColors:"50 100 200",contrastStrongLightColors:"300 400"},grey:{50:"#fafafa",100:"#f5f5f5",200:"#eeeeee",300:"#e0e0e0",400:"#bdbdbd",500:"#9e9e9e",600:"#757575",700:"#616161",800:"#424242",900:"#212121",A100:"#ffffff",A200:"#000000",A400:"#303030",A700:"#616161",contrastDefaultColor:"dark",contrastLightColors:"600 700 800 900"},"blue-grey":{50:"#eceff1",100:"#cfd8dc",200:"#b0bec5",300:"#90a4ae",400:"#78909c",500:"#607d8b",600:"#546e7a",700:"#455a64",800:"#37474f",900:"#263238",A100:"#cfd8dc",A200:"#b0bec5",A400:"#78909c",A700:"#455a64",contrastDefaultColor:"light",contrastDarkColors:"50 100 200 300 700",contrastStrongLightColors:"400 500 700"}})}(),function(){function e(e){function o(e,t){return t=t||{},m[e]=a(e,t),v}function r(e,n){return a(e,t.extend({},m[e]||{},n))}function a(e,t){var n=k.filter(function(e){return!t[e]});if(n.length)throw new Error("Missing colors %1 in palette %2!".replace("%1",n.join(", ")).replace("%2",e));return t}function c(e,n){if(u[e])return u[e];n=n||"default";var o="string"==typeof n?u[n]:n,r=new s(e);return o&&t.forEach(o.colors,function(e,n){r.colors[n]={name:e.name,hues:t.extend({},e.hues)}}),u[e]=r,r}function s(e){function n(e){if(e=0===arguments.length?!0:!!e,e!==o.isDark){o.isDark=e,o.foregroundPalette=o.isDark?f:h,o.foregroundShadow=o.isDark?g:b;var n=o.isDark?A:C,r=o.isDark?C:A;return t.forEach(n,function(e,t){var n=o.colors[t],i=r[t];if(n)for(var a in n.hues)n.hues[a]===i[a]&&(n.hues[a]=e[a])}),o}}var o=this;o.name=e,o.colors={},o.dark=n,n(!1),M.forEach(function(e){var n=(o.isDark?A:C)[e];o[e+"Palette"]=function(r,i){var a=o.colors[e]={name:r,hues:t.extend({},n,i)};return Object.keys(a.hues).forEach(function(e){if(!n[e])throw new Error("Invalid hue name '%1' in theme %2's %3 color %4. Available hue names: %4".replace("%1",e).replace("%2",o.name).replace("%3",r).replace("%4",Object.keys(n).join(", ")))}),Object.keys(a.hues).map(function(e){return a.hues[e]}).forEach(function(t){if(-1==k.indexOf(t))throw new Error("Invalid hue value '%1' in theme %2's %3 color %4. Available hue values: %5".replace("%1",t).replace("%2",o.name).replace("%3",e).replace("%4",r).replace("%5",k.join(", ")))}),o},o[e+"Color"]=function(){var t=Array.prototype.slice.call(arguments);return console.warn("$mdThemingProviderTheme."+e+"Color() has been deprecated. Use $mdThemingProviderTheme."+e+"Palette() instead."),o[e+"Palette"].apply(o,t)}})}function p(e,o){function r(e){return e===n||""===e?!0:a.THEMES[e]!==n}function i(n,i){function a(){return c=i.controller("mdTheme")||n.data("$mdThemeController"),c&&c.$mdTheme||("default"==E?"":E)}function d(e){if(e){r(e)||o.warn("Attempted to use unregistered theme '"+e+"'. Register it with $mdThemingProvider.theme().");var t=n.data("$mdThemeName");t&&n.removeClass("md-"+t+"-theme"),n.addClass("md-"+e+"-theme"),n.data("$mdThemeName",e),c&&n.data("$mdThemeController",c)}}var c=i.controller("mdTheme"),s=n.attr("md-theme-watch"),l=($||t.isDefined(s))&&"false"!=s;d(a()),n.on("$destroy",l?e.$watch(a,d):t.noop)}var a=function(t,o){o===n&&(o=t,t=n),t===n&&(t=e),a.inherit(o,o)};return a.THEMES=t.extend({},u),a.inherit=i,a.registered=r,a.defaultTheme=function(){return E},a.generateTheme=function(e){d(e,w)},a}m={},u={};var v,E="default",$=!1;return t.extend(m,e),p.$inject=["$rootScope","$log"],v={definePalette:o,extendPalette:r,theme:c,setNonce:function(e){w=e},setDefaultTheme:function(e){E=e},alwaysWatchTheme:function(e){$=e},generateThemesOnDemand:function(e){T=e},$get:p,_LIGHT_DEFAULT_HUES:C,_DARK_DEFAULT_HUES:A,_PALETTES:m,_THEMES:u,_parseRules:i,_rgba:l}}function o(e,t,n){return{priority:100,link:{pre:function(o,r,i){var a={$setTheme:function(t){e.registered(t)||n.warn("attempted to use unregistered theme '"+t+"'"),a.$mdTheme=t}};r.data("$mdThemeController",a),a.$setTheme(t(i.mdTheme)(o)),i.$observe("mdTheme",a.$setTheme)}}}}function r(e){return e}function i(e,n,o){c(e,n),o=o.replace(/THEME_NAME/g,e.name);var r=[],i=e.colors[n],a=new RegExp(".md-"+e.name+"-theme","g"),d=new RegExp("('|\")?{{\\s*("+n+")-(color|contrast)-?(\\d\\.?\\d*)?\\s*}}(\"|')?","g"),s=/'?"?\{\{\s*([a-zA-Z]+)-(A?\d+|hue\-[0-3]|shadow)-?(\d\.?\d*)?(contrast)?\s*\}\}'?"?/g,u=m[i.name];return o=o.replace(s,function(t,n,o,r,i){return"foreground"===n?"shadow"==o?e.foregroundShadow:e.foregroundPalette[o]||e.foregroundPalette[1]:(0===o.indexOf("hue")&&(o=e.colors[n].hues[o]),l((m[e.colors[n].name][o]||"")[i?"contrast":"value"],r))}),t.forEach(i.hues,function(t,n){var i=o.replace(d,function(e,n,o,r,i){return l(u[t]["color"===r?"value":"contrast"],i)});if("default"!==n&&(i=i.replace(a,".md-"+e.name+"-theme.md-"+n)),"default"==e.name){var c=/((?:(?:(?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)+) )?)((?:(?:\w|\.|-)+)?)\.md-default-theme((?: |>|\.|\w|-|:|\(|\)|\[|\]|"|'|=)*)/g;i=i.replace(c,function(e,t,n,o){return e+", "+t+n+o})}r.push(i)}),r}function a(e){function n(e,n){var o=e.contrastDefaultColor,r=e.contrastLightColors||[],i=e.contrastStrongLightColors||[],a=e.contrastDarkColors||[];"string"==typeof r&&(r=r.split(" ")),"string"==typeof i&&(i=i.split(" ")),"string"==typeof a&&(a=a.split(" ")),delete e.contrastDefaultColor,delete e.contrastLightColors,delete e.contrastStrongLightColors,delete e.contrastDarkColors,t.forEach(e,function(n,d){function c(){return"light"===o?a.indexOf(d)>-1?v:i.indexOf(d)>-1?$:E:r.indexOf(d)>-1?i.indexOf(d)>-1?$:E:v}if(!t.isObject(n)){var l=s(n);if(!l)throw new Error("Color %1, in palette %2's hue %3, is invalid. Hex or rgb(a) color expected.".replace("%1",n).replace("%2",e.name).replace("%3",d));e[d]={value:l,contrast:c()}}})}var o=document.head,r=o?o.firstElementChild:null,i=e.has("$MD_THEME_CSS")?e.get("$MD_THEME_CSS"):"";if(r&&0!==i.length){t.forEach(m,n);var a=i.split(/\}(?!(\}|'|"|;))/).filter(function(e){return e&&e.length}).map(function(e){return e.trim()+"}"}),c=new RegExp("md-("+M.join("|")+")","g");M.forEach(function(e){_[e]=""}),a.forEach(function(e){for(var t,n=(e.match(c),0);t=M[n];n++)if(e.indexOf(".md-"+t)>-1)return _[t]+=e;for(n=0;t=M[n];n++)if(e.indexOf(t)>-1)return _[t]+=e;return _[y]+=e}),T||t.forEach(u,function(e){p[e.name]||d(e.name,w)})}}function d(e,t){var n=u[e],o=document.head,r=o?o.firstElementChild:null;p[e]||(M.forEach(function(e){for(var a=i(n,e,_[e]);a.length;){var d=a.shift();if(d){var c=document.createElement("style");c.setAttribute("md-theme-style",""),t&&c.setAttribute("nonce",t),c.appendChild(document.createTextNode(d)),o.insertBefore(c,r)}}}),n.colors.primary.name==n.colors.accent.name&&console.warn("$mdThemingProvider: Using the same palette for primary and accent. This violates the material design spec."),p[n.name]=!0)}function c(e,t){if(!m[(e.colors[t]||{}).name])throw new Error("You supplied an invalid color palette for theme %1's %2 palette. Available palettes: %3".replace("%1",e.name).replace("%2",t).replace("%3",Object.keys(m).join(", ")))}function s(e){if(t.isArray(e)&&3==e.length)return e;if(/^rgb/.test(e))return e.replace(/(^\s*rgba?\(|\)\s*$)/g,"").split(",").map(function(e,t){return 3==t?parseFloat(e,10):parseInt(e,10)});if("#"==e.charAt(0)&&(e=e.substring(1)),/^([a-fA-F0-9]{3}){1,2}$/g.test(e)){var n=e.length/3,o=e.substr(0,n),r=e.substr(n,n),i=e.substr(2*n);return 1===n&&(o+=o,r+=r,i+=i),[parseInt(o,16),parseInt(r,16),parseInt(i,16)]}}function l(e,n){return e?(4==e.length&&(e=t.copy(e),n?e.pop():n=e.pop()),n&&("number"==typeof n||"string"==typeof n&&n.length)?"rgba("+e.join(",")+","+n+")":"rgb("+e.join(",")+")"):"rgb('0,0,0')"}t.module("material.core.theming",["material.core.theming.palette"]).directive("mdTheme",o).directive("mdThemable",r).provider("$mdTheming",e).run(a);var m,u,p={},h={name:"dark",1:"rgba(0,0,0,0.87)",2:"rgba(0,0,0,0.54)",3:"rgba(0,0,0,0.38)",4:"rgba(0,0,0,0.12)"},f={name:"light",1:"rgba(255,255,255,1.0)",2:"rgba(255,255,255,0.7)",3:"rgba(255,255,255,0.5)",4:"rgba(255,255,255,0.12)"},g="1px 1px 0px rgba(0,0,0,0.4), -1px -1px 0px rgba(0,0,0,0.4)",b="",v=s("rgba(0,0,0,0.87)"),E=s("rgba(255,255,255,0.87)"),$=s("rgb(255,255,255)"),M=["primary","accent","warn","background"],y="primary",C={accent:{"default":"A200","hue-1":"A100","hue-2":"A400","hue-3":"A700"},background:{"default":"50","hue-1":"A100","hue-2":"100","hue-3":"300"}},A={background:{"default":"A400","hue-1":"800","hue-2":"900","hue-3":"A200"}};M.forEach(function(e){var t={"default":"500","hue-1":"300","hue-2":"800","hue-3":"A100"};C[e]||(C[e]=t),A[e]||(A[e]=t)});var k=["50","100","200","300","400","500","600","700","800","900","A100","A200","A400","A700"],T=!1,w=null;e.$inject=["$mdColorPalette"],o.$inject=["$mdTheming","$interpolate","$log"],r.$inject=["$mdTheming"];var _={};a.$inject=["$injector"]}(),function(){function e(e,n,o,r,i){var a;return a={translate3d:function(e,t,n,o){function r(n){return i(e,{to:n||t,addClass:o.transitionOutClass,removeClass:o.transitionInClass}).start()}return i(e,{from:t,to:n,addClass:o.transitionInClass}).start().then(function(){return r})},waitTransitionEnd:function(e,t){var i=3e3;return n(function(n,a){function d(t){t&&t.target!==e[0]||(t&&o.cancel(c),e.off(r.CSS.TRANSITIONEND,d),n())}t=t||{};var c=o(d,t.timeout||i);e.on(r.CSS.TRANSITIONEND,d)})},calculateZoomToOrigin:function(n,o){function r(){var e=n?n.parent():null,t=e?e.parent():null;return t?a.clientRect(t):null}var i=o.element,d=o.bounds,c="translate3d( {centerX}px, {centerY}px, 0 ) scale( {scaleX}, {scaleY} )",s=t.bind(null,e.supplant,c),l=s({centerX:0,centerY:0,scaleX:.5,scaleY:.5});if(i||d){var m=i?a.clientRect(i)||r():a.copyRect(d),u=a.copyRect(n[0].getBoundingClientRect()),p=a.centerPointFor(u),h=a.centerPointFor(m);l=s({centerX:h.x-p.x,centerY:h.y-p.y,scaleX:Math.round(100*Math.min(.5,m.width/u.width))/100,scaleY:Math.round(100*Math.min(.5,m.height/u.height))/100})}return l},toCss:function(e){function n(e,n,r){t.forEach(n.split(" "),function(e){o[e]=r})}var o={},i="left top right bottom width height x y min-width min-height max-width max-height";return t.forEach(e,function(e,a){if(!t.isUndefined(e))if(i.indexOf(a)>=0)o[a]=e+"px";else switch(a){case"transition":n(a,r.CSS.TRANSITION,e);break;case"transform":n(a,r.CSS.TRANSFORM,e);break;case"transformOrigin":n(a,r.CSS.TRANSFORM_ORIGIN,e)}}),o},toTransformCss:function(e,n,o){var i={};return t.forEach(r.CSS.TRANSFORM.split(" "),function(t){i[t]=e}),n&&(o=o||"all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1) !important",i.transition=o),i},copyRect:function(e,n){return e?(n=n||{},t.forEach("left top right bottom width height".split(" "),function(t){n[t]=Math.round(e[t])}),n.width=n.width||n.right-n.left,n.height=n.height||n.bottom-n.top,n):null},clientRect:function(e){var n=t.element(e)[0].getBoundingClientRect(),o=function(e){return e&&e.width>0&&e.height>0};return o(n)?a.copyRect(n):null},centerPointFor:function(e){return e?{x:Math.round(e.left+e.width/2),y:Math.round(e.top+e.height/2)}:{x:0,y:0}}}}t.module("material.core").factory("$$mdAnimate",["$q","$timeout","$mdConstant","$animateCss",function(t,n,o,r){return function(i){return e(i,t,n,o,r)}}])}(),function(){t.version.minor>=4?t.module("material.core.animate",[]):!function(){function e(e){return e.replace(/-[a-z]/g,function(e){return e.charAt(1).toUpperCase()})}var n=t.forEach,o=t.isDefined(document.documentElement.style.WebkitAppearance),r=o?"-webkit-":"",i=(o?"webkitTransitionEnd ":"")+"transitionend",a=(o?"webkitAnimationEnd ":"")+"animationend",d=["$document",function(e){return function(){return e[0].body.clientWidth+1}}],c=["$$rAF",function(e){return function(){var t=!1;return e(function(){t=!0}),function(n){t?n():e(n)}}}],s=["$q","$$rAFMutex",function(e,o){function r(e){this.setHost(e),this._doneCallbacks=[],this._runInAnimationFrame=o(),this._state=0}var i=0,a=1,d=2;return r.prototype={setHost:function(e){this.host=e||{}},done:function(e){this._state===d?e():this._doneCallbacks.push(e)},progress:t.noop,getPromise:function(){if(!this.promise){var t=this;this.promise=e(function(e,n){t.done(function(t){t===!1?n():e()})})}return this.promise},then:function(e,t){return this.getPromise().then(e,t)},"catch":function(e){return this.getPromise()["catch"](e)},"finally":function(e){return this.getPromise()["finally"](e)},pause:function(){this.host.pause&&this.host.pause()},resume:function(){this.host.resume&&this.host.resume()},end:function(){this.host.end&&this.host.end(),this._resolve(!0)},cancel:function(){this.host.cancel&&this.host.cancel(),this._resolve(!1)},complete:function(e){var t=this;t._state===i&&(t._state=a,t._runInAnimationFrame(function(){t._resolve(e)}))},_resolve:function(e){this._state!==d&&(n(this._doneCallbacks,function(t){t(e)}),this._doneCallbacks.length=0,this._state=d)}},r}];t.module("material.core.animate",[]).factory("$$forceReflow",d).factory("$$AnimateRunner",s).factory("$$rAFMutex",c).factory("$animateCss",["$window","$$rAF","$$AnimateRunner","$$forceReflow","$$jqLite","$timeout",function(t,d,c,s,l,m){function u(o,d){var s=[],l=$(o);d.transitionStyle&&s.push([r+"transition",d.transitionStyle]),d.keyframeStyle&&s.push([r+"animation",d.keyframeStyle]),d.delay&&s.push([r+"transition-delay",d.delay+"s"]),d.duration&&s.push([r+"transition-duration",d.duration+"s"]);var u=d.keyframeStyle||d.to&&(d.duration>0||d.transitionStyle),f=!!d.addClass||!!d.removeClass,y=u||f;M(o,!0),v(o,d);var C,A,k=!1;return{close:t.close,start:function(){function t(){return k?void 0:(k=!0,C&&A&&o.off(C,A),p(o,d),b(o,d),n(s,function(t){l.style[e(t[0])]=""}),u.complete(!0),u)}var u=new c;return g(function(){if(M(o,!1),!y)return t();n(s,function(t){var n=t[0],o=t[1];l.style[e(n)]=o}),p(o,d);var c=h(o);if(0===c.duration)return t();var u=[];d.easing&&(c.transitionDuration&&u.push([r+"transition-timing-function",d.easing]),c.animationDuration&&u.push([r+"animation-timing-function",d.easing])),d.delay&&c.animationDelay&&u.push([r+"animation-delay",d.delay+"s"]),d.duration&&c.animationDuration&&u.push([r+"animation-duration",d.duration+"s"]),n(u,function(t){var n=t[0],o=t[1];l.style[e(n)]=o,s.push(t)});var f=c.delay,g=1e3*f,b=c.duration,v=1e3*b,$=Date.now();C=[],c.transitionDuration&&C.push(i),c.animationDuration&&C.push(a),C=C.join(" "),A=function(e){e.stopPropagation();var n=e.originalEvent||e,o=n.timeStamp||Date.now(),r=parseFloat(n.elapsedTime.toFixed(3));Math.max(o-$,0)>=g&&r>=b&&t()},o.on(C,A),E(o,d),m(t,g+1.5*v,!1)}),u}}}function p(e,t){t.addClass&&(l.addClass(e,t.addClass),t.addClass=null),t.removeClass&&(l.removeClass(e,t.removeClass),t.removeClass=null)}function h(e){function n(e){return o?"Webkit"+e.charAt(0).toUpperCase()+e.substr(1):e}var r=$(e),i=t.getComputedStyle(r),a=f(i[n("transitionDuration")]),d=f(i[n("animationDuration")]),c=f(i[n("transitionDelay")]),s=f(i[n("animationDelay")]);d*=parseInt(i[n("animationIterationCount")],10)||1;var l=Math.max(d,a),m=Math.max(s,c);return{duration:l,delay:m,animationDuration:d,transitionDuration:a,animationDelay:s,transitionDelay:c}}function f(e){var t=0,o=(e||"").split(/\s*,\s*/);return n(o,function(e){"s"==e.charAt(e.length-1)&&(e=e.substring(0,e.length-1)),e=parseFloat(e)||0,t=t?Math.max(e,t):e}),t}function g(e){y&&y(),C.push(e),y=d(function(){y=null;for(var e=s(),t=0;t<C.length;t++)C[t](e);C.length=0})}function b(e,t){v(e,t),E(e,t)}function v(e,t){t.from&&(e.css(t.from),t.from=null)}function E(e,t){t.to&&(e.css(t.to),t.to=null)}function $(e){for(var t=0;t<e.length;t++)if(1===e[t].nodeType)return e[t]}function M(t,n){var o=$(t),i=e(r+"transition-delay");o.style[i]=n?"-9999s":""}var y,C=[];return u}])}()}(),function(){t.module("material.components.autocomplete",["material.core","material.components.icon","material.components.virtualRepeat"])}(),function(){function e(e){return{restrict:"E",link:function(t,n,o){t.$on("$destroy",function(){e.destroy()})}}}function n(e){function n(e,n,i,a,d,c,s){function l(o,r,s,l){r=i.extractElementByName(r,"md-bottom-sheet"),r.attr("tabindex","-1"),s.disableBackdrop||(p=i.createBackdrop(o,"_md-bottom-sheet-backdrop md-opaque"),p[0].tabIndex=-1,s.clickOutsideToClose&&p.on("click",function(){i.nextTick(d.cancel,!0)}),a.inherit(p,s.parent),e.enter(p,s.parent,null));var m=new u(r,s.parent);return s.bottomSheet=m,a.inherit(m.element,s.parent),s.disableParentScroll&&(s.restoreScroll=i.disableScrollAround(m.element,s.parent)),e.enter(m.element,s.parent,p).then(function(){var e=i.findFocusTarget(r)||t.element(r[0].querySelector("button")||r[0].querySelector("a")||r[0].querySelector("[ng-click]"))||p;s.escapeToClose&&(s.rootElementKeyupCallback=function(e){e.keyCode===n.KEY_CODE.ESCAPE&&i.nextTick(d.cancel,!0)},c.on("keyup",s.rootElementKeyupCallback),e&&e.focus())})}function m(t,n,o){var r=o.bottomSheet;return o.disableBackdrop||e.leave(p),e.leave(r.element).then(function(){o.disableParentScroll&&(o.restoreScroll(),delete o.restoreScroll),r.cleanup()})}function u(e,t){function a(t){e.css(n.CSS.TRANSITION_DURATION,"0ms")}function c(t){var o=t.pointer.distanceY;5>o&&(o=Math.max(-r,o/2)),e.css(n.CSS.TRANSFORM,"translate3d(0,"+(r+o)+"px,0)")}function l(t){if(t.pointer.distanceY>0&&(t.pointer.distanceY>20||Math.abs(t.pointer.velocityY)>o)){var r=e.prop("offsetHeight")-t.pointer.distanceY,a=Math.min(r/t.pointer.velocityY*.75,500);e.css(n.CSS.TRANSITION_DURATION,a+"ms"),i.nextTick(d.cancel,!0)}else e.css(n.CSS.TRANSITION_DURATION,""),e.css(n.CSS.TRANSFORM,"")}var m=s.register(t,"drag",{horizontal:!1});return t.on("$md.dragstart",a).on("$md.drag",c).on("$md.dragend",l),{element:e,cleanup:function(){m(),t.off("$md.dragstart",a),t.off("$md.drag",c),t.off("$md.dragend",l)}}}var p;return{themable:!0,onShow:l,onRemove:m,disableBackdrop:!1,escapeToClose:!0,clickOutsideToClose:!0,disableParentScroll:!0}}var o=.5,r=80;return n.$inject=["$animate","$mdConstant","$mdUtil","$mdTheming","$mdBottomSheet","$rootElement","$mdGesture"],e("$mdBottomSheet").setDefaults({methods:["disableParentScroll","escapeToClose","clickOutsideToClose"],options:n})}t.module("material.components.bottomSheet",["material.core","material.components.backdrop"]).directive("mdBottomSheet",e).provider("$mdBottomSheet",n),e.$inject=["$mdBottomSheet"],n.$inject=["$$interimElementProvider"]}(),function(){t.module("material.components.backdrop",["material.core"]).directive("mdBackdrop",["$mdTheming","$animate","$rootElement","$window","$log","$$rAF","$document",function(e,t,n,o,r,i,a){function d(d,s,l){var m=o.getComputedStyle(a[0].body);if("fixed"==m.position){var u=parseInt(m.height,10)+Math.abs(parseInt(m.top,10));s.css({height:u+"px"})}t.pin&&t.pin(s,n),i(function(){var t=s.parent()[0];if(t){"BODY"==t.nodeName&&s.css({position:"fixed"});var n=o.getComputedStyle(t);"static"==n.position&&r.warn(c)}s.parent().length&&e.inherit(s,s.parent())})}var c="<md-backdrop> may not work properly in a scrolled, static-positioned parent container.";return{restrict:"E",link:d}}])}(),function(){function e(e,n,o,r){function i(e){return t.isDefined(e.href)||t.isDefined(e.ngHref)||t.isDefined(e.ngLink)||t.isDefined(e.uiSref)}function a(e,t){if(i(t))return'<a class="md-button" ng-transclude></a>';var n="undefined"==typeof t.type?"button":t.type;return'<button class="md-button" type="'+n+'" ng-transclude></button>'}function d(a,d,c){n(d),e.attach(a,d),o.expectWithText(d,"aria-label"),i(c)&&t.isDefined(c.ngDisabled)&&a.$watch(c.ngDisabled,function(e){d.attr("tabindex",e?-1:0)}),d.on("click",function(e){c.disabled===!0&&(e.preventDefault(),e.stopImmediatePropagation())}),t.isDefined(c.mdNoFocusStyle)||(a.mouseActive=!1,d.on("mousedown",function(){a.mouseActive=!0,r(function(){a.mouseActive=!1},100)}).on("focus",function(){a.mouseActive===!1&&d.addClass("md-focused")}).on("blur",function(e){d.removeClass("md-focused")}))}return{restrict:"EA",replace:!0,transclude:!0,template:a,link:d}}t.module("material.components.button",["material.core"]).directive("mdButton",e),e.$inject=["$mdButtonInkRipple","$mdTheming","$mdAria","$timeout"]}(),function(){function e(e){return{restrict:"E",link:function(t,n){e(n)}}}t.module("material.components.card",["material.core"]).directive("mdCard",e),
e.$inject=["$mdTheming"]}(),function(){function e(e,n,o,r,i,a){function d(d,s){var l=d.children(),m=s.hasOwnProperty("mdIndeterminate");return s.type="checkbox",s.tabindex=s.tabindex||"0",d.attr("role",s.type),d.on("click",function(e){this.hasAttribute("disabled")&&e.stopImmediatePropagation()}),l.on("focus",function(){d.focus()}),function(d,s,l,u){function p(e,t,n){l[e]&&d.$watch(l[e],function(e){n[e]&&s.attr(t,n[e])})}function h(e){var t=e.which||e.keyCode;t!==o.KEY_CODE.SPACE&&t!==o.KEY_CODE.ENTER||(e.preventDefault(),s.hasClass("md-focused")||s.addClass("md-focused"),f(e))}function f(e){s[0].hasAttribute("disabled")||d.$apply(function(){var t=l.ngChecked?l.checked:!u.$viewValue;u.$setViewValue(t,e&&e.type),u.$render()})}function g(){u.$viewValue&&!v?s.addClass(c):s.removeClass(c)}function b(e){v=e!==!1,v&&s.attr("aria-checked","mixed"),s.toggleClass("md-indeterminate",v)}var v;u=u||i.fakeNgModel(),r(s),m&&(b(),d.$watch(l.mdIndeterminate,b)),l.ngChecked&&d.$watch(d.$eval.bind(d,l.ngChecked),u.$setViewValue.bind(u)),p("ngDisabled","tabindex",{"true":"-1","false":l.tabindex}),n.expectWithText(s,"aria-label"),e.link.pre(d,{on:t.noop,0:{}},l,[u]),d.mouseActive=!1,s.on("click",f).on("keypress",h).on("mousedown",function(){d.mouseActive=!0,a(function(){d.mouseActive=!1},100)}).on("focus",function(){d.mouseActive===!1&&s.addClass("md-focused")}).on("blur",function(){s.removeClass("md-focused")}),u.$render=g}}e=e[0];var c="md-checked";return{restrict:"E",transclude:!0,require:"?ngModel",priority:210,template:'<div class="_md-container" md-ink-ripple md-ink-ripple-checkbox><div class="_md-icon"></div></div><div ng-transclude class="_md-label"></div>',compile:d}}t.module("material.components.checkbox",["material.core"]).directive("mdCheckbox",e),e.$inject=["inputDirective","$mdAria","$mdConstant","$mdTheming","$mdUtil","$timeout"]}(),function(){t.module("material.components.chips",["material.core","material.components.autocomplete"])}(),function(){function e(e){function t(e,t){this.$scope=e,this.$element=t}return{restrict:"E",controller:["$scope","$element",t],link:function(t,o,r){o[0];e(o),t.$broadcast("$mdContentLoaded",o),n(o[0])}}}function n(e){t.element(e).on("$md.pressdown",function(t){"t"===t.pointer.type&&(t.$materialScrollFixed||(t.$materialScrollFixed=!0,0===e.scrollTop?e.scrollTop=1:e.scrollHeight===e.scrollTop+e.offsetHeight&&(e.scrollTop-=1)))})}t.module("material.components.content",["material.core"]).directive("mdContent",e),e.$inject=["$mdTheming"]}(),function(){!function(){function e(){return{template:'<table aria-hidden="true" class="md-calendar-day-header"><thead></thead></table><div class="md-calendar-scroll-mask"><md-virtual-repeat-container class="md-calendar-scroll-container" md-offset-size="'+(r-o)+'"><table role="grid" tabindex="0" class="md-calendar" aria-readonly="true"><tbody role="rowgroup" md-virtual-repeat="i in ctrl.items" md-calendar-month md-month-offset="$index" class="md-calendar-month" md-start-index="ctrl.getSelectedMonthIndex()" md-item-size="'+o+'"></tbody></table></md-virtual-repeat-container></div>',scope:{minDate:"=mdMinDate",maxDate:"=mdMaxDate",dateFilter:"=mdDateFilter"},require:["ngModel","mdCalendar"],controller:n,controllerAs:"ctrl",bindToController:!0,link:function(e,t,n,o){var r=o[0],i=o[1];i.configureNgModel(r)}}}function n(e,t,n,o,r,i,a,c,s,l,m){if(a(e),this.items={length:2e3},this.maxDate&&this.minDate){var u=c.getMonthDistance(this.minDate,this.maxDate)+1;u=Math.max(u,1),u+=1,this.items.length=u}if(this.$animate=o,this.$q=r,this.$mdInkRipple=l,this.$mdUtil=m,this.keyCode=i.KEY_CODE,this.dateUtil=c,this.dateLocale=s,this.$element=e,this.$scope=n,this.calendarElement=e[0].querySelector(".md-calendar"),this.calendarScroller=e[0].querySelector(".md-virtual-repeat-scroller"),this.today=this.dateUtil.createDateAtMidnight(),this.firstRenderableDate=this.dateUtil.incrementMonths(this.today,-this.items.length/2),this.minDate&&this.minDate>this.firstRenderableDate)this.firstRenderableDate=this.minDate;else if(this.maxDate){this.items.length-2;this.firstRenderableDate=this.dateUtil.incrementMonths(this.maxDate,-(this.items.length-2))}this.id=d++,this.ngModelCtrl=null,this.selectedDate=null,this.displayDate=null,this.focusDate=null,this.isInitialized=!1,this.isMonthTransitionInProgress=!1,t.tabindex||e.attr("tabindex","-1");var p=this;this.cellClickHandler=function(){var e=this;this.hasAttribute("data-timestamp")&&n.$apply(function(){var t=Number(e.getAttribute("data-timestamp"));p.setNgModelValue(p.dateUtil.createDateAtMidnight(t))})},this.attachCalendarEventListeners()}t.module("material.components.datepicker",["material.core","material.components.icon","material.components.virtualRepeat"]).directive("mdCalendar",e);var o=265,r=45,i="md-calendar-selected-date",a="md-focus",d=0;n.$inject=["$element","$attrs","$scope","$animate","$q","$mdConstant","$mdTheming","$$mdDateUtil","$mdDateLocale","$mdInkRipple","$mdUtil"],n.prototype.configureNgModel=function(e){this.ngModelCtrl=e;var t=this;e.$render=function(){t.changeSelectedDate(t.ngModelCtrl.$viewValue)}},n.prototype.buildInitialCalendarDisplay=function(){this.buildWeekHeader(),this.hideVerticalScrollbar(),this.displayDate=this.selectedDate||this.today,this.isInitialized=!0},n.prototype.hideVerticalScrollbar=function(){var e=this.$element[0],t=e.querySelector(".md-calendar-scroll-mask"),n=this.calendarScroller,o=e.querySelector(".md-calendar-day-header").clientWidth,r=n.offsetWidth-n.clientWidth;t.style.width=o+"px",n.style.width=o+r+"px",n.style.paddingRight=r+"px"},n.prototype.attachCalendarEventListeners=function(){this.$element.on("keydown",t.bind(this,this.handleKeyEvent))},n.prototype.handleKeyEvent=function(e){var t=this;this.$scope.$apply(function(){if(e.which==t.keyCode.ESCAPE||e.which==t.keyCode.TAB)return t.$scope.$emit("md-calendar-close"),void(e.which==t.keyCode.TAB&&e.preventDefault());if(e.which===t.keyCode.ENTER)return t.setNgModelValue(t.displayDate),void e.preventDefault();var n=t.getFocusDateFromKeyEvent(e);n&&(n=t.boundDateByMinAndMax(n),e.preventDefault(),e.stopPropagation(),t.changeDisplayDate(n).then(function(){t.focus(n)}))})},n.prototype.getFocusDateFromKeyEvent=function(e){var t=this.dateUtil,n=this.keyCode;switch(e.which){case n.RIGHT_ARROW:return t.incrementDays(this.displayDate,1);case n.LEFT_ARROW:return t.incrementDays(this.displayDate,-1);case n.DOWN_ARROW:return e.metaKey?t.incrementMonths(this.displayDate,1):t.incrementDays(this.displayDate,7);case n.UP_ARROW:return e.metaKey?t.incrementMonths(this.displayDate,-1):t.incrementDays(this.displayDate,-7);case n.PAGE_DOWN:return t.incrementMonths(this.displayDate,1);case n.PAGE_UP:return t.incrementMonths(this.displayDate,-1);case n.HOME:return t.getFirstDateOfMonth(this.displayDate);case n.END:return t.getLastDateOfMonth(this.displayDate);default:return null}},n.prototype.getSelectedMonthIndex=function(){return this.dateUtil.getMonthDistance(this.firstRenderableDate,this.selectedDate||this.today)},n.prototype.scrollToMonth=function(e){if(this.dateUtil.isValidDate(e)){var t=this.dateUtil.getMonthDistance(this.firstRenderableDate,e);this.calendarScroller.scrollTop=t*o}},n.prototype.setNgModelValue=function(e){this.$scope.$emit("md-calendar-change",e),this.ngModelCtrl.$setViewValue(e),this.ngModelCtrl.$render()},n.prototype.focus=function(e){var t=e||this.selectedDate||this.today,n=this.calendarElement.querySelector(".md-focus");n&&n.classList.remove(a);var o=this.getDateId(t),r=document.getElementById(o);r?(r.classList.add(a),r.focus()):this.focusDate=t},n.prototype.boundDateByMinAndMax=function(e){var t=e;return this.minDate&&e<this.minDate&&(t=new Date(this.minDate.getTime())),this.maxDate&&e>this.maxDate&&(t=new Date(this.maxDate.getTime())),t},n.prototype.changeSelectedDate=function(e){var t=this,n=this.selectedDate;this.selectedDate=e,this.changeDisplayDate(e).then(function(){if(n){var o=document.getElementById(t.getDateId(n));o&&(o.classList.remove(i),o.setAttribute("aria-selected","false"))}if(e){var r=document.getElementById(t.getDateId(e));r&&(r.classList.add(i),r.setAttribute("aria-selected","true"))}})},n.prototype.changeDisplayDate=function(e){if(!this.isInitialized)return this.buildInitialCalendarDisplay(),this.$q.when();if(!this.dateUtil.isValidDate(e)||this.isMonthTransitionInProgress)return this.$q.when();this.isMonthTransitionInProgress=!0;var t=this.animateDateChange(e);this.displayDate=e;var n=this;return t.then(function(){n.isMonthTransitionInProgress=!1}),t},n.prototype.animateDateChange=function(e){return this.scrollToMonth(e),this.$q.when()},n.prototype.buildWeekHeader=function(){for(var e=this.dateLocale.firstDayOfWeek,t=this.dateLocale.shortDays,n=document.createElement("tr"),o=0;7>o;o++){var r=document.createElement("th");r.textContent=t[(o+e)%7],n.appendChild(r)}this.$element.find("thead").append(n)},n.prototype.getDateId=function(e){return["md",this.id,e.getFullYear(),e.getMonth(),e.getDate()].join("-")}}()}(),function(){!function(){function e(){return{require:["^^mdCalendar","mdCalendarMonth"],scope:{offset:"=mdMonthOffset"},controller:n,controllerAs:"mdMonthCtrl",bindToController:!0,link:function(e,t,n,o){var r=o[0],i=o[1];i.calendarCtrl=r,i.generateContent(),e.$watch(function(){return i.offset},function(e,t){e!=t&&i.generateContent()})}}}function n(e,t,n){this.dateUtil=t,this.dateLocale=n,this.$element=e,this.calendarCtrl=null,this.offset,this.focusAfterAppend=null}t.module("material.components.datepicker").directive("mdCalendarMonth",e);var o="md-calendar-date-today",r="md-calendar-selected-date",i="md-focus";n.$inject=["$element","$$mdDateUtil","$mdDateLocale"],n.prototype.generateContent=function(){var e=this.calendarCtrl,t=this.dateUtil.incrementMonths(e.firstRenderableDate,this.offset);this.$element.empty(),this.$element.append(this.buildCalendarForMonth(t)),this.focusAfterAppend&&(this.focusAfterAppend.classList.add(i),this.focusAfterAppend.focus(),this.focusAfterAppend=null)},n.prototype.buildDateCell=function(e){var t=this.calendarCtrl,n=document.createElement("td");if(n.tabIndex=-1,n.classList.add("md-calendar-date"),n.setAttribute("role","gridcell"),e){n.setAttribute("tabindex","-1"),n.setAttribute("aria-label",this.dateLocale.longDateFormatter(e)),n.id=t.getDateId(e),n.setAttribute("data-timestamp",e.getTime()),this.dateUtil.isSameDay(e,t.today)&&n.classList.add(o),this.dateUtil.isValidDate(t.selectedDate)&&this.dateUtil.isSameDay(e,t.selectedDate)&&(n.classList.add(r),n.setAttribute("aria-selected","true"));var i=this.dateLocale.dates[e.getDate()];if(this.isDateEnabled(e)){var a=document.createElement("span");n.appendChild(a),a.classList.add("md-calendar-date-selection-indicator"),a.textContent=i,n.addEventListener("click",t.cellClickHandler),t.focusDate&&this.dateUtil.isSameDay(e,t.focusDate)&&(this.focusAfterAppend=n)}else n.classList.add("md-calendar-date-disabled"),n.textContent=i}return n},n.prototype.isDateEnabled=function(e){return this.dateUtil.isDateWithinRange(e,this.calendarCtrl.minDate,this.calendarCtrl.maxDate)&&(!t.isFunction(this.calendarCtrl.dateFilter)||this.calendarCtrl.dateFilter(e))},n.prototype.buildDateRow=function(e){var t=document.createElement("tr");return t.setAttribute("role","row"),t.setAttribute("aria-label",this.dateLocale.weekNumberFormatter(e)),t},n.prototype.buildCalendarForMonth=function(e){var t=this.dateUtil.isValidDate(e)?e:new Date,n=this.dateUtil.getFirstDateOfMonth(t),o=this.getLocaleDay_(n),r=this.dateUtil.getNumberOfDaysInMonth(t),i=document.createDocumentFragment(),a=1,d=this.buildDateRow(a);i.appendChild(d);var c=this.offset===this.calendarCtrl.items.length-1,s=0,l=document.createElement("td");if(l.classList.add("md-calendar-month-label"),this.calendarCtrl.maxDate&&n>this.calendarCtrl.maxDate&&l.classList.add("md-calendar-month-label-disabled"),l.textContent=this.dateLocale.monthHeaderFormatter(t),2>=o){l.setAttribute("colspan","7");var m=this.buildDateRow();if(m.appendChild(l),i.insertBefore(m,d),c)return i}else s=2,l.setAttribute("colspan","2"),d.appendChild(l);for(var u=s;o>u;u++)d.appendChild(this.buildDateCell());for(var p=o,h=n,f=1;r>=f;f++){if(7===p){if(c)return i;p=0,a++,d=this.buildDateRow(a),i.appendChild(d)}h.setDate(f);var g=this.buildDateCell(h);d.appendChild(g),p++}for(;d.childNodes.length<7;)d.appendChild(this.buildDateCell());for(;i.childNodes.length<6;){for(var b=this.buildDateRow(),u=0;7>u;u++)b.appendChild(this.buildDateCell());i.appendChild(b)}return i},n.prototype.getLocaleDay_=function(e){return(e.getDay()+(7-this.dateLocale.firstDayOfWeek))%7}}()}(),function(){!function(){t.module("material.components.datepicker").config(["$provide",function(e){function t(){this.months=null,this.shortMonths=null,this.days=null,this.shortDays=null,this.dates=null,this.firstDayOfWeek=0,this.formatDate=null,this.parseDate=null,this.monthHeaderFormatter=null,this.weekNumberFormatter=null,this.longDateFormatter=null,this.msgCalendar="",this.msgOpenCalendar=""}t.prototype.$get=function(e){function t(e){if(!e)return"";var t=e.toLocaleTimeString(),n=e;return 0!=e.getHours()||-1===t.indexOf("11:")&&-1===t.indexOf("23:")||(n=new Date(e.getFullYear(),e.getMonth(),e.getDate(),1,0,0)),n.toLocaleDateString()}function n(e){return new Date(e)}function o(e){e=e.trim();var t=/^(([a-zA-Z]{3,}|[0-9]{1,4})([ \.,]+|[\/\-])){2}([a-zA-Z]{3,}|[0-9]{1,4})$/;return t.test(e)}function r(e){return u.shortMonths[e.getMonth()]+" "+e.getFullYear()}function i(e){return"Week "+e}function a(e){return[u.days[e.getDay()],u.months[e.getMonth()],u.dates[e.getDate()],e.getFullYear()].join(" ")}for(var d=e.DATETIME_FORMATS.DAY.map(function(e){return e[0]}),c=Array(32),s=1;31>=s;s++)c[s]=s;var l="Calendar",m="Open calendar",u={months:this.months||e.DATETIME_FORMATS.MONTH,shortMonths:this.shortMonths||e.DATETIME_FORMATS.SHORTMONTH,days:this.days||e.DATETIME_FORMATS.DAY,shortDays:this.shortDays||d,dates:this.dates||c,firstDayOfWeek:this.firstDayOfWeek||0,formatDate:this.formatDate||t,parseDate:this.parseDate||n,isDateComplete:this.isDateComplete||o,monthHeaderFormatter:this.monthHeaderFormatter||r,weekNumberFormatter:this.weekNumberFormatter||i,longDateFormatter:this.longDateFormatter||a,msgCalendar:this.msgCalendar||l,msgOpenCalendar:this.msgOpenCalendar||m};return u},t.prototype.$get.$inject=["$locale"],e.provider("$mdDateLocale",new t)}])}()}(),function(){!function(){function n(){return{template:'<md-button class="md-datepicker-button md-icon-button" type="button" tabindex="-1" aria-hidden="true" ng-click="ctrl.openCalendarPane($event)"><md-icon class="md-datepicker-calendar-icon" md-svg-icon="md-calendar"></md-icon></md-button><div class="md-datepicker-input-container" ng-class="{\'md-datepicker-focused\': ctrl.isFocused}"><input class="md-datepicker-input" aria-haspopup="true" ng-focus="ctrl.setFocused(true)" ng-blur="ctrl.setFocused(false)"><md-button type="button" md-no-ink class="md-datepicker-triangle-button md-icon-button" ng-click="ctrl.openCalendarPane($event)" aria-label="{{::ctrl.dateLocale.msgOpenCalendar}}"><div class="md-datepicker-expand-triangle"></div></md-button></div><div class="md-datepicker-calendar-pane md-whiteframe-z1"><div class="md-datepicker-input-mask"><div class="md-datepicker-input-mask-opaque"></div></div><div class="md-datepicker-calendar"><md-calendar role="dialog" aria-label="{{::ctrl.dateLocale.msgCalendar}}" md-min-date="ctrl.minDate" md-max-date="ctrl.maxDate"md-date-filter="ctrl.dateFilter"ng-model="ctrl.date" ng-if="ctrl.isCalendarOpen"></md-calendar></div></div>',require:["ngModel","mdDatepicker","?^mdInputContainer"],scope:{minDate:"=mdMinDate",maxDate:"=mdMaxDate",placeholder:"@mdPlaceholder",dateFilter:"=mdDateFilter"},controller:o,controllerAs:"ctrl",bindToController:!0,link:function(e,t,n,o){var r=o[0],i=o[1],a=o[2];if(a)throw Error("md-datepicker should not be placed inside md-input-container.");i.configureNgModel(r)}}}function o(e,n,o,r,i,a,d,c,s,l,m,u){this.$compile=r,this.$timeout=i,this.$window=a,this.dateLocale=l,this.dateUtil=m,this.$mdConstant=d,this.$mdUtil=s,this.$$rAF=u,this.documentElement=t.element(document.documentElement),this.ngModelCtrl=null,this.inputElement=n[0].querySelector("input"),this.ngInputElement=t.element(this.inputElement),this.inputContainer=n[0].querySelector(".md-datepicker-input-container"),this.calendarPane=n[0].querySelector(".md-datepicker-calendar-pane"),this.calendarButton=n[0].querySelector(".md-datepicker-button"),this.inputMask=n[0].querySelector(".md-datepicker-input-mask-opaque"),this.$element=n,this.$attrs=o,this.$scope=e,this.date=null,this.isFocused=!1,this.isDisabled,this.setDisabled(n[0].disabled||t.isString(o.disabled)),this.isCalendarOpen=!1,this.calendarPaneOpenedFrom=null,this.calendarPane.id="md-date-pane"+s.nextUid(),c(n),this.bodyClickHandler=t.bind(this,this.handleBodyClick),this.windowResizeHandler=s.debounce(t.bind(this,this.closeCalendarPane),100),o.tabindex||n.attr("tabindex","-1"),this.installPropertyInterceptors(),this.attachChangeListeners(),this.attachInteractionListeners();var p=this;e.$on("$destroy",function(){p.detachCalendarPane()})}t.module("material.components.datepicker").directive("mdDatepicker",n);var r=3,i="md-datepicker-invalid",a=500,d=368,c=360;o.$inject=["$scope","$element","$attrs","$compile","$timeout","$window","$mdConstant","$mdTheming","$mdUtil","$mdDateLocale","$$mdDateUtil","$$rAF"],o.prototype.configureNgModel=function(e){this.ngModelCtrl=e;var t=this;e.$render=function(){var e=t.ngModelCtrl.$viewValue;if(e&&!(e instanceof Date))throw Error("The ng-model for md-datepicker must be a Date instance. Currently the model is a: "+typeof e);t.date=e,t.inputElement.value=t.dateLocale.formatDate(e),t.resizeInputElement(),t.updateErrorState()}},o.prototype.attachChangeListeners=function(){var e=this;e.$scope.$on("md-calendar-change",function(t,n){e.ngModelCtrl.$setViewValue(n),e.date=n,e.inputElement.value=e.dateLocale.formatDate(n),e.closeCalendarPane(),e.resizeInputElement(),e.updateErrorState()}),e.ngInputElement.on("input",t.bind(e,e.resizeInputElement)),e.ngInputElement.on("input",e.$mdUtil.debounce(e.handleInputEvent,a,e))},o.prototype.attachInteractionListeners=function(){var e=this,t=this.$scope,n=this.$mdConstant.KEY_CODE;e.ngInputElement.on("keydown",function(o){o.altKey&&o.keyCode==n.DOWN_ARROW&&(e.openCalendarPane(o),t.$digest())}),t.$on("md-calendar-close",function(){e.closeCalendarPane()})},o.prototype.installPropertyInterceptors=function(){var e=this;if(this.$attrs.ngDisabled){var t=this.$scope.$parent;t&&t.$watch(this.$attrs.ngDisabled,function(t){e.setDisabled(t)})}Object.defineProperty(this,"placeholder",{get:function(){return e.inputElement.placeholder},set:function(t){e.inputElement.placeholder=t||""}})},o.prototype.setDisabled=function(e){this.isDisabled=e,this.inputElement.disabled=e,this.calendarButton.disabled=e},o.prototype.updateErrorState=function(e){var n=e||this.date;if(this.clearErrorState(),this.dateUtil.isValidDate(n)){if(n=this.dateUtil.createDateAtMidnight(n),this.dateUtil.isValidDate(this.minDate)){var o=this.dateUtil.createDateAtMidnight(this.minDate);this.ngModelCtrl.$setValidity("mindate",n>=o)}if(this.dateUtil.isValidDate(this.maxDate)){var r=this.dateUtil.createDateAtMidnight(this.maxDate);this.ngModelCtrl.$setValidity("maxdate",r>=n)}t.isFunction(this.dateFilter)&&this.ngModelCtrl.$setValidity("filtered",this.dateFilter(n))}else this.ngModelCtrl.$setValidity("valid",null==n);this.ngModelCtrl.$valid||this.inputContainer.classList.add(i)},o.prototype.clearErrorState=function(){this.inputContainer.classList.remove(i),["mindate","maxdate","filtered","valid"].forEach(function(e){this.ngModelCtrl.$setValidity(e,!0)},this)},o.prototype.resizeInputElement=function(){this.inputElement.size=this.inputElement.value.length+r},o.prototype.handleInputEvent=function(){var e=this.inputElement.value,t=e?this.dateLocale.parseDate(e):null;this.dateUtil.setDateTimeToMidnight(t);var n=""==e||this.dateUtil.isValidDate(t)&&this.dateLocale.isDateComplete(e)&&this.isDateEnabled(t);n&&(this.ngModelCtrl.$setViewValue(t),this.date=t),this.updateErrorState(t)},o.prototype.isDateEnabled=function(e){return this.dateUtil.isDateWithinRange(e,this.minDate,this.maxDate)&&(!t.isFunction(this.dateFilter)||this.dateFilter(e))},o.prototype.attachCalendarPane=function(){var e=this.calendarPane;e.style.transform="",this.$element.addClass("md-datepicker-open");var t=this.inputContainer.getBoundingClientRect(),n=document.body.getBoundingClientRect(),o=t.top-n.top,r=t.left-n.left,i=n.top<0&&0==document.body.scrollTop?-n.top:document.body.scrollTop,a=n.left<0&&0==document.body.scrollLeft?-n.left:document.body.scrollLeft,s=i+this.$window.innerHeight,l=a+this.$window.innerWidth;if(r+c>l){if(l-c>0)r=l-c;else{r=a;var m=this.$window.innerWidth/c;e.style.transform="scale("+m+")"}e.classList.add("md-datepicker-pos-adjusted")}o+d>s&&s-d>i&&(o=s-d,e.classList.add("md-datepicker-pos-adjusted")),e.style.left=r+"px",e.style.top=o+"px",document.body.appendChild(e),this.inputMask.style.left=t.width+"px",this.$$rAF(function(){e.classList.add("md-pane-open")})},o.prototype.detachCalendarPane=function(){this.$element.removeClass("md-datepicker-open"),this.calendarPane.classList.remove("md-pane-open"),this.calendarPane.classList.remove("md-datepicker-pos-adjusted"),this.isCalendarOpen&&this.$mdUtil.enableScrolling(),this.calendarPane.parentNode&&this.calendarPane.parentNode.removeChild(this.calendarPane)},o.prototype.openCalendarPane=function(t){if(!this.isCalendarOpen&&!this.isDisabled){this.isCalendarOpen=!0,this.calendarPaneOpenedFrom=t.target,this.$mdUtil.disableScrollAround(this.calendarPane),this.attachCalendarPane(),this.focusCalendar();var n=this;this.$mdUtil.nextTick(function(){n.documentElement.on("click touchstart",n.bodyClickHandler)},!1),e.addEventListener("resize",this.windowResizeHandler)}},o.prototype.closeCalendarPane=function(){this.isCalendarOpen&&(this.detachCalendarPane(),this.isCalendarOpen=!1,this.calendarPaneOpenedFrom.focus(),this.calendarPaneOpenedFrom=null,this.ngModelCtrl.$setTouched(),this.documentElement.off("click touchstart",this.bodyClickHandler),e.removeEventListener("resize",this.windowResizeHandler))},o.prototype.getCalendarCtrl=function(){return t.element(this.calendarPane.querySelector("md-calendar")).controller("mdCalendar")},o.prototype.focusCalendar=function(){var e=this;this.$mdUtil.nextTick(function(){e.getCalendarCtrl().focus()},!1)},o.prototype.setFocused=function(e){e||this.ngModelCtrl.$setTouched(),this.isFocused=e},o.prototype.handleBodyClick=function(e){if(this.isCalendarOpen){var t=this.$mdUtil.getClosest(e.target,"md-calendar");t||this.closeCalendarPane(),this.$scope.$digest()}}}()}(),function(){!function(){t.module("material.components.datepicker").factory("$$mdDateUtil",function(){function e(e){return new Date(e.getFullYear(),e.getMonth(),1)}function n(e){return new Date(e.getFullYear(),e.getMonth()+1,0).getDate()}function o(e){return new Date(e.getFullYear(),e.getMonth()+1,1)}function r(e){return new Date(e.getFullYear(),e.getMonth()-1,1)}function i(e,t){return e.getFullYear()===t.getFullYear()&&e.getMonth()===t.getMonth()}function a(e,t){return e.getDate()==t.getDate()&&i(e,t)}function d(e,t){var n=o(e);return i(n,t)}function c(e,t){var n=r(e);return i(t,n)}function s(e,t){return b((e.getTime()+t.getTime())/2)}function l(t){var n=e(t);return Math.floor((n.getDay()+t.getDate()-1)/7)}function m(e,t){return new Date(e.getFullYear(),e.getMonth(),e.getDate()+t)}function u(e,t){var o=new Date(e.getFullYear(),e.getMonth()+t,1),r=n(o);return r<e.getDate()?o.setDate(r):o.setDate(e.getDate()),o}function p(e,t){return 12*(t.getFullYear()-e.getFullYear())+(t.getMonth()-e.getMonth())}function h(e){return new Date(e.getFullYear(),e.getMonth(),n(e))}function f(e){return null!=e&&e.getTime&&!isNaN(e.getTime())}function g(e){f(e)&&e.setHours(0,0,0,0)}function b(e){var n;return n=t.isUndefined(e)?new Date:new Date(e),g(n),n}function v(e,t,n){var o=b(e),r=f(t)?b(t):null,i=f(n)?b(n):null;return(!r||o>=r)&&(!i||i>=o)}return{getFirstDateOfMonth:e,getNumberOfDaysInMonth:n,getDateInNextMonth:o,getDateInPreviousMonth:r,isInNextMonth:d,isInPreviousMonth:c,getDateMidpoint:s,isSameMonthAndYear:i,getWeekOfMonth:l,incrementDays:m,incrementMonths:u,getLastDateOfMonth:h,isSameDay:a,getMonthDistance:p,isValidDate:f,setDateTimeToMidnight:g,createDateAtMidnight:b,isDateWithinRange:v}})}()}(),function(){function e(e,n,o){return{restrict:"E",link:function(r,i,a){n(i),e(function(){function e(){i.toggleClass("md-content-overflow",a.scrollHeight>a.clientHeight)}var n,a=i[0].querySelector("md-dialog-content");a&&(n=a.getElementsByTagName("img"),e(),t.element(n).on("load",e)),r.$on("$destroy",function(){o.destroy(i)})})}}}function o(e){function o(e,t,n){return{template:['<md-dialog md-theme="{{ dialog.theme }}" aria-label="{{ dialog.ariaLabel }}" ng-class="dialog.css">','  <md-dialog-content class="md-dialog-content" role="document" tabIndex="-1">','    <h2 class="md-title">{{ dialog.title }}</h2>','    <div ng-if="::dialog.mdHtmlContent" class="_md-dialog-content-body" ','        ng-bind-html="::dialog.mdHtmlContent"></div>','    <div ng-if="::!dialog.mdHtmlContent" class="_md-dialog-content-body">',"      <p>{{::dialog.mdTextContent}}</p>","    </div>",'    <md-input-container md-no-float ng-if="::dialog.$type == \'prompt\'" class="md-prompt-input-container">','      <input ng-keypress="dialog.keypress($event)" md-autofocus ng-model="dialog.result" placeholder="{{::dialog.placeholder}}">',"    </md-input-container>","  </md-dialog-content>","  <md-dialog-actions>",'    <md-button ng-if="dialog.$type === \'confirm\' || dialog.$type === \'prompt\'"               ng-click="dialog.abort()" class="md-primary">',"      {{ dialog.cancel }}","    </md-button>",'    <md-button ng-click="dialog.hide()" class="md-primary" md-autofocus="dialog.$type===\'alert\'">',"      {{ dialog.ok }}","    </md-button>","  </md-dialog-actions>","</md-dialog>"].join("").replace(/\s\s+/g,""),controller:function(){this.hide=function(){e.hide("prompt"===this.$type?this.result:!0)},this.abort=function(){e.cancel()},this.keypress=function(t){t.keyCode===n.KEY_CODE.ENTER&&e.hide(this.result)}},controllerAs:"dialog",bindToController:!0,theme:t.defaultTheme()}}function r(e,o,r,d,c,s,l,m,u,p){function h(e,t,n,o){if(o){if(o.mdHtmlContent=o.htmlContent||n.htmlContent||"",o.mdTextContent=o.textContent||n.textContent||o.content||n.content||"",o.mdHtmlContent&&!p.has("$sanitize"))throw Error("The ngSanitize module must be loaded in order to use htmlContent.");if(o.mdHtmlContent&&o.mdTextContent)throw Error("md-dialog cannot have both `htmlContent` and `textContent`")}}function f(e,n,o,i){function a(){var e=n[0].querySelectorAll(".md-actions");e.length>0&&u.warn("Using a class of md-actions is deprecated, please use <md-dialog-actions>.")}function d(){function e(){var e=n[0].querySelector(".dialog-close");if(!e){var o=n[0].querySelectorAll(".md-actions button, md-dialog-actions button");e=o[o.length-1]}return t.element(e)}if(o.focusOnOpen){var i=r.findFocusTarget(n)||e();i.focus()}}return t.element(s[0].body).addClass("md-dialog-is-showing"),b(o),$(n.find("md-dialog"),o),E(e,n,o),C(n,o).then(function(){v(n,o),M(n,o),a(),d()})}function g(e,n,o){function r(){return A(n,o)}function d(){t.element(s[0].body).removeClass("md-dialog-is-showing"),n.remove(),o.$destroy||o.origin.focus()}return o.deactivateListeners(),o.unlockScreenReader(),o.hideBackdrop(o.$destroy),i&&i.parentNode&&i.parentNode.removeChild(i),a&&a.parentNode&&a.parentNode.removeChild(a),o.$destroy?d():r().then(d)}function b(e){function o(e,o){var r=t.element(e||{});if(r&&r.length){var i={top:0,left:0,height:0,width:0},a=t.isFunction(r[0].getBoundingClientRect);return t.extend(o||{},{element:a?r:n,bounds:a?r[0].getBoundingClientRect():t.extend({},i,r[0]),focus:t.bind(r,r.focus)})}}function r(e,n){if(t.isString(e)){var o=e,r=s[0].querySelectorAll(o);e=r.length?r[0]:null}return t.element(e||n)}e.origin=t.extend({element:null,bounds:null,focus:t.noop},e.origin||{}),e.parent=r(e.parent,m),e.closeTo=o(r(e.closeTo)),e.openFrom=o(r(e.openFrom)),e.targetEvent&&(e.origin=o(e.targetEvent.target,e.origin))}function v(n,o){var i=t.element(l),a=r.debounce(function(){y(n,o)},60),c=[],s=function(){var t="alert"==o.$type?e.hide:e.cancel;r.nextTick(t,!0)};if(o.escapeToClose){var m=o.parent,u=function(e){e.keyCode===d.KEY_CODE.ESCAPE&&(e.stopPropagation(),e.preventDefault(),s())};n.on("keydown",u),m.on("keydown",u),c.push(function(){n.off("keydown",u),m.off("keydown",u)})}if(i.on("resize",a),c.push(function(){i.off("resize",a)}),o.clickOutsideToClose){var p,h=n,f=function(e){p=e.target},g=function(e){p===h[0]&&e.target===h[0]&&(e.stopPropagation(),e.preventDefault(),s())};h.on("mousedown",f),h.on("mouseup",g),c.push(function(){h.off("mousedown",f),h.off("mouseup",g)})}o.deactivateListeners=function(){c.forEach(function(e){e()}),o.deactivateListeners=null}}function E(e,t,n){n.disableParentScroll&&(n.restoreScroll=r.disableScrollAround(t,n.parent)),n.hasBackdrop&&(n.backdrop=r.createBackdrop(e,"_md-dialog-backdrop md-opaque"),c.enter(n.backdrop,n.parent)),n.hideBackdrop=function(e){n.backdrop&&(e?n.backdrop.remove():c.leave(n.backdrop)),n.disableParentScroll&&(n.restoreScroll(),delete n.restoreScroll),n.hideBackdrop=null}}function $(e,t){var n="alert"===t.$type?"alertdialog":"dialog",d=e.find("md-dialog-content"),c="dialogContent_"+(e.attr("id")||r.nextUid());e.attr({role:n,tabIndex:"-1"}),0===d.length&&(d=e),d.attr("id",c),e.attr("aria-describedby",c),t.ariaLabel?o.expect(e,"aria-label",t.ariaLabel):o.expectAsync(e,"aria-label",function(){var e=d.text().split(/\s+/);return e.length>3&&(e=e.slice(0,3).concat("...")),e.join(" ")}),i=document.createElement("div"),i.classList.add("_md-dialog-focus-trap"),i.tabIndex=0,a=i.cloneNode(!1);var s=function(){e.focus()};i.addEventListener("focus",s),a.addEventListener("focus",s),e[0].parentNode.insertBefore(i,e[0]),e.after(a)}function M(e,t){function n(e){for(;e.parentNode;){if(e===document.body)return;for(var t=e.parentNode.children,r=0;r<t.length;r++)e===t[r]||k(t[r],["SCRIPT","STYLE"])||t[r].setAttribute("aria-hidden",o);n(e=e.parentNode)}}var o=!0;n(e[0]),t.unlockScreenReader=function(){o=!1,n(e[0]),t.unlockScreenReader=null}}function y(e,t){var n="fixed"==l.getComputedStyle(s[0].body).position,o=t.backdrop?l.getComputedStyle(t.backdrop[0]):null,i=o?Math.min(s[0].body.clientHeight,Math.ceil(Math.abs(parseInt(o.height,10)))):0;return e.css({top:(n?r.scrollTop(t.parent):0)+"px",height:i?i+"px":"100%"}),e}function C(e,t){t.parent.append(e),y(e,t);var n=e.find("md-dialog"),o=r.dom.animator,i=o.calculateZoomToOrigin,a={transitionInClass:"_md-transition-in",transitionOutClass:"_md-transition-out"},d=o.toTransformCss(i(n,t.openFrom||t.origin)),c=o.toTransformCss("");return t.fullscreen&&n.addClass("md-dialog-fullscreen"),o.translate3d(n,d,c,a).then(function(e){return t.reverseAnimate=function(){return delete t.reverseAnimate,t.closeTo?(a={transitionInClass:"_md-transition-out",transitionOutClass:"_md-transition-in"},d=c,c=o.toTransformCss(i(n,t.closeTo)),o.translate3d(n,d,c,a)):e(o.toTransformCss(i(n,t.origin)))},!0})}function A(e,t){return t.reverseAnimate()}function k(e,t){return-1!==t.indexOf(e.nodeName)?!0:void 0}return{hasBackdrop:!0,isolateScope:!0,onShow:f,onShowing:h,onRemove:g,clickOutsideToClose:!1,escapeToClose:!0,targetEvent:null,closeTo:null,openFrom:null,focusOnOpen:!0,disableParentScroll:!0,autoWrap:!0,fullscreen:!1,transformTemplate:function(e,t){function n(e){return t.autoWrap&&!/<\/md-dialog>/g.test(e)?"<md-dialog>"+(e||"")+"</md-dialog>":e||""}return'<div class="md-dialog-container" tabindex="-1">'+n(e)+"</div>"}}}var i,a;return o.$inject=["$mdDialog","$mdTheming","$mdConstant"],r.$inject=["$mdDialog","$mdAria","$mdUtil","$mdConstant","$animate","$document","$window","$rootElement","$log","$injector"],e("$mdDialog").setDefaults({methods:["disableParentScroll","hasBackdrop","clickOutsideToClose","escapeToClose","targetEvent","closeTo","openFrom","parent","fullscreen"],
options:r}).addPreset("alert",{methods:["title","htmlContent","textContent","content","ariaLabel","ok","theme","css"],options:o}).addPreset("confirm",{methods:["title","htmlContent","textContent","content","ariaLabel","ok","cancel","theme","css"],options:o}).addPreset("prompt",{methods:["title","htmlContent","textContent","content","placeholder","ariaLabel","ok","cancel","theme","css"],options:o})}t.module("material.components.dialog",["material.core","material.components.backdrop"]).directive("mdDialog",e).provider("$mdDialog",o),e.$inject=["$$rAF","$mdTheming","$mdDialog"],o.$inject=["$$interimElementProvider"]}(),function(){function e(e){return{restrict:"E",link:e}}t.module("material.components.divider",["material.core"]).directive("mdDivider",e),e.$inject=["$mdTheming"]}(),function(){!function(){function e(){return{restrict:"E",require:["^?mdFabSpeedDial","^?mdFabToolbar"],compile:function(e,n){var o=e.children(),r=!1;t.forEach(["","data-","x-"],function(e){r=r||!!o.attr(e+"ng-repeat")}),r?o.addClass("md-fab-action-item"):o.wrap('<div class="md-fab-action-item">')}}}t.module("material.components.fabActions",["material.core"]).directive("mdFabActions",e)}()}(),function(){!function(){function e(e,n,o,r,i,a){function d(){N.direction=N.direction||"down",N.isOpen=N.isOpen||!1,l(),n.addClass("_md-animations-waiting")}function c(){var o=["click","focusin","focusout"];t.forEach(o,function(e){n.on(e,s)}),e.$on("$destroy",function(){t.forEach(o,function(e){n.off(e,s)}),h()})}function s(e){"click"==e.type&&w(e),"focusout"!=e.type||H||(H=a(function(){N.close()},100,!1)),"focusin"==e.type&&H&&(a.cancel(H),H=null)}function l(){N.currentActionIndex=-1}function m(){e.$watch("vm.direction",function(e,t){o.removeClass(n,"md-"+t),o.addClass(n,"md-"+e),l()});var t,r;e.$watch("vm.isOpen",function(e){l(),t&&r||(t=_(),r=x()),e?p():h();var i=e?"md-is-open":"",a=e?"":"md-is-open";t.attr("aria-haspopup",!0),t.attr("aria-expanded",e),r.attr("aria-hidden",!e),o.setClass(n,i,a)})}function u(){n[0].scrollHeight>0?o.addClass(n,"_md-animations-ready").then(function(){n.removeClass("_md-animations-waiting")}):10>S&&(a(u,100),S+=1)}function p(){n.on("keydown",g),r.nextTick(function(){t.element(document).on("click touchend",f)})}function h(){n.off("keydown",g),t.element(document).off("click touchend",f)}function f(e){if(e.target){var t=r.getClosest(e.target,"md-fab-trigger"),n=r.getClosest(e.target,"md-fab-actions");t||n||N.close()}}function g(e){switch(e.which){case i.KEY_CODE.ESCAPE:return N.close(),e.preventDefault(),!1;case i.KEY_CODE.LEFT_ARROW:return M(e),!1;case i.KEY_CODE.UP_ARROW:return y(e),!1;case i.KEY_CODE.RIGHT_ARROW:return C(e),!1;case i.KEY_CODE.DOWN_ARROW:return A(e),!1}}function b(e){E(e,-1)}function v(e){E(e,1)}function E(e,n){var o=$();N.currentActionIndex=N.currentActionIndex+n,N.currentActionIndex=Math.min(o.length-1,N.currentActionIndex),N.currentActionIndex=Math.max(0,N.currentActionIndex);var r=t.element(o[N.currentActionIndex]).children()[0];t.element(r).attr("tabindex",0),r.focus(),e.preventDefault(),e.stopImmediatePropagation()}function $(){var e=x()[0].querySelectorAll(".md-fab-action-item");return t.forEach(e,function(e){t.element(t.element(e).children()[0]).attr("tabindex",-1)}),e}function M(e){"left"===N.direction?v(e):b(e)}function y(e){"down"===N.direction?b(e):v(e)}function C(e){"left"===N.direction?b(e):v(e)}function A(e){"up"===N.direction?b(e):v(e)}function k(e){return r.getClosest(e,"md-fab-trigger")}function T(e){return r.getClosest(e,"md-fab-actions")}function w(e){k(e.target)&&N.toggle(),T(e.target)&&N.close()}function _(){return n.find("md-fab-trigger")}function x(){return n.find("md-fab-actions")}var N=this;N.open=function(){e.$evalAsync("vm.isOpen = true")},N.close=function(){e.$evalAsync("vm.isOpen = false"),n.find("md-fab-trigger")[0].focus()},N.toggle=function(){e.$evalAsync("vm.isOpen = !vm.isOpen")},d(),c(),m();var S=0;u();var H}t.module("material.components.fabShared",["material.core"]).controller("MdFabController",e),e.$inject=["$scope","$element","$animate","$mdUtil","$mdConstant","$timeout"]}()}(),function(){!function(){function n(){function e(e,t){t.prepend('<div class="_md-css-variables"></div>')}return{restrict:"E",scope:{direction:"@?mdDirection",isOpen:"=?mdOpen"},bindToController:!0,controller:"MdFabController",controllerAs:"vm",link:e}}function o(n){function o(e){n(e,i,!1)}function r(n){if(!n.hasClass("_md-animations-waiting")||n.hasClass("_md-animations-ready")){var o=n[0],r=n.controller("mdFabSpeedDial"),i=o.querySelectorAll(".md-fab-action-item"),a=o.querySelector("md-fab-trigger"),d=o.querySelector("._md-css-variables"),c=parseInt(e.getComputedStyle(d).zIndex);t.forEach(i,function(e,t){var n=e.style;n.transform=n.webkitTransform="",n.transitionDelay="",n.opacity=1,n.zIndex=i.length-t+c}),a.style.zIndex=c+i.length+1,r.isOpen||t.forEach(i,function(e,t){var n,o,i=e.style,d=(a.clientHeight-e.clientHeight)/2,c=(a.clientWidth-e.clientWidth)/2;switch(r.direction){case"up":n=e.scrollHeight*(t+1)+d,o="Y";break;case"down":n=-(e.scrollHeight*(t+1)+d),o="Y";break;case"left":n=e.scrollWidth*(t+1)+c,o="X";break;case"right":n=-(e.scrollWidth*(t+1)+c),o="X"}var s="translate"+o+"("+n+"px)";i.transform=i.webkitTransform=s})}}return{addClass:function(e,t,n){e.hasClass("md-fling")?(r(e),o(n)):n()},removeClass:function(e,t,n){r(e),o(n)}}}function r(n){function o(e){n(e,i,!1)}function r(n){var o=n[0],r=n.controller("mdFabSpeedDial"),i=o.querySelectorAll(".md-fab-action-item"),d=o.querySelector("._md-css-variables"),c=parseInt(e.getComputedStyle(d).zIndex);t.forEach(i,function(e,t){var n=e.style,o=t*a;n.opacity=r.isOpen?1:0,n.transform=n.webkitTransform=r.isOpen?"scale(1)":"scale(0)",n.transitionDelay=(r.isOpen?o:i.length-o)+"ms",n.zIndex=i.length-t+c})}var a=65;return{addClass:function(e,t,n){r(e),o(n)},removeClass:function(e,t,n){r(e),o(n)}}}var i=300;t.module("material.components.fabSpeedDial",["material.core","material.components.fabShared","material.components.fabTrigger","material.components.fabActions"]).directive("mdFabSpeedDial",n).animation(".md-fling",o).animation(".md-scale",r).service("mdFabSpeedDialFlingAnimation",o).service("mdFabSpeedDialScaleAnimation",r),o.$inject=["$timeout"],r.$inject=["$timeout"]}()}(),function(){!function(){function n(){function e(e,t,n){t.addClass("md-fab-toolbar"),t.find("md-fab-trigger").find("button").prepend('<div class="_md-fab-toolbar-background"></div>')}return{restrict:"E",transclude:!0,template:'<div class="_md-fab-toolbar-wrapper">  <div class="_md-fab-toolbar-content" ng-transclude></div></div>',scope:{direction:"@?mdDirection",isOpen:"=?mdOpen"},bindToController:!0,controller:"MdFabController",controllerAs:"vm",link:e}}function o(){function n(n,o,r){if(o){var i=n[0],a=n.controller("mdFabToolbar"),d=i.querySelector("._md-fab-toolbar-background"),c=i.querySelector("md-fab-trigger button"),s=i.querySelector("md-toolbar"),l=i.querySelector("md-fab-trigger button md-icon"),m=n.find("md-fab-actions").children();if(c&&d){var u=e.getComputedStyle(c).getPropertyValue("background-color"),p=i.offsetWidth,h=(i.offsetHeight,2*(p/c.offsetWidth));d.style.backgroundColor=u,d.style.borderRadius=p+"px",a.isOpen?(s.style.pointerEvents="initial",d.style.width=c.offsetWidth+"px",d.style.height=c.offsetHeight+"px",d.style.transform="scale("+h+")",d.style.transitionDelay="0ms",l&&(l.style.transitionDelay=".3s"),t.forEach(m,function(e,t){e.style.transitionDelay=25*(m.length-t)+"ms"})):(s.style.pointerEvents="none",d.style.transform="scale(1)",d.style.top="0",n.hasClass("md-right")&&(d.style.left="0",d.style.right=null),n.hasClass("md-left")&&(d.style.right="0",d.style.left=null),d.style.transitionDelay="200ms",l&&(l.style.transitionDelay="0ms"),t.forEach(m,function(e,t){e.style.transitionDelay=200+25*t+"ms"}))}}}return{addClass:function(e,t,o){n(e,t,o),o()},removeClass:function(e,t,o){n(e,t,o),o()}}}t.module("material.components.fabToolbar",["material.core","material.components.fabShared","material.components.fabTrigger","material.components.fabActions"]).directive("mdFabToolbar",n).animation(".md-fab-toolbar",o).service("mdFabToolbarAnimation",o)}()}(),function(){function e(e,o,r,i){function a(n,a,d,c){function s(){for(var e in o.MEDIA)i(e),i.getQuery(o.MEDIA[e]).addListener(C);return i.watchResponsiveAttributes(["md-cols","md-row-height","md-gutter"],d,m)}function l(){c.layoutDelegate=t.noop,A();for(var e in o.MEDIA)i.getQuery(o.MEDIA[e]).removeListener(C)}function m(e){null==e?c.invalidateLayout():i(e)&&c.invalidateLayout()}function u(e){var o=g(),i={tileSpans:b(o),colCount:v(),rowMode:M(),rowHeight:$(),gutter:E()};if(e||!t.equals(i,k)){var d=r(i.colCount,i.tileSpans,o).map(function(e,n){return{grid:{element:a,style:f(i.colCount,n,i.gutter,i.rowMode,i.rowHeight)},tiles:e.map(function(e,r){return{element:t.element(o[r]),style:h(e.position,e.spans,i.colCount,n,i.gutter,i.rowMode,i.rowHeight)}})}}).reflow().performance();n.mdOnLayout({$event:{performance:d}}),k=i}}function p(e){return T+e+w}function h(e,t,n,o,r,i,a){var d=1/n*100,c=(n-1)/n,s=_({share:d,gutterShare:c,gutter:r}),l={left:x({unit:s,offset:e.col,gutter:r}),width:N({unit:s,span:t.col,gutter:r}),paddingTop:"",marginTop:"",top:"",height:""};switch(i){case"fixed":l.top=x({unit:a,offset:e.row,gutter:r}),l.height=N({unit:a,span:t.row,gutter:r});break;case"ratio":var m=d/a,u=_({share:m,gutterShare:c,gutter:r});l.paddingTop=N({unit:u,span:t.row,gutter:r}),l.marginTop=x({unit:u,offset:e.row,gutter:r});break;case"fit":var p=(o-1)/o,m=1/o*100,u=_({share:m,gutterShare:p,gutter:r});l.top=x({unit:u,offset:e.row,gutter:r}),l.height=N({unit:u,span:t.row,gutter:r})}return l}function f(e,t,n,o,r){var i={};switch(o){case"fixed":i.height=N({unit:r,span:t,gutter:n}),i.paddingBottom="";break;case"ratio":var a=1===e?0:(e-1)/e,d=1/e*100,c=d*(1/r),s=_({share:c,gutterShare:a,gutter:n});i.height="",i.paddingBottom=N({unit:s,span:t,gutter:n});break;case"fit":}return i}function g(){return[].filter.call(a.children(),function(e){return"MD-GRID-TILE"==e.tagName&&!e.$$mdDestroyed})}function b(e){return[].map.call(e,function(e){var n=t.element(e).controller("mdGridTile");return{row:parseInt(i.getResponsiveAttribute(n.$attrs,"md-rowspan"),10)||1,col:parseInt(i.getResponsiveAttribute(n.$attrs,"md-colspan"),10)||1}})}function v(){var e=parseInt(i.getResponsiveAttribute(d,"md-cols"),10);if(isNaN(e))throw"md-grid-list: md-cols attribute was not found, or contained a non-numeric value";return e}function E(){return y(i.getResponsiveAttribute(d,"md-gutter")||1)}function $(){var e=i.getResponsiveAttribute(d,"md-row-height");if(!e)throw"md-grid-list: md-row-height attribute was not found";switch(M()){case"fixed":return y(e);case"ratio":var t=e.split(":");return parseFloat(t[0])/parseFloat(t[1]);case"fit":return 0}}function M(){var e=i.getResponsiveAttribute(d,"md-row-height");if(!e)throw"md-grid-list: md-row-height attribute was not found";return"fit"==e?"fit":-1!==e.indexOf(":")?"ratio":"fixed"}function y(e){return/\D$/.test(e)?e:e+"px"}a.attr("role","list"),c.layoutDelegate=u;var C=t.bind(c,c.invalidateLayout),A=s();n.$on("$destroy",l);var k,T=e.startSymbol(),w=e.endSymbol(),_=e(p("share")+"% - ("+p("gutter")+" * "+p("gutterShare")+")"),x=e("calc(("+p("unit")+" + "+p("gutter")+") * "+p("offset")+")"),N=e("calc(("+p("unit")+") * "+p("span")+" + ("+p("span")+" - 1) * "+p("gutter")+")")}return{restrict:"E",controller:n,scope:{mdOnLayout:"&"},link:a}}function n(e){this.layoutInvalidated=!1,this.tilesInvalidated=!1,this.$timeout_=e.nextTick,this.layoutDelegate=t.noop}function o(e){function n(t,n){var o,a,d,c,s,l;return c=e.time(function(){a=r(t,n)}),o={layoutInfo:function(){return a},map:function(t){return s=e.time(function(){var e=o.layoutInfo();d=t(e.positioning,e.rowCount)}),o},reflow:function(t){return l=e.time(function(){var e=t||i;e(d.grid,d.tiles)}),o},performance:function(){return{tileCount:n.length,layoutTime:c,mapTime:s,reflowTime:l,totalTime:c+s+l}}}}function o(e,t){e.element.css(e.style),t.forEach(function(e){e.element.css(e.style)})}function r(e,t){function n(t,n){if(t.col>e)throw"md-grid-list: Tile at position "+n+" has a colspan ("+t.col+") that exceeds the column count ("+e+")";for(var a=0,l=0;l-a<t.col;)d>=e?o():(a=s.indexOf(0,d),-1!==a&&-1!==(l=i(a+1))?d=l+1:(a=l=0,o()));return r(a,t.col,t.row),d=a+t.col,{col:a,row:c}}function o(){d=0,c++,r(0,e,-1)}function r(e,t,n){for(var o=e;e+t>o;o++)s[o]=Math.max(s[o]+n,0)}function i(e){var t;for(t=e;t<s.length;t++)if(0!==s[t])return t;return t===s.length?t:void 0}function a(){for(var t=[],n=0;e>n;n++)t.push(0);return t}var d=0,c=0,s=a();return{positioning:t.map(function(e,t){return{spans:e,position:n(e,t)}}),rowCount:c+Math.max.apply(Math,s)}}var i=o;return n.animateWith=function(e){i=t.isFunction(e)?e:o},n}function r(e){function n(n,o,r,i){o.attr("role","listitem");var a=e.watchResponsiveAttributes(["md-colspan","md-rowspan"],r,t.bind(i,i.invalidateLayout));i.invalidateTiles(),n.$on("$destroy",function(){o[0].$$mdDestroyed=!0,a(),i.invalidateLayout()}),t.isDefined(n.$parent.$index)&&n.$watch(function(){return n.$parent.$index},function(e,t){e!==t&&i.invalidateTiles()})}return{restrict:"E",require:"^mdGridList",template:"<figure ng-transclude></figure>",transclude:!0,scope:{},controller:["$attrs",function(e){this.$attrs=e}],link:n}}function i(){return{template:"<figcaption ng-transclude></figcaption>",transclude:!0}}t.module("material.components.gridList",["material.core"]).directive("mdGridList",e).directive("mdGridTile",r).directive("mdGridTileFooter",i).directive("mdGridTileHeader",i).factory("$mdGridLayout",o),e.$inject=["$interpolate","$mdConstant","$mdGridLayout","$mdMedia"],n.$inject=["$mdUtil"],n.prototype={invalidateTiles:function(){this.tilesInvalidated=!0,this.invalidateLayout()},invalidateLayout:function(){this.layoutInvalidated||(this.layoutInvalidated=!0,this.$timeout_(t.bind(this,this.layout)))},layout:function(){try{this.layoutDelegate(this.tilesInvalidated)}finally{this.layoutInvalidated=!1,this.tilesInvalidated=!1}}},o.$inject=["$mdUtil"],r.$inject=["$mdMedia"]}(),function(){!function(){function e(){return{restrict:"E",require:["^?mdFabSpeedDial","^?mdFabToolbar"]}}t.module("material.components.fabTrigger",["material.core"]).directive("mdFabTrigger",e)}()}(),function(){t.module("material.components.icon",["material.core"])}(),function(){function n(e,t){function n(t,n){e(n);var o=n[0].querySelector(i),r=n[0].querySelector(a);o&&n.addClass("md-icon-left"),r&&n.addClass("md-icon-right")}function o(e,n,o,r){var i=this;i.isErrorGetter=o.mdIsError&&t(o.mdIsError),i.delegateClick=function(){i.input.focus()},i.element=n,i.setFocused=function(e){n.toggleClass("md-input-focused",!!e)},i.setHasValue=function(e){n.toggleClass("md-input-has-value",!!e)},i.setHasPlaceholder=function(e){n.toggleClass("md-input-has-placeholder",!!e)},i.setInvalid=function(e){e?r.addClass(n,"md-input-invalid"):r.removeClass(n,"md-input-invalid")},e.$watch(function(){return i.label&&i.input},function(e){e&&!i.label.attr("for")&&i.label.attr("for",i.input.attr("id"))})}var r=["INPUT","TEXTAREA","SELECT","MD-SELECT"],i=r.reduce(function(e,t){return e.concat(["md-icon ~ "+t,".md-icon ~ "+t])},[]).join(","),a=r.reduce(function(e,t){return e.concat([t+" ~ md-icon",t+" ~ .md-icon"])},[]).join(",");return o.$inject=["$scope","$element","$attrs","$animate"],{restrict:"E",link:n,controller:o}}function o(){return{restrict:"E",require:"^?mdInputContainer",link:function(e,t,n,o){!o||n.mdNoFloat||t.hasClass("_md-container-ignore")||(o.label=t,e.$on("$destroy",function(){o.label=null}))}}}function r(e,n,o,r){function i(i,a,d,c){function s(e){return p.setHasValue(!f.$isEmpty(e)),e}function l(){p.label&&d.$observe("required",function(e){p.label.toggleClass("md-required",e&&!b)})}function m(){p.setHasValue(a.val().length>0||(a[0].validity||{}).badInput)}function u(){function o(){if(a.addClass("md-no-flex").attr("rows",1),m){u||(p.style.minHeight=0,u=a.prop("clientHeight"),p.style.minHeight=null);var e=Math.round(Math.round(c()/u)),t=Math.min(e,m);a.css("height",u*t+"px").attr("rows",t).toggleClass("_md-textarea-scrollable",e>=m)}else{a.css("height","auto"),p.scrollTop=0;var n=c();n&&a.css("height",n+"px")}a.removeClass("md-no-flex")}function c(){var e=p.offsetHeight,t=p.scrollHeight-e;return e+(t>0?t:0)}function s(e){p.scrollTop=0;var t=p.scrollHeight-p.offsetHeight,n=p.offsetHeight+t;p.style.height=n+"px"}function l(e){return o(),e}if(!d.hasOwnProperty("mdNoAutogrow")){var m=d.hasOwnProperty("rows")?parseInt(d.rows):NaN,u=null,p=a[0];if(r(function(){e.nextTick(o)},10,!1),h?(f.$formatters.unshift(l),f.$parsers.unshift(l)):a.on("input",o),m||a.attr("rows",1).on("scroll",s),t.element(n).on("resize",o),i.$on("$destroy",function(){t.element(n).off("resize",o)}),d.hasOwnProperty("mdDetectHidden")){var g=function(){var e=!1;return function(){var t=0===p.offsetHeight;t===!1&&e===!0&&o(),e=t}}();i.$watch(function(){return e.nextTick(g,!1),!0})}}}var p=c[0],h=!!c[1],f=c[1]||e.fakeNgModel(),g=t.isDefined(d.readonly),b=e.parseAttributeBoolean(d.mdNoAsterisk);if(p){if("hidden"===d.type)return void a.attr("aria-hidden","true");if(p.input)throw new Error("<md-input-container> can only have *one* <input>, <textarea> or <md-select> child element!");p.input=a,l();var v=t.element('<div class="md-errors-spacer">');a.after(v),p.label||o.expect(a,"aria-label",a.attr("placeholder")),a.addClass("md-input"),a.attr("id")||a.attr("id","input_"+e.nextUid()),"textarea"===a[0].tagName.toLowerCase()&&u(),h||m();var E=p.isErrorGetter||function(){return f.$invalid&&(f.$touched||$())},$=function(){var n=e.getClosest(a,"form"),o=n?t.element(n).controller("form"):null;return o?o.$submitted:!1};i.$watch(E,p.setInvalid),f.$parsers.push(s),f.$formatters.push(s),a.on("input",m),g||a.on("focus",function(t){e.nextTick(function(){p.setFocused(!0)})}).on("blur",function(t){e.nextTick(function(){p.setFocused(!1),m()})}),i.$on("$destroy",function(){p.setFocused(!1),p.setHasValue(!1),p.input=null})}}return{restrict:"E",require:["^?mdInputContainer","?ngModel"],link:i}}function i(e,n){function o(o,r,i,a){function d(e){return s.parent?(s.text(String(r.val()||e||"").length+"/"+c),e):e}var c,s,l,m=a[0],u=a[1];n.nextTick(function(){l=t.element(u.element[0].querySelector(".md-errors-spacer")),s=t.element('<div class="md-char-counter">'),l.append(s),i.$set("ngTrim","false"),m.$formatters.push(d),m.$viewChangeListeners.push(d),r.on("input keydown keyup",function(){d()}),o.$watch(i.mdMaxlength,function(n){c=n,t.isNumber(n)&&n>0?(s.parent().length||e.enter(s,l),d()):e.leave(s)}),m.$validators["md-maxlength"]=function(e,n){return!t.isNumber(c)||0>c?!0:(e||r.val()||n||"").length<=c}})}return{restrict:"A",require:["ngModel","^mdInputContainer"],link:o}}function a(e){function n(e,n,o,r){if(r){var i=r.element.find("label"),a=t.isDefined(r.element.attr("md-no-float"));if(i&&i.length||a)return void r.setHasPlaceholder(!0);var d=o.placeholder;if(n.removeAttr("placeholder"),r.input&&"MD-SELECT"!=r.input[0].nodeName){var c='<label ng-click="delegateClick()">'+d+"</label>";r.element.addClass("md-icon-float"),r.element.prepend(c)}}}return{restrict:"A",require:"^^?mdInputContainer",priority:200,link:n}}function d(e){function t(t,n,o){function r(){a=!0,e(function(){n[0].select(),a=!1},1,!1)}function i(e){a&&e.preventDefault()}if("INPUT"===n[0].nodeName||"TEXTAREA"===n[0].nodeName){var a=!1;n.on("focus",r).on("mouseup",i),t.$on("$destroy",function(){n.off("focus",r).off("mouseup",i)})}}return{restrict:"A",link:t}}function c(){function e(e,n,o,r){r&&(n.toggleClass("md-input-messages-animation",!0),n.toggleClass("md-auto-hide",!0),("false"==o.mdAutoHide||t(o))&&n.toggleClass("md-auto-hide",!1))}function t(e){return E.some(function(t){return e[t]})}return{restrict:"EA",link:e,require:"^^?mdInputContainer"}}function s(e){function t(t){var n=e.getClosest(t,"md-input-container");if(n)return t.toggleClass("md-input-message-animation",!0),{}}return{restrict:"EA",compile:t,priority:100}}function l(e,t){return{addClass:function(n,o,r){var i=v(n);"md-input-invalid"==o&&i.hasClass("md-auto-hide")?p(n,t,e)["finally"](r):r()}}}function m(e,t){return{enter:function(n,o){p(n,t,e)["finally"](o)},leave:function(n,o){h(n,t,e)["finally"](o)},addClass:function(n,o,r){"ng-hide"==o?h(n,t,e)["finally"](r):r()},removeClass:function(n,o,r){"ng-hide"==o?p(n,t,e)["finally"](r):r()}}}function u(e){return{enter:function(t,n){var o=v(t);return o.hasClass("md-auto-hide")?void n():f(t,e)},leave:function(t,n){return g(t,e)}}}function p(e,n,o){var r,i=[],a=v(e);return t.forEach(a.children(),function(e){r=f(t.element(e),n),i.push(r.start())}),o.all(i)}function h(e,n,o){var r,i=[],a=v(e);return t.forEach(a.children(),function(e){r=g(t.element(e),n),i.push(r.start())}),o.all(i)}function f(e,t){var n=e[0].offsetHeight;return t(e,{event:"enter",structural:!0,from:{opacity:0,"margin-top":-n+"px"},to:{opacity:1,"margin-top":"0"},duration:.3})}function g(t,n){var o=t[0].offsetHeight,r=e.getComputedStyle(t[0]);return 0==r.opacity?n(t,{}):n(t,{event:"leave",structural:!0,from:{opacity:1,"margin-top":0},to:{opacity:0,"margin-top":-o+"px"},duration:.3})}function b(e){var t=e.controller("mdInputContainer");return t.element}function v(e){var n=b(e);return t.element(n[0].querySelector(".md-input-messages-animation"))}t.module("material.components.input",["material.core"]).directive("mdInputContainer",n).directive("label",o).directive("input",r).directive("textarea",r).directive("mdMaxlength",i).directive("placeholder",a).directive("ngMessages",c).directive("ngMessage",s).directive("ngMessageExp",s).directive("mdSelectOnFocus",d).animation(".md-input-invalid",l).animation(".md-input-messages-animation",m).animation(".md-input-message-animation",u),n.$inject=["$mdTheming","$parse"],r.$inject=["$mdUtil","$window","$mdAria","$timeout"],i.$inject=["$animate","$mdUtil"],a.$inject=["$log"],d.$inject=["$timeout"];var E=["ngIf","ngShow","ngHide","ngSwitchWhen","ngSwitchDefault"];s.$inject=["$mdUtil"],l.$inject=["$q","$animateCss"],m.$inject=["$q","$animateCss"],u.$inject=["$animateCss"]}(),function(){function e(e){return{restrict:"E",compile:function(t){return t[0].setAttribute("role","list"),e}}}function n(e,n,o,r){var i=["md-checkbox","md-switch"];return{restrict:"E",controller:"MdListController",compile:function(a,d){function c(){for(var e,t,n=["md-switch","md-checkbox"],o=0;t=n[o];++o)if((e=a.find(t)[0])&&!e.hasAttribute("aria-label")){var r=a.find("p")[0];if(!r)return;e.setAttribute("aria-label","Toggle "+r.textContent)}}function s(e){if("div"==e)$=t.element('<div class="_md-no-style _md-list-item-inner">'),$.append(a.contents()),a.addClass("_md-proxy-focus");else{$=t.element('<div class="md-button _md-no-style">   <div class="_md-list-item-inner"></div></div>');var n=t.element('<md-button class="_md-no-style" md-no-focus-style></md-button>');n[0].setAttribute("aria-label",a[0].textContent),u(a[0],n[0]),$.prepend(n),$.children().eq(1).append(a.contents()),a.addClass("_md-button-wrap")}a[0].setAttribute("tabindex","-1"),a.append($)}function l(){var e=t.element('<div class="_md-secondary-container">');t.forEach(E,function(t){m(t,e)});var n=t.element('<div class="flex"></div>');$.append(n),$.append(e)}function m(n,o){if(n&&!h(n)&&n.hasAttribute("ng-click")){e.expect(n,"aria-label");var r=t.element('<md-button class="md-secondary md-icon-button">');u(n,r[0]),n.setAttribute("tabindex","-1"),r.append(n),n=r[0]}n&&(!f(n)||!d.ngClick&&p(n))&&t.element(n).removeClass("md-secondary"),a.addClass("md-with-secondary"),o.append(n)}function u(e,n){var o=["ng-if","ng-click","aria-label","ng-disabled","ui-sref","href","ng-href","ng-attr-ui-sref","ui-sref-opts"];t.forEach(o,function(t){e.hasAttribute(t)&&(n.setAttribute(t,e.getAttribute(t)),e.removeAttribute(t))})}function p(e){return-1!=i.indexOf(e.nodeName.toLowerCase())}function h(e){var t=e.nodeName.toUpperCase();return"MD-BUTTON"==t||"BUTTON"==t}function f(e){for(var t=e.attributes,n=0;n<t.length;n++)if("ngClick"===d.$normalize(t[n].name))return!0;return!1}function g(e,a,d,c){function s(){u&&u.children&&!g&&t.forEach(i,function(e){t.forEach(u.querySelectorAll(e+":not(.md-secondary)"),function(e){m.push(e)})})}function l(){(1==m.length||g)&&(a.addClass("md-clickable"),g||c.attachRipple(e,t.element(a[0].querySelector("._md-no-style"))))}var m=[],u=a[0].firstElementChild,p=a.hasClass("_md-button-wrap"),h=p?u.firstElementChild:u,g=h&&f(h);s(),l(),a.hasClass("_md-proxy-focus")&&m.length&&t.forEach(m,function(n){n=t.element(n),e.mouseActive=!1,n.on("mousedown",function(){e.mouseActive=!0,r(function(){e.mouseActive=!1},100)}).on("focus",function(){e.mouseActive===!1&&a.addClass("md-focused"),n.on("blur",function t(){a.removeClass("md-focused"),n.off("blur",t)})})});var b=function(e){if("INPUT"!=e.target.nodeName&&"TEXTAREA"!=e.target.nodeName&&!e.target.isContentEditable){var t=e.which||e.keyCode;t==n.KEY_CODE.SPACE&&h&&(h.click(),e.preventDefault(),e.stopPropagation())}};g||m.length||h&&h.addEventListener("keypress",b),a.off("click"),a.off("keypress"),1==m.length&&h&&a.children().eq(0).on("click",function(e){var n=o.getClosest(e.target,"BUTTON");!n&&h.contains(e.target)&&t.forEach(m,function(n){e.target===n||n.contains(e.target)||t.element(n).triggerHandler("click")})}),e.$on("$destroy",function(){h&&h.removeEventListener("keypress",b)})}var b,v,E=a[0].querySelectorAll(".md-secondary"),$=a;if(a[0].setAttribute("role","listitem"),d.ngClick||d.ngHref||d.href||d.uiSref||d.ngAttrUiSref)s("button");else{for(var M,y=0;M=i[y];++y)if(v=a[0].querySelector(M)){b=!0;break}b?s("div"):a[0].querySelector("md-button:not(.md-secondary):not(.md-exclude)")||a.addClass("_md-no-proxy")}return l(),c(),g}}}function o(e,t,n){function o(e,t){var o={};n.attach(e,t,o)}var r=this;r.attachRipple=o}t.module("material.components.list",["material.core"]).controller("MdListController",o).directive("mdList",e).directive("mdListItem",n),e.$inject=["$mdTheming"],n.$inject=["$mdAria","$mdConstant","$mdUtil","$timeout"],o.$inject=["$scope","$element","$mdListInkRipple"]}(),function(){t.module("material.components.menuBar",["material.core","material.components.menu"])}(),function(){t.module("material.components.menu",["material.core","material.components.backdrop"])}(),function(){t.module("material.components.progressCircular",["material.core"])}(),function(){function e(e,n,o){function r(e,t,n){return e.attr("aria-valuemin",0),e.attr("aria-valuemax",100),e.attr("role","progressbar"),i}function i(r,i,m){function u(){m.$observe("value",function(e){var t=a(e);i.attr("aria-valuenow",t),h()!=l&&f(E,t)}),m.$observe("mdBufferValue",function(e){f(v,a(e))}),m.$observe("mdMode",function(e){switch(g&&$.removeClass(g),e){case l:case s:case d:case c:$.addClass(g="_md-mode-"+e);break;default:$.addClass(g="_md-mode-"+c)}})}function p(){if(t.isUndefined(m.mdMode)){var e=t.isDefined(m.value),r=e?d:c,a="Auto-adding the missing md-mode='{0}' to the ProgressLinear element";o.debug(n.supplant(a,[r])),i.attr("md-mode",r),m.mdMode=r}}function h(){var e=(m.mdMode||"").trim();if(e)switch(e){case d:case c:case s:case l:break;default:e=c}return e}function f(e,o){if(h()){var r=n.supplant("translateX({0}%) scale({1},1)",[(o-100)/2,o/100]),i=b({transform:r});t.element(e).css(i)}}e(i);var g,b=n.dom.animator.toCss,v=t.element(i[0].querySelector("._md-bar1")),E=t.element(i[0].querySelector("._md-bar2")),$=t.element(i[0].querySelector("._md-container"));i.attr("md-mode",h()),p(),u()}function a(e){return Math.max(0,Math.min(e||0,100))}var d="determinate",c="indeterminate",s="buffer",l="query";return{restrict:"E",template:'<div class="_md-container"><div class="_md-dashed"></div><div class="_md-bar _md-bar1"></div><div class="_md-bar _md-bar2"></div></div>',compile:r}}t.module("material.components.progressLinear",["material.core"]).directive("mdProgressLinear",e),e.$inject=["$mdTheming","$mdUtil","$log"]}(),function(){function e(e,n,o,r){function i(i,a,d,c){function s(){a.hasClass("md-focused")||a.addClass("md-focused")}function l(o){var r=o.which||o.keyCode;if(r==n.KEY_CODE.ENTER||o.currentTarget==o.target)switch(r){case n.KEY_CODE.LEFT_ARROW:case n.KEY_CODE.UP_ARROW:o.preventDefault(),m.selectPrevious(),s();break;case n.KEY_CODE.RIGHT_ARROW:case n.KEY_CODE.DOWN_ARROW:o.preventDefault(),m.selectNext(),s();break;case n.KEY_CODE.ENTER:var i=t.element(e.getClosest(a[0],"form"));i.length>0&&i.triggerHandler("submit")}}o(a);var m=c[0],u=c[1]||e.fakeNgModel();m.init(u),i.mouseActive=!1,a.attr({role:"radiogroup",tabIndex:a.attr("tabindex")||"0"}).on("keydown",l).on("mousedown",function(e){i.mouseActive=!0,r(function(){i.mouseActive=!1},100)}).on("focus",function(){i.mouseActive===!1&&m.$element.addClass("md-focused")}).on("blur",function(){m.$element.removeClass("md-focused")})}function a(e){this._radioButtonRenderFns=[],this.$element=e}function d(){return{init:function(e){this._ngModelCtrl=e,this._ngModelCtrl.$render=t.bind(this,this.render)},add:function(e){this._radioButtonRenderFns.push(e)},remove:function(e){var t=this._radioButtonRenderFns.indexOf(e);-1!==t&&this._radioButtonRenderFns.splice(t,1)},render:function(){this._radioButtonRenderFns.forEach(function(e){e()})},setViewValue:function(e,t){this._ngModelCtrl.$setViewValue(e,t),this.render()},getViewValue:function(){return this._ngModelCtrl.$viewValue},selectNext:function(){return c(this.$element,1)},selectPrevious:function(){return c(this.$element,-1)},setActiveDescendant:function(e){this.$element.attr("aria-activedescendant",e)}}}function c(n,o){var r=e.iterator(n[0].querySelectorAll("md-radio-button"),!0);if(r.count()){var i=function(e){return!t.element(e).attr("disabled")},a=n[0].querySelector("md-radio-button.md-checked"),d=r[0>o?"previous":"next"](a,i)||r.first();t.element(d).triggerHandler("click")}}return a.prototype=d(),{restrict:"E",controller:["$element",a],require:["mdRadioGroup","?ngModel"],link:{pre:i}}}function n(e,t,n){function o(o,i,a,d){function c(e){if(!d)throw"RadioGroupController not found.";d.add(l),a.$observe("value",l),i.on("click",s).on("$destroy",function(){d.remove(l)})}function s(e){i[0].hasAttribute("disabled")||o.$apply(function(){d.setViewValue(a.value,e&&e.type)})}function l(){function e(e){"MD-RADIO-GROUP"!=i.parent()[0].nodeName&&i.parent()[e?"addClass":"removeClass"](r)}var t=d.getViewValue()==a.value;t!==u&&(u=t,i.attr("aria-checked",t),t?(e(!0),i.addClass(r),d.setActiveDescendant(i.attr("id"))):(e(!1),i.removeClass(r)))}function m(n,o){function r(){return a.id||"radio_"+t.nextUid()}o.ariaId=r(),n.attr({id:o.ariaId,role:"radio","aria-checked":"false"}),e.expectWithText(n,"aria-label")}var u;n(i),m(i,o),c()}var r="md-checked";return{restrict:"E",require:"^mdRadioGroup",transclude:!0,template:'<div class="_md-container" md-ink-ripple md-ink-ripple-checkbox><div class="_md-off"></div><div class="_md-on"></div></div><div ng-transclude class="_md-label"></div>',link:o}}t.module("material.components.radioButton",["material.core"]).directive("mdRadioGroup",e).directive("mdRadioButton",n),e.$inject=["$mdUtil","$mdConstant","$mdTheming","$timeout"],n.$inject=["$mdAria","$mdUtil","$mdTheming"]}(),function(){function e(e,o,r,i,a,d){function c(a,c){var s=t.element("<md-select-value><span></span></md-select-value>");if(s.append('<span class="_md-select-icon" aria-hidden="true"></span>'),s.addClass("_md-select-value"),s[0].hasAttribute("id")||s.attr("id","select_value_label_"+o.nextUid()),a.find("md-content").length||a.append(t.element("<md-content>").append(a.contents())),c.mdOnOpen&&(a.find("md-content").prepend(t.element('<div> <md-progress-circular md-mode="{{progressMode}}" ng-hide="$$loadingAsyncDone" md-diameter="25px"></md-progress-circular></div>')),a.find("md-option").attr("ng-show","$$loadingAsyncDone")),c.name){var l=t.element('<select class="_md-visually-hidden">');l.attr({name:"."+c.name,"ng-model":c.ngModel,"aria-hidden":"true",tabindex:"-1"});var m=a.find("md-option");t.forEach(m,function(e){var n=t.element("<option>"+e.innerHTML+"</option>");e.hasAttribute("ng-value")?n.attr("ng-value",e.getAttribute("ng-value")):e.hasAttribute("value")&&n.attr("value",e.getAttribute("value")),
l.append(n)}),a.parent().append(l)}var u=o.parseAttributeBoolean(c.multiple),p=u?"multiple":"",h='<div class="_md-select-menu-container" aria-hidden="true"><md-select-menu {0}>{1}</md-select-menu></div>';return h=o.supplant(h,[p,a.html()]),a.empty().append(s),a.append(h),c.tabindex||c.$set("tabindex",0),function(a,c,s,l){function m(){var e=c.attr("aria-label")||c.attr("placeholder");!e&&y&&y.label&&(e=y.label.text()),$=e,i.expect(c,"aria-label",e)}function p(){x&&(S=S||x.find("md-select-menu").controller("mdSelectMenu"),C.setLabelText(S.selectedLabels()))}function h(){if($){var e=S.selectedLabels({mode:"aria"});c.attr("aria-label",e.length?$+": "+e:$)}}function f(){y&&y.setHasValue(S.selectedLabels().length>0||(c[0].validity||{}).badInput)}function g(){if(x=t.element(c[0].querySelector("._md-select-menu-container")),N=a,s.mdContainerClass){var e=x[0].getAttribute("class")+" "+s.mdContainerClass;x[0].setAttribute("class",e)}S=x.find("md-select-menu").controller("mdSelectMenu"),S.init(A,s.ngModel),c.on("$destroy",function(){x.remove()})}function b(e){var n=[32,13,38,40];if(-1!=n.indexOf(e.keyCode))e.preventDefault(),v(e);else if(e.keyCode<=90&&e.keyCode>=31){e.preventDefault();var o=S.optNodeForKeyboardSearch(e);if(!o)return;var r=t.element(o).controller("mdOption");S.isMultiple||S.deselect(Object.keys(S.selected)[0]),S.select(r.hashKey,r.value),S.refreshViewValue()}}function v(){N.isOpen=!0,c.attr("aria-expanded","true"),e.show({scope:N,preserveScope:!0,skipCompile:!0,element:x,target:c[0],selectCtrl:C,preserveElement:!0,hasBackdrop:!0,loadingAsync:s.mdOnOpen?a.$eval(s.mdOnOpen)||!0:!1})["finally"](function(){N.isOpen=!1,c.focus(),c.attr("aria-expanded","false"),A.$setTouched()})}var E,$,M=!0,y=l[0],C=l[1],A=l[2],k=l[3],T=c.find("md-select-value"),w=t.isDefined(s.readonly);if(y){var _=y.isErrorGetter||function(){return A.$invalid&&A.$touched};if(y.input)throw new Error("<md-input-container> can only have *one* child <input>, <textarea> or <select> element!");y.input=c,y.label||i.expect(c,"aria-label",c.attr("placeholder")),a.$watch(_,y.setInvalid)}var x,N,S;if(g(),r(c),s.name&&k){var H=c.parent()[0].querySelector('select[name=".'+s.name+'"]');o.nextTick(function(){var e=t.element(H).controller("ngModel");e&&k.$removeControl(e)})}k&&t.isDefined(s.multiple)&&o.nextTick(function(){var e=A.$modelValue||A.$viewValue;e&&k.$setPristine()});var D=A.$render;A.$render=function(){D(),p(),h(),f()},s.$observe("placeholder",A.$render),C.setLabelText=function(e){if(C.setIsPlaceholder(!e),s.mdSelectedText)e=d(s.mdSelectedText)(a);else{var t=s.placeholder||(y&&y.label?y.label.text():"");e=e||t||""}var n=T.children().eq(0);n.html(e)},C.setIsPlaceholder=function(e){e?(T.addClass("_md-select-placeholder"),y&&y.label&&y.label.addClass("_md-placeholder")):(T.removeClass("_md-select-placeholder"),y&&y.label&&y.label.removeClass("_md-placeholder"))},w||(c.on("focus",function(e){y&&y.element.hasClass("md-input-has-value")&&y.setFocused(!0)}),c.on("blur",function(e){M&&(M=!1,N.isOpen&&e.stopImmediatePropagation()),N.isOpen||(y&&y.setFocused(!1),f())})),C.triggerClose=function(){d(s.mdOnClose)(a)},a.$$postDigest(function(){m(),p(),h()}),a.$watch(S.selectedLabels,p);var I;s.$observe("ngMultiple",function(e){I&&I();var t=d(e);I=a.$watch(function(){return t(a)},function(e,t){e===n&&t===n||(e?c.attr("multiple","multiple"):c.removeAttr("multiple"),c.attr("aria-multiselectable",e?"true":"false"),x&&(S.setMultiple(e),D=A.$render,A.$render=function(){D(),p(),h(),f()},A.$render()))})}),s.$observe("disabled",function(e){t.isString(e)&&(e=!0),E!==n&&E===e||(E=e,e?c.attr({"aria-disabled":"true"}).removeAttr("tabindex").off("click",v).off("keydown",b):c.attr({tabindex:s.tabindex,"aria-disabled":"false"}).on("click",v).on("keydown",b))}),s.hasOwnProperty("disabled")||s.hasOwnProperty("ngDisabled")||(c.attr({"aria-disabled":"false"}),c.on("click",v),c.on("keydown",b));var O={role:"listbox","aria-expanded":"false","aria-multiselectable":u&&!s.ngMultiple?"true":"false"};c[0].hasAttribute("id")||(O.id="select_"+o.nextUid());var R="select_container_"+o.nextUid();x.attr("id",R),O["aria-owns"]=R,c.attr(O),a.$on("$destroy",function(){e.destroy()["finally"](function(){y&&(y.setFocused(!1),y.setHasValue(!1),y.input=null),A.$setTouched()})})}}return{restrict:"E",require:["^?mdInputContainer","mdSelect","ngModel","?^form"],compile:c,controller:function(){}}}function o(e,o,r){function i(e,n,i,a){function d(e){13!=e.keyCode&&32!=e.keyCode||c(e)}function c(n){var r=o.getClosest(n.target,"md-option"),i=r&&t.element(r).data("$mdOptionController");if(r&&i){if(r.hasAttribute("disabled"))return n.stopImmediatePropagation(),!1;var a=s.hashGetter(i.value),d=t.isDefined(s.selected[a]);e.$apply(function(){s.isMultiple?d?s.deselect(a):s.select(a,i.value):d||(s.deselect(Object.keys(s.selected)[0]),s.select(a,i.value)),s.refreshViewValue()})}}var s=a[0];r(n),n.on("click",c),n.on("keypress",d)}function a(r,i,a){function d(){var e=l.ngModel.$modelValue||l.ngModel.$viewValue||[];if(t.isArray(e)){var n=Object.keys(l.selected),o=e.map(l.hashGetter),r=n.filter(function(e){return-1===o.indexOf(e)});r.forEach(l.deselect),o.forEach(function(t,n){l.select(t,e[n])})}}function s(){var e=l.ngModel.$viewValue||l.ngModel.$modelValue;Object.keys(l.selected).forEach(l.deselect),l.select(l.hashGetter(e),e)}var l=this;l.isMultiple=t.isDefined(i.multiple),l.selected={},l.options={},r.$watchCollection(function(){return l.options},function(){l.ngModel.$render()});var m,u;l.setMultiple=function(e){function n(e,n){return t.isArray(e||n||[])}var o=l.ngModel;u=u||o.$isEmpty,l.isMultiple=e,m&&m(),l.isMultiple?(o.$validators["md-multiple"]=n,o.$render=d,r.$watchCollection(l.modelBinding,function(e){n(e)&&d(e),l.ngModel.$setPristine()}),o.$isEmpty=function(e){return!e||0===e.length}):(delete o.$validators["md-multiple"],o.$render=s)};var p,h,f,g="",b=300;l.optNodeForKeyboardSearch=function(e){p&&clearTimeout(p),p=setTimeout(function(){p=n,g="",f=n,h=n},b),g+=String.fromCharCode(e.keyCode);var o=new RegExp("^"+g,"i");h||(h=a.find("md-option"),f=new Array(h.length),t.forEach(h,function(e,t){f[t]=e.textContent.trim()}));for(var r=0;r<f.length;++r)if(o.test(f[r]))return h[r]},l.init=function(n,o){if(l.ngModel=n,l.modelBinding=o,n.$options&&n.$options.trackBy){var i={},a=e(n.$options.trackBy);l.hashGetter=function(e,t){return i.$value=e,a(t||r,i)}}else l.hashGetter=function(e){return t.isObject(e)?"object_"+(e.$$mdSelectId||(e.$$mdSelectId=++c)):e};l.setMultiple(l.isMultiple)},l.selectedLabels=function(e){e=e||{};var t=e.mode||"html",n=o.nodesToArray(a[0].querySelectorAll("md-option[selected]"));if(n.length){var r;return"html"==t?r=function(e){var t=e.innerHTML,n=e.querySelector(".md-ripple-container");return n?t.replace(n.outerHTML,""):t}:"aria"==t&&(r=function(e){return e.hasAttribute("aria-label")?e.getAttribute("aria-label"):e.textContent}),n.map(r).join(", ")}return""},l.select=function(e,t){var n=l.options[e];n&&n.setSelected(!0),l.selected[e]=t},l.deselect=function(e){var t=l.options[e];t&&t.setSelected(!1),delete l.selected[e]},l.addOption=function(e,n){if(t.isDefined(l.options[e]))throw new Error('Duplicate md-option values are not allowed in a select. Duplicate value "'+n.value+'" found.');l.options[e]=n,t.isDefined(l.selected[e])&&(l.select(e,n.value),l.refreshViewValue())},l.removeOption=function(e){delete l.options[e]},l.refreshViewValue=function(){var e,n=[];for(var o in l.selected)(e=l.options[o])?n.push(e.value):n.push(l.selected[o]);var r=l.ngModel.$options&&l.ngModel.$options.trackBy,i=l.isMultiple?n:n[0],a=l.ngModel.$modelValue;(r?t.equals(a,i):a==i)||(l.ngModel.$setViewValue(i),l.ngModel.$render())}}return a.$inject=["$scope","$attrs","$element"],{restrict:"E",require:["mdSelectMenu"],scope:!0,controller:a,link:{pre:i}}}function r(e,n){function o(e,n){return e.append(t.element('<div class="_md-text">').append(e.contents())),e.attr("tabindex",n.tabindex||"0"),r}function r(o,r,i,a){function d(e,t,n){if(!m.hashGetter)return void(n||o.$$postDigest(function(){d(e,t,!0)}));var r=m.hashGetter(t,o),i=m.hashGetter(e,o);l.hashKey=i,l.value=e,m.removeOption(r,l),m.addOption(i,l)}function c(){var e={role:"option","aria-selected":"false"};r[0].hasAttribute("id")||(e.id="select_option_"+n.nextUid()),r.attr(e)}var l=a[0],m=a[1];m.isMultiple&&(r.attr("md-checkbox-enabled",""),r.prepend(s.clone())),t.isDefined(i.ngValue)?o.$watch(i.ngValue,d):t.isDefined(i.value)?d(i.value):o.$watch(function(){return r.text().trim()},d),i.$observe("disabled",function(e){e?r.attr("tabindex","-1"):r.attr("tabindex","0")}),o.$$postDigest(function(){i.$observe("selected",function(e){t.isDefined(e)&&("string"==typeof e&&(e=!0),e?(m.isMultiple||m.deselect(Object.keys(m.selected)[0]),m.select(l.hashKey,l.value)):m.deselect(l.hashKey),m.refreshViewValue())})}),e.attach(o,r),c(),o.$on("$destroy",function(){m.removeOption(l.hashKey,l)})}function i(e){this.selected=!1,this.setSelected=function(t){t&&!this.selected?e.attr({selected:"selected","aria-selected":"true"}):!t&&this.selected&&(e.removeAttr("selected"),e.attr("aria-selected","false")),this.selected=t}}return i.$inject=["$element"],{restrict:"E",require:["mdOption","^^mdSelectMenu"],controller:i,compile:o}}function i(){function e(e,n){var o=e.find("label");o.length||(o=t.element("<label>"),e.prepend(o)),o.addClass("_md-container-ignore"),n.label&&o.text(n.label)}return{restrict:"E",compile:e}}function a(e){function o(e,o,s,l,m,u,p,h,f){function g(e,t,n){function o(){return p(t,{addClass:"_md-leave"}).start()}function r(){t.removeClass("_md-active"),t.attr("aria-hidden","true"),t[0].style.display="none",v(n),!n.$destroy&&n.restoreFocus&&n.target.focus()}return n=n||{},n.cleanupInteraction(),n.cleanupResizing(),n.hideBackdrop(),n.$destroy===!0?r():o().then(r)}function b(r,i,a){function d(e,t,n){return n.parent.append(t),m(function(e,n){try{p(t,{removeClass:"_md-leave",duration:0}).start().then(c).then(e)}catch(o){n(o)}})}function c(){return m(function(e){if(a.isRemoved)return m.reject(!1);var t=E(r,i,a);t.container.element.css(M.toCss(t.container.styles)),t.dropDown.element.css(M.toCss(t.dropDown.styles)),u(function(){i.addClass("_md-active"),t.dropDown.element.css(M.toCss({transform:""})),b(a.focusedNode),e()})})}function g(e,t,n){return n.disableParentScroll&&!s.getClosest(n.target,"MD-DIALOG")?n.restoreScroll=s.disableScrollAround(n.element,n.parent):n.disableParentScroll=!1,n.hasBackdrop&&(n.backdrop=s.createBackdrop(e,"_md-select-backdrop _md-click-catcher"),h.enter(n.backdrop,f[0].body,null,{duration:0})),function(){n.backdrop&&n.backdrop.remove(),n.disableParentScroll&&n.restoreScroll(),delete n.restoreScroll}}function b(e){e&&!e.hasAttribute("disabled")&&e.focus()}function v(e,n){var o=i.find("md-select-menu");if(!n.target)throw new Error(s.supplant($,[n.target]));t.extend(n,{isRemoved:!1,target:t.element(n.target),parent:t.element(n.parent),selectEl:o,contentEl:i.find("md-content"),optionNodes:o[0].getElementsByTagName("md-option")})}function y(){var e=function(e,t,n){return function(){if(!n.isRemoved){var o=E(e,t,n),r=o.container,i=o.dropDown;r.element.css(M.toCss(r.styles)),i.element.css(M.toCss(i.styles))}}}(r,i,a),n=t.element(l);return n.on("resize",e),n.on("orientationchange",e),function(){n.off("resize",e),n.off("orientationchange",e)}}function C(){a.loadingAsync&&!a.isRemoved&&(r.$$loadingAsyncDone=!1,r.progressMode="indeterminate",m.when(a.loadingAsync).then(function(){r.$$loadingAsyncDone=!0,r.progressMode="",delete a.loadingAsync}).then(function(){u(c)}))}function A(){function t(t){t.preventDefault(),t.stopPropagation(),a.restoreFocus=!1,s.nextTick(e.hide,!0)}function r(t){var n=o.KEY_CODE;switch(t.preventDefault(),t.stopPropagation(),t.keyCode){case n.UP_ARROW:return l();case n.DOWN_ARROW:return c();case n.SPACE:case n.ENTER:var r=s.getClosest(t.target,"md-option");r&&(u.triggerHandler({type:"click",target:r}),t.preventDefault()),m(t);break;case n.TAB:case n.ESCAPE:t.stopPropagation(),t.preventDefault(),a.restoreFocus=!0,s.nextTick(e.hide,!0);break;default:if(t.keyCode>=31&&t.keyCode<=90){var i=u.controller("mdSelectMenu").optNodeForKeyboardSearch(t);a.focusedNode=i||a.focusedNode,i&&i.focus()}}}function d(e){var t,o=s.nodesToArray(a.optionNodes),r=o.indexOf(a.focusedNode);do-1===r?r=0:"next"===e&&r<o.length-1?r++:"prev"===e&&r>0&&r--,t=o[r],t.hasAttribute("disabled")&&(t=n);while(!t&&r<o.length-1&&r>0);t&&t.focus(),a.focusedNode=t}function c(){d("next")}function l(){d("prev")}function m(t){function n(){var e=!1;if(t&&t.currentTarget.children.length>0){var n=t.currentTarget.children[0],o=n.scrollHeight>n.clientHeight;if(o&&n.children.length>0){var r=t.pageX-t.currentTarget.getBoundingClientRect().left;r>n.querySelector("md-option").offsetWidth&&(e=!0)}}return e}if(!(t&&"click"==t.type&&t.currentTarget!=u[0]||n())){var o=s.getClosest(t.target,"md-option");o&&o.hasAttribute&&!o.hasAttribute("disabled")&&(t.preventDefault(),t.stopPropagation(),p.isMultiple||(a.restoreFocus=!0,s.nextTick(function(){e.hide(p.ngModel.$viewValue)},!0)))}}if(!a.isRemoved){var u=a.selectEl,p=u.controller("mdSelectMenu")||{};return i.addClass("_md-clickable"),a.backdrop&&a.backdrop.on("click",t),u.on("keydown",r),u.on("click",m),function(){a.backdrop&&a.backdrop.off("click",t),u.off("keydown",r),u.off("click",m),i.removeClass("_md-clickable"),a.isRemoved=!0}}}return C(),v(r,a),a.hideBackdrop=g(r,i,a),d(r,i,a).then(function(e){return i.attr("aria-hidden","false"),a.alreadyOpen=!0,a.cleanupInteraction=A(),a.cleanupResizing=y(),e},a.hideBackdrop)}function v(e){var t=e.selectCtrl;if(t){var n=e.selectEl.controller("mdSelectMenu");t.setLabelText(n?n.selectedLabels():""),t.triggerClose()}}function E(e,n,o){var m,u=n[0],p=o.target[0].children[0],h=f[0].body,g=o.selectEl[0],b=o.contentEl[0],v=h.getBoundingClientRect(),E=p.getBoundingClientRect(),$=!1,M={left:v.left+d,top:d,bottom:v.height-d,right:v.width-d-(s.floatingScrollbars()?16:0)},y={top:E.top-M.top,left:E.left-M.left,right:M.right-(E.left+E.width),bottom:M.bottom-(E.top+E.height)},C=v.width-2*d,A=g.querySelector("md-option[selected]"),k=g.getElementsByTagName("md-option"),T=g.getElementsByTagName("md-optgroup"),w=c(n,b),_=r(o.loadingAsync);m=_?b.firstElementChild||b:A?A:T.length?T[0]:k.length?k[0]:b.firstElementChild||b,b.offsetWidth>C?b.style["max-width"]=C+"px":b.style.maxWidth=null,$&&(b.style["min-width"]=E.width+"px"),w&&g.classList.add("_md-overflow");var x=m;"MD-OPTGROUP"===(x.tagName||"").toUpperCase()&&(x=k[0]||b.firstElementChild||b,m=x),o.focusedNode=x,u.style.display="block";var N=g.getBoundingClientRect(),S=a(m);if(m){var H=l.getComputedStyle(m);S.paddingLeft=parseInt(H.paddingLeft,10)||0,S.paddingRight=parseInt(H.paddingRight,10)||0}if(w){var D=b.offsetHeight/2;b.scrollTop=S.top+S.height/2-D,y.top<D?b.scrollTop=Math.min(S.top,b.scrollTop+D-y.top):y.bottom<D&&(b.scrollTop=Math.max(S.top+S.height-N.height,b.scrollTop-D+y.bottom))}var I,O,R,L;$?(I=E.left,O=E.top+E.height,R="50% 0",O+N.height>M.bottom&&(O=E.top-N.height,R="50% 100%")):(I=E.left+S.left-S.paddingLeft+2,O=Math.floor(E.top+E.height/2-S.height/2-S.top+b.scrollTop)+2,R=S.left+E.width/2+"px "+(S.top+S.height/2-b.scrollTop)+"px 0px",L=Math.min(E.width+S.paddingLeft+S.paddingRight,C));var P=u.getBoundingClientRect(),F=Math.round(100*Math.min(E.width/N.width,1))/100,B=Math.round(100*Math.min(E.height/N.height,1))/100;return{container:{element:t.element(u),styles:{left:Math.floor(i(M.left,I,M.right-P.width)),top:Math.floor(i(M.top,O,M.bottom-P.height)),"min-width":L}},dropDown:{element:t.element(g),styles:{transformOrigin:R,transform:o.alreadyOpen?"":s.supplant("scale({0},{1})",[F,B])}}}}var $="$mdSelect.show() expected a target element in options.target but got '{0}'!",M=s.dom.animator;return{parent:"body",themable:!0,onShow:b,onRemove:g,hasBackdrop:!0,disableParentScroll:!0}}function r(e){return e&&t.isFunction(e.then)}function i(e,t,n){return Math.max(e,Math.min(t,n))}function a(e){return e?{left:e.offsetLeft,top:e.offsetTop,width:e.offsetWidth,height:e.offsetHeight}:{left:0,top:0,width:0,height:0}}function c(e,t){var n=!1;try{var o=e[0].style.display;e[0].style.display="block",n=t.scrollHeight>t.offsetHeight,e[0].style.display=o}finally{}return n}return o.$inject=["$mdSelect","$mdConstant","$mdUtil","$window","$q","$$rAF","$animateCss","$animate","$document"],e("$mdSelect").setDefaults({methods:["target"],options:o})}var d=8,c=0,s=t.element('<div class="_md-container"><div class="_md-icon"></div></div>');t.module("material.components.select",["material.core","material.components.backdrop"]).directive("mdSelect",e).directive("mdSelectMenu",o).directive("mdOption",r).directive("mdOptgroup",i).provider("$mdSelect",a),e.$inject=["$mdSelect","$mdUtil","$mdTheming","$mdAria","$compile","$parse"],o.$inject=["$parse","$mdUtil","$mdTheming"],r.$inject=["$mdButtonInkRipple","$mdUtil"],a.$inject=["$$interimElementProvider"]}(),function(){function e(e,t){return["$mdUtil",function(n){return{restrict:"A",multiElement:!0,link:function(o,r,i){var a=o.$on("$md-resize-enable",function(){a(),o.$watch(i[e],function(e){!!e===t&&(n.nextTick(function(){o.$broadcast("$md-resize")}),n.dom.animator.waitTransitionEnd(r).then(function(){o.$broadcast("$md-resize")}))})})}}}]}t.module("material.components.showHide",["material.core"]).directive("ngShow",e("ngShow",!0)).directive("ngHide",e("ngHide",!1))}(),function(){function e(e,n){return function(o){function r(){return e.when(o).then(function(e){return d=e,e})}var i,a="SideNav '"+o+"' is not available!",d=e.get(o);return d||e.notFoundError(o),i={isOpen:function(){return d&&d.isOpen()},isLockedOpen:function(){return d&&d.isLockedOpen()},toggle:function(){return d?d.toggle():n.reject(a)},open:function(){return d?d.open():n.reject(a)},close:function(){return d?d.close():n.reject(a)},then:function(e){var o=d?n.when(d):r();return o.then(e||t.noop)}}}}function o(){return{restrict:"A",require:"^mdSidenav",link:function(e,t,n,o){}}}function r(e,o,r,i,a,d,c,s,l,m){function u(d,u,p,h){function f(e,t){d.isLockedOpen=e,e===t?u.toggleClass("_md-locked-open",!!e):a[e?"addClass":"removeClass"](u,"_md-locked-open"),y&&y.toggleClass("_md-locked-open",!!e)}function g(e){var t=o.findFocusTarget(u)||o.findFocusTarget(u,"[md-sidenav-focus]")||u,n=u.parent();return n[e?"on":"off"]("keydown",E),y&&y[e?"on":"off"]("click",$),e&&(C=m[0].activeElement),b(e),A=l.all([e&&y?a.enter(y,n):y?a.leave(y):l.when(!0),a[e?"removeClass":"addClass"](u,"_md-closed")]).then(function(){d.isOpen&&t&&t.focus()})}function b(e){var o=u.parent();e&&!M?(M=o.css("overflow"),o.css("overflow","hidden")):t.isDefined(M)&&(o.css("overflow",M),M=n)}function v(e){return d.isOpen==e?l.when(!0):l(function(t){d.isOpen=e,o.nextTick(function(){A.then(function(e){d.isOpen||(C&&C.focus(),C=null),t(e)})})})}function E(e){var t=e.keyCode===r.KEY_CODE.ESCAPE;return t?$(e):l.when(!0)}function $(e){return e.preventDefault(),h.close()}var M,y,C=null,A=l.when(!0),k=c(p.mdIsLockedOpen),T=function(){return k(d.$parent,{$media:function(t){return s.warn("$media is deprecated for is-locked-open. Use $mdMedia instead."),e(t)},$mdMedia:e})};t.isDefined(p.mdDisableBackdrop)||(y=o.createBackdrop(d,"_md-sidenav-backdrop md-opaque ng-enter")),i(u),y&&i.inherit(y,u),u.on("$destroy",function(){y&&y.remove(),h.destroy()}),d.$on("$destroy",function(){y&&y.remove()}),d.$watch(T,f),d.$watch("isOpen",g),h.$toggleOpen=v}return{restrict:"E",scope:{isOpen:"=?mdIsOpen"},controller:"$mdSidenavController",compile:function(e){return e.addClass("_md-closed"),e.attr("tabIndex","-1"),u}}}function i(e,t,n,o,r){var i=this;i.isOpen=function(){return!!e.isOpen},i.isLockedOpen=function(){return!!e.isLockedOpen},i.open=function(){return i.$toggleOpen(!0)},i.close=function(){return i.$toggleOpen(!1)},i.toggle=function(){return i.$toggleOpen(!e.isOpen)},i.$toggleOpen=function(t){return r.when(e.isOpen=t)},i.destroy=o.register(i,n.mdComponentId)}t.module("material.components.sidenav",["material.core","material.components.backdrop"]).factory("$mdSidenav",e).directive("mdSidenav",r).directive("mdSidenavFocus",o).controller("$mdSidenavController",i),e.$inject=["$mdComponentRegistry","$q"],r.$inject=["$mdMedia","$mdUtil","$mdConstant","$mdTheming","$animate","$compile","$parse","$log","$q","$document"],i.$inject=["$scope","$element","$attrs","$mdComponentRegistry","$q"]}(),function(){function e(e,o,r,i,a){function d(e){function t(e,t){t.addClass("_md-sticky-clone");var n={element:e,clone:t};return f.items.push(n),i.nextTick(function(){p.prepend(n.clone)}),h(),function(){f.items.forEach(function(t,n){t.element[0]===e[0]&&(f.items.splice(n,1),t.clone.remove())}),h()}}function a(){f.items.forEach(d),f.items=f.items.sort(function(e,t){return e.top<t.top?-1:1});for(var e,t=p.prop("scrollTop"),n=f.items.length-1;n>=0;n--)if(t>f.items[n].top){e=f.items[n];break}l(e)}function d(e){var t=e.element[0];for(e.top=0,e.left=0,e.right=0;t&&t!==p[0];)e.top+=t.offsetTop,e.left+=t.offsetLeft,t.offsetParent&&(e.right+=t.offsetParent.offsetWidth-t.offsetWidth-t.offsetLeft),t=t.offsetParent;e.height=e.element.prop("offsetHeight");var o=i.floatingScrollbars()?"0":n;i.bidi(e.clone,"margin-left",e.left,o),i.bidi(e.clone,"margin-right",o,e.right)}function c(){var e=p.prop("scrollTop"),t=e>(c.prevScrollTop||0);if(c.prevScrollTop=e,0===e)return void l(null);if(t){if(f.next&&f.next.top<=e)return void l(f.next);if(f.current&&f.next&&f.next.top-e<=f.next.height)return void u(f.current,e+(f.next.top-f.next.height-e))}if(!t){if(f.current&&f.prev&&e<f.current.top)return void l(f.prev);if(f.next&&f.current&&e>=f.next.top-f.current.height)return void u(f.current,e+(f.next.top-e-f.current.height))}f.current&&u(f.current,e)}function l(e){if(f.current!==e){f.current&&(u(f.current,null),m(f.current,null)),e&&m(e,"active"),f.current=e;var t=f.items.indexOf(e);f.next=f.items[t+1],f.prev=f.items[t-1],m(f.next,"next"),m(f.prev,"prev")}}function m(e,t){e&&e.state!==t&&(e.state&&(e.clone.attr("sticky-prev-state",e.state),e.element.attr("sticky-prev-state",e.state)),e.clone.attr("sticky-state",t),e.element.attr("sticky-state",t),e.state=t)}function u(e,t){e&&(null===t||t===n?e.translateY&&(e.translateY=null,e.clone.css(o.CSS.TRANSFORM,"")):(e.translateY=t,i.bidi(e.clone,o.CSS.TRANSFORM,"translate3d("+e.left+"px,"+t+"px,0)","translateY("+t+"px)")))}var p=e.$element,h=r.throttle(a);s(p),p.on("$scrollstart",h),p.on("$scroll",c);var f;return f={prev:null,current:null,next:null,items:[],add:t,refreshElements:a}}function c(n){var o,r=t.element("<div>");e[0].body.appendChild(r[0]);for(var i=["sticky","-webkit-sticky"],a=0;a<i.length;++a)if(r.css({position:i[a],top:0,"z-index":2}),r.css("position")==i[a]){o=i[a];break}return r.remove(),o}function s(e){function t(){+i.now()-o>a?(n=!1,e.triggerHandler("$scrollend")):(e.triggerHandler("$scroll"),r.throttle(t))}var n,o,a=200;e.on("scroll touchmove",function(){n||(n=!0,r.throttle(t),e.triggerHandler("$scrollstart")),e.triggerHandler("$scroll"),o=+i.now()})}var l=c();return function(e,t,n){var o=t.controller("mdContent");if(o)if(l)t.css({position:l,top:0,"z-index":2});else{var r=o.$element.data("$$sticky");r||(r=d(o),o.$element.data("$$sticky",r));var i=n||a(t.clone())(e),c=r.add(t,i);e.$on("$destroy",c)}}}t.module("material.components.sticky",["material.core","material.components.content"]).factory("$mdSticky",e),e.$inject=["$document","$mdConstant","$$rAF","$mdUtil","$compile"]}(),function(){function e(){return{controller:function(){},compile:function(e){var o=e.find("md-slider");if(o){var r=o.attr("md-vertical");return r!==n&&e.attr("md-vertical",""),o.attr("flex")||o.attr("flex",""),function(e,n,o,r){function i(e){n.children().attr("disabled",e),n.find("input").attr("disabled",e)}var a=t.noop;o.disabled?i(!0):o.ngDisabled&&(a=e.$watch(o.ngDisabled,function(e){i(e)})),e.$on("$destroy",function(){a()});var d;r.fitInputWidthToTextLength=function(e){var t=n.find("md-input-container"),o=getComputedStyle(t[0]),r=parseInt(o["min-width"]),i=2*parseInt(o.padding);d=d||parseInt(o["max-width"]);var a=Math.max(d,r+i+r/2*e);t.css("max-width",a+"px")}}}}}}function o(e,n,o,r,i,a,d,c,s,l){function m(e,n){var r=t.element(e[0].getElementsByClassName("_md-slider-wrapper")),i=n.tabindex||0;return r.attr("tabindex",i),(n.disabled||n.ngDisabled)&&r.attr("tabindex",-1),r.attr("role","slider"),o.expect(e,"aria-label"),u}function u(o,m,u,p){function h(){y(),x()}function f(e){de=parseFloat(e),m.attr("aria-valuemin",e),h()}function g(e){ce=parseFloat(e),m.attr("aria-valuemax",e),h()}function b(e){se=parseFloat(e)}function v(e){le=N(parseInt(e),0,6)}function E(){m.attr("aria-disabled",!!Y())}function $(){if(re&&!Y()&&!t.isUndefined(se)){if(0>=se){var e="Slider step value must be greater than zero when in discrete mode";throw s.error(e),new Error(e)}var o=Math.floor((ce-de)/se);me||(me=t.element("<canvas>").css("position","absolute"),J.append(me),ue=me[0].getContext("2d"));var r=C();!r||r.height||r.width||(y(),r=pe),me[0].width=r.width,me[0].height=r.height;for(var i,a=0;o>=a;a++){var d=n.getComputedStyle(J[0]);ue.fillStyle=d.color||"black",i=Math.floor((oe?r.height:r.width)*(a/o)),ue.fillRect(oe?0:i-1,oe?i-1:0,oe?r.width:2,oe?2:r.height)}}}function M(){if(me&&ue){var e=C();ue.clearRect(0,0,e.width,e.height)}}function y(){pe=Q[0].getBoundingClientRect()}function C(){return te(),pe}function A(e){if(!Y()){var t;(oe?e.keyCode===i.KEY_CODE.DOWN_ARROW:e.keyCode===i.KEY_CODE.LEFT_ARROW)?t=-se:(oe?e.keyCode===i.KEY_CODE.UP_ARROW:e.keyCode===i.KEY_CODE.RIGHT_ARROW)&&(t=se),t&&((e.metaKey||e.ctrlKey||e.altKey)&&(t*=4),e.preventDefault(),e.stopPropagation(),o.$evalAsync(function(){_(V.$viewValue+t)}))}}function k(){$(),o.mouseActive=!0,ee.removeClass("md-focused"),l(function(){o.mouseActive=!1},100)}function T(){o.mouseActive===!1&&ee.addClass("md-focused")}function w(){ee.removeClass("md-focused"),m.removeClass("_md-active"),M()}function _(e){V.$setViewValue(N(S(e)))}function x(){isNaN(V.$viewValue)&&(V.$viewValue=V.$modelValue),V.$viewValue=N(V.$viewValue);var e=(V.$viewValue-de)/(ce-de);o.modelValue=V.$viewValue,m.attr("aria-valuenow",V.$viewValue),H(e),G.text(V.$viewValue)}function N(e,n,o){return t.isNumber(e)?(n=t.isNumber(n)?n:de,o=t.isNumber(o)?o:ce,Math.max(n,Math.min(o,e))):void 0}function S(e){if(t.isNumber(e)){var n=Math.round((e-de)/se)*se+de;return n=Math.round(n*Math.pow(10,le))/Math.pow(10,le),W&&W.fitInputWidthToTextLength&&r.debounce(function(){W.fitInputWidthToTextLength(n.toString().length)},100)(),n}}function H(e){e=U(e);var t=100*e+"%";X.css(oe?"bottom":"left",t),Z.css(oe?"height":"width",t),m.toggleClass("_md-min",0===e),m.toggleClass("_md-max",1===e)}function D(e){if(!Y()){m.addClass("_md-active"),m[0].focus(),y();var t=q(z(oe?e.pointer.y:e.pointer.x)),n=N(S(t));o.$apply(function(){_(n),H(j(n))})}}function I(e){if(!Y()){m.removeClass("_md-dragging");var t=q(z(oe?e.pointer.y:e.pointer.x)),n=N(S(t));o.$apply(function(){_(n),x()})}}function O(e){Y()||(he=!0,e.stopPropagation(),m.addClass("_md-dragging"),P(e))}function R(e){he&&(e.stopPropagation(),P(e))}function L(e){he&&(e.stopPropagation(),he=!1)}function P(e){re?B(oe?e.pointer.y:e.pointer.x):F(oe?e.pointer.y:e.pointer.x)}function F(e){o.$evalAsync(function(){_(q(z(e)))})}function B(e){var t=q(z(e)),n=N(S(t));H(z(e)),G.text(n)}function U(e){return Math.max(0,Math.min(e||0,1))}function z(e){var t=oe?pe.top:pe.left,n=oe?pe.height:pe.width,o=(e-t)/n;return Math.max(0,Math.min(1,oe?1-o:o))}function q(e){return de+e*(ce-de)}function j(e){return(e-de)/(ce-de)}a(m);var V=p[0]||{$setViewValue:function(e){this.$viewValue=e,this.$viewChangeListeners.forEach(function(e){e()})},$parsers:[],$formatters:[],$viewChangeListeners:[]},W=p[1],Y=(t.element(r.getClosest(m,"_md-slider-container",!0)),u.ngDisabled?t.bind(null,c(u.ngDisabled),o.$parent):function(){return m[0].hasAttribute("disabled")}),K=t.element(m[0].querySelector("._md-thumb")),G=t.element(m[0].querySelector("._md-thumb-text")),X=K.parent(),Q=t.element(m[0].querySelector("._md-track-container")),Z=t.element(m[0].querySelector("._md-track-fill")),J=t.element(m[0].querySelector("._md-track-ticks")),ee=t.element(m[0].getElementsByClassName("_md-slider-wrapper")),te=(t.element(m[0].getElementsByClassName("_md-slider-content")),r.throttle(y,5e3)),ne=3,oe=t.isDefined(u.mdVertical),re=t.isDefined(u.mdDiscrete);t.isDefined(u.min)?u.$observe("min",f):f(0),t.isDefined(u.max)?u.$observe("max",g):g(100),t.isDefined(u.step)?u.$observe("step",b):b(1),t.isDefined(u.round)?u.$observe("round",v):v(ne);var ie=t.noop;u.ngDisabled&&(ie=o.$parent.$watch(u.ngDisabled,E)),d.register(ee,"drag",{horizontal:!oe}),o.mouseActive=!1,ee.on("keydown",A).on("mousedown",k).on("focus",T).on("blur",w).on("$md.pressdown",D).on("$md.pressup",I).on("$md.dragstart",O).on("$md.drag",R).on("$md.dragend",L),setTimeout(h,0);var ae=e.throttle(h);t.element(n).on("resize",ae),o.$on("$destroy",function(){t.element(n).off("resize",ae)}),V.$render=x,V.$viewChangeListeners.push(x),V.$formatters.push(N),V.$formatters.push(S);var de,ce,se,le,me,ue,pe={};y();var he=!1}return{scope:{},require:["?ngModel","?^mdSliderContainer"],template:'<div class="_md-slider-wrapper"><div class="_md-slider-content"><div class="_md-track-container"><div class="_md-track"></div><div class="_md-track _md-track-fill"></div><div class="_md-track-ticks"></div></div><div class="_md-thumb-container"><div class="_md-thumb"></div><div class="_md-focus-thumb"></div><div class="_md-focus-ring"></div><div class="_md-sign"><span class="_md-thumb-text"></span></div><div class="_md-disabled-thumb"></div></div></div></div>',compile:m}}t.module("material.components.slider",["material.core"]).directive("mdSlider",o).directive("mdSliderContainer",e),o.$inject=["$$rAF","$window","$mdAria","$mdUtil","$mdConstant","$mdTheming","$mdGesture","$parse","$log","$timeout"]}(),function(){function e(e,n,o,r){return{restrict:"E",replace:!0,transclude:!0,template:'<div class="md-subheader">  <div class="_md-subheader-inner">    <span class="_md-subheader-content"></span>  </div></div>',link:function(i,a,d,c,s){function l(e){return t.element(e[0].querySelector("._md-subheader-content"))}o(a);var m=a[0].outerHTML;s(i,function(e){l(a).append(e)}),a.hasClass("md-no-sticky")||s(i,function(t){var o='<div class="_md-subheader-wrapper">'+m+"</div>",d=n(o)(i);e(i,a,d),r.nextTick(function(){l(d).append(t)})})}}}t.module("material.components.subheader",["material.core","material.components.sticky"]).directive("mdSubheader",e),e.$inject=["$mdSticky","$compile","$mdTheming","$mdUtil"]}(),function(){function e(e){function t(e){function t(t,r,i){var a=e(i[n]);r.on(o,function(e){t.$apply(function(){a(t,{$event:e})})})}return{restrict:"A",link:t}}var n="md"+e,o="$md."+e.toLowerCase();return t.$inject=["$parse"],t}t.module("material.components.swipe",["material.core"]).directive("mdSwipeLeft",e("SwipeLeft")).directive("mdSwipeRight",e("SwipeRight")).directive("mdSwipeUp",e("SwipeUp")).directive("mdSwipeDown",e("SwipeDown"))}(),function(){function e(e,n,o,r,i,a){function d(e,d){var s=c.compile(e,d);return e.addClass("_md-dragging"),function(e,d,c,l){function m(t){f&&f(e)||(t.stopPropagation(),d.addClass("_md-dragging"),v={width:g.prop("offsetWidth")})}function u(e){if(v){e.stopPropagation(),e.srcEvent&&e.srcEvent.preventDefault();var t=e.pointer.distanceX/v.width,n=l.$viewValue?1+t:t;n=Math.max(0,Math.min(1,n)),g.css(o.CSS.TRANSFORM,"translate3d("+100*n+"%,0,0)"),v.translate=n}}function p(e){if(v){e.stopPropagation(),d.removeClass("_md-dragging"),g.css(o.CSS.TRANSFORM,"");var t=l.$viewValue?v.translate>.5:v.translate<.5;t&&h(!l.$viewValue),v=null}}function h(t){e.$apply(function(){l.$setViewValue(t),l.$render()})}l=l||n.fakeNgModel();var f=null;null!=c.disabled?f=function(){return!0}:c.ngDisabled&&(f=r(c.ngDisabled));var g=t.element(d[0].querySelector("._md-thumb-container")),b=t.element(d[0].querySelector("._md-container"));i(function(){d.removeClass("_md-dragging")}),s(e,d,c,l),f&&e.$watch(f,function(e){d.attr("tabindex",e?-1:0)}),a.register(b,"drag"),b.on("$md.dragstart",m).on("$md.drag",u).on("$md.dragend",p);
var v}}var c=e[0];return{restrict:"E",priority:210,transclude:!0,template:'<div class="_md-container"><div class="_md-bar"></div><div class="_md-thumb-container"><div class="_md-thumb" md-ink-ripple md-ink-ripple-checkbox></div></div></div><div ng-transclude class="_md-label"></div>',require:"?ngModel",compile:d}}t.module("material.components.switch",["material.core","material.components.checkbox"]).directive("mdSwitch",e),e.$inject=["mdCheckboxDirective","$mdUtil","$mdConstant","$parse","$$rAF","$mdGesture"]}(),function(){t.module("material.components.tabs",["material.core","material.components.icon"])}(),function(){function e(e){return{restrict:"E",link:function(t,n,o){t.$on("$destroy",function(){e.destroy()})}}}function n(e){function n(e){r=e}function o(e,n,o,i){function a(t,a,d){r=d.textContent||d.content;var l=!i("gt-sm");return a=o.extractElementByName(a,"md-toast",!0),d.element=a,d.onSwipe=function(e,t){var r=e.type.replace("$md.",""),i=r.replace("swipe","");"down"===i&&-1!=d.position.indexOf("top")&&!l||"up"===i&&(-1!=d.position.indexOf("bottom")||l)||("left"!==i&&"right"!==i||!l)&&(a.addClass("_md-"+r),o.nextTick(n.cancel))},d.openClass=c(d.position),d.parent.addClass(d.openClass),o.hasComputedStyle(d.parent,"position","static")&&d.parent.css("position","relative"),a.on(s,d.onSwipe),a.addClass(l?"_md-bottom":d.position.split(" ").map(function(e){return"_md-"+e}).join(" ")),d.parent&&d.parent.addClass("_md-toast-animating"),e.enter(a,d.parent).then(function(){d.parent&&d.parent.removeClass("_md-toast-animating")})}function d(t,n,r){return n.off(s,r.onSwipe),r.parent&&r.parent.addClass("_md-toast-animating"),r.openClass&&r.parent.removeClass(r.openClass),(1==r.$destroy?n.remove():e.leave(n)).then(function(){r.parent&&r.parent.removeClass("_md-toast-animating"),o.hasComputedStyle(r.parent,"position","static")&&r.parent.css("position","")})}function c(e){return i("gt-xs")?"_md-toast-open-"+(e.indexOf("top")>-1?"top":"bottom"):"_md-toast-open-bottom"}var s="$md.swipeleft $md.swiperight $md.swipeup $md.swipedown";return{onShow:a,onRemove:d,position:"bottom left",themable:!0,hideDelay:3e3,autoWrap:!0,transformTemplate:function(e,n){var o=n.autoWrap&&e&&!/md-toast-content/g.test(e);if(o){var r=document.createElement("md-template");r.innerHTML=e;for(var i=0;i<r.children.length;i++)if("MD-TOAST"===r.children[i].nodeName){var a=t.element('<div class="md-toast-content">');a.append(r.children[i].children),r.children[i].appendChild(a[0])}return r.outerHTML}return e||""}}}var r,i="ok",a=e("$mdToast").setDefaults({methods:["position","hideDelay","capsule","parent","position"],options:o}).addPreset("simple",{argOption:"textContent",methods:["textContent","content","action","highlightAction","highlightClass","theme","parent"],options:["$mdToast","$mdTheming",function(e,t){return{template:'<md-toast md-theme="{{ toast.theme }}" ng-class="{\'md-capsule\': toast.capsule}">  <div class="md-toast-content">    <span flex class="md-toast-text" role="alert" aria-relevant="all" aria-atomic="true">      {{ toast.content }}    </span>    <md-button class="md-action" ng-if="toast.action" ng-click="toast.resolve()"         ng-class="highlightClasses">      {{ toast.action }}    </md-button>  </div></md-toast>',controller:["$scope",function(t){var n=this;n.highlightAction&&(t.highlightClasses=["md-highlight",n.highlightClass]),t.$watch(function(){return r},function(){n.content=r}),this.resolve=function(){e.hide(i)}}],theme:t.defaultTheme(),controllerAs:"toast",bindToController:!0}}]}).addMethod("updateTextContent",n).addMethod("updateContent",n);return o.$inject=["$animate","$mdToast","$mdUtil","$mdMedia"],a}t.module("material.components.toast",["material.core","material.components.button"]).directive("mdToast",e).provider("$mdToast",n),e.$inject=["$mdToast"],n.$inject=["$$interimElementProvider"]}(),function(){function e(e,n,o,r,i){var a=t.bind(null,o.supplant,"translate3d(0,{0}px,0)");return{template:"",restrict:"E",link:function(d,c,s){function l(){function r(e){var t=c.parent().find("md-content");!f&&t.length&&l(null,t),e=d.$eval(e),e===!1?g():g=u()}function l(e,t){t&&c.parent()[0]===t.parent()[0]&&(f&&f.off("scroll",$),f=t,g=u())}function m(e){var t=e?e.target.scrollTop:v;M(),b=Math.min(h/E,Math.max(0,b+t-v)),c.css(n.CSS.TRANSFORM,a([-b*E])),f.css(n.CSS.TRANSFORM,a([(h-b)*E])),v=t,o.nextTick(function(){var e=c.hasClass("md-whiteframe-z1");e&&!b?i.removeClass(c,"md-whiteframe-z1"):!e&&b&&i.addClass(c,"md-whiteframe-z1")})}function u(){return f?(f.on("scroll",$),f.attr("scroll-shrink","true"),e(p),function(){f.off("scroll",$),f.attr("scroll-shrink","false"),e(p)}):t.noop}function p(){h=c.prop("offsetHeight");var e=-h*E+"px";f.css({"margin-top":e,"margin-bottom":e}),m()}var h,f,g=t.noop,b=0,v=0,E=s.mdShrinkSpeedFactor||.5,$=e.throttle(m),M=o.debounce(p,5e3);d.$on("$mdContentLoaded",l),s.$observe("mdScrollShrink",r),s.ngShow&&d.$watch(s.ngShow,p),s.ngHide&&d.$watch(s.ngHide,p),d.$on("$destroy",g)}r(c),t.isDefined(s.mdScrollShrink)&&l()}}}t.module("material.components.toolbar",["material.core","material.components.content"]).directive("mdToolbar",e),e.$inject=["$$rAF","$mdConstant","$mdUtil","$mdTheming","$animate"]}(),function(){function e(){return{controller:o,template:n,compile:function(e,t){e.addClass("md-virtual-repeat-container").addClass(t.hasOwnProperty("mdOrientHorizontal")?"md-orient-horizontal":"md-orient-vertical")}}}function n(e){return'<div class="md-virtual-repeat-scroller"><div class="md-virtual-repeat-sizer"></div><div class="md-virtual-repeat-offsetter">'+e[0].innerHTML+"</div></div>"}function o(e,n,o,r,i,a,d,c){this.$rootScope=r,this.$scope=a,this.$element=d,this.$attrs=c,this.size=0,this.scrollSize=0,this.scrollOffset=0,this.horizontal=this.$attrs.hasOwnProperty("mdOrientHorizontal"),this.repeater=null,this.autoShrink=this.$attrs.hasOwnProperty("mdAutoShrink"),this.autoShrinkMin=parseInt(this.$attrs.mdAutoShrinkMin,10)||0,this.originalSize=null,this.offsetSize=parseInt(this.$attrs.mdOffsetSize,10)||0,this.oldElementSize=null,this.$attrs.mdTopIndex?(this.bindTopIndex=o(this.$attrs.mdTopIndex),this.topIndex=this.bindTopIndex(this.$scope),t.isDefined(this.topIndex)||(this.topIndex=0,this.bindTopIndex.assign(this.$scope,0)),this.$scope.$watch(this.bindTopIndex,t.bind(this,function(e){e!==this.topIndex&&this.scrollToIndex(e)}))):this.topIndex=0,this.scroller=d[0].getElementsByClassName("md-virtual-repeat-scroller")[0],this.sizer=this.scroller.getElementsByClassName("md-virtual-repeat-sizer")[0],this.offsetter=this.scroller.getElementsByClassName("md-virtual-repeat-offsetter")[0];var s=t.bind(this,this.updateSize);e(t.bind(this,function(){s();var e=n.debounce(s,10,null,!1),o=t.element(i);this.size||e(),o.on("resize",e),a.$on("$destroy",function(){o.off("resize",e)}),a.$emit("$md-resize-enable"),a.$on("$md-resize",s)}))}function r(e){return{controller:i,priority:1e3,require:["mdVirtualRepeat","^^mdVirtualRepeatContainer"],restrict:"A",terminal:!0,transclude:"element",compile:function(t,n){var o=n.mdVirtualRepeat,r=o.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)\s*$/),i=r[1],a=e(r[2]),d=n.mdExtraName&&e(n.mdExtraName);return function(e,t,n,o,r){o[0].link_(o[1],r,i,a,d)}}}}function i(e,n,o,r,i,a,d,c){this.$scope=e,this.$element=n,this.$attrs=o,this.$browser=r,this.$document=i,this.$rootScope=a,this.$$rAF=d,this.onDemand=c.parseAttributeBoolean(o.mdOnDemand),this.browserCheckUrlChange=r.$$checkUrlChange,this.newStartIndex=0,this.newEndIndex=0,this.newVisibleEnd=0,this.startIndex=0,this.endIndex=0,this.itemSize=e.$eval(o.mdItemSize)||null,this.isFirstRender=!0,this.isVirtualRepeatUpdating_=!1,this.itemsLength=0,this.unwatchItemSize_=t.noop,this.blocks={},this.pooledBlocks=[]}function a(e){if(!t.isFunction(e.getItemAtIndex)||!t.isFunction(e.getLength))throw Error("When md-on-demand is enabled, the Object passed to md-virtual-repeat must implement functions getItemAtIndex() and getLength() ");this.model=e}t.module("material.components.virtualRepeat",["material.core","material.components.showHide"]).directive("mdVirtualRepeatContainer",e).directive("mdVirtualRepeat",r);var d=1533917,c=3;o.$inject=["$$rAF","$mdUtil","$parse","$rootScope","$window","$scope","$element","$attrs"],o.prototype.register=function(e){this.repeater=e,t.element(this.scroller).on("scroll wheel touchmove touchend",t.bind(this,this.handleScroll_))},o.prototype.isHorizontal=function(){return this.horizontal},o.prototype.getSize=function(){return this.size},o.prototype.setSize_=function(e){var t=this.getDimensionName_();this.size=e,this.$element[0].style[t]=e+"px"},o.prototype.unsetSize_=function(){this.$element[0].style[this.getDimensionName_()]=this.oldElementSize,this.oldElementSize=null},o.prototype.updateSize=function(){this.originalSize||(this.size=this.isHorizontal()?this.$element[0].clientWidth:this.$element[0].clientHeight,this.handleScroll_(),this.repeater&&this.repeater.containerUpdated())},o.prototype.getScrollSize=function(){return this.scrollSize},o.prototype.getDimensionName_=function(){return this.isHorizontal()?"width":"height"},o.prototype.sizeScroller_=function(e){var t=this.getDimensionName_(),n=this.isHorizontal()?"height":"width";if(this.sizer.innerHTML="",d>e)this.sizer.style[t]=e+"px";else{this.sizer.style[t]="auto",this.sizer.style[n]="auto";var o=Math.floor(e/d),r=document.createElement("div");r.style[t]="1533917px",r.style[n]="1px";for(var i=0;o>i;i++)this.sizer.appendChild(r.cloneNode(!1));r.style[t]=e-o*d+"px",this.sizer.appendChild(r)}},o.prototype.autoShrink_=function(e){var t=Math.max(e,this.autoShrinkMin*this.repeater.getItemSize());if(this.autoShrink&&t!==this.size){null===this.oldElementSize&&(this.oldElementSize=this.$element[0].style[this.getDimensionName_()]);var n=this.originalSize||this.size;!n||n>t?(this.originalSize||(this.originalSize=this.size),this.setSize_(t)):null!==this.originalSize&&(this.unsetSize_(),this.originalSize=null,this.updateSize()),this.repeater.containerUpdated()}},o.prototype.setScrollSize=function(e){var t=e+this.offsetSize;this.scrollSize!==t&&(this.sizeScroller_(t),this.autoShrink_(t),this.scrollSize=t)},o.prototype.getScrollOffset=function(){return this.scrollOffset},o.prototype.scrollTo=function(e){this.scroller[this.isHorizontal()?"scrollLeft":"scrollTop"]=e,this.handleScroll_()},o.prototype.scrollToIndex=function(e){var t=this.repeater.getItemSize(),n=this.repeater.itemsLength;e>n&&(e=n-1),this.scrollTo(t*e)},o.prototype.resetScroll=function(){this.scrollTo(0)},o.prototype.handleScroll_=function(){var e=t.element(document)[0],n="rtl"!=e.dir&&"rtl"!=e.body.dir;n||this.maxSize||(this.scroller.scrollLeft=this.scrollSize,this.maxSize=this.scroller.scrollLeft);var o=this.isHorizontal()?n?this.scroller.scrollLeft:this.maxSize-this.scroller.scrollLeft:this.scroller.scrollTop;if(!(o===this.scrollOffset||o>this.scrollSize-this.size)){var r=this.repeater.getItemSize();if(r){var i=Math.max(0,Math.floor(o/r)-c),a=(this.isHorizontal()?"translateX(":"translateY(")+(!this.isHorizontal()||n?i*r:-(i*r))+"px)";if(this.scrollOffset=o,this.offsetter.style.webkitTransform=a,this.offsetter.style.transform=a,this.bindTopIndex){var d=Math.floor(o/r);d!==this.topIndex&&d<this.repeater.getItemCount()&&(this.topIndex=d,this.bindTopIndex.assign(this.$scope,d),this.$rootScope.$$phase||this.$scope.$digest())}this.repeater.containerUpdated()}}},r.$inject=["$parse"],i.$inject=["$scope","$element","$attrs","$browser","$document","$rootScope","$$rAF","$mdUtil"],i.Block,i.prototype.link_=function(e,n,o,r,i){this.container=e,this.transclude=n,this.repeatName=o,this.rawRepeatListExpression=r,this.extraName=i,this.sized=!1,this.repeatListExpression=t.bind(this,this.repeatListExpression_),this.container.register(this)},i.prototype.readItemSize_=function(){if(!this.itemSize){this.items=this.repeatListExpression(this.$scope),this.parentNode=this.$element[0].parentNode;var e=this.getBlock_(0);e.element[0].parentNode||this.parentNode.appendChild(e.element[0]),this.itemSize=e.element[0][this.container.isHorizontal()?"offsetWidth":"offsetHeight"]||null,this.blocks[0]=e,this.poolBlock_(0),this.itemSize&&this.containerUpdated()}},i.prototype.repeatListExpression_=function(e){var t=this.rawRepeatListExpression(e);if(this.onDemand&&t){var n=new a(t);return n.$$includeIndexes(this.newStartIndex,this.newVisibleEnd),n}return t},i.prototype.containerUpdated=function(){return this.itemSize?(this.sized||(this.items=this.repeatListExpression(this.$scope)),this.sized||(this.unwatchItemSize_(),this.sized=!0,this.$scope.$watchCollection(this.repeatListExpression,t.bind(this,function(e,t){this.isVirtualRepeatUpdating_||this.virtualRepeatUpdate_(e,t)}))),this.updateIndexes_(),void((this.newStartIndex!==this.startIndex||this.newEndIndex!==this.endIndex||this.container.getScrollOffset()>this.container.getScrollSize())&&(this.items instanceof a&&this.items.$$includeIndexes(this.newStartIndex,this.newEndIndex),this.virtualRepeatUpdate_(this.items,this.items)))):(this.unwatchItemSize_=this.$scope.$watchCollection(this.repeatListExpression,t.bind(this,function(e){e&&e.length&&this.$$rAF(t.bind(this,this.readItemSize_))})),void(this.$rootScope.$$phase||this.$scope.$digest()))},i.prototype.getItemSize=function(){return this.itemSize},i.prototype.getItemCount=function(){return this.itemsLength},i.prototype.virtualRepeatUpdate_=function(e,n){this.isVirtualRepeatUpdating_=!0;var o=e&&e.length||0,r=!1;if(this.items&&o<this.items.length&&0!==this.container.getScrollOffset())return this.items=e,void this.container.resetScroll();if(o!==this.itemsLength&&(r=!0,this.itemsLength=o),this.items=e,(e!==n||r)&&this.updateIndexes_(),this.parentNode=this.$element[0].parentNode,r&&this.container.setScrollSize(o*this.itemSize),this.isFirstRender){this.isFirstRender=!1;var i=this.$attrs.mdStartIndex?this.$scope.$eval(this.$attrs.mdStartIndex):this.container.topIndex;this.container.scrollToIndex(i)}Object.keys(this.blocks).forEach(function(e){var t=parseInt(e,10);(t<this.newStartIndex||t>=this.newEndIndex)&&this.poolBlock_(t)},this),this.$browser.$$checkUrlChange=t.noop;var a,d,c=[],s=[];for(a=this.newStartIndex;a<this.newEndIndex&&null==this.blocks[a];a++)d=this.getBlock_(a),this.updateBlock_(d,a),c.push(d);for(;null!=this.blocks[a];a++)this.updateBlock_(this.blocks[a],a);for(var l=a-1;a<this.newEndIndex;a++)d=this.getBlock_(a),this.updateBlock_(d,a),s.push(d);c.length&&this.parentNode.insertBefore(this.domFragmentFromBlocks_(c),this.$element[0].nextSibling),s.length&&this.parentNode.insertBefore(this.domFragmentFromBlocks_(s),this.blocks[l]&&this.blocks[l].element[0].nextSibling),this.$browser.$$checkUrlChange=this.browserCheckUrlChange,this.startIndex=this.newStartIndex,this.endIndex=this.newEndIndex,this.isVirtualRepeatUpdating_=!1},i.prototype.getBlock_=function(e){if(this.pooledBlocks.length)return this.pooledBlocks.pop();var n;return this.transclude(t.bind(this,function(t,o){n={element:t,"new":!0,scope:o},this.updateScope_(o,e),this.parentNode.appendChild(t[0])})),n},i.prototype.updateBlock_=function(e,t){this.blocks[t]=e,(e["new"]||e.scope.$index!==t||e.scope[this.repeatName]!==this.items[t])&&(e["new"]=!1,this.updateScope_(e.scope,t),this.$rootScope.$$phase||e.scope.$digest())},i.prototype.updateScope_=function(e,t){e.$index=t,e[this.repeatName]=this.items&&this.items[t],this.extraName&&(e[this.extraName(this.$scope)]=this.items[t])},i.prototype.poolBlock_=function(e){this.pooledBlocks.push(this.blocks[e]),this.parentNode.removeChild(this.blocks[e].element[0]),delete this.blocks[e]},i.prototype.domFragmentFromBlocks_=function(e){var t=this.$document[0].createDocumentFragment();return e.forEach(function(e){t.appendChild(e.element[0])}),t},i.prototype.updateIndexes_=function(){var e=this.items?this.items.length:0,t=Math.ceil(this.container.getSize()/this.itemSize);this.newStartIndex=Math.max(0,Math.min(e-t,Math.floor(this.container.getScrollOffset()/this.itemSize))),this.newVisibleEnd=this.newStartIndex+t+c,this.newEndIndex=Math.min(e,this.newVisibleEnd),this.newStartIndex=Math.max(0,this.newStartIndex-c)},a.prototype.$$includeIndexes=function(e,t){for(var n=e;t>n;n++)this.hasOwnProperty(n)||(this[n]=this.model.getItemAtIndex(n));this.length=this.model.getLength()}}(),function(){function e(e,n,o,r,i,a,d,c,s){function l(d,l,p){function h(){d.delay=d.delay||m}function f(){var e="center top";switch(d.direction){case"left":e="right center";break;case"right":e="left center";break;case"top":e="center bottom";break;case"bottom":e="center top"}T.css("transform-origin",e)}function g(){d.$on("$destroy",function(){d.visible=!1,l.remove(),t.element(n).off("resize",_)}),d.$watch("visible",function(e){e?M():y()}),d.$watch("direction",C)}function b(){k.attr("aria-label")||k.text().trim()||k.attr("aria-label",l.text().trim())}function v(){l.detach(),l.attr("role","tooltip")}function E(){function e(){$(!1)}var o=!1,i=t.element(n);if(k[0]&&"MutationObserver"in n){var a=new MutationObserver(function(e){e.forEach(function(e){"disabled"===e.attributeName&&k[0].disabled&&($(!1),d.$digest())})});a.observe(k[0],{attributes:!0})}var c=function(){s=document.activeElement===k[0]},s=!1;i.on("blur",c),i.on("resize",_),document.addEventListener("scroll",e,!0),d.$on("$destroy",function(){i.off("blur",c),i.off("resize",_),document.removeEventListener("scroll",e,!0),a&&a.disconnect()});var l=function(e){return"focus"===e.type&&s?void(s=!1):(k.on("blur mouseleave touchend touchcancel",m),void $(!0))},m=function(){var e=d.hasOwnProperty("autohide")?d.autohide:p.hasOwnProperty("mdAutohide");(e||o||r[0].activeElement!==k[0])&&(k.off("blur mouseleave touchend touchcancel",m),k.triggerHandler("blur"),$(!1)),o=!1};k.on("mousedown",function(){o=!0}),k.on("focus mouseenter touchstart",l)}function $(t){$.value=!!t,$.queued||(t?($.queued=!0,e(function(){d.visible=$.value,$.queued=!1},d.delay)):i.nextTick(function(){d.visible=!1}))}function M(){return w.append(l),i.hasComputedStyle(l,"display","none")?(d.visible=!1,void l.detach()):(C(),void t.forEach([l,T],function(e){c.addClass(e,"_md-show")}))}function y(){var e=[];t.forEach([l,T],function(t){t.parent()&&t.hasClass("_md-show")&&e.push(c.removeClass(t,"_md-show"))}),s.all(e).then(function(){d.visible||l.detach()})}function C(){d.visible&&(f(),A())}function A(){function e(e){var t={left:e.left,top:e.top};return t.left=Math.min(t.left,w.prop("scrollWidth")-n.width-u),t.left=Math.max(t.left,u),t.top=Math.min(t.top,w.prop("scrollHeight")-n.height-u),t.top=Math.max(t.top,u),t}function t(e){return"left"===e?{left:o.left-n.width-u,top:o.top+o.height/2-n.height/2}:"right"===e?{left:o.left+o.width+u,top:o.top+o.height/2-n.height/2}:"top"===e?{left:o.left+o.width/2-n.width/2,top:o.top-n.height-u}:{left:o.left+o.width/2-n.width/2,top:o.top+o.height+u}}var n=i.offsetRect(l,w),o=i.offsetRect(k,w),r=t(d.direction),a=l.prop("offsetParent");d.direction?r=e(r):a&&r.top>a.scrollHeight-n.height-u&&(r=e(t("top"))),l.css({left:r.left+"px",top:r.top+"px"})}a(l);var k=i.getParentWithPointerEvents(l),T=t.element(l[0].getElementsByClassName("_md-content")[0]),w=t.element(document.body),_=o.throttle(function(){C()});c.pin&&c.pin(l,k),h(),v(),E(),f(),g(),b()}var m=0,u=8;return{restrict:"E",transclude:!0,priority:210,template:'<div class="_md-content" ng-transclude></div>',scope:{delay:"=?mdDelay",visible:"=?mdVisible",autohide:"=?mdAutohide",direction:"@?mdDirection"},link:l}}t.module("material.components.tooltip",["material.core"]).directive("mdTooltip",e),e.$inject=["$timeout","$window","$$rAF","$document","$mdUtil","$mdTheming","$rootElement","$animate","$q"]}(),function(){function e(e){function t(t,i,a){var d=parseInt(a.mdWhiteframe,10)||r;(d>o||n>d)&&(e.warn("md-whiteframe attribute value is invalid. It should be a number between "+n+" and "+o,i[0]),d=r),i.addClass("md-whiteframe-"+d+"dp")}var n=1,o=24,r=4;return{restrict:"A",link:t}}t.module("material.components.whiteframe",["material.core"]).directive("mdWhiteframe",e),e.$inject=["$log"]}(),function(){function e(e,o,d,c,s,l,m,u,p,h){function f(){d.initOptionalProperties(e,p,{searchText:null,selectedItem:null}),s(o),E(),d.nextTick(function(){M(),b(),v(),o.on("focus",v)})}function g(){function t(){var e=0,t=o.find("md-input-container");if(t.length){var n=t.find("input");e=t.prop("offsetHeight"),e-=n.prop("offsetTop"),e-=n.prop("offsetHeight"),e+=t.prop("offsetTop")}return e}function n(){var e=ue.scrollContainer.getBoundingClientRect(),t={};e.right>m.right-i&&(t.left=s.right-e.width+"px"),ue.$.scrollContainer.css(t)}if(!ue)return d.nextTick(g,!1,e);var c,s=ue.wrap.getBoundingClientRect(),l=ue.snap.getBoundingClientRect(),m=ue.root.getBoundingClientRect(),u=l.bottom-m.top,h=m.bottom-l.top,f=s.left-m.left,b=s.width,v=t();p.mdFloatingLabel&&(f+=a,b-=2*a),c={left:f+"px",minWidth:b+"px",maxWidth:Math.max(s.right-m.left,m.right-s.left)-i+"px"},u>h&&m.height-s.bottom-i<r?(c.top="auto",c.bottom=h+"px",c.maxHeight=Math.min(r,s.top-m.top-i)+"px"):(c.top=u-v+"px",c.bottom="auto",c.maxHeight=Math.min(r,m.bottom+d.scrollTop()-s.bottom-i)+"px"),ue.$.scrollContainer.css(c),d.nextTick(n,!1)}function b(){ue.$.root.length&&(s(ue.$.scrollContainer),ue.$.scrollContainer.detach(),ue.$.root.append(ue.$.scrollContainer),m.pin&&m.pin(ue.$.scrollContainer,u))}function v(){e.autofocus&&ue.input.focus()}function E(){var n=parseInt(e.delay,10)||0;p.$observe("disabled",function(e){se.isDisabled=d.parseAttributeBoolean(e,!1)}),p.$observe("required",function(e){se.isRequired=d.parseAttributeBoolean(e,!1)}),p.$observe("readonly",function(e){se.isReadonly=d.parseAttributeBoolean(e,!1)}),e.$watch("searchText",n?d.debounce(I,n):I),e.$watch("selectedItem",_),t.element(l).on("resize",g),e.$on("$destroy",$)}function $(){if(se.hidden||d.enableScrolling(),t.element(l).off("resize",g),ue){var e="ul scroller scrollContainer input".split(" ");t.forEach(e,function(e){ue.$[e].remove()})}}function M(){ue={main:o[0],scrollContainer:o[0].getElementsByClassName("md-virtual-repeat-container")[0],scroller:o[0].getElementsByClassName("md-virtual-repeat-scroller")[0],ul:o.find("ul")[0],input:o.find("input")[0],wrap:o.find("md-autocomplete-wrap")[0],root:document.body},ue.li=ue.ul.getElementsByTagName("li"),ue.snap=y(),ue.$=C(ue)}function y(){for(var e=o;e.length;e=e.parent())if(t.isDefined(e.attr("md-autocomplete-snap")))return e[0];return ue.wrap}function C(e){var n={};for(var o in e)e.hasOwnProperty(o)&&(n[o]=t.element(e[o]));return n}function A(t,n){!t&&n?(g(),ue&&d.nextTick(function(){d.disableScrollAround(ue.ul)},!1,e)):t&&!n&&d.nextTick(function(){d.enableScrolling()},!1,e)}function k(){he=!0}function T(){ge||ue.input.focus(),he=!1,se.hidden=j()}function w(){ue.input.focus()}function _(t,n){t&&B(t).then(function(o){e.searchText=o,S(t,n)}),t!==n&&x()}function x(){t.isFunction(e.itemChange)&&e.itemChange(U(e.selectedItem))}function N(){t.isFunction(e.textChange)&&e.textChange()}function S(e,t){fe.forEach(function(n){n(e,t)})}function H(e){-1==fe.indexOf(e)&&fe.push(e)}function D(e){var t=fe.indexOf(e);-1!=t&&fe.splice(t,1)}function I(t,n){se.index=z(),t!==n&&B(e.selectedItem).then(function(o){t!==o&&(e.selectedItem=null,t!==n&&N(),X()?de():(se.matches=[],q(!1),te()))})}function O(){ge=!1,he||(se.hidden=j())}function R(e){e&&(he=!1,ge=!1),ue.input.blur()}function L(){ge=!0,t.isString(e.searchText)||(e.searchText=""),se.hidden=j(),se.hidden||de()}function P(e){switch(e.keyCode){case c.KEY_CODE.DOWN_ARROW:if(se.loading)return;e.stopPropagation(),e.preventDefault(),se.index=Math.min(se.index+1,se.matches.length-1),oe(),te();break;case c.KEY_CODE.UP_ARROW:if(se.loading)return;e.stopPropagation(),e.preventDefault(),se.index=se.index<0?se.matches.length-1:Math.max(0,se.index-1),oe(),te();break;case c.KEY_CODE.TAB:if(T(),se.hidden||se.loading||se.index<0||se.matches.length<1)return;Z(se.index);break;case c.KEY_CODE.ENTER:if(se.hidden||se.loading||se.index<0||se.matches.length<1)return;if(Y())return;e.stopPropagation(),e.preventDefault(),Z(se.index);break;case c.KEY_CODE.ESCAPE:e.stopPropagation(),e.preventDefault(),J(),R(!0)}}function F(){return t.isNumber(e.minLength)?e.minLength:1}function B(t){function n(t){return t&&e.itemText?e.itemText(U(t)):null}return h.when(n(t)||t)}function U(e){if(!e)return n;var t={};return se.itemName&&(t[se.itemName]=e),t}function z(){return e.autoselect?0:-1}function q(e){se.loading!=e&&(se.loading=e),se.hidden=j()}function j(){return se.loading&&!W()?!0:Y()?!0:ge?!V():!0}function V(){return X()&&W()||ae()}function W(){return!!se.matches.length}function Y(){return!!se.scope.selectedItem}function K(){return se.loading&&!Y()}function G(){return B(se.matches[se.index])}function X(){return(e.searchText||"").length>=F()}function Q(e,t,n){Object.defineProperty(se,e,{get:function(){return n},set:function(e){var o=n;n=e,t(e,o)}})}function Z(t){d.nextTick(function(){B(se.matches[t]).then(function(e){var t=ue.$.input.controller("ngModel");t.$setViewValue(e),t.$render()})["finally"](function(){e.selectedItem=se.matches[t],q(!1)})},!1)}function J(){q(!0),se.index=0,se.matches=[],e.searchText="";var t=document.createEvent("CustomEvent");t.initCustomEvent("input",!0,!0,{value:e.searchText}),ue.input.dispatchEvent(t),ue.input.focus()}function ee(n){function o(t){t&&(t=h.when(t),ve++,q(!0),d.nextTick(function(){t.then(r)["finally"](function(){0===--ve&&q(!1)})},!0,e))}function r(t){pe[a]=t,(n||"")===(e.searchText||"")&&(se.matches=t,se.hidden=j(),se.loading&&q(!1),e.selectOnMatch&&ce(),te(),g())}var i=e.$parent.$eval(me),a=n.toLowerCase(),c=t.isArray(i),s=!!i.then;c?r(i):s&&o(i)}function te(){G().then(function(e){se.messages=[ne(),e]})}function ne(){if(be===se.matches.length)return"";switch(be=se.matches.length,se.matches.length){case 0:return"There are no matches available.";case 1:return"There is 1 match available.";default:return"There are "+se.matches.length+" matches available."}}function oe(){if(ue.li[0]){var e=ue.li[0].offsetHeight,t=e*se.index,n=t+e,o=ue.scroller.clientHeight,r=ue.scroller.scrollTop;r>t?ie(t):n>r+o&&ie(n-o)}}function re(){return 0!==ve}function ie(e){ue.$.scrollContainer.controller("mdVirtualRepeatContainer").scrollTo(e)}function ae(){var e=(se.scope.searchText||"").length;return se.hasNotFound&&!W()&&(!se.loading||re())&&e>=F()&&(ge||he)&&!Y()}function de(){var t=e.searchText||"",n=t.toLowerCase();!e.noCache&&pe[n]?(se.matches=pe[n],te()):ee(t),se.hidden=j()}function ce(){var t=e.searchText,n=se.matches,o=n[0];1===n.length&&B(o).then(function(n){var o=t==n;e.matchInsensitive&&!o&&(o=t.toLowerCase()==n.toLowerCase()),o&&Z(0)})}var se=this,le=e.itemsExpr.split(/ in /i),me=le[1],ue=null,pe={},he=!1,fe=[],ge=!1,be=0,ve=0;return Q("hidden",A,!0),se.scope=e,se.parent=e.$parent,se.itemName=le[0],se.matches=[],se.loading=!1,se.hidden=!0,se.index=null,se.messages=[],se.id=d.nextUid(),se.isDisabled=null,se.isRequired=null,se.isReadonly=null,se.hasNotFound=!1,se.keydown=P,se.blur=O,se.focus=L,se.clear=J,se.select=Z,se.listEnter=k,se.listLeave=T,se.mouseUp=w,se.getCurrentDisplayValue=G,se.registerSelectedItemWatcher=H,se.unregisterSelectedItemWatcher=D,se.notFoundVisible=ae,se.loadingIsVisible=K,f()}t.module("material.components.autocomplete").controller("MdAutocompleteCtrl",e);var o=41,r=5.5*o,i=8,a=2;e.$inject=["$scope","$element","$mdUtil","$mdConstant","$mdTheming","$window","$animate","$rootElement","$attrs","$q"]}(),function(){function e(){return{controller:"MdAutocompleteCtrl",controllerAs:"$mdAutocompleteCtrl",scope:{inputName:"@mdInputName",inputMinlength:"@mdInputMinlength",inputMaxlength:"@mdInputMaxlength",searchText:"=?mdSearchText",selectedItem:"=?mdSelectedItem",itemsExpr:"@mdItems",itemText:"&mdItemText",placeholder:"@placeholder",noCache:"=?mdNoCache",selectOnMatch:"=?mdSelectOnMatch",matchInsensitive:"=?mdMatchCaseInsensitive",itemChange:"&?mdSelectedItemChange",textChange:"&?mdSearchTextChange",minLength:"=?mdMinLength",delay:"=?mdDelay",autofocus:"=?mdAutofocus",floatingLabel:"@?mdFloatingLabel",autoselect:"=?mdAutoselect",menuClass:"@?mdMenuClass",inputId:"@?mdInputId"},link:function(e,t,n,o){o.hasNotFound=!!t.attr("md-has-not-found")},template:function(e,t){function n(){var t=e.find("md-item-template").detach(),n=t.length?t.html():e.html();return t.length||e.empty(),"<md-autocomplete-parent-scope md-autocomplete-replace>"+n+"</md-autocomplete-parent-scope>"}function o(){var t=e.find("md-not-found").detach(),n=t.length?t.html():"";return n?'<li ng-if="$mdAutocompleteCtrl.notFoundVisible()"                         md-autocomplete-parent-scope>'+n+"</li>":""}function r(){return t.mdFloatingLabel?'            <md-input-container flex ng-if="floatingLabel">              <label>{{floatingLabel}}</label>              <input type="search"                  '+(null!=c?'tabindex="'+c+'"':"")+'                  id="{{ inputId || \'fl-input-\' + $mdAutocompleteCtrl.id }}"                  name="{{inputName}}"                  autocomplete="off"                  ng-required="$mdAutocompleteCtrl.isRequired"                  ng-readonly="$mdAutocompleteCtrl.isReadonly"                  ng-minlength="inputMinlength"                  ng-maxlength="inputMaxlength"                  ng-disabled="$mdAutocompleteCtrl.isDisabled"                  ng-model="$mdAutocompleteCtrl.scope.searchText"                  ng-keydown="$mdAutocompleteCtrl.keydown($event)"                  ng-blur="$mdAutocompleteCtrl.blur()"                  '+(null!=t.mdNoAsterisk?'md-no-asterisk="'+t.mdNoAsterisk+'"':"")+'                  ng-focus="$mdAutocompleteCtrl.focus()"                  aria-owns="ul-{{$mdAutocompleteCtrl.id}}"                  '+(null!=t.mdSelectOnFocus?'md-select-on-focus=""':"")+'                  aria-label="{{floatingLabel}}"                  aria-autocomplete="list"                  aria-haspopup="true"                  aria-activedescendant=""                  aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>              <div md-autocomplete-parent-scope md-autocomplete-replace>'+d+"</div>            </md-input-container>":'            <input flex type="search"                '+(null!=c?'tabindex="'+c+'"':"")+'                id="{{ inputId || \'input-\' + $mdAutocompleteCtrl.id }}"                name="{{inputName}}"                ng-if="!floatingLabel"                autocomplete="off"                ng-required="$mdAutocompleteCtrl.isRequired"                ng-disabled="$mdAutocompleteCtrl.isDisabled"                ng-readonly="$mdAutocompleteCtrl.isReadonly"                ng-model="$mdAutocompleteCtrl.scope.searchText"                ng-keydown="$mdAutocompleteCtrl.keydown($event)"                ng-blur="$mdAutocompleteCtrl.blur()"                ng-focus="$mdAutocompleteCtrl.focus()"                placeholder="{{placeholder}}"                aria-owns="ul-{{$mdAutocompleteCtrl.id}}"                '+(null!=t.mdSelectOnFocus?'md-select-on-focus=""':"")+'                aria-label="{{placeholder}}"                aria-autocomplete="list"                aria-haspopup="true"                aria-activedescendant=""                aria-expanded="{{!$mdAutocompleteCtrl.hidden}}"/>            <button                type="button"                tabindex="-1"                ng-if="$mdAutocompleteCtrl.scope.searchText && !$mdAutocompleteCtrl.isDisabled"                ng-click="$mdAutocompleteCtrl.clear()">              <md-icon md-svg-icon="md-close"></md-icon>              <span class="_md-visually-hidden">Clear</span>            </button>                '}var i=o(),a=n(),d=e.html(),c=t.tabindex;return i&&e.attr("md-has-not-found",!0),e.attr("tabindex","-1"),'        <md-autocomplete-wrap            layout="row"            ng-class="{ \'md-whiteframe-z1\': !floatingLabel, \'md-menu-showing\': !$mdAutocompleteCtrl.hidden }"            role="listbox">          '+r()+'          <md-progress-linear              class="'+(t.mdFloatingLabel?"md-inline":"")+'"              ng-if="$mdAutocompleteCtrl.loadingIsVisible()"              md-mode="indeterminate"></md-progress-linear>          <md-virtual-repeat-container              md-auto-shrink              md-auto-shrink-min="1"              ng-mouseenter="$mdAutocompleteCtrl.listEnter()"              ng-mouseleave="$mdAutocompleteCtrl.listLeave()"              ng-mouseup="$mdAutocompleteCtrl.mouseUp()"              ng-hide="$mdAutocompleteCtrl.hidden"              class="md-autocomplete-suggestions-container md-whiteframe-z1"              ng-class="{ \'md-not-found\': $mdAutocompleteCtrl.notFoundVisible() }"              role="presentation">            <ul class="md-autocomplete-suggestions"                ng-class="::menuClass"                id="ul-{{$mdAutocompleteCtrl.id}}">              <li md-virtual-repeat="item in $mdAutocompleteCtrl.matches"                  ng-class="{ selected: $index === $mdAutocompleteCtrl.index }"                  ng-click="$mdAutocompleteCtrl.select($index)"                  md-extra-name="$mdAutocompleteCtrl.itemName">                  '+a+"                  </li>"+i+'            </ul>          </md-virtual-repeat-container>        </md-autocomplete-wrap>        <aria-status            class="_md-visually-hidden"            role="status"            aria-live="assertive">          <p ng-repeat="message in $mdAutocompleteCtrl.messages track by $index" ng-if="message">{{message}}</p>        </aria-status>';
}}}t.module("material.components.autocomplete").directive("mdAutocomplete",e)}(),function(){function e(e,t){function n(e,n,o){return function(e,n,r){function i(n,o){c[o]=e[n],e.$watch(n,function(e){t.nextTick(function(){c[o]=e})})}function a(){var t=!1,n=!1;e.$watch(function(){n||t||(t=!0,e.$$postDigest(function(){n||c.$digest(),t=n=!1}))}),c.$watch(function(){n=!0})}var d=e.$mdAutocompleteCtrl,c=d.parent.$new(),s=d.itemName;i("$index","$index"),i("item",s),a(),o(c,function(e){n.after(e)})}}return{restrict:"AE",compile:n,terminal:!0,transclude:"element"}}t.module("material.components.autocomplete").directive("mdAutocompleteParentScope",e),e.$inject=["$compile","$mdUtil"]}(),function(){function e(e,n,o){function r(r,i){var d=null,c=null,s=o.mdHighlightFlags||"",l=e.$watch(function(e){return{term:r(e),unsafeText:i(e)}},function(e,o){null!==d&&e.unsafeText===o.unsafeText||(d=t.element("<div>").text(e.unsafeText).html()),null!==c&&e.term===o.term||(c=a(e.term,s)),n.html(d.replace(c,'<span class="highlight">$&</span>'))},!0);n.on("$destroy",l)}function i(e){return e&&e.replace(/[\\\^\$\*\+\?\.\(\)\|\{}\[\]]/g,"\\$&")}function a(e,t){var n="";return t.indexOf("^")>=1&&(n+="^"),n+=e,t.indexOf("$")>=1&&(n+="$"),new RegExp(i(n),t.replace(/[\$\^]/g,""))}this.init=r}t.module("material.components.autocomplete").controller("MdHighlightCtrl",e),e.$inject=["$scope","$element","$attrs"]}(),function(){function e(e,t){return{terminal:!0,controller:"MdHighlightCtrl",compile:function(n,o){var r=t(o.mdHighlightText),i=e(n.html());return function(e,t,n,o){o.init(r,i)}}}}t.module("material.components.autocomplete").directive("mdHighlightText",e),e.$inject=["$interpolate","$parse"]}(),function(){function o(e,t,o,r,i){this.$scope=e,this.$element=t,this.$mdConstant=o,this.$timeout=r,this.$mdUtil=i,this.isEditting=!1,this.parentController=n,this.enableChipEdit=!1}t.module("material.components.chips").controller("MdChipCtrl",o),o.$inject=["$scope","$element","$mdConstant","$timeout","$mdUtil"],o.prototype.init=function(e){this.parentController=e,this.enableChipEdit=this.parentController.enableChipEdit,this.enableChipEdit&&(this.$element.on("keydown",this.chipKeyDown.bind(this)),this.$element.on("mousedown",this.chipMouseDown.bind(this)),this.getChipContent().addClass("_md-chip-content-edit-is-enabled"))},o.prototype.getChipContent=function(){var e=this.$element[0].getElementsByClassName("_md-chip-content");return t.element(e[0])},o.prototype.getContentElement=function(){return t.element(this.getChipContent().children()[0])},o.prototype.getChipIndex=function(){return parseInt(this.$element.attr("index"))},o.prototype.goOutOfEditMode=function(){if(this.isEditting){this.isEditting=!1,this.$element.removeClass("_md-chip-editing"),this.getChipContent()[0].contentEditable="false";var e=this.getChipIndex(),t=this.getContentElement().text();t?(this.parentController.updateChipContents(e,this.getContentElement().text()),this.$mdUtil.nextTick(function(){this.parentController.selectedChip===e&&this.parentController.focusChip(e)}.bind(this))):this.parentController.removeChipAndFocusInput(e)}},o.prototype.selectNodeContents=function(t){var n,o;document.body.createTextRange?(n=document.body.createTextRange(),n.moveToElementText(t),n.select()):e.getSelection&&(o=e.getSelection(),n=document.createRange(),n.selectNodeContents(t),o.removeAllRanges(),o.addRange(n))},o.prototype.goInEditMode=function(){this.isEditting=!0,this.$element.addClass("_md-chip-editing"),this.getChipContent()[0].contentEditable="true",this.getChipContent().on("blur",function(){this.goOutOfEditMode()}.bind(this)),this.selectNodeContents(this.getChipContent()[0])},o.prototype.chipKeyDown=function(e){this.isEditting||e.keyCode!==this.$mdConstant.KEY_CODE.ENTER&&e.keyCode!==this.$mdConstant.KEY_CODE.SPACE?this.isEditting&&e.keyCode===this.$mdConstant.KEY_CODE.ENTER&&(e.preventDefault(),this.goOutOfEditMode()):(e.preventDefault(),this.goInEditMode())},o.prototype.chipMouseDown=function(){this.getChipIndex()==this.parentController.selectedChip&&this.enableChipEdit&&!this.isEditting&&this.goInEditMode()}}(),function(){function e(e,o){function r(n,r){return n.append(o.processTemplate(i)),function(n,o,r,i){var a=i.shift(),d=i.shift();e(o),a&&(d.init(a),t.element(o[0].querySelector("._md-chip-content")).on("blur",function(){a.selectedChip=-1,a.$scope.$applyAsync()}))}}var i=o.processTemplate(n);return{restrict:"E",require:["^?mdChips","mdChip"],compile:r,controller:"MdChipCtrl"}}t.module("material.components.chips").directive("mdChip",e);var n='    <span ng-if="!$mdChipsCtrl.readonly" class="_md-visually-hidden">      {{$mdChipsCtrl.deleteHint}}    </span>';e.$inject=["$mdTheming","$mdUtil"]}(),function(){function e(e){function t(t,n,o,r){n.on("click",function(e){t.$apply(function(){r.removeChip(t.$$replacedScope.$index)})}),e(function(){n.attr({tabindex:-1,"aria-hidden":!0}),n.find("button").attr("tabindex","-1")})}return{restrict:"A",require:"^mdChips",scope:!1,link:t}}t.module("material.components.chips").directive("mdChipRemove",e),e.$inject=["$timeout"]}(),function(){function e(e){function t(t,n,o){var r=t.$parent.$mdChipsCtrl,i=r.parent.$new(!1,r.parent);i.$$replacedScope=t,i.$chip=t.$chip,i.$index=t.$index,i.$mdChipsCtrl=r;var a=r.$scope.$eval(o.mdChipTransclude);n.html(a),e(n.contents())(i)}return{restrict:"EA",terminal:!0,link:t,scope:!1}}t.module("material.components.chips").directive("mdChipTransclude",e),e.$inject=["$compile"]}(),function(){function e(e,t,n,o,r,i){this.$timeout=r,this.$mdConstant=t,this.$scope=e,this.parent=e.$parent,this.$log=n,this.$element=o,this.ngModelCtrl=null,this.userInputNgModelCtrl=null,this.userInputElement=null,this.items=[],this.selectedChip=-1,this.hasAutocomplete=!1,this.enableChipEdit=i.parseAttributeBoolean(this.mdEnableChipEdit),this.deleteHint="Press delete to remove this chip.",this.deleteButtonLabel="Remove",this.chipBuffer="",this.useOnAppend=!1,this.useTransformChip=!1,this.useOnAdd=!1,this.useOnRemove=!1,this.useOnSelect=!1}t.module("material.components.chips").controller("MdChipsCtrl",e),e.$inject=["$scope","$mdConstant","$log","$element","$timeout","$mdUtil"],e.prototype.inputKeydown=function(e){var t=this.getChipBuffer();if(!(this.hasAutocomplete&&e.isDefaultPrevented&&e.isDefaultPrevented())){if(e.keyCode===this.$mdConstant.KEY_CODE.BACKSPACE){if(t)return;return e.preventDefault(),e.stopPropagation(),void(this.items.length&&this.selectAndFocusChipSafe(this.items.length-1))}if((!this.separatorKeys||this.separatorKeys.length<1)&&(this.separatorKeys=[this.$mdConstant.KEY_CODE.ENTER]),-1!==this.separatorKeys.indexOf(e.keyCode)){if(this.hasAutocomplete&&this.requireMatch||!t)return;if(e.preventDefault(),this.hasMaxChipsReached())return;this.appendChip(t.trim()),this.resetChipBuffer()}}},e.prototype.updateChipContents=function(e,t){e>=0&&e<this.items.length&&(this.items[e]=t,this.ngModelCtrl.$setDirty())},e.prototype.isEditingChip=function(){return!!this.$element[0].getElementsByClassName("_md-chip-editing").length},e.prototype.chipKeydown=function(e){if(!this.getChipBuffer()&&!this.isEditingChip())switch(e.keyCode){case this.$mdConstant.KEY_CODE.BACKSPACE:case this.$mdConstant.KEY_CODE.DELETE:if(this.selectedChip<0)return;e.preventDefault(),this.removeAndSelectAdjacentChip(this.selectedChip);break;case this.$mdConstant.KEY_CODE.LEFT_ARROW:e.preventDefault(),this.selectedChip<0&&(this.selectedChip=this.items.length),this.items.length&&this.selectAndFocusChipSafe(this.selectedChip-1);break;case this.$mdConstant.KEY_CODE.RIGHT_ARROW:e.preventDefault(),this.selectAndFocusChipSafe(this.selectedChip+1);break;case this.$mdConstant.KEY_CODE.ESCAPE:case this.$mdConstant.KEY_CODE.TAB:if(this.selectedChip<0)return;e.preventDefault(),this.onFocus()}},e.prototype.getPlaceholder=function(){var e=this.items.length&&(""==this.secondaryPlaceholder||this.secondaryPlaceholder);return e?this.secondaryPlaceholder:this.placeholder},e.prototype.removeAndSelectAdjacentChip=function(e){var n=this.getAdjacentChipIndex(e);this.removeChip(e),this.$timeout(t.bind(this,function(){this.selectAndFocusChipSafe(n)}))},e.prototype.resetSelectedChip=function(){this.selectedChip=-1},e.prototype.getAdjacentChipIndex=function(e){var t=this.items.length-1;return 0==t?-1:e==t?e-1:e},e.prototype.appendChip=function(e){if(this.useTransformChip&&this.transformChip){var n=this.transformChip({$chip:e});t.isDefined(n)&&(e=n)}if(t.isObject(e)){var o=this.items.some(function(n){return t.equals(e,n)});if(o)return}if(!(null==e||this.items.indexOf(e)+1)){var r=this.items.push(e);this.ngModelCtrl.$setDirty(),this.validateModel(),this.useOnAdd&&this.onAdd&&this.onAdd({$chip:e,$index:r})}},e.prototype.useOnAppendExpression=function(){this.$log.warn("md-on-append is deprecated; please use md-transform-chip or md-on-add instead"),this.useTransformChip&&this.transformChip||(this.useTransformChip=!0,this.transformChip=this.onAppend)},e.prototype.useTransformChipExpression=function(){this.useTransformChip=!0},e.prototype.useOnAddExpression=function(){this.useOnAdd=!0},e.prototype.useOnRemoveExpression=function(){this.useOnRemove=!0},e.prototype.useOnSelectExpression=function(){this.useOnSelect=!0},e.prototype.getChipBuffer=function(){return this.userInputElement?this.userInputNgModelCtrl?this.userInputNgModelCtrl.$viewValue:this.userInputElement[0].value:this.chipBuffer},e.prototype.resetChipBuffer=function(){this.userInputElement?this.userInputNgModelCtrl?(this.userInputNgModelCtrl.$setViewValue(""),this.userInputNgModelCtrl.$render()):this.userInputElement[0].value="":this.chipBuffer=""},e.prototype.hasMaxChipsReached=function(){return t.isString(this.maxChips)&&(this.maxChips=parseInt(this.maxChips,10)||0),this.maxChips>0&&this.items.length>=this.maxChips},e.prototype.validateModel=function(){this.ngModelCtrl.$setValidity("md-max-chips",!this.hasMaxChipsReached())},e.prototype.removeChip=function(e){var t=this.items.splice(e,1);this.ngModelCtrl.$setDirty(),this.validateModel(),t&&t.length&&this.useOnRemove&&this.onRemove&&this.onRemove({$chip:t[0],$index:e})},e.prototype.removeChipAndFocusInput=function(e){this.removeChip(e),this.onFocus()},e.prototype.selectAndFocusChipSafe=function(e){return this.items.length?e===this.items.length?this.onFocus():(e=Math.max(e,0),e=Math.min(e,this.items.length-1),this.selectChip(e),void this.focusChip(e)):(this.selectChip(-1),void this.onFocus())},e.prototype.selectChip=function(e){e>=-1&&e<=this.items.length?(this.selectedChip=e,this.useOnSelect&&this.onSelect&&this.onSelect({$chip:this.items[this.selectedChip]})):this.$log.warn("Selected Chip index out of bounds; ignoring.")},e.prototype.selectAndFocusChip=function(e){this.selectChip(e),-1!=e&&this.focusChip(e)},e.prototype.focusChip=function(e){this.$element[0].querySelector('md-chip[index="'+e+'"] ._md-chip-content').focus()},e.prototype.configureNgModel=function(e){this.ngModelCtrl=e;var t=this;e.$render=function(){t.items=t.ngModelCtrl.$viewValue}},e.prototype.onFocus=function(){var e=this.$element[0].querySelector("input");e&&e.focus(),this.resetSelectedChip()},e.prototype.onInputFocus=function(){this.inputHasFocus=!0,this.resetSelectedChip()},e.prototype.onInputBlur=function(){this.inputHasFocus=!1},e.prototype.configureUserInput=function(e){this.userInputElement=e;var n=e.controller("ngModel");n!=this.ngModelCtrl&&(this.userInputNgModelCtrl=n);var o=this.$scope,r=this,i=function(e,n){o.$evalAsync(t.bind(r,n,e))};e.attr({tabindex:0}).on("keydown",function(e){i(e,r.inputKeydown)}).on("focus",function(e){i(e,r.onInputFocus)}).on("blur",function(e){i(e,r.onInputBlur)})},e.prototype.configureAutocomplete=function(e){e&&(this.hasAutocomplete=!0,e.registerSelectedItemWatcher(t.bind(this,function(e){if(e){if(this.hasMaxChipsReached())return;this.appendChip(e),this.resetChipBuffer()}})),this.$element.find("input").on("focus",t.bind(this,this.onInputFocus)).on("blur",t.bind(this,this.onInputBlur)))},e.prototype.hasFocus=function(){return this.inputHasFocus||this.selectedChip>=0}}(),function(){function e(e,t,a,d,c){function s(n,o){function r(e){if(o.ngModel){var t=i[0].querySelector(e);return t&&t.outerHTML}}var i=o.$mdUserTemplate;o.$mdUserTemplate=null;var s=r("md-chips>md-chip-template"),l=r("md-chips>*[md-chip-remove]")||m.remove,u=s||m["default"],p=r("md-chips>md-autocomplete")||r("md-chips>input")||m.input,h=i.find("md-chip");return i[0].querySelector("md-chip-template>*[md-chip-remove]")&&d.warn("invalid placement of md-chip-remove within md-chip-template."),function(n,r,i,d){t.initOptionalProperties(n,o),e(r);var f=d[0];if(s&&(f.enableChipEdit=!1),f.chipContentsTemplate=u,f.chipRemoveTemplate=l,f.chipInputTemplate=p,r.attr({"aria-hidden":!0,tabindex:-1}).on("focus",function(){f.onFocus()}),o.ngModel&&(f.configureNgModel(r.controller("ngModel")),i.mdTransformChip&&f.useTransformChipExpression(),i.mdOnAppend&&f.useOnAppendExpression(),i.mdOnAdd&&f.useOnAddExpression(),i.mdOnRemove&&f.useOnRemoveExpression(),i.mdOnSelect&&f.useOnSelectExpression(),p!=m.input&&n.$watch("$mdChipsCtrl.readonly",function(e){e||t.nextTick(function(){0===p.indexOf("<md-autocomplete")&&f.configureAutocomplete(r.find("md-autocomplete").controller("mdAutocomplete")),f.configureUserInput(r.find("input"))})}),t.nextTick(function(){var e=r.find("input");e&&e.toggleClass("md-input",!0)})),h.length>0){var g=a(h.clone())(n.$parent);c(function(){r.find("md-chips-wrap").prepend(g)})}}}function l(){return{chips:t.processTemplate(n),input:t.processTemplate(o),"default":t.processTemplate(r),remove:t.processTemplate(i)}}var m=l();return{template:function(e,t){return t.$mdUserTemplate=e.clone(),m.chips},require:["mdChips"],restrict:"E",controller:"MdChipsCtrl",controllerAs:"$mdChipsCtrl",bindToController:!0,compile:s,scope:{readonly:"=readonly",placeholder:"@",mdEnableChipEdit:"@",secondaryPlaceholder:"@",maxChips:"@mdMaxChips",transformChip:"&mdTransformChip",onAppend:"&mdOnAppend",onAdd:"&mdOnAdd",onRemove:"&mdOnRemove",onSelect:"&mdOnSelect",deleteHint:"@",deleteButtonLabel:"@",separatorKeys:"=?mdSeparatorKeys",requireMatch:"=?mdRequireMatch"}}}t.module("material.components.chips").directive("mdChips",e);var n='      <md-chips-wrap          ng-keydown="$mdChipsCtrl.chipKeydown($event)"          ng-class="{ \'md-focused\': $mdChipsCtrl.hasFocus(), \'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly}"          class="md-chips">        <md-chip ng-repeat="$chip in $mdChipsCtrl.items"            index="{{$index}}"            ng-class="{\'md-focused\': $mdChipsCtrl.selectedChip == $index, \'md-readonly\': !$mdChipsCtrl.ngModelCtrl || $mdChipsCtrl.readonly}">          <div class="_md-chip-content"              tabindex="-1"              aria-hidden="true"              ng-click="!$mdChipsCtrl.readonly && $mdChipsCtrl.focusChip($index)"              ng-focus="!$mdChipsCtrl.readonly && $mdChipsCtrl.selectChip($index)"              md-chip-transclude="$mdChipsCtrl.chipContentsTemplate"></div>          <div ng-if="!$mdChipsCtrl.readonly"               class="_md-chip-remove-container"               md-chip-transclude="$mdChipsCtrl.chipRemoveTemplate"></div>        </md-chip>        <div class="_md-chip-input-container">          <div ng-if="!$mdChipsCtrl.readonly && $mdChipsCtrl.ngModelCtrl"               md-chip-transclude="$mdChipsCtrl.chipInputTemplate"></div>        </div>      </md-chips-wrap>',o='        <input            class="md-input"            tabindex="0"            placeholder="{{$mdChipsCtrl.getPlaceholder()}}"            aria-label="{{$mdChipsCtrl.getPlaceholder()}}"            ng-model="$mdChipsCtrl.chipBuffer"            ng-focus="$mdChipsCtrl.onInputFocus()"            ng-blur="$mdChipsCtrl.onInputBlur()"            ng-trim="false"            ng-keydown="$mdChipsCtrl.inputKeydown($event)">',r="      <span>{{$chip}}</span>",i='      <button          class="_md-chip-remove"          ng-if="!$mdChipsCtrl.readonly"          ng-click="$mdChipsCtrl.removeChipAndFocusInput($$replacedScope.$index)"          type="button"          aria-hidden="true"          tabindex="-1">        <md-icon md-svg-icon="md-close"></md-icon>        <span class="_md-visually-hidden">          {{$mdChipsCtrl.deleteButtonLabel}}        </span>      </button>';e.$inject=["$mdTheming","$mdUtil","$compile","$log","$timeout"]}(),function(){function e(){this.selectedItem=null,this.searchText=""}t.module("material.components.chips").controller("MdContactChipsCtrl",e),e.prototype.queryContact=function(e){var n=this.contactQuery({$query:e});return this.filterSelected?n.filter(t.bind(this,this.filterSelectedContacts)):n},e.prototype.itemName=function(e){return e[this.contactName]},e.prototype.filterSelectedContacts=function(e){return-1==this.contacts.indexOf(e)}}(),function(){function e(e,t){function o(n,o){return function(n,r,i,a){t.initOptionalProperties(n,o),e(r),r.attr("tabindex","-1")}}return{template:function(e,t){return n},restrict:"E",controller:"MdContactChipsCtrl",controllerAs:"$mdContactChipsCtrl",bindToController:!0,compile:o,scope:{contactQuery:"&mdContacts",placeholder:"@",secondaryPlaceholder:"@",contactName:"@mdContactName",contactImage:"@mdContactImage",contactEmail:"@mdContactEmail",contacts:"=ngModel",requireMatch:"=?mdRequireMatch",highlightFlags:"@?mdHighlightFlags"}}}t.module("material.components.chips").directive("mdContactChips",e);var n='      <md-chips class="md-contact-chips"          ng-model="$mdContactChipsCtrl.contacts"          md-require-match="$mdContactChipsCtrl.requireMatch"          md-autocomplete-snap>          <md-autocomplete              md-menu-class="md-contact-chips-suggestions"              md-selected-item="$mdContactChipsCtrl.selectedItem"              md-search-text="$mdContactChipsCtrl.searchText"              md-items="item in $mdContactChipsCtrl.queryContact($mdContactChipsCtrl.searchText)"              md-item-text="$mdContactChipsCtrl.itemName(item)"              md-no-cache="true"              md-autoselect              placeholder="{{$mdContactChipsCtrl.contacts.length == 0 ?                  $mdContactChipsCtrl.placeholder : $mdContactChipsCtrl.secondaryPlaceholder}}">            <div class="md-contact-suggestion">              <img                   ng-src="{{item[$mdContactChipsCtrl.contactImage]}}"                  alt="{{item[$mdContactChipsCtrl.contactName]}}"                  ng-if="item[$mdContactChipsCtrl.contactImage]" />              <span class="md-contact-name" md-highlight-text="$mdContactChipsCtrl.searchText"                    md-highlight-flags="{{$mdContactChipsCtrl.highlightFlags}}">                {{item[$mdContactChipsCtrl.contactName]}}              </span>              <span class="md-contact-email" >{{item[$mdContactChipsCtrl.contactEmail]}}</span>            </div>          </md-autocomplete>          <md-chip-template>            <div class="md-contact-avatar">              <img                   ng-src="{{$chip[$mdContactChipsCtrl.contactImage]}}"                  alt="{{$chip[$mdContactChipsCtrl.contactName]}}"                  ng-if="$chip[$mdContactChipsCtrl.contactImage]" />            </div>            <div class="md-contact-name">              {{$chip[$mdContactChipsCtrl.contactName]}}            </div>          </md-chip-template>      </md-chips>';e.$inject=["$mdTheming","$mdUtil"]}(),function(){function e(e,t,n){function o(o,r,i){function a(){var e=r.parent();return e.attr("aria-label")||e.text()?!0:!(!e.parent().attr("aria-label")&&!e.parent().text())}function d(){i.mdSvgIcon||i.mdSvgSrc||(i.mdFontIcon&&r.addClass("md-font "+i.mdFontIcon),r.addClass(e.fontSet(i.mdFontSet)))}t(r),d();var c=i.alt||i.mdFontIcon||i.mdSvgIcon||r.text(),s=i.$normalize(i.$attr.mdSvgIcon||i.$attr.mdSvgSrc||"");i["aria-label"]||(""===c||a()?r.text()||n.expect(r,"aria-hidden","true"):(n.expect(r,"aria-label",c),n.expect(r,"role","img"))),s&&i.$observe(s,function(t){r.empty(),t&&e(t).then(function(e){r.empty(),r.append(e)})})}return{restrict:"E",link:o}}t.module("material.components.icon").directive("mdIcon",["$mdIcon","$mdTheming","$mdAria",e])}(),function(){function n(){}function o(e,t){this.url=e,this.viewBoxSize=t||i.defaultViewBoxSize}function r(n,o,r,i,a,d){function c(e){if(e=e||"",$[e])return r.when(l($[e]));if(M.test(e)||y.test(e))return h(e).then(m(e));-1==e.indexOf(":")&&(e="$default:"+e);var t=n[e]?u:p;return t(e).then(m(e))}function s(e){var o=t.isUndefined(e)||!(e&&e.length);if(o)return n.defaultFontSet;var r=e;return t.forEach(n.fontSets,function(t){t.alias==e&&(r=t.fontSet||r)}),r}function l(e){var n=e.clone(),o="_cache"+d.nextUid();return n.id&&(n.id+=o),t.forEach(n.querySelectorAll("[id]"),function(e){e.id+=o}),n}function m(e){return function(t){return $[e]=g(t)?t:new b(t,n[e]),$[e].clone()}}function u(e){var t=n[e];return h(t.url).then(function(e){return new b(e,t)})}function p(e){function t(t){var n=e.slice(e.lastIndexOf(":")+1),r=t.querySelector("#"+n);return r?new b(r,d):o(e)}function o(e){var t="icon "+e+" not found";return i.warn(t),r.reject(t||e)}var a=e.substring(0,e.lastIndexOf(":"))||"$default",d=n[a];return d?h(d.url).then(t):o(e)}function h(n){function i(n){var o=y.exec(n),i=/base64/i.test(n),a=i?e.atob(o[2]):o[2];return r.when(t.element(a)[0])}function d(e){return o.get(e,{cache:a}).then(function(e){return t.element("<div>").append(e.data).find("svg")[0]})["catch"](f)}return y.test(n)?i(n):d(n)}function f(e){var n=t.isString(e)?e:e.message||e.data||e.statusText;return i.warn(n),r.reject(n)}function g(e){return t.isDefined(e.element)&&t.isDefined(e.config)}function b(e,n){e&&"svg"!=e.tagName&&(e=t.element('<svg xmlns="http://www.w3.org/2000/svg">').append(e)[0]),e.getAttribute("xmlns")||e.setAttribute("xmlns","http://www.w3.org/2000/svg"),this.element=e,this.config=n,this.prepare()}function v(){var e=this.config?this.config.viewBoxSize:n.defaultViewBoxSize;t.forEach({fit:"",height:"100%",width:"100%",preserveAspectRatio:"xMidYMid meet",viewBox:this.element.getAttribute("viewBox")||"0 0 "+e+" "+e,focusable:!1},function(e,t){this.element.setAttribute(t,e)},this)}function E(){return this.element.cloneNode(!0)}var $={},M=/[-\w@:%\+.~#?&\/\/=]{2,}\.[a-z]{2,4}\b(\/[-\w@:%\+.~#?&\/\/=]*)?/i,y=/^data:image\/svg\+xml[\s*;\w\-\=]*?(base64)?,(.*)$/i;return b.prototype={clone:E,prepare:v},c.fontSet=s,c}t.module("material.components.icon").provider("$mdIcon",n);var i={defaultViewBoxSize:24,defaultFontSet:"material-icons",fontSets:[]};n.prototype={icon:function(e,t,n){return-1==e.indexOf(":")&&(e="$default:"+e),i[e]=new o(t,n),this},iconSet:function(e,t,n){return i[e]=new o(t,n),this},defaultIconSet:function(e,t){var n="$default";return i[n]||(i[n]=new o(e,t)),i[n].viewBoxSize=t||i.defaultViewBoxSize,this},defaultViewBoxSize:function(e){return i.defaultViewBoxSize=e,this},fontSet:function(e,t){return i.fontSets.push({alias:e,fontSet:t||e}),this},defaultFontSet:function(e){return i.defaultFontSet=e?e:"",this},defaultIconSize:function(e){return i.defaultIconSize=e,this},preloadIcons:function(e){var t=this,n=[{id:"md-tabs-arrow",url:"md-tabs-arrow.svg",svg:'<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><polygon points="15.4,7.4 14,6 8,12 14,18 15.4,16.6 10.8,12 "/></g></svg>'},{id:"md-close",url:"md-close.svg",svg:'<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M19 6.41l-1.41-1.41-5.59 5.59-5.59-5.59-1.41 1.41 5.59 5.59-5.59 5.59 1.41 1.41 5.59-5.59 5.59 5.59 1.41-1.41-5.59-5.59z"/></g></svg>'},{id:"md-cancel",url:"md-cancel.svg",svg:'<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><g><path d="M12 2c-5.53 0-10 4.47-10 10s4.47 10 10 10 10-4.47 10-10-4.47-10-10-10zm5 13.59l-1.41 1.41-3.59-3.59-3.59 3.59-1.41-1.41 3.59-3.59-3.59-3.59 1.41-1.41 3.59 3.59 3.59-3.59 1.41 1.41-3.59 3.59 3.59 3.59z"/></g></svg>'},{id:"md-menu",url:"md-menu.svg",svg:'<svg version="1.1" x="0px" y="0px" viewBox="0 0 24 24"><path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" /></svg>'},{id:"md-toggle-arrow",url:"md-toggle-arrow-svg",svg:'<svg version="1.1" x="0px" y="0px" viewBox="0 0 48 48"><path d="M24 16l-12 12 2.83 2.83 9.17-9.17 9.17 9.17 2.83-2.83z"/><path d="M0 0h48v48h-48z" fill="none"/></svg>'},{id:"md-calendar",url:"md-calendar.svg",svg:'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>'}];n.forEach(function(n){t.icon(n.id,n.url),e.put(n.url,n.svg)})},$get:["$http","$q","$log","$templateCache","$mdUtil",function(e,t,n,o,a){return this.preloadIcons(o),r(i,e,t,n,o,a)}]},r.$inject=["config","$http","$q","$log","$templateCache","$mdUtil"]}(),function(){function e(e,n,r,i,a,d,c,s){this.$element=r,this.$attrs=i,this.$mdConstant=a,this.$mdUtil=c,this.$document=d,this.$scope=e,this.$rootScope=n,this.$timeout=s;var l=this;t.forEach(o,function(e){l[e]=t.bind(l,l[e])})}t.module("material.components.menuBar").controller("MenuBarController",e);var o=["handleKeyDown","handleMenuHover","scheduleOpenHoveredMenu","cancelScheduledOpen"];e.$inject=["$scope","$rootScope","$element","$attrs","$mdConstant","$document","$mdUtil","$timeout"],e.prototype.init=function(){var e=this.$element,t=this.$mdUtil,o=this.$scope,r=this,i=[];e.on("keydown",this.handleKeyDown),this.parentToolbar=t.getClosest(e,"MD-TOOLBAR"),i.push(this.$rootScope.$on("$mdMenuOpen",function(t,n){-1!=r.getMenus().indexOf(n[0])&&(e[0].classList.add("_md-open"),n[0].classList.add("_md-open"),r.currentlyOpenMenu=n.controller("mdMenu"),r.currentlyOpenMenu.registerContainerProxy(r.handleKeyDown),r.enableOpenOnHover())})),i.push(this.$rootScope.$on("$mdMenuClose",function(o,i,a){var d=r.getMenus();if(-1!=d.indexOf(i[0])&&(e[0].classList.remove("_md-open"),i[0].classList.remove("_md-open")),e[0].contains(i[0])){for(var c=i[0];c&&-1==d.indexOf(c);)c=t.getClosest(c,"MD-MENU",!0);c&&(a.skipFocus||c.querySelector("button:not([disabled])").focus(),r.currentlyOpenMenu=n,r.disableOpenOnHover(),r.setKeyboardMode(!0))}})),o.$on("$destroy",function(){for(;i.length;)i.shift()()}),this.setKeyboardMode(!0)},e.prototype.setKeyboardMode=function(e){e?this.$element[0].classList.add("_md-keyboard-mode"):this.$element[0].classList.remove("_md-keyboard-mode")},e.prototype.enableOpenOnHover=function(){if(!this.openOnHoverEnabled){this.openOnHoverEnabled=!0;var e;(e=this.parentToolbar)&&(e.dataset.mdRestoreStyle=e.getAttribute("style"),e.style.position="relative",e.style.zIndex=100),t.element(this.getMenus()).on("mouseenter",this.handleMenuHover)}},e.prototype.handleMenuHover=function(e){this.setKeyboardMode(!1),this.openOnHoverEnabled&&this.scheduleOpenHoveredMenu(e)},e.prototype.disableOpenOnHover=function(){if(this.openOnHoverEnabled){this.openOnHoverEnabled=!1;var e;(e=this.parentToolbar)&&(e.style.cssText=e.dataset.mdRestoreStyle||""),t.element(this.getMenus()).off("mouseenter",this.handleMenuHover)}},e.prototype.scheduleOpenHoveredMenu=function(e){var n=t.element(e.currentTarget),o=n.controller("mdMenu");this.setKeyboardMode(!1),this.scheduleOpenMenu(o)},e.prototype.scheduleOpenMenu=function(e){var t=this,o=this.$timeout;e!=t.currentlyOpenMenu&&(o.cancel(t.pendingMenuOpen),t.pendingMenuOpen=o(function(){t.pendingMenuOpen=n,t.currentlyOpenMenu&&t.currentlyOpenMenu.close(!0,{closeAll:!0}),e.open()},200,!1))},e.prototype.handleKeyDown=function(e){var n=this.$mdConstant.KEY_CODE,o=this.currentlyOpenMenu,r=o&&o.isOpen;this.setKeyboardMode(!0);var i,a,d;switch(e.keyCode){case n.DOWN_ARROW:o?o.focusMenuContainer():this.openFocusedMenu(),i=!0;break;case n.UP_ARROW:o&&o.close(),i=!0;break;case n.LEFT_ARROW:a=this.focusMenu(-1),r&&(d=t.element(a).controller("mdMenu"),this.scheduleOpenMenu(d)),i=!0;break;case n.RIGHT_ARROW:a=this.focusMenu(1),r&&(d=t.element(a).controller("mdMenu"),this.scheduleOpenMenu(d)),i=!0}i&&(e&&e.preventDefault&&e.preventDefault(),e&&e.stopImmediatePropagation&&e.stopImmediatePropagation())},e.prototype.focusMenu=function(e){var t=this.getMenus(),n=this.getFocusedMenuIndex();-1==n&&(n=this.getOpenMenuIndex());var o=!1;return-1==n?(n=0,o=!0):(0>e&&n>0||e>0&&n<t.length-e)&&(n+=e,o=!0),o?(t[n].querySelector("button").focus(),t[n]):void 0},e.prototype.openFocusedMenu=function(){var e=this.getFocusedMenu();e&&t.element(e).controller("mdMenu").open()},e.prototype.getMenus=function(){var e=this.$element;return this.$mdUtil.nodesToArray(e[0].children).filter(function(e){return"MD-MENU"==e.nodeName})},e.prototype.getFocusedMenu=function(){return this.getMenus()[this.getFocusedMenuIndex()]},e.prototype.getFocusedMenuIndex=function(){var e=this.$mdUtil,t=e.getClosest(this.$document[0].activeElement,"MD-MENU");if(!t)return-1;var n=this.getMenus().indexOf(t);return n},e.prototype.getOpenMenuIndex=function(){for(var e=this.getMenus(),t=0;t<e.length;++t)if(e[t].classList.contains("_md-open"))return t;return-1}}(),function(){function e(e,n){return{restrict:"E",require:"mdMenuBar",controller:"MenuBarController",compile:function(o,r){return r.ariaRole||o[0].setAttribute("role","menubar"),t.forEach(o[0].children,function(n){if("MD-MENU"==n.nodeName){n.hasAttribute("md-position-mode")||(n.setAttribute("md-position-mode","left bottom"),n.querySelector("button,a").setAttribute("role","menuitem"));var o=e.nodesToArray(n.querySelectorAll("md-menu-content"));t.forEach(o,function(e){e.classList.add("_md-menu-bar-menu"),e.classList.add("md-dense"),e.hasAttribute("width")||e.setAttribute("width",5)})}}),function(e,t,o,r){n(e,t),r.init()}}}}t.module("material.components.menuBar").directive("mdMenuBar",e),e.$inject=["$mdUtil","$mdTheming"]}(),function(){function e(){return{restrict:"E",compile:function(e,t){t.role||e[0].setAttribute("role","separator")}}}t.module("material.components.menuBar").directive("mdMenuDivider",e)}(),function(){function e(e,t,n){this.$element=t,this.$attrs=n,this.$scope=e}t.module("material.components.menuBar").controller("MenuItemController",e),e.$inject=["$scope","$element","$attrs"],e.prototype.init=function(e){var t=this.$element,n=this.$attrs;this.ngModel=e,"checkbox"!=n.type&&"radio"!=n.type||(this.mode=n.type,this.iconEl=t[0].children[0],this.buttonEl=t[0].children[1],e&&this.initClickListeners())},e.prototype.clearNgAria=function(){var e=this.$element[0],n=["role","tabindex","aria-invalid","aria-checked"];t.forEach(n,function(t){e.removeAttribute(t)})},e.prototype.initClickListeners=function(){function e(){if("radio"==d){var e=a.ngValue?i.$eval(a.ngValue):a.value;return r.$modelValue==e}return r.$modelValue}function n(e){e?s.off("click",l):s.on("click",l)}var o=this,r=this.ngModel,i=this.$scope,a=this.$attrs,d=(this.$element,this.mode);this.handleClick=t.bind(this,this.handleClick);var c=this.iconEl,s=t.element(this.buttonEl),l=this.handleClick;a.$observe("disabled",n),n(a.disabled),r.$render=function(){o.clearNgAria(),e()?(c.style.display="",s.attr("aria-checked","true")):(c.style.display="none",s.attr("aria-checked","false"))},i.$$postDigest(r.$render)},e.prototype.handleClick=function(e){var t,n=this.mode,o=this.ngModel,r=this.$attrs;"checkbox"==n?t=!o.$modelValue:"radio"==n&&(t=r.ngValue?this.$scope.$eval(r.ngValue):r.value),o.$setViewValue(t),o.$render()}}(),function(){function e(){return{require:["mdMenuItem","?ngModel"],priority:210,compile:function(e,n){function o(n,o,r){r=r||e,r instanceof t.element&&(r=r[0]),r.hasAttribute(n)||r.setAttribute(n,o)}function r(t){if(e[0].hasAttribute(t)){var n=e[0].getAttribute(t);a[0].setAttribute(t,n),e[0].removeAttribute(t)}}if("checkbox"==n.type||"radio"==n.type){var i=e[0].textContent,a=t.element('<md-button type="button"></md-button>');a.html(i),a.attr("tabindex","0"),e.html(""),e.append(t.element('<md-icon md-svg-icon="check"></md-icon>')),e.append(a),e[0].classList.add("md-indent"),o("role","checkbox"==n.type?"menuitemcheckbox":"menuitemradio",a),t.forEach(["ng-disabled"],r)}else o("role","menuitem",e[0].querySelector("md-button,button,a"));return function(e,t,n,o){var r=o[0],i=o[1];r.init(i)}},controller:"MenuItemController"}}t.module("material.components.menuBar").directive("mdMenuItem",e);
}(),function(){function e(e,o,r,i,a,d,c,s){var l,m,u=this;this.nestLevel=parseInt(o.mdNestLevel,10)||0,this.init=function(n,o){o=o||{},l=n,m=r[0].querySelector("[ng-click],[ng-mouseenter]"),m.setAttribute("aria-expanded","false"),this.isInMenuBar=o.isInMenuBar,this.nestedMenus=a.nodesToArray(l[0].querySelectorAll(".md-nested-menu")),l.on("$mdInterimElementRemove",function(){u.isOpen=!1});var d="menu_container_"+a.nextUid();l.attr("id",d),t.element(m).attr({"aria-owns":d,"aria-haspopup":"true"}),i.$on("$destroy",this.disableHoverListener),l.on("$destroy",function(){e.destroy()})};var p,h,f=[];this.enableHoverListener=function(){f.push(c.$on("$mdMenuOpen",function(e,t){l[0].contains(t[0])&&(u.currentlyOpenMenu=t.controller("mdMenu"),u.isAlreadyOpening=!1,u.currentlyOpenMenu.registerContainerProxy(u.triggerContainerProxy.bind(u)))})),f.push(c.$on("$mdMenuClose",function(e,t){l[0].contains(t[0])&&(u.currentlyOpenMenu=n)})),h=t.element(a.nodesToArray(l[0].children[0].children)),h.on("mouseenter",u.handleMenuItemHover),h.on("mouseleave",u.handleMenuItemMouseLeave)},this.disableHoverListener=function(){for(;f.length;)f.shift()();h&&h.off("mouseenter",u.handleMenuItemHover),h&&h.off("mouseleave",u.handleMenuMouseLeave)},this.handleMenuItemHover=function(e){if(!u.isAlreadyOpening){var n=e.target.querySelector("md-menu")||a.getClosest(e.target,"MD-MENU");p=d(function(){if(n&&(n=t.element(n).controller("mdMenu")),u.currentlyOpenMenu&&u.currentlyOpenMenu!=n){var e=u.nestLevel+1;u.currentlyOpenMenu.close(!0,{closeTo:e}),u.isAlreadyOpening=!0,n.open()}else n&&!n.isOpen&&n.open&&(u.isAlreadyOpening=!0,n.open())},n?100:250);var o=e.currentTarget.querySelector(".md-button:not([disabled])");o&&o.focus()}},this.handleMenuItemMouseLeave=function(){p&&(d.cancel(p),p=n)},this.open=function(t){t&&t.stopPropagation(),t&&t.preventDefault(),u.isOpen||(u.enableHoverListener(),u.isOpen=!0,m=m||(t?t.target:r[0]),m.setAttribute("aria-expanded","true"),i.$emit("$mdMenuOpen",r),e.show({scope:i,mdMenuCtrl:u,nestLevel:u.nestLevel,element:l,target:m,preserveElement:!0,parent:"body"})["finally"](function(){m.setAttribute("aria-expanded","false"),u.disableHoverListener()}))},i.$mdOpenMenu=this.open,i.$watch(function(){return u.isOpen},function(e){e?(l.attr("aria-hidden","false"),r[0].classList.add("_md-open"),t.forEach(u.nestedMenus,function(e){e.classList.remove("_md-open")})):(l.attr("aria-hidden","true"),r[0].classList.remove("_md-open")),i.$mdMenuIsOpen=u.isOpen}),this.focusMenuContainer=function(){var e=l[0].querySelector("[md-menu-focus-target]");e||(e=l[0].querySelector(".md-button")),e.focus()},this.registerContainerProxy=function(e){this.containerProxy=e},this.triggerContainerProxy=function(e){this.containerProxy&&this.containerProxy(e)},this.destroy=function(){return u.isOpen?e.destroy():s.when(!1)},this.close=function(n,o){if(u.isOpen){u.isOpen=!1;var a=t.extend({},o,{skipFocus:n});if(i.$emit("$mdMenuClose",r,a),e.hide(null,o),!n){var d=u.restoreFocusTo||r.find("button")[0];d instanceof t.element&&(d=d[0]),d&&d.focus()}}},this.positionMode=function(){var e=(o.mdPositionMode||"target").split(" ");return 1==e.length&&e.push(e[0]),{left:e[0],top:e[1]}},this.offsets=function(){var e=(o.mdOffset||"0 0").split(" ").map(parseFloat);if(2==e.length)return{left:e[0],top:e[1]};if(1==e.length)return{top:e[0],left:e[0]};throw Error("Invalid offsets specified. Please follow format <x, y> or <n>")}}t.module("material.components.menu").controller("mdMenuCtrl",e),e.$inject=["$mdMenu","$attrs","$element","$scope","$mdUtil","$timeout","$rootScope","$q"]}(),function(){function e(e){function o(n){n.addClass("md-menu");var o=n.children()[0];if(o.hasAttribute("ng-click")||(o=o.querySelector("[ng-click],[ng-mouseenter]")||o),!o||"MD-BUTTON"!=o.nodeName&&"BUTTON"!=o.nodeName||o.hasAttribute("type")||o.setAttribute("type","button"),2!=n.children().length)throw Error(i+"Expected two children elements.");o&&o.setAttribute("aria-haspopup","true");var a=n[0].querySelectorAll("md-menu"),d=parseInt(n[0].getAttribute("md-nest-level"),10)||0;return a&&t.forEach(e.nodesToArray(a),function(e){e.hasAttribute("md-position-mode")||e.setAttribute("md-position-mode","cascade"),e.classList.add("_md-nested-menu"),e.setAttribute("md-nest-level",d+1)}),r}function r(e,o,r,i){var a=i[0],d=i[1]!=n,c=t.element('<div class="_md-open-menu-container md-whiteframe-z2"></div>'),s=o.children()[1];s.hasAttribute("role")||s.setAttribute("role","menu"),c.append(s),o.on("$destroy",function(){c.remove()}),o.append(c),c[0].style.display="none",a.init(c,{isInMenuBar:d})}var i="Invalid HTML for md-menu: ";return{restrict:"E",require:["mdMenu","?^mdMenuBar"],controller:"mdMenuCtrl",scope:!0,compile:o}}t.module("material.components.menu").directive("mdMenu",e),e.$inject=["$mdUtil"]}(),function(){function e(e){function o(e,o,a,d,c,s,l,m,u){function p(n,o,r){return r.nestLevel?t.noop:(r.disableParentScroll&&!e.getClosest(r.target,"MD-DIALOG")?r.restoreScroll=e.disableScrollAround(r.element,r.parent):r.disableParentScroll=!1,r.hasBackdrop&&(r.backdrop=e.createBackdrop(n,"_md-menu-backdrop _md-click-catcher"),u.enter(r.backdrop,d[0].body)),function(){r.backdrop&&r.backdrop.remove(),r.disableParentScroll&&r.restoreScroll()})}function h(e,t,n){function o(){return m(t,{addClass:"_md-leave"}).start()}function r(){t.removeClass("_md-active"),v(t,n),n.alreadyOpen=!1}return n.cleanupInteraction(),n.cleanupResizing(),n.hideBackdrop(),n.$destroy===!0?r():o().then(r)}function f(n,r,i){function d(){return i.parent.append(r),r[0].style.display="",s(function(e){var t=E(r,i);r.removeClass("_md-leave"),m(r,{addClass:"_md-active",from:$.toCss(t),to:$.toCss({transform:""})}).start().then(e)})}function u(){if(!i.target)throw Error("$mdMenu.show() expected a target to animate from in options.target");t.extend(i,{alreadyOpen:!1,isRemoved:!1,target:t.element(i.target),parent:t.element(i.parent),menuContentEl:t.element(r[0].querySelector("md-menu-content"))})}function h(){var e=function(e,t){return l.throttle(function(){if(!i.isRemoved){var n=E(e,t);e.css($.toCss(n))}})}(r,i);return c.addEventListener("resize",e),c.addEventListener("orientationchange",e),function(){c.removeEventListener("resize",e),c.removeEventListener("orientationchange",e)}}function f(){function t(t){var n;switch(t.keyCode){case a.KEY_CODE.ESCAPE:i.mdMenuCtrl.close(!1,{closeAll:!0}),n=!0;break;case a.KEY_CODE.UP_ARROW:g(t,i.menuContentEl,i,-1)||i.nestLevel||i.mdMenuCtrl.triggerContainerProxy(t),n=!0;break;case a.KEY_CODE.DOWN_ARROW:g(t,i.menuContentEl,i,1)||i.nestLevel||i.mdMenuCtrl.triggerContainerProxy(t),n=!0;break;case a.KEY_CODE.LEFT_ARROW:i.nestLevel?i.mdMenuCtrl.close():i.mdMenuCtrl.triggerContainerProxy(t),n=!0;break;case a.KEY_CODE.RIGHT_ARROW:var o=e.getClosest(t.target,"MD-MENU");o&&o!=i.parent[0]?t.target.click():i.mdMenuCtrl.triggerContainerProxy(t),n=!0}n&&(t.preventDefault(),t.stopImmediatePropagation())}function o(e){e.preventDefault(),e.stopPropagation(),n.$apply(function(){i.mdMenuCtrl.close(!0,{closeAll:!0})})}function d(t){function o(){n.$apply(function(){i.mdMenuCtrl.close(!0,{closeAll:!0})})}function r(e,t){if(!e)return!1;for(var n,o=0;n=t[o];++o)for(var r,i=[n,"data-"+n,"x-"+n],a=0;r=i[a];++a)if(e.hasAttribute(r))return!0;return!1}var a=t.target;do{if(a==i.menuContentEl[0])return;if((r(a,["ng-click","ng-href","ui-sref"])||"BUTTON"==a.nodeName||"MD-BUTTON"==a.nodeName)&&!r(a,["md-prevent-menu-close"])){var d=e.getClosest(a,"MD-MENU");a.hasAttribute("disabled")||d&&d!=i.parent[0]||o();break}}while(a=a.parentNode)}r.addClass("_md-clickable"),i.backdrop&&i.backdrop.on("click",o),i.menuContentEl.on("keydown",t),i.menuContentEl[0].addEventListener("click",d,!0);var c=i.menuContentEl[0].querySelector("[md-menu-focus-target]");if(!c){var s=i.menuContentEl[0].firstElementChild;c=s&&(s.querySelector(".md-button:not([disabled])")||s.firstElementChild)}return c&&c.focus(),function(){r.removeClass("_md-clickable"),i.backdrop&&i.backdrop.off("click",o),i.menuContentEl.off("keydown",t),i.menuContentEl[0].removeEventListener("click",d,!0)}}return u(i),o.inherit(i.menuContentEl,i.target),i.cleanupResizing=h(),i.hideBackdrop=p(n,r,i),d().then(function(e){return i.alreadyOpen=!0,i.cleanupInteraction=f(),e})}function g(t,n,o,r){for(var i,a=e.getClosest(t.target,"MD-MENU-ITEM"),d=e.nodesToArray(n[0].children),c=d.indexOf(a),s=c+r;s>=0&&s<d.length;s+=r){var l=d[s].querySelector(".md-button");if(i=b(l))break}return i}function b(e){return e&&-1!=e.getAttribute("tabindex")?(e.focus(),d[0].activeElement==e):void 0}function v(e,t){t.preserveElement?r(e).style.display="none":r(e).parentNode===r(t.parent)&&r(t.parent).removeChild(r(e))}function E(t,o){function r(e){e.top=Math.max(Math.min(e.top,v.bottom-l.offsetHeight),v.top),e.left=Math.max(Math.min(e.left,v.right-l.offsetWidth),v.left)}function a(){for(var e=0;e<m.children.length;++e)if("none"!=c.getComputedStyle(m.children[e]).display)return m.children[e]}var s,l=t[0],m=t[0].firstElementChild,u=m.getBoundingClientRect(),p=d[0].body,h=p.getBoundingClientRect(),f=c.getComputedStyle(m),g=o.target[0].querySelector("[md-menu-origin]")||o.target[0],b=g.getBoundingClientRect(),v={left:h.left+i,top:Math.max(h.top,0)+i,bottom:Math.max(h.bottom,Math.max(h.top,0)+h.height)-i,right:h.right-i},E={top:0,left:0,right:0,bottom:0},$={top:0,left:0,right:0,bottom:0},M=o.mdMenuCtrl.positionMode();"target"!=M.top&&"target"!=M.left&&"target-right"!=M.left||(s=a(),s&&(s=s.firstElementChild||s,s=s.querySelector("[md-menu-align-target]")||s,E=s.getBoundingClientRect(),$={top:parseFloat(l.style.top||0),left:parseFloat(l.style.left||0)}));var y={},C="top ";switch(M.top){case"target":y.top=$.top+b.top-E.top;break;case"cascade":y.top=b.top-parseFloat(f.paddingTop)-g.style.top;break;case"bottom":y.top=b.top+b.height;break;default:throw new Error('Invalid target mode "'+M.top+'" specified for md-menu on Y axis.')}var A="rtl"==e.bidi();switch(M.left){case"target":y.left=$.left+b.left-E.left,C+=A?"right":"left";break;case"target-left":y.left=b.left,C+="left";break;case"target-right":y.left=b.right-u.width+(u.right-E.right),C+="right";break;case"cascade":var k=A?b.left-u.width<v.left:b.right+u.width<v.right;y.left=k?b.right-g.style.left:b.left-g.style.left-u.width,C+=k?"left":"right";break;case"left":A?(y.left=b.right-u.width,C+="right"):(y.left=b.left,C+="left");break;default:throw new Error('Invalid target mode "'+M.left+'" specified for md-menu on X axis.')}var T=o.mdMenuCtrl.offsets();y.top+=T.top,y.left+=T.left,r(y);var w=Math.round(100*Math.min(b.width/l.offsetWidth,1))/100,_=Math.round(100*Math.min(b.height/l.offsetHeight,1))/100;return{top:Math.round(y.top),left:Math.round(y.left),transform:o.alreadyOpen?n:e.supplant("scale({0},{1})",[w,_]),transformOrigin:C}}var $=e.dom.animator;return{parent:"body",onShow:f,onRemove:h,hasBackdrop:!0,disableParentScroll:!0,skipCompile:!0,preserveScope:!0,skipHide:!0,themable:!0}}function r(e){return e instanceof t.element&&(e=e[0]),e}var i=8;return o.$inject=["$mdUtil","$mdTheming","$mdConstant","$document","$window","$q","$$rAF","$animateCss","$animate"],e("$mdMenu").setDefaults({methods:["target"],options:o})}t.module("material.components.menu").provider("$mdMenu",e),e.$inject=["$$interimElementProvider"]}(),function(){function e(e,n,o,r,i,a,d){function c(d,c,l){function h(t,r,a,c,l){var m=++T,h=i.now(),f=r-t,g=u(d.mdDiameter),b=g-p(g),v=a||o.easeFn,E=c||o.duration;r===t?y.attr("d",s(r,g,b,l)):e(function $(o){var r=n.Math.min((o||i.now())-h,E);y.attr("d",s(v(r,t,f,E),g,b,l)),m===T&&E>r&&e($)})}function b(){h(C,A,o.easeFnIndeterminate,o.durationIndeterminate,k),k=(k+A)%100;var e=C;C=-A,A=-e}function v(){if(!$){var t=i.now(),n=o.rotationDurationIndeterminate,r=u(d.mdDiameter)/2;r=" "+r+", "+r,e(function s(a){var d=a||i.now(),c=d-t,l=o.easingPresets.linearEase(c,0,360,n);y.attr("transform","rotate("+l+r+")"),$?e(s):y.removeAttr("transform"),c>=n&&(t=d)}),$=a(b,o.durationIndeterminate+50,0,!1),b(),c.removeAttr("aria-valuenow")}}function E(){$&&(a.cancel($),$=null)}var $,M=t.element(c[0].querySelector("svg")),y=t.element(c[0].querySelector("path")),C=o.startIndeterminate,A=o.endIndeterminate,k=0,T=0;r(c),d.mdMode===g&&v(),d.$watchGroup(["value","mdMode"],function(e,t){var n=e[1];if(n!==f&&n!==g&&(n=g,l.$set("mdMode",n)),n===g)v();else{var o=m(e[0]);E(),c.attr("aria-valuenow",o),h(m(t[0]),o)}}),d.$watch("mdDiameter",function(e){var t=u(e),n=p(t),o={width:t+"px",height:t+"px"};M[0].setAttribute("viewBox","0 0 "+t+" "+t),M.css(o),c.css(o),y.css("stroke-width",n+"px")})}function s(e,t,n,o){var r,i=3.5999,a=o||0,d=t/2,c=n/2,s=a*i,m=e*i,u=l(d,c,s),p=l(d,c,m+s),h=0>m?0:1;return r=0>m?m>=-180?0:1:180>=m?0:1,"M"+u+"A"+c+","+c+" 0 "+r+","+h+" "+p}function l(e,t,o){var r=(o-90)*h;return e+t*n.Math.cos(r)+","+(e+t*n.Math.sin(r))}function m(e){return n.Math.max(0,n.Math.min(e||0,100))}function u(e){var t=o.progressSize;if(e){var n=parseFloat(e);return e.lastIndexOf("%")===e.length-1&&(n=n/100*t),n}return t}function p(e){return o.strokeWidth/100*e}var h=n.Math.PI/180,f="determinate",g="indeterminate";return{restrict:"E",scope:{value:"@",mdDiameter:"@",mdMode:"@"},template:'<svg xmlns="http://www.w3.org/2000/svg"><path fill="none"/></svg>',compile:function(e,n){if(e.attr({"aria-valuemin":0,"aria-valuemax":100,role:"progressbar"}),t.isUndefined(n.mdMode)){var o=t.isDefined(n.value),r=o?f:g,a="Auto-adding the missing md-mode='{0}' to the ProgressCircular element";d.debug(i.supplant(a,[r])),n.$set("mdMode",r)}else n.$set("mdMode",n.mdMode.trim());return c}}}t.module("material.components.progressCircular").directive("mdProgressCircular",e),e.$inject=["$$rAF","$window","$mdProgressCircular","$mdTheming","$mdUtil","$interval","$log"]}(),function(){function e(){function e(e,t,n,o){return n*e/o+t}function n(e,t,n,o){var r=(e/=o)*e,i=r*e;return t+n*(6*i*r+-15*r*r+10*i)}var o={progressSize:50,strokeWidth:10,duration:100,easeFn:e,durationIndeterminate:500,startIndeterminate:3,endIndeterminate:80,rotationDurationIndeterminate:2900,easeFnIndeterminate:n,easingPresets:{linearEase:e,materialEase:n}};return{configure:function(e){return o=t.extend(o,e||{})},$get:function(){return o}}}t.module("material.components.progressCircular").provider("$mdProgressCircular",e)}(),function(){function e(){function e(e,o,r,i){if(i){var a=i.getTabElementIndex(o),d=n(o,"md-tab-body").remove(),c=n(o,"md-tab-label").remove(),s=i.insertTab({scope:e,parent:e.$parent,index:a,element:o,template:d.html(),label:c.html()},a);e.select=e.select||t.noop,e.deselect=e.deselect||t.noop,e.$watch("active",function(e){e&&i.select(s.getIndex(),!0)}),e.$watch("disabled",function(){i.refreshIndex()}),e.$watch(function(){return i.getTabElementIndex(o)},function(e){s.index=e,i.updateTabOrder()}),e.$on("$destroy",function(){i.removeTab(s)})}}function n(e,n){for(var o=e[0].children,r=0,i=o.length;i>r;r++){var a=o[r];if(a.tagName===n.toUpperCase())return t.element(a)}return t.element()}return{require:"^?mdTabs",terminal:!0,compile:function(o,r){var i=n(o,"md-tab-label"),a=n(o,"md-tab-body");if(0==i.length&&(i=t.element("<md-tab-label></md-tab-label>"),r.label?i.text(r.label):i.append(o.contents()),0==a.length)){var d=o.contents().detach();a=t.element("<md-tab-body></md-tab-body>"),a.append(d)}return o.append(i),a.html()&&o.append(a),e},scope:{active:"=?mdActive",disabled:"=?ngDisabled",select:"&?mdOnSelect",deselect:"&?mdOnDeselect"}}}t.module("material.components.tabs").directive("mdTab",e)}(),function(){function e(){return{require:"^?mdTabs",link:function(e,t,n,o){o&&o.attachRipple(e,t)}}}t.module("material.components.tabs").directive("mdTabItem",e)}(),function(){function e(){return{terminal:!0}}t.module("material.components.tabs").directive("mdTabLabel",e)}(),function(){function e(e){return{restrict:"A",compile:function(t,n){var o=e(n.mdTabScroll,null,!0);return function(e,t){t.on("mousewheel",function(t){e.$apply(function(){o(e,{$event:t})})})}}}}t.module("material.components.tabs").directive("mdTabScroll",e),e.$inject=["$parse"]}(),function(){function e(e,o,r,i,a,d,c,s,l,m){function u(){se.selectedIndex=se.selectedIndex||0,p(),f(),h(),m(o),d.nextTick(function(){re(),ee(),ie(),se.tabs[se.selectedIndex]&&se.tabs[se.selectedIndex].scope.select(),he=!0,Y()})}function p(){var e=s.$mdTabsTemplate,n=t.element(me.data);n.html(e),l(n.contents())(se.parent),delete s.$mdTabsTemplate}function h(){t.element(r).on("resize",I),e.$on("$destroy",v)}function f(){e.$watch("$mdTabsCtrl.selectedIndex",T)}function g(e,t){var n=s.$normalize("md-"+e);t&&W(e,t),s.$observe(n,function(t){se[e]=t})}function b(e,t){function n(t){se[e]="false"!==t}var o=s.$normalize("md-"+e);t&&W(e,t),s.hasOwnProperty(o)&&n(s[o]),s.$observe(o,n)}function v(){pe=!0,t.element(r).off("resize",I)}function E(e){t.element(me.wrapper).toggleClass("md-stretch-tabs",z()),ie()}function $(e){se.shouldCenterTabs=q()}function M(e,n){e!==n&&(t.forEach(me.tabs,function(t){t.style.maxWidth=e+"px"}),d.nextTick(se.updateInkBarStyles))}function y(e,t){e!==t&&(se.maxTabWidth=X(),se.shouldCenterTabs=q(),d.nextTick(function(){se.maxTabWidth=X(),ee(se.selectedIndex)}))}function C(e){o[e?"removeClass":"addClass"]("md-no-tab-content")}function A(n){var o=se.shouldCenterTabs?"":"-"+n+"px";t.element(me.paging).css(i.CSS.TRANSFORM,"translate3d("+o+", 0, 0)"),e.$broadcast("$mdTabsPaginationChanged")}function k(e,t){e!==t&&me.tabs[e]&&(ee(),J())}function T(t,n){t!==n&&(se.selectedIndex=V(t),se.lastSelectedIndex=n,se.updateInkBarStyles(),re(),ee(t),e.$broadcast("$mdTabsChanged"),se.tabs[n]&&se.tabs[n].scope.deselect(),se.tabs[t]&&se.tabs[t].scope.select())}function w(e){var t=o[0].getElementsByTagName("md-tab");return Array.prototype.indexOf.call(t,e[0])}function _(){_.watcher||(_.watcher=e.$watch(function(){d.nextTick(function(){_.watcher&&o.prop("offsetParent")&&(_.watcher(),_.watcher=null,I())},!1)}))}function x(e){switch(e.keyCode){case i.KEY_CODE.LEFT_ARROW:e.preventDefault(),Z(-1,!0);break;case i.KEY_CODE.RIGHT_ARROW:e.preventDefault(),Z(1,!0);break;case i.KEY_CODE.SPACE:case i.KEY_CODE.ENTER:e.preventDefault(),le||(se.selectedIndex=se.focusIndex)}se.lastClick=!1}function N(e,t){le||(se.focusIndex=se.selectedIndex=e),se.lastClick=!0,t&&se.noSelectClick||d.nextTick(function(){se.tabs[e].element.triggerHandler("click")},!1)}function S(e){se.shouldPaginate&&(e.preventDefault(),se.offsetLeft=de(se.offsetLeft-e.wheelDelta))}function H(){var e,t,n=me.canvas.clientWidth,o=n+se.offsetLeft;for(e=0;e<me.tabs.length&&(t=me.tabs[e],!(t.offsetLeft+t.offsetWidth>o));e++);se.offsetLeft=de(t.offsetLeft)}function D(){var e,t;for(e=0;e<me.tabs.length&&(t=me.tabs[e],!(t.offsetLeft+t.offsetWidth>=se.offsetLeft));e++);se.offsetLeft=de(t.offsetLeft+t.offsetWidth-me.canvas.clientWidth)}function I(){se.lastSelectedIndex=se.selectedIndex,se.offsetLeft=de(se.offsetLeft),d.nextTick(function(){se.updateInkBarStyles(),Y()})}function O(e){t.element(me.inkBar).toggleClass("ng-hide",e)}function R(e){o.toggleClass("md-dynamic-height",e)}function L(e){if(!pe){var t=se.selectedIndex,n=se.tabs.splice(e.getIndex(),1)[0];oe(),se.selectedIndex===t&&(n.scope.deselect(),se.tabs[se.selectedIndex]&&se.tabs[se.selectedIndex].scope.select()),d.nextTick(function(){Y(),se.offsetLeft=de(se.offsetLeft)})}}function P(e,n){var o=he,r={getIndex:function(){return se.tabs.indexOf(i)},isActive:function(){return this.getIndex()===se.selectedIndex},isLeft:function(){return this.getIndex()<se.selectedIndex},isRight:function(){return this.getIndex()>se.selectedIndex},shouldRender:function(){return!se.noDisconnect||this.isActive()},hasFocus:function(){return!se.lastClick&&se.hasFocus&&this.getIndex()===se.focusIndex},id:d.nextUid()},i=t.extend(r,e);return t.isDefined(n)?se.tabs.splice(n,0,i):se.tabs.push(i),te(),ne(),d.nextTick(function(){Y(),o&&se.autoselect&&d.nextTick(function(){d.nextTick(function(){N(se.tabs.indexOf(i))})})}),i}function F(){var e={};return e.wrapper=o[0].getElementsByTagName("md-tabs-wrapper")[0],e.data=o[0].getElementsByTagName("md-tab-data")[0],e.canvas=e.wrapper.getElementsByTagName("md-tabs-canvas")[0],e.paging=e.canvas.getElementsByTagName("md-pagination-wrapper")[0],e.tabs=e.paging.getElementsByTagName("md-tab-item"),e.dummies=e.canvas.getElementsByTagName("md-dummy-tab"),e.inkBar=e.paging.getElementsByTagName("md-ink-bar")[0],e.contentsWrapper=o[0].getElementsByTagName("md-tabs-content-wrapper")[0],e.contents=e.contentsWrapper.getElementsByTagName("md-tab-content"),e}function B(){return se.offsetLeft>0}function U(){var e=me.tabs[me.tabs.length-1];return e&&e.offsetLeft+e.offsetWidth>me.canvas.clientWidth+se.offsetLeft}function z(){switch(se.stretchTabs){case"always":return!0;case"never":return!1;default:return!se.shouldPaginate&&r.matchMedia("(max-width: 600px)").matches}}function q(){return se.centerTabs&&!se.shouldPaginate}function j(){if(se.noPagination||!he)return!1;var e=o.prop("clientWidth");return t.forEach(F().dummies,function(t){e-=t.offsetWidth}),0>e}function V(e){if(-1===e)return-1;var t,n,o=Math.max(se.tabs.length-e,e);for(t=0;o>=t;t++){if(n=se.tabs[e+t],n&&n.scope.disabled!==!0)return n.getIndex();if(n=se.tabs[e-t],n&&n.scope.disabled!==!0)return n.getIndex()}return e}function W(e,t,n){Object.defineProperty(se,e,{get:function(){return n},set:function(e){var o=n;n=e,t&&t(e,o)}})}function Y(){K(),se.maxTabWidth=X(),se.shouldPaginate=j()}function K(){z()?t.element(me.paging).css("width",""):t.element(me.paging).css("width",G()+"px")}function G(){var e=1;return t.forEach(F().dummies,function(t){e+=Math.max(t.offsetWidth,t.getBoundingClientRect().width)}),Math.ceil(e)}function X(){return o.prop("clientWidth")}function Q(){var e=se.tabs[se.selectedIndex],t=se.tabs[se.focusIndex];se.tabs=se.tabs.sort(function(e,t){return e.index-t.index}),se.selectedIndex=se.tabs.indexOf(e),se.focusIndex=se.tabs.indexOf(t)}function Z(e,t){var n,o=t?"focusIndex":"selectedIndex",r=se[o];for(n=r+e;se.tabs[n]&&se.tabs[n].scope.disabled;n+=e);se.tabs[n]&&(se[o]=n)}function J(){F().dummies[se.focusIndex].focus()}function ee(e){if(null==e&&(e=se.focusIndex),me.tabs[e]&&!se.shouldCenterTabs){var t=me.tabs[e],n=t.offsetLeft,o=t.offsetWidth+n;se.offsetLeft=Math.max(se.offsetLeft,de(o-me.canvas.clientWidth+64)),se.offsetLeft=Math.min(se.offsetLeft,de(n))}}function te(){ue.forEach(function(e){d.nextTick(e)}),ue=[]}function ne(){var e=!1;t.forEach(se.tabs,function(t){t.template&&(e=!0)}),se.hasContent=e}function oe(){se.selectedIndex=V(se.selectedIndex),se.focusIndex=V(se.focusIndex)}function re(){if(!se.dynamicHeight)return o.css("height","");if(!se.tabs.length)return ue.push(re);var e=me.contents[se.selectedIndex],t=e?e.offsetHeight:0,r=me.wrapper.offsetHeight,i=t+r,a=o.prop("clientHeight");if(a!==i){"bottom"===o.attr("md-align-tabs")&&(a-=r,i-=r,o.attr("md-border-bottom")!==n&&++a),le=!0;var s={height:a+"px"},l={height:i+"px"};o.css(s),c(o,{from:s,to:l,easing:"cubic-bezier(0.35, 0, 0.25, 1)",duration:.5}).start().done(function(){o.css({transition:"none",height:""}),d.nextTick(function(){o.css("transition","")}),le=!1})}}function ie(){if(!me.tabs[se.selectedIndex])return void t.element(me.inkBar).css({left:"auto",right:"auto"});if(!se.tabs.length)return ue.push(se.updateInkBarStyles);if(!o.prop("offsetParent"))return _();var e,n=se.selectedIndex,r=me.paging.offsetWidth,i=me.tabs[n],a=i.offsetLeft,c=r-a-i.offsetWidth;se.shouldCenterTabs&&(e=Array.prototype.slice.call(me.tabs).reduce(function(e,t){return e+t.offsetWidth},0),r>e&&d.nextTick(ie,!1)),ae(),t.element(me.inkBar).css({left:a+"px",right:c+"px"})}function ae(){var e=se.selectedIndex,n=se.lastSelectedIndex,o=t.element(me.inkBar);t.isNumber(n)&&o.toggleClass("md-left",n>e).toggleClass("md-right",e>n)}function de(e){if(!me.tabs.length||!se.shouldPaginate)return 0;var t=me.tabs[me.tabs.length-1],n=t.offsetLeft+t.offsetWidth;return e=Math.max(0,e),e=Math.min(n-me.canvas.clientWidth,e)}function ce(e,n){var o={colorElement:t.element(me.inkBar)};a.attach(e,n,o)}var se=this,le=!1,me=F(),ue=[],pe=!1,he=!1;g("stretchTabs",E),W("focusIndex",k,se.selectedIndex||0),W("offsetLeft",A,0),W("hasContent",C,!1),W("maxTabWidth",M,X()),W("shouldPaginate",y,!1),b("noInkBar",O),b("dynamicHeight",R),b("noPagination"),b("swipeContent"),b("noDisconnect"),b("autoselect"),b("noSelectClick"),b("centerTabs",$,!1),b("enableDisconnect"),se.scope=e,se.parent=e.$parent,se.tabs=[],se.lastSelectedIndex=null,se.hasFocus=!1,se.lastClick=!0,se.shouldCenterTabs=q(),se.updatePagination=d.debounce(Y,100),se.redirectFocus=J,se.attachRipple=ce,se.insertTab=P,se.removeTab=L,se.select=N,se.scroll=S,se.nextPage=H,se.previousPage=D,se.keydown=x,se.canPageForward=U,se.canPageBack=B,se.refreshIndex=oe,se.incrementIndex=Z,se.getTabElementIndex=w,se.updateInkBarStyles=d.debounce(ie,100),se.updateTabOrder=d.debounce(Q,100),u()}t.module("material.components.tabs").controller("MdTabsController",e),e.$inject=["$scope","$element","$window","$mdConstant","$mdTabInkRipple","$mdUtil","$animateCss","$attrs","$compile","$mdTheming"]}(),function(){function e(){return{scope:{selectedIndex:"=?mdSelected"},template:function(e,t){return t.$mdTabsTemplate=e.html(),'<md-tabs-wrapper> <md-tab-data></md-tab-data> <md-prev-button tabindex="-1" role="button" aria-label="Previous Page" aria-disabled="{{!$mdTabsCtrl.canPageBack()}}" ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageBack() }" ng-if="$mdTabsCtrl.shouldPaginate" ng-click="$mdTabsCtrl.previousPage()"> <md-icon md-svg-icon="md-tabs-arrow"></md-icon> </md-prev-button> <md-next-button tabindex="-1" role="button" aria-label="Next Page" aria-disabled="{{!$mdTabsCtrl.canPageForward()}}" ng-class="{ \'md-disabled\': !$mdTabsCtrl.canPageForward() }" ng-if="$mdTabsCtrl.shouldPaginate" ng-click="$mdTabsCtrl.nextPage()"> <md-icon md-svg-icon="md-tabs-arrow"></md-icon> </md-next-button> <md-tabs-canvas tabindex="{{ $mdTabsCtrl.hasFocus ? -1 : 0 }}" aria-activedescendant="tab-item-{{$mdTabsCtrl.tabs[$mdTabsCtrl.focusIndex].id}}" ng-focus="$mdTabsCtrl.redirectFocus()" ng-class="{ \'md-paginated\': $mdTabsCtrl.shouldPaginate, \'md-center-tabs\': $mdTabsCtrl.shouldCenterTabs }" ng-keydown="$mdTabsCtrl.keydown($event)" role="tablist"> <md-pagination-wrapper ng-class="{ \'md-center-tabs\': $mdTabsCtrl.shouldCenterTabs }" md-tab-scroll="$mdTabsCtrl.scroll($event)"> <md-tab-item tabindex="-1" class="md-tab" ng-repeat="tab in $mdTabsCtrl.tabs" role="tab" aria-controls="tab-content-{{::tab.id}}" aria-selected="{{tab.isActive()}}" aria-disabled="{{tab.scope.disabled || \'false\'}}" ng-click="$mdTabsCtrl.select(tab.getIndex())" ng-class="{ \'md-active\':    tab.isActive(), \'md-focused\':   tab.hasFocus(), \'md-disabled\':  tab.scope.disabled }" ng-disabled="tab.scope.disabled" md-swipe-left="$mdTabsCtrl.nextPage()" md-swipe-right="$mdTabsCtrl.previousPage()" md-tabs-template="::tab.label" md-scope="::tab.parent"></md-tab-item> <md-ink-bar></md-ink-bar> </md-pagination-wrapper> <div class="_md-visually-hidden md-dummy-wrapper"> <md-dummy-tab class="md-tab" tabindex="-1" id="tab-item-{{::tab.id}}" role="tab" aria-controls="tab-content-{{::tab.id}}" aria-selected="{{tab.isActive()}}" aria-disabled="{{tab.scope.disabled || \'false\'}}" ng-focus="$mdTabsCtrl.hasFocus = true" ng-blur="$mdTabsCtrl.hasFocus = false" ng-repeat="tab in $mdTabsCtrl.tabs" md-tabs-template="::tab.label" md-scope="::tab.parent"></md-dummy-tab> </div> </md-tabs-canvas> </md-tabs-wrapper> <md-tabs-content-wrapper ng-show="$mdTabsCtrl.hasContent && $mdTabsCtrl.selectedIndex >= 0"> <md-tab-content id="tab-content-{{::tab.id}}" role="tabpanel" aria-labelledby="tab-item-{{::tab.id}}" md-swipe-left="$mdTabsCtrl.swipeContent && $mdTabsCtrl.incrementIndex(1)" md-swipe-right="$mdTabsCtrl.swipeContent && $mdTabsCtrl.incrementIndex(-1)" ng-if="$mdTabsCtrl.hasContent" ng-repeat="(index, tab) in $mdTabsCtrl.tabs" ng-class="{ \'md-no-transition\': $mdTabsCtrl.lastSelectedIndex == null, \'md-active\':        tab.isActive(), \'md-left\':          tab.isLeft(), \'md-right\':         tab.isRight(), \'md-no-scroll\':     $mdTabsCtrl.dynamicHeight }"> <div md-tabs-template="::tab.template" md-connected-if="tab.isActive()" md-scope="::tab.parent" ng-if="$mdTabsCtrl.enableDisconnect || tab.shouldRender()"></div> </md-tab-content> </md-tabs-content-wrapper>'},controller:"MdTabsController",controllerAs:"$mdTabsCtrl",bindToController:!0}}t.module("material.components.tabs").directive("mdTabs",e)}(),function(){function e(e,t){function n(n,o,r,i){function a(){n.$watch("connected",function(e){e===!1?d():c()}),n.$on("$destroy",c)}function d(){i.enableDisconnect&&t.disconnectScope(s)}function c(){i.enableDisconnect&&t.reconnectScope(s)}if(i){var s=i.enableDisconnect?n.compileScope.$new():n.compileScope;return o.html(n.template),e(o.contents())(s),o.on("DOMSubtreeModified",function(){i.updatePagination(),i.updateInkBarStyles()}),t.nextTick(a)}}return{restrict:"A",link:n,scope:{template:"=mdTabsTemplate",connected:"=?mdConnectedIf",compileScope:"=mdScope"},require:"^?mdTabs"}}t.module("material.components.tabs").directive("mdTabsTemplate",e),e.$inject=["$compile","$mdUtil"]}(),function(){t.module("material.core").constant("$MD_THEME_CSS","/*  Only used with Theme processes */html.md-THEME_NAME-theme, body.md-THEME_NAME-theme {  color: '{{foreground-1}}';  background-color: '{{background-color}}'; }md-autocomplete.md-THEME_NAME-theme {  background: '{{background-A100}}'; }  md-autocomplete.md-THEME_NAME-theme[disabled] {    background: '{{background-100}}'; }  md-autocomplete.md-THEME_NAME-theme button md-icon path {    fill: '{{background-600}}'; }  md-autocomplete.md-THEME_NAME-theme button:after {    background: '{{background-600-0.3}}'; }.md-autocomplete-suggestions-container.md-THEME_NAME-theme {  background: '{{background-A100}}'; }  .md-autocomplete-suggestions-container.md-THEME_NAME-theme li {    color: '{{background-900}}'; }    .md-autocomplete-suggestions-container.md-THEME_NAME-theme li .highlight {      color: '{{background-600}}'; }    .md-autocomplete-suggestions-container.md-THEME_NAME-theme li:hover, .md-autocomplete-suggestions-container.md-THEME_NAME-theme li.selected {      background: '{{background-200}}'; }md-bottom-sheet.md-THEME_NAME-theme {  background-color: '{{background-50}}';  border-top-color: '{{background-300}}'; }  md-bottom-sheet.md-THEME_NAME-theme.md-list md-list-item {    color: '{{foreground-1}}'; }  md-bottom-sheet.md-THEME_NAME-theme .md-subheader {    background-color: '{{background-50}}'; }  md-bottom-sheet.md-THEME_NAME-theme .md-subheader {    color: '{{foreground-1}}'; }md-backdrop {  background-color: '{{background-900-0.0}}'; }  md-backdrop.md-opaque.md-THEME_NAME-theme {    background-color: '{{background-900-1.0}}'; }.md-button.md-THEME_NAME-theme:not([disabled]):hover {  background-color: '{{background-500-0.2}}'; }.md-button.md-THEME_NAME-theme:not([disabled]).md-focused {  background-color: '{{background-500-0.2}}'; }.md-button.md-THEME_NAME-theme:not([disabled]).md-icon-button:hover {  background-color: transparent; }.md-button.md-THEME_NAME-theme.md-fab {  background-color: '{{accent-color}}';  color: '{{accent-contrast}}'; }  .md-button.md-THEME_NAME-theme.md-fab md-icon {    color: '{{accent-contrast}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]):hover {    background-color: '{{accent-600}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]).md-focused {    background-color: '{{accent-600}}'; }.md-button.md-THEME_NAME-theme.md-primary {  color: '{{primary-color}}'; }  .md-button.md-THEME_NAME-theme.md-primary.md-raised, .md-button.md-THEME_NAME-theme.md-primary.md-fab {    color: '{{primary-contrast}}';    background-color: '{{primary-color}}'; }    .md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]) md-icon {      color: '{{primary-contrast}}'; }    .md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]):hover {      background-color: '{{primary-600}}'; }    .md-button.md-THEME_NAME-theme.md-primary.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-primary.md-fab:not([disabled]).md-focused {      background-color: '{{primary-600}}'; }  .md-button.md-THEME_NAME-theme.md-primary:not([disabled]) md-icon {    color: '{{primary-color}}'; }.md-button.md-THEME_NAME-theme.md-fab {  background-color: '{{accent-color}}';  color: '{{accent-contrast}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]) .md-icon {    color: '{{accent-contrast}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]):hover {    background-color: '{{accent-600}}'; }  .md-button.md-THEME_NAME-theme.md-fab:not([disabled]).md-focused {    background-color: '{{accent-600}}'; }.md-button.md-THEME_NAME-theme.md-raised {  color: '{{background-900}}';  background-color: '{{background-50}}'; }  .md-button.md-THEME_NAME-theme.md-raised:not([disabled]) md-icon {    color: '{{background-900}}'; }  .md-button.md-THEME_NAME-theme.md-raised:not([disabled]):hover {    background-color: '{{background-50}}'; }  .md-button.md-THEME_NAME-theme.md-raised:not([disabled]).md-focused {    background-color: '{{background-200}}'; }.md-button.md-THEME_NAME-theme.md-warn {  color: '{{warn-color}}'; }  .md-button.md-THEME_NAME-theme.md-warn.md-raised, .md-button.md-THEME_NAME-theme.md-warn.md-fab {    color: '{{warn-contrast}}';    background-color: '{{warn-color}}'; }    .md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]) md-icon {      color: '{{warn-contrast}}'; }    .md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]):hover {      background-color: '{{warn-600}}'; }    .md-button.md-THEME_NAME-theme.md-warn.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-warn.md-fab:not([disabled]).md-focused {      background-color: '{{warn-600}}'; }  .md-button.md-THEME_NAME-theme.md-warn:not([disabled]) md-icon {    color: '{{warn-color}}'; }.md-button.md-THEME_NAME-theme.md-accent {  color: '{{accent-color}}'; }  .md-button.md-THEME_NAME-theme.md-accent.md-raised, .md-button.md-THEME_NAME-theme.md-accent.md-fab {    color: '{{accent-contrast}}';    background-color: '{{accent-color}}'; }    .md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]) md-icon, .md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]) md-icon {      color: '{{accent-contrast}}'; }    .md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]):hover, .md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]):hover {      background-color: '{{accent-600}}'; }    .md-button.md-THEME_NAME-theme.md-accent.md-raised:not([disabled]).md-focused, .md-button.md-THEME_NAME-theme.md-accent.md-fab:not([disabled]).md-focused {      background-color: '{{accent-600}}'; }  .md-button.md-THEME_NAME-theme.md-accent:not([disabled]) md-icon {    color: '{{accent-color}}'; }.md-button.md-THEME_NAME-theme[disabled], .md-button.md-THEME_NAME-theme.md-raised[disabled], .md-button.md-THEME_NAME-theme.md-fab[disabled], .md-button.md-THEME_NAME-theme.md-accent[disabled], .md-button.md-THEME_NAME-theme.md-warn[disabled] {  color: '{{foreground-3}}';  cursor: default; }  .md-button.md-THEME_NAME-theme[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-raised[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-fab[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-accent[disabled] md-icon, .md-button.md-THEME_NAME-theme.md-warn[disabled] md-icon {    color: '{{foreground-3}}'; }.md-button.md-THEME_NAME-theme.md-raised[disabled], .md-button.md-THEME_NAME-theme.md-fab[disabled] {  background-color: '{{foreground-4}}'; }.md-button.md-THEME_NAME-theme[disabled] {  background-color: transparent; }a.md-THEME_NAME-theme:not(.md-button) {  color: '{{accent-color}}'; }  a.md-THEME_NAME-theme:not(.md-button):hover {    color: '{{accent-700}}'; }  a.md-THEME_NAME-theme:not(.md-button).md-primary {    color: '{{primary-color}}'; }    a.md-THEME_NAME-theme:not(.md-button).md-primary:hover {      color: '{{primary-700}}'; }  a.md-THEME_NAME-theme:not(.md-button).md-warn {    color: '{{warn-color}}'; }    a.md-THEME_NAME-theme:not(.md-button).md-warn:hover {      color: '{{warn-700}}'; }md-card.md-THEME_NAME-theme {  background-color: '{{background-hue-1}}';  border-radius: 2px; }  md-card.md-THEME_NAME-theme .md-card-image {    border-radius: 2px 2px 0 0; }  md-card.md-THEME_NAME-theme md-card-header md-card-avatar md-icon {    color: '{{background-color}}';    background-color: '{{foreground-3}}'; }  md-card.md-THEME_NAME-theme md-card-header md-card-header-text .md-subhead {    color: '{{foreground-2}}'; }  md-card.md-THEME_NAME-theme md-card-title md-card-title-text:not(:only-child) .md-subhead {    color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme .md-ripple {  color: '{{accent-600}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-ripple {  color: '{{background-600}}'; }md-checkbox.md-THEME_NAME-theme.md-checked.md-focused ._md-container:before {  background-color: '{{accent-color-0.26}}'; }md-checkbox.md-THEME_NAME-theme .md-ink-ripple {  color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme.md-checked .md-ink-ripple {  color: '{{accent-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme ._md-icon {  border-color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme.md-checked ._md-icon {  background-color: '{{accent-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme.md-checked ._md-icon:after {  border-color: '{{accent-contrast-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-ripple {  color: '{{primary-600}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ripple {  color: '{{background-600}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-ink-ripple {  color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple {  color: '{{primary-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary ._md-icon {  border-color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked ._md-icon {  background-color: '{{primary-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked.md-focused ._md-container:before {  background-color: '{{primary-color-0.26}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked ._md-icon:after {  border-color: '{{primary-contrast-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-primary .md-indeterminate[disabled] ._md-container {  color: '{{foreground-3}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn .md-ripple {  color: '{{warn-600}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn .md-ink-ripple {  color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple {  color: '{{warn-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn ._md-icon {  border-color: '{{foreground-2}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked ._md-icon {  background-color: '{{warn-color-0.87}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked.md-focused:not([disabled]) ._md-container:before {  background-color: '{{warn-color-0.26}}'; }md-checkbox.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked ._md-icon:after {  border-color: '{{background-200}}'; }md-checkbox.md-THEME_NAME-theme[disabled] ._md-icon {  border-color: '{{foreground-3}}'; }md-checkbox.md-THEME_NAME-theme[disabled].md-checked ._md-icon {  background-color: '{{foreground-3}}'; }md-checkbox.md-THEME_NAME-theme[disabled].md-checked ._md-icon:after {  border-color: '{{background-200}}'; }md-checkbox.md-THEME_NAME-theme[disabled] ._md-label {  color: '{{foreground-3}}'; }md-chips.md-THEME_NAME-theme .md-chips {  box-shadow: 0 1px '{{foreground-4}}'; }  md-chips.md-THEME_NAME-theme .md-chips.md-focused {    box-shadow: 0 2px '{{primary-color}}'; }  md-chips.md-THEME_NAME-theme .md-chips ._md-chip-input-container input {    color: '{{foreground-1}}'; }    md-chips.md-THEME_NAME-theme .md-chips ._md-chip-input-container input::-webkit-input-placeholder {      color: '{{foreground-3}}'; }    md-chips.md-THEME_NAME-theme .md-chips ._md-chip-input-container input:-moz-placeholder {      color: '{{foreground-3}}'; }    md-chips.md-THEME_NAME-theme .md-chips ._md-chip-input-container input::-moz-placeholder {      color: '{{foreground-3}}'; }    md-chips.md-THEME_NAME-theme .md-chips ._md-chip-input-container input:-ms-input-placeholder {      color: '{{foreground-3}}'; }    md-chips.md-THEME_NAME-theme .md-chips ._md-chip-input-container input::-webkit-input-placeholder {      color: '{{foreground-3}}'; }md-chips.md-THEME_NAME-theme md-chip {  background: '{{background-300}}';  color: '{{background-800}}'; }  md-chips.md-THEME_NAME-theme md-chip md-icon {    color: '{{background-700}}'; }  md-chips.md-THEME_NAME-theme md-chip.md-focused {    background: '{{primary-color}}';    color: '{{primary-contrast}}'; }    md-chips.md-THEME_NAME-theme md-chip.md-focused md-icon {      color: '{{primary-contrast}}'; }  md-chips.md-THEME_NAME-theme md-chip._md-chip-editing {    background: transparent;    color: '{{background-800}}'; }md-chips.md-THEME_NAME-theme md-chip-remove .md-button md-icon path {  fill: '{{background-500}}'; }.md-contact-suggestion span.md-contact-email {  color: '{{background-400}}'; }md-content.md-THEME_NAME-theme {  color: '{{foreground-1}}';  background-color: '{{background-hue-1}}'; }/** Theme styles for mdCalendar. */.md-calendar.md-THEME_NAME-theme {  background: '{{background-A100}}';  color: '{{background-A200-0.87}}'; }  .md-calendar.md-THEME_NAME-theme tr:last-child td {    border-bottom-color: '{{background-200}}'; }.md-THEME_NAME-theme .md-calendar-day-header {  background: '{{background-300}}';  color: '{{background-A200-0.87}}'; }.md-THEME_NAME-theme .md-calendar-date.md-calendar-date-today .md-calendar-date-selection-indicator {  border: 1px solid '{{primary-500}}'; }.md-THEME_NAME-theme .md-calendar-date.md-calendar-date-today.md-calendar-date-disabled {  color: '{{primary-500-0.6}}'; }.md-THEME_NAME-theme .md-calendar-date.md-focus .md-calendar-date-selection-indicator {  background: '{{background-hue-1}}'; }.md-THEME_NAME-theme .md-calendar-date-selection-indicator:hover {  background: '{{background-300}}'; }.md-THEME_NAME-theme .md-calendar-date.md-calendar-selected-date .md-calendar-date-selection-indicator,.md-THEME_NAME-theme .md-calendar-date.md-focus.md-calendar-selected-date .md-calendar-date-selection-indicator {  background: '{{primary-500}}';  color: '{{primary-500-contrast}}';  border-color: transparent; }.md-THEME_NAME-theme .md-calendar-date-disabled,.md-THEME_NAME-theme .md-calendar-month-label-disabled {  color: '{{foreground-3}}'; }/** Theme styles for mdDatepicker. */.md-THEME_NAME-theme .md-datepicker-input {  color: '{{foreground-1}}'; }  .md-THEME_NAME-theme .md-datepicker-input::-webkit-input-placeholder {    color: '{{foreground-3}}'; }  .md-THEME_NAME-theme .md-datepicker-input:-moz-placeholder {    color: '{{foreground-3}}'; }  .md-THEME_NAME-theme .md-datepicker-input::-moz-placeholder {    color: '{{foreground-3}}'; }  .md-THEME_NAME-theme .md-datepicker-input:-ms-input-placeholder {    color: '{{foreground-3}}'; }  .md-THEME_NAME-theme .md-datepicker-input::-webkit-input-placeholder {    color: '{{foreground-3}}'; }.md-THEME_NAME-theme .md-datepicker-input-container {  border-bottom-color: '{{background-300}}'; }  .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-focused {    border-bottom-color: '{{primary-500}}'; }  .md-THEME_NAME-theme .md-datepicker-input-container.md-datepicker-invalid {    border-bottom-color: '{{warn-A700}}'; }.md-THEME_NAME-theme .md-datepicker-calendar-pane {  border-color: '{{background-hue-1}}'; }.md-THEME_NAME-theme .md-datepicker-triangle-button .md-datepicker-expand-triangle {  border-top-color: '{{foreground-3}}'; }.md-THEME_NAME-theme .md-datepicker-triangle-button:hover .md-datepicker-expand-triangle {  border-top-color: '{{foreground-2}}'; }.md-THEME_NAME-theme .md-datepicker-open .md-datepicker-calendar-icon {  fill: '{{primary-500}}'; }.md-THEME_NAME-theme .md-datepicker-open .md-datepicker-input-container,.md-THEME_NAME-theme .md-datepicker-input-mask-opaque {  background: '{{background-hue-1}}'; }.md-THEME_NAME-theme .md-datepicker-calendar {  background: '{{background-A100}}'; }md-dialog.md-THEME_NAME-theme {  border-radius: 4px;  background-color: '{{background-hue-1}}'; }  md-dialog.md-THEME_NAME-theme.md-content-overflow .md-actions, md-dialog.md-THEME_NAME-theme.md-content-overflow md-dialog-actions {    border-top-color: '{{foreground-4}}'; }md-divider.md-THEME_NAME-theme {  border-top-color: '{{foreground-4}}'; }.layout-row > md-divider.md-THEME_NAME-theme,.layout-xs-row > md-divider.md-THEME_NAME-theme, .layout-gt-xs-row > md-divider.md-THEME_NAME-theme,.layout-sm-row > md-divider.md-THEME_NAME-theme, .layout-gt-sm-row > md-divider.md-THEME_NAME-theme,.layout-md-row > md-divider.md-THEME_NAME-theme, .layout-gt-md-row > md-divider.md-THEME_NAME-theme,.layout-lg-row > md-divider.md-THEME_NAME-theme, .layout-gt-lg-row > md-divider.md-THEME_NAME-theme,.layout-xl-row > md-divider.md-THEME_NAME-theme {  border-right-color: '{{foreground-4}}'; }md-icon.md-THEME_NAME-theme {  color: '{{foreground-2}}'; }  md-icon.md-THEME_NAME-theme.md-primary {    color: '{{primary-color}}'; }  md-icon.md-THEME_NAME-theme.md-accent {    color: '{{accent-color}}'; }  md-icon.md-THEME_NAME-theme.md-warn {    color: '{{warn-color}}'; }md-input-container.md-THEME_NAME-theme .md-input {  color: '{{foreground-1}}';  border-color: '{{foreground-4}}'; }  md-input-container.md-THEME_NAME-theme .md-input::-webkit-input-placeholder {    color: '{{foreground-3}}'; }  md-input-container.md-THEME_NAME-theme .md-input:-moz-placeholder {    color: '{{foreground-3}}'; }  md-input-container.md-THEME_NAME-theme .md-input::-moz-placeholder {    color: '{{foreground-3}}'; }  md-input-container.md-THEME_NAME-theme .md-input:-ms-input-placeholder {    color: '{{foreground-3}}'; }  md-input-container.md-THEME_NAME-theme .md-input::-webkit-input-placeholder {    color: '{{foreground-3}}'; }md-input-container.md-THEME_NAME-theme > md-icon {  color: '{{foreground-1}}'; }md-input-container.md-THEME_NAME-theme label,md-input-container.md-THEME_NAME-theme ._md-placeholder {  color: '{{foreground-3}}'; }md-input-container.md-THEME_NAME-theme label.md-required:after {  color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-focused):not(.md-input-invalid) label.md-required:after {  color: '{{foreground-2}}'; }md-input-container.md-THEME_NAME-theme .md-input-messages-animation, md-input-container.md-THEME_NAME-theme .md-input-message-animation {  color: '{{warn-A700}}'; }  md-input-container.md-THEME_NAME-theme .md-input-messages-animation .md-char-counter, md-input-container.md-THEME_NAME-theme .md-input-message-animation .md-char-counter {    color: '{{foreground-1}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-has-value label {  color: '{{foreground-2}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused .md-input {  border-color: '{{primary-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused label {  color: '{{primary-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused md-icon {  color: '{{primary-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent .md-input {  border-color: '{{accent-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-accent label {  color: '{{accent-500}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn .md-input {  border-color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme:not(.md-input-invalid).md-input-focused.md-warn label {  color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme.md-input-invalid .md-input {  border-color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme.md-input-invalid label {  color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme.md-input-invalid .md-input-message-animation, md-input-container.md-THEME_NAME-theme.md-input-invalid .md-char-counter {  color: '{{warn-A700}}'; }md-input-container.md-THEME_NAME-theme .md-input[disabled],md-input-container.md-THEME_NAME-theme .md-input [disabled] {  border-bottom-color: transparent;  color: '{{foreground-3}}';  background-image: linear-gradient(to right, \"{{foreground-3}}\" 0%, \"{{foreground-3}}\" 33%, transparent 0%);  background-image: -ms-linear-gradient(left, transparent 0%, \"{{foreground-3}}\" 100%); }md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text h3, md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text h4,md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text h3,md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text h4 {  color: '{{foreground-1}}'; }md-list.md-THEME_NAME-theme md-list-item.md-2-line .md-list-item-text p,md-list.md-THEME_NAME-theme md-list-item.md-3-line .md-list-item-text p {  color: '{{foreground-2}}'; }md-list.md-THEME_NAME-theme ._md-proxy-focus.md-focused div._md-no-style {  background-color: '{{background-100}}'; }md-list.md-THEME_NAME-theme md-list-item .md-avatar-icon {  background-color: '{{foreground-3}}';  color: '{{background-color}}'; }md-list.md-THEME_NAME-theme md-list-item > md-icon {  color: '{{foreground-2}}'; }  md-list.md-THEME_NAME-theme md-list-item > md-icon.md-highlight {    color: '{{primary-color}}'; }    md-list.md-THEME_NAME-theme md-list-item > md-icon.md-highlight.md-accent {      color: '{{accent-color}}'; }md-menu-bar.md-THEME_NAME-theme > button.md-button {  color: '{{foreground-2}}';  border-radius: 2px; }md-menu-bar.md-THEME_NAME-theme md-menu._md-open > button, md-menu-bar.md-THEME_NAME-theme md-menu > button:focus {  outline: none;  background: '{{background-200}}'; }md-menu-bar.md-THEME_NAME-theme._md-open:not(._md-keyboard-mode) md-menu:hover > button {  background-color: '{{ background-500-0.2}}'; }md-menu-bar.md-THEME_NAME-theme:not(._md-keyboard-mode):not(._md-open) md-menu button:hover,md-menu-bar.md-THEME_NAME-theme:not(._md-keyboard-mode):not(._md-open) md-menu button:focus {  background: transparent; }md-menu-content.md-THEME_NAME-theme .md-menu > .md-button:after {  color: '{{background-A200-0.54}}'; }md-menu-content.md-THEME_NAME-theme .md-menu._md-open > .md-button {  background-color: '{{ background-500-0.2}}'; }md-toolbar.md-THEME_NAME-theme.md-menu-toolbar {  background-color: '{{background-A100}}';  color: '{{background-A200}}'; }  md-toolbar.md-THEME_NAME-theme.md-menu-toolbar md-toolbar-filler {    background-color: '{{primary-color}}';    color: '{{background-A100-0.87}}'; }    md-toolbar.md-THEME_NAME-theme.md-menu-toolbar md-toolbar-filler md-icon {      color: '{{background-A100-0.87}}'; }md-menu-content.md-THEME_NAME-theme {  background-color: '{{background-A100}}'; }  md-menu-content.md-THEME_NAME-theme md-menu-item {    color: '{{background-A200-0.87}}'; }    md-menu-content.md-THEME_NAME-theme md-menu-item md-icon {      color: '{{background-A200-0.54}}'; }    md-menu-content.md-THEME_NAME-theme md-menu-item .md-button[disabled] {      color: '{{background-A200-0.25}}'; }      md-menu-content.md-THEME_NAME-theme md-menu-item .md-button[disabled] md-icon {        color: '{{background-A200-0.25}}'; }  md-menu-content.md-THEME_NAME-theme md-menu-divider {    background-color: '{{background-A200-0.11}}'; }md-progress-circular.md-THEME_NAME-theme path {  stroke: '{{primary-color}}'; }md-progress-circular.md-THEME_NAME-theme.md-warn path {  stroke: '{{warn-color}}'; }md-progress-circular.md-THEME_NAME-theme.md-accent path {  stroke: '{{accent-color}}'; }md-progress-linear.md-THEME_NAME-theme ._md-container {  background-color: '{{primary-100}}'; }md-progress-linear.md-THEME_NAME-theme ._md-bar {  background-color: '{{primary-color}}'; }md-progress-linear.md-THEME_NAME-theme.md-warn ._md-container {  background-color: '{{warn-100}}'; }md-progress-linear.md-THEME_NAME-theme.md-warn ._md-bar {  background-color: '{{warn-color}}'; }md-progress-linear.md-THEME_NAME-theme.md-accent ._md-container {  background-color: '{{accent-100}}'; }md-progress-linear.md-THEME_NAME-theme.md-accent ._md-bar {  background-color: '{{accent-color}}'; }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-warn ._md-bar1 {  background-color: '{{warn-100}}'; }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-warn ._md-dashed:before {  background: radial-gradient(\"{{warn-100}}\" 0%, \"{{warn-100}}\" 16%, transparent 42%); }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-accent ._md-bar1 {  background-color: '{{accent-100}}'; }md-progress-linear.md-THEME_NAME-theme[md-mode=buffer].md-accent ._md-dashed:before {  background: radial-gradient(\"{{accent-100}}\" 0%, \"{{accent-100}}\" 16%, transparent 42%); }md-radio-button.md-THEME_NAME-theme ._md-off {  border-color: '{{foreground-2}}'; }md-radio-button.md-THEME_NAME-theme ._md-on {  background-color: '{{accent-color-0.87}}'; }md-radio-button.md-THEME_NAME-theme.md-checked ._md-off {  border-color: '{{accent-color-0.87}}'; }md-radio-button.md-THEME_NAME-theme.md-checked .md-ink-ripple {  color: '{{accent-color-0.87}}'; }md-radio-button.md-THEME_NAME-theme ._md-container .md-ripple {  color: '{{accent-600}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary ._md-on, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary ._md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary ._md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary ._md-on {  background-color: '{{primary-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked ._md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked ._md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked ._md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked ._md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked ._md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked ._md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked ._md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked ._md-off {  border-color: '{{primary-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary.md-checked .md-ink-ripple {  color: '{{primary-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-primary ._md-container .md-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-primary ._md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-primary ._md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-primary ._md-container .md-ripple {  color: '{{primary-600}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn ._md-on, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn ._md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn ._md-on,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn ._md-on {  background-color: '{{warn-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked ._md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked ._md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked ._md-off, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked ._md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked ._md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked ._md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked ._md-off,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked ._md-off {  border-color: '{{warn-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-ink-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn.md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn .md-checked .md-ink-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn.md-checked .md-ink-ripple {  color: '{{warn-color-0.87}}'; }md-radio-group.md-THEME_NAME-theme:not([disabled]) .md-warn ._md-container .md-ripple, md-radio-group.md-THEME_NAME-theme:not([disabled]).md-warn ._md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]) .md-warn ._md-container .md-ripple,md-radio-button.md-THEME_NAME-theme:not([disabled]).md-warn ._md-container .md-ripple {  color: '{{warn-600}}'; }md-radio-group.md-THEME_NAME-theme[disabled],md-radio-button.md-THEME_NAME-theme[disabled] {  color: '{{foreground-3}}'; }  md-radio-group.md-THEME_NAME-theme[disabled] ._md-container ._md-off,  md-radio-button.md-THEME_NAME-theme[disabled] ._md-container ._md-off {    border-color: '{{foreground-3}}'; }  md-radio-group.md-THEME_NAME-theme[disabled] ._md-container ._md-on,  md-radio-button.md-THEME_NAME-theme[disabled] ._md-container ._md-on {    border-color: '{{foreground-3}}'; }md-radio-group.md-THEME_NAME-theme .md-checked .md-ink-ripple {  color: '{{accent-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-primary .md-checked:not([disabled]) .md-ink-ripple, md-radio-group.md-THEME_NAME-theme .md-checked:not([disabled]).md-primary .md-ink-ripple {  color: '{{primary-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme .md-checked.md-primary .md-ink-ripple {  color: '{{warn-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked ._md-container:before {  background-color: '{{accent-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty).md-primary .md-checked ._md-container:before,md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked.md-primary ._md-container:before {  background-color: '{{primary-color-0.26}}'; }md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty).md-warn .md-checked ._md-container:before,md-radio-group.md-THEME_NAME-theme.md-focused:not(:empty) .md-checked.md-warn ._md-container:before {  background-color: '{{warn-color-0.26}}'; }md-select.md-THEME_NAME-theme[disabled] ._md-select-value {  border-bottom-color: transparent;  background-image: linear-gradient(to right, \"{{foreground-3}}\" 0%, \"{{foreground-3}}\" 33%, transparent 0%);  background-image: -ms-linear-gradient(left, transparent 0%, \"{{foreground-3}}\" 100%); }md-select.md-THEME_NAME-theme ._md-select-value {  border-bottom-color: '{{foreground-4}}'; }  md-select.md-THEME_NAME-theme ._md-select-value._md-select-placeholder {    color: '{{foreground-3}}'; }md-select.md-THEME_NAME-theme.ng-invalid.ng-dirty ._md-select-value {  color: '{{warn-A700}}' !important;  border-bottom-color: '{{warn-A700}}' !important; }md-select.md-THEME_NAME-theme:not([disabled]):focus ._md-select-value {  border-bottom-color: '{{primary-color}}';  color: '{{ foreground-1 }}'; }  md-select.md-THEME_NAME-theme:not([disabled]):focus ._md-select-value._md-select-placeholder {    color: '{{ foreground-1 }}'; }md-select.md-THEME_NAME-theme:not([disabled]):focus.md-accent ._md-select-value {  border-bottom-color: '{{accent-color}}'; }md-select.md-THEME_NAME-theme:not([disabled]):focus.md-warn ._md-select-value {  border-bottom-color: '{{warn-color}}'; }md-select.md-THEME_NAME-theme[disabled] ._md-select-value {  color: '{{foreground-3}}'; }  md-select.md-THEME_NAME-theme[disabled] ._md-select-value._md-select-placeholder {    color: '{{foreground-3}}'; }md-select-menu.md-THEME_NAME-theme md-content {  background: '{{background-A100}}'; }  md-select-menu.md-THEME_NAME-theme md-content md-optgroup {    color: '{{background-600-0.87}}'; }  md-select-menu.md-THEME_NAME-theme md-content md-option {    color: '{{background-900-0.87}}'; }    md-select-menu.md-THEME_NAME-theme md-content md-option[disabled] ._md-text {      color: '{{background-400-0.87}}'; }    md-select-menu.md-THEME_NAME-theme md-content md-option:not([disabled]):focus, md-select-menu.md-THEME_NAME-theme md-content md-option:not([disabled]):hover {      background: '{{background-200}}'; }    md-select-menu.md-THEME_NAME-theme md-content md-option[selected] {      color: '{{primary-500}}'; }      md-select-menu.md-THEME_NAME-theme md-content md-option[selected]:focus {        color: '{{primary-600}}'; }      md-select-menu.md-THEME_NAME-theme md-content md-option[selected].md-accent {        color: '{{accent-500}}'; }        md-select-menu.md-THEME_NAME-theme md-content md-option[selected].md-accent:focus {          color: '{{accent-600}}'; }[md-checkbox-enabled].md-THEME_NAME-theme .md-ripple {  color: '{{primary-600}}'; }[md-checkbox-enabled].md-THEME_NAME-theme[selected] .md-ripple {  color: '{{background-600}}'; }[md-checkbox-enabled].md-THEME_NAME-theme .md-ink-ripple {  color: '{{foreground-2}}'; }[md-checkbox-enabled].md-THEME_NAME-theme[selected] .md-ink-ripple {  color: '{{primary-color-0.87}}'; }[md-checkbox-enabled].md-THEME_NAME-theme ._md-icon {  border-color: '{{foreground-2}}'; }[md-checkbox-enabled].md-THEME_NAME-theme[selected] ._md-icon {  background-color: '{{primary-color-0.87}}'; }[md-checkbox-enabled].md-THEME_NAME-theme[selected].md-focused ._md-container:before {  background-color: '{{primary-color-0.26}}'; }[md-checkbox-enabled].md-THEME_NAME-theme[selected] ._md-icon:after {  border-color: '{{primary-contrast-0.87}}'; }[md-checkbox-enabled].md-THEME_NAME-theme .md-indeterminate[disabled] ._md-container {  color: '{{foreground-3}}'; }[md-checkbox-enabled].md-THEME_NAME-theme md-option ._md-text {  color: '{{background-900-0.87}}'; }md-sidenav.md-THEME_NAME-theme, md-sidenav.md-THEME_NAME-theme md-content {  background-color: '{{background-hue-1}}'; }md-slider.md-THEME_NAME-theme ._md-track {  background-color: '{{foreground-3}}'; }md-slider.md-THEME_NAME-theme ._md-track-ticks {  color: '{{background-contrast}}'; }md-slider.md-THEME_NAME-theme ._md-focus-ring {  background-color: '{{accent-200-0.38}}'; }md-slider.md-THEME_NAME-theme ._md-disabled-thumb {  border-color: '{{background-color}}';  background-color: '{{background-color}}'; }md-slider.md-THEME_NAME-theme._md-min ._md-thumb:after {  background-color: '{{background-color}}';  border-color: '{{foreground-3}}'; }md-slider.md-THEME_NAME-theme._md-min ._md-focus-ring {  background-color: '{{foreground-3-0.38}}'; }md-slider.md-THEME_NAME-theme._md-min[md-discrete] ._md-thumb:after {  background-color: '{{background-contrast}}';  border-color: transparent; }md-slider.md-THEME_NAME-theme._md-min[md-discrete] ._md-sign {  background-color: '{{background-400}}'; }  md-slider.md-THEME_NAME-theme._md-min[md-discrete] ._md-sign:after {    border-top-color: '{{background-400}}'; }md-slider.md-THEME_NAME-theme._md-min[md-discrete][md-vertical] ._md-sign:after {  border-top-color: transparent;  border-left-color: '{{background-400}}'; }md-slider.md-THEME_NAME-theme ._md-track._md-track-fill {  background-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme ._md-thumb:after {  border-color: '{{accent-color}}';  background-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme ._md-sign {  background-color: '{{accent-color}}'; }  md-slider.md-THEME_NAME-theme ._md-sign:after {    border-top-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme[md-vertical] ._md-sign:after {  border-top-color: transparent;  border-left-color: '{{accent-color}}'; }md-slider.md-THEME_NAME-theme ._md-thumb-text {  color: '{{accent-contrast}}'; }md-slider.md-THEME_NAME-theme.md-warn ._md-focus-ring {  background-color: '{{warn-200-0.38}}'; }md-slider.md-THEME_NAME-theme.md-warn ._md-track._md-track-fill {  background-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn ._md-thumb:after {  border-color: '{{warn-color}}';  background-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn ._md-sign {  background-color: '{{warn-color}}'; }  md-slider.md-THEME_NAME-theme.md-warn ._md-sign:after {    border-top-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn[md-vertical] ._md-sign:after {  border-top-color: transparent;  border-left-color: '{{warn-color}}'; }md-slider.md-THEME_NAME-theme.md-warn ._md-thumb-text {  color: '{{warn-contrast}}'; }md-slider.md-THEME_NAME-theme.md-primary ._md-focus-ring {  background-color: '{{primary-200-0.38}}'; }md-slider.md-THEME_NAME-theme.md-primary ._md-track._md-track-fill {  background-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary ._md-thumb:after {  border-color: '{{primary-color}}';  background-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary ._md-sign {  background-color: '{{primary-color}}'; }  md-slider.md-THEME_NAME-theme.md-primary ._md-sign:after {    border-top-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary[md-vertical] ._md-sign:after {  border-top-color: transparent;  border-left-color: '{{primary-color}}'; }md-slider.md-THEME_NAME-theme.md-primary ._md-thumb-text {  color: '{{primary-contrast}}'; }md-slider.md-THEME_NAME-theme[disabled] ._md-thumb:after {  border-color: transparent; }md-slider.md-THEME_NAME-theme[disabled]:not(._md-min) ._md-thumb:after, md-slider.md-THEME_NAME-theme[disabled][md-discrete] ._md-thumb:after {  background-color: '{{foreground-3}}';  border-color: transparent; }md-slider.md-THEME_NAME-theme[disabled][readonly] ._md-sign {  background-color: '{{background-400}}'; }  md-slider.md-THEME_NAME-theme[disabled][readonly] ._md-sign:after {    border-top-color: '{{background-400}}'; }md-slider.md-THEME_NAME-theme[disabled][readonly][md-vertical] ._md-sign:after {  border-top-color: transparent;  border-left-color: '{{background-400}}'; }md-slider.md-THEME_NAME-theme[disabled][readonly] ._md-disabled-thumb {  border-color: transparent;  background-color: transparent; }md-slider-container[disabled] > *:first-child:not(md-slider),md-slider-container[disabled] > *:last-child:not(md-slider) {  color: '{{foreground-3}}'; }.md-subheader.md-THEME_NAME-theme {  color: '{{ foreground-2-0.23 }}';  background-color: '{{background-hue-2}}'; }  .md-subheader.md-THEME_NAME-theme.md-primary {    color: '{{primary-color}}'; }  .md-subheader.md-THEME_NAME-theme.md-accent {    color: '{{accent-color}}'; }  .md-subheader.md-THEME_NAME-theme.md-warn {    color: '{{warn-color}}'; }md-switch.md-THEME_NAME-theme .md-ink-ripple {  color: '{{background-500}}'; }md-switch.md-THEME_NAME-theme ._md-thumb {  background-color: '{{background-50}}'; }md-switch.md-THEME_NAME-theme ._md-bar {  background-color: '{{background-500}}'; }md-switch.md-THEME_NAME-theme.md-checked .md-ink-ripple {  color: '{{accent-color}}'; }md-switch.md-THEME_NAME-theme.md-checked ._md-thumb {  background-color: '{{accent-color}}'; }md-switch.md-THEME_NAME-theme.md-checked ._md-bar {  background-color: '{{accent-color-0.5}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-focused ._md-thumb:before {  background-color: '{{accent-color-0.26}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary .md-ink-ripple {  color: '{{primary-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary ._md-thumb {  background-color: '{{primary-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary ._md-bar {  background-color: '{{primary-color-0.5}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-primary.md-focused ._md-thumb:before {  background-color: '{{primary-color-0.26}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn .md-ink-ripple {  color: '{{warn-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn ._md-thumb {  background-color: '{{warn-color}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn ._md-bar {  background-color: '{{warn-color-0.5}}'; }md-switch.md-THEME_NAME-theme.md-checked.md-warn.md-focused ._md-thumb:before {  background-color: '{{warn-color-0.26}}'; }md-switch.md-THEME_NAME-theme[disabled] ._md-thumb {  background-color: '{{background-400}}'; }md-switch.md-THEME_NAME-theme[disabled] ._md-bar {  background-color: '{{foreground-4}}'; }md-tabs.md-THEME_NAME-theme md-tabs-wrapper {  background-color: transparent;  border-color: '{{foreground-4}}'; }md-tabs.md-THEME_NAME-theme .md-paginator md-icon {  color: '{{primary-color}}'; }md-tabs.md-THEME_NAME-theme md-ink-bar {  color: '{{accent-color}}';  background: '{{accent-color}}'; }md-tabs.md-THEME_NAME-theme .md-tab {  color: '{{foreground-2}}'; }  md-tabs.md-THEME_NAME-theme .md-tab[disabled], md-tabs.md-THEME_NAME-theme .md-tab[disabled] md-icon {    color: '{{foreground-3}}'; }  md-tabs.md-THEME_NAME-theme .md-tab.md-active, md-tabs.md-THEME_NAME-theme .md-tab.md-active md-icon, md-tabs.md-THEME_NAME-theme .md-tab.md-focused, md-tabs.md-THEME_NAME-theme .md-tab.md-focused md-icon {    color: '{{primary-color}}'; }  md-tabs.md-THEME_NAME-theme .md-tab.md-focused {    background: '{{primary-color-0.1}}'; }  md-tabs.md-THEME_NAME-theme .md-tab .md-ripple-container {    color: '{{accent-100}}'; }md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper {  background-color: '{{accent-color}}'; }  md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{accent-100}}'; }    md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{accent-contrast}}'; }    md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{accent-contrast-0.1}}'; }  md-tabs.md-THEME_NAME-theme.md-accent > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-ink-bar {    color: '{{primary-600-1}}';    background: '{{primary-600-1}}'; }md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper {  background-color: '{{primary-color}}'; }  md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{primary-100}}'; }    md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{primary-contrast}}'; }    md-tabs.md-THEME_NAME-theme.md-primary > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{primary-contrast-0.1}}'; }md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper {  background-color: '{{warn-color}}'; }  md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{warn-100}}'; }    md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{warn-contrast}}'; }    md-tabs.md-THEME_NAME-theme.md-warn > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{warn-contrast-0.1}}'; }md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper {  background-color: '{{primary-color}}'; }  md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{primary-100}}'; }    md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{primary-contrast}}'; }    md-toolbar > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{primary-contrast-0.1}}'; }md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper {  background-color: '{{accent-color}}'; }  md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{accent-100}}'; }    md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{accent-contrast}}'; }    md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{accent-contrast-0.1}}'; }  md-toolbar.md-accent > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-ink-bar {    color: '{{primary-600-1}}';    background: '{{primary-600-1}}'; }md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper {  background-color: '{{warn-color}}'; }  md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]) {    color: '{{warn-100}}'; }    md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active, md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-active md-icon, md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused, md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused md-icon {      color: '{{warn-contrast}}'; }    md-toolbar.md-warn > md-tabs.md-THEME_NAME-theme > md-tabs-wrapper > md-tabs-canvas > md-pagination-wrapper > md-tab-item:not([disabled]).md-focused {      background: '{{warn-contrast-0.1}}'; }md-toast.md-THEME_NAME-theme .md-toast-content {  background-color: #323232;  color: '{{background-50}}'; }  md-toast.md-THEME_NAME-theme .md-toast-content .md-button {    color: '{{background-50}}'; }    md-toast.md-THEME_NAME-theme .md-toast-content .md-button.md-highlight {      color: '{{accent-A200}}'; }      md-toast.md-THEME_NAME-theme .md-toast-content .md-button.md-highlight.md-primary {        color: '{{primary-A200}}'; }      md-toast.md-THEME_NAME-theme .md-toast-content .md-button.md-highlight.md-warn {        color: '{{warn-A200}}'; }md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) {  background-color: '{{primary-color}}';  color: '{{primary-contrast}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) md-icon {    color: '{{primary-contrast}}';    fill: '{{primary-contrast}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar) .md-button[disabled] md-icon {    color: '{{primary-contrast-0.26}}';    fill: '{{primary-contrast-0.26}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent {    background-color: '{{accent-color}}';    color: '{{accent-contrast}}'; }    md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent .md-ink-ripple {      color: '{{accent-contrast}}'; }    md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent md-icon {      color: '{{accent-contrast}}';      fill: '{{accent-contrast}}'; }    md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-accent .md-button[disabled] md-icon {      color: '{{accent-contrast-0.26}}';      fill: '{{accent-contrast-0.26}}'; }  md-toolbar.md-THEME_NAME-theme:not(.md-menu-toolbar).md-warn {    background-color: '{{warn-color}}';    color: '{{warn-contrast}}'; }md-tooltip.md-THEME_NAME-theme {  color: '{{background-A100}}'; }  md-tooltip.md-THEME_NAME-theme ._md-content {    background-color: '{{foreground-2}}'; }");
}()}(window,window.angular),window.ngMaterial={version:{full:"1.1.0-rc2"}};
/*
 AngularJS v1.7.2
 (c) 2010-2018 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(z,l){'use strict';function q(n){return["$animate",function(u){return{restrict:"AE",transclude:"element",priority:1,terminal:!0,require:"^^ngMessages",link:function(m,f,a,e,r){var b,h,s;if(!n){b=f[0];s=a.ngMessage||a.when;a=a.ngMessageExp||a.whenExp;var k=function(c){h=c?v(c)?c:c.split(/[\s,]+/):null;e.reRender()};a?(k(m.$eval(a)),m.$watchCollection(a,k)):k(s)}var g,t;e.register(b,t={test:function(c){var b=h;c=b?v(b)?0<=b.indexOf(c):b.hasOwnProperty(c):void 0;return c},attach:function(){g||
r(function(c,a){u.enter(c,null,f);g=c;var d=g.$$attachId=e.getAttachId();g.on("$destroy",function(){g&&g.$$attachId===d&&(e.deregister(b,n),t.detach());a.$destroy()})})},detach:function(){if(g){var c=g;g=null;u.leave(c)}}},n);m.$on("$destroy",function(){e.deregister(b,n)})}}}]}var x,v,p,y;l.module("ngMessages",[],function(){x=l.forEach;v=l.isArray;p=l.isString;y=l.element}).info({angularVersion:"1.7.2"}).directive("ngMessages",["$animate",function(n){function u(f,a){return p(a)&&0===a.length||m(f.$eval(a))}
function m(f){return p(f)?f.length:!!f}return{require:"ngMessages",restrict:"AE",controller:["$element","$scope","$attrs",function(f,a,e){function r(c,b){for(var d=b,a=[];d&&d!==c;){var e=d.$$ngMessageNode;if(e&&e.length)return k[e];d.childNodes.length&&-1===a.indexOf(d)?(a.push(d),d=d.childNodes[d.childNodes.length-1]):d.previousSibling?d=d.previousSibling:(d=d.parentNode,a.push(d))}}var b=this,h=0,s=0;this.getAttachId=function(){return s++};var k=this.messages={},g,t;this.render=function(c){c=c||
{};g=!1;t=c;for(var w=u(a,e.ngMessagesMultiple)||u(a,e.multiple),d=[],r={},h=0,k=b.head,s=!1,l=0;null!=k;){l++;var p=k.message,q=!1;s||x(c,function(b,c){m(b)&&!q&&(h++,p.test(c)&&!r[c]&&(q=r[c]=!0,p.attach()))});q?s=!w:d.push(p);k=k.next}x(d,function(c){c.detach()});c=d.length!==l;(w=b.default&&!c&&0<h)?b.default.attach():b.default&&b.default.detach();c||w?n.setClass(f,"ng-active","ng-inactive"):n.setClass(f,"ng-inactive","ng-active")};a.$watchCollection(e.ngMessages||e["for"],b.render);this.reRender=
function(){g||(g=!0,a.$evalAsync(function(){g&&t&&b.render(t)}))};this.register=function(c,a,d){if(d)b.default=a;else{d=h.toString();k[d]={message:a};var e=f[0];a=k[d];b.head?(e=r(e,c))?(a.next=e.next,e.next=a):(a.next=b.head,b.head=a):b.head=a;c.$$ngMessageNode=d;h++}b.reRender()};this.deregister=function(a,e){if(e)delete b.default;else{var d=a.$$ngMessageNode;delete a.$$ngMessageNode;var g=k[d];if(g){var h=r(f[0],a);h?h.next=g.next:b.head=g.next}delete k[d]}b.reRender()}}]}}]).directive("ngMessagesInclude",
["$templateRequest","$document","$compile",function(n,l,m){function f(a,e){var f=m.$$createComment?m.$$createComment("ngMessagesInclude",e):l[0].createComment(" ngMessagesInclude: "+e+" "),f=y(f);a.after(f);a.remove()}return{restrict:"AE",require:"^^ngMessages",link:function(a,e,l){var b=l.ngMessagesInclude||l.src;n(b).then(function(h){a.$$destroyed||(p(h)&&!h.trim()?f(e,b):m(h)(a,function(a){e.after(a);f(e,b)}))})}}}]).directive("ngMessage",q()).directive("ngMessageExp",q()).directive("ngMessageDefault",
q(!0))})(window,window.angular);
//# sourceMappingURL=angular-messages.min.js.map
/*
 AngularJS v1.7.2
 (c) 2010-2018 Google, Inc. http://angularjs.org
 License: MIT
*/
(function(J,d){'use strict';function A(d){k&&d.get("$route")}function B(t,u,g){return{restrict:"ECA",terminal:!0,priority:400,transclude:"element",link:function(a,f,b,c,m){function v(){l&&(g.cancel(l),l=null);p&&(p.$destroy(),p=null);q&&(l=g.leave(q),l.done(function(a){!1!==a&&(l=null)}),q=null)}function E(){var b=t.current&&t.current.locals;if(d.isDefined(b&&b.$template)){var b=a.$new(),c=t.current;q=m(b,function(b){g.enter(b,null,q||f).done(function(b){!1===b||!d.isDefined(w)||w&&!a.$eval(w)||u()});
v()});p=c.scope=b;p.$emit("$viewContentLoaded");p.$eval(k)}else v()}var p,q,l,w=b.autoscroll,k=b.onload||"";a.$on("$routeChangeSuccess",E);E()}}}function C(d,k,g){return{restrict:"ECA",priority:-400,link:function(a,f){var b=g.current,c=b.locals;f.html(c.$template);var m=d(f.contents());if(b.controller){c.$scope=a;var v=k(b.controller,c);b.controllerAs&&(a[b.controllerAs]=v);f.data("$ngControllerController",v);f.children().data("$ngControllerController",v)}a[b.resolveAs||"$resolve"]=c;m(a)}}}var x,
y,F,G,z=d.module("ngRoute",[]).info({angularVersion:"1.7.2"}).provider("$route",function(){function t(a,f){return d.extend(Object.create(a),f)}function u(a,d){var b=d.caseInsensitiveMatch,c={originalPath:a,regexp:a},g=c.keys=[];a=a.replace(/([().])/g,"\\$1").replace(/(\/)?:(\w+)(\*\?|[?*])?/g,function(a,b,d,c){a="?"===c||"*?"===c?"?":null;c="*"===c||"*?"===c?"*":null;g.push({name:d,optional:!!a});b=b||"";return""+(a?"":b)+"(?:"+(a?b:"")+(c&&"(.+?)"||"([^/]+)")+(a||"")+")"+(a||"")}).replace(/([/$*])/g,
"\\$1");c.regexp=new RegExp("^"+a+"$",b?"i":"");return c}x=d.isArray;y=d.isObject;F=d.isDefined;G=d.noop;var g={};this.when=function(a,f){var b;b=void 0;if(x(f)){b=b||[];for(var c=0,m=f.length;c<m;c++)b[c]=f[c]}else if(y(f))for(c in b=b||{},f)if("$"!==c.charAt(0)||"$"!==c.charAt(1))b[c]=f[c];b=b||f;d.isUndefined(b.reloadOnUrl)&&(b.reloadOnUrl=!0);d.isUndefined(b.reloadOnSearch)&&(b.reloadOnSearch=!0);d.isUndefined(b.caseInsensitiveMatch)&&(b.caseInsensitiveMatch=this.caseInsensitiveMatch);g[a]=d.extend(b,
a&&u(a,b));a&&(c="/"===a[a.length-1]?a.substr(0,a.length-1):a+"/",g[c]=d.extend({redirectTo:a},u(c,b)));return this};this.caseInsensitiveMatch=!1;this.otherwise=function(a){"string"===typeof a&&(a={redirectTo:a});this.when(null,a);return this};k=!0;this.eagerInstantiationEnabled=function(a){return F(a)?(k=a,this):k};this.$get=["$rootScope","$location","$routeParams","$q","$injector","$templateRequest","$sce","$browser",function(a,f,b,c,m,k,u,p){function q(e){var h=s.current;n=C();(y=!D&&n&&h&&n.$$route===
h.$$route&&(!n.reloadOnUrl||!n.reloadOnSearch&&d.equals(n.pathParams,h.pathParams)))||!h&&!n||a.$broadcast("$routeChangeStart",n,h).defaultPrevented&&e&&e.preventDefault()}function l(){var e=s.current,h=n;if(y)e.params=h.params,d.copy(e.params,b),a.$broadcast("$routeUpdate",e);else if(h||e){D=!1;s.current=h;var H=c.resolve(h);p.$$incOutstandingRequestCount();H.then(w).then(z).then(function(c){return c&&H.then(A).then(function(c){h===s.current&&(h&&(h.locals=c,d.copy(h.params,b)),a.$broadcast("$routeChangeSuccess",
h,e))})}).catch(function(b){h===s.current&&a.$broadcast("$routeChangeError",h,e,b)}).finally(function(){p.$$completeOutstandingRequest(G)})}}function w(e){var a={route:e,hasRedirection:!1};if(e)if(e.redirectTo)if(d.isString(e.redirectTo))a.path=x(e.redirectTo,e.params),a.search=e.params,a.hasRedirection=!0;else{var b=f.path(),g=f.search();e=e.redirectTo(e.pathParams,b,g);d.isDefined(e)&&(a.url=e,a.hasRedirection=!0)}else if(e.resolveRedirectTo)return c.resolve(m.invoke(e.resolveRedirectTo)).then(function(e){d.isDefined(e)&&
(a.url=e,a.hasRedirection=!0);return a});return a}function z(a){var b=!0;if(a.route!==s.current)b=!1;else if(a.hasRedirection){var d=f.url(),c=a.url;c?f.url(c).replace():c=f.path(a.path).search(a.search).replace().url();c!==d&&(b=!1)}return b}function A(a){if(a){var b=d.extend({},a.resolve);d.forEach(b,function(a,e){b[e]=d.isString(a)?m.get(a):m.invoke(a,null,null,e)});a=B(a);d.isDefined(a)&&(b.$template=a);return c.all(b)}}function B(a){var b,c;d.isDefined(b=a.template)?d.isFunction(b)&&(b=b(a.params)):
d.isDefined(c=a.templateUrl)&&(d.isFunction(c)&&(c=c(a.params)),d.isDefined(c)&&(a.loadedTemplateUrl=u.valueOf(c),b=k(c)));return b}function C(){var a,b;d.forEach(g,function(c,g){var r;if(r=!b){var k=f.path();r=c.keys;var m={};if(c.regexp)if(k=c.regexp.exec(k)){for(var l=1,p=k.length;l<p;++l){var n=r[l-1],q=k[l];n&&q&&(m[n.name]=q)}r=m}else r=null;else r=null;r=a=r}r&&(b=t(c,{params:d.extend({},f.search(),a),pathParams:a}),b.$$route=c)});return b||g[null]&&t(g[null],{params:{},pathParams:{}})}function x(a,
b){var c=[];d.forEach((a||"").split(":"),function(a,d){if(0===d)c.push(a);else{var e=a.match(/(\w+)(?:[?*])?(.*)/),f=e[1];c.push(b[f]);c.push(e[2]||"");delete b[f]}});return c.join("")}var D=!1,n,y,s={routes:g,reload:function(){D=!0;var b={defaultPrevented:!1,preventDefault:function(){this.defaultPrevented=!0;D=!1}};a.$evalAsync(function(){q(b);b.defaultPrevented||l()})},updateParams:function(a){if(this.current&&this.current.$$route)a=d.extend({},this.current.params,a),f.path(x(this.current.$$route.originalPath,
a)),f.search(a);else throw I("norout");}};a.$on("$locationChangeStart",q);a.$on("$locationChangeSuccess",l);return s}]}).run(A),I=d.$$minErr("ngRoute"),k;A.$inject=["$injector"];z.provider("$routeParams",function(){this.$get=function(){return{}}});z.directive("ngView",B);z.directive("ngView",C);B.$inject=["$route","$anchorScroll","$animate"];C.$inject=["$compile","$controller","$route"]})(window,window.angular);
//# sourceMappingURL=angular-route.min.js.map
var Cart = {};
var Product ={};

topics = {};
jQuery.Topic = function(id) {
  var callbacks,
    topic = id && topics[id];
  if (!topic) {
    callbacks = jQuery.Callbacks();
    topic = {
      publish: callbacks.fire,
      subscribe: callbacks.add,
      unsubscribe: callbacks.remove
    };
    if (id) {
      topics[id] = topic;
    }
  }
  return topic;
};

(function(_angular) {


  console.log('loading me')
  console.log(_angular.version)


  var shoppableModule = '';
  var shoppableCartModule = '';
  var breakpoint = 768;
  var _additionalLinks = false;

  var currentCid = ''
  ///angular small change to force rebuiild
  getCid = function() {
    var name = "_ga"
    var cid;
    name += '=';
    if (currentCid !== '')
      return currentCid
    for (var ca = document.cookie.split(/;\s*/), i = ca.length - 1; i >= 0; i--) {
      if (!ca[i].indexOf(name))
        currentCid = ca[i].replace(name, '');
    }
    return currentCid;
  }



  var shoppableController,
    __bind = function(fn, me) {
      return function() {
        return fn.apply(me, arguments);
      };
    };

  shoppableController = function($scope, $http, $q, $sce) {
    var Products,
      Products = (function() {
        function Products(newProducts) {
          this.getProductsToDisplay = __bind(this.getProductsToDisplay, this);
          $scope.showExternalLink = false;
          newProducts.items.map((function(_this) {
            return function(product) {
              return _this.getProductsToDisplay(product.idType, product.id, product.callback, product.sku, product.mode);
            };
          })(this));
        }

        Products.prototype.products = [];

        Products.prototype.getProductsToDisplay = function(idType, id, callback, sku, mode) {
          if (idType == 'upc')
            idType = 'upcs'
          var api2Url, apiUrl, currentUrl;
          return $http({
            method: 'Get',
            headers: {
              'Authorization': 'Bearer ' + g_opt_obj.token,
              'Content-Type': 'application/json',
              'Content-Type': 'application/json',
              'cid': getCid()
            },
            url: ShoppableApi.framesApiCall + '/v3/product?' + idType + '=' + id
          }).then((function(_this) {
            return function(response) {
              product = {}

              if (!Array.isArray(response.data)) {
                product.items = []
                response.data.product_objects = []
                response.data.product_objects.push(response.data);
                product.items.push(response.data);
              } else {
                product.items = response.data;

              }

              if (window.g_opt_obj.merchantList !== "all") {
                var i, item, len, list, ref, ref1, tempItems,
                  indexOf = [].indexOf || function(item) {
                    for (var i = 0, l = this.length; i < l; i++) {
                      if (i in this && this[i] === item) return i;
                    }
                    return -1;
                  };

                list = window.g_opt_obj.merchantList.split(',');

                tempItems = [];

                ref = product.items;
                for (i = 0, len = ref.length; i < len; i++) {
                  item = ref[i];
                  if (ref1 = item.merchant_id, indexOf.call(list, ref1) >= 0) {

                    tempItems.push(item);
                  }
                }

                product.items = tempItems;
              }
              tempItems = []
              ref = product.items;
              for (i = 0, len = ref.length; i < len; i++) {
                item = ref[i];
                if (!item.outOfStock) {

                  tempItems.push(item);
                }
              }
              product.items = tempItems;
              if (callback) {
                callback(null, product.items)
              }
              product.merchants = [];

              var addedColors, color, i, item, j, len, len1, ref, ref1, colorlist;


              addedColors = [];
              colorlist = []
              ref = product.items;
              for (i = 0, len = ref.length; i < len; i++) {
                item = ref[i];
                product.merchants.push({
                  name: item.merchant
                });
                ref1 = item.colors;
                for (j = 0, len1 = ref1.length; j < len1; j++) {
                  color = ref1[j];

                  temp = typeof addedColors[color.color.toUpperCase()]
                  if (typeof addedColors[color.color.toUpperCase()] == 'undefined' && color.color.toUpperCase()) {

                    colorlist.push({
                      name: color.color.toUpperCase(),
                      image: color.images[0],
                      brand: item.brand,
                      description: item.description
                    })
                    addedColors[color.color.toUpperCase()] = {
                      items: [color]
                    };
                  } else if (color.color.toUpperCase()) {
                    addedColors[color.color.toUpperCase()].items.push(color);
                  }
                }
              }
              product.colors = addedColors;
              product.colorlist = colorlist;
              product.my_current_Object = {
                indextouse: -999,
                variaceToUse: -999,
                colorVariance: -999,
                merchantVariance: -999
              };

              product.current_object = function() {


                var indextouse = parseInt(this.currentIndex);
                var variaceToUse = parseInt(this.currentVariance);
                var colorVariance = parseInt(this.currentColorVariance);
                var merchantVariance = parseInt(this.currentMerchantVariance);
                if (indextouse == -1)
                  indextouse = 0
                if (variaceToUse == -1) {
                  variaceToUse = 0
                  overridePrice = '--'
                }
                if (colorVariance == -1) {
                  colorVariance = 0
                  overridePrice = '--'
                }

                if (merchantVariance == -1) {
                  merchantVariance = 0
                  overridePrice = '--'
                }
                if (
                  this.my_current_Object.indextouse == indextouse &&
                  this.my_current_Object.variaceToUse == variaceToUse &&
                  this.my_current_Object.merchantVariance == merchantVariance &&
                  this.my_current_Object.colorVariance == colorVariance &&
                  this.my_current_Object.qty == this.qty
                ) {

                  this.my_current_Object.name = this.my_current_Object.variances[variaceToUse].name;
                  this.my_current_Object.price = this.my_current_Object.variances[variaceToUse].price;

                  return this.my_current_Object
                } else if (this.items.length == 0) {
                  this.my_current_Object.indextouse = 0
                  this.my_current_Object.variaceToUse = 0
                  this.my_current_Object.merchantVariance = 0
                  this.my_current_Object.colorVariance = 0
                  this.my_current_Object.qty = 0
                  return this.my_current_Object

                } else {
                  overridePrice = false

                  var currentObject, currentVariance, currentColor, currentMerchant;
                  if (this.group == 'color' & this.colorlist.length > 0) {
                    currentObject = this.colors[this.colorlist[indextouse].name];
                    currentObject.description = this.colorlist[indextouse].description;
                    currentObject.brand = this.colorlist[indextouse].brand;
                    var i, item, len, ref;
                    currentObject.merchants = [];
                    ref = currentObject.items;
                    var merchantFound = []
                    for (i = 0, len = ref.length; i < len; i++) {
                      item = ref[i];
                      if (typeof merchantFound[item.sizes[0].merchant] == 'undefined') {
                        merchantFound[item.sizes[0].merchant] = true;
                        currentObject.merchants.push({
                          name: item.sizes[0].merchant
                        });
                      }

                    }
                    if (!isNaN(merchantVariance)) {
                      if (currentObject.items.length - 1 < merchantVariance) {
                        merchantVariance = 0;
                      }
                      currentColor = currentObject.items[merchantVariance];

                      if (currentColor.sizes) {

                        currentVariance = currentColor.sizes[variaceToUse];
                        currentObject.name = currentVariance.name;
                      } else {
                        currentObject = currentObject.items[merchantVariance];
                      }

                    }

                  } else {

                    currentObject = this.items[indextouse];
                    if (currentObject.colors) {

                      currentColor = currentObject.colors[colorVariance];
                      currentVariance = currentColor.sizes[variaceToUse];
                    }
                  }
                  if (!overridePrice && currentVariance) {
                    overridePrice = (currentVariance.price * parseInt(this.qty)).toFixed(2);
                  }
                  if (currentVariance) {
                    this.my_current_Object = {
                      name: currentObject.name,
                      color: currentColor.color,
                      image: currentColor.images[0],
                      brand: currentObject.brand,
                      description: currentObject.description,
                      price: overridePrice,
                      sku: currentVariance.id,
                      qty: parseInt(this.qty),
                      merchants: currentObject.merchants,
                      colors: currentObject.colors,
                      variances: currentColor.sizes,
                      indextouse: indextouse,
                      variaceToUse: variaceToUse,
                      colorVariance: colorVariance,
                      merchantVariance: merchantVariance
                    }

                  } else {

                    this.my_current_Object = {

                      name: currentObject.name,
                      color: currentObject.color,
                      image: currentObject.images[0],
                      brand: currentObject.brand,
                      description: currentObject.description,
                      price: overridePrice,
                      sku: currentObject.sku,
                      qty: parseInt(this.qty),
                      merchants: currentObject.merchants,
                      colors: [currentObject.color],
                      variances: [currentObject.size],
                      indextouse: indextouse,
                      variaceToUse: variaceToUse,
                      colorVariance: colorVariance,
                      merchantVariance: merchantVariance

                    };
                  }

                  return this.my_current_Object;

                }

              }
              if (window.g_opt_obj.productGroup == "color") {
                product.group = window.g_opt_obj.productGroup;
                product.colorGroup = true;
              } else {
                product.colorGroup = false;
                product.group = 'merchant'
              }
              product.mode = mode;
              product.currentVariance = '-1';
              product.currentColorVariance = '-1';
              product.currentIndex = '-1';
              product.currentMerchantVariance = '-1'
              product.qty = '1';
              if (product.colorlist.length == 1 && window.g_opt_obj.productGroup == "color") {
                product.currentIndex = 0;
                product.currentVariance = 0;
                product.my_current_Object.indextouse = 0;
                product.my_current_Object.colorVariance = 0;
                product.my_current_Object.merchantVariance = 0;
              }
              var stashedZip = ''
              if (product.mode == 'updateProduct') {
                var color, foundItem, i, item, j, k, l, len, len1, len2, len3, len4, m, merchant, ref, ref1, ref2, ref3, ref4, size, temp2Index, tempIndex;

                foundItem = {};

                ref = window.currentCart.merchants;
                for (i = 0, len = ref.length; i < len; i++) {
                  merchant = ref[i];
                  ref1 = merchant.items;
                  for (j = 0, len1 = ref1.length; j < len1; j++) {
                    item = ref1[j];
                    if (item.sku + "" === sku + "") {

                      foundItem.sku = sku;
                      foundItem.merchant = merchant.name;
                      foundItem.size = item.size;
                      if (merchant.zipcode) {
                        stashedZip = merchant.zipcode;
                      }
                      if (item.color) {
                        foundItem.color = item.color.toUpperCase();
                      } else {
                        foundItem.color = 'N/A';
                      }
                      product.qty = item.qty;
                      product.currentsku = sku;
                    }
                  }
                }


                if (foundItem !== {} && product.colorGroup) {
                  tempIndex = 0;
                  ref2 = product.colorlist;
                  for (k = 0, len2 = ref2.length; k < len2; k++) {
                    color = ref2[k];
                    if (color.name.toUpperCase() === foundItem.color.toUpperCase()) {

                      product.currentIndex = tempIndex;
                    }
                    tempIndex++;
                  }



                  tempIndex = 0;

                  if (foundItem.egrocer) {
                    product.currentVariance = '0';
                    product.currentColorVariance = '0';
                    product.currentIndex = '0';
                    product.currentMerchantVariance = '0';
                    ref3 = $scope.egrocersList;
                    for (l = 0, len3 = ref3.length; l < len3; l++) {
                      var grocer = ref3[l];
                      if (grocer.name == foundItem.egrocer) {
                        $scope.tmpProduct = grocer;
                        $scope.egrocerSecond = true;
                        product.items.push(item);
                      }
                    }
                  } else {
                    ref3 = product.colors[foundItem.color].items;
                    for (l = 0, len3 = ref3.length; l < len3; l++) {
                      item = ref3[l];
                      ref4 = item.sizes;
                      temp2Index = 0;

                      for (m = 0, len4 = ref4.length; m < len4; m++) {
                        size = ref4[m];

                        if (size.id === foundItem.sku) {
                          product.currentMerchantVariance = tempIndex;
                          product.currentVariance = temp2Index;

                        }
                        temp2Index++;
                      }
                      tempIndex++;
                    }

                    $scope.tmpProduct = product.currentMerchantVariance + '-' + product.currentVariance;
                  }
                } else {
                  if (foundItem.egrocer) {
                    product.currentVariance = '0';
                    product.currentColorVariance = '0';
                    product.currentIndex = '0';
                    product.currentMerchantVariance = '0';
                    ref3 = $scope.egrocersList;
                    for (l = 0, len3 = ref3.length; l < len3; l++) {
                      var grocer = ref3[l];
                      if (grocer.name == foundItem.egrocer) {
                        $scope.tmpProduct = grocer;
                        $scope.egrocerSecond = true;
                        product.items.push(item);
                      }
                    }
                  } else {
                    tempIndex = 0;
                    ref2 = product.items;
                    for (k = 0, len2 = ref2.length; k < len2; k++) {
                      item = ref2[k];
                      if (item.merchant.toUpperCase() === foundItem.merchant.toUpperCase()) {

                        product.currentIndex = tempIndex;
                      }
                      tempIndex++;
                    }
                    tempIndex = 0;
                    ref2 = product.items[product.currentIndex].colors[0].sizes;
                    for (k = 0, len2 = ref2.length; k < len2; k++) {
                      size = ref2[k];
                      if (size.id === foundItem.sku) {

                        product.currentVariance = tempIndex;
                      }
                      tempIndex++;
                      $scope.tmpProduct = product.currentIndex + '-' + product.currentVariance;
                    }
                  }

                }
              };
              $scope.showSpinner = false;
              $scope.outOfstockAtEgrocer = false;
              $scope.egrocerSecond = false;

              $scope.products.push(product);
              if ($scope.tmpProduct) {
                $scope.changeMerchant($scope.tmpProduct);
                $scope.checkEgrocerZip(stashedZip);
              }


            }
          })(this));
        };


        return Products;

      })();
    $scope.changeMerchant = function(merchant) {
      $scope.mechantSelected = true;
      $scope.showExternalLink = false;
      if (merchant.image) {
        $scope.egrocerSecond = true;
        $scope.outOfstockAtEgrocer = false;
        $scope.zipcodeReady = true;
        $scope.checkEgrocerZip($scope.zipcode)
        $scope.egrocerItem = {}
        $scope.egrocerItem.price = false
      } else if (merchant.link_format) {

        tempLink = merchant.link_format.replace("{name}", $scope.products[0].my_current_Object.name)
        tempLink = tempLink.replace("{brand}", $scope.products[0].my_current_Object.brand)
        tempLink = tempLink.replace("{upc}", $scope.products[0].my_current_Object.variances[0].upc)
        $scope.showExternalLink = tempLink;
        $scope.externalName = merchant.name;
        $scope.egrocerSecond = false;
        $scope.outOfstockAtEgrocer = false;
      } else {
        var merchantInfo = merchant.split('-')
        if ($scope.products[parseInt(merchantInfo[1])].colorGroup)
          $scope.products[parseInt(merchantInfo[1])].currentMerchantVariance = parseInt(merchantInfo[0]);
        else {
          $scope.products[parseInt(merchantInfo[1])].currentIndex = parseInt(merchantInfo[0]);
          $scope.products[parseInt(merchantInfo[1])].currentVariance = 0;
        }

        $scope.egrocerSecond = false;
        $scope.outOfstockAtEgrocer = false;
      }
    }

    $scope.removeSku = function(sku, container, callback) {
      deferred = $q.defer();
      $scope.deleteSku(sku)
        .then(function(response) {
          $.Topic('REMOVE_FROM_CART').publish(JSON.stringify(response));
          if (callback)
            callback(window.currentCart);
          fade_and_remove(container, 1);
        });
      return deferred.promise;
    };

    $scope.deleteSku = function(sku) {
      deferred = $q.defer();
      $http({
        method: 'Get',
        headers: {
          'Authorization': 'Bearer ' + g_opt_obj.token,
          'Content-Type': 'application/json',
          'cid': getCid()
        },
        url: ShoppableApi.framesApiCall + '/v3/cart/' + window.g_cart_id + "/delete/" + sku
      }).then(function(response) {
        window.currentCart = response.data;
        deferred.resolve(response.data)
      });
      return deferred.promise;

    };

    $scope.setItemSku = function(sku, qty, container, callback) {
      deferred = $q.defer();
      $http({
        method: 'Get',
        headers: {
          'Authorization': 'Bearer ' + g_opt_obj.token,
          'Content-Type': 'application/json',
          'cid': getCid()
        },
        url: ShoppableApi.framesApiCall + '/v3/cart/' + window.g_cart_id + "/put/" + sku + "/qty/" + qty
      }).then(function(response) {
        window.currentCart = response.data;
        fade_and_remove(container, 1);
        $.Topic('ADD_TO_CART').publish(JSON.stringify(response));
        if (callback)
          callback(response.data);
        deferred.resolve(true)
      });
      return deferred.promise;

    };


    $scope.updateBundleInBag = function() {
      sku = this.currentsku;
      if (this.product) {
        sku = this.product.currentsku;

      }
      $scope.deleteSku(sku)
        .then(function() {
          $scope.addBundleToBag(false);
        });
    };
    $scope.addBundleToBag = function(open) {

      var bundle, error, productIndex, len, product, ref, myProducts;

      error = false;

      bundle = [];

      myProducts = this.products;
      for (productIndex = 0, curLength = myProducts.length; productIndex < curLength; productIndex++) {
        product = myProducts[productIndex];
        product.error = false;

        if (product.currentVariance === "-1" && !product.removed && product.items.length > 0) {
          error = true;
          product.error = $scope.localizedText.selectSize;
        }
        if (product.currentIndex === "-1" && !product.removed && product.items.length > 0) {
          error = true;
          product.error = $scope.localizedText.selectRetailer;
        }
        if (!product.removed) {
          var curProduct = product.current_object();
          var i, item, j, len, len1, merchant, ref, ref1, sku;



          sku = curProduct.sku;
          if (window.currentCart && window.currentCart.merchants) {
            ref = window.currentCart.merchants;
            for (i = 0, len = ref.length; i < len; i++) {
              merchant = ref[i];
              ref1 = merchant.items;
              for (j = 0, len1 = ref1.length; j < len1; j++) {
                item = ref1[j];
                if (item.sku === sku) {
                  curProduct.qty = parseInt(curProduct.qty);
                  curProduct.qty += item.qty;
                  if (curProduct.qty > 12)
                    curProduct.qty = 12
                }
              }
            }
          }
          bundle.push(curProduct);
        }
      }
      if (error) {
        $scope.error = error;
      } else {
        $scope.closeBag();

        return $http({
          method: 'Post',
          headers: {
            'Authorization': 'Bearer ' + g_opt_obj.token,
            'Content-Type': 'application/json',
            'cid': getCid()
          },
          data: {
            items: bundle,
            id: window.g_cart_id
          },
          url: ShoppableApi.framesApiCall + '/v3/cart/put/bundling'
        }).then(function(response) {
          $.Topic('ADD_TO_CART').publish(JSON.stringify(response));
          return Cart.get_cart(g_opt_obj.token, window.g_cart_id, open);

        });
      }
    };

    $scope.closeBag = function() {
      fade_and_remove($scope.container, 5);
      fade_and_remove($scope.background, 15);
      $('.md-select-menu-container').hide();
      //$('md-option').hide();
    }




    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.showmulti = true;
    $scope.togglemulto = function() {
      $scope.showmulti = !$scope.showmulti;
    }

    $scope.addProductsToCart = function(open, qty, mode) {
      egrocerItem = {
        zipcode: $scope.zipcode,
        qty: parseInt(qty),
        upc: $scope.egrocerItem.upc,
        image: [$scope.egrocerItem.image.medium],
        name: $scope.egrocerItem.name,
        price: $scope.egrocerItem.price,
        retail_price: $scope.egrocerItem.price,
        size: $scope.egrocerItem.size,
        color: 'n/a',
        prodId: $scope.egrocerItem.prodId,
        merchant_id: 'egrocer',
        images: [$scope.egrocerItem.image.medium],
        sku: $scope.egrocerItem.prodId,
        merchant_sku: $scope.egrocerItem.prodId,
        merchant: $scope.curEgrocer.name.toLowerCase(),
        merchant_name: $scope.curEgrocer.name.toLowerCase(),
        egrocer: $scope.curEgrocer.name.toLowerCase()

      }

      return $http({
        method: 'post',
        headers: {
          'Authorization': 'Bearer ' + g_opt_obj.token,
          'Content-Type': 'application/json',
          'Content-Type': 'application/json',
          'cid': getCid()
        },
        data: {
          item: egrocerItem,
          id: window.g_cart_id
        },
        url: ShoppableApi.framesApiCall + '/v3/cart/put/externalProduct'
      }).then(function(response) {
        $.Topic('ADD_TO_CART').publish(JSON.stringify(response.data));
        $scope.closeBag();
        setTimeout(function() {
          Cart.get_cart(g_opt_obj.token, window.g_cart_id, open);
        }, 1500);


      });

    }

    $scope.addToEgrocerCart = function(open, qty, mode) {

      if (mode == 'updateProduct') {
        var sku = this.currentsku;
        if (this.product) {
          sku = this.product.currentsku;
          $scope.deleteSku(sku)
            .then(function() {
              $scope.addProductsToCart(open, qty, mode)
            })


        }
      } else {
        $scope.addProductsToCart(open, qty, mode);
      }
    }

    $scope.openEmailRequest = function(container, background) {
      $scope.container = container;
      $scope.background = background;
      $scope.frameHeight = '500px';
      $scope.localizedText = Product.getLocalizedText();
      $scope.atPeapod = false;

    }

    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    var generateOrderNumber = function() {
      guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
      return 'Egrocer' + guid;
    }

    var pollForOrder = function(orderId, times) {
      if (times < 200) {
        var url = framesApiCall + '/v3/getEgrocerOrder/' + orderId;
        var thankyouPageCall = g_opt_obj.egrocer_thank_you_page + '?cart=' + window.g_cart_id + '&email=' + $scope.email + '&oid=' + orderId;
        $http({
          method: 'Get',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + g_opt_obj.token
          },
          url: url

        }).then(function(response) {
          var data = response.data;
          if (data.msg) {
            setTimeout(function() {
              pollForOrder(orderId, times + 1);
            }, 30000)
          } else {
            window.location = thankyouPageCall;
          }

        });

      }

    }



    $scope.createProduct = function(pdpProducts, container, background) {
      $scope.showmulti = true;
      $scope.container = container;
      $scope.background = background;
      $scope.localizedText = Product.getLocalizedText();
      $scope.products = []
      $scope.showSpinner = true;
      $scope.bundlable = false;
      $scope.frameHeight = '500px';
      if (pdpProducts.items.length > 1) {
        $scope.frameHeight = ' 500px';
        $scope.bundlable = true;
        // }

        if (!_additionalLinks) {
          $http({
            method: 'Get',
            headers: {
              'Authorization': 'Bearer ' + g_opt_obj.token,
              'Content-Type': 'application/json',
              'Content-Type': 'application/json',
              'cid': getCid()
            },
            url: ShoppableApi.framesApiCall + '/v3/productLinks'
          }).then(function(response) {
            _additionalLinks = response.data;
            $scope.additionalLinks = response.data;


          })

        } else {
          $scope.additionalLinks = _additionalLinks;
        }

      } else {
        return new Products(pdpProducts).products;
      }


    };



    $scope.openProduct = function(product) {
      console.log('hihih')
      console.log(product)
      Product.pop_pdp('upcs', product.colors[0].sizes[0].upc, 'addProduct');
    }

    $scope.createMarketPlace = function() {
      $scope.updatingMarketPlace = true;
      rows = $scope.marketPlaceRows;
      category = $scope.categorySelection;
      brand = $scope.brandSelection;
      retailer = $scope.retailerSelection;
      price = $scope.priceSelection;
      url = framesApiCall + '/v3/catalog?search=upc:*&rows=' + rows;
      search = "";


      if (brand) {
        search += "&brands=" + brand;
      } else {
        search += "";
      }

      if (retailer) {
        search += "&merchants=" + retailer;
      } else {
        search += "";
      }
      if (category) {
        search += "&categories=" + category;
      } else {
        search += "";
      }
      if (price) {
        search += "&sort=" + price;
      } else {
        search += "&sort=price";

      }
      url += search
      $http({
        method: 'Get',
        headers: {
          'Authorization': 'Bearer ' + g_opt_obj.token,
          'Content-Type': 'application/json',
          'Content-Type': 'application/json',
          'cid': getCid()
        },
        url: url
      }).then(function(resposne) {
        var data = resposne.data;
        console.log('whooopie')
        console.log(data)
        var brand, category, foundBrands, foundCategories, foundMerchants, i, j, k, len, len1, len2, merchant, ref, ref1, ref2;

        foundCategories = [];

        $scope.marketPlaceCategories = [];

        ref = data.navigation.categories;
        for (i = 0, len = ref.length; i < len; i++) {
          category = ref[i];
          if (typeof foundCategories[category.cat_name] === 'undefined' && category.cat_name != '') {
            foundCategories[category.cat_name] = true;
            $scope.marketPlaceCategories.push({
              name: category.cat_name
            });
          }
        }

        foundBrands = [];

        $scope.marketPlaceBrands = [];

        ref1 = data.navigation.brands;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          brand = ref1[j];
          if (typeof foundBrands[brand.brand] === 'undefined' && brand.brand != '') {
            foundBrands[brand.brand] = true;
            $scope.marketPlaceBrands.push({
              name: brand.brand
            });
          }
        }

        foundMerchants = [];

        $scope.marketPlaceMerchants = [];

        ref2 = data.navigation.merchants;
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          merchant = ref2[k];
          if (typeof foundMerchants[merchant.merchant] === 'undefined' && merchant.merchant != '') {
            foundMerchants[merchant.merchant] = true;
            $scope.marketPlaceMerchants.push({
              name: merchant.merchant
            });
          }
        }

        var newArr = [];
        for (var i = 0; i < data.products.length; i += $scope.productsPerRow) {
          newArr.push(data.products.slice(i, i + $scope.productsPerRow));
        }


        $scope.marketPlaceProductsToShow = newArr;
        $scope.updatingMarketPlace = false;

      });


    }
    $scope.createRecipie = function(recipiename, ingredients, container, background) {
      $scope.container = container;
      $scope.background = background;
      $scope.ingredients = ingredients;
      $scope.curRecipie = recipiename;
      $scope.canCheckout = false;
    }
    $scope.addAllIngredientsToCart = function() {
      var index = 0;
      var putAllInLoop = function(index, length, ingredients, deferred) {
        if (deferred == '') {
          deferred = $q.defer();
        }
        if (index >= length) {
          deferred.resolve();
        } else {
          curIngredient = ingredients[index];
          curIngredient.qty = parseInt(curIngredient.qty);
          if (curIngredient.qty > 0) {
            $http({
              method: 'post',
              headers: {
                'Authorization': 'Bearer ' + g_opt_obj.token,
                'Content-Type': 'application/json',
                'Content-Type': 'application/json',
                'cid': getCid()
              },
              data: {
                item: curIngredient,
                id: window.g_cart_id
              },
              url: ShoppableApi.framesApiCall + '/v3/cart/put/externalProduct'
            }).then(function() {
              putAllInLoop(index + 1, length, ingredients, deferred);
            });
          } else {
            putAllInLoop(index + 1, length, ingredients, deferred);
          }
        }

        return deferred.promise;
      }


      putAllInLoop(0, $scope.ingredients.length, $scope.ingredients, '')
        .then(function() {
          $scope.closeBag();
          Cart.get_cart(g_opt_obj.token, window.g_cart_id, open);
        });


    }

  }

  shoppableController.$inject = ['$scope', '$http', '$q', '$sce'];
  shoppableModule = _angular.module('shoppableModule', ['ngAnimate', 'ngMaterial']).controller('shoppableController', shoppableController).config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.generateThemesOnDemand(true);

  }]);
  var shoppableCartController = function($scope, $http, $q, $timeout) {
    $scope.closeCart = function() {
      $scope.hideCart = true;
      setTimeout(function() {
        $('#shoppable_cart').hide()

      }, 1000);
    }

    $scope.setQty = function(item) {
      var itemToPut = {
        sku: item.sku,
        qty: parseInt(item.qty)
      }

      return $http({
        method: 'Post',
        headers: {
          'Authorization': 'Bearer ' + g_opt_obj.token,
          'Content-Type': 'application/json',
          'cid': getCid()
        },
        data: {
          items: [itemToPut],
          id: window.g_cart_id
        },
        url: ShoppableApi.framesApiCall + '/v3/cart/put/bundling'
      }).then(function(response) {
        $scope.cart = response.data;
        $.Topic('ADD_TO_CART').publish(JSON.stringify(response.data));

        return Cart.get_cart(g_opt_obj.token, window.g_cart_id, false);
      });

    }

    $scope.editSku = function(upc, sku) {
      while (upc.length < 12) {
        upc = "0" + upc
      }
      Product.pop_pdp('upc', upc, 'updateProduct', sku, function(done) {
        console.log('parent pdp popped');
      });
    }
    $scope.qtyChangeSelected = function() {
      $('body').addClass('pdp_open');
    }
    $scope.spendMore = function(merchant) {
      if (merchant.subtotal < merchant.ship_free_min) {
        return '- You\'re $' + (merchant.ship_free_min - merchant.subtotal).toFixed(2) + ' away from FREE shipping'
      } else {
        return "";
      }
    }

    $scope.openCheckoutPage = function() {
      if (window.g_opt_obj.checkout_page) {
        window.location = window.g_opt_obj.checkout_page;
      } else {
        window.location = Cart.get_checkout_url();
      }
    }

    $scope.openEmailRequest = function() {
      Cart.openEmailRequest();

    }
    $scope.removeSku = function(sku) {
      return $http({
        method: 'Get',
        headers: {
          'Authorization': 'Bearer ' + g_opt_obj.token,
          'Content-Type': 'application/json',
          'cid': getCid()
        },
        url: ShoppableApi.framesApiCall + '/v3/cart/' + window.g_cart_id + "/delete/" + sku
      }).then(function(response) {
        $scope.cart = response.data;
        $.Topic('REMOVE_FROM_CART').publish(JSON.stringify(response.data));
        return Cart.get_cart(g_opt_obj.token, window.g_cart_id, true);
      });
    }

    $scope.isntNA = function(value) {
      if ('n/a' === value.toLowerCase() || 'na' === value.toLowerCase()) {
        return false;
      } else {
        return true;
      }
    }
    $scope.hasEgrocer = function() {
      var foundEgrocer = false;
      if (window.currentCart) {
        var ref = window.currentCart.merchants;
        if (ref) {
          for (i = 0, len = ref.length; i < len; i++) {
            merchant = ref[i];
            ref1 = merchant.items;

            if (merchant.id == 'egrocer') {
              foundEgrocer = true;
              $scope.curEgrocer = merchant.name;
            }
          }
        }
      }
      return foundEgrocer;
    }
    $scope.hasNonEgrocer = function() {
      var foundNonEgrocer = false;
      if (window.currentCart) {
        var ref = window.currentCart.merchants;
        if (ref) {
          for (i = 0, len = ref.length; i < len; i++) {
            merchant = ref[i];
            ref1 = merchant.items;
            if (merchant.id != 'egrocer') {
              foundNonEgrocer = true;
            }
          }
        }
      }
      return foundNonEgrocer;
    }


    $scope.getTotalMiniusCart = function(merchants) {
      if (merchants) {
        var total = 0;
        var index = 0;
        while (index < merchants.length) {
          if (merchants[index].id == 'egrocer') {
            total += merchants[index].total;
          }

          index++;
        }
        return total;
      }
    }
    $scope.hideCart = true;
    $scope.fixPrice = function(price) {
      newprice = parseFloat(price)
      console.log('here i am')
      console.log(newprice)
      if (!isNaN(newprice)) {
        return newprice.toFixed(2)
      } else {
        return 0.00
      }
    }

    $scope.autoClose = function(time) {
      if (g_opt_obj.auto_close_cart_time * 6661000)
        $scope.closeMeAfterTime = $timeout(function() {
          $scope.hideCart = true;
          fade_and_remove($scope.pdp_container, 5);
        }, g_opt_obj.auto_close_cart_time * 6661000);
    }
    $scope.openCartWithAutoClose = function() {
      Cart.pop_cart(g_opt_obj.token, window.currentCart);
      $scope.autoClose();
    }
    $scope.clearAutoClose = function() {
      if ($scope.closeMeAfterTime)
        $timeout.cancel($scope.closeMeAfterTime);
    }
    $scope.createCart = function(cart_object) {
      $scope.hideCart = false;
      $('#shoppable_cart').show()
      cart_object.cart.total = parseFloat(cart_object.cart.total).toFixed(2);
      $scope.cart = cart_object;
      var host = location.protocol + '//' + location.hostname;

      if (window.g_opt_obj.checkout_page) {
        $scope.checkoutUrl = window.g_opt_obj.checkout_page
      } else {
        $scope.checkoutUrl = ShoppableApi.checkoutUrl + '/checkout?cart=' + cart_object.cart.id + '&orderComplete=' + g_opt_obj.order_complete_page + '&campaign=' + g_opt_obj.campaign + '&publisherCheckout=' + host + '&apiToken=' + g_opt_obj.token + '&returnToSite=' + g_opt_obj.page_after_complete_page + '&language=' + window.g_opt_obj.site_language + '&noiframe=' + window.g_opt_obj.no_iframe + '&country=&' + g_linkerParam;
      }
      $scope.viewCartUrl = g_opt_obj.view_cart_page;
      $scope.localizedText = Product.getLocalizedText();
      if (g_opt_obj.show_continue_shopping_button) {
        $scope.continueShopping = true;
      }

    }
  }

  shoppableCartController.$inject = ['$scope', '$http', '$q', '$timeout'];
  shoppableCartModule = _angular.module('shoppableCartModule', ['ngAnimate', 'ngMaterial']).controller('shoppableCartController', shoppableCartController).config(['$mdThemingProvider', function($mdThemingProvider) {
    $mdThemingProvider.generateThemesOnDemand(true);

  }]);


  jQuery(document).ready(function($) {
    window.addEventListener("message", receiveMessage, false);

    function receiveMessage(event) {
      data = event.data.split('|');
      if (data[0] == 'pop_pdp') {
        Product.pop_pdp('upc', data[1], null, null, function(done) {
          console.log('parent pdp popped');
        })
      }
    }
    if (typeof window.outofStockImages === "undefined") {
      window.outofStockImages = false;
    }
    // set global settings variables
    var script_tag = document.getElementById('shoppable_bundle');
    var opt_string = script_tag.getAttribute('options');
    console.log(opt_string);

    var opt_obj = JSON.parse("{" + opt_string + "}");
    console.log("opt_obj: ", opt_obj);
    window.g_opt_obj = opt_obj;

    if (typeof window.g_opt_obj.site_language === "undefined") {
      window.g_opt_obj.site_language = "en_US";
    }

    // this is purely for the demo site
    var demo_url = script_tag.getAttribute('demo_url');
    if (demo_url) {
      window.g_demo_url = encodeURIComponent(demo_url);
      console.log("g_demo_url: ", g_demo_url);
    } else {

      window.g_demo_url = false;
    }

    // set global settings to default if not given
    console.log(g_opt_obj)
    if (g_opt_obj.token === undefined || g_opt_obj.token === "") {
      window.g_opt_obj.token = framesApiToken
    }
    if (g_opt_obj.productsPerRow === undefined || g_opt_obj.productsPerRow === "") {
      window.g_opt_obj.productsPerRow = 5
    }
    if (g_opt_obj.titleColor === undefined || g_opt_obj.titleColor === "") {
      window.g_opt_obj.titleColor = "#000000"
    }
    if (g_opt_obj.subtitleColor === undefined || g_opt_obj.subtitleColor === "") {
      window.g_opt_obj.subtitleColor = "#000000"
    }
    if (g_opt_obj.bodyColor === undefined || g_opt_obj.bodyColor === "") {
      window.g_opt_obj.bodyColor = "#000000"
    }
    if (g_opt_obj.subTextColor === undefined || g_opt_obj.subTextColor === "") {
      window.g_opt_obj.subTextColor = "#adadad"
    }
    if (g_opt_obj.bgColor === undefined || g_opt_obj.bgColor === "") {
      window.g_opt_obj.bgColor = "#252525"
    }
    if (g_opt_obj.bgOpacity === undefined || g_opt_obj.bgOpacity === "") {
      window.g_opt_obj.bgOpacity = ".8"
    }
    if (g_opt_obj.btnColor === undefined || g_opt_obj.btnColor === "") {
      window.g_opt_obj.btnColor = "#000000"
    }
    if (g_opt_obj.btnBorder === undefined || g_opt_obj.btnBorder === "") {
      window.g_opt_obj.btnBorder = "1px solid #dddddd"
    }
    if (g_opt_obj.btnTextColor === undefined || g_opt_obj.btnTextColor === "") {
      window.g_opt_obj.btnTextColor = "#FFFFFF"
    }
    if (g_opt_obj.pdpBgColor === undefined || g_opt_obj.pdpBgColor === "") {
      window.g_opt_obj.pdpBgColor = "#FFFFFF"
    }
    if (g_opt_obj.pdpBorder === undefined || g_opt_obj.pdpBorder === "") {
      window.g_opt_obj.pdpBorder = "1px solid #dddddd"
    }
    if (g_opt_obj.cartBorder === undefined || g_opt_obj.cartBorder === "") {
      window.g_opt_obj.cartBorder = "1px solid #dddddd"
    }
    if (g_opt_obj.cartBorderRadius === undefined || g_opt_obj.cartBorderRadius === "") {
      window.g_opt_obj.cartBorderRadius = "5px 0px 0px 5px"
    }
    if (g_opt_obj.cartBgColor === undefined || g_opt_obj.cartBgColor === "") {
      window.g_opt_obj.cartBgColor = "#FFFFFF"
    }
    if (g_opt_obj.cartLocationX === undefined || g_opt_obj.cartLocationX === "") {
      window.g_opt_obj.cartLocationX = "0px"
    }
    if (g_opt_obj.cartLocationY === undefined || g_opt_obj.cartLocationY === "") {
      window.g_opt_obj.cartLocationY = "0px"
    }
    if (g_opt_obj.cartWidth === undefined || g_opt_obj.cartWidth === "") {
      window.g_opt_obj.cartWidth = "70px"
    }
    if (g_opt_obj.cartHeight === undefined || g_opt_obj.cartHeight === "") {
      window.g_opt_obj.cartHeight = "40px"
    }
    if (g_opt_obj.developerMode === undefined || g_opt_obj.developerMode === "") {
      window.g_opt_obj.developerMode = "false"
    }
    if (g_opt_obj.productGroup === undefined || g_opt_obj.productGroup === "") {
      window.g_opt_obj.productGroup = "merchant"
    }
    if (g_opt_obj.merchantList === undefined || g_opt_obj.merchantList === "") {
      window.g_opt_obj.merchantList = "all"
    }
    if (g_opt_obj.campaign === undefined || g_opt_obj.campaign === "") {
      window.g_opt_obj.campaign = ""
    }
    if (g_opt_obj.site_language === undefined || g_opt_obj.site_language === "") {
      window.g_opt_obj.site_language = "en_us"
    }
    if (g_opt_obj.order_complete_page === undefined || g_opt_obj.order_complete_page === "") {
      window.g_opt_obj.order_complete_page = ""
    }
    if (g_opt_obj.page_after_complete_page === undefined || g_opt_obj.page_after_complete_page === "") {
      window.g_opt_obj.page_after_complete_page = ""
    }
    if (g_opt_obj.return_to_site === undefined || g_opt_obj.return_to_site === "") {
      window.g_opt_obj.return_to_site = ""
    }
    if (g_opt_obj.view_cart_page === undefined || g_opt_obj.view_cart_page === "") {
      window.g_opt_obj.view_cart_page = false
    }
    if (g_opt_obj.show_continue_shopping_button === undefined || g_opt_obj.show_continue_shopping_button === "") {
      window.g_opt_obj.show_continue_shopping_button = false
    }
    if (g_opt_obj.checkout_page === undefined || g_opt_obj.checkout_page === "") {
      window.g_opt_obj.checkout_page = false
    }
    if (g_opt_obj.no_iframe === undefined || g_opt_obj.no_iframe === "") {
      window.g_opt_obj.no_iframe = 0
    }
    if (g_opt_obj.use_egrocers === undefined || g_opt_obj.use_egrocers === "") {
      window.g_opt_obj.use_egrocers = false
    }
    if (g_opt_obj.show_egrocer_checkout_button === undefined || g_opt_obj.show_egrocer_checkout_button === "") {
      window.g_opt_obj.show_egrocer_checkout_button = true
    }
    if (g_opt_obj.egrocer_first === undefined || g_opt_obj.egrocer_first === "") {
      window.g_opt_obj.egrocer_first = false
    }
    if (g_opt_obj.brand_request_name === undefined || g_opt_obj.brand_request_name === "") {
      window.g_opt_obj.brand_request_name = false
    }
    if (g_opt_obj.brand_privacy_policy_link === undefined || g_opt_obj.brand_privacy_policy_link === "") {
      window.g_opt_obj.brand_privacy_policy_link = false
    }
    if (g_opt_obj.show_merchants === undefined || g_opt_obj.show_merchants === "") {
      window.g_opt_obj.show_merchants = false
    }
    if (g_opt_obj.out_of_stock_message === undefined || g_opt_obj.out_of_stock_message === "") {
      window.g_opt_obj.out_of_stock_message = false;
      g_opt_obj.out_of_stock_message = false
    }
    if (g_opt_obj.out_of_stock_button_text === undefined || g_opt_obj.out_of_stock_button_text === "") {
      window.g_opt_obj.out_of_stock_button_text = false
    }
    if (g_opt_obj.out_of_stock_link === undefined || g_opt_obj.out_of_stock_link === "") {
      window.g_opt_obj.out_of_stock_link = "default"
    }
    if (g_opt_obj.cart_tab_id === undefined || g_opt_obj.cart_tab_id === "") {
      window.g_opt_obj.cart_tab_id = "shoppable_magic_v1_cart_tab"
    }
    if (g_opt_obj.egrocer_thank_you_page === undefined || g_opt_obj.egrocer_thank_you_page === "") {
      window.g_opt_obj.egrocer_thank_you_page = false
    }
    if (g_opt_obj.egrocer_checkout_analytics_endpoint === undefined || g_opt_obj.egrocer_checkout_analytics_endpoint === "") {
      window.g_opt_obj.egrocer_checkout_analytics_endpoint = false
    }
    if (g_opt_obj.show_egrocer_in_mini_cart === undefined || g_opt_obj.show_egrocer_in_mini_cart === "") {
      window.g_opt_obj.show_egrocer_in_mini_cart = false
    }
    if (g_opt_obj.continue_shopping_link === undefined || g_opt_obj.continue_shopping_link === "") {
      window.g_opt_obj.continue_shopping_link = false
    }
    if (g_opt_obj.auto_close_cart_time === undefined || g_opt_obj.auto_close_cart_time === '') {
      window.g_opt_obj.auto_close_cart_time = 5
    }
    if (g_opt_obj.cart_tab_parent_id === undefined || g_opt_obj.cart_tab_parent_id === '') {
      window.g_opt_obj.cart_tab_parent_id = false
    }
    if (g_opt_obj.full_edit === undefined || g_opt_obj.full_edit === "") {
      window.g_opt_obj.full_edit = false
    }
    console.log(g_opt_obj);
    // request cart
    var found_cookie = Cart.find_cookie(g_opt_obj.token);
    if (found_cookie) {
      console.log("Existing cart cookie found!");
      //Product.get_and_attach_product_to_links(g_opt_obj.token, found_cookie.cartId);
      window.g_cart_id = found_cookie.cartId

      if (typeof window.g_cart_id == 'undefined' && found_cookie.cart)
        window.g_cart_id = found_cookie.cart.id;

      Cart.get_cart(g_opt_obj.token, window.g_cart_id);
      window.g_cart_id = found_cookie.cartId;
    } else {
      // if no existing cart, create new one then
      console.log("No cookie, making new!");
      Cart.new_cart(g_opt_obj.token);
    }

    // Google analytics
    if (typeof ga == "undefined") {
      console.log("Loading Universal Anaytics");
      (function(i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function() {
          (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
          m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
      })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
    }
    if (ga) {
      var shoppableTracker = 'UA-37095095-2';
      ga('create', shoppableTracker, 'auto', {
        'name': '_shopGa'
      });
      ga('_shopGa.require', 'ec');
      ga('_shopGa.send', 'pageview');

      var linkerParam = "";
      window.g_linkerParam = ''
      ga(function() {
        var trackers = ga.getAll();
        if (trackers.length) {
          linkerParam = trackers[0].get('linkerParam');
          window.g_linkerParam = linkerParam;
        }
      });
    } else {
      window.g_linkerParam = '';
    }
  });

  function ScaleContentToDevice() {

    scroll(0, 0);
    var viewportHeight = $(window).height();
    var content = $("#myPopupDiv:visible");
    var contentMargins = content.outerHeight() - content.height();
    var contentheight = viewportHeight - contentMargins;
    console.log("= 28th changed contentheight: ", contentheight);
    content.height(contentheight * 0.9);
  }

  function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();

    if ("withCredentials" in xhr) {
      // Check if the XMLHttpRequest object has a "withCredentials" property.
      // "withCredentials" only exists on XMLHTTPRequest2 objects.
      xhr.open(method, url, true);
      xhr.setRequestHeader('cid', getCid());
    } else if (typeof XDomainRequest != "undefined") {
      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      xhr = new XDomainRequest();
      xhr.open(method, url);
      xhr.setRequestHeader('cid', getCid());
    } else {
      // Otherwise, CORS is not supported by the browser.
      xhr = null;
    }

    return xhr;
  }

  function fade_and_remove(element, speed) {
    $('body').removeClass('pdp_open');
    $('body').removeClass('shoppable_pdp_open');
    var op = element.style.opacity; // initial opacity
    var timer = setInterval(function() {
      if (op <= 0.05) {
        clearInterval(timer);
        element.parentNode.removeChild(element);
      }
      element.style.opacity = op;
      element.style.filter = 'alpha(opacity=' + op * 100 + ")";
      op -= op * 0.2;
    }, speed);
  }

  function numberWithCommas(number) {
    number = parseFloat(number).toFixed(2);
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }



  var Shared = {
    create_background: function() {
      var pdp_background = document.createElement('div');
      pdp_background.id = "shoppable_magic_v1_pdp_background shoppable_magic_v3_pdp_background";
      pdp_background.className = 'shoppable-lightbox-container';

      return pdp_background;
    },
    create_container: function(newClass, id) {

      var pdp_container = document.createElement('div');
      pdp_container.style.color = g_opt_obj.bodyColor;
      pdp_container.id = id;
      pdp_container.className = newClass;
      return pdp_container;
    }
  };
  // ==========================================================================================
  // ----------- ----------- ----------- ----------- ---------- ------------------
  // PRODUCT OBJECT AND METHODS ----------- ----------- ----------- -------
  // ----------- ----------- ----------- ----------- ---------- ------------------
  // ==========================================================================================

  var currentProduct;
  Product = {
    currentProduct: {},
    get_and_attach_product_to_links: function(framesApiToken, cart_id) {

      if (false) {
        var currentUrl = g_demo_url;
        apiUrl = squireApiCall + currentUrl;
      } else {
        var currentUrl = document.URL;
        apiUrl = squireApiCall + encodeURIComponent(currentUrl);
      }
      console.log(currentUrl);
      console.log(apiUrl);
      var product_xhr = createCORSRequest('GET', apiUrl);
      if (!product_xhr) {
        console.log('CORS not supported');
        return;
      }

      product_xhr.onload = function() {
        var response_text = product_xhr.responseText;
        response_text = JSON.parse(response_text);

        var found_products = response_text.found_products;

        // get unique product list
        var uniq_found_products = {};
        var uniq_found_part_nums = [];
        for (var key in found_products) {
          console.log(key);
          if (uniq_found_part_nums.indexOf(found_products[key].part_number) == -1) {
            uniq_found_part_nums.push(found_products[key].part_number);
            uniq_found_products[key] = found_products[key];
            console.log(uniq_found_part_nums);
          }
        }
        window.g_total_products = uniq_found_part_nums.length;
        window.g_found_products = uniq_found_products;
        console.log(g_total_products);

        var els = document.getElementsByTagName("a");
        for (var i = 0, l = els.length; i < l; i++) {
          var el = els[i];
          // Use closures so loop doesnt always look at the last looped item
          var product = found_products[el.href];
          if (product) {
            // for developer mode
            if (g_opt_obj.developerMode == "true") {
              el.style.color = "red";
              el.style.backgroundColor = "blue";
            }

            var elClone = el.cloneNode(true);
            el.parentNode.replaceChild(elClone, el);

            Product.add_click_handler_to_link(product, elClone, g_opt_obj.token, cart_id);
            elClone.href = "javascript:void(0)";
            elClone.removeAttribute("target");
          }
        }
      };
      product_xhr.onerror = function() {
        console.log('Woops, there was an error making the request.');
      };
      product_xhr.send();
    },

    get_merchant_products: function(idType, id, brand, callback) {


      var currentUrl = document.URL;
      apiUrl = framesApiCall + "/v3/product?" + idType + "=" + id;
      var product_xhr = createCORSRequest('GET', apiUrl);
      product_xhr.setRequestHeader('Authorization', 'Bearer ' + g_opt_obj.token);
      if (!product_xhr) {
        console.log('CORS not supported');
        return;
      }

      product_xhr.onload = function() {
        var response_text = product_xhr.responseText;
        response_text = JSON.parse(response_text);
        callback(response_text, response_text);

      }

      product_xhr.onerror = function() {
        console.log('Woops, there was an error making the request.');
      };


      product_xhr.send();
    },

    add_click_handler_to_link: function(product, link, token, cart_id) {
      link.addEventListener('click', function(e) {
        Product.pop_pdp(product);
        // Product.create_add_to_cart_btn(g_opt_obj.token, cart_id);
      }, false);
    },

    /** simply retrieves a product by id
     **/
    get_product_name_withSize: function(product_object, sku) {
      foundIndex = 0;
      curindex = 0
      for (variance in product_object.variance) {
        if (product_object.variance[variance].sku === sku)
          foundIndex = curindex;
        curindex++;
      }

      if (foundIndex == 0) {
        product_object.fullname = product_object.name;
      } else {
        var size1 = product_object.variance[0].size.trim();
        var size2 = product_object.variance[foundIndex].size.trim();
        product_object.fullname = product_object.name.replace(size1, size2);
      }

      return product_object;

    },
    get_product: function(id, type, callback) {

      apiUrl = framesApiCall + "/v3/product/?" + type + "=" + id;
      console.log(apiUrl);
      var product_xhr = createCORSRequest('GET', apiUrl);
      product_xhr.setRequestHeader('Authorization', 'Bearer ' + g_opt_obj.token);
      if (!product_xhr) {
        console.log('CORS not supported');
        return;
      }

      product_xhr.onload = function() {
        var response_text = product_xhr.responseText;
        response_text = JSON.parse(response_text);
        var found_products = response_text; //.found_products;
        callback(found_products);
      };
      product_xhr.onerror = function() {
        console.log('Woops, there was an error making the request.');
      };
      product_xhr.send();
    },

    update_display: function(clearPrice, product, variance) {
      var select_color_size = document.getElementById('shoppable_magic_select_color_size');
      var selected_sku = select_color_size.options[0].value;
      console.log(selected_sku);
      if (typeof other_products !== 'undefined')
        clearPrice = false;


      var price_container = document.getElementById('shoppable_magic_price_box');
      // append new price
      if (selected_sku != "-1" && !clearPrice) {
        var price_source = '{{#if onSale}}' +
          '<div style="color: red;">SALE: <div class = "price-number" id="price">${{number_to_currency price}}</div></div>' +
          '<div  style="color:' + g_opt_obj.subTextColor + ';font-size: 12px;">ORIGINAL PRICE: <div id="retail_price">${{number_to_currency retail_price}}</div></div>' +
          '{{else}}' +
          '<div class = "label">{{localizedText.unitPrice}}: <div class = "price-number" id="price"> ${{number_to_currency price}}</div></div>' +
          '{{/if}}';
        var price_template = Handlebars.compile(price_source);
        var price_data = product[0].variance[variance];
        var price_result = price_template(price_data);
        price_container.innerHTML = price_result;
        //update the NAME
        var tempName = product[0].name;

        productwithSize = Product.get_product_name_withSize(product[0], product[0].variance[variance].sku);
        document.getElementById('name').innerHTML = product[0].variance[variance].name;



      } else {
        var price_source = '{{#if onSale}}' +
          '<div style="color: red;">SALE: <div class = "price-number" id="price">${{number_to_currency price}}</div><p/></div>' +
          '<div  style="color:' + g_opt_obj.subTextColor + ';font-size: 12px;">ORIGINAL PRICE: <div id="retail_price">${{number_to_currency retail_price}}</div></div>' +
          '{{else}}' +
          '<div class = "label">{{localizedText.unitPrice}}:<div class = "price-number" id="price"> ${{number_to_currency price}} </div></div>' +
          '{{/if}}';


        if (product !== 'amazon') {
          product[0].variance[variance].localizedText = Product.getLocalizedText();
          var price_template = Handlebars.compile(price_source);
          var price_result = price_template(product[0].variance[variance]);
          price_container.innerHTML = price_result;
          document.getElementById('name').innerHTML = product[0].variance[variance].name;
          //  document.getElementById('name').innerHTML = product[0].name;
        } else {
          var price_template = Handlebars.compile(price_source);
          var price_result = price_template({
            localizedText: Product.getLocalizedText()
          });
          price_container.innerHTML = price_result;
          if (selected_sku == -1 && select_color_size.options[1]) {
            selected_sku = select_color_size.options[1].value;
          }
          var product = Product.get_product(selected_sku, function(product) {
            if (window.g_opt_obj.site_language.toUpperCase() == 'es_us' && product[0].description_es != "|") {
              document.getElementById('name').innerHTML = product[0].description_es.split("|")[1].replace(/<(?:.|\n)*?>/gm, '').replace(/&amp;/gm, '&').replace(/&trade;/gm, '™').replace(/&reg;/gm, '®');
              if (merchantProducts[merchantProduct].product_objects[0][0].name_es);
            } else {
              document.getElementById('name').innerHTML = product[0].description.split("|")[1].replace(/<(?:.|\n)*?>/gm, '').replace(/&amp;/gm, '&').replace(/&trade;/gm, '™').replace(/&reg;/gm, '®');
              if (merchantProducts[merchantProduct].product_objects[0][0].name_es);
            }
          });
        }
      }

    },

    getLocalizedText: function() {
      var localizedText = {}
      if (window.g_opt_obj.site_language.toUpperCase() == 'es_us') {
        localizedText.addBundleToBag = 'PDP ';
        localizedText.addToBag = 'AÑADIR A LA CARRITO';
        localizedText.addToEgrocerBag = 'AÑADIR A LA CARRITO';
        localizedText.notAvail = 'Desafortunadamente este artículo no está disponible en ninguna de las tiendas en línea de nuestros socios. Puede comprarlo en Amazon.com haciendo clic abajo.';
        localizedText.shoppingBag = 'Carrito de compra';
        localizedText.continueShopping = 'CONTINÚA COMPRANDO';
        localizedText.retailer = 'Vendedor';
        localizedText.size = 'Tamaño';
        localizedText.qty = 'Cantidad';
        localizedText.unitPrice = 'Precio por unidad';
        localizedText.amazonDirect = 'COMPRE DIRECTO POR AMAZON.COM';
        localizedText.amazonDirect = 'COMPRE DIRECTO POR ';
        localizedText.shoppingBag = 'Su carrito de compra';
        localizedText.items = 'ARTÍCULOS';
        localizedText.subtotal = 'Total';
        localizedText.viewBag = 'VER CARRITO';
        localizedText.product = 'PRODUCTO';
        localizedText.price = 'Precio';
        localizedText.total = 'TOTAL';
        localizedText.checkout = 'TRAMITAR PEDIDO';
        localizedText.selectRetailer = 'Por favor seleccione un proveedor';

        localizedText.selectSize = 'Por favor seleccione un tamaño';
      } else {
        localizedText.addBundleToBag = 'PDP ';
        localizedText.addToBag = 'ADD TO BAG';
        localizedText.addToEgrocerBag = 'ADD TO  CART';
        localizedText.notAvail = 'Unfortunately this product is not available at our other online retailer partners. You may purchase it at Amazon.com by clicking below.';
        localizedText.shoppingBag = 'Shopping Bag';
        localizedText.continueShopping = 'CONTINUE SHOPPING';
        localizedText.retailer = 'Retailer';
        localizedText.size = 'Size';
        localizedText.qty = 'QTY';
        localizedText.selectRetailer = 'please select a retailer';
        localizedText.selectSize = 'please select a size';
        localizedText.unitPrice = 'Subtotal';
        localizedText.amazonDirect = 'BUY DIRECT FROM AMAZON.COM';
        localizedText.directLink = 'BUY DIRECT FROM ';
        localizedText.sdhoppingBag = 'Your Shopping Bag';
        localizedText.items = 'ITEMS';
        localizedText.subtotal = 'Subtotal';
        localizedText.viewBag = 'VIEW BAG';
        localizedText.product = 'PRODUCT';
        localizedText.price = 'Price';
        localizedText.total = 'TOTAL';
        localizedText.checkout = 'CHECKOUT';
      }
      if (g_opt_obj.out_of_stock_message) {
        localizedText.notAvail = g_opt_obj.out_of_stock_message;
      }
      if (g_opt_obj.out_of_stock_button_text) {
        localizedText.amazonDirect = g_opt_obj.out_of_stock_button_text;
      }
      localizedText.brand_request_name = window.g_opt_obj.brand_request_name;
      localizedText.brand_privacy_policy_link = window.g_opt_obj.brand_privacy_policy_link;
      localizedText.amazonLink = function(product) {
        if (g_opt_obj.out_of_stock_link && "default" != g_opt_obj.out_of_stock_link) {
          return g_opt_obj.out_of_stock_link;
        } else {
          return "https://www.amazon.com/s/ref=nb_noss?url=search-alias=aps&field-keywords=" + window.g_current_upc;
        }

      }

      return localizedText;
    },

    openMarketPlace: function(rows, category, brand, retailer, productsPerRow) {

      if ($('#shoppableMarketPlace').length) {
        to_compile = $(Product.marketPlaceLayout());

        $('#shoppableMarketPlace').append(to_compile);
        _angular.bootstrap(to_compile, ["shoppableModule"]);
        var scope = _angular.element(to_compile).scope();

        if (productsPerRow > 0)
          scope.productsPerRow = productsPerRow
        else
          scope.productsPerRow = 4
        if (rows)
          scope.marketPlaceRows = rows * scope.productsPerRow
        else
          scope.marketPlaceRows = scope.productsPerRow * 10
        scope.categorySelection = category;
        scope.brandSelection = brand;
        scope.retailerSelection = retailer;
        scope.createMarketPlace();
        scope.$apply();
      }
    },

    marketPlaceLayout: function() {
      return ('<div class="shoppable-market-place-container"layout=column ng-controller=shoppableController ng-module=shoppable><div class=shoppable-market-place-product-filter-container layout=row><div class=shoppable-market-place-category-filter flex><md-input-container class=shoppable-market-place-category-input-container><label class=shoppable-market-place-category-label>Category</label><md-select class=shoppable-market-place-category-select ng-change=createMarketPlace() ng-model=categorySelection><md-option "background-color:white" class=shoppable-market-place-category-option value="">All</md-option><md-option   class=shoppable-market-place-category-option value={{category.name}} ng-repeat="category in marketPlaceCategories">{{category.name}}</md-option></md-select></md-input-container></div><div class=shoppable-market-place-brand-filter flex><md-input-container class=shoppable-market-place-brand-input-container><label class=shoppable-market-place-brand-label>Brand</label><md-select class=shoppable-market-place-brand-select ng-change=createMarketPlace() ng-model=brandSelection><md-option   class=shoppable-market-place-brand-option value="">All</md-option><md-option   class=shoppable-market-place-category-option value={{brand.name}} ng-repeat="brand in marketPlaceBrands">{{brand.name}}</md-option></md-select></md-input-container></div><div class=shoppable-market-place-retialer-filter flex><md-input-container class=shoppable-market-place-retialer-input-container><label class=shoppable-market-place-retialer-label>Retailer</label><md-select class=shoppable-market-place-retialer-select ng-change=createMarketPlace() ng-model=retailerSelection><md-option   class=shoppable-market-place-retialer-option value="">All</md-option><md-option   class=shoppable-market-place-retialer-option value={{retailer.name}} ng-repeat="retailer in marketPlaceMerchants">{{retailer.name}}</md-option></md-select></md-input-container></div><div class=shoppable-market-place-price-filter flex><md-input-container class=shoppable-market-place-price-input-container><label class=shoppable-market-place-price-label>Price</label><md-select class=shoppable-market-place-price-select ng-change=createMarketPlace() ng-model=priceSelection><md-option   class=shoppable-market-place-price-option value=price>Low to High</md-option><md-option   class=shoppable-market-place-retialer-option value=-price>High to low</md-option></md-select></md-input-container></div></div><div class=shoppable-market-place-product-container layout=row , ,flex-xs=50 flex-gt-md=20 flex-gt-xs=25><div ng-show=updatingMarketPlace class=marketplace-spinner><md-progress-circular layout=row layout-align=space-around md-mode=indeterminate></md-progress-circular></div><div layout=column><div ng-repeat="productsGroups in marketPlaceProductsToShow"ng-hide=updatingMarketPlace><div layout=row flex-100 class="shoppable-row"><div flex ng-repeat="product in productsGroups"><md-card class=shoppable-market-place-container-br layout=column ng-show=product.colors[0].sizes[0].upc><img class=shoppable-market-place-product-image ng-src={{product.image[0]}}><md-card-title class=shoppable-card-title><a class="md-headline shoppable-market-place-product-name"><span ng-click=openProduct(product)>{{product.name}}</span></a>'+
      '</md-card-title><div class=shoppable-market-place-product-price>${{product.price}}</div>' +
        '</div></div></div></div></div></div>')
      // <md-card-actions layout=row layout-align="end center"layout-xs=column class="shoppable-buy-button-container"><md-button class="shoppable-buy-button md-raised" ng-click=openProduct(product)>Buy Now</md-button><a ng-href={{product.url2}} ng-show=product.url2><md-button class=md-raised>Quick View</md-button></a></md-card-actions></md-card>
    },

    openRecipe: function(recipiename, ingredients) {

      var scope = _angular.element(document.getElementById('shoppableRecipieController')).scope();

      to_compile = $(Product.recipeLayout());

      var pdp_background = Shared.create_background();
      var pdp_container = Shared.create_container('shoppable-item-top-container', 'shoppable_pdp_container');
      document.body.appendChild(pdp_background);
      document.body.appendChild(pdp_container);
      $(pdp_container).append(to_compile);
      _angular.bootstrap(to_compile, ["shoppableModule"]);
      var scope = _angular.element(to_compile).scope();
      scope.createRecipie(recipiename, ingredients, pdp_container, pdp_background);
      scope.$apply();

    },

    recipeLayout: function() {
      return ('<div class=shoppable-item-container id=shoppableRecipieController id=myPopupDiv data-role=popup ng-controller=shoppableController ng-module=shoppable><div class=modal-content><div class="modal-header shoppable-ingredinet-header">{{curRecipie}}</div><div class=modal-body class="shoppable-ingredient-list-container"><md-button class=shoppable-item-close-button id=shoppable_magic_v1_pdp_container_x_btn shoppable_magic_v3_pdp_container_x_btn ng-click=closeBag()><span class=shoppable-item-closeButton-X-text>X<br><span class=shoppable-item-closeButton-close-text>CLOSE</span></md-button><md-input-container class="shoppable-ingredient-zipcode-request-container"><label>Enter your zip code to find products avaible in your area</label> <input ng-model=egrocerZip ng-change="checkRecipie(egrocerZip)"></md-input-container><div class=shoppable-ingredients-header>Ingredients</div><div class=shoppable-ingredient-info-container layout=<row ng-repeat="ingredient in ingredients"><div class=shoppable-ingredient-name-container>{{ingredient.name}}</div><div ng-show="searchingForIngredients && !ingredient.searchDone" class="shoppable-ingredient-search"><md-progress-circular layout=row layout-align=space-around md-mode=indeterminate></md-progress-circular></div><div ng-show="ingredient.notFound" class="shoppable-ingredient-not-found">Product Not avaible in your area</div><div ng-show=ingredient.price class="shoppable-ingredient-image-container"><img ng-src="{{ingredient.image}}"></div><div class=shoppable-ingredient-price-container ng-show=ingredient.price>${{ingredient.price}}</div><div class=shoppable-ingredient-qty-container ng-show=ingredient.price><md-select class=shoppable-ingredient-qty-selection-select id=shoppable_magic_select_qty ng-model=ingredient.qty placeholder=Qty><md-option   class=shoppable-item-qty-selection-option value=1>1</md-option><md-option   class=shoppable-item-qty-selection-option value=2>2</md-option><md-option   class=shoppable-item-qty-selection-option value=3>3</md-option><md-option   class=shoppable-item-qty-selection-option value=4>4</md-option><md-option   class=shoppable-item-qty-selection-option value=5>5</md-option><md-option   class=shoppable-item-qty-selection-option value=6>6</md-option><md-option   class=shoppable-item-qty-selection-option value=7>7</md-option><md-option   class=shoppable-item-qty-selection-option value=8>8</md-option><md-option   class=shoppable-item-qty-selection-option value=9>9</md-option><md-option   class=shoppable-item-qty-selection-option value=10>10</md-option><md-option   class=shoppable-item-qty-selection-option value=11>11</md-option><md-option   class=shoppable-item-qty-selection-option value=12>12</md-option></md-select></div><div class=shoppable-ingredient-remove-container ng-show=ingredient.price><mb-button class=shoppable-ingredient-remove-button ng-click="ingredient.price=0">Remove</mb-button></div></div><div class="shoppable-ingredient-add-button-container" ng-show=canCheckout><md-button class=shoppable-ingredient-add-button ng-click=addAllIngredientsToCart()>Add to Cart</md-button></div></div></div></div>')
    },
    findAllProducts: function(products, newProducts, index, length, callback) {
      if (index == length) {
        callback(newProducts)
      } else {
        product = products[index]
        Product.get_merchant_products(product.idType, id, brand, function(merchantProducts, basicInfo) {
          newProducts.push(merchantProducts);
          Product.findAllProducts(products, newProducts, index + 1, length, callback)
        })
      }
    },
    pop_pdp_bundle: function(products) {

      $('body').addClass('pdp_open');



      var scope = _angular.element(document.getElementById('shoppableController')).scope();
      if (scope) {
        scope.createProduct(products);
        scope.$apply();
      } else {
        to_compile = $(Product.productLayout());

        var pdp_background = Shared.create_background();
        var pdp_container = Shared.create_container('shoppable-item-top-container', 'shoppable_pdp_container');
        document.body.appendChild(pdp_background);
        document.body.appendChild(pdp_container);
        $(pdp_container).append(to_compile);
        _angular.bootstrap(to_compile, ["shoppableModule"]);
        var scope = _angular.element(to_compile).scope();
        scope.createProduct(products, pdp_container, pdp_background);
        scope.$apply();
      }

    },
    set_item_qty: function(sku, qty, callback) {
      var pdp_container = Shared.create_container('hide', 'temphiddenItem');
      to_compile = $(Product.productLayout());
      document.body.appendChild(pdp_container);
      $(pdp_container).append(to_compile);
      _angular.bootstrap(to_compile, ["shoppableModule"]);
      var scope = _angular.element(to_compile).scope();

      scope.setItemSku(sku, qty, pdp_container, callback);
      scope.$apply();

    },
    delete_item: function(sku, callback) {
      var pdp_container = Shared.create_container('hide', 'temphiddenItem');
      to_compile = $(Product.productLayout());
      document.body.appendChild(pdp_container);
      $(pdp_container).append(to_compile);
      _angular.bootstrap(to_compile, ["shoppableModule"]);
      var scope = _angular.element(to_compile).scope();
      scope.removeSku(sku, pdp_container, callback);
      scope.$apply();
    },

    productLayout: function() {
      return '<div class="shoppable-item-container {{product.mode}}"ng-show=showmulti id=shoppableController id=myPopupDiv data-role=popup ng-controller=shoppableController ng-module=shoppable><div class=modal-dialog><div class=modal-content><div class=modal-header></div><div class="modal-body shoppable-item-products-container"><div></div><md-button class=shoppable-item-close-button id=shoppable_magic_v1_pdp_container_x_btn ng-click=closeBag() shoppable_magic_v3_pdp_container_x_btn><span class=shoppable-item-closeButton-X-text>X<br><span class=shoppable-item-closeButton-close-text>CLOSE</span></span></md-button><div class=shoppable-item-list-container><div ng-show=showSpinner><md-progress-circular layout=row layout-align=space-around md-mode=indeterminate></md-progress-circular></div><div class="removed-container-{{product.removed}} shoppable-item-info-table"ng-show="product.items.length && !egrocerFirst "ng-repeat="product in products"layout=row ng-class=""><div class=shoppable-item-image-td flex=30><div class=shoppable-item-image-container><img ng-src={{product.current_object().image}} alt=""class=shoppable-item-product-image></div></div><div flex=60 flex-gt-md=50><div layout=column><div><h4 class="removed-{{product.removed}} shoppable-item-product-brand"id=name>{{product.current_object().brand}}</h4></div><div><h3 class="removed-{{product.removed}} shoppable-item-product-name"id=name>{{product.current_object().name}}</h3></div><div><h5 class="removed-{{product.removed}} shoppable-item-product-description"id=name>{{product.current_object().description}}</h5></div></div><div layout=row layout-sm=column><div ng-hide="(product.removed || product.colorGroup)"flex><md-input-container flex><label class=shoppable-item-merchant-group-label>{{localizedText.retailer}}</label><md-select class=shoppable-item-merchant-group-select id=shoppable_magic_select_merchant ng-model=tmpProduct placeholder={{localizedText.retailer}} ng-change=changeMerchant(tmpProduct)><md-option class=shoppable-item-merchant-group-option value={{$index}}-{{$parent.$index}} ng-repeat="merchant in product.merchants">{{merchant.name}}</md-option><md-option class=shoppable-item-merchant-group-option ng-repeat="link in additionalLinks"ng-value=link>{{link.name}}</md-option><md-option ng-repeat="grocer in egrocersList"ng-show="products.length==1"ng-show=useEgrocers ng-value=grocer><img ng-src={{grocer.image}} width=100px></md-option></md-select></md-input-container><div ng-show=product.error id=warning style=width:100%>{{product.error}}</div></div><div ng-hide="(product.removed || !product.colorGroup)"flex><md-input-container class=shoppable-item-color-group-container flex style=width:100%><label class=shoppable-item-color-group-label>Color</label><md-select class=shoppable-item-color-group-select id=shoppable_magic_select_color ng-model=product.currentIndex placeholder=Color ng-change="product.currentVariance=0;product.currentColorVariance=0;product.currentMerchantVariance=0 "flex flex><md-option class=shoppable-item-color-group-option value={{$index}} ng-repeat="color in product.colorlist"><img ng-src={{color.image}} height=30px>{{color.name}}</md-option></md-select></md-input-container></div></div><div class=shoppable-merchant-color-container ng-hide="(product.removed || showExternalLink !=false)"layout-gt-sm=row><div><md-input-container class=shoppable-color-merchant-container flex ng-show=product.colorGroup><label class=shoppable-color-merchant-label>{{localizedText.retailer}}</label><md-select class=shoppable-color-merchant-select id=shoppable_magic_select_merchant_size ng-model=tmpProduct placeholder=Merchant ng-change=changeMerchant(tmpProduct)><md-option class=shoppable-color-merchant-option value={{$index}}-{{$parent.$index}} ng-repeat="merchant in product.current_object().merchants">{{merchant.name}}</md-option><md-option class=shoppable-item-merchant-group-option ng-repeat="link in additionalLinks"ng-value=link>{{link.name}}</md-option><md-option ng-repeat="grocer in egrocersList"ng-show="products.length==1"ng-show=useEgrocers ng-value=grocer><img ng-src={{grocer.image}} width=100px></md-option></md-select></md-input-container></div><div class=shoppable-item-size-selection-td ng-hide=product.colorGroup flex><md-input-container class=shoppable-item-size-selection-container flex><label class=shoppable-item-size-selection-label>Size</label><md-select class=shoppable-item-size-selection-select class=color-size-else id=shoppable_magic_select_color_size ng-model=product.currentVariance placeholder=Size ng-disabled=!mechantSelected><md-option class=shoppable-item-size-selection-option value={{$index}} ng-repeat="item in product.current_object().variances">{{item.size}}</md-option></md-select></md-input-container></div><div class=shoppable-item-qty-selection-td flex><md-input-container class=shoppable-item-qty-selection-continer><label class=shoppable-item-qty-selection-label>QTY</label><md-select class=shoppable-item-qty-selection-select id=shoppable_magic_select_qty ng-model=product.qty placeholder=Qty><md-option class=shoppable-item-qty-selection-option value=1>1</md-option><md-option class=shoppable-item-qty-selection-option value=2>2</md-option><md-option class=shoppable-item-qty-selection-option value=3>3</md-option><md-option class=shoppable-item-qty-selection-option value=4>4</md-option><md-option class=shoppable-item-qty-selection-option value=5>5</md-option><md-option class=shoppable-item-qty-selection-option value=6>6</md-option><md-option class=shoppable-item-qty-selection-option value=7>7</md-option><md-option class=shoppable-item-qty-selection-option value=8>8</md-option><md-option class=shoppable-item-qty-selection-option value=9>9</md-option><md-option class=shoppable-item-qty-selection-option value=10>10</md-option><md-option class=shoppable-item-qty-selection-option value=11>11</md-option><md-option class=shoppable-item-qty-selection-option value=12>12</md-option></md-select></md-input-container></div></div><div layout=row><div class=shoppable-item-price-add-td ng-hide="(showExternalLink!=false)"flex-90><div class="block price-block"ng-hide=product.removed><div class=shoppable-item-price-label>{{localizedText.unitPrice}}:<div class=shoppable-item-price-number ng-hide=egrocerSecond id=price>${{product.current_object().price*product.qty}}</div><div class=shoppable-item-price-number ng-show=egrocerSecond id=price>$<span ng-show=egrocerItem.price>{{egrocerItem.price*product.qty}}</span><span ng-hide=egrocerItem.price>--</span></div></div></div></div><div ng-hide="(products.length > 1 || showExternalLink!=false)"><md-input-container class=shoppable-item-zipcode-container ng-show="egrocerSecond "><label class=shoppable-item-zipcode-label>Enter your ZIP CODE to availabilty check</label><input name=zipcode ng-change=checkEgrocerZip(zipcode) ng-model=zipcode></md-input-container><md-button class="shoppable-item-add-button disabled-{{egrocerAvaible}} shoppable-item-egrocer-add-button"id=shoppable_magic_add_to_cart_btn ng-click=addToEgrocerCart(true,product.qty,product.mode) ng-show="egrocerSecond && !scanningEgrocer"ng-disabled="zipcodeReady || outOfstockAtEgrocer"><span ng-hide=outOfstockAtEgrocer><span ng-hide="( product.mode==\'updateProduct\')">{{localizedText.addToEgrocerBag}}</span><span ng-show="(product.mode==\'updateProduct\')"> Update</span></span><span ng-show=outOfstockAtEgrocer>{{egrocerNotAvailText}}</span></md-button><md-button class=shoppable-item-scanner-button id=shoppable_magic_add_to_cart_btn ng-show="egrocerSecond && scanningEgrocer"><md-progress-circular layout=row layout-align=space-around md-mode=indeterminate></md-progress-circular></md-button><md-button class=shoppable-item-add-button id=shoppable_magic_add_to_cart_btn ng-click=addBundleToBag(true) ng-hide="(product.mode==\'updateProduct\' ) || egrocerSecond ">{{localizedText.addToBag}}</md-button><md-button class=shoppable-item-add-button id=shoppable_magic_update_to_cart_btn ng-click=updateBundleInBag() ng-show="(product.mode==\'updateProduct\' ) && !egrocerSecond ">Update</md-button></div><div ng-show=showExternalLink><a href={{showExternalLink}} target=_blank><md-button class="md-button shoppable-item-add-button">{{localizedText.directLink}} {{externalName}}</md-button></a></div></div></div><div><div class="removed-{{product.removed}} buttonToggle"ng-show=bundlable ng-init="product.removed=false"><button class="md-button shoppable-removeButton"ng-click="product.removed=true"ng-hide=product.removed>remove</button> <button class="md-button shoppable-addButton"ng-click="product.removed=false"ng-show=product.removed>Add</button></div></div></div><div layout=row layout-sm=column><div class=shoppable-egrocer-container ng-show="egrocerFirst || (!products[0].items.length && useEgrocers && !showSpinner)"><div class=shoppable-no-items-avaible ng-hide="(egrocerSecond || products.length>1)"layout=column layout-sm=column><div class=shoppable-egrocer-zip-text ng-hide=(egrocerAvaible)>{{egrocerZipText}}</div><div ng-show=egrocerAvaible><h3 class=shoppable-item-product-name>{{egrocerItem.name}}</h3></div><div layout=row><div flex><md-input-container class=shoppable-item-size-selection-container flex><label class=shoppable-item-size-selection-label>Egrocers</label><md-select class=shoppable-item-qty-selection-select id=shoppable_magic_select_qty ng-model=curEgrocer placeholder=Egrocer><md-option ng-repeat="grocer in egrocersList"ng-show="products.length==1"ng-value=grocer><img ng-src={{grocer.image}} width=100px></md-option></md-select></md-input-container></div><div flex><md-input-container class=shoppable-zipcode-container flex-80><label class=shoppable-item-qty-selection-label>ZIP CODE</label><input name=zipcode ng-change=checkEgrocerZip(zipcode) ng-model=zipcode required></md-input-container></div><div ng-show=scanningEgrocer><md-progress-circular layout=row layout-align=space-around md-mode=indeterminate></md-progress-circular></div></div><div ng-show=egrocerAvaible layout=row layout-sm=column><div class=shoppable-item-size-selection-td flex><md-input-container class=shoppable-item-size-selection-container flex><label class=shoppable-item-size-selection-label>Size</label><md-select class=shoppable-item-size-selection-select class=color-size-else id=shoppable_magic_select_color_size ng-model=egrocerItem.index placeholder=Size ng-disabled=!mechantSelected><md-option class=shoppable-item-size-selection-option value=1>{{egrocerItem.size}}</md-option></md-select></md-input-container></div><div class=shoppable-item-qty-selection-td flex><md-input-container class=shoppable-item-qty-selection-continer><label class=shoppable-item-qty-selection-label>QTY</label><md-select class=shoppable-item-qty-selection-select id=shoppable_magic_select_qty ng-model=product.qty placeholder=Qty><md-option class=shoppable-item-qty-selection-option value=1>1</md-option><md-option class=shoppable-item-qty-selection-option value=2>2</md-option><md-option class=shoppable-item-qty-selection-option value=3>3</md-option><md-option class=shoppable-item-qty-selection-option value=4>4</md-option><md-option class=shoppable-item-qty-selection-option value=5>5</md-option><md-option class=shoppable-item-qty-selection-option value=6>6</md-option><md-option class=shoppable-item-qty-selection-option value=7>7</md-option><md-option class=shoppable-item-qty-selection-option value=8>8</md-option><md-option class=shoppable-item-qty-selection-option value=9>9</md-option><md-option class=shoppable-item-qty-selection-option value=10>10</md-option><md-option class=shoppable-item-qty-selection-option value=11>11</md-option><md-option class=shoppable-item-qty-selection-option value=12>12</md-option></md-select></md-input-container></div><div ng-show=egrocerItem.error id=warning>{{egrocerItem.error}}</div></div></div><div class=shoppable-egrocer-not-avail-text ng-show=egrocerNotAvailText>{{egrocerNotAvailText}}</div><div ng-show=egrocerAvaible layout=column><div class=shoppable-item-price-add-td flex-90><div class="block price-block"ng-hide=product.removed><div class=shoppable-item-price-label>{{localizedText.unitPrice}}:<div class=shoppable-item-price-number id=price>${{egrocerItem.price}}</div></div></div></div><div><md-button class=shoppable-item-add-button id=shoppable_magic_add_to_cart_btn ng-click=addToEgrocerCart(true,product.qty,product.mode) ng-show=egrocerAvaible>{{localizedText.addToEgrocerBag}}</md-button><img height=25px src={{$scope.curEgrocer.image}}></div></div></div></div><div ng-show="products.length>1 && !showExternalLink"><md-input-container class=shoppable-item-zipcode-container ng-show="egrocerSecond "><label class=shoppable-item-zipcode-label>Enter your ZIP CODE to availabilty check</label><input name=zipcode ng-change=checkEgrocerZip(zipcode) ng-model=zipcode></md-input-container><md-button class="shoppable-item-add-button-multi disabled-{{egrocerAvaible}} shoppable-item-egrocer-add-button"id=shoppable_magic_add_to_cart_btn ng-click=addToEgrocerCart(true,product.qty,product.mode) ng-show="egrocerSecond && !scanningEgrocer"ng-disabled="zipcodeReady || outOfstockAtEgrocer"><span ng-hide="(outOfstockAtEgrocer || product.mode==\'updateProduct\')">{{localizedText.addToEgrocerBag}}</span><span ng-show="(!outOfstockAtEgrocer && product.mode==\'updateProduct\')"> Update</span><span ng-show=outOfstockAtEgrocer>{{egrocerZipText}}</span></md-button><md-button class=shoppable-item-scanner-button id=shoppable_magic_add_to_cart_btn ng-show="egrocerSecond && scanningEgrocer"><md-progress-circular layout=row layout-align=space-around md-mode=indeterminate></md-progress-circular></md-button><md-button class=shoppable-item-add-button-multi id=shoppable_magic_add_to_cart_btn ng-click=addBundleToBag(true) ng-hide="(product.mode==\'updateProduct\' ) || egrocerSecond ">{{localizedText.addToBag}}</md-button><md-button class=shoppable-item-add-button-multi id=shoppable_magic_update_to_cart_btn ng-click=updateBundleInBag() ng-show="(product.mode==\'updateProduct\' ) && !egrocerSecond ">Update</md-button></div></div><div class=shoppable-out-of-stock-container ng-show="(!product.items.length && !useEgrocers && !additionalLinks.length)"ng-repeat="product in products">{{localizedText.notAvail}}<p><a href={{localizedText.amazonLink(product)}}><md-button class="md-button shoppable-out-of-stock-button">{{localizedText.amazonDirect}}</md-button></a></div></div></div></div></div>'

    },
    update_langauge: function(langauge, calllback) {
      window.g_opt_obj.site_language = langauge;
      if (callback)
        callback(true);

    },
    pop_pdp: function(idType, id, mode, sku, callback) {
      if (!$('body').hasClass('shoppable_pdp_open')) {
        $('body').addClass('shoppable_pdp_open');
        Cart.get_cart(g_opt_obj.token, window.g_cart_id, false, function() {
          window.g_current_upc = id;
          if (typeof sku == 'undefined')
            sku = ''
          Product.pop_pdp_bundle({
            items: [{
              idType: idType,
              id: id,
              mode: mode,
              callback: callback,
              sku: sku
            }]
          })
        });
      }
    },



    create_add_to_cart_btn: function(token, cart_id, product) {
      var btn = document.getElementById('shoppable_magic_add_to_cart_btn');
      btn.addEventListener('click', function() {
        $("#warningsize").hide();
        $("#warning").hide();
        var select_merchant = document.getElementById('shoppable_magic_select_merchant');
        if (select_merchant.value == -1) {
          $("#warningsize").hide();
          $("#warning").show();
          return;
        }
        var select_color_size = document.getElementById("shoppable_magic_select_color_size");
        var select_qty = document.getElementById("shoppable_magic_select_qty");
        if ((select_color_size.value == -1 || select_qty == -1) && select_merchant.value != 'amazon') {
          $("#warning").hide();
          $("#warningsize").show();
          return;
        }
        //hard code redirect - special circ for external merchant
        var select_merchant = document.getElementById('shoppable_magic_select_merchant');
        var selected_m = select_merchant.options[select_merchant.selectedIndex];
        var variance_number = select_merchant.options[select_merchant.selectedIndex].getAttribute('variance-number');

        var selected_sku = select_color_size.options[select_color_size.selectedIndex].value;


        if (variance_number == 'amazon') {
          Product.get_product(selected_sku, function(doc) {
            obj = {};
            obj.type = 'click';
            obj.value = 'BUY_AT_AMAZON'
            obj.upc = window.g_current_upc; //id;
            // Publisher
            $.Topic('BUY_AT').publish(JSON.stringify(obj));
          });
          return;
        }
        var cumulativeQty = 0;
        var done = false;
        //this should be an add not an update so first get current qty
        Product.get_cart_json(cart_id, function(response) {
          var currentQty = document.getElementById("shoppable_magic_select_qty").value;
          merchants = response.merchants;
          if (merchants) {
            for (i = 0; i < merchants.length; i++) {
              if (done) break;
              products = merchants[i].items;
              for (k = 0; k < products.length; k++) {
                if (products[k].sku == selected_sku) {
                  cumulativeQty = products[k].qty;
                  done = true;
                  break;
                }
              } // for products
            } //for merchants
          } //if merchants
          Product.put_item(selected_sku, g_opt_obj.token, cart_id, parseFloat(cumulativeQty) + parseFloat(currentQty));
          if (document.getElementById('shoppable_pdp_container')) {
            var container = document.getElementById('shoppable_pdp_container');
            fade_and_remove(container, 10);
            //container.parentNode.removeChild(container);
          }
          if (document.getElementById('shoppable_magic_v1_pdp_background')) {
            var background = document.getElementById('shoppable_magic_v1_pdp_background');
            //background.parentNode.removeChild(background);
            fade_and_remove(background, 20);
          }
        });
      });
    },
    get_cart_json: function(cart_id, callback) {
      var apiUrl = framesApiCall + '/v3/cart/' + window.g_cart_id;
      var xhr = createCORSRequest('GET', apiUrl);
      xhr.setRequestHeader('Authorization', 'Bearer ' + g_opt_obj.token);
      if (!xhr) {
        console.log('CORS not supported');
        return;
      }
      xhr.onload = function() {
        console.log("GET CART");
        var response_text = xhr.responseText;
        response_text = JSON.parse(response_text);
        console.log(response_text);
        callback(response_text);
      };
      xhr.send();
    },
    put_item: function(selected_sku, token, cart_id, qty) {
      // http://api.shoppable.com/v1/token/:apiToken/cart/:cartId/put/:sku/qty/:qty/frame/:frameId
      // make API put request


      var apiUrl = framesApiCall + '/v3/cart/' + window.g_cart_id + "/put/" + selected_sku + "/qty/" + qty + "/idLookupType/" + "sku" + "/productId/" + selected_sku;

      var finalizeGotCart = function(new_cart_object) {
        //publish event to Subscribers
        obj = {};
        obj.selected_sku = selected_sku;
        obj.qty_added = qty;
        obj.cart = new_cart_object;
        //obj.qty = qty;
        //obj.totalQty = new_cart_object.cart.qty;
        console.log('Publishing ADD_TO_CART signal, change-234')
        $.Topic('ADD_TO_CART').publish(JSON.stringify(obj));
        console.log('ADD_TO_CART signal successfully sent')
        //Cart.rerender_totals(token, new_cart_object);
        //
        //call cart count callback(new_cart_object.count)
        var cart_object = Cart.get_cart(g_opt_obj.token, cart_id, true);
      }

      var xhr = new createCORSRequest('get', apiUrl); // Use Microsoft XDR

      xhr.setRequestHeader('Authorization', 'Bearer ' + g_opt_obj.token);
      xhr.onload = function() {

        var returnjson = JSON.parse(xhr.responseText);



        finalizeGotCart(returnjson); // internal function
      };

      xhr.onerror = function() {
        _result = false;
      };

      xhr.send();


    },

    get_item: function(sku) {
      // http://localhost:2222/wand/v1/magic/product?part_number=1058-203182-01
      var request_url = squireApiCall2 + 'product?sku=' + sku;
      console.log(request_url);
      var xhr = createCORSRequest('GET', request_url);
      xhr.onload = function() {
        console.log("Get Item");
        console.log(xhr.responseText);
        var response_text = JSON.parse(xhr.responseText);
        product = response_text.found_products;
        console.log(response_text);
        console.log('FOND PROD');
        console.log(product);
        // format other products to be same format as SQUIRE API call's
        for (key in product) {
          if (product.hasOwnProperty(key)) {
            var p_value = product[key]
            Product.pop_pdp(p_value);
            break
          }
        }

      };

      xhr.send();

    },

    change_image: function() {
      // change image on color/size change
    }
  };


  // ==========================================================================================
  // ----------- ----------- ----------- ----------- ---------- ------------------
  // CART OBJECT AND METHODS ----------- ----------- ----------- -------
  // ----------- ----------- ----------- ----------- ---------- ------------------
  // ==========================================================================================

  Cart = {

    new_cart: function(token) {
      var apiUrl = framesApiCall + '/v3/cart';

      var xhr = createCORSRequest('GET', apiUrl);
      xhr.setRequestHeader('Authorization', 'Bearer ' + g_opt_obj.token);
      if (!xhr) {
        console.log('CORS not supported');
        return;
      }
      xhr.onload = function() {
        console.log("CART");
        var response_text = xhr.responseText;
        response_text = JSON.parse(response_text);

        var cart_id = response_text.cart.id;
        window.g_cart_id = cart_id;
        console.log(cart_id);

        // create cookie
        var cookie_data = {};
        cookie_data.cartId = cart_id;
        cookie_data.cartTimestamp = Math.round(new Date().getTime() / 1000);
        cookie_data.cartExpiration = cookie_data.cartTimestamp + (5 * 365 * 24 * 60 * 60);
        var cookie_string = '_cart_' + g_opt_obj.token + "=" + escape(JSON.stringify(cookie_data)) + ";path=/";
        console.log(cookie_string);
        document.cookie = cookie_string;
        // once new cart created, use the new cart_id to add products to links
        Cart.render_cart_tab(g_opt_obj.token, response_text);
        //you deleted this.
        //Product.get_and_attach_product_to_links(g_opt_obj.token, cart_id);
      };
      xhr.send();
    },
    find_cookie: function(token) {
      var name = "_cart_" + g_opt_obj.token + "=";
      var all_cookies = document.cookie.split(';');
      for (var i = 0; i < all_cookies.length; i++) {
        var c = all_cookies[i];
        while (c.charAt(0) == ' ') c = c.substring(1);
        if (c.indexOf(name) != -1) {
          return JSON.parse(unescape(c.substring(name.length, c.length)));
        }
      }
      return "";
    },
    get_current_cart_object: function(token, callback) {
      if (window.currentCart) {
        callback(null, window.currentCart)
      } else {
        callback({
          err: 'no carts found'
        }, '')
      }

    },
    get_cart: function(token, cart_id, pop_cart, callback) {
      if (typeof window.g_cart_id == 'undefined') {
        cartInfo = Cart.find_cookie(g_opt_obj.token)
        window.g_cart_id = cartInfo.cart.id;
      }
      var apiUrl = framesApiCall + '/v3/cart/' + window.g_cart_id + '/withEgrocer';
      var xhr = createCORSRequest('GET', apiUrl);
      xhr.setRequestHeader('Authorization', 'Bearer ' + g_opt_obj.token);
      if (!xhr) {
        console.log('CORS not supported');
        if (callback) {
          callback({
            err: 'CORS not supported'
          }, null);
        }
        return;
      }
      xhr.onload = function() {
        console.log("GET CART");
        var response_text = xhr.responseText;

        response_text = JSON.parse(response_text);
        window.currentCart = response_text;
        console.log(response_text);
        if (pop_cart) {
          // if pop_cart is true, means adding new prod from PDP
          Cart.pop_cart(g_opt_obj.token, response_text);
          Cart.render_cart_tab(g_opt_obj.token, response_text);
          $.Topic('FOUND_CART').publish(JSON.stringify(response_text));
          if (callback) {
            callback(null, response_text);
          }
        } else {
          Cart.render_cart_tab(g_opt_obj.token, response_text);
          $.Topic('FOUND_CART').publish(JSON.stringify(response_text));
          if (callback) {
            callback(null, response_text);
          }
        }
        // sometimes just re render the totals
        Cart.rerender_totals(g_opt_obj.token, response_text);

      };
      xhr.send();
    },

    render_cart_tab: function(token, cart_object) {
      if ($('#' + g_opt_obj.cart_tab_id).length != 0) {

        child = document.getElementById(g_opt_obj.cart_tab_id);
        child.parentNode.removeChild(child);

      }
      var cart_tab = document.createElement('button');
      cart_tab.id = g_opt_obj.cart_tab_id;
      cart_tab.alt = ""
      cart_tab.className = 'md-button shoppable-cart-open-button shoppable-v3'
      cart_tab.style.top = g_opt_obj.cartLocationY;
      cart_tab.style.right = g_opt_obj.cartLocationX;
      cart_tab.style.width = g_opt_obj.cartWidth;

      cart_tab.style.fontSize = "12px";

      cart_tab.style.position = "fixed";


      cart_tab.style.fontFamily = "sans-serif";
      cart_tab.style.verticalAlign = "middle";
      cart_tab.style.cursor = "pointer";
      cart_tab.style.zIndex = "10";

      if (g_opt_obj.cart_tab_parent_id) {
        var cartParent = document.getElementById(g_opt_obj.cart_tab_parent_id);
        cartParent.appendChild(cart_tab);
      } else {
        document.body.appendChild(cart_tab);
      }



      var source =
        '<img style="" class="cart-tab shoppable-v3" id="' + g_opt_obj.cart_tab_id + '_cart_tab_image" alt="" src="">' +
        '<span  class="shoppable-cart-tab-span"  >{{cart.qty}}</span>';
      console.log("render cart!");
      console.log(cart_object);

      var template = Handlebars.compile(source);
      var result = template(cart_object);
      cart_tab.innerHTML = result;
      cart_tab.addEventListener("click", function() {
        Cart.pop_cart(g_opt_obj.token, window.currentCart);
      });
      cart_tab.addEventListener("mouseover", function() {
        Cart.pop_cart(g_opt_obj.token, window.currentCart);
      });
      $.Topic('CART_RENDERED').publish(JSON.stringify(cart_object));

    },

    open_cart: function(callback) {
      Cart.get_cart(g_opt_obj.token, window.g_cart_id, false, function() {
        cart_object = Cart.pop_cart(g_opt_obj.token, window.currentCart);
        if (callback) {

          callback(null, 'done')
        }

      });
    },
    close_cart: function(callback) {
      Cart.get_cart(g_opt_obj.token, window.g_cart_id, false, function() {
        $.Topic('CLOSE_CART').publish('');
        var scope = _angular.element(document.getElementById('shoppableCartController')).scope();
        if (scope) {
          scope.hideCart = true;
          scope.$apply();
        }
        if (callback) {
          callback(null, 'done')
        }
      });
    },
    attach_view_bag: function(target) {
      Cart.get_cart(g_opt_obj.token, window.g_cart_id, false, function() {
        var cart_object = window.currentCart;

        var scope = _angular.element(document.getElementById('shoppable-view-bag-top-container')).scope();
        if (scope) {
          scope.createCart(cart_object);

          scope.$apply();

        } else {
          to_compile = $(Cart.viewBagLayout());
          var pdp_container = Shared.create_container('shoppable-view-bag-top-container', 'shoppable_view_bag');
          document.body.appendChild(pdp_container);
          $(pdp_container).append(to_compile);
          _angular.bootstrap(to_compile, ["shoppableCartModule"]);
          var scope = _angular.element(to_compile).scope();
          scope.cart = cart_object;
          $.Topic('ADD_TO_CART').subscribe(function() {
            Cart.get_cart(g_opt_obj.token, window.g_cart_id, false, function() {
              scope.cart = window.currentCart;
              scope.$apply();
            });
          })
          scope.$apply();
          $(".shoppable-view-bag-top-container").appendTo(target);
        }
      });
    },
    pop_cart: function(token, cart_object) {
      Cart.get_cart(g_opt_obj.token, window.g_cart_id, false, function() {

        $('body').addClass('pdp_open');

        $.Topic('OPEN_CART').publish(JSON.stringify(cart_object));
        var scope = _angular.element(document.getElementById('shoppableCartController')).scope();
        if (scope) {
          $(pdp_container).append(to_compile);
          scope.createCart(cart_object);
          scope.full_edit = window.g_opt_obj.full_edit;
          scope.$apply();

        } else {
          to_compile = $(Cart.cartLayout());


          var pdp_container = Shared.create_container('shoppable-cart-top-container', 'shoppable_cart');
          cart_object.pdp_container = pdp_container;
          document.body.appendChild(pdp_container);
          $(pdp_container).append(to_compile);
          _angular.bootstrap(to_compile, ["shoppableCartModule"]);
          var scope = _angular.element(to_compile).scope();
          scope.pdp_container = pdp_container;
          scope.full_edit = window.g_opt_obj.full_edit;
          scope.createCart(cart_object);
          if (g_opt_obj.auto_close_cart_time) {
            scope.autoClose()
          }
          scope.$apply();

        }
      });
    },
    openEmailRequest: function() {
      $.Topic('OPEN_EGROCER').publish();
      $('body').addClass('pdp_open');
      var scope = _angular.element(document.getElementById('shoppableEmailController')).scope();
      if (scope) {
        scope.openEmailRequest();
        scope.$apply();

      } else {
        to_compile = $(Cart.emailRequestLayout());

        var pdp_background = Shared.create_background();
        var pdp_container = Shared.create_container('shoppable-email-top-container', 'shoppable_pdp_container');
        document.body.appendChild(pdp_background);
        document.body.appendChild(pdp_container);
        $(pdp_container).append(to_compile);
        _angular.bootstrap(to_compile, ["shoppableModule"]);
        var scope = _angular.element(to_compile).scope();
        scope.openEmailRequest(pdp_container, pdp_background);
        scope.$apply();
      }
    },

    viewBagLayout: function() {
      return ('<div class=shoppable-view-bag-container id=shoppable-view-bag ng-controller=shoppableCartController ng-module=shoppable><div class=shoppable-checkout-view-bag-info-container flex layout=column ng-show="(cart.cart || cart.cart.qty > 0)"><div class=shoppable-checkout-view-bag-header-container flex layout=row><div class=shoppable-checkout-view-bag-info-your-cart-text flex=33 flex-offset=33>Your Cart({{cart.cart.qty}})</div></div><div class=shoppable-view-bag-items-container-cover><div class="shoppable-view-bag-items-container-main non-egrocer-container"layout=column ng-repeat="merchant in cart.merchants"ng-hide="merchant.id ==\'egrocer\'"><div layout=row><div class=shoppable-view-bag-item-retailer-header>{{merchant.name}}</div><div class=shoppable-view-bag-spend-more>{{spendMore(merchant)}}</div></div><div class=shoppable-view-bag-items-container-sub layout=row ng-repeat="item in merchant.items"><div class=shoppable-view-bag-items-image-container flex=10><img class=shoppable-view-bag-items-image height=50px ng-src={{item.images[0]}}></div><div class=shoppable-view-bag-item-details-container flex=50 layout=column><div flex><h3 class=shoppable-view-bag-item-name>{{item.name}}</h3></div><div layout=row><div class=shoppable-view-bag-item-merchant-name flex=30>{{merchant.name}}</div><div class=shoppable-view-bag-item-item-size flex=15>{{item.size}}</div><div class=shoppable-view-bag-item-item-price flex=15>{{fixPrice(item.price)}}</div></div><div layout=row><div class=shoppable-view-bag-item-merchant-name flex=30><md-button ng-click=editSku(item.upc,item.sku)>Edit</md-button></div><div class=shoppable-view-bag-item-item-size flex=15><md-button ng-click=removeSku(item.sku)>Remove</md-button></div></div></div><div class=shoppable-view-bag-items-qty-container flex=25><md-input-container class=shoppable-view-bag-items-input-qty-container><label class=shoppable-view-bag-items-qty-label>QTY</label><md-select class=shoppable-checkout-items-qty-select md-disable-backdrop="true" ng-change=setQty(item) ng-model=item.qty placeholder=Qty><md-option   class=shoppable-view-bag-items-qty-option value=1>1</md-option><md-option   class=shoppable-view-bag-items-qty-option value=2>2</md-option><md-option   class=shoppable-view-bag-items-qty-option value=3>3</md-option><md-option   class=shoppable-view-bag-items-qty-option value=4>4</md-option><md-option   class=shoppable-view-bag-items-qty-option value=5>5</md-option><md-option   class=shoppable-view-bag-items-qty-option value=6>6</md-option><md-option   class=shoppable-view-bag-items-qty-option value=7>7</md-option><md-option   class=shoppable-view-bag-items-qty-option value=8>8</md-option><md-option   class=shoppable-view-bag-items-qty-option value=9>9</md-option><md-option   class=shoppable-view-bag-items-qty-option value=10>10</md-option><md-option   class=shoppable-view-bag-items-qty-option value=11>11</md-option><md-option   class=shoppable-view-bag-items-qty-option value=12>12</md-option></md-select></md-input-container></div><div class=shoppable-view-bag-items-total flex=15>{{fixPrice(item.price*item.qty)}}</div></div></div><div class=shoppable-view-bag-totals-container layout=column ng-show="hasNonEgrocer()"><div class=shoppable-view-bag-shipping-container layout=row><div class=shoppable-view-bag-shipping-name flex=80>Shipping Charges</div><div class=shoppable-view-bag-shipping-price flex>{{fixPrice(cart.cart.shipping_total)}}</div></div><div class=shoppable-view-bag-shipping-container layout=row><div class=shoppable-view-bag-total-name flex=80>Total</div><div class=shoppable-view-bag-total-price flex>{{fixPrice(getTotalMinusEgrocer(cart.merchants))}}</div></div></div><div class=shoppable-view-bag-egrocer-non-egrocer-divider></div><div class=shoppable-view-bag-checkout-button-container flex-offset=80><md-button ng-click=openCheckoutPage() class=shoppable-view-bag-checkout-button>Checkout</md-button></div><div class="shoppable-view-bag-items-container-main egrocer-container"layout=column ng-repeat="merchant in cart.merchants"ng-show="merchant.id ==\'egrocer\'"><div layout=row><div class=shoppable-view-bag-item-retailer-header>{{merchant.name}}</div><div class=shoppable-view-bag-spend-more>{{spendMore(merchant)}}</div></div><div class=shoppable-view-bag-items-container-sub layout=row ng-repeat="item in merchant.items"><div class=shoppable-view-bag-items-image-container flex=10><img class=shoppable-view-bag-items-image height=50px ng-src={{item.images[0]}}></div><div class=shoppable-view-bag-item-details-container flex=50 layout=column><div flex><h3 class=shoppable-view-bag-item-name>{{item.name}}</h3></div><div layout=row><div class=shoppable-view-bag-item-merchant-name flex=10>{{merchant.name}}</div><div class=shoppable-view-bag-item-item-size flex=15>{{item.size}}</div><div class=shoppable-view-bag-item-item-price flex=15>{{fixPrice(item.price)}}</div></div><div layout=row><div class=shoppable-view-bag-item-merchant-name flex=20><md-button ng-click=editSku(item.upc,item.sku)>Edit</md-button></div><div class=shoppable-view-bag-item-item-size flex=15><md-button ng-click=removeSku(item.sku)>Remove</md-button></div></div></div><div class=shoppable-view-bag-items-qty-container flex=25><md-input-container class=shoppable-view-bag-items-input-qty-container><label class=shoppable-view-bag-items-qty-label>QTY</label><md-select class=shoppable-checkout-items-qty-select md-disable-backdrop="true" ng-change=setQty(item) ng-model=item.qty placeholder=Qty><md-option   class=shoppable-view-bag-items-qty-option value=1>1</md-option><md-option   class=shoppable-view-bag-items-qty-option value=2>2</md-option><md-option   class=shoppable-view-bag-items-qty-option value=3>3</md-option><md-option   class=shoppable-view-bag-items-qty-option value=4>4</md-option><md-option   class=shoppable-view-bag-items-qty-option value=5>5</md-option><md-option   class=shoppable-view-bag-items-qty-option value=6>6</md-option><md-option   class=shoppable-view-bag-items-qty-option value=7>7</md-option><md-option   class=shoppable-view-bag-items-qty-option value=8>8</md-option><md-option   class=shoppable-view-bag-items-qty-option value=9>9</md-option><md-option   class=shoppable-view-bag-items-qty-option value=10>10</md-option><md-option   class=shoppable-view-bag-items-qty-option value=11>11</md-option><md-option   class=shoppable-view-bag-items-qty-option value=12>12</md-option></md-select></md-input-container></div><div class=shoppable-view-bag-items-total flex=15>{{fixPrice(item.price)}}</div></div></div><div class=shoppable-view-bag-totals-container layout=column ng-show="hasEgrocer()"><div class=shoppable-view-bag-shipping-container layout=row><div class=shoppable-view-bag-shipping-name flex=80>Shipping Charges</div><div class=shoppable-view-bag-shipping-price flex> See shipping price at egrocer</div></div><div class=shoppable-view-bag-shipping-container layout=row><div class=shoppable-view-bag-total-name flex=80>Total</div><div class=shoppable-view-bag-total-price flex>{{fixPrice(getTotalMiniusCart(cart.merchants))}}</div></div></div><div class=shoppable-view-bag-checkout-button-container flex-offset=80><md-button ng-click=openEmailRequest() ng-show="(hasEgrocer() &&show_egrocer_checkout_button)" class=shoppable-view-bag-checkout-button>EGrocer Checkout</md-button></div></div></div><div class=shoppable-view-bag-empty ng-hide="(cart.cart ||cart.cart.qty==0)">Your bag is empty</div></div>');
    },
    cartLayout: function() {
      return ('<div ng-module="shoppableCartModule" ng-mouseleave="autoClose()" ng-mouseenter="clearAutoClose()" id ="shoppableCartController" ng-controller="shoppableCartController" ng-hide="hideCart" class="shoppable-checkout-container" layout="column"> ' +
        '<div  layout="row" class="shoppable-checkout-cart-info-container">' +
        // '<div class="shoppable-checkout-cart-info-your-cart-text" flex="33">Your Cart </div>' +
        '<div class="shoppable-checkout-cart-info-items-text" flex="33"> Your Bag({{cart.cart.qty}}) </div>' +

        '<md-button class="shoppable-checkout-cart-info-close-button" ng-click="closeCart()" id="shoppable_magic_v1_pdp_container_close_btn" >' +
        '<span class="shoppable-checkout-cart-info-close-button-x-text">X</span><br/></md-button>' +
        '</div>' +
        '<div class="shoppable-checkout-items-container-cover">' +

        '<div ng-repeat="merchant in cart.merchants" layout="column" class="shoppable-checkout-items-container-main"> ' +
        '<div class="shoppable-checkout-item-retailer-header">{{merchant.name}}<span class="shoppable-checkout-spend-more"> {{spendMore(merchant)}}</span></div>' +
        '<div ng-repeat="item in merchant.items" layout="column" class="shoppable-checkout-items-container-sub"><div layout="row"> ' +

        '<div flex="25" class="shoppable-checkout-items-image-container"><img class="shoppable-checkout-items-image" ng-src=\'{{item.images[0]}}\'></div>' +
        '<div flex="50" layout="column" class="shoppable-checkout-items-container">' +
        '<div > <h3 class="shoppable-checkout-items-brand">{{item.brand}} </h3> </div>' +
        '<div > <h2 class="shoppable-checkout-items-name">{{item.name}} </h2></div>' +
        '<div  ng-show="isntNA(item.color)"><h3 class="shoppable-checkout-items-color">{{item.color}} </h3></div><div  > ' +
        '<div  class="shoppable-checkout-items-size" ng-show="isntNA(item.size)">Size: <h3 class="shoppable-checkout-items-size">{{item.size}} </h3></div><div  ng-show="full_edit" > Qty: {{item.qty}}' +
        '</div><div  ng-hide="full_edit"> ' +
        '<md-input-container class="shoppable-checkout-items-qty-container"><label class="shoppable-checkout-items-qty-label">QTY</label><md-select  placeholder="Qty" id="" class="shoppable-checkout-items-qty-select"  ng-model="item.qty" ng-change="setQty(item)" >   ' +
        ' <md-option   class="shoppable-checkout-items-qty-option" value="1">1</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="2">2</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="3">3</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="4">4</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="5">5</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="6">6</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="7">7</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="8">8</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="9">9</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="10">10</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="11">11</md-option> ' +
        '<md-option   class="shoppable-checkout-items-qty-option" value="12">12</md-option> ' +

        '</md-select></md-input-container></div></div></div>' +
        '<div  layout="column" class="shoppable-checkout-price-remove-container"><div > </div>' +
        '<div  class="shoppable-checkout-items-price">  ${{fixPrice(item.price*item.qty)}}</div>' + '<div  ng-hide="full_edit"  class="shoppable-checkout-items-remove-container"> <md-button class="shoppable-checkout-items-remove-button" class="cartItemRemoveButton" ng-click="removeSku(item.sku)"> Remove item</md-button>' + '</div></div></div><div ng-show="full_edit" layout="row" class="shoppable-checkout-edit-remove-item-container">' +
        '<div   class="shoppable-checkout-items-edit-container"> <md-button class="shoppable-checkout-items-edit-button" class="cartItemRemoveButton" ng-click="editSku(item.upc,item.sku);closeCart()"> Edit item</md-button></div>' +
        '<div   class="shoppable-checkout-items-remove-container"> <md-button class="shoppable-checkout-items-remove-button" class="cartItemRemoveButton" ng-click="removeSku(item.sku)"> Remove item</md-button></div>' +

        '</div></div></div></div><div ng-show="continueShopping"><md-button ng-click="closeCart()">{{localizedText.continueShopping}}</md-button></div><div flex layout="column" class="shoppable-checkout-cart-info-total-container">'+
        // '<div class="shoppable-checkout-cart-info-sub-total-text"  flex> <span class="shoppable-checkout-cart-info-sub-total-text-label">  Subtotal:</span> '+
        // '<span class="shoppable-checkout-cart-info-sub-total-value">${{fixPrice(cart.cart.subtotal)}}</span></div>'+
        '<div class="shoppable-checkout-cart-info-shipping-total-text"  flex> <span class="shoppable-checkout-cart-info-shipping-total-text-label">Shipping Charges: </span><span class="shoppable-checkout-cart-info-shipping-total-text-value">${{fixPrice(cart.cart.shipping_total)}}</span></div><div class="shoppable-checkout-cart-info-total-text"  flex> <span class="shoppable-checkout-cart-info-total-text-label">Total: </span> <span class="shoppable-checkout-cart-info-total-text-value">${{fixPrice(cart.cart.total)}}</span></div><div class="shoppable-checkout-taxes-and-shipping-label"> Taxes and shipping will be calculated at checkout</div></div><div class="shoppable-checkout-view-buttons-container"> <a ng-href="{{checkoutUrl}}" class="shoppable-checkout-href" >  <md-button class="shoppable-checkout-button" ng-show="hasNonEgrocer()">Check Out</md-button></a></div></div></div>');
    },
    get_checkout_url: function() {
      if (typeof window.g_cart_id == 'undefined') {
        cartInfo = Cart.find_cookie(g_opt_obj.token)
        window.g_cart_id = cartInfo.cart.id;
      }
      if (g_opt_obj.page_after_complete_page == '' && g_opt_obj.return_to_site !== '') {
        g_opt_obj.page_after_complete_page = g_opt_obj.return_to_site;
      }
      var host = location.protocol + '//' + location.hostname;
      var checkoutUrl = ShoppableApi.checkoutUrl + '/checkout?cart=' + window.g_cart_id + '&orderComplete=' + g_opt_obj.order_complete_page + '&campaign=' + g_opt_obj.campaign + '&publisherCheckout=' + host + '&apiToken=' + g_opt_obj.token + '&returnToSite=' + g_opt_obj.page_after_complete_page + '&language=' + window.g_opt_obj.site_language + '&noiframe=' + window.g_opt_obj.no_iframe + '&country=&' + g_linkerParam;

      return checkoutUrl;
    },
    rerender_totals: function(token, cart_object) {
      if (document.getElementById('shoppable_magic_v1_pdp_container') && document.getElementById('shoppable_magic_v1_totals_container')) {
        var totals_container = document.getElementById('shoppable_magic_v1_totals_container');
        var source = '<p style="margin:5px; font-size:12px;">Subtotal: ${{number_to_currency cart.subtotal}}</p>' +
          '<p style="margin:5px; font-size:12px;">Shipping: ${{number_to_currency cart.shipping_total}}</p>' +
          '<p style="margin:5px; font-size:16px;">Total: ${{number_to_currency cart.total}}</p>';
        var template = Handlebars.compile(source);
        var result = template(cart_object);
        totals_container.innerHTML = result;
      }
    }
  };
})(angular);
