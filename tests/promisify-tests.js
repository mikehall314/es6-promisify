/*jslint node, this, maxlen: 120 */
module.exports = (function () {

    "use strict";

    var ES6Promise = require("../dist/promise.js");
    var promisify = require("../dist/promisify.js");

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
    var o = {
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

            test.expect(1);

            var promisified = promisify(standard);

            // Call the function, with fail == undefined.
            // Should resolve correctly, with the string "success".
            promisified(undefined).then(function kept(success) {

                // String should equal success.
                test.equal(success, "success", "Unexpected return value");

            }, function broken(because) {

                // Shouldn't get in here.
                test.ok(false, "Unexpected rejection: " + because);

            }).then(test.done);
        },

        "promisify function (reject)": function (test) {

            test.expect(1);

            var promisified = promisify(standard);

            // Call the function, with fail == true.
            // Should reject the promise with the string "error".
            promisified(true).then(function kept() {

                // Shouldn't get in here.
                test.ok(false, "Unexpected kept promise");

            }, function broken(because) {

                // Should reject and land in here.
                test.equal(because, "error", "Unexpected error value");

            }).then(test.done);
        },

        "promisify method": function (test) {

            test.expect(1);

            // Promisify a method, supplying a thisArg
            var promisified = promisify(o.method, o);

            promisified().then(function kept(thing) {

                // String should equal success
                test.equal(thing, "thing", "Unexpected return value");

            }, function broken(because) {

                // We shouldn't get in here, if we do we rejected unexpectedly
                test.ok(false, "Unexpected rejection: " + because);

            }).then(test.done);
        },

        "promisify method (broken context)": function (test) {

            test.expect(1);

            // Promisify a method, without a thisArg
            var promisified = promisify(o.method);

            promisified().then(function kept() {

                // Shouldn't get in here.
                test.ok(false, "Unexpected kept promise");

            }, function broken(because) {

                // Should reject the promise and land in here.
                test.equal(because, "error", "Unexpected error value");

            }).then(test.done);
        },

        "promisify method (explicit context)": function (test) {

            test.expect(1);

            // Promisify a method, supplying a thisArg in an options object
            var promisified = promisify(o.method, {thisArg: o});

            promisified().then(function kept(thing) {

                // String should equal success
                test.equal(thing, "thing", "Unexpected return value");

            }, function broken(because) {

                // We shouldn't get in here, if we do we rejected unexpectedly
                test.ok(false, "Unexpected rejection: " + because);

            }).then(test.done);
        },

        "promisified function called multiple times": function (test) {

            var counter = 0;
            var promisified = promisify(function (cb) {
                setTimeout(function () {
                    counter += 1;
                    cb(undefined, counter);
                }, 50);
            });

            ES6Promise.all([
                promisified(),
                promisified(),
                promisified()
            ]).then(function (results) {
                test.deepEqual(results, [1, 2, 3], "Unexpected result array");
            }).then(test.done);
        },

        "promisified function callback with multiple arguments (retained)": function (test) {

            var promisified = promisify(function (cb) {
                setTimeout(function () {
                    cb(undefined, 1, 2, 3);
                });
            }, {multiArgs: true});

            promisified().then(function (result) {
                test.deepEqual(result, [1, 2, 3], "Unexpected result array");
            }).then(test.done);
        },

        "promisified function callback with multiple arguments (discarded)": function (test) {

            var promisified = promisify(function (cb) {
                setTimeout(function () {
                    cb(undefined, 1, 2, 3);
                });
            }, {multiArgs: false});

            promisified().then(function (result) {
                test.deepEqual(result, 1, "Unexpected result array");
            }).then(test.done);
        },

        "promisified function callback with single args (multiArgs enabled)": function (test) {

            var promisified = promisify(function (cb) {
                setTimeout(function () {
                    cb(undefined, 1);
                });
            }, {multiArgs: true});

            promisified().then(function (result) {
                test.deepEqual(result, [1], "Unexpected result array");
            }).then(test.done);
        },

        "promisifying a promise": function (test) {

            test.expect(1);

            // Promisify a something which returns a promise
            var twice = promisify(promisify(standard));

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

            test.expect(1);

            // Promisify a something which returns a promise
            var twice = promisify(promisify(standard));

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
