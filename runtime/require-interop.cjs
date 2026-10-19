"use strict";

// CJS interop shim for the ESM-only package. On Node >= 22.12 `require()` of
// the ESM entry returns a module namespace object; unwrap the default export
// so CJS consumers get the plugin factory directly, as they always did.
const ns = require("./index.js");
module.exports = ns && ns.default !== undefined ? ns.default : ns;
