//-----------------------------------------------------------------------------
// Takes a single argument - a function - and converts it into the same
// function that can take the arguments in the form of an 'options' object
//-----------------------------------------------------------------------------
(function() {

  "use strict";

  //---------------------------------------------------------------------------
  // native node libraries
  //---------------------------------------------------------------------------
  var assert = require('assert');

  //---------------------------------------------------------------------------
  // npm libraries
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // lib
  //---------------------------------------------------------------------------
  var dryify = require('../dryify.min.js');

  describe("dryify.optionify(fn, orderedParamNames)", function() {

    var testFn = function(
      boolean_,
      null_,
      undefined_,
      number_,
      string_,
      object_
    ) {
      return [
        typeof boolean_,
        typeof null_,
        typeof undefined_,
        typeof number_,
        typeof string_,
        typeof object_
      ];
    };

    it("should work with native functions", function() {
      assert.equal(
        dryify.optionify(parseInt, ['string'])({
          string: "13579"
        }),
        13579
      );
    });

    it("should work with unordered options and undefined arguments", function() {

      function simpleFn(arg1, arg2, arg3) {
        return (arg1 || "") + (arg2 || "") + (arg3 || "");
      }

      assert.equal(
        dryify.optionify(simpleFn, ['mapper1', 'mapper2', 'mapper3'])({
          mapper3: "world",
          mapper1: "hello, "
        }),
        "hello, world"
      );
    });

    it(
      "should evaluate an options object to the same result as the original arguments",
      function() {

        assert.deepEqual(
          dryify.optionify(testFn)({
            boolean_: false,
            null_: null,
            undefined_: undefined,
            number_: 0,
            string_: "",
            object_: {}
          }), [
            "boolean",
            "object",
            "undefined",
            "number",
            "string",
            "object"
          ]
        );
      }
    );

    it(
      "should be able to optionify other dryify methods despite minification",
      function() {

        assert.deepEqual(

          dryify.optionify(
            dryify.getval, [
              'startingReference',
              'jsonPath'
            ]
          )({
            startingReference: {
              foo: "bar"
            },
            jsonPath: "foo"
          }),

          "bar"
        );
      }
    );



  });

}.call(this));