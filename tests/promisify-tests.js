/*jslint node, this, maxlen: 120 */
module.exports = (function () {

    "use strict";

    var ES6Promise = require("../dist/promise.js"),
        promisify = require("../dist/promisify.js"),
        o;

    // Test function. If fail is true, will callback with an error.
    // Otherwise, will callback with the string "success".
    function standard(fail, callback) {
        if (fail) {
            return callback("error");
        }
        callback(null, "success");
    }

    // Test object. If the "method" method can see the things
    // in its parent, then it will callback with "thing".
    // Otherwise, will error with the string "error".
    o = {
        thing: true,
        method: function (callback) {
            if (this && this.thing) {
                return callback(null, "thing");
            }
            callback("error");
        }
    };

    return {

        "promisify function with default callback": function (test) {

            test.expect(1);

            var promisified = promisify(standard);

            // Call the function, with fail == null.
            // Should resolve correctly, with the string "success".
            promisified(null).then(function kept(success) {

                // String should equal success.
                test.equal(success, "success", "Unexpected return value");

            }, function broken(because) {

                // Shouldn't get in here.
                test.ok(false, "Unexpected rejection: " + because);

            }).then(test.done);
        },

        "promisify function with default callback (force reject)": function (test) {

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

        "promisify function with custom callback": function (test) {

            test.expect(1);

            // Create the promise-based function with a custom callback
            var promisified = promisify(standard, function (err, result) {
                if (err) {
                    return this.reject("custom " + err);
                }
                this.resolve("custom " + result);
            });

            // Call the function, with fail == null.
            // Should resolve with the string "custom success", as the custom
            // callback adds in the "custom" prefix as it handles the result.
            promisified(null).then(function kept(success) {

                // String should equal success
                test.equal(success, "custom success", "Unexpected return value");

            }, function broken(because) {

                // We shouldn't get in here, if we do we rejected unexpectedly
                test.ok(false, "Unexpected rejection: " + because);

            }).then(test.done);
        },

        "promisify function with custom callback (force reject)": function (test) {

            test.expect(1);

            // Create the promise-based function with a custom callback
            var promisified = promisify(standard, function (err, result) {
                if (err) {
                    return this.reject("custom " + err);
                }
                this.resolve("custom " + result);
            });

            // Call the function, with fail == true.
            // Should reject with the error "custom error".
            promisified(true).then(function kept() {

                // Shouldn't get in here.
                test.ok(false, "Unexpected kept promise");

            }, function broken(because) {

                // Should reject the promise and land in here.
                test.equal(because, "custom error", "Unexpected error value");

            }).then(test.done);
        },

        "promisify method with default callback": function (test) {

            test.expect(1);

            // Promisify a method, binding it to it's parent context
            var promisified = promisify(o.method.bind(o));

            promisified().then(function kept(thing) {

                // String should equal success
                test.equal(thing, "thing", "Unexpected return value");

            }, function broken(because) {

                // We shouldn't get in here, if we do we rejected unexpectedly
                test.ok(false, "Unexpected rejection: " + because);

            }).then(test.done);
        },

        "promisify method with default callback (broken context)": function (test) {

            test.expect(1);

            // Promisify a method, without binding to it's parent. We expect this to fail.
            var promisified = promisify(o.method);

            promisified().then(function kept() {

                // Shouldn't get in here.
                test.ok(false, "Unexpected kept promise");

            }, function broken(because) {

                // Should reject the promise and land in here.
                test.equal(because, "error", "Unexpected error value");

            }).then(test.done);
        },

        "promisify method with default callback (same context)": function (test) {

            test.expect(1);

            // Promisify a method, preserving it's parent context
            o.methodPromisified = promisify(o.method);

            o.methodPromisified().then(function kept(thing) {

                // String should equal success
                test.equal(thing, "thing", "Unexpected return value");

            }, function broken(because) {

                // We shouldn't get in here, if we do we rejected unexpectedly
                test.ok(false, "Unexpected rejection: " + because);

            }).then(test.done);
        },

        "promisify method with custom callback": function (test) {

            test.expect(1);

            // Promisify a method, binding it to it's parent context
            var promisified = promisify(o.method.bind(o), function (err, result) {
                if (err) {
                    return this.reject("custom " + err);
                }
                this.resolve("custom " + result);
            });

            promisified().then(function kept(thing) {

                // String should equal "custom thing"
                test.equal(thing, "custom thing", "Unexpected return value");

            }, function broken(because) {

                // Shouldn't get in here
                test.ok(false, "Unexpected rejection: " + because);

            }).then(test.done);
        },

        "promisify method with custom callback (broken context)": function (test) {

            test.expect(1);

            // Promisify a method, binding it to it's parent context
            var promisified = promisify(o.method, function (err, result) {
                if (err) {
                    return this.reject("custom " + err);
                }
                this.resolve("custom " + result);
            });

            promisified().then(function kept() {

                // Shouldn't get in here.
                test.ok(false, "Unexpected kept promise");

            }, function broken(because) {

                // Should get a custom error in here.
                test.equal(because, "custom error", "Unexpected error value");

            }).then(test.done);
        },

        "promisified function called multiple times": function (test) {

            var counter, promisified;

            counter = 0;
            promisified = promisify(function (cb) {
                setTimeout(function () {
                    counter += 1;
                    cb(null, counter);
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

        "promisified function callback with multiple arguments": function (test) {
            var promisified = promisify(function (cb) {
                setTimeout(function () {
                    cb(null, 1, 2, 3);
                });
            });

            promisified().then(function (result) {
                test.deepEqual(result, [1, 2, 3], "Unexpected result array");
            }).then(test.done);
        }
    };
}());
