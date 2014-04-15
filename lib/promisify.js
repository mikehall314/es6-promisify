/*jslint node: true, maxlen: 120 */

/**
 * Promisify
 *
 * Transforms a standard NodeJS func(arg1, arg2 .. argN, callback)
 * into an ES6-compatible promise, assuming the callback
 * takes (error, result)
 *
 * @param {Function} original The function to promisify
 * @return {Function} A promisified version of the function
 */

"use strict";

var Promise;

// Use the ES6 Promise library by @jaffathecake
Promise = require("es6-promise").Promise;

module.exports = function (original, context) {

    // If a context is passed, we call the function with that as the
    // 'this' context.  This can be useful when promisifying methods
    // Otherwise, we just pass the function itself as 'this'.
    context = context || original;

    return function () {

        // Parse out the original arguments
        var args = Array.prototype.slice.call(arguments);

        // Return the promisified function
        return new Promise(function (resolve, reject) {

            // Add our own callback function to the end of the
            // arguments array, and reject or resolve as required.
            args.push(function (err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });

            // Call the function
            original.apply(context, args);
        });
    };
};
