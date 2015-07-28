/* global describe:true */
"use strict";

var lazyseq = require("../index.js");
var jsc = require("jsverify");
var _ = require("underscore");

describe(".every", function () {
  jsc.property("works with array", "array nat", "nat -> bool", function (arr, p) {
    var lhs = arr.every(p);
    var rhs = lazyseq.fromArray(arr).every(p);
    return _.isEqual(lhs, rhs);
  });

  jsc.property("works with array, -> non bool", "array nat", "nat -> nat", function (arr, p) {
    var lhs = arr.every(p);
    var rhs = !!lazyseq.fromArray(arr).every(p); // bool cast is important
    return _.isEqual(lhs, rhs);
  });

  jsc.property("return value from the seq", "array nat", function (arr) {
    var val = lazyseq.fromArray(arr).every();
    return val === true || _.contains(arr, val);
  });
});

describe(".some", function () {
  jsc.property("works with array", "array nat", "nat -> bool", function (arr, p) {
    var lhs = arr.some(p);
    var rhs = lazyseq.fromArray(arr).some(p);
    return _.isEqual(lhs, rhs);
  });

  jsc.property("works with array, -> non bool", "array nat", "nat -> nat", function (arr, p) {
    var lhs = arr.some(p);
    var rhs = !!lazyseq.fromArray(arr).some(p); // bool cast is important
    return _.isEqual(lhs, rhs);
  });

  jsc.property("return value from the seq", "array nat", function (arr) {
    var val = lazyseq.fromArray(arr).some();
    return val === false || _.contains(arr, val);
  });
});
