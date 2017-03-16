var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) {

  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: { value: subClass, enumerable: false, writable: true, configurable: true }
  });

  if (superClass) {
    Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }
}

(function () {

  'use strict';

  var styleInterface = window.ShadyCSS;

  /**
   * Element class mixin that provides Polymer's "legacy" API intended to be
   * backward-compatible to the greatest extent possible with the API
   * found on the Polymer 1.x `Polymer.Base` prototype applied to all elements
   * defined using the `Polymer({...})` function.
   *
   * @polymerMixin
   * @mixes Polymer.ElementMixin
   * @mixes Polymer.GestureEventListeners
   * @property isAttached {boolean} Set to `true` in this element's
   *   `connectedCallback` and `false` in `disconnectedCallback`
   * @memberof Polymer
   * @summary Element class mixin that provides Polymer's "legacy" API
   */
  Polymer.LegacyElementMixin = Polymer.dedupingMixin(function (base) {

    var legacyElementBase = Polymer.GestureEventListeners(Polymer.ElementMixin(base));

    /**
     * Map of simple names to touch action names
     * @dict
     */
    var DIRECTION_MAP = {
      'x': 'pan-x',
      'y': 'pan-y',
      'none': 'none',
      'all': 'auto'
    };

    return function (_legacyElementBase) {
      _inherits(LegacyElement, _legacyElementBase);

      function LegacyElement() {
        _classCallCheck(this, LegacyElement);

        var _this = _possibleConstructorReturn(this, (LegacyElement.__proto__ || Object.getPrototypeOf(LegacyElement)).call(this));

        _this.created();
        return _this;
      }

      /**
       * Legacy callback called during the `constructor`, for overriding
       * by the user.
       */


      _createClass(LegacyElement, [{
        key: 'created',
        value: function created() {}
      }, {
        key: 'connectedCallback',
        value: function connectedCallback() {
          _get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), 'connectedCallback', this).call(this);
          this.isAttached = true;
          this.attached();
        }

        /**
         * Legacy callback called during `connectedCallback`, for overriding
         * by the user.
         */

      }, {
        key: 'attached',
        value: function attached() {}
      }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {
          _get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), 'disconnectedCallback', this).call(this);
          this.isAttached = false;
          this.detached();
        }

        /**
         * Legacy callback called during `disconnectedCallback`, for overriding
         * by the user.
         */

      }, {
        key: 'detached',
        value: function detached() {}
      }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(name, old, value) {
          if (old !== value) {
            _get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), 'attributeChangedCallback', this).call(this, name, old, value);
            this.attributeChanged(name, old, value);
          }
        }

        /**
         * Legacy callback called during `attributeChangedChallback`, for overriding
         * by the user.
         */

      }, {
        key: 'attributeChanged',
        value: function attributeChanged() {}

        /**
         * Overrides the default `Polymer.PropertyEffects` implementation to
         * add support for one-time `registration` callback.
         *
         * @override
         */

      }, {
        key: '_initializeProperties',
        value: function _initializeProperties() {
          this._registered();
          _get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), '_initializeProperties', this).call(this);
        }

        /**
         * Called automatically when an element is initializing.
         * Users may override this method to perform class registration time
         * work. The implementation should ensure the work is performed
         * only once for the class.
         * @protected
         */

      }, {
        key: '_registered',
        value: function _registered() {}

        /**
         * Overrides the default `Polymer.PropertyEffects` implementation to
         * add support for installing `hostAttributes` and `listeners`.
         *
         * @override
         */

      }, {
        key: 'ready',
        value: function ready() {
          this._ensureAttributes();
          this._applyListeners();
          _get(LegacyElement.prototype.__proto__ || Object.getPrototypeOf(LegacyElement.prototype), 'ready', this).call(this);
        }

        /**
         * Ensures an element has required attributes. Called when the element
         * is being readied via `ready`. Users should override to set the
         * element's required attributes. The implementation should be sure
         * to check and not override existing attributes added by
         * the user of the element. Typically, setting attributes should be left
         * to the element user and not done here; reasonable exceptions include
         * setting aria roles and focusability.
         * @protected
         */

      }, {
        key: '_ensureAttributes',
        value: function _ensureAttributes() {}

        /**
         * Adds element event listeners. Called when the element
         * is being readied via `ready`. Users should override to
         * add any required element event listeners.
         * In performance critical elements, the work done here should be kept
         * to a minimum since it is done before the element is rendered. In
         * these elements, consider adding listeners asychronously so as not to
         * block render.
         * @protected
         */

      }, {
        key: '_applyListeners',
        value: function _applyListeners() {}

        /**
         * Converts a typed JavaScript value to a string.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features. To customize
         * how properties are serialized to attributes for attribute bindings and
         * `reflectToAttribute: true` properties as well as this method, override
         * the `_serializeValue` method provided by `Polymer.PropertyAccessors`.
         *
         * @param {*} value Value to deserialize
         * @return {string} Serialized value
         */

      }, {
        key: 'serialize',
        value: function serialize(value) {
          return this._serializeValue(value);
        }

        /**
         * Converts a string to a typed JavaScript value.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.  To customize
         * how attributes are deserialized to properties for in
         * `attributeChangedCallback`, override `_deserializeValue` method
         * provided by `Polymer.PropertyAccessors`.
         *
         * @param {string} value String to deserialize
         * @param {*} type Type to deserialize the string to
         */

      }, {
        key: 'deserialize',
        value: function deserialize(value, type) {
          return this._deserializeValue(value, type);
        }

        /**
         * Serializes a property to its associated attribute.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.
         *
         * @param {string} property Property name to reflect.
         * @param {string=} attribute Attribute name to reflect.
         * @param {*=} value Property value to refect.
         */

      }, {
        key: 'reflectPropertyToAttribute',
        value: function reflectPropertyToAttribute(property, attribute, value) {
          this._propertyToAttribute(property, attribute, value);
        }

        /**
         * Sets a typed value to an HTML attribute on a node.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.
         *
         * @param {*} value Value to serialize.
         * @param {string} attribute Attribute name to serialize to.
         * @param {Element} node Element to set attribute to.
         */

      }, {
        key: 'serializeValueToAttribute',
        value: function serializeValueToAttribute(value, attribute, node) {
          this._valueToNodeAttribute(node || this, value, attribute);
        }

        /**
         * Copies own properties (including accessor descriptors) from a source
         * object to a target object.
         *
         * @method extend
         * @param {Object} prototype Target object to copy properties to.
         * @param {Object} api Source object to copy properties from.
         * @return {Object} prototype object that was passed as first argument.
         */

      }, {
        key: 'extend',
        value: function extend(prototype, api) {
          if (!(prototype && api)) {
            return prototype || api;
          }
          var n$ = Object.getOwnPropertyNames(api);
          for (var i = 0, n; i < n$.length && (n = n$[i]); i++) {
            var pd = Object.getOwnPropertyDescriptor(api, n);
            if (pd) {
              Object.defineProperty(prototype, n, pd);
            }
          }
          return prototype;
        }

        /**
         * Copies props from a source object to a target object.
         *
         * Note, this method uses a simple `for...in` strategy for enumerating
         * properties.  To ensure only `ownProperties` are copied from source
         * to target and that accessor implementations are copied, use `extend`.
         *
         * @method mixin
         * @param {Object} target Target object to copy properties to.
         * @param {Object} source Source object to copy properties from.
         * @return {Object} Target object that was passed as first argument.
         */

      }, {
        key: 'mixin',
        value: function mixin(target, source) {
          for (var i in source) {
            target[i] = source[i];
          }
          return target;
        }

        /**
         * Sets the prototype of an object.
         *
         * Note this method is provided as backward-compatible legacy API
         * only.  It is not directly called by any Polymer features.
         */

      }, {
        key: 'chainObject',
        value: function chainObject(object, inherited) {
          if (object && inherited && object !== inherited) {
            object.__proto__ = inherited;
          }
          return object;
        }

        /* **** Begin Template **** */

        /**
         * Calls `importNode` on the `content` of the `template` specified and
         * returns a document fragment containing the imported content.
         *
         * @method instanceTemplate
         * @param {HTMLTemplateElement} template HTML template element to instance.
         * @return {DocumentFragment} Document fragment containing the imported
         *   template content.
        */

      }, {
        key: 'instanceTemplate',
        value: function instanceTemplate(template) {
          var dom = /** @type {DocumentFragment} */
          document.importNode(template._content || template.content, true);
          return dom;
        }

        /* **** Begin Events **** */

        /**
         * Dispatches a custom event with an optional detail value.
         *
         * @method fire
         * @param {string} type Name of event type.
         * @param {*=} detail Detail value containing event-specific
         *   payload.
         * @param {Object=} options Object specifying options.  These may include:
         *  `bubbles` (boolean, defaults to `true`),
         *  `cancelable` (boolean, defaults to false), and
         *  `node` on which to fire the event (HTMLElement, defaults to `this`).
         * @return {Event} The new event that was fired.
         */

      }, {
        key: 'fire',
        value: function fire(type, detail, options) {
          options = options || {};
          detail = detail === null || detail === undefined ? {} : detail;
          var event = new Event(type, {
            bubbles: options.bubbles === undefined ? true : options.bubbles,
            cancelable: Boolean(options.cancelable),
            composed: options.composed === undefined ? true : options.composed
          });
          event.detail = detail;
          var node = options.node || this;
          node.dispatchEvent(event);
          return event;
        }

        /**
         * Convenience method to add an event listener on a given element,
         * late bound to a named method on this element.
         *
         * @method listen
         * @param {Element} node Element to add event listener to.
         * @param {string} eventName Name of event to listen for.
         * @param {string} methodName Name of handler method on `this` to call.
         */

      }, {
        key: 'listen',
        value: function listen(node, eventName, methodName) {
          node = node || this;
          var hbl = this.__boundListeners || (this.__boundListeners = new WeakMap());
          var bl = hbl.get(node);
          if (!bl) {
            bl = {};
            hbl.set(node, bl);
          }
          var key = eventName + methodName;
          if (!bl[key]) {
            bl[key] = this._addMethodEventListenerToNode(node, eventName, methodName, this);
          }
        }

        /**
         * Convenience method to remove an event listener from a given element,
         * late bound to a named method on this element.
         *
         * @method unlisten
         * @param {Element} node Element to remove event listener from.
         * @param {string} eventName Name of event to stop listening to.
         * @param {string} methodName Name of handler method on `this` to not call
         anymore.
         */

      }, {
        key: 'unlisten',
        value: function unlisten(node, eventName, methodName) {
          node = node || this;
          var bl = this.__boundListeners && this.__boundListeners.get(node);
          var key = eventName + methodName;
          var handler = bl && bl[key];
          if (handler) {
            this._removeEventListenerFromNode(node, eventName, handler);
            bl[key] = null;
          }
        }

        /**
         * Override scrolling behavior to all direction, one direction, or none.
         *
         * Valid scroll directions:
         *   - 'all': scroll in any direction
         *   - 'x': scroll only in the 'x' direction
         *   - 'y': scroll only in the 'y' direction
         *   - 'none': disable scrolling for this node
         *
         * @method setScrollDirection
         * @param {String=} direction Direction to allow scrolling
         * Defaults to `all`.
         * @param {HTMLElement=} node Element to apply scroll direction setting.
         * Defaults to `this`.
         */

      }, {
        key: 'setScrollDirection',
        value: function setScrollDirection(direction, node) {
          Polymer.Gestures.setTouchAction(node || this, DIRECTION_MAP[direction] || 'auto');
        }
        /* **** End Events **** */

        /**
         * Convenience method to run `querySelector` on this local DOM scope.
         *
         * This function calls `Polymer.dom(this.root).querySelector(slctr)`.
         *
         * @method $$
         * @param {string} slctr Selector to run on this local DOM scope
         * @return {Element} Element found by the selector, or null if not found.
         */

      }, {
        key: '$$',
        value: function $$(slctr) {
          return this.root.querySelector(slctr);
        }

        /**
         * Return the element whose local dom within which this element
         * is contained. This is a shorthand for
         * `this.getRootNode().host`.
         */

      }, {
        key: 'distributeContent',


        /**
         * Force this element to distribute its children to its local dom.
         * This is necessary only when ShadyDOM is used and only in cases that
         * are not automatically handled. For example,
         * a user should call `distributeContent` if distribution has been
         * invalidated due to an element being added or removed from the shadowRoot
         * that contains an insertion point (<slot>) inside its subtree.
         * @method distributeContent
         */
        value: function distributeContent() {
          if (window.ShadyDOM && this.shadowRoot) {
            this.shadowRoot.forceRender();
          }
        }

        /**
         * Returns a list of nodes that are the effective childNodes. The effective
         * childNodes list is the same as the element's childNodes except that
         * any `<content>` elements are replaced with the list of nodes distributed
         * to the `<content>`, the result of its `getDistributedNodes` method.
         *
         * @method getEffectiveChildNodes
         * @return {Array<Node>} List of effctive child nodes.
         */

      }, {
        key: 'getEffectiveChildNodes',
        value: function getEffectiveChildNodes() {
          return Polymer.dom(this).getEffectiveChildNodes();
        }

        /**
         * Returns a list of nodes distributed within this element that match
         * `selector`. These can be dom children or elements distributed to
         * children that are insertion points.
         * @method queryDistributedElements
         * @param {string} selector Selector to run.
         * @return {Array<Node>} List of distributed elements that match selector.
         */

      }, {
        key: 'queryDistributedElements',
        value: function queryDistributedElements(selector) {
          return Polymer.dom(this).queryDistributedElements(selector);
        }

        /**
         * Returns a list of elements that are the effective children. The effective
         * children list is the same as the element's children except that
         * any `<content>` elements are replaced with the list of elements
         * distributed to the `<content>`.
         *
         * @method getEffectiveChildren
         * @return {Array<Node>} List of effctive children.
         */

      }, {
        key: 'getEffectiveChildren',
        value: function getEffectiveChildren() {
          var list = this.getEffectiveChildNodes();
          return list.filter(function (n) {
            return n.nodeType === Node.ELEMENT_NODE;
          });
        }

        /**
         * Returns a string of text content that is the concatenation of the
         * text content's of the element's effective childNodes (the elements
         * returned by <a href="#getEffectiveChildNodes>getEffectiveChildNodes</a>.
         *
         * @method getEffectiveTextContent
         * @return {string} List of effctive children.
         */

      }, {
        key: 'getEffectiveTextContent',
        value: function getEffectiveTextContent() {
          var cn = this.getEffectiveChildNodes();
          var tc = [];
          for (var i = 0, c; c = cn[i]; i++) {
            if (c.nodeType !== Node.COMMENT_NODE) {
              tc.push(c.textContent);
            }
          }
          return tc.join('');
        }

        /**
         * Returns the first effective childNode within this element that
         * match `selector`. These can be dom child nodes or elements distributed
         * to children that are insertion points.
         * @method queryEffectiveChildren
         * @param {string} selector Selector to run.
         * @return {Object<Node>} First effective child node that matches selector.
         */

      }, {
        key: 'queryEffectiveChildren',
        value: function queryEffectiveChildren(selector) {
          var e$ = this.queryDistributedElements(selector);
          return e$ && e$[0];
        }

        /**
         * Returns a list of effective childNodes within this element that
         * match `selector`. These can be dom child nodes or elements distributed
         * to children that are insertion points.
         * @method queryEffectiveChildren
         * @param {string} selector Selector to run.
         * @return {Array<Node>} List of effective child nodes that match selector.
         */

      }, {
        key: 'queryAllEffectiveChildren',
        value: function queryAllEffectiveChildren(selector) {
          return this.queryDistributedElements(selector);
        }

        /**
         * Returns a list of nodes distributed to this element's `<slot>`.
         *
         * If this element contains more than one `<slot>` in its local DOM,
         * an optional selector may be passed to choose the desired content.
         *
         * @method getContentChildNodes
         * @param {String=} slctr CSS selector to choose the desired
         *   `<slot>`.  Defaults to `content`.
         * @return {Array<Node>} List of distributed nodes for the `<slot>`.
         */

      }, {
        key: 'getContentChildNodes',
        value: function getContentChildNodes(slctr) {
          var content = this.root.querySelector(slctr || 'slot');
          return content ? Polymer.dom(content).getDistributedNodes() : [];
        }

        /**
         * Returns a list of element children distributed to this element's
         * `<slot>`.
         *
         * If this element contains more than one `<slot>` in its
         * local DOM, an optional selector may be passed to choose the desired
         * content.  This method differs from `getContentChildNodes` in that only
         * elements are returned.
         *
         * @method getContentChildNodes
         * @param {String=} slctr CSS selector to choose the desired
         *   `<content>`.  Defaults to `content`.
         * @return {Array<HTMLElement>} List of distributed nodes for the
         *   `<slot>`.
         */

      }, {
        key: 'getContentChildren',
        value: function getContentChildren(slctr) {
          return this.getContentChildNodes(slctr).filter(function (n) {
            return n.nodeType === Node.ELEMENT_NODE;
          });
        }

        /**
         * Checks whether an element is in this element's light DOM tree.
         *
         * @method isLightDescendant
         * @param {?Node} node The element to be checked.
         * @return {Boolean} true if node is in this element's light DOM tree.
         */

      }, {
        key: 'isLightDescendant',
        value: function isLightDescendant(node) {
          return this !== node && this.contains(node) && this.getRootNode() === node.getRootNode();
        }

        /**
         * Checks whether an element is in this element's local DOM tree.
         *
         * @method isLocalDescendant
         * @param {HTMLElement=} node The element to be checked.
         * @return {boolean} true if node is in this element's local DOM tree.
         */

      }, {
        key: 'isLocalDescendant',
        value: function isLocalDescendant(node) {
          return this.root === node.getRootNode();
        }

        // NOTE: should now be handled by ShadyCss library.

      }, {
        key: 'scopeSubtree',
        value: function scopeSubtree(container, shouldObserve) {} // eslint-disable-line no-unused-vars


        /**
         * Returns the computed style value for the given property.
         * @param {String} property
         * @return {String} the computed value
         */

      }, {
        key: 'getComputedStyleValue',
        value: function getComputedStyleValue(property) {
          return styleInterface.getComputedStyleValue(this, property);
        }

        // debounce

        /**
         * Call `debounce` to collapse multiple requests for a named task into
         * one invocation which is made after the wait time has elapsed with
         * no new request.  If no wait time is given, the callback will be called
         * at microtask timing (guaranteed before paint).
         *
         *     debouncedClickAction(e) {
         *       // will not call `processClick` more than once per 100ms
         *       this.debounce('click', function() {
         *        this.processClick();
         *       } 100);
         *     }
         *
         * @method debounce
         * @param {String} jobName String to indentify the debounce job.
         * @param {function()} callback Function that is called (with `this`
         *   context) when the wait time elapses.
         * @param {number} wait Optional wait time in milliseconds (ms) after the
         *   last signal that must elapse before invoking `callback`
         */

      }, {
        key: 'debounce',
        value: function debounce(jobName, callback, wait) {
          this._debouncers = this._debouncers || {};
          return this._debouncers[jobName] = Polymer.Debouncer.debounce(this._debouncers[jobName], wait > 0 ? Polymer.Async.timeOut.after(wait) : Polymer.Async.microTask, callback.bind(this));
        }

        /**
         * Returns whether a named debouncer is active.
         *
         * @method isDebouncerActive
         * @param {String} jobName The name of the debouncer started with `debounce`
         * @return {boolean} Whether the debouncer is active (has not yet fired).
         */

      }, {
        key: 'isDebouncerActive',
        value: function isDebouncerActive(jobName) {
          this._debouncers = this._debouncers || {};
          var debouncer = this._debouncers[jobName];
          return !!(debouncer && debouncer.isActive());
        }

        /**
         * Immediately calls the debouncer `callback` and inactivates it.
         *
         * @method flushDebouncer
         * @param {String} jobName The name of the debouncer started with `debounce`
         */

      }, {
        key: 'flushDebouncer',
        value: function flushDebouncer(jobName) {
          this._debouncers = this._debouncers || {};
          var debouncer = this._debouncers[jobName];
          if (debouncer) {
            debouncer.flush();
          }
        }

        /**
         * Cancels an active debouncer.  The `callback` will not be called.
         *
         * @method cancelDebouncer
         * @param {String} jobName The name of the debouncer started with `debounce`
         */

      }, {
        key: 'cancelDebouncer',
        value: function cancelDebouncer(jobName) {
          this._debouncers = this._debouncers || {};
          var debouncer = this._debouncers[jobName];
          if (debouncer) {
            debouncer.cancel();
          }
        }

        /**
         * Runs a callback function asyncronously.
         *
         * By default (if no waitTime is specified), async callbacks are run at
         * microtask timing, which will occur before paint.
         *
         * @method async
         * @param {Function} callback The callback function to run, bound to `this`.
         * @param {number=} waitTime Time to wait before calling the
         *   `callback`.  If unspecified or 0, the callback will be run at microtask
         *   timing (before paint).
         * @return {number} Handle that may be used to cancel the async job.
         */

      }, {
        key: 'async',
        value: function async(callback, waitTime) {
          return waitTime > 0 ? Polymer.Async.timeOut.run(callback.bind(this), waitTime) : ~Polymer.Async.microTask.run(callback.bind(this));
        }

        /**
         * Cancels an async operation started with `async`.
         *
         * @method cancelAsync
         * @param {number} handle Handle returned from original `async` call to
         *   cancel.
         */

      }, {
        key: 'cancelAsync',
        value: function cancelAsync(handle) {
          handle < 0 ? Polymer.Async.microTask.cancel(~handle) : Polymer.Async.timeOut.cancel(handle);
        }

        // other

        /**
         * Convenience method for creating an element and configuring it.
         *
         * @method create
         * @param {string} tag HTML element tag to create.
         * @param {Object} props Object of properties to configure on the
         *    instance.
         * @return {Element} Newly created and configured element.
         */

      }, {
        key: 'create',
        value: function create(tag, props) {
          var elt = document.createElement(tag);
          if (props) {
            if (elt.setProperties) {
              elt.setProperties(props);
            } else {
              for (var n in props) {
                elt[n] = props[n];
              }
            }
          }
          return elt;
        }

        /**
         * Convenience method for importing an HTML document imperatively.
         *
         * This method creates a new `<link rel="import">` element with
         * the provided URL and appends it to the document to start loading.
         * In the `onload` callback, the `import` property of the `link`
         * element will contain the imported document contents.
         *
         * @method importHref
         * @param {string} href URL to document to load.
         * @param {Function} onload Callback to notify when an import successfully
         *   loaded.
         * @param {Function} onerror Callback to notify when an import
         *   unsuccessfully loaded.
         * @param {boolean} optAsync True if the import should be loaded `async`.
         *   Defaults to `false`.
         * @return {HTMLLinkElement} The link element for the URL to be loaded.
         */

      }, {
        key: 'importHref',
        value: function importHref(href, onload, onerror, optAsync) {
          // eslint-disable-line no-unused-vars
          var loadFn = onload ? onload.bind(this) : null;
          var errorFn = onerror ? onerror.bind(this) : null;
          return Polymer.importHref(href, loadFn, errorFn, optAsync);
        }

        /**
         * Polyfill for Element.prototype.matches, which is sometimes still
         * prefixed.
         *
         * @method elementMatches
         * @param {string} selector Selector to test.
         * @param {Element=} node Element to test the selector against.
         * @return {boolean} Whether the element matches the selector.
         */

      }, {
        key: 'elementMatches',
        value: function elementMatches(selector, node) {
          return Polymer.dom.matchesSelector(node || this, selector);
        }

        /**
         * Toggles an HTML attribute on or off.
         *
         * @method toggleAttribute
         * @param {String} name HTML attribute name
         * @param {boolean=} bool Boolean to force the attribute on or off.
         *    When unspecified, the state of the attribute will be reversed.
         * @param {HTMLElement=} node Node to target.  Defaults to `this`.
         */

      }, {
        key: 'toggleAttribute',
        value: function toggleAttribute(name, bool, node) {
          node = node || this;
          if (arguments.length == 1) {
            bool = !node.hasAttribute(name);
          }
          if (bool) {
            node.setAttribute(name, '');
          } else {
            node.removeAttribute(name);
          }
        }

        /**
         * Toggles a CSS class on or off.
         *
         * @method toggleClass
         * @param {String} name CSS class name
         * @param {boolean=} bool Boolean to force the class on or off.
         *    When unspecified, the state of the class will be reversed.
         * @param {HTMLElement=} node Node to target.  Defaults to `this`.
         */

      }, {
        key: 'toggleClass',
        value: function toggleClass(name, bool, node) {
          node = node || this;
          if (arguments.length == 1) {
            bool = !node.classList.contains(name);
          }
          if (bool) {
            node.classList.add(name);
          } else {
            node.classList.remove(name);
          }
        }

        /**
         * Cross-platform helper for setting an element's CSS `transform` property.
         *
         * @param {string} transformText Transform setting.
         * @param {HTMLElement=} node Element to apply the transform to.
         * Defaults to `this`
         */

      }, {
        key: 'transform',
        value: function transform(transformText, node) {
          node = node || this;
          node.style.webkitTransform = transformText;
          node.style.transform = transformText;
        }

        /**
         * Cross-platform helper for setting an element's CSS `translate3d`
         * property.
         *
         * @method translate3d
         * @param {number} x X offset.
         * @param {number} y Y offset.
         * @param {number} z Z offset.
         * @param {HTMLElement=} node Element to apply the transform to.
         * Defaults to `this`.
         */

      }, {
        key: 'translate3d',
        value: function translate3d(x, y, z, node) {
          node = node || this;
          this.transform('translate3d(' + x + ',' + y + ',' + z + ')', node);
        }

        /**
         * Removes an item from an array, if it exists.
         *
         * If the array is specified by path, a change notification is
         * generated, so that observers, data bindings and computed
         * properties watching that path can update.
         *
         * If the array is passed directly, **no change
         * notification is generated**.
         *
         * @method arrayDelete
         * @param {string | !Array<number|string>} arrayOrPath Path to array from which to remove the item
         *   (or the array itself).
         * @param {*} item Item to remove.
         * @return {Array} Array containing item removed.
         */

      }, {
        key: 'arrayDelete',
        value: function arrayDelete(arrayOrPath, item) {
          var index = void 0;
          if (Array.isArray(arrayOrPath)) {
            index = arrayOrPath.indexOf(item);
            if (index >= 0) {
              return arrayOrPath.splice(index, 1);
            }
          } else {
            var arr = Polymer.Path.get(this, arrayOrPath);
            index = arr.indexOf(item);
            if (index >= 0) {
              return this.splice(arrayOrPath, index, 1);
            }
          }
          return null;
        }

        // logging

        /**
         * Facades `console.log`/`warn`/`error` as override point.
         *
         * @param {string} level One of 'log', 'warn', 'error'
         * @param {Array} args Array of strings or objects to log
         */

      }, {
        key: '_logger',
        value: function _logger(level, args) {
          var _console;

          // accept ['foo', 'bar'] and [['foo', 'bar']]
          if (Array.isArray(args) && args.length === 1) {
            args = args[0];
          }
          switch (level) {
            case 'log':
            case 'warn':
            case 'error':
              (_console = console)[level].apply(_console, _toConsumableArray(args));
          }
        }

        /**
         * Facades `console.log` as an override point.
         *
         * @param {...*} var_args Array of strings or objects to log
         */

      }, {
        key: '_log',
        value: function _log() {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          this._logger('log', args);
        }

        /**
         * Facades `console.warn` as an override point.
         *
         * @param {...*} var_args Array of strings or objects to log
         */

      }, {
        key: '_warn',
        value: function _warn() {
          for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          this._logger('warn', args);
        }

        /**
         * Facades `console.error` as an override point.
         *
         * @param {...*} var_args Array of strings or objects to log
         */

      }, {
        key: '_error',
        value: function _error() {
          for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          this._logger('error', args);
        }

        /**
         * Formats a message using the element type an a method name.
         *
         * @param {string} methodName Method name to associate with message
         * @param {...*} var_args Array of strings or objects to log
         * @return {string} String with formatting information for `console`
         *   logging.
         */

      }, {
        key: '_logf',
        value: function _logf() {
          for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          return ['[%s::%s]', this.is].concat(args);
        }
      }, {
        key: 'domHost',
        get: function get() {
          var root = this.getRootNode();
          return root instanceof DocumentFragment ? root.host : root;
        }
      }]);

      return LegacyElement;
    }(legacyElementBase);
  });
})();