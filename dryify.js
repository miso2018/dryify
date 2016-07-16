//---------------------------------------------------------------------------
// @license
// dryify 0.1.0 (Custom Build) <https://github.com/brilliantmichael/dryify/>
// Copyright 2015 Michael Isidro
// Available under ISC license <http://opensource.org/licenses/ISC>
//---------------------------------------------------------------------------
(function() {

  "use strict";

  var self = this; // equivalent to @window in the browser
  var olderDryify = self.dryify;
  var dryify = (function() {

    // http://stackoverflow.com/a/8580611
    function Dryify() {
      if (arguments.length) {
        throw new Error('Dryify expects a call to a method');
      }
    }

    // Private methods

    //-----------------------------------------------------------------------
    // Ripped from lodash
    //
    // Required
    // --------
    // @array - array - an array to remove falsy elements from
    //-----------------------------------------------------------------------
    function _compact(array) {

      var index = -1;
      var length = array ? array.length : 0;
      var resIndex = -1;
      var result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result[++resIndex] = value;
        }
      }
      return result;
    };

    //-----------------------------------------------------------------------
    // Extracts @fn's parameter names as strings in an array
    //
    // Required
    // --------
    // @fn - function - the function to get the parameter names from
    //-----------------------------------------------------------------------
    function _getFunctionParameterNames(fn) {

      // http://stackoverflow.com/a/9924463
      var fnStr = fn.toString();

      return fnStr
        .slice(
          fnStr.indexOf("(") + 1,
          fnStr.indexOf(")")
        )
        .match(/([^\s,]+)/g) || [];
    };

    //-----------------------------------------------------------------------
    // Translates a JSON path string into an array of key references
    // Used internally by @getval, @setval
    //
    // Required
    // --------
    // @jsonPath - string - the path string
    //                      The convention uses strings like:
    //                      "[3].key1[2].key2"
    //                      "key1.key2[1]"
    //                      etc...
    //-----------------------------------------------------------------------
    function _interpretJsonPath(jsonPath) {

      if (typeof jsonPath === 'string') {
        if (jsonPath) {

          jsonPath = _compact(jsonPath.split(/[\]\.]+|\[|\]/g));

          for (
            var i = 0, path; i < jsonPath.length; i++
          ) {

            path = jsonPath[i];

            if (!isNaN(path)) {
              path = parseInt(path);
            }
          }
        } else {
          jsonPath = [];
        }
      } else {
        throw Error(
          "@jsonPath must be a string. Type is [" + (typeof jsonPath) + "]"
        );
      }

      return jsonPath;
    };

    //-------------------------------------------------------------------------
    //
    // "The prototype mechanism is used for inheritance. It also conserves
    // memory"
    // http://javascript.crockford.com/private.html
    //
    // Takes a single argument - a function - and converts it into the same
    // function that can take the arguments in the form of an 'options' object
    //
    // Required
    // --------
    // @fn - function - the function to convert into an equivalent function
    //                  that accepts a single options object instead of
    //                  multiple parameter arguments
    //
    // Optional
    // --------
    // @orderedParamNames - array - an array of strings specifying the names
    //                              (and ordering) of acceptable keys as
    //                              parameters. Usually used if a function has
    //                              been minified and the options object keys
    //                              don't match the real parameter names, in
    //                              which case we rely on ordering
    //-------------------------------------------------------------------------
    Dryify.prototype.optionify = function(fn, orderedParamNames) {

      var self = this; // Whatever calls this function will serve as @this

      if (typeof fn !== 'function') {
        throw Error(
          "@fn must take a function argument. Type is [" + (typeof fn) + "]"
        );
      }

      return function(options) {

        // In the case where the function has been minified and the parameter
        // names differ from the original keys used in the options object,
        // you can no longer obtain the argument values without providing the
        // @orderParamNames array

        var argsToApply = [];
        var opnLength;

        if (!(orderedParamNames instanceof Array)) {
          // Only use regex to get the param names if they have not been
          // supplied
          orderedParamNames = _getFunctionParameterNames(fn);
        }

        opnLength = orderedParamNames.length;

        // Keys can possibly be iterated in any order. In the event the names
        // don't match, we assume the ordering provided in @orderParamNames
        // maps to the parameters required in the function

        while (opnLength--) {
          argsToApply[opnLength] = options[orderedParamNames[opnLength]];
        }

        return fn.apply(
          self, // pass the outer context provided as @this into the function
          argsToApply
        );
      };
    };

    //-------------------------------------------------------------------------
    // Allows the elegant retrieval of a JSON value using a starting reference,
    // an evaluated string, and a configurable return value or behaviour when
    // not found.
    //
    // Saves you from the repitition of multiple levels of 'if... exists...'
    //
    // Required
    // --------
    // @startingReference - object  - the referenced JS object
    // @jsonPath          - string  - a string that evaluates to a path deep
    //                                into the object, saving you from having
    //                                to check if it exists at each step of the
    //                                path.
    //
    //                                The convention uses strings like:
    //                                "[3].key1[2].key2"
    //                                "key1.key2[1]"
    //                                etc...
    //
    // Optional
    // --------
    // @ifNull            - [any type, function] - if the path is not found,
    //                    returns this if not a function, or if a function,
    //                    calls the function
    //-------------------------------------------------------------------------
    Dryify.prototype.getval = function(startingReference, jsonPath, ifNull) {

      function notFound(ifNull) {
        if (typeof ifNull !== 'function') {
          return ifNull || null; // prevent empty errors being thrown upstream
        } else {
          return ifNull();
        }
      }

      jsonPath = _interpretJsonPath(jsonPath);

      if (!startingReference) {
        return notFound(ifNull);
      }
      // This loop has to ascend
      for (
        var i = 0, path; i < jsonPath.length; i++
      ) {

        path = jsonPath[i];

        if (!startingReference ||
          typeof startingReference[path] === 'undefined' ||
          typeof startingReference[path] === null
        ) {
          return notFound(ifNull);
        } else {
          startingReference = startingReference[path];
        }
      }

      return startingReference;

    };

    //-------------------------------------------------------------------------
    // Allows the elegant setting of a JSON value using a starting reference,
    // an evaluated string, and a configurable return value or behaviour when
    // not found.
    //
    // Saves you from the repitition of multiple levels of 'if... exists...'
    //
    // Required
    // --------
    // @startingReference - object  - the referenced JS object
    // @jsonPath          - string  - a string that evaluates to a path deep
    //                                into the object, saving you from having
    //                                to check if it exists at each step of the
    //                                path.
    //
    //                                The convention uses strings like:
    //                                "[3].key1[2].key2"
    //                                "key1.key2[1]"
    //                                etc...
    //
    // @value             - [any]   - the value to assign
    //
    // Optional
    // --------
    // @ifPathNotFound    - [boolean, function] - defaults to false. If the 
    //                                path or part of the path is not found,
    //                                should the path be created automatically.
    //
    //                                If a function is passed, this function
    //                                is executed with the @startingReference
    //                                and @value arguments passed in.
    //-------------------------------------------------------------------------
    Dryify.prototype.setval = function(startingReference, jsonPath, value, ifPathNotFound) {

      var currentReference = startingReference;

      if (
        typeof currentReference !== 'object' || typeof jsonPath !== 'string'
      ) {
        throw Error("@setval missing some mandatory arguments");
      }

      jsonPath = _interpretJsonPath(jsonPath);

      // This loop has to ascend
      for (
        var i = 0, loopKey, loopKeyPlus; i < jsonPath.length; i++
      ) {

        // DRY.
        loopKey = jsonPath[i];
        loopKeyPlus = jsonPath[i + 1];

        // If it doesn't exist
        if (typeof currentReference[loopKey] === 'undefined') {

          if (ifPathNotFound === true) {

            if (typeof loopKeyPlus !== 'undefined') {
              if (typeof loopKeyPlus === 'string') {
                // create an object
                currentReference[loopKey] = {};
              } else {
                // create an Array
                currentReference[loopKey] = [];
              }
              // Switch in the currentReference
              currentReference = currentReference[loopKey];
            } else {
              currentReference[loopKey] = value;
            }

          } else if (typeof ifPathNotFound === 'function') {
            return ifPathNotFound(startingReference, value);
          } else {
            break;
          }


        } else {
          // If it exists

          // Switch in the currentReference
          currentReference = currentReference[loopKey];
        }
      }

      return startingReference;
    };

    //-------------------------------------------------------------------------
    // Traverses an entire JSON object hierarchically, iterating over every key
    // and value referentially.
    //
    // Required
    // --------
    // @json      - object    - the JSON to traverse
    // @callback  - function  - a function that passes in the value and
    //                          index of the traversal as the arguments (v, i).
    //-------------------------------------------------------------------------
    Dryify.prototype.traverse = function(json, callback) {

      function iter(o) {
        var counter = 0;
        for (var k in o) {
          if (typeof(o[k]) !== 'function') {
            // No longer mandatory to pass back value (passed back by default)
            o[k] = callback(o[k], counter++) || o[k];
            if (!!o[k] && typeof(o[k]) === 'object') {
              iter(o[k]);
            }
          }
        }
        return o;
      }

      return iter(json);
    };

    dryify = new Dryify();
    dryify.Dryify = Dryify; // make constructor available

    //-------------------------------------------------------------------------
    // Export the module / assign to @this context
    //-------------------------------------------------------------------------
    //
    // node
    if (typeof exports !== 'undefined') {

      if (typeof module !== 'undefined' && module.exports) {
        exports = module.exports = dryify;
      }

      exports.dryify = dryify;

    } else {
      // browser
      self.dryify = dryify;
    }

    return dryify;

  }());

  //-------------------------------------------------------------------------
  // Provide the option for compatability with older versions of this module
  // http://www.richardrodger.com/2013/09/27/how-to-make-simple-node-js-modules-work-in-the-browser/
  //-------------------------------------------------------------------------
  dryify.noConflict = function() {
    self.dryify = olderDryify; // publish older version
    return dryify; // allow chaining
  };

}.call(this)); // Calls the window object in the browser