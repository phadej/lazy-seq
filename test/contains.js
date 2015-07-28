/* global describe:true */
"use strict";

var lazyseq = require("../index.js");
var jsc = require("jsverify");
var _ = require("underscore");

describe("contains", function () {
  jsc.property("≡ !containsNot", "array nat", "nat", function (arr, n) {
    var seq = lazyseq.fromArray(arr);
    var lhs = seq.contains(n);
    var rhs = !seq.containsNot(n);
    return lhs === rhs;
  });

  jsc.property("similar to _.contains", "array nat", "nat", function (arr, n) {
    var lhs = _.contains(arr, n);
    var rhs = lazyseq.fromArray(arr).contains(n);
    return lhs === rhs;
  });
});
