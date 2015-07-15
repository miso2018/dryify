//---------------------------------------------------------------------------
// @license
// dryify 0.1.0 (Custom Build) <https://github.com/brilliantmichael/dryify/>
// Copyright 2015 Michael Isidro
// Available under ISC license <http://opensource.org/licenses/ISC>
//---------------------------------------------------------------------------
;
(function() {

  "use strict";

  var self = this; // equivalent to @window in the browser
  var olderDryify = self.dryify;

  function dryify() {

    //-------------------------------------------------------------------------
    // Takes a single argument - a function - and converts it into the same
    // function that can take the arguments in the form of an 'options' object
    //
    // Required
    // --------
    // @fn  function - the function to convert into an equivalent function that
    //      accepts a single options object instead of arguments
    //-------------------------------------------------------------------------
    this.optionify = function(fn) {

      // http://stackoverflow.com/a/9924463
      var fnStr =
        fn.toString();//.replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');

      var fnArgs = fnStr
        .slice(
          fnStr.indexOf('(') + 1,
          fnStr.indexOf(')')
        )
        .match(/([^\s,]+)/g) || [];

      var fnPrepend = "";

      if (typeof fn !== 'function') {
        throw Error(
          "@fn must take a function argument. Type is [" + (typeof fn) + "]"
        );
      }

      for (var i = 0; i < fnArgs.length; i++) {
        fnPrepend += "var " + fnArgs[i] + "=opts['" + fnArgs[i] + "'];";
      }

      return new Function(
        'opts',
        fnPrepend + fnStr.slice(fnStr.indexOf("{") + 1, fnStr.lastIndexOf("}"))
      );
    };

    //-------------------------------------------------------------------------
    // Allows the elegant retrieval of a JSON value using a starting reference,
    // an evaluated string, and a configurable return value or behaviour when
    // not found.
    //
    // Saves you from the repition of 'if... exists...' LOC.
    //
    // Required
    // --------
    // @startingReference object - the referenced JS object
    // @jsonPath          string - a string that evaluates to a path deep into
    //                    the object, saving you from having to check if it
    //                    exists at each step of the path.
    //
    //                    The convention uses strings like:
    //                    "[3].key1[2].key2"
    //                    "key1.key2[1]"
    //                     etc...
    //
    // Optional
    // --------
    // @ifNull            [any type, function] - if the path is not found,
    //                    returns this if not a function, or if a function,
    //                    calls the function
    //-------------------------------------------------------------------------
    this.getval = function(startingReference, jsonPath, ifNull) {

      function notFound(ifNull) {
        if (typeof ifNull !== 'function') {
          return ifNull || null; // prevent empty errors being thrown upstream
        } else {
          return ifNull();
        }
      }

      // Ripped from lodash
      function compact(array) {
        var index = -1,
          length = array ? array.length : 0,
          resIndex = -1,
          result = [];

        while (++index < length) {
          var value = array[index];
          if (value) {
            result[++resIndex] = value;
          }
        }
        return result;
      }

      // Make dryify.optionify compatible
      if (typeof opts === 'object') {
        startingReference = opts.startingReference;
        jsonPath = opts.jsonPath;
        ifNull = opts.ifNull;
      }

      if (typeof jsonPath === 'string') {
        if (jsonPath) {
          jsonPath = jsonPath.split(/[\]\.]+|\[|\]/g);
        } else {
          jsonPath = [];
        }
      } else {
        console.log(opts);
        throw Error(
          "@jsonPath must be a string. Type is [" + (typeof jsonPath) + "]"
        );
      }

      jsonPath = compact(jsonPath);

      if (!startingReference) {
        return notFound(ifNull);
      }
      // This loop has to ascend
      for (var i = 0; i < jsonPath.length; i++) {
        if (
          //typeof startingReference === 'undefined' ||
          !startingReference ||
          typeof startingReference[jsonPath[i]] === 'undefined' ||
          typeof startingReference[jsonPath[i]] === null
        ) {
          return notFound(ifNull);
        } else {
          startingReference = startingReference[
            typeof jsonPath[i] === 'string' ?
            jsonPath[i] : parseInt(jsonPath[i])
          ];
        }
      }

      return startingReference;

    };

    //-------------------------------------------------------------------------
    // Provide the option for compatability with older versions of this module
    // http://www.richardrodger.com/2013/09/27/how-to-make-simple-node-js-modules-work-in-the-browser/
    //-------------------------------------------------------------------------
    this.noConflict = function() {

      self.dryify = olderDryify;

      return dryify;
    };
  }

  //---------------------------------------------------------------------------
  // Export the module / assign to @this context
  //---------------------------------------------------------------------------
  //
  // node
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = new dryify();
    }
    exports.dryify = new dryify();
  } else {
    // browser
    self.dryify = new dryify();
  }

}.call(this)); // Calls the window object in the browser