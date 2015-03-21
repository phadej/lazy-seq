/* global describe:true */
"use strict";

var lazyseq = require("../index.js");
var jsc = require("jsverify");
var _ = require("underscore");

describe(".append", function () {
  jsc.property("nil ++ nil === nil", function () {
    return lazyseq.nil.append(lazyseq.nil).isNil;
  });

  jsc.property("nil ++ [] === nil", function () {
    return lazyseq.nil.append([]).isNil;
  });

  jsc.property("nil ++ (() → nil) === nil", function () {
    return lazyseq.nil.append(function () { return lazyseq.nil; }).isNil;
  });

  jsc.property("nil ++ (() → []) === nil", function () {
    return lazyseq.nil.append(function () { return []; }).isNil;
  });
});

describe("append", function () {
  describe("left identities", function () {
    jsc.property("nil", "array nat", function (arr) {
      var lhs = lazyseq.append(lazyseq.nil, arr).toArray();
      var rhs = arr;
      return _.isEqual(lhs, rhs);
    });

    jsc.property("[]", "array nat", function (arr) {
      var lhs = lazyseq.append([], arr).toArray();
      var rhs = arr;
      return _.isEqual(lhs, rhs);
    });

    jsc.property("() → nil", "array nat", function (arr) {
      var lhs = lazyseq.append(function () { return lazyseq.nil; }, arr).toArray();
      var rhs = arr;
      return _.isEqual(lhs, rhs);
    });

    jsc.property("() → []", "array nat", function (arr) {
      var lhs = lazyseq.append(function () { return []; }, arr).toArray();
      var rhs = arr;
      return _.isEqual(lhs, rhs);
    });
  });

  describe("right identities", function () {
    jsc.property("nil", "array nat", function (arr) {
      var lhs = lazyseq.append(arr, lazyseq.nil).toArray();
      var rhs = arr;
      return _.isEqual(lhs, rhs);
    });

    jsc.property("[]", "array nat", function (arr) {
      var lhs = lazyseq.append(arr, []).toArray();
      var rhs = arr;
      return _.isEqual(lhs, rhs);
    });

    jsc.property("() → nil", "array nat", function (arr) {
      var lhs = lazyseq.append(arr, function () { return lazyseq.nil; }).toArray();
      var rhs = arr;
      return _.isEqual(lhs, rhs);
    });

    jsc.property("() → []", "array nat", function (arr) {
      var lhs = lazyseq.append(arr, function () { return []; }).toArray();
      var rhs = arr;
      return _.isEqual(lhs, rhs);
    });
  });

  describe("associativity", function () {
    jsc.property("xs ++ (ys ++ zs) ≡ (xs ++ ys) ++ zs", "array nat", "array nat", "array nat", function (xs, ys, zs) {
      xs = lazyseq.fromArray(xs);
      ys = lazyseq.fromArray(ys);
      zs = lazyseq.fromArray(zs);

      var lhs = lazyseq.append(xs, lazyseq.append(ys, zs));
      var rhs = lazyseq.append(lazyseq.append(xs, ys), zs);

      return _.isEqual(lhs.toArray(), rhs.toArray());
    });

    jsc.property("xs ++ (ys ++ zs) ≡ xs ++ ys ++ zs", "array nat", "array nat", "array nat", function (xs, ys, zs) {
      xs = lazyseq.fromArray(xs);
      ys = lazyseq.fromArray(ys);
      zs = lazyseq.fromArray(zs);

      var lhs = lazyseq.append(xs, lazyseq.append(ys, zs));
      var rhs = lazyseq.append(xs, ys, zs);

      return _.isEqual(lhs.toArray(), rhs.toArray());
    });

    jsc.property("kind of flatten", "array (array nat)", function (xs) {
      var ys = xs.map(lazyseq.fromArray);
      var lhs = lazyseq.append.apply(undefined, ys).toArray();
      var rhs = _.flatten(xs);

      return _.isEqual(lhs, rhs);
    });
  });
});
