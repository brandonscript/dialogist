"use client";
import { toConsumableArray as _toConsumableArray } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useDeepMemo } from './useDeepCompare.js';

var useMemoizedDialogParts = function useMemoizedDialogParts(parts) {
  var deps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var _deps$titleDeps = deps.titleDeps,
    titleDeps = _deps$titleDeps === void 0 ? [] : _deps$titleDeps,
    _deps$contentDeps = deps.contentDeps,
    contentDeps = _deps$contentDeps === void 0 ? [] : _deps$contentDeps,
    _deps$propsDeps = deps.propsDeps,
    propsDeps = _deps$propsDeps === void 0 ? [] : _deps$propsDeps,
    _deps$actionsDeps = deps.actionsDeps,
    actionsDeps = _deps$actionsDeps === void 0 ? [] : _deps$actionsDeps,
    _deps$footerDeps = deps.footerDeps,
    footerDeps = _deps$footerDeps === void 0 ? [] : _deps$footerDeps,
    _deps$statusBarDeps = deps.statusBarDeps,
    statusBarDeps = _deps$statusBarDeps === void 0 ? [] : _deps$statusBarDeps;
  var memoizedStatusBar = useDeepMemo(function () {
    return parts.statusBar;
  }, [parts.statusBar].concat(_toConsumableArray(statusBarDeps)));
  var memoizedTitle = useDeepMemo(function () {
    return parts.title;
  }, [parts.title].concat(_toConsumableArray(titleDeps)));
  var memoizedContent = useDeepMemo(function () {
    return parts.content;
  }, [parts.content].concat(_toConsumableArray(contentDeps)));
  var memoizedProps = useDeepMemo(function () {
    return parts.props || {};
  }, [parts.props].concat(_toConsumableArray(propsDeps)));
  var memoizedActions = useDeepMemo(function () {
    return parts.actions || [];
  }, [parts.actions].concat(_toConsumableArray(actionsDeps)));
  var memoizedFooter = useDeepMemo(function () {
    return parts.footer;
  }, [parts.footer].concat(_toConsumableArray(footerDeps)));
  return {
    statusBar: memoizedStatusBar,
    title: memoizedTitle,
    content: memoizedContent,
    props: memoizedProps,
    actions: memoizedActions,
    footer: memoizedFooter
  };
};

export { useMemoizedDialogParts };
//# sourceMappingURL=useMemoizedDialogParts.js.map
