var assign = require('@cjs-error/utils');

// Assign Error to a variable local to this module in case it gets overridden later on
var Error = global.Error;

// Object Shortcuts
var defineProperty = Object.defineProperty;
var defineProperties = Object.defineProperties;
var setPrototypeOf = Object.setPrototypeOf;
var create = Object.create;

// Array Shortcuts
var slice = Array.prototype.slice;

// ExtendedError constructor's own properties
var ownProps = {
  thrown: {
    configurable: true,
    writable: true,
    value: 0
  },
  last: {
    configurable: true,
    writable: true,
    value: null
  }
};

// Inherit from builtin Error's prototype and constructor
setPrototypeOf(BaseError.prototype, Error.prototype);
setPrototypeOf(BaseError, Error);

// Single addition to the prototype for identifying instances
defineProperty(BaseError.prototype, 'isCustom', { value: true });

// Give the BaseError class the `extend` method
defineProperty(BaseError, 'extend', { configurable: true, writable: true, value: extend });

// Export the custom Error class
module.exports = BaseError.extend('Error');

function BaseError(message, constructor) {
  if (message) this.message = message;

  constructor.last = this;
  constructor.thrown++;

  if (constructor.stackTraceLimit) {
    var stackTraceLimit = Error.stackTraceLimit;

    try {
      Error.stackTraceLimit = constructor.stackTraceLimit;
      Error.captureStackTrace(this, constructor);
    }
    finally {
      Error.stackTraceLimit = stackTraceLimit;
    }
  }
  else {
    Error.captureStackTrace(this, constructor);
  }

  return this;
}

function getExtendedError() {
  return function ExtendedError(message, constructor) {
    var error = this;
    if (error instanceof Error) {
      if (error instanceof ExtendedError) {
        // new ExtendedError(...)
        constructor = constructor || error.constructor
      }
      else {
        // ExtendedError.call(...)
        constructor = constructor || ExtendedError;
        // Attempt to transform the error into an instanceof constructor
        if (delete error.constructor) {
          defineProperty(error, 'constructor', {
            configurable: true,
            writable: true,
            value: constructor
          });
        }
        else { // Attempt normal assignment
          error.constructor = constructor
        }
        setPrototypeOf(error, constructor.prototype);
      }
    }
    else {
      // ExtendedError(...) without `new`
      constructor = constructor || ExtendedError;
      error = create(constructor.prototype);
    }

    return BaseError.call(error, message, constructor);
  };
}

/*
 The following calls are all valid: (Square brackets denote optional arguments)
   // These calls return a new extended error function
   extend()
   extend(name, [prototype])
   extend(prototype, [name]) // if typeof(prototype) === "object" then `name` is ignored

   // The following calls return the given constructor argument
   extend(constructor, [name, prototype])
   extend(constructor, [name])
   extend(constructor, [prototype])

 All arguments after the second argument are completely ignored
 unless arguments[0] is typeof "function"
 */
function extend(name, prototype) {
  // i.e. `Constructor.extend()` in which case `Super === Constructor`
  var Super = this, constructor, argType = typeof(name), args = arguments;

  // If the first argument is typeof "function" then shift the arguments by 1
  if (argType === 'function') {
    constructor = name;
    args = slice.call(arguments, 1);
    argType = typeof(args[0]);
  }
  else {
    constructor = getExtendedError();
  }

  // Inherit from Super's constructor and prototype
  setPrototypeOf(constructor.prototype, Super.prototype);
  setPrototypeOf(constructor, Super);

  // extended error constructor's own properties
  defineProperties(constructor, ownProps);

  // arguments overloading
  if (argType === 'string') {
    if (typeof(args[1]) === 'object') {
      // if `prototype` is typeof "object"
      assign(constructor.prototype, args[1]);
    }

    constructor.prototype.name = args[0];
  }
  else if (argType === 'object') {
    // If name is typeof "object" then assume name is `prototype`
    assign(constructor.prototype, args[0]);
  }

  // `ExtendedError.name === ExtendedError.prototype.name`, note: `ExtendedError.name` becomes immutable
  defineProperty(constructor, 'name', { value: constructor.prototype.name });

  // Return the extended error constructor
  return constructor;
}
