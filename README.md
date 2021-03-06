# Error.extend()
Comprehensive and powerful node.js Error API for creating custom errors and stack traces

## Install
* `npm install --save @cjs-error/extend`
* _Without npm_: `git clone https://github.com/cjs-error/extend.git`
* [Download Zip](https://github.com/cjs-error/extend/zipball/master) | [Latest Release](https://github.com/cjs-error/extend/releases/latest)

## API
* `Error.extend(name)`
* `Error.extend(name, prototype)`
* `Error.extend(prototype)`
* `Error.extend(constructor)`
* `Error.extend(constructor, name)`
* `Error.extend(constructor, name, prototype)`
* `Error.extend(constructor, prototype)`

## Usage
```js
var Error = require('@cjs-error/extend')

// With name
var CustomError = Error.extend('CustomError')

// With name and prototype
var SystemError = Error.extend('SystemError', {
  with: function (code, errno, path) {
    this.code = code;
    this.errno = errno;
    this.path = path;
    return this;
  }
});

// With prototype
var OpenError = SystemError.extend({ name: 'OpenError', syscall: 'open' });

throw CustomError('message' /* optional constructorOpt */)
throw OpenError('ENOENT: no such file or directory, open ./non-existant/').
  with('ENOENT', -2, './non-existant/')
  
// With a custom constructor
function MyError(message) {
    return Error.call(this, message, MyError);
}

Error.extend(MyError);

throw MyError('message');
```

## constructorOpt
Example: `Error.call(error, message, constructorOpt)`

The constructorOpt is an optional argument that may be passed to `Error.captureStackTrace` which might be needed if subclassing _extended error constructor_ by means other than `extend`. If you wish to learn more then read about the [constructorOpt from the v8 wiki ](https://github.com/v8/v8/wiki/Stack%20Trace%20API#stack-trace-collection-for-custom-exceptions)

Note: _extended error constructor_ is the constructor returned from `require('@cjs-error/extend')` or `Error.extend`

## Details
_***Details are better written in code***_ :point_down:
```js
// The constructor returned from "extend" is a new function that inherits from its Super in two ways
Object.setPrototypeOf(ExtendedError, Super)
Object.setPrototypeOf(ExtendedError.prototype, Super.prototype)

// The constructor has the following additional own non-enumerable properties
ExtendedError.extend; // method
ExtendedError.thrown; // constructor specific error count
ExtendedError.last; // the last error constructed

// stackTraceLimit is inherited and each constructor may have its own stackTraceLimit
ExtendedError.stackTraceLimit = Infinity;
// Now all errors that inherit from ExtendedError will an infinite stack trace
// unless they have set their own stackTraceLimit
console.log(global.Error.stackTraceLimit === ExtendedError.stackTraceLimit) // false

// The enumerable properties of a prototype object passed to "extend" will be copied by descriptor
var prototype = { name: 'OptionalName' }
Object.defineProperty(prototype, 'prop', {
  get() {
    return 'my-prop';
  }
});

// The following invokes the property getter
var MyError = ExtendedError.extend(prototype)
console.log(MyError().prop) // my-prop

// The ".call" of an extended error constructor
var error = Error()
var sameError = error
var sameInheritanceChain = Object.getPrototypeOf(error)

if (error instanceof Error && !(error instanceof MyError)) {
  // Then the result of Error.call will be that "error" becomes an instanceof MyError
  MyError.call(error, message, ctorOpt)
  
  console.log(error.constructor === MyError) // true
  console.log(error instanceof MyError) // true
  console.log(error instanceof Error) // true
  console.log(error === sameError) // true
  console.log(Object.getPrototypeOf(error) === sameInheritanceChain) // false
}

// About Error.extend(constructor, name, prototype)
function test(message) {
    // Use "return" to support calling test without the "new" keyword
    return ExtendedError.call(this, message, test);
}

Error.extend(test);

console.log(test.last) // null
console.log(test.thrown) // 0
console.log(test.name) // "Error"
console.log(typeof(test.extend)) // "function"
console.log(test.prototype instanceof ExtendedError) // true
console.log(test.prototype instanceof Error) // true
console.log(test() instanceof test) // true
console.log((new test()) instanceof test) // true
console.log(test.prototype.name) // "Error"

Error.extend(test, 'TestError');

console.log(test.name) // "TestError"
console.log(test.prototype.name) // "TestError"
```

## License
[The MIT License (MIT)](../master/LICENSE)
* Copyright (c) 2015 [Rodney Teal](mailto:cjs.error@gmail.com?subject=Regarding cjs-error/extend)
