"use client";
import { objectWithoutProperties as _objectWithoutProperties, objectSpread2 as _objectSpread2 } from '../../../_virtual/_rollupPluginBabelHelpers.js';
import { Dialog } from '@base-ui-components/react/dialog';
import { dialogistClasses } from '../../classes.js';
import { classNames } from '../../utils/classNames.js';
import { jsx } from 'react/jsx-runtime';

var _excluded = ["id", "className", "children"],
  _excluded2 = ["id", "className", "style", "children"];
var BaseUiTitle = function BaseUiTitle(_ref) {
  var id = _ref.id,
    className = _ref.className,
    children = _ref.children,
    rest = _objectWithoutProperties(_ref, _excluded);
  return /*#__PURE__*/jsx(Dialog.Title, _objectSpread2(_objectSpread2({}, rest), {}, {
    id: id,
    className: classNames(dialogistClasses.title, className),
    children: children
  }));
};
BaseUiTitle.displayName = "BaseUiTitle";

/**
 * Base UI content slot. Uses `Dialog.Description` so Base UI links it to the popup via
 * `aria-describedby`. Falls back to a plain `<div>` semantic, but Base UI's component
 * adds the wiring for free.
 */
var BaseUiContent = function BaseUiContent(_ref2) {
  var id = _ref2.id,
    className = _ref2.className,
    style = _ref2.style,
    children = _ref2.children,
    rest = _objectWithoutProperties(_ref2, _excluded2);
  return /*#__PURE__*/jsx(Dialog.Description, _objectSpread2(_objectSpread2({}, rest), {}, {
    id: id,
    className: classNames(dialogistClasses.content, className),
    style: style,
    render: function render(props) {
      return /*#__PURE__*/jsx("div", _objectSpread2({}, props));
    },
    children: children
  }));
};
BaseUiContent.displayName = "BaseUiContent";

export { BaseUiContent, BaseUiTitle };
//# sourceMappingURL=BaseUiSlots.js.map
