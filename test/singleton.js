/* global describe:true */
"use strict";

var lazyseq = require("../index.js");
var jsc = require("jsverify");

describe("singleton", function () {
  jsc.property("length is 1", "nat", function (n) {
    return lazyseq.singleton(n).length() === 1;
  });
});
