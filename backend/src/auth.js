// Compatibility shim:
// keep legacy test/runtime imports (`require('./auth')`) working after
// TypeScript/Nest migration that renamed the original module to `auth.js.bak`.
module.exports = require('./auth.js.bak');
