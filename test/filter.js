/* global describe:true */
"use strict";

var lazyseq = require("../index.js");
var jsc = require("jsverify");
var _ = require("underscore");

describe(".filter", function () {
  jsc.property("works with array", "array nat", "nat -> bool", function (arr, p) {
    var lhs = arr.filter(p);
    var rhs = lazyseq.fromArray(arr).filter(p).toArray();
    return _.isEqual(lhs, rhs);
  });
});
