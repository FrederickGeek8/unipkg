const buildTools = require("./build");
// const scanTools = require("./scan");

var funcs = {};
function extract(obj) {
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (prop in funcs) {
      /*
        If the function exists in the dictionary, then we assume that it is an
        internal method and does not need to be exported
      */
      delete funcs[prop];
    } else {
      funcs[prop] = obj[prop];
    }
  });
}

extract(buildTools);
// extract(scanTools);

module.exports = funcs;
