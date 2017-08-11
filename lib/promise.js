/* global self, window, module, global, require */
module.exports = (function () {

    "use strict";

    let globalObject;

    function isFunction(x) {
        return typeof x === "function";
    }

    // Seek the global object
    if (global !== undefined) {
        globalObject = global;
    } else if (window !== undefined && window.document) {
        globalObject = window;
    } else {
        globalObject = self;
    }

    // Test for any native promise implementation, and if that
    // implementation appears to conform to the specificaton.
    // This code mostly nicked from the es6-promise module polyfill
    // and then fooled with.
    const hasPromiseSupport = (function () {

        // No promise object at all, and it's a non-starter
        if ((globalObject === undefined) || (globalObject.hasOwnProperty === undefined) || !globalObject.hasOwnProperty("Promise")) {
            return false;
        }

        // There is a Promise object. Does it conform to the spec?
        const P = globalObject.Promise;

        // Some of these methods are missing from
        // Firefox/Chrome experimental implementations
        if (!P.hasOwnProperty("resolve") || !P.hasOwnProperty("reject")) {
            return false;
        }

        if (!P.hasOwnProperty("all") || !P.hasOwnProperty("race")) {
            return false;
        }

        // Older version of the spec had a resolver object
        // as the arg rather than a function
        return (function () {

            let resolve;

            const p = new globalObject.Promise(function (r) {
                resolve = r;
            });

            if (p) {
                return isFunction(resolve);
            }

            return false;
        }());
    }());

    // Export the native Promise implementation if it
    // looks like it matches the spec
    if (hasPromiseSupport) {
        return globalObject.Promise;
    }

    //  Otherwise, return the es6-promise polyfill by @jaffathecake.
    return require("es6-promise").Promise;

}());
