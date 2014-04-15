# es6-promisify

Converts callback-based functions to Promise-based functions, with [es6-promise](https://github.com/jakearchibald/es6-promise).

## Install

Install with [npm](https://npmjs.org/package/es6-promisify)

```bash
npm install --save es6-promisify
```

## Example

```js
"use strict";

// Declare variables
var promisify, fs, stat;

// Load modules
promisify = require("es6-promisify");
fs        = require("fs");

// Convert the stat function
stat = promisify(fs.stat);

// Now usable as a promise!
stat("example.txt").then(function (stats) {
    console.log("Got stats", stats);
}).catch(function () {
    console.error("Yikes!");
});
```

Published under the [MIT License](http://opensource.org/licenses/MIT).
