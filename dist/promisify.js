"use strict";

/*jslint node, this, es6, maxlen: 120 */
module.exports = function () {

    "use strict";

    // Get a promise object. This may be native, or it may be polyfilled

    var ES6Promise = require("./promise.js");

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

        return function () {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            var returnMultipleArguments = settings && settings.multiArgs;

            var that = undefined;
            if (settings && settings.thisArg) {
                that = settings.thisArg;
            } else if (settings) {
                that = settings;
            }

            // Return the promisified function
            return new ES6Promise(function (resolve, reject) {

                // Append the callback bound to the context
                args.push(function callback(err) {

                    if (err) {
                        return reject(err);
                    }

                    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                        args[_key2 - 1] = arguments[_key2];
                    }

                    if (false === !!returnMultipleArguments) {
                        return resolve(args[0]);
                    }

                    resolve(args);
                });

                // Call the function
                original.apply(that, args);
            });
        };
    };
}();