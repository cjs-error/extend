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

throw CustomError('message' /* optional context */)
throw OpenError('ENOENT: no such file or directory, open ./non-existant/').
  with('ENOENT', -2, './non-existant/')
```

## Context
Example: `Error(message, context)`

Context is an optional argument that can be passed to `Error.captureStackTrace`. The context is handled automatically when inheriting from an _extended error constructor_ even by means other than `extend`. However if you wish to investigate then read about the [constructorOpt from the v8 wiki ](https://github.com/v8/v8/wiki/Stack%20Trace%20API#stack-trace-collection-for-custom-exceptions)

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

// One last thing about using the ".call" of an extended error constructor
var error = Error()
var sameError = error
var sameInheritanceChain = Object.getPrototypeOf(error)

if (error instanceof Error && !(error instanceof MyError)) {
  // Then the result of Error.call will be that "error" becomes an instanceof MyError
  MyError.call(error, message, context)
  
  console.log(error.constructor === MyError) // true
  console.log(error instanceof MyError) // true
  console.log(error instanceof Error) // true
  console.log(error === sameError) // true
  console.log(Object.getPrototypeOf(error) === sameInheritanceChain) // false
}
```

## License
[The MIT License (MIT)](../master/LICENSE)
* Copyright (c) 2015 [Rodney Teal](mailto:rodneyd.teal@gmail.com?subject=Regarding cjs-error)
