/**
 * Merges partial handler objects left-to-right. For the same key:
 * - Two **functions** are **chained** (earlier runs first, then later).
 * - Otherwise the **later value wins** (including a non-function replacing an earlier function).
 */
var chainEventHandlers = function chainEventHandlers() {
  var result = {};
  for (var _len = arguments.length, handlers = new Array(_len), _key = 0; _key < _len; _key++) {
    handlers[_key] = arguments[_key];
  }
  for (var _i = 0, _handlers = handlers; _i < _handlers.length; _i++) {
    var obj = _handlers[_i];
    if (!obj) continue;
    var _loop = function _loop() {
      var key = _Object$keys[_i2];
      var current = result[key];
      var next = obj[key];
      if (typeof current === "function" && typeof next === "function") {
        result[key] = function () {
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          current.apply(void 0, args);
          next.apply(void 0, args);
        };
      } else {
        result[key] = next;
      }
    };
    for (var _i2 = 0, _Object$keys = Object.keys(obj); _i2 < _Object$keys.length; _i2++) {
      _loop();
    }
  }
  return result;
};

export { chainEventHandlers };
//# sourceMappingURL=chainEventHandlers.js.map
