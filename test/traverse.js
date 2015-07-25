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

  describe("dryify.traverse(json, callback)", function() {

    it("should pass in the non-function values of a JSON object in expected order", function() {

      // fixture data
      var json = [{
        key0: [{
          key2: [{
            key3: false
          }]
        }],
        key1: false
      }];

      dryify.traverse(json, function(v, i) {
        if (v === false) {
          v = i;
        }

        return v;
      });

      assert.equal(json[0].key0[0].key2[0].key3, 0);
      assert.equal(json[0].key1, 1);

    });

  });

}.call(this));