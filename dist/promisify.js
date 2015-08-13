/*jslint node, this, es6, maxlen: 120 */
"use strict";

module.exports = (function () {

    "use strict";

    // Get a promise object. This may be native, or it may be polyfilled
    var ES6Promise = require("./promise.js");

    // Promise Context object constructor.
    function Context(resolve, reject, custom) {
        this.resolve = resolve;
        this.reject = reject;
        this.custom = custom;
    }

    // Default callback function - rejects on truthy error, otherwise resolves
    function callback() {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        var ctx = args.shift(),
            err = args.shift(),
            cust = undefined;

        args = args.length > 1 ? args : args[0];

        if (typeof ctx.custom === 'function') {
            cust = function () {
                for (var _len2 = arguments.length, custArgs = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                    custArgs[_key2] = arguments[_key2];
                }

                // Bind the callback to itself, so the resolve and reject
                // properties that we bound are available to the callback.
                // Then we push it onto the end of the arguments array.
                return ctx.custom.apply(cust, custArgs);
            };
            cust.resolve = ctx.resolve;
            cust.reject = ctx.reject;
            cust.call(null, err, args);
        } else {
            if (err) {
                return ctx.reject(err);
            }
            ctx.resolve(args);
        }
    }

    /**
     * promisify
     *
     * Transforms callback-based function -- func(arg1, arg2 .. argN, callback) -- into
     * an ES6-compatible Promise. User can provide their own callback function; otherwise
     * promisify provides a callback of the form (error, result) and rejects on truthy error.
     * If supplying your own callback function, use this.resolve() and this.reject().
     *
     * @param {function} original - The function to promisify
     * @param {function} callback - Optional custom callbac function
     *
     * @return {function} A promisified version of 'original'
     */
    return function (original, custom) {

        return function () {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            // Store original context
            var that = this;

            // Return the promisified function
            return new ES6Promise(function (resolve, reject) {

                // Create a Context object
                var ctx = new Context(resolve, reject, custom);

                // Append the callback bound to the context
                args.push(callback.bind(null, ctx));

                // Call the function
                original.apply(that, args);
            });
        };
    };
})();