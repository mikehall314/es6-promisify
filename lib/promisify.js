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

// Get a promise object. This may be native, or it may be polyfilled
Promise = require("./promise.js");

// Promise Context object constructor.
function Context(resolve, reject, custom) {
    this.resolve = resolve;
    this.reject = reject;
    this.custom = custom;
}

// Default callback function - rejects on truthy error, otherwise resolves
function callback(ctx, err, result) {
    if (typeof ctx.custom === 'function') {
        var cust = function () {
            // Bind the callback to itself, so the resolve and reject
            // properties that we bound are available to the callback.
            // Then we push it onto the end of the arguments array.
            return ctx.custom.apply(cust, arguments);
        };
        cust.resolve = ctx.resolve;
        cust.reject = ctx.reject;
        cust.call(null, err, result);
    } else {
        if (err) {
            return ctx.reject(err);
        }
        ctx.resolve(result);
    }
}

module.exports = function (original, custom) {
    // Keep original context
    if (custom === true) {
        return function () {
            var originalCtx = this;

            // Parse out the original arguments
            var args = Array.prototype.slice.call(arguments);

            // Return the promisified function
            return new Promise(function (resolve, reject) {
                var then = function (err, result) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(result);
                };

                // Append the callback bound to the context
                args.push(then);

                // Call the function
                original.apply(originalCtx, args);
            });
        };
    }

    return function () {
        // Parse out the original arguments
        var args = Array.prototype.slice.call(arguments);

        // Return the promisified function
        return new Promise(function (resolve, reject) {
            // Create a Context object
            var ctx = new Context(resolve, reject, custom);

            // Append the callback bound to the context
            args.push(callback.bind(null, ctx));

            // Call the function
            original.apply(original, args);
        });
    };
};
