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

  describe("dryify.setval(startingReference, jsonPath, value, ifPathNotFound)", function() {

    // fixture data
    var randomNum = Math.random();

    it(
      "should assign the correct value to an empty destination (autocreate on)",
      function() {

        var emptyToPopulatedObj = dryify.setval({},
          "key0[2].key1[0]",
          randomNum,
          true
        );
        var objWithNumberAsKey = dryify.setval({},
          "[1][2].key1[0]",
          randomNum,
          true
        );
        var emptyToPopulatedArr = dryify.setval(
          [],
          "[2].key1[0]",
          randomNum,
          true
        );

        assert.equal(emptyToPopulatedObj.key0[2].key1[0], randomNum);
        assert.equal(objWithNumberAsKey[1][2].key1[0], randomNum);
        assert.equal(emptyToPopulatedArr[2].key1[0], randomNum);
      }
    );

    it(
      "should execute callback if path doesn't exist (autocreate cb)",
      function() {

        var emptyToPopulatedObj = {};
        var objWithNumberAsKey = [];
        var emptyToPopulatedArr = [];


        var emptyToPopulatedObjResult = dryify.setval(
          emptyToPopulatedObj,
          "key0[2].key1[0]",
          randomNum,
          function(startingReference, value) {
            return startingReference;
          }
        );
        var objWithNumberAsKeyResult = dryify.setval(
          objWithNumberAsKey,
          "[1][2].key1[0]",
          randomNum,
          function(startingReference, value) {
            return startingReference;
          }
        );
        var emptyToPopulatedArrResult = dryify.setval(
          emptyToPopulatedArr,
          "[2].key1[0]",
          randomNum,
          function(startingReference, value) {
            return startingReference;
          }
        );

        assert.equal(emptyToPopulatedObj, emptyToPopulatedObjResult);
        assert.equal(objWithNumberAsKey, objWithNumberAsKeyResult);
        assert.equal(emptyToPopulatedArr, emptyToPopulatedArrResult);
      }
    );

    describe("pre-populated objects should not have their existing values overwritten", function() {

      var startingObjPopulated;
      var startingArrPopulated;

      beforeEach(function() {

        startingObjPopulated = {
          key0: [{
            key2: [{
              key3: {}
            }]
          }],
          key1: randomNum
        };
        startingArrPopulated = [{
          key0: [{
            key2: [{
              key3: {}
            }]
          }],
          key1: randomNum
        }];

      });

      it(
        "should assign the correct value to a populated destination (autocreate on)",
        function() {

          startingObjPopulated = dryify.setval(
            startingObjPopulated,
            "key0[0].key2[0].key3.foobar",
            randomNum,
            true
          );
          startingArrPopulated = dryify.setval(
            startingArrPopulated,
            "[0].key0[0].key2[0].key3.foobar",
            randomNum,
            true
          );

          // Preserved root level object
          assert.equal(startingObjPopulated.key1, randomNum);
          assert.equal(startingArrPopulated[0].key1, randomNum);

          // New assignment
          assert.equal(startingObjPopulated.key0[0].key2[0].key3.foobar, randomNum);
          assert.equal(startingArrPopulated[0].key0[0].key2[0].key3.foobar, randomNum);
        }
      );
    });

  });

}.call(this));