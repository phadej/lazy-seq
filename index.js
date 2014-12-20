/**
  # lazy-seq

  > Lazy sequences

  [![Build Status](https://secure.travis-ci.org/phadej/lazy-seq.svg?branch=master)](http://travis-ci.org/phadej/lazy-seq)
  [![NPM version](https://badge.fury.io/js/lazy-seq.svg)](http://badge.fury.io/js/lazy-seq)
  [![Dependency Status](https://david-dm.org/phadej/lazy-seq.svg)](https://david-dm.org/phadej/lazy-seq)
  [![devDependency Status](https://david-dm.org/phadej/lazy-seq/dev-status.svg)](https://david-dm.org/phadej/lazy-seq#info=devDependencies)
  [![Code Climate](https://img.shields.io/codeclimate/github/phadej/lazy-seq.svg)](https://codeclimate.com/github/phadej/lazy-seq)

  ## Lazy?

  The list structure could be defined as

  ```hs
  data Seq a = Nil | Cons a (Seq a)
  ```

  The `Cons` constuctor takes two arguments, so there are four different laziness variants:

  ```hs
  Cons (Strict a) (Strict (Seq a)) -- 1. fully strict
  Cons (Lazy a)   (Strict (Seq a)) -- 2. lazy values
  Cons (Strict a) (Lazy (Seq a))   -- 3. lazy structure
  Cons (Lazy   a) (Lazy (Seq a))   -- 4. fully lazy
  ```

  This module implements the third variant: lazy structure, but strict values.

  ## Example

  ```js
  var ones = lazyseq.cons(1, function () { return ones; });
  console.log(ones === ones.tail()); // true!
  ```

  ## Why?

  This package is originally made to optimise shrink operations in [jsverify](http://jsverify.github.io/), a property-based testing library.

  ## API
*/

"use strict";

var assert = require("assert");

// nil is a unique value
var nil = {};

/**
  - *.isNil : Boolean* &mdash; Constant time check, whether the sequence is empty.
*/
nil.isNil = true;

/**
  - *.toString : () → String* &mdash; String representation. Doesn't force the tail.
*/
nil.toString = function () {
  return "nil";
};

/**
  - *.length : () → Nat* &mdash; Return the length of the sequene. Forces the structure.
*/
nil.length = function () {
  return 0;
};

/**
  - *.toArray : () → Array a* &mdash; Convert the sequence to JavaScript array.
*/
nil.toArray = function nilToArray() {
  return [];
};

/**
  - *.fold : (z : b, f : (a, () → b) → b) → b* &mdash; Fold from right.

      ```hs
      fold nil x f        = x
      fold (cons h t) x f = f x (fold t x f)
      ```
*/
nil.fold = function nilFold(x /*, f */) {
  return x;
};

/**
  - *.head : () → a* &mdash;  Extract the first element of a sequence, which must be non-empty.
*/
nil.head = function nilHead() {
  throw new Error("nil.head");
};

/**
  - *.tail : () → Seq a* &mdash; Return the tail of the sequence.

      ```hs
      tail nil        = nil
      tail (cons h t) = t
      ```
*/
nil.tail = function nilTail() {
  return nil;
};

/**
  - *.nth : (n : Nat) → a* &mdash; Return nth value of the sequence.
*/
nil.nth = function nilNth(n) {
  assert(typeof n === "number");
  throw new Error("Can't get " + n + "th value of the nil");
};

/**
  - *.take : (n : Nat) → Seq a* &mdash; Take `n` first elements of the sequence.
*/
nil.take = function (n) {
  assert(typeof n === "number");
  return nil;
};

/**
  - *.drop : (n : Nat) → Seq a* &mdash; Drop `n` first elements of the sequence.
*/
nil.drop = function (n) {
  assert(typeof n === "number");
  return nil;
};

/**
  - *.map : (f : a → b) : Seq b* &mdash; The sequence obtained by applying `f` to each element of the original sequence.
*/
nil.map = function (f) {
  assert(typeof f === "function");
  return nil;
};

/**
  - *.append : (ys : Seq a | Array a) : Seq a* &mdash; Append `ys` sequence.
*/
nil.append = function (seq) {
  if (Array.isArray(seq)) {
    /* eslint-disable no-use-before-define */
    return fromArray(seq);
    /* eslint-enable no-use-before-define */
  } else {
    return seq;
  }
};

// Default cons values are with strict semantics
function Cons(head, tail) {
  this.headValue = head;
  this.tailValue = tail;
}

Cons.prototype.isNil = false;

Cons.prototype.toString = function () {
  return "Cons(" + this.headValue + ", " + this.tailValue + ")";
};

Cons.prototype.length = function () {
  return 1 + this.tail().length();
};

Cons.prototype.toArray = function () {
  var ptr = this;
  var acc = [];
  while (ptr !== nil) {
    acc.push(ptr.headValue);
    ptr = ptr.tail();
  }
  return acc;
};

Cons.prototype.fold = function consFold(x, f) {
  var self = this;
  return f(this.headValue, function () {
    return self.tailValue.fold(x, f);
  });
};

Cons.prototype.head = function consHead() {
  return this.headValue;
};

Cons.prototype.tail = function consTail() {
  return this.tailValue;
};

// But when cons is created, it's overloaded with lazy ones

// Force tail to whnf.
function lazyConsForce() {
  /* jshint validthis:true */
  this.tailValue = this.tailFn();

  delete this.tail;
  delete this.force;

  return this;
}

function lazyConsTail() {
  /* jshint validthis:true */
  this.force();
  return this.tailValue;
}

function delay(cons, tail) {
  assert(typeof tail === "function");

  cons.tailFn = tail;
  cons.tail = lazyConsTail;

  cons.force = lazyConsForce;
  return cons;
}

function cons(head, tail) {
  if (typeof tail === "function") {
    return delay(new Cons(head), tail);
  } else if (Array.isArray(tail)) {
    /* eslint-disable no-use-before-define */
    return cons(head, function () {
      return fromArray(tail);
    });
    /* eslint-enable no-use-before-define */
  } else {
    return new Cons(head, tail);
  }
}

// Rest of the functions. They might use cons

Cons.prototype.nth = function consNth(n) {
  assert(typeof n === "number");
  return n === 0 ? this.headValue : this.tail().nth(n - 1);
};

Cons.prototype.take = function consTake(n) {
  assert(typeof n === "number");
  var that = this;
  return n === 0 ? nil : cons(this.headValue, function () {
    return that.tail().take(n - 1);
  });
};

Cons.prototype.drop = function consDrop(n) {
  assert(typeof n === "number");
  return n === 0 ? this : this.tail().drop(n - 1);
};

Cons.prototype.map = function consMap(f) {
  assert(typeof f === "function");
  var that = this;
  return cons(f(that.headValue), function () {
    return that.tail().map(f);
  });
};

Cons.prototype.append = function consAppend(seq) {
  if (seq === nil || (Array.isArray(seq) && seq.length === 0)) {
    return this;
  }
  var that = this;
  return cons(that.headValue, function () {
    return that.tail().append(seq);
  });
};

// Constructors
/**
  - *fromArray: (arr : Array a) → Seq a* &mdash; Convert a JavaScript array into lazy sequence.
*/
function fromArrayIter(arr, n) {
  if (n < arr.length) {
    return cons(arr[n], function () {
      return fromArrayIter(arr, n + 1);
    });
  } else {
    return nil;
  }
}

function fromArray(arr) {
  assert(Array.isArray(arr));
  return fromArrayIter(arr, 0);
}

/**
  - *iterate : (x : a, f : a → a) → Seq a* &mdash; Create an infinite sequence of repeated applications of `f` to `x`: *x, f(x), f(f(x))&hellip;*.
*/
function iterate(x, f) {
  return cons(x, function () {
    return iterate(f(x), f);
  });
}

module.exports = {
  nil: nil,
  cons: cons,
  fromArray: fromArray,
  iterate: iterate,
};

/// plain CHANGELOG.md
/// plain CONTRIBUTING.md
