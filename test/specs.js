/* global describe:true */
"use strict";

var lazyseq = require("../index.js");
var jsc = require("jsverify");
var _ = require("underscore");

function toSeq(arr) {
  return lazyseq.fromArray(arr);
}

function fromSeq(seq) {
  return seq.toArray();
}

function seqArbitrary(arb) {
  return {
    generator: jsc.generator.array(arb.generator).map(toSeq),
    shrink: jsc.shrink.array(arb.shrink).smap(toSeq, fromSeq),
    show: jsc.show.def,
  };
}

var jscEnv = {
  seq: seqArbitrary,
};

describe("tail", function () {
  jsc.property("nil.tail() === nil", function () {
    return lazyseq.nil.tail() === lazyseq.nil;
  });

  jsc.property("cons(n, nil).tail() === nil", "nat", function (n) {
    return lazyseq.cons(n, lazyseq.nil).tail() === lazyseq.nil;
  });
});

describe("length", function () {
  jsc.property("nil.length() === 0", function () {
    return lazyseq.nil.length() === 0;
  });

  jsc.property("cons(n, nil).length() === 1", "nat", function (n) {
    return lazyseq.cons(n, lazyseq.nil).length() === 1;
  });

  jsc.property("fromArray(arr).length() === arr.length", "array nat", function (arr) {
    var seq = lazyseq.fromArray(arr);
    return seq.length() === arr.length;
  });

  jsc.property("seq.length() === seq.fold(0, (_, n) => n + 1)", "array nat", function (arr) {
    var seq = lazyseq.fromArray(arr);
    return seq.length() === seq.fold(0, function (h, t) {
      return 1 + t();
    });
  });
});

describe("toArray", function () {
  jsc.property("toArray ∘ fromArray ≈ identity", "array nat", function (arr) {
    var other = lazyseq.fromArray(arr).toArray();
    return _.isEqual(arr, other);
  });
});

describe("nth", function () {
  jsc.property("nil.nth(n) ≡ ⊥", "nat", function (n) {
    try {
      lazyseq.nil.nth(n);
      return false;
    } catch (e) {
      return true;
    }
  });

  jsc.property("cons(n, nil).nth(0) === n", "nat", function (n) {
    return lazyseq.cons(n, lazyseq.nil).nth(0) === n;
  });
});

describe("head", function () {
  jsc.property("nil.head() ≡ ⊥", function () {
    try {
      lazyseq.nil.head();
      return false;
    } catch (e) {
      return true;
    }
  });

  jsc.property("cons(n, nil).head() === n", "nat", function (n) {
    return lazyseq.cons(n, lazyseq.nil).head() === n;
  });
});

describe("take", function () {
  jsc.property("nil.take(n) === nil", "nat", function (n) {
    return lazyseq.nil.take(n) === lazyseq.nil;
  });
});

describe("drop", function () {
  jsc.property("nil.drop(n) === nil", "nat", function (n) {
    return lazyseq.nil.drop(n) === lazyseq.nil;
  });
});

describe("iterate", function () {
  jsc.property("(0 ∷ 1 ∷ 2 ∷ …).nth(n) === n", "nat", function (n) {
    var seq = lazyseq.iterate(0, function (x) { return x + 1; });
    return seq.nth(n) === n;
  });

  jsc.property("nats.drop(n).head() === n", "nat", function (n) {
    var seq = lazyseq.iterate(0, function (x) { return x + 1; });
    return seq.drop(n).head() === n;
  });

  jsc.property("nats.take(n).length() === n", "nat", function (n) {
    var seq = lazyseq.iterate(0, function (x) { return x + 1; });
    return seq.take(n).length() === n;
  });
});

describe("map", function () {
  jsc.property("arr.map ≈ seq.map", "nat -> nat", "array nat", function (f, arr) {
    var seq = lazyseq.fromArray(arr);
    var mappedArr = arr.map(f);
    var mappedSeq = seq.map(f);
    return _.isEqual(mappedArr, mappedSeq.toArray());
  });

  jsc.property("is lazy", "nat -> nat", "array nat", function (f, arr) {
    var count = 0;
    var g = function (x) {
      count += 1;
      return f(x);
    };
    var seq = lazyseq.fromArray(arr);
    seq.map(g); // for side-effects only
    return (seq === lazyseq.nil && count === 0) || count === 1;
  });

  jsc.property("functor identity", "seq nat", jscEnv, function (seq) {
    var mappedSeq = seq.map(_.identity);
    return _.isEqual(seq.toArray(), mappedSeq.toArray());
  });

  jsc.property("functor composition", "seq nat", "nat -> nat", "nat -> nat", jscEnv, function (seq, f, g) {
    var gf = _.compose(g, f);
    var lhs = seq.map(f).map(g);
    var rhs = seq.map(gf);
    return _.isEqual(lhs.toArray(), rhs.toArray());
  });

  jsc.property("nats.map(square).drop(n).head() === n * n", "nat", function (n) {
    var nats = lazyseq.iterate(0, function (x) { return x + 1; });
    var lhs = nats.map(function (m) { return m * m; }).drop(n).head();
    var rhs = n * n;
    return lhs === rhs;
  });
});

describe("append", function () {
  jsc.property("arr.concat ≈ seq.append", "array nat", "array nat", function (arr1, arr2) {
    var arr = arr1.concat(arr2);
    var seq1 = lazyseq.fromArray(arr1);
    var seq2 = lazyseq.fromArray(arr2);
    var seq = seq1.append(seq2);
    return _.isEqual(arr, seq.toArray());
  });

  jsc.property("arr.concat ≈ seq.append - 2", "array nat", "array nat", function (arr1, arr2) {
    var arr = arr1.concat(arr2);
    var seq1 = lazyseq.fromArray(arr1);
    var seq = seq1.append(arr2);
    return _.isEqual(arr, seq.toArray());
  });
});

describe("fold", function () {
  jsc.property("fold(arr) ≈ fold(seq)", "array nat", "nat", function (arr, z) {
    var f = function (x, acc) {
      return x - acc();
    };
    var foldedArr = lazyseq.fold(arr, z, f);
    var foldedSeq = lazyseq.fold(lazyseq.fromArray(arr), z, f);
    return foldedArr === foldedSeq;
  });
});
