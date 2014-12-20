/* global describe:true */
"use strict";

var lazyseq = require("../index.js");
var jsc = require("jsverify");

describe("nil", function () {
  jsc.property("ones === ones.tail", function () {
    var ones = lazyseq.cons(1, function () { return ones; });
    return ones === ones.tail();
  });
});
