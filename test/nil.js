/* global describe:true */
"use strict";

var lazySeq = require("../index.js");
var jsc = require("jsverify");

describe("nil", function () {
  jsc.property(".isNil === true", function () {
    return lazySeq.nil.isNil;
  });

  jsc.property(".toString() === 'nil'", function () {
    return "" + lazySeq.nil === "nil";
  });
});
