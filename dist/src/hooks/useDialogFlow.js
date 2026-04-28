"use client";
import { asyncToGenerator as _asyncToGenerator, regenerator as _regenerator, objectSpread2 as _objectSpread2, toConsumableArray as _toConsumableArray, typeof as _typeof, createForOfIteratorHelper as _createForOfIteratorHelper } from '../../_virtual/_rollupPluginBabelHelpers.js';
import { useRef, useCallback } from 'react';
import { dialogistClasses } from '../classes.js';
import { useDialog } from '../useDialog.js';

// --- Public types ---

/**
 * Base event passed to step lifecycle hooks (onEnd, onCancel, onBack).
 * Contains the current step, previous step, and optional imperative dialog state.
 */

/**
 * Event passed to resolveStep. Extends FlowStepEvent with the close reason so routing logic
 * can branch on what the user actually did (next, back, end, or cancel).
 */

/**
 * Return type for resolveStep:
 * - A step name — navigate to that step.
 * - `"end"` — explicitly finish the flow regardless of the configured `next`.
 * - `"back"` — go back to the previous step.
 * - `"start"` — restart from the initial step.
 * - `undefined` — fall through to default routing (respects the configured `next` target,
 *   or ends the flow if none is configured).
 */

// --- Internal sentinel for flow-driven action resolution ---

var DEFAULT_CANCEL_ORDER = -1;
var DEFAULT_BACK_ORDER = 0;
var CUSTOM_ORDER_BASE = 10;
var NEXT_ORDER_BASE = 100;

// --- Internal helpers ---

// biome-ignore lint/suspicious/noExplicitAny: internal type alias for unparameterized flow steps

// biome-ignore lint/suspicious/noExplicitAny: internal type alias for unparameterized flow defaults

var isFlowActionValue = function isFlowActionValue(v) {
  if (!v || _typeof(v) !== "object" || !("__flowAction" in v)) return false;
  var a = v;
  return a.__flowAction === "cancel" || a.__flowAction === "back" || a.__flowAction === "next";
};
var decodeFlowAction = function decodeFlowAction(resolveValue) {
  if (!isFlowActionValue(resolveValue)) return undefined;
  if (resolveValue.__flowAction === "cancel") return {
    kind: "cancel"
  };
  if (resolveValue.__flowAction === "back") return {
    kind: "back"
  };
  var step = resolveValue.step === undefined ? "end" : resolveValue.step;
  return {
    kind: "next",
    step: step
  };
};

/** Flow-built Cancel / Back vs step actions + Next/Finish (always two groups for layout). */
var flowActionNavSide = function flowActionNavSide(a) {
  var d = decodeFlowAction(a.resolveValue);
  return (d === null || d === void 0 ? void 0 : d.kind) === "cancel" || (d === null || d === void 0 ? void 0 : d.kind) === "back" ? "left" : "right";
};
var toGroupedFlowActions = function toGroupedFlowActions(flat) {
  var left = [];
  var right = [];
  var _iterator = _createForOfIteratorHelper(flat),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var action = _step.value;
      (flowActionNavSide(action) === "left" ? left : right).push(action);
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  if (left.length === 0 || right.length === 0) return flat;
  return [left, right];
};
var resolveNextTargets = function resolveNextTargets(next, defaults, steps) {
  var _next$label;
  var labelForStep = function labelForStep(stepName) {
    var _defaults$end$label, _defaults$end, _steps$stepName$nextL, _steps$stepName;
    return stepName === "end" ? (_defaults$end$label = defaults === null || defaults === void 0 || (_defaults$end = defaults.end) === null || _defaults$end === void 0 ? void 0 : _defaults$end.label) !== null && _defaults$end$label !== void 0 ? _defaults$end$label : "Finish" : (_steps$stepName$nextL = (_steps$stepName = steps[stepName]) === null || _steps$stepName === void 0 ? void 0 : _steps$stepName.nextLabel) !== null && _steps$stepName$nextL !== void 0 ? _steps$stepName$nextL : "Next";
  };
  if (next === undefined) {
    var _defaults$end$label2, _defaults$end2;
    return [{
      step: "end",
      label: (_defaults$end$label2 = defaults === null || defaults === void 0 || (_defaults$end2 = defaults.end) === null || _defaults$end2 === void 0 ? void 0 : _defaults$end2.label) !== null && _defaults$end$label2 !== void 0 ? _defaults$end$label2 : "Finish"
    }];
  }
  if (typeof next === "string") {
    return [{
      step: next,
      label: labelForStep(next)
    }];
  }
  if (Array.isArray(next)) {
    return next.map(function (t) {
      var _t$label;
      return typeof t === "string" ? {
        step: t,
        label: labelForStep(t)
      } : _objectSpread2(_objectSpread2({}, t), {}, {
        label: (_t$label = t.label) !== null && _t$label !== void 0 ? _t$label : labelForStep(t.step)
      });
    });
  }
  return [_objectSpread2(_objectSpread2({}, next), {}, {
    label: (_next$label = next.label) !== null && _next$label !== void 0 ? _next$label : labelForStep(next.step)
  })];
};
var shouldShowCancel = function shouldShowCancel(stepName, cancel) {
  if (!(cancel !== null && cancel !== void 0 && cancel.show)) return false;
  if (cancel.show === "always") return true;
  return cancel.show.includes(stepName);
};
var buildStepActions = function buildStepActions(stepName, step, isFirstStep, defaults, isBackNewlyAppearing, steps) {
  var _defaults$back, _defaults$back$label, _defaults$back2, _defaults$back3, _defaults$back4, _step$actions;
  var cancelCfg = defaults === null || defaults === void 0 ? void 0 : defaults.cancel;
  var ordered = [];
  var seq = 0;
  if (shouldShowCancel(stepName, cancelCfg)) {
    var _cancelCfg$order, _cancelCfg$label;
    ordered.push({
      order: (_cancelCfg$order = cancelCfg === null || cancelCfg === void 0 ? void 0 : cancelCfg.order) !== null && _cancelCfg$order !== void 0 ? _cancelCfg$order : DEFAULT_CANCEL_ORDER,
      seq: seq++,
      action: {
        children: (_cancelCfg$label = cancelCfg === null || cancelCfg === void 0 ? void 0 : cancelCfg.label) !== null && _cancelCfg$label !== void 0 ? _cancelCfg$label : "Cancel",
        props: _objectSpread2({
          variant: "text"
        }, cancelCfg === null || cancelCfg === void 0 ? void 0 : cancelCfg.props),
        resolveValue: {
          __flowAction: "cancel"
        },
        preserveBackdrop: true
      }
    });
  }
  var userBackClassName = defaults === null || defaults === void 0 || (_defaults$back = defaults.back) === null || _defaults$back === void 0 || (_defaults$back = _defaults$back.props) === null || _defaults$back === void 0 ? void 0 : _defaults$back.className;
  var backAppearClass = isBackNewlyAppearing ? dialogistClasses.flowBackAppear : undefined;
  ordered.push({
    order: DEFAULT_BACK_ORDER,
    seq: seq++,
    action: {
      children: (_defaults$back$label = defaults === null || defaults === void 0 || (_defaults$back2 = defaults.back) === null || _defaults$back2 === void 0 ? void 0 : _defaults$back2.label) !== null && _defaults$back$label !== void 0 ? _defaults$back$label : "Back",
      props: isFirstStep ? _objectSpread2(_objectSpread2({
        variant: "outlined"
      }, defaults === null || defaults === void 0 || (_defaults$back3 = defaults.back) === null || _defaults$back3 === void 0 ? void 0 : _defaults$back3.props), {}, {
        disabled: true,
        style: {
          visibility: "hidden"
        }
      }) : _objectSpread2(_objectSpread2({
        variant: "outlined"
      }, defaults === null || defaults === void 0 || (_defaults$back4 = defaults.back) === null || _defaults$back4 === void 0 ? void 0 : _defaults$back4.props), backAppearClass || userBackClassName ? {
        className: [backAppearClass, userBackClassName].filter(Boolean).join(" ")
      } : {}),
      resolveValue: {
        __flowAction: "back"
      },
      preserveBackdrop: true
    }
  });
  ((_step$actions = step.actions) !== null && _step$actions !== void 0 ? _step$actions : []).forEach(function (action, i) {
    var _action$order;
    ordered.push({
      order: (_action$order = action.order) !== null && _action$order !== void 0 ? _action$order : CUSTOM_ORDER_BASE + i,
      seq: seq++,
      action: {
        id: action.id,
        children: action.label,
        props: _objectSpread2(_objectSpread2({}, action.props), action.onClick ? {
          onClick: function onClick(e) {
            var _action$onClick, _action$props, _action$props$onClick;
            (_action$onClick = action.onClick) === null || _action$onClick === void 0 || _action$onClick.call(action);
            (_action$props = action.props) === null || _action$props === void 0 || (_action$props$onClick = _action$props.onClick) === null || _action$props$onClick === void 0 || _action$props$onClick.call(_action$props, e);
          }
        } : {})
      }
    });
  });
  var targets = resolveNextTargets(step.next, defaults, steps);
  targets.forEach(function (t, i) {
    var _t$canProceed, _t$label2, _defaults$end$label3, _defaults$end3, _t$order, _defaults$end4, _defaults$next;
    var can = (_t$canProceed = t.canProceed) === null || _t$canProceed === void 0 ? void 0 : _t$canProceed.call(t, {
      dialogState: undefined
    });
    var disabled = can === false;
    var label = (_t$label2 = t.label) !== null && _t$label2 !== void 0 ? _t$label2 : t.step === "end" ? (_defaults$end$label3 = defaults === null || defaults === void 0 || (_defaults$end3 = defaults.end) === null || _defaults$end3 === void 0 ? void 0 : _defaults$end3.label) !== null && _defaults$end$label3 !== void 0 ? _defaults$end$label3 : "Finish" : "Next";
    var isFinishTarget = t.step === "end";
    ordered.push({
      order: (_t$order = t.order) !== null && _t$order !== void 0 ? _t$order : NEXT_ORDER_BASE + i,
      seq: seq++,
      action: {
        children: label,
        props: _objectSpread2(_objectSpread2({
          variant: "contained"
        }, isFinishTarget ? defaults === null || defaults === void 0 || (_defaults$end4 = defaults.end) === null || _defaults$end4 === void 0 ? void 0 : _defaults$end4.props : defaults === null || defaults === void 0 || (_defaults$next = defaults.next) === null || _defaults$next === void 0 ? void 0 : _defaults$next.props), {}, {
          disabled: disabled
        }),
        resolveValue: {
          __flowAction: "next",
          step: t.step
        },
        preserveBackdrop: true
      }
    });
  });
  ordered.sort(function (a, b) {
    return a.order - b.order || a.seq - b.seq;
  });
  var flat = ordered.map(function (o) {
    return o.action;
  });
  return toGroupedFlowActions(flat);
};
var buildStepConfig = function buildStepConfig(stepName, step, compositeKey, isFirstStep, defaults) {
  var _step$maxWidth, _step$minWidth, _step$width;
  var isBackNewlyAppearing = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
  var steps = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};
  var actions = buildStepActions(stepName, step, isFirstStep, defaults, isBackNewlyAppearing, steps);
  var mergedActionsStyle = _objectSpread2(_objectSpread2({}, defaults === null || defaults === void 0 ? void 0 : defaults.actionsStyle), step.actionsStyle);
  var actionsStyle = Object.keys(mergedActionsStyle).length > 0 ? mergedActionsStyle : undefined;
  return _objectSpread2(_objectSpread2({
    type: "custom",
    dialogKey: compositeKey,
    title: step.title
  }, step.content !== undefined ? {
    content: step.content
  } : step.message !== undefined ? {
    message: step.message
  } : {
    message: " "
  }), {}, {
    maxWidth: (_step$maxWidth = step.maxWidth) !== null && _step$maxWidth !== void 0 ? _step$maxWidth : defaults === null || defaults === void 0 ? void 0 : defaults.maxWidth,
    minWidth: (_step$minWidth = step.minWidth) !== null && _step$minWidth !== void 0 ? _step$minWidth : defaults === null || defaults === void 0 ? void 0 : defaults.minWidth,
    width: (_step$width = step.width) !== null && _step$width !== void 0 ? _step$width : defaults === null || defaults === void 0 ? void 0 : defaults.width,
    actions: actions
  }, actionsStyle ? {
    actionsStyle: actionsStyle
  } : {});
};

/** Builds the per-step dialog key used by {@link useDialogFlow} (flow key + step segment). */
var flowStepKey = function flowStepKey(dialogKey, stepName) {
  return Array.isArray(dialogKey) ? [].concat(_toConsumableArray(dialogKey), [stepName]) : [String(dialogKey), stepName];
};

/**
 * Runs a multi-step dialog flow. Each step opens with a composite {@link DialogKey}: the same key
 * you pass to this hook, with the step name appended as the final segment (e.g. flow
 * `"checkout"` and step `"shipping"` → `["checkout", "shipping"]`).
 *
 * For reactive content while a step is visible, register slots with that same composite key:
 * `useDialogSlots(["checkout", "shipping"], { ... })`. If the step name is a variable, use
 * `["checkout", stepName]` or `[...rootSegments, stepName]` when the flow key is an array.
 *
 * To close from outside without knowing the active step, call `useDialog(flowRoot).close()` on
 * the same root key — prefix matching resolves the open composite key.
 *
 * Paper sizing (`maxWidth`, `minWidth`, `width`) can be set on {@link FlowDefaults} for the whole
 * flow, or on individual {@link FlowStepConfig} entries to override for that step only.
 *
 * Built-in flow actions are always two groups — **Cancel + Back** and **step actions + Next/Finish**
 * — so use {@link FlowDefaults.actionsStyle} `gap` / `intraGroupGap` like {@link DialogConfig.actionsStyle}.
 */
var useDialogFlow = function useDialogFlow(dialogKey, flow) {
  var dialog = useDialog(dialogKey);
  var flowRef = useRef(flow);
  flowRef.current = flow;
  var start = useCallback(/*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(initialStepName) {
      var steps, defaults, stepDef, flowStack, initialKey, initialConfig, lastResult, prevStep, cleanup, _step$onStep, _defaults$onStep, _step$resolveStep, currentStepName, step, flowAction, reason, stepEvent, resolveEvent, _step$onCancel, _defaults$onCancel, _step$onBack, _defaults$onBack, _step$onNext, _defaults$onNext, _step$onEnd, _defaults$onEnd, stepRedirect, finalAction, targetStepName, targetDef, targetIsFirstStep, targetKey, prevConfig, restartKey, restartConfig, nextStepName, nextDef, nextKey, isBackNewlyAppearing, nextConfig, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            steps = flowRef.current.steps;
            defaults = flowRef.current.defaults;
            stepDef = steps[initialStepName];
            if (stepDef) {
              _context.n = 1;
              break;
            }
            throw new Error("[Dialogist] useDialogFlow: Step \"".concat(initialStepName, "\" not found in steps definition."));
          case 1:
            flowStack = [initialStepName];
            initialKey = flowStepKey(dialogKey, initialStepName);
            initialConfig = buildStepConfig(initialStepName, stepDef, initialKey, true, defaults, false, steps);
            _context.n = 2;
            return dialog.open(initialConfig);
          case 2:
            lastResult = _context.v;
            cleanup = function cleanup() {
              dialog.close(undefined, {
                force: true
              });
            };
            _context.p = 3;
          case 4:
            if (!lastResult.blocked) {
              _context.n = 5;
              break;
            }
            return _context.a(3, 22);
          case 5:
            currentStepName = flowStack[flowStack.length - 1];
            step = steps[currentStepName];
            if (step) {
              _context.n = 6;
              break;
            }
            throw new Error("[Dialogist] useDialogFlow: Step \"".concat(currentStepName, "\" not found in steps definition."));
          case 6:
            // 1. Decode base reason from the close event
            flowAction = lastResult.reason === "action" ? decodeFlowAction(lastResult.resolveValue) : undefined;
            reason = void 0;
            if (!flowAction || flowAction.kind === "cancel" || lastResult.reason !== "action") {
              reason = "cancel";
            } else if (flowAction.kind === "back") {
              reason = "back";
            } else {
              reason = flowAction.step === "end" ? "end" : "next";
            }

            // 2. Build event objects
            stepEvent = {
              step: currentStepName,
              prevStep: prevStep,
              dialogState: undefined
            };
            resolveEvent = _objectSpread2(_objectSpread2({}, stepEvent), {}, {
              reason: reason
            }); // 3. Fire per-reason lifecycle hooks (step-level first, then global)
            if (reason === "cancel") {
              (_step$onCancel = step.onCancel) === null || _step$onCancel === void 0 || _step$onCancel.call(step, stepEvent);
              defaults === null || defaults === void 0 || (_defaults$onCancel = defaults.onCancel) === null || _defaults$onCancel === void 0 || _defaults$onCancel.call(defaults, stepEvent);
            } else if (reason === "back") {
              (_step$onBack = step.onBack) === null || _step$onBack === void 0 || _step$onBack.call(step, stepEvent);
              defaults === null || defaults === void 0 || (_defaults$onBack = defaults.onBack) === null || _defaults$onBack === void 0 || _defaults$onBack.call(defaults, stepEvent);
            } else if (reason === "next") {
              (_step$onNext = step.onNext) === null || _step$onNext === void 0 || _step$onNext.call(step, stepEvent);
              defaults === null || defaults === void 0 || (_defaults$onNext = defaults.onNext) === null || _defaults$onNext === void 0 || _defaults$onNext.call(defaults, stepEvent);
            } else {
              // "end"
              (_step$onEnd = step.onEnd) === null || _step$onEnd === void 0 || _step$onEnd.call(step, stepEvent);
              defaults === null || defaults === void 0 || (_defaults$onEnd = defaults.onEnd) === null || _defaults$onEnd === void 0 || _defaults$onEnd.call(defaults, stepEvent);
            }
            // Always fires for every step transition — useful for per-step or global analytics
            (_step$onStep = step.onStep) === null || _step$onStep === void 0 || _step$onStep.call(step, resolveEvent);
            defaults === null || defaults === void 0 || (_defaults$onStep = defaults.onStep) === null || _defaults$onStep === void 0 || _defaults$onStep.call(defaults, resolveEvent);

            // 4. Call resolveStep for routing override (step-level only)
            stepRedirect = (_step$resolveStep = step.resolveStep) === null || _step$resolveStep === void 0 ? void 0 : _step$resolveStep.call(step, resolveEvent); // 5. Determine final routing action
            finalAction = void 0;
            if (!(stepRedirect !== undefined)) {
              _context.n = 7;
              break;
            }
            finalAction = stepRedirect;
            _context.n = 11;
            break;
          case 7:
            _t = reason;
            _context.n = _t === "cancel" ? 8 : _t === "end" ? 8 : _t === "back" ? 9 : _t === "next" ? 10 : 11;
            break;
          case 8:
            finalAction = "end";
            return _context.a(3, 11);
          case 9:
            finalAction = "back";
            return _context.a(3, 11);
          case 10:
            finalAction = flowAction.step;
            return _context.a(3, 11);
          case 11:
            if (!(!finalAction || finalAction === "end")) {
              _context.n = 12;
              break;
            }
            return _context.a(3, 22);
          case 12:
            if (!(finalAction === "back")) {
              _context.n = 17;
              break;
            }
            if (!(flowStack.length <= 1)) {
              _context.n = 13;
              break;
            }
            return _context.a(3, 22);
          case 13:
            flowStack.pop();
            targetStepName = flowStack[flowStack.length - 1];
            if (targetStepName) {
              _context.n = 14;
              break;
            }
            return _context.a(3, 22);
          case 14:
            targetDef = steps[targetStepName];
            if (targetDef) {
              _context.n = 15;
              break;
            }
            return _context.a(3, 22);
          case 15:
            targetIsFirstStep = flowStack.length === 1;
            targetKey = flowStepKey(dialogKey, targetStepName);
            prevStep = currentStepName;
            // Rebuild fresh config with no animation class (Back was already visible on this step).
            prevConfig = buildStepConfig(targetStepName, targetDef, targetKey, targetIsFirstStep, defaults, false, steps);
            _context.n = 16;
            return dialog.replace(prevConfig);
          case 16:
            lastResult = _context.v;
            return _context.a(3, 4);
          case 17:
            if (!(finalAction === "start")) {
              _context.n = 19;
              break;
            }
            flowStack.length = 0;
            flowStack.push(initialStepName);
            restartKey = flowStepKey(dialogKey, initialStepName);
            prevStep = currentStepName;
            restartConfig = buildStepConfig(initialStepName, steps[initialStepName], restartKey, true, defaults, false, steps);
            _context.n = 18;
            return dialog.replace(restartConfig);
          case 18:
            lastResult = _context.v;
            return _context.a(3, 4);
          case 19:
            // Navigate forward to a named step
            nextStepName = finalAction;
            nextDef = steps[nextStepName];
            if (nextDef) {
              _context.n = 20;
              break;
            }
            throw new Error("[Dialogist] useDialogFlow: Step \"".concat(nextStepName, "\" not found in steps definition."));
          case 20:
            prevStep = currentStepName;
            flowStack.push(nextStepName);
            nextKey = flowStepKey(dialogKey, nextStepName); // Animate Back only when it's newly appearing: the stack just grew from 1 to 2.
            isBackNewlyAppearing = flowStack.length === 2;
            nextConfig = buildStepConfig(nextStepName, nextDef, nextKey, false, defaults, isBackNewlyAppearing, steps);
            _context.n = 21;
            return dialog.replace(nextConfig);
          case 21:
            lastResult = _context.v;
            _context.n = 4;
            break;
          case 22:
            _context.p = 22;
            cleanup();
            return _context.f(22);
          case 23:
            return _context.a(2);
        }
      }, _callee, null, [[3,, 22, 23]]);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }(), [dialog, dialogKey]);
  return {
    start: start
  };
};

export { useDialogFlow };
//# sourceMappingURL=useDialogFlow.js.map
