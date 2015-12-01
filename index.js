// Assign Error to a variable local to this module in case it gets overridden later on
var Error = global.Error;

// Object Shortcuts
var defineProperty = Object.defineProperty;
var defineProperties = Object.defineProperties;
var setPrototypeOf = Object.setPrototypeOf;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var keys = Object.keys;

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

function BaseError(message, context, constructor) {
  if (message) this.message = message;

  constructor.last = this;
  constructor.thrown++;

  var stackTraceLimit = Error.stackTraceLimit;
  context = context || constructor;

  try {
    Error.stackTraceLimit = constructor.stackTraceLimit;
    constructor.captureStackTrace(this, context);
  }
  finally {
    Error.stackTraceLimit = stackTraceLimit;
  }

  return this;
}

/*
 The following calls are all valid: (Square brackets denote optional arguments)
   extend()
   extend(name, [prototype])
   extend(prototype, [name]) // if typeof(prototype) === "object" then `name` is ignored

 All arguments after the second argument are completely ignored
 */
function extend(name, prototype) {
  // i.e. `Constructor.extend()` in which case `Super === Constructor`
  var Super = this, argType = typeof(name);

  // See `ExtendedError` declaration/definition at the bottom of this scope
  setPrototypeOf(ExtendedError.prototype, Super.prototype);
  setPrototypeOf(ExtendedError, Super);

  // `ExtendedError` own properties
  defineProperties(ExtendedError, ownProps);

  // arguments overloading
  if (argType === 'string') {
    ExtendedError.prototype.name = name;

    if (arguments.length >= 2) {
      // if two or more arguments then assume `prototype` is typeof "object"
      // `assign` will throw on non-object
      assign(ExtendedError.prototype, prototype);
    }
  }
  else if (argType === 'object') {
    // If name is typeof "object" then assume name is `prototype`
    assign(ExtendedError.prototype, name);
  }

  // `ExtendedError.name === ExtendedError.prototype.name`, note: `ExtendedError.name` becomes immutable
  defineProperty(ExtendedError, 'name', { value: ExtendedError.prototype.name });

  // var example = new Instance(); console.log(example.constructor === ExtendedError); // true
  function Instance(){}
  Instance.prototype = ExtendedError.prototype;

  // Return the newly created Constructor function
  return ExtendedError;

  // The `ExtendedError` declaration will be hoisted to the top of this scope at runtime
  function ExtendedError(message, context) {
    if (this instanceof Error) {
      if (!(this instanceof ExtendedError)) {
        // Attempt to transform the error into an instanceof ExtendedError
        if (!hasOwnProperty.call(this, 'constructor') || delete this.constructor) {
          defineProperty(this, 'constructor', { configurable: true, writable: true, value: ExtendedError });
        }
        else { // Attempt normal assignment
          this.constructor = ExtendedError;
        }
        setPrototypeOf(this, ExtendedError.prototype);
      }
      else {
        return BaseError.call(this, message, context, this.constructor);
      }
    }

    return BaseError.call(new Instance(), message, context, ExtendedError);
  }
}

/* ----------------
   Helper functions
   ---------------- */

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
function assign(target) {
  slice.call(arguments, 1).forEach(source => {
    defineProperties(target, keys(source).reduce((descriptors, key) => {
      descriptors[key] = getOwnPropertyDescriptor(source, key);
      return descriptors;
    }, {}));
  });

  return target;
}
