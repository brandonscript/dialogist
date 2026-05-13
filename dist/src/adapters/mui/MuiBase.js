"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2 } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { styled, Dialog } from '@mui/material';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { jsx } from 'react/jsx-runtime';

var _excluded = ["className", "slotProps", "hideBackdrop", "container"];
var MuiBase = styled(function (_ref) {
  var className = _ref.className,
    slotProps = _ref.slotProps,
    hideBackdrop = _ref.hideBackdrop,
    container = _ref.container,
    props = _objectWithoutProperties(_ref, _excluded);
  return /*#__PURE__*/jsx(Dialog, _objectSpread2(_objectSpread2({
    className: classNames(dialogistClasses.base, className)
  }, props), {}, {
    container: container,
    disableAutoFocus: props.disableAutoFocus,
    disableEnforceFocus: props.disableEnforceFocus,
    disableRestoreFocus: props.disableRestoreFocus,
    PaperProps: _objectSpread2({
      className: classNames(dialogistClasses.rootPaper)
    }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.paper),
    slotProps: {
      backdrop: hideBackdrop ? {
        style: {
          display: "none"
        }
      } : _objectSpread2({
        className: dialogistClasses.backdrop
      }, slotProps === null || slotProps === void 0 ? void 0 : slotProps.backdrop)
    }
  }));
}, {
  shouldForwardProp: function shouldForwardProp(prop) {
    return prop !== "overflow" && prop !== "borderRadius";
  }
})(function (_ref2) {
  var overflow = _ref2.overflow;
  return {
    overflow: overflow || "hidden"
  };
});
MuiBase.displayName = "MuiBase";

export { MuiBase };
//# sourceMappingURL=MuiBase.js.map
