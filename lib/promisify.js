// Symbols is a better way to do this, but not all browsers have good support,
// so instead we'll just make do with a very unlikely string.
const customArgumentsToken = "__ES6-PROMISIFY--CUSTOM-ARGUMENTS__";

/**
 * promisify()
 * Transforms callback-based function -- func(arg1, arg2 .. argN, callback) --
 * into an ES6-compatible Promise. Promisify provides a default callback of the
 * form (error, result) and rejects when `error` is truthy.
 *
 * @param {function} original - The function to promisify
 * @return {function} A promisified version of `original`
 */
function promisify(original) {
    // Ensure the argument is a function
    if (typeof original !== "function") {
        throw new TypeError("Argument to promisify must be a function");
    }

    // If the user has asked us to decode argument names for them, honour that
    const argumentNames = original[customArgumentsToken];

    // If the user has supplied a custom Promise implementation, use it.
    // Otherwise fall back to whatever we can find on the global object.
    const ES6Promise = promisify.Promise || Promise;

    // If we can find no Promise implemention, then fail now.
    if (typeof ES6Promise !== "function") {
        throw new Error(
            "No Promise implementation found; do you need a polyfill?"
        );
    }

    return function(...args) {
        return new ES6Promise((resolve, reject) => {
            // Append the callback bound to the context
            args.push(function callback(err, ...values) {
                if (err) {
                    return reject(err);
                }

                if (values.length === 1 || !argumentNames) {
                    return resolve(values[0]);
                }

                const o = {};
                values.forEach((value, index) => {
                    const name = argumentNames[index];
                    if (name) {
                        o[name] = value;
                    }
                });

                resolve(o);
            });

            // Call the function.
            original.call(this, ...args);
        });
    };
}

// Attach this symbol to the exported function, so users can use it
promisify.argumentNames = customArgumentsToken;
promisify.Promise = undefined;

// Export the public API
export {promisify};
