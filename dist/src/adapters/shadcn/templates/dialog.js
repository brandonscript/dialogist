import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2 } from '../../../../_virtual/_rollupPluginBabelHelpers.js';
import { Dialog as Dialog$1 } from '@base-ui-components/react/dialog';
import { jsx, jsxs } from 'react/jsx-runtime';

var _excluded = ["open", "onClose", "children", "className", "hideBackdrop", "id"],
  _excluded2 = ["className", "children"],
  _excluded3 = ["className", "children"];
// Replace this with your shadcn `cn` helper if you have one.
var cn = function cn() {
  for (var _len = arguments.length, classes = new Array(_len), _key = 0; _key < _len; _key++) {
    classes[_key] = arguments[_key];
  }
  return classes.filter(Boolean).join(" ");
};
var Dialog = function Dialog(_ref) {
  var open = _ref.open,
    onClose = _ref.onClose,
    children = _ref.children,
    className = _ref.className,
    hideBackdrop = _ref.hideBackdrop,
    id = _ref.id,
    rest = _objectWithoutProperties(_ref, _excluded);
  var handleOpenChange = function handleOpenChange(next) {
    if (!next) onClose();
  };
  return /*#__PURE__*/jsx(Dialog$1.Root, {
    open: open,
    onOpenChange: handleOpenChange,
    children: /*#__PURE__*/jsxs(Dialog$1.Portal, {
      children: [!hideBackdrop && /*#__PURE__*/jsx(Dialog$1.Backdrop, {
        className: cn("fixed inset-0 z-50 bg-black/50", "data-[state=open]:animate-in data-[state=closed]:animate-out", "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0")
      }), /*#__PURE__*/jsx(Dialog$1.Popup, {
        id: id,
        "aria-labelledby": rest["aria-labelledby"],
        "aria-describedby": rest["aria-describedby"],
        className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]", "gap-4 border bg-background p-6 shadow-lg sm:rounded-lg", "data-[state=open]:animate-in data-[state=closed]:animate-out", "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
        children: children
      })]
    })
  });
};
var DialogTitle = function DialogTitle(_ref2) {
  var className = _ref2.className,
    children = _ref2.children,
    props = _objectWithoutProperties(_ref2, _excluded2);
  return /*#__PURE__*/jsx(Dialog$1.Title, _objectSpread2(_objectSpread2({}, props), {}, {
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    children: children
  }));
};
var DialogContent = function DialogContent(_ref3) {
  var className = _ref3.className,
    children = _ref3.children,
    props = _objectWithoutProperties(_ref3, _excluded3);
  return /*#__PURE__*/jsx(Dialog$1.Description, _objectSpread2(_objectSpread2({}, props), {}, {
    className: cn("text-sm text-muted-foreground", className),
    render: function render(p) {
      return /*#__PURE__*/jsx("div", _objectSpread2({}, p));
    },
    children: children
  }));
};

export { Dialog, DialogContent, DialogTitle };
//# sourceMappingURL=dialog.js.map
