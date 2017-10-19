/**
 * es6-promisify
 * Promisification boilerplate for NodeJS and Browsers
 * @license MIT
 * @copyright Mike Hall / Digital Design Labs
 */

"use strict";

/**
 * Basic Test Suite
 * Testing the basic functionality of the library.
 * @author Mike Hall <mikehall314@gmail.com>
 */

// Using tape for testing
const test = require("tape");

// This is the code under test
const {promisify} = require("../dist/promisify");

/**
 * standard()
 * A standard function we will use to test. Takes two arguments.
 *
 * @param {boolean} success - If false, will call the callback with an error. Otherwise, calls with string "success"
 * @param {function} callback
 */
function standard(success, callback) {
    if (success === false) {
        return callback("error");
    }
    callback(undefined, "success");
}

/**
 * o
 * This object is used for testing methods. It has a `foo` property, which (if visible on `this`) will cause the
 * `method` method to callback with "success". Otherwise, will callback with "error".  Also includes a `standard`
 * method, which does not use the `this` context at all.
 */
const o = {
    foo: true,
    standard,
    method: function (callback) {
        if (this && this.foo) {
            return callback(undefined, "success");
        }
        callback("error");
    }
};

// Test a simple promisify
test("promisify function", assert => {

    assert.plan(1);

    const promisified = promisify(standard);
    promisified(true).then(success => {
        assert.equal(success, "success", "Should resolve with string 'success'");
        assert.end();
    });
});

// Test that error callbacks lead to rejected promises
test("promisify rejecting function", assert => {

    assert.plan(1);

    const promisified = promisify(standard);
    promisified(false).catch(reason => {
        assert.equal(reason, "error", "Should reject with string 'error'");
        assert.end();
    });
});

// Test that promisified methods without `this` resolve ok
test("promisify method", assert => {

    assert.plan(1);

    const promisified = promisify(o.standard);
    promisified(true).then(success => {
        assert.equal(success, "success", "Should resolve with string 'success'");
        assert.end();
    });
});

// Test that promified methods with `this` resolve okay, if bound to the right context
test("promisify method using `this`", assert => {

    assert.plan(1);

    // Promisify a method, using bind to lock `this` context
    const promisified = promisify(o.method.bind(o));
    promisified()
        .then(success => {
            assert.equal(success, "success", "Should resolve with string 'success'");
            assert.end();
        });
});

// Test that promisified methods with `this` fail, if left unbound
test("promisify method with broken context", assert => {

    assert.plan(1);

    // Promisify a method using this, without using bind. Should reject.
    const promisified = promisify(o.method);
    promisified().catch(reason => {
        assert.equal(reason, "error", "Should reject with string 'error'");
        assert.end();
    });
});

// Test that promisified functions can be called multiple times
test("promisified function called multiple times", assert => {

    assert.plan(1);

    let counter = 0;
    const promisified = promisify(function (cb) {
        counter += 1;
        cb(undefined, counter);
    });

    Promise.all([promisified(), promisified(), promisified()]).then(results => {
        assert.deepEqual(results, [1, 2, 3], "Should resolve all with [1, 2, 3]");
        assert.end();
    });
});

// Promises resolve with a single argument; other arguments should be discarded
test("promisified function callback with multiple arguments", assert => {

    assert.plan(1);

    const promisified = promisify(cb => setTimeout(cb, 10, undefined, 1, 2, 3));

    promisified().then(result => {
        assert.equal(result, 1, "Should discard excess arguments");
        assert.end();
    });
});

// Borrowing an API from util.promisify, multiple arguments can be retained if
// the user supplies names for those arguments.
test("promisified function callback with retained named arguments", assert => {

    assert.plan(1);

    function f(cb) {
        setTimeout(cb, 10, undefined, 1, 2, 3, 4);
    }

    // Specify names for retained arguments
    f[promisify.argumentNames] = ["one", "two"];

    const promisified = promisify(f);
    promisified().then(result => {
        assert.deepEqual(result, {one: 1, two: 2}, "Should return with named arguments");
        assert.end();
    });
});

// Test that we can handle promisifying multiple times
test("promisifying multiple times", assert => {

    assert.plan(1);

    // Promisify a something which returns a promise
    const twice = promisify(promisify(standard));
    twice(true).then(success => {
        assert.equal(success, "success", "Should resolve with string 'success'");
        assert.end();
    });
});

// Test we can handle promisifying multiple times, where the promise rejects
test("promisifying multiple times, with rejection", assert => {

    assert.plan(1);

    const twice = promisify(promisify(standard));
    twice(false).catch(reason => {
        assert.equal(reason, "error", "Should reject with string 'error'");
        assert.end();
    });
});

// Test honouring the user's choice of Promise polyfill
test("supplying a custom promise implementation", assert => {

    const sinon = require("sinon");
    const CustomPromise = sinon.spy(require("es6-promise"), "Promise");

    function f(cb) {
        setTimeout(cb, 10, undefined, "success");
    }

    promisify.Promise = CustomPromise;

    const promisified = promisify(f);
    promisified().then(success => {
        assert.equal(success, "success", "Should resolve okay");
        assert.ok(CustomPromise.calledOnce, "Custom Promise constructor should be called");
        CustomPromise.restore();
        assert.end();
    });
});
