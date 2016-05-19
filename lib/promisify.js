/*jslint node, this, es6, maxlen: 120 */
module.exports = (function () {

    "use strict";

    // Get a promise object. This may be native, or it may be polyfilled
    const ES6Promise = require("./promise.js");

    /**
     * thatLooksLikeAPromiseToMe()
     *
     * Duck-types a promise.
     *
     * @param {object} o
     * @return {bool} True if this resembles a promise
     */
    function thatLooksLikeAPromiseToMe(o) {
        return o && typeof o.then === "function" && typeof o.catch === "function";
    }

    /**
     * promisify()
     *
     * Transforms callback-based function -- func(arg1, arg2 .. argN, callback) -- into
     * an ES6-compatible Promise. Promisify provides a default callback of the form (error, result)
     * and rejects when `error` is truthy. You can also supply settings object as the second argument.
     *
     * @param {function} original - The function to promisify
     * @param {object} settings - Settings object
     * @param {object} settings.thisArg - A `this` context to use. If not set, assume `settings` _is_ `thisArg`
     * @param {bool} settings.multiArgs - Should multiple arguments be returned as an array?
     * @return {function} A promisified version of `original`
     */
    return function promisify(original, settings) {

        return function (...args) {

            const returnMultipleArguments = settings && settings.multiArgs;

            let that = undefined;
            if (settings && settings.thisArg) {
                that = settings.thisArg;
            } else if (settings) {
                that = settings;
            }

            // Return the promisified function
            return new ES6Promise(function (resolve, reject) {

                // Append the callback bound to the context
                args.push(function callback(err, ...args) {

                    if (err) {
                        return reject(err);
                    }

                    if (false === !!returnMultipleArguments) {
                        return resolve(args[0]);
                    }

                    resolve(args);
                });

                // Call the function
                const response = original.apply(that, args);

                // If it looks like original already returns a promise,
                // then just resolve with that promise. Hopefully, the callback function we added will just be ignored.
                if (thatLooksLikeAPromiseToMe(response)) {
                    resolve(response);
                }
            });
        };
    };
}());
