/* global describe:true */
"use strict";

var lazyseq = require("../index.js");
var jsc = require("jsverify");
var _ = require("underscore");

describe("cons", function () {
  jsc.property(".isNil === false", function () {
    return !lazyseq.cons(42, lazyseq.nil).isNil;
  });

  jsc.property("cons(1, nil).toString() === 'Cons(1, nil)'", function () {
    return lazyseq.cons(1, lazyseq.nil).toString() === "Cons(1, nil)";
  });

  jsc.property("cons(1, nil).toArray() === [1]", function () {
    var lhs = lazyseq.cons(1, lazyseq.nil).toArray();
    var rhs = [1];
    return _.isEqual(lhs, rhs);
  });

  jsc.property("cons(1, []]).toArray() === [1]", function () {
    var lhs = lazyseq.cons(1, []).toArray();
    var rhs = [1];
    return _.isEqual(lhs, rhs);
  });

  jsc.property("cons(1, () => nil).toArray() === [1]", function () {
    var lhs = lazyseq.cons(1, function () { return lazyseq.nil; }).toArray();
    var rhs = [1];
    return _.isEqual(lhs, rhs);
  });

  jsc.property("cons(1, () => []]).toArray() === [1]", function () {
    var lhs = lazyseq.cons(1, function () { return []; }).toArray();
    var rhs = [1];
    return _.isEqual(lhs, rhs);
  });

  jsc.property("cons(n, arr).toArray() === [n].concat(arr)", "nat", "array nat", function (n, arr) {
    var lhs = lazyseq.cons(n, arr).toArray();
    var rhs = [n].concat(arr);
    return _.isEqual(lhs, rhs);
  });
});
