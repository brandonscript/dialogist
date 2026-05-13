"use client";
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { DialogistAdapterProvider } from '../../context/DialogistAdapterContext.js';
import { jsx } from 'react/jsx-runtime';

var MuiDialogistAdapterProvider = function MuiDialogistAdapterProvider(_ref) {
  var children = _ref.children;
  var theme = useTheme();
  var adapter = useMemo(function () {
    var _theme$transitions, _theme$transitions$ea, _theme$transitions2;
    return {
      resolveSpacing: function resolveSpacing(value, fallback) {
        var v = value === undefined ? fallback : value;
        return typeof v === "number" ? theme.spacing(v) : v;
      },
      transitionDuration: typeof ((_theme$transitions = theme.transitions) === null || _theme$transitions === void 0 || (_theme$transitions = _theme$transitions.duration) === null || _theme$transitions === void 0 ? void 0 : _theme$transitions.shortest) === "number" ? theme.transitions.duration.shortest : 150,
      transitionEasing: (_theme$transitions$ea = (_theme$transitions2 = theme.transitions) === null || _theme$transitions2 === void 0 || (_theme$transitions2 = _theme$transitions2.easing) === null || _theme$transitions2 === void 0 ? void 0 : _theme$transitions2.easeOut) !== null && _theme$transitions$ea !== void 0 ? _theme$transitions$ea : "cubic-bezier(0.4, 0, 0.2, 1)"
    };
  }, [theme]);
  return /*#__PURE__*/jsx(DialogistAdapterProvider, {
    value: adapter,
    children: children
  });
};
MuiDialogistAdapterProvider.displayName = "MuiDialogistAdapterProvider";

export { MuiDialogistAdapterProvider };
//# sourceMappingURL=MuiDialogistAdapterProvider.js.map
