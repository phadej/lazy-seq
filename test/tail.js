/* global describe:true */
"use strict";

var lazyseq = require("../index.js");
var jsc = require("jsverify");

describe("tail", function () {
  jsc.property("nil.tail() === nil", function () {
    return lazyseq.nil.tail() === lazyseq.nil;
  });

  jsc.property("cons(n, nil).tail() === nil", "nat", function (n) {
    return lazyseq.cons(n, lazyseq.nil).tail() === lazyseq.nil;
  });
});
