var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {

  'use strict';

  var CaseMap = Polymer.CaseMap;

  // Monotonically increasing unique ID used for de-duping effects triggered
  // from multiple properties in the same turn
  var dedupeId = 0;

  // Property effect types; effects are stored on the prototype using these keys
  var TYPES = {
    ANY: '__propertyEffects',
    COMPUTE: '__computeEffects',
    REFLECT: '__reflectEffects',
    NOTIFY: '__notifyEffects',
    PROPAGATE: '__propagateEffects',
    OBSERVE: '__observeEffects',
    READ_ONLY: '__readOnly'
  };

  /**
   * Ensures that the model has an own-property map of effects for the given type.
   * The model may be a prototype or an instance.
   *
   * Property effects are stored as arrays of effects by property in a map,
   * by named type on the model. e.g.
   *
   *   __computeEffects: {
   *     foo: [ ... ],
   *     bar: [ ... ]
   *   }
   *
   * If the model does not yet have an effect map for the type, one is created
   * and returned.  If it does, but it is not an own property (i.e. the
   * prototype had effects), the the map is deeply cloned and the copy is
   * set on the model and returned, ready for new effects to be added.
   *
   * @param {Object} model Prototype or instance
   * @param {string} type Property effect type
   * @return {Object} The own-property map of effects for the given type
   * @private
   */
  function ensureOwnEffectMap(model, type) {
    var effects = model[type];
    if (!effects) {
      effects = model[type] = {};
    } else if (!model.hasOwnProperty(type)) {
      effects = model[type] = Object.create(model[type]);
      for (var p in effects) {
        var protoFx = effects[p];
        var instFx = effects[p] = Array(protoFx.length);
        for (var i = 0; i < protoFx.length; i++) {
          instFx[i] = protoFx[i];
        }
      }
    }
    return effects;
  }

  // -- effects ----------------------------------------------

  /**
   * Runs all effects of a given type for the given set of property changes
   * on an instance.
   *
   * @param {Object} inst The instance with effects to run
   * @param {string} type Type of effect to run
   * @param {Object} props Bag of current property changes
   * @param {Object=} oldProps Bag of previous values for changed properties
   * @private
   */
  function runEffects(inst, effects, props, oldProps, hasPaths) {
    if (effects) {
      var ran = void 0;
      var id = dedupeId++;
      for (var prop in props) {
        if (runEffectsForProperty(inst, effects, id, prop, props, oldProps, hasPaths)) {
          ran = true;
        }
      }
      return ran;
    }
  }

  /**
   * Runs a list of effects for a given property.
   *
   * @param {Object} inst The instance with effects to run
   * @param {Array} effects Array of effects
   * @param {number} id Effect run id used for de-duping effects
   * @param {string} prop Name of changed property
   * @param {*} value Value of changed property
   * @param {*} old Previous value of changed property
   * @private
   */
  function runEffectsForProperty(inst, effects, dedupeId, prop, props, oldProps, hasPaths) {
    var ran = void 0;
    var rootProperty = hasPaths ? Polymer.Path.root(prop) : prop;
    var fxs = effects[rootProperty];
    if (fxs) {
      for (var i = 0, l = fxs.length, fx; i < l && (fx = fxs[i]); i++) {
        if ((!fx.info || fx.info.lastRun !== dedupeId) && (!hasPaths || pathMatchesTrigger(prop, fx.trigger))) {
          fx.fn(inst, prop, props, oldProps, fx.info, hasPaths);
          if (fx.info) {
            fx.info.lastRun = dedupeId;
          }
          ran = true;
        }
      }
    }
    return ran;
  }

  /**
   * Determines whether a property/path that has changed matches the trigger
   * criteria for an effect.  A trigger is a descriptor with the following
   * structure, which matches the descriptors returned from `parseArg`.
   * e.g. for `foo.bar.*`:
   * ```
   * trigger: {
   *   name: 'a.b',
   *   structured: true,
   *   wildcard: true
   * }
   * ```
   * If no trigger is given, the path is deemed to match.
   *
   * @param {string} path Path or property that changed
   * @param {Object} trigger Descriptor
   * @return {boolean} Whether the path matched the trigger
   */
  function pathMatchesTrigger(path, trigger) {
    if (trigger) {
      var triggerPath = trigger.name;
      return triggerPath == path || trigger.structured && Polymer.Path.isAncestor(triggerPath, path) || trigger.wildcard && Polymer.Path.isDescendant(triggerPath, path);
    } else {
      return true;
    }
  }

  /**
   * Implements the "observer" effect.
   *
   * Calls the method with `info.methodName` on the instance, passing the
   * new and old values.
   *
   * @param {Object} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {*} value Current value of property
   * @param {*} old Previous value of property
   * @param {Object} info Effect metadata
   * @private
   */
  function runObserverEffect(inst, property, props, oldProps, info) {
    var fn = inst[info.methodName];
    var changedProp = info.property;
    if (fn) {
      fn.call(inst, inst.__data[changedProp], oldProps[changedProp]);
    } else {
      console.warn('observer method `' + info.methodName + '` not defined');
    }
  }

  /**
   * Runs "notify" effects for a set of changed properties.
   *
   * This method differs from the generic `runEffects` method in that it
   * will dispatch path notification events in the case that the property
   * changed was a path and the root property for that path didn't have a
   * "notify" effect.  This is to maintain 1.0 behavior that did not require
   * `notify: true` to ensure object sub-property notifications were
   * sent.
   *
   * @param {Element} inst The instance with effects to run
   * @param {Object} props Bag of current property changes
   * @param {Object} oldProps Bag of previous values for changed properties
   * @private
   */
  function runNotifyEffects(inst, notifyProps, props, oldProps, hasPaths) {
    // Notify
    var fxs = inst.__notifyEffects;
    var notified = void 0;
    var id = dedupeId++;
    // Try normal notify effects; if none, fall back to try path notification
    for (var prop in notifyProps) {
      if (notifyProps[prop]) {
        if (fxs && runEffectsForProperty(inst, fxs, id, prop, props, oldProps, hasPaths)) {
          notified = true;
        } else if (hasPaths && notifyPath(inst, prop, props)) {
          notified = true;
        }
      }
    }
    // Flush host if we actually notified and host was batching
    var host = void 0;
    if (notified && (host = inst.__dataHost) && host._flushProperties) {
      host._flushProperties();
    }
  }

  /**
   * Dispatches {property}-changed events with path information in the detail
   * object to indicate a sub-path of the property was changed.
   *
   * @param {Element} inst The element from which to fire the event
   * @param {string} path The path that was changed
   * @param {*} value
   * @private
   */
  function notifyPath(inst, path, props) {
    var rootProperty = Polymer.Path.root(path);
    if (rootProperty !== path) {
      var eventName = Polymer.CaseMap.camelToDashCase(rootProperty) + '-changed';
      dispatchNotifyEvent(inst, eventName, props[path], path);
      return true;
    }
  }

  /**
   * Dispatches {property}-changed events to indicate a property (or path)
   * changed.
   *
   * @param {Element} inst The element from which to fire the event
   * @param {string} eventName The name of the event to send ('{property}-changed')
   * @param {*} value The value of the changed property
   * @param {string | null | undefined} path If a sub-path of this property changed, the path
   *   that changed (optional).
   * @private
   */
  function dispatchNotifyEvent(inst, eventName, value, path) {
    var detail = {
      value: value,
      queueProperty: true
    };
    if (path) {
      detail.path = path;
    }
    inst.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
  }

  /**
   * Implements the "notify" effect.
   *
   * Dispatches a non-bubbling event named `info.eventName` on the instance
   * with a detail object containing the new `value`.
   *
   * @param {Element} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {*} value Current value of property
   * @param {*} old Previous value of property
   * @param {Object} info Effect metadata
   * @private
   */
  function runNotifyEffect(inst, property, props, oldProps, info, hasPaths) {
    var rootProperty = hasPaths ? Polymer.Path.root(property) : property;
    var path = rootProperty != property ? property : null;
    var value = path ? Polymer.Path.get(inst, path) : inst.__data[property];
    if (path && value === undefined) {
      value = props[property]; // specifically for .splices
    }
    dispatchNotifyEvent(inst, info.eventName, value, path);
  }

  /**
   * Adds a 2-way binding notification event listener to the node specified
   *
   * @param {Object} node Child element to add listener to
   * @param {Object} inst Host element instance to handle notification event
   * @param {Object} info Listener metadata stored via addAnnotatedListener
   * @private
   */
  function addNotifyListener(node, inst, info) {
    node.addEventListener(info.event, function (e) {
      handleNotification(e, inst, info.property, info.path, info.negate);
    });
  }

  /**
   * Handler function for 2-way notification events. Receives context
   * information captured in the `addNotifyListener` closure from the
   * `__notifyListeners` metadata.
   *
   * Sets the value of the notified property to the host property or path.  If
   * the event contained path information, translate that path to the host
   * scope's name for that path first.
   *
   * @param {Event} e Notification event (e.g. '<property>-changed')
   * @param {Object} inst Host element instance handling the notification event
   * @param {string} property Child element property that was bound
   * @param {string} path Host property/path that was bound
   * @param {boolean} negate Whether the binding was negated
   * @private
   */
  function handleNotification(e, inst, property, path, negate) {
    var value = void 0;
    var targetPath = e.detail && e.detail.path;
    if (targetPath) {
      path = Polymer.Path.translate(property, path, targetPath);
      value = e.detail && e.detail.value;
    } else {
      value = e.target[property];
    }
    value = negate ? !value : value;
    setPropertyFromNotification(inst, path, value, e);
  }

  /**
   * Called by 2-way binding notification event listeners to set a property
   * or path to the host based on a notification from a bound child.
   *
   * @param {string} path Path on this instance to set
   * @param {*} value Value to set to given path
   * @protected
   */
  function setPropertyFromNotification(inst, path, value, event) {
    var detail = event.detail;
    if (detail && detail.queueProperty) {
      if (!inst.__readOnly || !inst.__readOnly[path]) {
        inst._setPendingPropertyOrPath(path, value, true, Boolean(detail.path));
      }
    } else {
      inst.set(path, value);
    }
  }

  /**
   * Implements the "reflect" effect.
   *
   * Sets the attribute named `info.attrName` to the given property value.
   *
   * @param {Object} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {*} value Current value of property
   * @param {*} old Previous value of property
   * @param {Object} info Effect metadata
   * @private
   */
  function runReflectEffect(inst, property, props, oldProps, info) {
    var value = inst.__data[property];
    if (Polymer.sanitizeDOMValue) {
      value = Polymer.sanitizeDOMValue(value, info.attrName, 'attribute', inst);
    }
    inst._propertyToAttribute(property, info.attrName, value);
  }

  /**
   * Runs "computed" effects for a set of changed properties.
   *
   * This method differs from the generic `runEffects` method in that it
   * continues to run computed effects based on the output of each pass until
   * there are no more newly computed properties.  This ensures that all
   * properties that will be computed by the initial set of changes are
   * computed before other effects (binding propagation, observers, and notify)
   * run.
   *
   * @param {Element} inst The instance the effect will be run on
   * @param {Object} changedProps Bag of changed properties
   * @param {Object} oldProps Bag of previous values for changed properties
   * @private
   */
  function runComputedEffects(inst, changedProps, oldProps, hasPaths) {
    var computeEffects = inst.__computeEffects;
    if (computeEffects) {
      var inputProps = changedProps;
      while (runEffects(inst, computeEffects, inputProps, oldProps, hasPaths)) {
        Object.assign(oldProps, inst.__dataOld);
        Object.assign(changedProps, inst.__dataPending);
        inputProps = inst.__dataPending;
        inst.__dataPending = null;
      }
    }
  }

  /**
   * Implements the "computed property" effect by running the method with the
   * values of the arguments specified in the `info` object and setting the
   * return value to the computed property specified.
   *
   * @param {Object} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {*} value Current value of property
   * @param {*} old Previous value of property
   * @param {Object} info Effect metadata
   * @private
   */
  function runComputedEffect(inst, property, props, oldProps, info) {
    var result = runMethodEffect(inst, property, props, oldProps, info);
    var computedProp = info.methodInfo;
    if (inst.__propertyEffects && inst.__propertyEffects[computedProp]) {
      inst._setPendingProperty(computedProp, result, true);
    } else {
      inst[computedProp] = result;
    }
  }

  /**
   * Computes path changes based on path links set up using the `linkPaths`
   * API.
   *
   * @param {Element} inst The instance whose props are changing
   * @param {Object} changedProps Bag of changed properties
   * @private
   */
  function computeLinkedPaths(inst, changedProps, hasPaths) {
    var links = void 0;
    if (hasPaths && (links = inst.__dataLinkedPaths)) {
      var cache = inst.__dataTemp;
      var link = void 0;
      for (var a in links) {
        var b = links[a];
        for (var path in changedProps) {
          if (Polymer.Path.isDescendant(a, path)) {
            link = Polymer.Path.translate(a, b, path);
            cache[link] = changedProps[link] = changedProps[path];
            var notifyProps = inst.__dataToNotify || (inst.__dataToNotify = {});
            notifyProps[link] = true;
          } else if (Polymer.Path.isDescendant(b, path)) {
            link = Polymer.Path.translate(b, a, path);
            cache[link] = changedProps[link] = changedProps[path];
            var _notifyProps = inst.__dataToNotify || (inst.__dataToNotify = {});
            _notifyProps[link] = true;
          }
        }
      }
    }
  }

  // -- bindings ----------------------------------------------

  /**
   * Adds "binding" property effects for the template annotation
   * ("note" for short) and node index specified.  These may either be normal
   * "binding" effects (property/path bindings) or "method binding"
   * effects, aka inline computing functions, depending on the type of binding
   * detailed in the note.
   *
   * @param {Object} model Prototype or instance
   * @param {Object} note Annotation note returned from Annotator
   * @param {number} index Index into `__templateNodes` list of annotated nodes that the
   *   note applies to
   * @param {Object=} dynamicFns Map indicating whether method names should
   *   be included as a dependency to the effect.
   * @private
   */
  function addBindingEffect(model, note, index, dynamicFns) {
    for (var i = 0; i < note.parts.length; i++) {
      var part = note.parts[i];
      if (part.signature) {
        addMethodBindingEffect(model, note, part, index, dynamicFns);
      } else if (!part.literal) {
        if (note.kind === 'attribute' && note.name[0] === '-') {
          console.warn('Cannot set attribute ' + note.name + ' because "-" is not a valid attribute starting character');
        } else {
          model._addPropertyEffect(Polymer.Path.root(part.value), TYPES.PROPAGATE, {
            fn: runBindingEffect,
            info: {
              kind: note.kind,
              index: index,
              name: note.name,
              propertyName: note.propertyName,
              value: part.value,
              isCompound: note.isCompound,
              compoundIndex: part.compoundIndex,
              event: part.event,
              customEvent: part.customEvent,
              negate: part.negate
            }
          });
        }
      }
    }
  }

  /**
   * Implements the "binding" (property/path binding) effect.
   *
   * @param {Element} inst The instance the effect will be run on
   * @param {string} path Name of property
   * @param {*} value Current value of property
   * @param {*} old Previous value of property
   * @param {Object} info Effect metadata
   * @private
   */
  function runBindingEffect(inst, path, props, oldProps, info, hasPaths) {
    var value = void 0;
    var node = inst.__templateNodes[info.index];
    // Subpath notification: transform path and set to client
    // e.g.: foo="{{obj.sub}}", path: 'obj.sub.prop', set 'foo.prop'=obj.sub.prop
    if (hasPaths && path.length > info.value.length && info.kind == 'property' && !info.isCompound && node.__propertyEffects && node.__propertyEffects[info.name]) {
      var _value = props[path];
      path = Polymer.Path.translate(info.value, info.name, path);
      if (node._setPendingPropertyOrPath(path, _value, false, true)) {
        inst._enqueueClient(node);
      }
    } else {
      // Root or deeper path was set; extract bound path value
      // e.g.: foo="{{obj.sub}}", path: 'obj', set 'foo'=obj.sub
      //   or: foo="{{obj.sub}}", path: 'obj.sub.prop', set 'foo'=obj.sub
      if (path != info.value) {
        value = Polymer.Path.get(inst, info.value);
      } else {
        if (hasPaths && Polymer.Path.isPath(path)) {
          value = Polymer.Path.get(inst, path);
        } else {
          value = inst.__data[path];
        }
      }
      // Propagate value to child
      applyBindingValue(inst, info, value);
    }
  }

  /**
   * Sets the value for an "binding" (binding) effect to a node,
   * either as a property or attribute.
   *
   * @param {Object} inst The instance owning the binding effect
   * @param {Object} info Effect metadata
   * @param {*} value Value to set
   * @private
   */
  function applyBindingValue(inst, info, value) {
    var node = inst.__templateNodes[info.index];
    value = computeBindingValue(node, value, info);
    if (Polymer.sanitizeDOMValue) {
      value = Polymer.sanitizeDOMValue(value, info.name, info.kind, node);
    }
    if (info.kind == 'attribute') {
      // Attribute binding
      inst._valueToNodeAttribute(node, value, info.name);
    } else {
      // Property binding
      var prop = info.name;
      if (node.__propertyEffects && node.__propertyEffects[prop]) {
        if (!node.__readOnly || !node.__readOnly[prop]) {
          if (node._setPendingProperty(prop, value)) {
            inst._enqueueClient(node);
          }
        }
      } else {
        inst._setUnmanagedPropertyToNode(node, prop, value);
      }
    }
  }

  /**
   * Transforms an "binding" effect value based on compound & negation
   * effect metadata, as well as handling for special-case properties
   *
   * @param {Node} node Node the value will be set to
   * @param {*} value Value to set
   * @param {Object} info Effect metadata
   * @return {*} Transformed value to set
   * @private
   */
  function computeBindingValue(node, value, info) {
    if (info.negate) {
      value = !value;
    }
    if (info.isCompound) {
      var storage = node.__dataCompoundStorage[info.name];
      storage[info.compoundIndex] = value;
      value = storage.join('');
    }
    if (info.kind !== 'attribute') {
      // Some browsers serialize `undefined` to `"undefined"`
      if (info.name === 'textContent' || node.localName == 'input' && info.name == 'value') {
        value = value == undefined ? '' : value;
      }
    }
    return value;
  }

  /**
   * Adds "binding method" property effects for the template binding
   * ("note" for short), part metadata, and node index specified.
   *
   * @param {Object} model Prototype or instance
   * @param {Object} note Binding note returned from Annotator
   * @param {Object} part The compound part metadata
   * @param {number} index Index into `__templateNodes` list of annotated nodes that the
   *   note applies to
   * @param {Object=} dynamicFns Map indicating whether method names should
   *   be included as a dependency to the effect.
   * @private
   */
  function addMethodBindingEffect(model, note, part, index, dynamicFns) {
    createMethodEffect(model, part.signature, TYPES.PROPAGATE, runMethodBindingEffect, {
      index: index,
      isCompound: note.isCompound,
      compoundIndex: part.compoundIndex,
      kind: note.kind,
      name: note.name,
      negate: part.negate,
      part: part
    }, dynamicFns);
  }

  /**
   * Implements the "binding method" (inline computed function) effect.
   *
   * Runs the method with the values of the arguments specified in the `info`
   * object and setting the return value to the node property/attribute.
   *
   * @param {Object} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {*} value Current value of property
   * @param {*} old Previous value of property
   * @param {Object} info Effect metadata
   * @private
   */
  function runMethodBindingEffect(inst, property, props, oldProps, info) {
    var val = runMethodEffect(inst, property, props, oldProps, info);
    applyBindingValue(inst, info.methodInfo, val);
  }

  /**
   * Post-processes template bindings (notes for short) provided by the
   * Bindings library for use by the effects system:
   * - Parses bindings for methods into method `signature` objects
   * - Memoizes the root property for path bindings
   * - Recurses into nested templates and processes those templates and
   *   extracts any host properties, which are set to the template's
   *   `_content._hostProps`
   * - Adds bindings from the host to <template> elements for any nested
   *   template's lexically bound "host properties"; template handling
   *   elements can then add accessors to the template for these properties
   *   to forward host properties into template instances accordingly.
   *
   * @param {Array<Object>} notes List of notes to process; the notes are
   *   modified in place.
   * @private
   */
  function processAnnotations(notes) {
    if (!notes._processed) {
      for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        // Parse bindings for methods & path roots (models)
        for (var j = 0; j < note.bindings.length; j++) {
          var b = note.bindings[j];
          for (var k = 0; k < b.parts.length; k++) {
            var p = b.parts[k];
            if (!p.literal) {
              p.signature = parseMethod(p.value);
              if (!p.signature) {
                p.rootProperty = Polymer.Path.root(p.value);
              }
            }
          }
        }
        // Recurse into nested templates & bind host props
        if (note.templateContent) {
          processAnnotations(note.templateContent._notes);
          var hostProps = note.templateContent._hostProps = discoverTemplateHostProps(note.templateContent._notes);
          var bindings = [];
          for (var prop in hostProps) {
            bindings.push({
              index: note.index,
              kind: 'property',
              name: '_host_' + prop,
              parts: [{
                mode: '{',
                value: prop
              }]
            });
          }
          note.bindings = note.bindings.concat(bindings);
        }
      }
      notes._processed = true;
    }
  }

  /**
   * Finds all property usage in templates (property/path bindings and function
   * arguments) and returns the path roots as keys in a map. Each outer template
   * merges inner _hostProps to propagate inner host property needs to outer
   * templates.
   *
   * @param {Array<Object>} notes List of notes to process for a given template
   * @return {Object<string,boolean>} Map of host properties that the template
   *   (or any nested templates) uses
   * @private
   */
  function discoverTemplateHostProps(notes) {
    var hostProps = {};
    for (var i = 0, n; i < notes.length && (n = notes[i]); i++) {
      // Find all bindings to parent.* and spread them into _parentPropChain
      for (var j = 0, b$ = n.bindings, b; j < b$.length && (b = b$[j]); j++) {
        for (var k = 0, p$ = b.parts, p; k < p$.length && (p = p$[k]); k++) {
          if (p.signature) {
            var args = p.signature.args;
            for (var kk = 0; kk < args.length; kk++) {
              var rootProperty = args[kk].rootProperty;
              if (rootProperty) {
                hostProps[rootProperty] = true;
              }
            }
            hostProps[p.signature.methodName] = true;
          } else {
            if (p.rootProperty) {
              hostProps[p.rootProperty] = true;
            }
          }
        }
      }
      // Merge child _hostProps into this _hostProps
      if (n.templateContent) {
        var templateHostProps = n.templateContent._hostProps;
        Object.assign(hostProps, templateHostProps);
      }
    }
    return hostProps;
  }

  /**
   * Returns true if a binding's metadata meets all the requirements to allow
   * 2-way binding, and therefore a <property>-changed event listener should be
   * added:
   * - used curly braces
   * - is a property (not attribute) binding
   * - is not a textContent binding
   * - is not compound
   *
   * @param {Object} binding Binding metadata
   * @return {boolean} True if 2-way listener should be added
   * @private
   */
  function shouldAddListener(binding) {
    return binding.name && binding.kind != 'attribute' && binding.kind != 'text' && !binding.isCompound && binding.parts[0].mode === '{';
  }

  /**
   * Sets up a prototypical `__notifyListeners` metadata array to be used at
   * instance time to add event listeners for 2-way bindings.
   *
   * @param {Object} model Prototype (instances not currently supported)
   * @param {number} index Index into `__templateNodes` list of annotated nodes that the
   *   event should be added to
   * @param {string} property Property of target node to listen for changes
   * @param {string} path Host path that the change should be propagated to
   * @param {string=} event A custom event name to listen for (e.g. via the
   *   `{{prop::eventName}}` syntax)
   * @param {boolean=} negate Whether the notified value should be negated before
   *   setting to host path
   * @private
   */
  function addAnnotatedListener(model, index, property, path, event, negate) {
    var eventName = event || CaseMap.camelToDashCase(property) + '-changed';
    model.__notifyListeners = model.__notifyListeners || [];
    model.__notifyListeners.push({
      index: index,
      property: property,
      path: path,
      event: eventName,
      negate: negate
    });
  }

  /**
   * Adds all 2-way binding notification listeners to a host based on
   * `__notifyListeners` metadata recorded by prior calls to`addAnnotatedListener`
   *
   * @param {Object} inst Host element instance
   * @private
   */
  function setupNotifyListeners(inst) {
    var b$ = inst.__notifyListeners;
    for (var i = 0, l = b$.length, info; i < l && (info = b$[i]); i++) {
      var node = inst.__templateNodes[info.index];
      addNotifyListener(node, inst, info);
    }
  }

  /**
   * On the `inst` element that was previously bound, uses `inst.__templateNotes`
   * to setup compound binding storage structures onto the bound
   * nodes (`inst.__templateNodes`).
   * (`inst._, and 2-way binding event listeners are also added.)
   *
   * @param {Object} inst Instance that bas been previously bound
   * @private
   */
  function setupBindings(inst) {
    var notes = inst.__templateNotes;
    if (notes.length) {
      for (var i = 0; i < notes.length; i++) {
        var note = notes[i];
        var node = inst.__templateNodes[i];
        node.__dataHost = inst;
        if (note.bindings) {
          setupCompoundBinding(note, node);
        }
      }
    }
    if (inst.__notifyListeners) {
      setupNotifyListeners(inst);
    }
  }

  // -- for method-based effects (complexObserver & computed) --------------

  /**
   * Adds property effects for each argument in the method signature (and
   * optionally, for the method name if `dynamic` is true) that calls the
   * provided effect function.
   *
   * @param {Element | Object} model Prototype or instance
   * @param {Object} sig Method signature metadata
   * @param {string} type
   * @param {Function} effectFn Function to run when arguments change
   * @param {*=} methodInfo
   * @param {Object=} dynamicFns Map indicating whether method names should
   *   be included as a dependency to the effect. Note, defaults to true
   *   if the signature is statci (sig.static is true).
   * @private
   */
  function createMethodEffect(model, sig, type, effectFn, methodInfo, dynamicFns) {
    var dynamicFn = sig.static || dynamicFns && dynamicFns[sig.methodName];
    var info = {
      methodName: sig.methodName,
      args: sig.args,
      methodInfo: methodInfo,
      dynamicFn: dynamicFn
    };
    for (var i = 0, arg; i < sig.args.length && (arg = sig.args[i]); i++) {
      if (!arg.literal) {
        model._addPropertyEffect(arg.rootProperty, type, {
          fn: effectFn, info: info, trigger: arg
        });
      }
    }
    if (dynamicFn) {
      model._addPropertyEffect(sig.methodName, type, {
        fn: effectFn, info: info
      });
    }
  }

  /**
   * Calls a method with arguments marshaled from properties on the instance
   * based on the method signature contained in the effect metadata.
   *
   * Multi-property observers, computed properties, and inline computing
   * functions call this function to invoke the method, then use the return
   * value accordingly.
   *
   * @param {Object} inst The instance the effect will be run on
   * @param {string} property Name of property
   * @param {*} value Current value of property
   * @param {*} old Previous value of property
   * @param {Object} info Effect metadata
   * @private
   */
  function runMethodEffect(inst, property, props, oldProps, info) {
    // Instances can optionally have a _methodHost which allows redirecting where
    // to find methods. Currently used by `templatize`.
    var context = inst._methodHost || inst;
    var fn = context[info.methodName];
    if (fn) {
      var args = marshalArgs(inst.__data, info.args, property, props);
      return fn.apply(context, args);
    } else if (!info.dynamicFn) {
      console.warn('method `' + info.methodName + '` not defined');
    }
  }

  var emptyArray = [];

  /**
   * Parses an expression string for a method signature, and returns a metadata
   * describing the method in terms of `methodName`, `static` (whether all the
   * arguments are literals), and an array of `args`
   *
   * @param {string} expression The expression to parse
   * @return {?Object} The method metadata object if a method expression was
   *   found, otherwise `undefined`
   * @private
   */
  function parseMethod(expression) {
    // tries to match valid javascript property names
    var m = expression.match(/([^\s]+?)\(([\s\S]*)\)/);
    if (m) {
      var sig = { methodName: m[1], static: true };
      if (m[2].trim()) {
        // replace escaped commas with comma entity, split on un-escaped commas
        var args = m[2].replace(/\\,/g, '&comma;').split(',');
        return parseArgs(args, sig);
      } else {
        sig.args = emptyArray;
        return sig;
      }
    }
    return null;
  }

  /**
   * Parses an array of arguments and sets the `args` property of the supplied
   * signature metadata object. Sets the `static` property to false if any
   * argument is a non-literal.
   *
   * @param {Array<string>} argList Array of argument names
   * @param {Object} sig Method signature metadata object
   * @return {Object} The updated signature metadata object
   * @private
   */
  function parseArgs(argList, sig) {
    sig.args = argList.map(function (rawArg) {
      var arg = parseArg(rawArg);
      if (!arg.literal) {
        sig.static = false;
      }
      return arg;
    }, this);
    return sig;
  }

  /**
   * Parses an individual argument, and returns an argument metadata object
   * with the following fields:
   *
   *   {
   *     value: 'prop',        // property/path or literal value
   *     literal: false,       // whether argument is a literal
   *     structured: false,    // whether the property is a path
   *     rootProperty: 'prop', // the root property of the path
   *     wildcard: false       // whether the argument was a wildcard '.*' path
   *   }
   *
   * @param {string} rawArg The string value of the argument
   * @return {Object} Argument metadata object
   * @private
   */
  function parseArg(rawArg) {
    // clean up whitespace
    var arg = rawArg.trim()
    // replace comma entity with comma
    .replace(/&comma;/g, ',')
    // repair extra escape sequences; note only commas strictly need
    // escaping, but we allow any other char to be escaped since its
    // likely users will do this
    .replace(/\\(.)/g, '\$1');
    // basic argument descriptor
    var a = {
      name: arg
    };
    // detect literal value (must be String or Number)
    var fc = arg[0];
    if (fc === '-') {
      fc = arg[1];
    }
    if (fc >= '0' && fc <= '9') {
      fc = '#';
    }
    switch (fc) {
      case "'":
      case '"':
        a.value = arg.slice(1, -1);
        a.literal = true;
        break;
      case '#':
        a.value = Number(arg);
        a.literal = true;
        break;
    }
    // if not literal, look for structured path
    if (!a.literal) {
      a.rootProperty = Polymer.Path.root(arg);
      // detect structured path (has dots)
      a.structured = Polymer.Path.isDeep(arg);
      if (a.structured) {
        a.wildcard = arg.slice(-2) == '.*';
        if (a.wildcard) {
          a.name = arg.slice(0, -2);
        }
      }
    }
    return a;
  }

  /**
   * Gather the argument values for a method specified in the provided array
   * of argument metadata.
   *
   * The `path` and `value` arguments are used to fill in wildcard descriptor
   * when the method is being called as a result of a path notification.
   *
   * @param {Object} data Instance data storage object to read properties from
   * @param {Array<Object>} args Array of argument metadata
   * @return {Array<*>} Array of argument values
   * @private
   */
  function marshalArgs(data, args, path, props) {
    var values = [];
    for (var i = 0, l = args.length; i < l; i++) {
      var arg = args[i];
      var name = arg.name;
      var v = void 0;
      if (arg.literal) {
        v = arg.value;
      } else {
        if (arg.structured) {
          v = Polymer.Path.get(data, name);
          // when data is not stored e.g. `splices`
          if (v === undefined) {
            v = props[name];
          }
        } else {
          v = data[name];
        }
      }
      if (arg.wildcard) {
        // Only send the actual path changed info if the change that
        // caused the observer to run matched the wildcard
        var baseChanged = name.indexOf(path + '.') === 0;
        var matches = path.indexOf(name) === 0 && !baseChanged;
        values[i] = {
          path: matches ? path : name,
          value: matches ? props[path] : v,
          base: v
        };
      } else {
        values[i] = v;
      }
    }
    return values;
  }

  /**
   * Initializes `__dataCompoundStorage` local storage on a bound node with
   * initial literal data for compound bindings, and sets the joined
   * literal parts to the bound property.
   *
   * When changes to compound parts occur, they are first set into the compound
   * storage array for that property, and then the array is joined to result in
   * the final value set to the property/attribute.
   *
   * @param {Object} note Annotation metadata
   * @param {Node} node Bound node to initialize
   * @private
   */
  function setupCompoundBinding(note, node) {
    var bindings = note.bindings;
    for (var i = 0; i < bindings.length; i++) {
      var binding = bindings[i];
      if (binding.isCompound) {
        // Create compound storage map
        var storage = node.__dataCompoundStorage || (node.__dataCompoundStorage = {});
        var parts = binding.parts;
        // Copy literals from parts into storage for this binding
        var literals = new Array(parts.length);
        for (var j = 0; j < parts.length; j++) {
          literals[j] = parts[j].literal;
        }
        var name = binding.name;
        storage[name] = literals;
        // Configure properties with their literal parts
        if (binding.literal && binding.kind == 'property') {
          node[name] = binding.literal;
        }
      }
    }
  }

  // data api

  /**
   * Sends array splice notifications (`.splices` and `.length`)
   *
   * Note: this implementation only accepts normalized paths
   *
   * @param {Element} inst Instance to send notifications to
   * @param {Array} array The array the mutations occurred on
   * @param {string} path The path to the array that was mutated
   * @param {Array} splices Array of splice records
   * @private
   */
  function _notifySplices(inst, array, path, splices) {
    var splicesPath = path + '.splices';
    inst.notifyPath(splicesPath, { indexSplices: splices });
    inst.notifyPath(path + '.length', array.length);
    // Null here to allow potentially large splice records to be GC'ed.
    inst.__data[splicesPath] = { indexSplices: null };
  }

  /**
   * Creates a splice record and sends an array splice notification for
   * the described mutation
   *
   * Note: this implementation only accepts normalized paths
   *
   * @param {Element} inst Instance to send notifications to
   * @param {Array} array The array the mutations occurred on
   * @param {string} path The path to the array that was mutated
   * @param {number} index Index at which the array mutation occurred
   * @param {number} addedCount Number of added items
   * @param {Array} removed Array of removed items
   * @private
   */
  function notifySplice(inst, array, path, index, addedCount, removed) {
    _notifySplices(inst, array, path, [{
      index: index,
      addedCount: addedCount,
      removed: removed,
      object: array,
      type: 'splice'
    }]);
  }

  /**
   * Returns an upper-cased version of the string.
   *
   * @param {string} name String to uppercase
   * @return {string} Uppercased string
   * @private
   */
  function upper(name) {
    return name[0].toUpperCase() + name.substring(1);
  }

  /**
   * Sets the provided properties into pending data on the instance.
   *
   * @param {HTMLElement} inst Instance to apply data to
   * @param {object} props Bag of instance properties to set
   * @private
   */
  function initalizeInstanceProperties(inst, props) {
    inst.__dataOld = inst.__dataOld || {};
    inst.__dataPending = inst.__dataPending || {};
    var readOnly = inst.__readOnly;
    for (var prop in props) {
      if (!readOnly || !readOnly[prop]) {
        inst.__data[prop] = inst.__dataPending[prop] = props[prop];
      }
    }
  }

  /**
   * Element class mixin that provides meta-programming for Polymer's template
   * binding and data observation (collectively, "property effects") system.
   *
   * This mixin uses provides the following key methods for adding property effects
   * to this element:
   * - `_createPropertyObserver`
   * - `_createMethodObserver`
   * - `_createNotifyingProperty`
   * - `_createReadOnlyProperty`
   * - `_createReflectedProperty`
   * - `_createComputedProperty`
   * - `_bindTemplate`
   *
   * Each method creates one or more property accessors, along with metadata
   * used by this mixin's implementation of `_propertiesChanged` to perform
   * the property effects.  These methods may be called on element instances,
   * but are designed to be called on element prototypes such that the work to
   * set up accessors and effect metadata are done once per element class.
   *
   * @polymerMixin
   * @mixes Polymer.TemplateStamp
   * @mixes Polymer.PropertyAccessors
   * @memberof Polymer
   * @summary Element class mixin that provides meta-programming for Polymer's
   * template binding and data observation system.
   */
  Polymer.PropertyEffects = Polymer.dedupingMixin(function (superClass) {

    var propertyEffectsBase = Polymer.TemplateStamp(Polymer.PropertyAccessors(superClass));

    /**
     * @polymerMixinClass
     * @unrestricted
     */

    var PropertyEffects = function (_propertyEffectsBase) {
      _inherits(PropertyEffects, _propertyEffectsBase);

      function PropertyEffects() {
        _classCallCheck(this, PropertyEffects);

        return _possibleConstructorReturn(this, (PropertyEffects.__proto__ || Object.getPrototypeOf(PropertyEffects)).apply(this, arguments));
      }

      _createClass(PropertyEffects, [{
        key: '_initializeProperties',


        /**
         * Overrides `Polymer.PropertyAccessors` implementation to initialize
         * additional property-effect related properties.
         *
         * @override
         */
        value: function _initializeProperties() {
          _get(PropertyEffects.prototype.__proto__ || Object.getPrototypeOf(PropertyEffects.prototype), '_initializeProperties', this).call(this);
          this.__dataInitialized = false;
          this.__dataClientsInitialized = false;
          this.__dataPendingClients = null;
          this.__dataToNotify = null;
          this.__dataLinkedPaths = null;
          this.__dataHasPaths = false;
          // May be set on instance prior to upgrade
          this.__dataCompoundStorage = this.__dataCompoundStorage || null;
          this.__dataHost = this.__dataHost || null;
          this.__dataTemp = {};
          // Capture instance properties; these will be set into accessors
          // during first flush. Don't set them here, since we want
          // these to overwrite defaults/constructor assignments
          for (var p in this.__propertyEffects) {
            if (this.hasOwnProperty(p)) {
              this.__dataInstanceProps = this.__dataInstanceProps || {};
              this.__dataInstanceProps[p] = this[p];
              delete this[p];
            }
          }
        }

        /**
         * Overrides `Polymer.PropertyAccessors` implementation to provide a
         * more efficient implementation of initializing properties from
         * the prototype on the instance.
         *
         * @override
         */

      }, {
        key: '_initializeProtoProperties',
        value: function _initializeProtoProperties(props) {
          this.__data = Object.create(props);
          this.__dataPending = Object.create(props);
          this.__dataOld = {};
        }

        // Prototype setup ----------------------------------------

        /**
         * Ensures an accessor exists for the specified property, and adds
         * to a list of "property effects" that will run when the accessor for
         * the specified property is set.  Effects are grouped by "type", which
         * roughly corresponds to a phase in effect processing.  The effect
         * metadata should be in the following form:
         *
         *   {
         *     fn: effectFunction, // Reference to function to call to perform effect
         *     info: { ... }       // Effect metadata passed to function
         *     // path: '...'      // Will be set by this method based on path arg
         *   }
         *
         * Effect functions are called with the following signature:
         *
         *   effectFunction(inst, property, currentValue, oldValue, info)
         *
         * This method may be called either on the prototype of a class
         * using the PropertyEffects mixin (for best performance), or on
         * an instance to add dynamic effects.  When called on an instance or
         * subclass of a class that has already had property effects added to
         * its prototype, the property effect lists will be cloned and added as
         * own properties of the caller.
         *
         * @param {string} path Property (or path) that should trigger the effect
         * @param {string} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @param {Object=} effect Effect metadata object
         * @protected
         */

      }, {
        key: '_addPropertyEffect',
        value: function _addPropertyEffect(property, type, effect) {
          var effects = ensureOwnEffectMap(this, TYPES.ANY)[property];
          if (!effects) {
            effects = this.__propertyEffects[property] = [];
            this._createPropertyAccessor(property, type == TYPES.READ_ONLY);
          }
          // effects are accumulated into arrays per property based on type
          if (effect) {
            effects.push(effect);
          }
          effects = ensureOwnEffectMap(this, type)[property];
          if (!effects) {
            effects = this[type][property] = [];
          }
          effects.push(effect);
        }

        /**
         * Returns whether the current prototype/instance has a property effect
         * of a certain type.
         *
         * @param {string} property Property name
         * @param {string=} type Effect type, from this.PROPERTY_EFFECT_TYPES
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasPropertyEffect',
        value: function _hasPropertyEffect(property, type) {
          var effects = this[type || TYPES.ANY];
          return Boolean(effects && effects[property]);
        }

        /**
         * Returns whether the current prototype/instance has a "read only"
         * accessor for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasReadOnlyEffect',
        value: function _hasReadOnlyEffect(property) {
          return this._hasPropertyEffect(property, TYPES.READ_ONLY);
        }

        /**
         * Returns whether the current prototype/instance has a "notify"
         * property effect for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasNotifyEffect',
        value: function _hasNotifyEffect(property) {
          return this._hasPropertyEffect(property, TYPES.NOTIFY);
        }

        /**
         * Returns whether the current prototype/instance has a "reflect to attribute"
         * property effect for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasReflectEffect',
        value: function _hasReflectEffect(property) {
          return this._hasPropertyEffect(property, TYPES.REFLECT);
        }

        /**
         * Returns whether the current prototype/instance has a "computed"
         * property effect for the given property.
         *
         * @param {string} property Property name
         * @return {boolean} True if the prototype/instance has an effect of this type
         * @protected
         */

      }, {
        key: '_hasComputedEffect',
        value: function _hasComputedEffect(property) {
          return this._hasPropertyEffect(property, TYPES.COMPUTE);
        }

        // Runtime ----------------------------------------

        /**
         * Sets a pending property or path.  If the root property of the path in
         * question had no accessor, the path is set, otherwise it is enqueued
         * via `_setPendingProperty`.
         *
         * This function isolates relatively expensive functionality necessary
         * for the public API (`set`, `setProperties`, `notifyPath`, and property
         * change listeners via {{...}} bindings), such that it is only done
         * when paths enter the system, and not at every propagation step.  It
         * also sets a `__dataHasPaths` flag on the instance which is used to
         * fast-path slower path-matching code in the property effects host paths.
         *
         * `path` can be a path string or array of path parts as accepted by the
         * public API.
         *
         * @param {string | !Array<number|string>} path Path to set
         * @param {*} value Value to set
         * @param {boolean=} isPathNotification If the path being set is a path
         *   notification of an already changed value, as opposed to a request
         *   to set and notify the change.  In the latter `false` case, a dirty
         *   check is performed and then the value is set to the path before
         *   enqueuing the pending property change.
         * @return {boolean} Returns true if the property/path was enqueued in
         *   the pending changes bag.
         * @protected
         */

      }, {
        key: '_setPendingPropertyOrPath',
        value: function _setPendingPropertyOrPath(path, value, shouldNotify, isPathNotification) {
          var rootProperty = Polymer.Path.root(Array.isArray(path) ? path[0] : path);
          var hasEffect = this.__propertyEffects && this.__propertyEffects[rootProperty];
          var isPath = rootProperty !== path;
          if (hasEffect) {
            if (isPath) {
              if (!isPathNotification) {
                // Dirty check changes being set to a path against the actual object,
                // since this is the entry point for paths into the system; from here
                // the only dirty checks are against the `__dataTemp` cache to prevent
                // duplicate work in the same turn only. Note, if this was a notification
                // of a change already set to a path (isPathNotification: true),
                // we always let the change through and skip the `set` since it was
                // already dirty checked at the point of entry and the underlying
                // object has already been updated
                var old = Polymer.Path.get(this, path);
                path = /** @type {string} */Polymer.Path.set(this, path, value);
                // Use property-accessor's simpler dirty check
                if (!path || !_get(PropertyEffects.prototype.__proto__ || Object.getPrototypeOf(PropertyEffects.prototype), '_shouldPropertyChange', this).call(this, path, value, old)) {
                  return false;
                }
              }
              this.__dataHasPaths = true;
            }
            return this._setPendingProperty(path, value, shouldNotify);
          } else {
            if (isPath) {
              Polymer.Path.set(this, path, value);
            } else {
              this[path] = value;
            }
          }
          return false;
        }

        /**
         * Applies a value to a non-Polymer element/node's property.
         *
         * The implementation makes a best-effort at binding interop:
         * Some native element properties have side-effects when
         * re-setting the same value (e.g. setting <input>.value resets the
         * cursor position), so we do a dirty-check before setting the value.
         * However, for better interop with non-Polymer custom elements that
         * accept objects, we explicitly re-set object changes coming from the
         * Polymer world (which may include deep object changes without the
         * top reference changing), erring on the side of providing more
         * information.
         *
         * Users may override this method to provide alternate approaches.
         *
         * @param {Node} node The node to set a property on
         * @param {string} prop The property to set
         * @param {*} value The value to set
         * @protected
         */

      }, {
        key: '_setUnmanagedPropertyToNode',
        value: function _setUnmanagedPropertyToNode(node, prop, value) {
          // It is a judgment call that resetting primitives is
          // "bad" and resettings objects is also "good"; alternatively we could
          // implement a whitelist of tag & property values that should never
          // be reset (e.g. <input>.value && <select>.value)
          if (value !== node[prop] || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object') {
            node[prop] = value;
          }
        }

        /**
         * Overrides the `PropertyAccessors` implementation to introduce special
         * dirty check logic depending on the property & value being set:
         *
         * 1. Any value set to a path (e.g. 'obj.prop': 42 or 'obj.prop': {...})
         *    Stored in `__dataTemp`, dirty checked against `__dataTemp`
         * 2. Object set to simple property (e.g. 'prop': {...})
         *    Stored in `__dataTemp` and `__data`, dirty checked against
         *    `__dataTemp` by default implementation of `_shouldPropertyChange`
         * 3. Primitive value set to simple property (e.g. 'prop': 42)
         *    Stored in `__data`, dirty checked against `__data`
         *
         * The dirty-check is important to prevent cycles due to two-way
         * notification, but paths and objects are only dirty checked against any
         * previous value set during this turn via a "temporary cache" that is
         * cleared when the last `_propertiesChaged` exits. This is so:
         * a. any cached array paths (e.g. 'array.3.prop') may be invalidated
         *    due to array mutations like shift/unshift/splice; this is fine
         *    since path changes are dirty-checked at user entry points like `set`
         * b. dirty-checking for objects only lasts one turn to allow the user
         *    to mutate the object in-place and re-set it with the same identity
         *    and have all sub-properties re-propagated in a subsequent turn.
         *
         * The temp cache is not necessarily sufficient to prevent invalid array
         * paths, since a splice can happen during the same turn (with pathological
         * user code); we could introduce a "fixup" for temporarily cached array
         * paths if needed: https://github.com/Polymer/polymer/issues/4227
         *
         * @override
         */

      }, {
        key: '_setPendingProperty',
        value: function _setPendingProperty(property, value, shouldNotify) {
          var isPath = this.__dataHasPaths && Polymer.Path.isPath(property);
          var prevProps = isPath ? this.__dataTemp : this.__data;
          if (this._shouldPropertyChange(property, value, prevProps[property])) {
            if (!this.__dataPending) {
              this.__dataPending = {};
              this.__dataOld = {};
            }
            // Ensure old is captured from the last turn
            if (!(property in this.__dataOld)) {
              this.__dataOld[property] = this.__data[property];
            }
            // Paths are stored in temporary cache (cleared at end of turn),
            // which is used for dirty-checking, all others stored in __data
            if (isPath) {
              this.__dataTemp[property] = value;
            } else {
              this.__data[property] = value;
            }
            // All changes go into pending property bag, passed to _propertiesChanged
            this.__dataPending[property] = value;
            // Track properties that should notify separately
            if (isPath || this.__notifyEffects && this.__notifyEffects[property]) {
              this.__dataToNotify = this.__dataToNotify || {};
              this.__dataToNotify[property] = shouldNotify;
            }
            return true;
          }
        }

        /**
         * Overrides base implementation to ensure all accessors set `shouldNotify`
         * to true, for per-property notification tracking.
         *
         * @override
         */

      }, {
        key: '_setProperty',
        value: function _setProperty(property, value) {
          if (this._setPendingProperty(property, value, true)) {
            this._invalidateProperties();
          }
        }

        /**
         * Overrides `PropertyAccessor`'s default async queuing of
         * `_propertiesChanged`: if `__dataInitialized` is false (has not yet been
         * manually flushed), the function no-ops; otherwise flushes
         * `_propertiesChanged` synchronously.
         *
         * @override
         */

      }, {
        key: '_invalidateProperties',
        value: function _invalidateProperties() {
          if (this.__dataInitialized) {
            this._flushProperties();
          }
        }

        /**
         * Enqueues the given client on a list of pending clients, whose
         * pending property changes can later be flushed via a call to
         * `_flushClients`.
         *
         * @param {Object} client PropertyEffects client to enqueue
         * @protected
         */

      }, {
        key: '_enqueueClient',
        value: function _enqueueClient(client) {
          this.__dataPendingClients = this.__dataPendingClients || [];
          if (client !== this) {
            this.__dataPendingClients.push(client);
          }
        }

        /**
         * Flushes any clients previously enqueued via `_enqueueClient`, causing
         * their `_flushProperties` method to run.
         *
         * @protected
         */

      }, {
        key: '_flushClients',
        value: function _flushClients() {
          if (!this.__dataClientsInitialized) {
            this._readyClients();
          }
          // Flush all clients
          var clients = this.__dataPendingClients;
          if (clients) {
            this.__dataPendingClients = null;
            for (var i = 0; i < clients.length; i++) {
              var client = clients[i];
              if (!client.__dataInitialized || client.__dataPending) {
                client._flushProperties();
              }
            }
          }
        }

        /**
         * Sets a bag of property changes to this instance, and
         * synchronously processes all effects of the properties as a batch.
         *
         * Property names must be simple properties, not paths.  Batched
         * path propagation is not supported.
         *
         * @param {Object} props Bag of one or more key-value pairs whose key is
         *   a property and value is the new value to set for that property.
         * @public
         */

      }, {
        key: 'setProperties',
        value: function setProperties(props) {
          for (var path in props) {
            if (!this.__readOnly || !this.__readOnly[path]) {
              //TODO(kschaaf): explicitly disallow paths in setProperty?
              // wildcard observers currently only pass the first changed path
              // in the `info` object, and you could do some odd things batching
              // paths, e.g. {'foo.bar': {...}, 'foo': null}
              this._setPendingPropertyOrPath(path, props[path], true);
            }
          }
          this._invalidateProperties();
        }

        /**
         * Overrides PropertyAccessor's default async queuing of
         * `_propertiesChanged`, to instead synchronously flush
         * `_propertiesChanged` unless the `this._asyncEffects` property is true.
         *
         * If this is the first time properties are being flushed, the `ready`
         * callback will be called.
         *
         * @override
         */

      }, {
        key: '_flushProperties',
        value: function _flushProperties() {
          if (!this.__dataInitialized) {
            this.ready();
          } else if (this.__dataPending) {
            _get(PropertyEffects.prototype.__proto__ || Object.getPrototypeOf(PropertyEffects.prototype), '_flushProperties', this).call(this);
            if (!this.__dataCounter) {
              // Clear temporary cache at end of turn
              this.__dataTemp = {};
            }
          }
        }

        /**
         * Polymer-specific lifecycle callback called the first time properties
         * are being flushed.  Prior to `ready`, all property sets through
         * accessors are queued and their effects are flushed after this method
         * returns.
         *
         * Users may override this function to implement behavior that is
         * dependent on the element having its properties initialized, e.g.
         * from defaults (initialized from `constructor`, `_initializeProperties`),
         * `attributeChangedCallback`, or binding values propagated from host
         * "binding effects".  `super.ready()` must be called to ensure the
         * data system becomes enabled.
         *
         * @public
         */

      }, {
        key: 'ready',
        value: function ready() {
          // Update instance properties that shadowed proto accessors; these take
          // priority over any defaults set in `properties` or constructor
          var instanceProps = this.__dataInstanceProps;
          if (instanceProps) {
            initalizeInstanceProperties(this, instanceProps);
          }
          // Enable acceessors
          this.__dataInitialized = true;
          if (this.__dataPending) {
            // Run normal flush
            this._flushProperties();
          } else {
            this._readyClients();
          }
        }

        /**
         * Perform any initial setup on client dom. Called before the first
         * `_flushProperties` call on client dom and before any element
         * observers are called.
         *
         * @protected
         */

      }, {
        key: '_readyClients',
        value: function _readyClients() {
          this.__dataClientsInitialized = true;
        }

        /**
         * Stamps the provided template and performs instance-time setup for
         * Polymer template features, including data bindings, declarative event
         * listeners, and the `this.$` map of `id`'s to nodes.  A document fragment
         * is returned containing the stamped DOM, ready for insertion into the
         * DOM.
         *
         * Note that for host data to be bound into the stamped DOM, the template
         * must have been previously bound to the prototype via a call to
         * `_bindTemplate`, which performs one-time template binding work.
         *
         * Note that this method currently only supports being called once per
         * instance.
         *
         * @param {HTMLTemplateElement} template Template to stamp
         * @return {DocumentFragment} Cloned template content
         * @protected
         */

      }, {
        key: '_stampTemplate',
        value: function _stampTemplate(template) {
          var dom = _get(PropertyEffects.prototype.__proto__ || Object.getPrototypeOf(PropertyEffects.prototype), '_stampTemplate', this).call(this, template);
          setupBindings(this);
          return dom;
        }

        /**
         * Implements `PropertyAccessors`'s properties changed callback.
         *
         * Runs each class of effects for the batch of changed properties in
         * a specific order (compute, propagate, reflect, observe, notify).
         *
         * @override
         */

      }, {
        key: '_propertiesChanged',
        value: function _propertiesChanged(currentProps, changedProps, oldProps) {
          // ----------------------------
          // let c = Object.getOwnPropertyNames(changedProps || {});
          // window.debug && console.group(this.localName + '#' + this.id + ': ' + c);
          // if (window.debug) { debugger; }
          // ----------------------------
          var hasPaths = this.__dataHasPaths;
          this.__dataHasPaths = false;
          // Compute properties
          runComputedEffects(this, changedProps, oldProps, hasPaths);
          // Compute linked paths
          computeLinkedPaths(this, changedProps, hasPaths);
          // Clear notify properties prior to possible reentry (propagate, observe),
          // but after computing effects have a chance to add to them
          var notifyProps = this.__dataToNotify;
          this.__dataToNotify = null;
          // Propagate properties to clients
          runEffects(this, this.__propagateEffects, changedProps, oldProps, hasPaths);
          // Flush clients
          this._flushClients();
          // Reflect properties
          runEffects(this, this.__reflectEffects, changedProps, oldProps, hasPaths);
          // Observe properties
          runEffects(this, this.__observeEffects, changedProps, oldProps, hasPaths);
          // Notify properties to host
          if (notifyProps) {
            runNotifyEffects(this, notifyProps, changedProps, oldProps, hasPaths);
          }
          // ----------------------------
          // window.debug && console.groupEnd(this.localName + '#' + this.id + ': ' + c);
          // ----------------------------
        }

        /**
         * Aliases one data path as another, such that path notifications from one
         * are routed to the other.
         *
         * @method linkPaths
         * @param {string | !Array<string|number>} to Target path to link.
         * @param {string | !Array<string|number>} from Source path to link.
         * @public
         */

      }, {
        key: 'linkPaths',
        value: function linkPaths(to, from) {
          to = Polymer.Path.normalize(to);
          from = Polymer.Path.normalize(from);
          this.__dataLinkedPaths = this.__dataLinkedPaths || {};
          this.__dataLinkedPaths[to] = from;
        }

        /**
         * Removes a data path alias previously established with `_linkPaths`.
         *
         * Note, the path to unlink should be the target (`to`) used when
         * linking the paths.
         *
         * @method unlinkPaths
         * @param {string | !Array<string|number>} path Target path to unlink.
         * @public
         */

      }, {
        key: 'unlinkPaths',
        value: function unlinkPaths(path) {
          path = Polymer.Path.normalize(path);
          if (this.__dataLinkedPaths) {
            delete this.__dataLinkedPaths[path];
          }
        }

        /**
         * Notify that an array has changed.
         *
         * Example:
         *
         *     this.items = [ {name: 'Jim'}, {name: 'Todd'}, {name: 'Bill'} ];
         *     ...
         *     this.items.splice(1, 1, {name: 'Sam'});
         *     this.items.push({name: 'Bob'});
         *     this.notifySplices('items', [
         *       { index: 1, removed: [{name: 'Todd'}], addedCount: 1, obect: this.items, type: 'splice' },
         *       { index: 3, removed: [], addedCount: 1, object: this.items, type: 'splice'}
         *     ]);
         *
         * @param {string} path Path that should be notified.
         * @param {Array} splices Array of splice records indicating ordered
         *   changes that occurred to the array. Each record should have the
         *   following fields:
         *    * index: index at which the change occurred
         *    * removed: array of items that were removed from this index
         *    * addedCount: number of new items added at this index
         *    * object: a reference to the array in question
         *    * type: the string literal 'splice'
         *
         *   Note that splice records _must_ be normalized such that they are
         *   reported in index order (raw results from `Object.observe` are not
         *   ordered and must be normalized/merged before notifying).
         * @public
        */

      }, {
        key: 'notifySplices',
        value: function notifySplices(path, splices) {
          var info = {};
          var array = /** @type {Array} */Polymer.Path.get(this, path, info);
          _notifySplices(this, array, info.path, splices);
        }

        /**
         * Convenience method for reading a value from a path.
         *
         * Note, if any part in the path is undefined, this method returns
         * `undefined` (this method does not throw when dereferencing undefined
         * paths).
         *
         * @method get
         * @param {(string|!Array<(string|number)>)} path Path to the value
         *   to read.  The path may be specified as a string (e.g. `foo.bar.baz`)
         *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
         *   bracketed expressions are not supported; string-based path parts
         *   *must* be separated by dots.  Note that when dereferencing array
         *   indices, the index may be used as a dotted part directly
         *   (e.g. `users.12.name` or `['users', 12, 'name']`).
         * @param {Object=} root Root object from which the path is evaluated.
         * @return {*} Value at the path, or `undefined` if any part of the path
         *   is undefined.
         * @public
         */

      }, {
        key: 'get',
        value: function get(path, root) {
          return Polymer.Path.get(root || this, path);
        }

        /**
         * Convenience method for setting a value to a path and notifying any
         * elements bound to the same path.
         *
         * Note, if any part in the path except for the last is undefined,
         * this method does nothing (this method does not throw when
         * dereferencing undefined paths).
         *
         * @method set
         * @param {(string|!Array<(string|number)>)} path Path to the value
         *   to write.  The path may be specified as a string (e.g. `'foo.bar.baz'`)
         *   or an array of path parts (e.g. `['foo.bar', 'baz']`).  Note that
         *   bracketed expressions are not supported; string-based path parts
         *   *must* be separated by dots.  Note that when dereferencing array
         *   indices, the index may be used as a dotted part directly
         *   (e.g. `'users.12.name'` or `['users', 12, 'name']`).
         * @param {*} value Value to set at the specified path.
         * @param {Object=} root Root object from which the path is evaluated.
         *   When specified, no notification will occur.
         * @public
        */

      }, {
        key: 'set',
        value: function set(path, value, root) {
          if (root) {
            Polymer.Path.set(root, path, value);
          } else {
            if (!this.__readOnly || !this.__readOnly[/** @type {string} */path]) {
              if (this._setPendingPropertyOrPath(path, value, true)) {
                this._invalidateProperties();
              }
            }
          }
        }

        /**
         * Adds items onto the end of the array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.push`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @method push
         * @param {string} path Path to array.
         * @param {...*} items Items to push onto array
         * @return {number} New length of the array.
         * @public
         */

      }, {
        key: 'push',
        value: function push(path) {
          var info = {};
          var array = /** @type {Array}*/Polymer.Path.get(this, path, info);
          var len = array.length;

          for (var _len = arguments.length, items = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            items[_key - 1] = arguments[_key];
          }

          var ret = array.push.apply(array, items);
          if (items.length) {
            notifySplice(this, array, info.path, len, items.length, []);
          }
          return ret;
        }

        /**
         * Removes an item from the end of array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.pop`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @method pop
         * @param {string} path Path to array.
         * @return {*} Item that was removed.
         * @public
         */

      }, {
        key: 'pop',
        value: function pop(path) {
          var info = {};
          var array = /** @type {Array} */Polymer.Path.get(this, path, info);
          var hadLength = Boolean(array.length);
          var ret = array.pop();
          if (hadLength) {
            notifySplice(this, array, info.path, array.length, 0, [ret]);
          }
          return ret;
        }

        /**
         * Starting from the start index specified, removes 0 or more items
         * from the array and inserts 0 or more new items in their place.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.splice`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @method splice
         * @param {string} path Path to array.
         * @param {number} start Index from which to start removing/inserting.
         * @param {number} deleteCount Number of items to remove.
         * @param {...*} items Items to insert into array.
         * @return {Array} Array of removed items.
         * @public
         */

      }, {
        key: 'splice',
        value: function splice(path, start, deleteCount) {
          var info = {};
          var array = /** @type {Array} */Polymer.Path.get(this, path, info);
          // Normalize fancy native splice handling of crazy start values
          if (start < 0) {
            start = array.length - Math.floor(-start);
          } else {
            start = Math.floor(start);
          }
          if (!start) {
            start = 0;
          }

          for (var _len2 = arguments.length, items = Array(_len2 > 3 ? _len2 - 3 : 0), _key2 = 3; _key2 < _len2; _key2++) {
            items[_key2 - 3] = arguments[_key2];
          }

          var ret = array.splice.apply(array, [start, deleteCount].concat(items));
          if (items.length || ret.length) {
            notifySplice(this, array, info.path, start, items.length, ret);
          }
          return ret;
        }

        /**
         * Removes an item from the beginning of array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.pop`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @method shift
         * @param {string} path Path to array.
         * @return {*} Item that was removed.
         * @public
         */

      }, {
        key: 'shift',
        value: function shift(path) {
          var info = {};
          var array = /** @type {Array} */Polymer.Path.get(this, path, info);
          var hadLength = Boolean(array.length);
          var ret = array.shift();
          if (hadLength) {
            notifySplice(this, array, info.path, 0, 0, [ret]);
          }
          return ret;
        }

        /**
         * Adds items onto the beginning of the array at the path specified.
         *
         * The arguments after `path` and return value match that of
         * `Array.prototype.push`.
         *
         * This method notifies other paths to the same array that a
         * splice occurred to the array.
         *
         * @method unshift
         * @param {string} path Path to array.
         * @param {...*} items Items to insert info array
         * @return {number} New length of the array.
         * @public
         */

      }, {
        key: 'unshift',
        value: function unshift(path) {
          var info = {};
          var array = /** @type {Array} */Polymer.Path.get(this, path, info);

          for (var _len3 = arguments.length, items = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            items[_key3 - 1] = arguments[_key3];
          }

          var ret = array.unshift.apply(array, items);
          if (items.length) {
            notifySplice(this, array, info.path, 0, items.length, []);
          }
          return ret;
        }

        /**
         * Notify that a path has changed.
         *
         * Example:
         *
         *     this.item.user.name = 'Bob';
         *     this.notifyPath('item.user.name');
         *
         * @param {string} path Path that should be notified.
         * @param {*=} value Value at the path (optional).
         * @public
        */

      }, {
        key: 'notifyPath',
        value: function notifyPath(path, value) {
          /** @type {string} */
          var propPath = void 0;
          if (arguments.length == 1) {
            // Get value if not supplied
            var info = {};
            value = Polymer.Path.get(this, path, info);
            propPath = info.path;
          } else if (Array.isArray(path)) {
            // Normalize path if needed
            propPath = Polymer.Path.normalize(path);
          } else {
            propPath = /** @type{string} */path;
          }
          if (this._setPendingPropertyOrPath(propPath, value, true, true)) {
            this._invalidateProperties();
          }
        }

        /**
         * Creates a read-only accessor for the given property.
         *
         * To set the property, use the protected `_setProperty` API.
         * To create a custom protected setter (e.g. `_setMyProp()` for
         * property `myProp`), pass `true` for `protectedSetter`.
         *
         * Note, if the property will have other property effects, this method
         * should be called first, before adding other effects.
         *
         * @param {string} property Property name
         * @param {boolean=} protectedSetter Creates a custom protected setter
         *   when `true`.
         * @protected
         */

      }, {
        key: '_createReadOnlyProperty',
        value: function _createReadOnlyProperty(property, protectedSetter) {
          this._addPropertyEffect(property, TYPES.READ_ONLY);
          if (protectedSetter) {
            this['_set' + upper(property)] = function (value) {
              this._setProperty(property, value);
            };
          }
        }

        /**
         * Creates a single-property observer for the given property.
         *
         * @param {string} property Property name
         * @param {string} methodName Name of observer method to call
         * @param {boolean=} dynamicFn Whether the method name should be included as
         *   a dependency to the effect.
         * @protected
         */

      }, {
        key: '_createPropertyObserver',
        value: function _createPropertyObserver(property, methodName, dynamicFn) {
          var info = { property: property, methodName: methodName };
          this._addPropertyEffect(property, TYPES.OBSERVE, {
            fn: runObserverEffect, info: info, trigger: { name: property }
          });
          if (dynamicFn) {
            this._addPropertyEffect(methodName, TYPES.OBSERVE, {
              fn: runObserverEffect, info: info, trigger: { name: methodName }
            });
          }
        }

        /**
         * Creates a multi-property "method observer" based on the provided
         * expression, which should be a string in the form of a normal Javascript
         * function signature: `'methodName(arg1, [..., argn])'`.  Each argument
         * should correspond to a property or path in the context of this
         * prototype (or instance), or may be a literal string or number.
         *
         * @param {string} expression Method expression
         * @param {Object=} dynamicFns Map indicating whether method names should
         *   be included as a dependency to the effect.
         * @protected
         */

      }, {
        key: '_createMethodObserver',
        value: function _createMethodObserver(expression, dynamicFns) {
          var sig = parseMethod(expression);
          if (!sig) {
            throw new Error("Malformed observer expression '" + expression + "'");
          }
          createMethodEffect(this, sig, TYPES.OBSERVE, runMethodEffect, null, dynamicFns);
        }

        /**
         * Causes the setter for the given property to dispatch `<property>-changed`
         * events to notify of changes to the property.
         *
         * @param {string} property Property name
         * @protected
         */

      }, {
        key: '_createNotifyingProperty',
        value: function _createNotifyingProperty(property) {
          this._addPropertyEffect(property, TYPES.NOTIFY, {
            fn: runNotifyEffect,
            info: {
              eventName: CaseMap.camelToDashCase(property) + '-changed',
              property: property
            }
          });
        }

        /**
         * Causes the setter for the given property to reflect the property value
         * to a (dash-cased) attribute of the same name.
         *
         * @param {string} property Property name
         * @protected
         */

      }, {
        key: '_createReflectedProperty',
        value: function _createReflectedProperty(property) {
          var attr = CaseMap.camelToDashCase(property);
          if (attr[0] === '-') {
            console.warn('Property ' + property + ' cannot be reflected to attribute ' + attr + ' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property thisead.');
          } else {
            this._addPropertyEffect(property, TYPES.REFLECT, {
              fn: runReflectEffect,
              info: {
                attrName: attr
              }
            });
          }
        }

        /**
         * Creates a computed property whose value is set to the result of the
         * method described by the given `expression` each time one or more
         * arguments to the method changes.  The expression should be a string
         * in the form of a normal Javascript function signature:
         * `'methodName(arg1, [..., argn])'`
         *
         * @param {string} property Name of computed property to set
         * @param {string} expression Method expression
         * @param {Object=} dynamicFns Map indicating whether method names should
         *   be included as a dependency to the effect.
         * @protected
         */

      }, {
        key: '_createComputedProperty',
        value: function _createComputedProperty(property, expression, dynamicFns) {
          var sig = parseMethod(expression);
          if (!sig) {
            throw new Error("Malformed computed expression '" + expression + "'");
          }
          createMethodEffect(this, sig, TYPES.COMPUTE, runComputedEffect, property, dynamicFns);
        }

        // -- binding ----------------------------------------------

        /**
         * Creates "binding" property effects for all binding bindings
         * in the provided template that forward host properties into DOM stamped
         * from the template via `_stampTemplate`.
         *
         * @param {HTMLTemplateElement} template Template containing binding
         *   bindings
         * @param {Object=} dynamicFns Map indicating whether method names should
         *   be included as a dependency to the effect.
         * @protected
         */

      }, {
        key: '_bindTemplate',
        value: function _bindTemplate(template, dynamicFns) {
          // Clear any existing propagation effects inherited from superClass
          this.__propagateEffects = {};
          this.__notifyListeners = [];
          var notes = this._parseTemplateAnnotations(template);
          processAnnotations(notes);
          for (var i = 0, note; i < notes.length && (note = notes[i]); i++) {
            // where to find the node in the concretized list
            var b$ = note.bindings;
            for (var j = 0, binding; j < b$.length && (binding = b$[j]); j++) {
              if (shouldAddListener(binding)) {
                addAnnotatedListener(this, i, binding.name, binding.parts[0].value, binding.parts[0].event, binding.parts[0].negate);
              }
              addBindingEffect(this, binding, i, dynamicFns);
            }
          }
        }
      }, {
        key: 'PROPERTY_EFFECT_TYPES',
        get: function get() {
          return TYPES;
        }
      }]);

      return PropertyEffects;
    }(propertyEffectsBase);

    return PropertyEffects;
  });
})();