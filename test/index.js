/**
 * es6-promisify
 * Promisification boilerplate for NodeJS and Browsers
 *
 * @license MIT
 * @copyright Mike Hall
 */

"use strict";

/**
 * Basic Test Suite
 * Testing the basic functionality of the library.
 * @author Mike Hall <mikehall314@gmail.com>
 */

// Using tape for testing
const test = require("tape");
const sinon = require("sinon");

// This is the code under test (should add a second suite for mjs)
const {promisify} = require("../dist/promisify.js");

/**
 * standard()
 * A standard function we will use to test. Takes two arguments.
 *
 * @param {boolean} success - If false, will call the callback with an error.
 *      Otherwise, calls with string "success"
 * @param {function} callback
 */
function standard(success, callback) {
    if (success === false) {
        return callback(new Error());
    }
    callback(undefined, "success");
}

/**
 * o
 * This object is used for testing methods. It has a `foo` property, which (if
 * visible on `this`) will cause the `method` method to callback with "success".
 * Otherwise, will callback with an error.  Also includes a `standard`
 * method, which does not use the `this` context at all.
 */
const o = {
    foo: true,
    standard,
    method: function (callback) {
        if (this && this.foo) {
            return callback(undefined, "success");
        }
        callback(new Error());
    },
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
        assert.ok(reason instanceof Error, "Should reject with an error");
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
    promisified().then(success => {
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
        assert.ok(reason instanceof Error, "Should reject with an error");
        assert.end();
    });
});

// Test that promisified functions can be called multiple times
test("promisified function called multiple times", assert => {
    assert.plan(1);

    let counter = 0;
    const promisified = promisify(cb => {
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

    // Specify names for retained arguments
    const f = cb => setTimeout(cb, 10, undefined, 1, 2, 3, 4);
    f[promisify.argumentNames] = ["one", "two"];

    const promisified = promisify(f);
    promisified().then(result => {
        assert.deepEqual(
            result,
            {one: 1, two: 2},
            "Should return with named arguments"
        );
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
        assert.ok(reason instanceof Error, "Should reject with an error");
        assert.end();
    });
});

test("honouring the user's choice of Promise polyfill", assert => {
    assert.plan(2);

    // Drop in a custom Promise implementation
    const CustomPromise = sinon.spy(require("es6-promise"), "Promise");
    promisify.Promise = CustomPromise;

    const f = cb => setTimeout(cb, 10, undefined, "success");
    const promisified = promisify(f);

    promisified().then(success => {
        assert.equal(success, "success", "Should resolve okay");
        assert.ok(
            CustomPromise.calledOnce,
            "Custom Promise constructor should be called"
        );

        // Clean up
        promisify.Promise = undefined;
        CustomPromise.restore();
        assert.end();
    });
});

test("throws for Promise-less environment", assert => {
    /* eslint-disable no-global-assign */

    // Temporarily remove the native Promise
    const P = Promise;
    Promise = undefined;

    assert.throws(
        _ => promisify(standard),
        "should throw with no Promise implementation"
    );

    // Clean up
    Promise = P;
    assert.end();
});

test("throws when trying to promisify something which isn't a func", assert => {
    assert.plan(1);
    assert.throws(
        _ => promisify("not a func"),
        "should throw for non-function argument"
    );
    assert.end();
});
