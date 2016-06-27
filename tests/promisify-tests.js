/* global require, module */
module.exports = (function () {

    "use strict";

    var ES6Promise, promisify, o;

    ES6Promise = require("../dist/promise.js");
    promisify = require("../dist/promisify.js");

    // Test function. If fail is true, will callback with an error.
    // Otherwise, will callback with the string "success".
    function standard(fail, callback) {
        if (fail) {
            return callback("error");
        }
        callback(undefined, "success");
    }

    // Test object. If the "method" method can see the things
    // in its parent, then it will callback with "thing".
    // Otherwise, will error with the string "error".
    o = {
        thing: true,
        method: function (callback) {
            if (this && this.thing) {
                return callback(undefined, "thing");
            }
            callback("error");
        }
    };

    return {

        "promisify function": function (test) {

            var promisified;

            test.expect(1);

            promisified = promisify(standard);

            // Call the function, with fail == undefined.
            // Should resolve correctly, with the string "success".
            promisified(undefined).then(function kept(success) {

                // String should equal success.
                test.equal(success, "success", "Unexpected return value");

            }, function broken(because) {

                // Shouldn't get in here.
                test.ok(false, "Unexpected rejection: " + because);

            }).then(function () {
                test.done();
            });
        },

        "promisify function (reject)": function (test) {

            var promisified;

            test.expect(1);

            promisified = promisify(standard);

            // Call the function, with fail == true.
            // Should reject the promise with the string "error".
            promisified(true).then(function kept() {

                // Shouldn't get in here.
                test.ok(false, "Unexpected kept promise");

            }, function broken(because) {

                // Should reject and land in here.
                test.equal(because, "error", "Unexpected error value");

            }).then(function () {
                test.done();
            });
        },

        "promisify method": function (test) {

            var promisified;

            test.expect(1);

            // Promisify a method, supplying a thisArg
            promisified = promisify(o.method, o);

            promisified().then(function kept(thing) {

                // String should equal success
                test.equal(thing, "thing", "Unexpected return value");

            }, function broken(because) {

                // We shouldn't get in here, if we do we rejected unexpectedly
                test.ok(false, "Unexpected rejection: " + because);

            }).then(function () {
                test.done();
            });
        },

        "promisify method (broken context)": function (test) {

            var promisified;

            test.expect(1);

            // Promisify a method, without a thisArg
            promisified = promisify(o.method);

            promisified().then(function kept() {

                // Shouldn't get in here.
                test.ok(false, "Unexpected kept promise");

            }, function broken(because) {

                // Should reject the promise and land in here.
                test.equal(because, "error", "Unexpected error value");

            }).then(function () {
                test.done();
            });
        },

        "promisify method (explicit context)": function (test) {

            var promisified;

            test.expect(1);

            // Promisify a method, supplying a thisArg in an options object
            promisified = promisify(o.method, {thisArg: o});

            promisified().then(function kept(thing) {

                // String should equal success
                test.equal(thing, "thing", "Unexpected return value");

            }, function broken(because) {

                // We shouldn't get in here, if we do we rejected unexpectedly
                test.ok(false, "Unexpected rejection: " + because);

            }).then(function () {
                test.done();
            });
        },

        "promisified function called multiple times": function (test) {

            var promisified, counter;

            test.expect(1);

            counter = 0;
            promisified = promisify(function (cb) {
                setTimeout(function () {
                    counter += 1;
                    cb(undefined, counter);
                }, 10);
            });

            ES6Promise.all([
                promisified(),
                promisified(),
                promisified()
            ]).then(function (results) {
                test.deepEqual(results, [1, 2, 3], "Unexpected result array");
            }).then(function () {
                test.done();
            });
        },

        "promisified function callback with multiple arguments (retained)": function (test) {

            var promisified;

            test.expect(1);

            promisified = promisify(function (cb) {
                setTimeout(cb, 10, undefined, 1, 2, 3);
            }, {multiArgs: true});

            promisified().then(function (result) {
                test.deepEqual(result, [1, 2, 3], "Unexpected result array");
            }).then(function () {
                test.done();
            });
        },

        "promisified function callback with multiple arguments (discarded)": function (test) {

            var promisified;

            test.expect(1);

            promisified = promisify(function (cb) {
                setTimeout(cb, 10, undefined, 1, 2, 3);
            }, {multiArgs: false});

            promisified().then(function (result) {
                test.deepEqual(result, 1, "Unexpected result array");
            }).then(function () {
                test.done();
            });
        },

        "promisified function callback with single args (multiArgs enabled)": function (test) {

            var promisified;

            test.expect(1);

            promisified = promisify(function (cb) {
                setTimeout(cb, 10, undefined, 1);
            }, {multiArgs: true});

            promisified().then(function (result) {
                test.deepEqual(result, [1], "Unexpected result array");
            }).then(function () {
                test.done();
            });
        },

        "promisifying a promise": function (test) {

            var twice;

            test.expect(1);

            // Promisify a something which returns a promise
            twice = promisify(promisify(standard));

            // Call the function, with fail == undefined.
            // Should resolve correctly, with the string "success".
            twice(undefined).then(function kept(success) {

                // String should equal success.
                test.equal(success, "success", "Unexpected return value");

            }, function broken(because) {

                // Shouldn't get in here.
                test.ok(false, "Unexpected rejection: " + because);

            }).then(function () {
                test.done();
            });
        },

        "promisifying a promise (reject)": function (test) {

            var twice;

            test.expect(1);

            // Promisify a something which returns a promise
            twice = promisify(promisify(standard));

            // Call the function, with fail == true.
            // Should reject the promise with the string "error".
            twice(true).then(function kept() {

                // Shouldn't get in here.
                test.ok(false, "Unexpected kept promise");

            }, function broken(because) {

                // Should reject and land in here.
                test.equal(because, "error", "Unexpected error value");

            }).then(function () {
                test.done();
            });
        }
    };
}());
