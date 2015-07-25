//-----------------------------------------------------------------------------
// Allows the elegant retrieval of a JSON value using a starting reference,
// an evaluated string, and a configurable return value or behaviour when not
// found.
//
// Saves you from the repition of 'if... exists...' LOC.
//-----------------------------------------------------------------------------
;
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
  var dryify = require('../dryify.min.js') || require('../dryify.js');

  describe("dryify.getval(startingReference, jsonPath, ifNull)", function() {

    // fixture data
    var randomNum = Math.random();
    // test an array
    var testArr = [{
      key0: true
    }, {
      key1: [{
        key2: [{
          key3: [{
            key4: randomNum,
            key5: false
          }]
        }]
      }]
    }];
    // test an object
    var testObj = {
      key1: {
        key2: [{
          key3: [{
            key4: randomNum,
            key5: false
          }]
        }]
      }
    };


    it(
      "should return @startingReference itself if @jsonPath is empty",
      function() {

        assert.deepEqual(
          dryify.getval({}, ""),
          {}
        );

        assert.deepEqual(
          dryify.getval(testArr, ""),
          testArr
        );

        assert.deepEqual(
          dryify.getval(testObj, ""),
          testObj
        );
      }
    );

    it(
      "should return null by default if @jsonPath is not found",
      function() {

        assert.equal(
          dryify.getval({}, "key1"),
          null
        );

        assert.equal(
          dryify.getval({
            key0: true
          }, "key1"),
          null
        );
      }
    );

    it(
      "should return the correct random number if @startingReference is empty",
      function() {

        assert.equal(
          dryify.getval(testArr, "[1].key1[0].key2[0].key3[0].key4"),
          randomNum
        );

        assert.equal(
          dryify.getval(testObj, "key1.key2[0].key3[0].key4"),
          randomNum
        );
      }
    );

    it(
      "should execute the passed function if the reference is absent",
      function() {

        assert.equal(
          dryify.getval(
            testArr,
            "[1].key1[0].key2[0].key3[0].foobar",
            function() {
              return randomNum;
            }
          ),
          randomNum
        );

        assert.equal(
          dryify.getval(
            testObj,
            "key1.key2[0].key3[0].foobar",
            function() {
              return randomNum;
            }
          ),
          randomNum
        );
      }
    );

  });

}.call(this));