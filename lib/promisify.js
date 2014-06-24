/*jslint node: true, maxlen: 128 */

/**
 * promisify
 *
 * Transforms callback-based function -- func(arg1, arg2 .. argN, callback) -- into
 * an ES6-compatible Promise. User can provide their own callback function; otherwise
 * promisify provides a callback of the form (error, result) and rejects on truthy error.
 * If supplying your own callback function, use this.resolve() and this.reject().
 *
 * @param {Function} original The function to promisify
 * @param {Function} callback Optional custom callbac function
 * @return {Function} A promisified version of 'original'
 */

"use strict";

var Promise;

// Use the ES6 Promise library by @jaffathecake
Promise = require("es6-promise").Promise;

// Default callback function - rejects on truthy error, otherwise resolves
function defaultCallback(err, result) {
    // These lines fail jslint :( because it looks like a strict-mode
    // violation. If this function was called directly, that would be
    // true -- but we only call this function with it bound to an
    // appropriate context, so in practice this doesn't happen.  But
    // jslint is right -- and if anyone can think of a better way to do
    // it then send me a pull request!
    // https://github.com/twistdigital/es6-promisify/issues
    if (err) {
        return this.reject(err);
    }
    this.resolve(result);
}

module.exports = function (original, cb) {

    // If a callback is supplied, use it. Otherwise, use the default
    var originalCallback = cb || defaultCallback;

    return function () {

        var callback, args;

        callback = (function (callback) {
            var newCallback = function () {
                callback.apply(newCallback, arguments);
            };
            return newCallback;
        }(originalCallback));

        // Parse out the original arguments
        args = Array.prototype.slice.call(arguments);

        // Return the promisified function
        return new Promise(function (resolve, reject) {

            // Attach the resolve and reject functions to the callback
            callback.resolve = resolve;
            callback.reject  = reject;

            // Bind the callback to itself, so the resolve and reject
            // properties that we bound are available to the callback.
            // Then we push it onto the end of the arguments array.
            args.push(callback.bind(callback));

            // Call the function
            original.apply(original, args);
        });
    };
};
