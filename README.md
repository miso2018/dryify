# Dryify.js
A utility module to reduce your LOC by abstracting the most repeated sequences into single function calls.

Dryify is installable via:

- [npm](https://www.npmjs.com/): `npm install dryify --save`

Dryify provides a few functions that attempt to abstract the most common
patterns for retrieving, changing and passing in JSON objects.

## Documentation

### Changing functions

* [`optionify`](#optionify)

### Working with JSON objects

* [`getval`](#getval)
* [`setval`](#setval)
* [`traverse`](#traverse)

## Changing functions

---------------------------------------

<a name="optionify" />
### optionify(fn, [orderedParamNames])

Takes a single argument, a function, and returns a wrapper of the same function
that can take the arguments in the form of an 'options' object.

This is a case of 'changing the function to suit the data' (usually the data is
changed to suit the function). The returned function can potentially be cached
for later use. This also allows the possibility of eliminating some of the
steps required to massage data to fit a method, and improves readability of the
supplied arguments.

Uses regex to extract the argument names if they are not explicitly supplied.

__Arguments__

* `fn`                (function) the function to convert into an equivalent
                      function that accepts a single options object instead of
                      multiple parameter arguments
* `orderedParamNames` (*Optional*  array) an array of strings specifying the
                      names (and ordering) of acceptable keys as parameters.
                      Usually used if a function has been minified and the
                      options object keys don't match the real parameter names,
                      in which case we rely on ordering

__Examples__


```js
dryify.optionify( parseInt, ['string'] )({ string: "13579" })
// Evaluates to 13579 (integer)
```

```js
var optionifiedFn = dryify.optionify(
  function simpleFn(arg1, arg2, arg3) {
    return (arg1 || "") + (arg2 || "") + (arg3 || "");
  },
  ['mapper1', 'mapper2', 'mapper3']
);

optionifiedFn({
  mapper3: "world",
  mapper1: "hello, "
})
// Evaluates to "hello, world"
```

---------------------------------------

## Working with JSON objects

---------------------------------------

<a name="getval" />
### getval(startingReference, jsonPath, [ifNull])

Allows the elegant retrieval of a JSON value using a starting reference, an
evaluated string, and a configurable return value or behaviour when not found.

Saves you from the repitition of multiple levels of 'if... exists...'

__Arguments__

* `startingReference` (object) the referenced JS object
* `jsonPath`          (string) a string that evaluates to a path deep into the
                      object, saving you from having to check if it exists at
                      each step of the path.

                      The convention uses strings like:

```js
  "[3].key1[2].key2"
  "key1.key2[1]"
```

                      etc...

* `ifNull`  (*Optional* [any type, function]) if the path is not found, returns
            this if not a function, or if a function, calls the function

__Examples__


```js
dryify.getval(
  {
    // deep object
  },
  "[1].key1[0].key2[0].key3[0].foo"
)
// Evaluates to the value of @foo
```

---------------------------------------

<a name="setval" />
### setval(startingReference, jsonPath, value, [ifPathNotFound])

Allows the elegant setting of a JSON value using a starting reference, an
evaluated string, and configurable behaviour when not found.

Saves you from the repitition of multiple levels of 'if... exists...'

__Arguments__

* `startingReference` (object) the referenced JS object
* `jsonPath`          (string) a string that evaluates to a path deep into the
                      object, saving you from having to check if it exists at
                      each step of the path.

                      The convention uses strings like:

```js
  "[3].key1[2].key2"
  "key1.key2[1]"
```

                      etc...

* `value`             ([any]) the value to assign
* `ifPathNotFound`    (*Optional* [boolean, function]) defaults to false. If
                      the path or part of the path is not found, should the
                      path be created automatically.

                      If a function is passed, this function is executed with
                      the @startingReference and @value arguments passed in.

__Examples__


```js
dryify.setval( [object], "[1].key1[0].key2[0].key3[0].foo", 13579, true)
// @object (path) => .foo === 13579
```

```js
dryify.setval(
  [], // the starting object
  "[2].key1[0]", // path
  "foovalue", // the value to assign
  // the function to execute if the path does not exist at some point
  function(
    startingReference, // the starting object from before
    value // the value desired
  ) {

    // perform some arbitrary operations here

    return startingReference; // what to return up the chain
  }
)
```

---------------------------------------

<a name="traverse" />
### traverse(json, callback)

Traverses an entire JSON object hierarchically, iterating over every key and
value referentially.

__Arguments__

* `json`      (object) the JSON to traverse
* `callback`  (function) a function that passes in the value and index of the
              traversal as the arguments (v, i). The callback function must
              return the passed-in value or else it will be assigned as
              undefined.

__Examples__


```js
dryify.traverse(json, function(v, i) {

  // Your changes here

  return v; // the value to assign
});
```

---------------------------------------

<a name="noConflict" />
### noConflict()

Changes the value of `dryify` back to its original value, returning a reference
to the `dryify` object.