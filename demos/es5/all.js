(function () {
  'use strict';

  var userPolymer = window.Polymer;

  /**
   * @namespace Polymer
   * @summary Polymer is a lightweight library built on top of the web
   * standards-based Web Components API's, and makes it easy to build your
   * own custom HTML elements.
   */
  window.Polymer = function (info) {
    return window.Polymer._polymerFn(info);
  };

  // support user settings on the Polymer object
  if (userPolymer) {
    Object.assign(Polymer, userPolymer);
  }

  // To be plugged by legacy implementation if loaded
  window.Polymer._polymerFn = function () {
    throw new Error('Load polymer.html to use the Polymer() function.');
  };
  window.Polymer.version = '2.0-preview';

  /* eslint-disable no-unused-vars */
  /*
  When using Closure Compiler, goog.reflect.objectProperty(property, object) is replaced by the munged name for object[property]
  We cannot alias this function, so we have to use a small shim that has the same behavior when not compiling.
  */
  window.goog = window.goog || {};
  window.goog.reflect = window.goog.reflect || {
    objectProperty: function objectProperty(s, o) {
      return s;
    }
  };
  /* eslint-enable */
})();









(function () {

  'use strict';

  // unique global id for deduping mixins.

  var dedupeId = 0;

  /**
   * Given a mixin producing function, memoize applications of mixin to base
   * @private
   */
  function cachingMixin(mixin) {
    return function (base) {
      if (!mixin.__mixinApplications) {
        mixin.__mixinApplications = new WeakMap();
      }
      var map = mixin.__mixinApplications;
      var application = map.get(base);
      if (!application) {
        application = mixin(base);
        map.set(base, application);
      }
      return application;
    };
  }

  /**
   * Wraps an ES6 class expression mixin such that the mixin is only applied
   * if it has not already been applied its base argument.  Also memoizes mixin
   * applications.
   *
   * @memberof Polymer
   * @param {function} mixin ES6 class expression mixin to wrap
   * @return {function} Wrapped mixin that deduplicates and memoizes
   *   mixin applications to base
   */
  Polymer.dedupingMixin = function (mixin) {
    mixin = cachingMixin(mixin);
    // maintain a unique id for each mixin
    if (!mixin.__id) {
      mixin.__dedupeId = ++dedupeId;
    }
    return function (base) {
      var baseSet = base.__mixinSet;
      if (baseSet && baseSet[mixin.__dedupeId]) {
        return base;
      }
      var extended = mixin(base);
      // copy inherited mixin set from the extended class, or the base class
      // NOTE: we avoid use of Set here because some browser (IE11)
      // cannot extend a base Set via the constructor.
      extended.__mixinSet = Object.create(extended.__mixinSet || baseSet || null);
      extended.__mixinSet[mixin.__dedupeId] = true;
      return extended;
    };
  };
})();









(function () {
  'use strict';

  var caseMap = {};
  var DASH_TO_CAMEL = /-[a-z]/g;
  var CAMEL_TO_DASH = /([A-Z])/g;

  /**
   * Module with utilities for converting between "dash-case" and "camelCase"
   * identifiers.
   *
   * @namespace
   * @memberof Polymer
   * @summary Module that provides utilities for converting between "dash-case"
   *   and "camelCase".
   */
  var CaseMap = {

    /**
     * Converts "dash-case" identifier (e.g. `foo-bar-baz`) to "camelCase"
     * (e.g. `fooBarBaz`).
     *
     * @memberof Polymer.CaseMap
     * @param {string} dash Dash-case identifier
     * @return {string} Camel-case representation of the identifier
     */
    dashToCamelCase: function dashToCamelCase(dash) {
      return caseMap[dash] || (caseMap[dash] = dash.indexOf('-') < 0 ? dash : dash.replace(DASH_TO_CAMEL, function (m) {
        return m[1].toUpperCase();
      }));
    },


    /**
     * Converts "camelCase" identifier (e.g. `fooBarBaz`) to "dash-case"
     * (e.g. `foo-bar-baz`).
     *
     * @memberof Polymer.CaseMap
     * @param {string} camel Camel-case identifier
     * @return {string} Dash-case representation of the identifier
     */
    camelToDashCase: function camelToDashCase(camel) {
      return caseMap[camel] || (caseMap[camel] = camel.replace(CAMEL_TO_DASH, '-$1').toLowerCase());
    }
  };

  Polymer.CaseMap = CaseMap;
})();










var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';
  /**
   * @typedef Object<string, {
   *   value: *,
   *   type: (Function | undefined),
   *   readOnly: (boolean | undefined),
   *   computed: (string | undefined),
   *   reflectToAttribute: (boolean | undefined),
   *   notify: (boolean | undefined),
   *   observer: (string | undefined)
   * }>)
   */

  var PolymerElementProperties = void 0; // eslint-disable-line no-unused-vars

  /** @record */
  var PolymerElementConstructor = function PolymerElementConstructor() {}; // eslint-disable-line no-unused-vars
  /** @type {(string | undefined)} */
  PolymerElementConstructor.is;
  /** @type {(string | undefined)} */
  PolymerElementConstructor.extends;
  /** @type {(!PolymerElementProperties | undefined)} */
  PolymerElementConstructor.properties;
  /** @type {(!Array<string> | undefined)} */
  PolymerElementConstructor.observers;
  /** @type {(!HTMLTemplateElement | string | undefined)} */
  PolymerElementConstructor.template;

  /**
   * Element class mixin that provides the core API for Polymer's meta-programming
   * features including template stamping, data-binding, attribute deserialization,
   * and property change observation.
   *
   * Subclassers may provide the following static getters to return metadata
   * used to configure Polymer's features for the class:
   *
   * - `static get is()`: When the template is provided via a `dom-module`,
   *   users should return the `dom-module` id from a static `is` getter.  If
   *   no template is needed or the template is provided directly via the
   *   `template` getter, there is no need to define `is` for the element.
   *
   * - `static get template()`: Users may provide the template directly (as
   *   opposed to via `dom-module`) by implementing a static `template` getter.
   *   The getter may return an `HTMLTemplateElement` or a string, which will
   *   automatically be parsed into a template.
   *
   * - `static get properties()`: Should return an object describing
   *   property-related metadata used by Polymer features (key: property name
   *   value: object containing property metadata). Valid keys in per-property
   *   metadata include:
   *   - `type` (String|Number|Object|Array|...): Used by
   *     `attributeChangedCallback` to determine how string-based attributes
   *     are deserialized to JavaScript property values.
   *   - `notify` (boolean): Causes a change in the property to fire a
   *     non-bubbling event called `<property>-changed`. Elements that have
   *     enabled two-way binding to the property use this event to observe changes.
   *   - `readOnly` (boolean): Creates a getter for the property, but no setter.
   *     To set a read-only property, use the private setter method
   *     `_setProperty(property, value)`.
   *   - `observer` (string): Observer method name that will be called when
   *     the property changes. The arguments of the method are
   *     `(value, previousValue)`.
   *   - `computed` (string): String describing method and dependent properties
   *     for computing the value of this property (e.g. `'computeFoo(bar, zot)'`).
   *     Computed properties are read-only by default and can only be changed
   *     via the return value of the computing method.
   *
   * - `static get observers()`: Array of strings describing multi-property
   *   observer methods and their dependent properties (e.g.
   *   `'observeABC(a, b, c)'`).
   *
   * The base class provides default implementations for the following standard
   * custom element lifecycle callbacks; users may override these, but should
   * call the super method to ensure
   * - `constructor`: Run when the element is created or upgraded
   * - `connectedCallback`: Run each time the element is connected to the
   *   document
   * - `disconnectedCallback`: Run each time the element is disconnected from
   *   the document
   * - `attributeChangedCallback`: Run each time an attribute in
   *   `observedAttributes` is set or removed (note: this element's default
   *   `observedAttributes` implementation will automatically return an array
   *   of dash-cased attributes based on `properties`)
   *
   * @polymerMixin
   * @mixes Polymer.PropertyEffects
   * @memberof Polymer
   * @property rootPath {string} Set to the value of `Polymer.rootPath`,
   *   which defaults to the main document path
   * @property importPath {string} Set to the value of the class's static
   *   `importPath` property, which defaults to the path of this element's
   *   `dom-module` (when `is` is used), but can be overridden for other
   *   import strategies.
   * @summary Element class mixin that provides the core API for Polymer's
   * meta-programming features.
   */
  Polymer.ElementMixin = Polymer.dedupingMixin(function (base) {

    // var polymerElementBase = Polymer.PropertyEffects(base);
    var polymerElementBase = base;

    var caseMap = Polymer.CaseMap;

    /**
     * Returns the `properties` object specifically on `klass`. Use for:
     * (1) super chain mixes togther to make `propertiesForClass` which is
     * then used to make `observedAttributes`.
     * (2) properties effects and observers are created from it at `finalize` time.
     * @param {HTMLElement} klass
     * @private
     */
    function ownPropertiesForClass(klass) {
      if (!klass.hasOwnProperty(goog.reflect.objectProperty('__ownProperties', klass))) {
        klass.__ownProperties = klass.hasOwnProperty(goog.reflect.objectProperty('properties', klass)) ? klass.properties : {};
      }
      return klass.__ownProperties;
    }

    /**
     * Returns the `observers` array specifically on `klass`. Use for
     * setting up observers.
     * @param {HTMLElement} klass
     * @private
     */
    function ownObserversForClass(klass) {
      if (!klass.hasOwnProperty(goog.reflect.objectProperty('__ownObservers', klass))) {
        klass.__ownObservers = klass.hasOwnProperty(goog.reflect.objectProperty('observers', klass)) ? klass.observers : [];
      }
      return klass.__ownObservers;
    }

    /**
     * Mixes `props` into `flattenedProps` but upgrades shorthand type
     * syntax to { type: Type}.
     * @param {Object} flattenedProps
     * @param {Object} props
     * @private
     */
    function flattenProperties(flattenedProps, props) {
      for (var p in props) {
        var o = props[p];
        if (typeof o == 'function') {
          o = { type: o };
        }
        flattenedProps[p] = o;
      }
      return flattenedProps;
    }

    /**
     * Returns a flattened list of properties mixed together from the chain of all
     * constructor's `config.properties`. This list is used to create
     * (1) observedAttributes,
     * (2) class property default values
     * @param {HTMLElement} klass
     * @return {PolymerElementProperties}
     * @private
     */
    function propertiesForClass(klass) {
      if (!klass.hasOwnProperty(goog.reflect.objectProperty('__classProperties', klass))) {
        klass.__classProperties = flattenProperties({}, ownPropertiesForClass(klass));
        var superCtor = Object.getPrototypeOf(klass.prototype).constructor;
        if (superCtor.prototype instanceof PolymerElement) {
          klass.__classProperties = Object.assign(Object.create(propertiesForClass(superCtor)), klass.__classProperties);
        }
      }
      return klass.__classProperties;
    }

    /**
     * Returns a list of properties with default values.
     * This list is created as an optimization since it is a subset of
     * the list returned from `propertiesForClass`.
     * This list is used in `_initializeProperties` to set property defaults.
     * @param {HTMLElement} klass
     * @return {PolymerElementProperties}
     * @private
     */
    function propertyDefaultsForClass(klass) {
      if (!klass.hasOwnProperty(goog.reflect.objectProperty('__classPropertyDefaults', klass))) {
        klass.__classPropertyDefaults = null;
        var props = propertiesForClass(klass);
        for (var p in props) {
          var info = props[p];
          if ('value' in info) {
            klass.__classPropertyDefaults = klass.__classPropertyDefaults || {};
            klass.__classPropertyDefaults[p] = info;
          }
        }
      }
      return klass.__classPropertyDefaults;
    }

    /**
     * Returns true if a `klass` has finalized. Called in `ElementClass.finalize()`
     * @param {HTMLElement} klass
     * @private
     */
    function hasClassFinalized(klass) {
      return klass.hasOwnProperty(goog.reflect.objectProperty('__finalized', klass));
    }

    /**
     * Called by `ElementClass.finalize()`. Ensures this `klass` and
     * *all superclasses* are finalized by traversing the prototype chain
     * and calling `klass.finalize()`.
     * @param {HTMLElement} klass
     * @private
     */
    function finalizeClassAndSuper(klass) {
      var proto = klass.prototype;
      var superCtor = Object.getPrototypeOf(proto).constructor;
      if (superCtor.prototype instanceof PolymerElement) {
        superCtor.finalize();
      }
      finalizeClass(klass);
    }

    /**
     * Configures a `klass` based on a staic `klass.config` object and
     * a `template`. This includes creating accessors and effects
     * for properties in `config` and the `template` as well as preparing the
     * `template` for stamping.
     */
    function finalizeClass(klass) {
      klass.__finalized = true;
      var proto = klass.prototype;
      if (klass.hasOwnProperty(goog.reflect.objectProperty('is', klass)) && klass.is) {
        Polymer.telemetry.register(proto);
      }
      var props = ownPropertiesForClass(klass);
      if (props) {
        finalizeProperties(proto, props);
      }
      var observers = ownObserversForClass(klass);
      if (observers) {
        finalizeObservers(proto, observers, props);
      }
      // note: create "working" template that is finalized at instance time
      var template = klass.template;
      if (template) {
        if (typeof template === 'string') {
          var t = document.createElement('template');
          t.innerHTML = template;
          template = t;
        } else {
          template = template.cloneNode(true);
        }
        proto._template = template;
      }
    }

    /**
     * Configures a `proto` based on a `properties` object.
     * Leverages `PropertyEffects` to create property accessors and effects
     * supporting, observers, reflecting to attributes, change notification,
     * computed properties, and read only properties.
     * @param {HTMLElement} proto
     * @param {Object} properties
     * @private
     */
    function finalizeProperties(proto, properties) {
      for (var p in properties) {
        createPropertyFromConfig(proto, p, properties[p], properties);
      }
    }

    /**
     * Configures a `proto` based on a `observers` array.
     * Leverages `PropertyEffects` to create observers.
     * @param {HTMLElement} proto
     * @param {Array} observers
     * @private
     */
    function finalizeObservers(proto, observers, dynamicProperties) {
      for (var i = 0; i < observers.length; i++) {
        proto._createMethodObserver(observers[i], dynamicProperties);
      }
    }

    /**
     * Creates effects for a property.
     *
     * Note, once a property has been set to
     * `readOnly`, `computed`, `reflectToAttribute`, or `notify`
     * these values may not be changed. For example, a subclass cannot
     * alter these settings. However, additional `observers` may be added
     * by subclasses.
     *
     * The info object should may contain property metadata as follows:
     *
     * * `type`: {function} type to which an attribute matching the property
     * is deserialized. Note the property is camel-cased from a dash-cased
     * attribute. For example, 'foo-bar' attribute is dersialized to a
     * property named 'fooBar'.
     *
     * * `readOnly`: {boolean} creates a readOnly property and
     * makes a private setter for the private of the form '_setFoo' for a
     * property 'foo',
     *
     * * `computed`: {string} creates a computed property. A computed property
     * also automatically is set to `readOnly: true`. The value is calculated
     * by running a method and arguments parsed from the given string. For
     * example 'compute(foo)' will compute a given property when the
     * 'foo' property changes by executing the 'compute' method. This method
     * must return the computed value.
     *
     * * `reflectToAttriute`: {boolean} If true, the property value is reflected
     * to an attribute of the same name. Note, the attribute is dash-cased
     * so a property named 'fooBar' is reflected as 'foo-bar'.
     *
     * * `notify`: {boolean} sends a non-bubbling notification event when
     * the property changes. For example, a property named 'foo' sends an
     * event named 'foo-changed' with `event.detail` set to the value of
     * the property.
     *
     * * observer: {string} name of a method that runs when the property
     * changes. The arguments of the method are (value, previousValue).
     *
     * Note: Users may want control over modifying property
     * effects via subclassing. For example, a user might want to make a
     * reflectToAttribute property not do so in a subclass. We've chosen to
     * disable this because it leads to additional complication.
     * For example, a readOnly effect generates a special setter. If a subclass
     * disables the effect, the setter would fail unexpectedly.
     * Based on feedback, we may want to try to make effects more malleable
     * and/or provide an advanced api for manipulating them.
     * Also consider adding warnings when an effect cannot be changed.
     *
     * @param {HTMLElement} proto
     * @param {string} name Name of the property.
     * @param {object} info Info object from which to create property effects.
     * Supported keys:
     * @param {object} allProps Flattened map of all properties defined in this
     *   element (including inherited properties)
     * @private
     */
    function createPropertyFromConfig(proto, name, info, allProps) {
      // computed forces readOnly...
      if (info.computed) {
        info.readOnly = true;
      }
      // Note, since all computed properties are readOnly, this prevents
      // adding additional computed property effects (which leads to a confusing
      // setup where multiple triggers for setting a property)
      // While we do have `hasComputedEffect` this is set on the property's
      // dependencies rather than itself.
      if (info.computed && !proto._hasReadOnlyEffect(name)) {
        proto._createComputedProperty(name, info.computed, allProps);
      }
      if (info.readOnly && !proto._hasReadOnlyEffect(name)) {
        proto._createReadOnlyProperty(name, !info.computed);
      }
      if (info.reflectToAttribute && !proto._hasReflectEffect(name)) {
        proto._createReflectedProperty(name);
      }
      if (info.notify && !proto._hasNotifyEffect(name)) {
        proto._createNotifyingProperty(name);
      }
      // always add observer
      if (info.observer) {
        proto._createPropertyObserver(name, info.observer, allProps[info.observer]);
      }
    }

    /**
     * Configures an element `proto` to function with a given `template`.
     * The element name `is` and extends `ext` must be specified for ShadyCSS
     * style scoping.
     * @param {HTMLElement} proto
     * @param {HTMLTemplateElement} template
     * @param {string} baseURI URL against which to resolve urls in
     * style element cssText.
     * @param {string} is
     * @param {string} ext
     * @private
     */
    function finalizeTemplate(proto, template, baseURI, is, ext) {
      // support `include="module-name"`
      var cssText = Polymer.StyleGather.cssFromTemplate(template, baseURI) + Polymer.StyleGather.cssFromModuleImports(is);
      if (cssText) {
        var style = document.createElement('style');
        style.textContent = cssText;
        template.content.insertBefore(style, template.content.firstChild);
      }
      if (window.ShadyCSS) {
        window.ShadyCSS.prepareTemplate(template, is, ext);
      }
      proto._bindTemplate(template, propertiesForClass(proto.constructor));
    }

    /**
     * @polymerMixinClass
     * @unrestricted
     */

    var PolymerElement = function (_polymerElementBase) {
      _inherits(PolymerElement, _polymerElementBase);

      _createClass(PolymerElement, null, [{
        key: 'finalize',


        /**
         * Called automatically when the first element instance is created to
         * ensure that class finalization work has been completed.
         * May be called by users to eagerly perform class finalization work
         * prior to the creation of the first element instance.
         *
         * Class finalization work generally includes meta-programming such as
         * creating property accessors and any property effect metadata needed for
         * the features used.
         *
         * @public
         */
        value: function finalize() {
          if (!hasClassFinalized(this)) {
            finalizeClassAndSuper(this);
          }
        }

        /**
         * Returns the template stamped into this element's shadow root.
         *
         * If a `static get is()` getter is defined, the default implementation
         * will return the first `<template>` in a `dom-module` whose `id`
         * matches this element's `is`.
         *
         * Users may override this getter to return an arbitrary template
         * (in which case the `is` getter is unnecessary). The template returned
         * may be either an `HTMLTemplateElement` or a string that will be
         * automatically parsed into a template.
         *
         * Note that when subclassing, if the super class overrode the default
         * implementation and the subclass would like to provide an alternate
         * template via a `dom-module`, it should override this getter and
         * return `Polymer.DomModule.import(this.is, 'template')`.
         *
         * If a subclass would like to modify the super class template, it should
         * clone it rather than modify it in place.  If the getter does expensive
         * work such as cloning/modifying a template, it should memoize the
         * template for maximum performance:
         *
         *   let memoizedTemplate;
         *   class MySubClass extends MySuperClass {
         *     static get template() {
         *       if (!memoizedTemplate) {
         *         memoizedTemplate = super.template.cloneNode(true);
         *         let subContent = document.createElement('div');
         *         subContent.textContent = 'This came from MySubClass';
         *         memoizedTemplate.content.appendChild(subContent);
         *       }
         *       return memoizedTemplate;
         *     }
         *   }
         *
         * @returns {HTMLTemplateElement|string}
         */

      }, {
        key: 'observedAttributes',


        /**
         * Standard Custom Elements V1 API.  The default implementation returns
         * a list of dash-cased attributes based on a flattening of all properties
         * declared in `static get properties()` for this element and any
         * superclasses.
         *
         * @return {Array} Observed attribute list
         */
        get: function get() {
          if (!this.hasOwnProperty(goog.reflect.objectProperty('__observedAttributes', this))) {
            var list = [];
            var properties = propertiesForClass(this);
            for (var prop in properties) {
              list.push(Polymer.CaseMap.camelToDashCase(prop));
            }
            this.__observedAttributes = list;
          }
          return this.__observedAttributes;
        }
      }, {
        key: 'template',
        get: function get() {
          if (!this.hasOwnProperty(goog.reflect.objectProperty('_template', this))) {
            this._template = Polymer.DomModule.import(this.is, 'template') ||
            // note: implemented so a subclass can retrieve the super
            // template; call the super impl this way so that `this` points
            // to the superclass.
            Object.getPrototypeOf(this.prototype).constructor.template;
          }
          return this._template;
        }

        /**
         * Path matching the url from which the element was imported.
         * This path is used to resolve url's in template style cssText.
         * The `importPath` property is also set on element instances and can be
         * used to create bindings relative to the import path.
         * Defaults to the path matching the url containing a `dom-module` element
         * matching this element's static `is` property.
         * Note, this path should contain a trailing `/`.
         *
         * @returns {string}
         */

      }, {
        key: 'importPath',
        get: function get() {
          if (!this.hasOwnProperty(goog.reflect.objectProperty('_importPath', this))) {
            var module = Polymer.DomModule.import(this.is);
            this._importPath = module ? module.assetpath : '' || Object.getPrototypeOf(this.prototype).constructor.importPath;
          }
          return this._importPath;
        }
      }]);

      function PolymerElement() {
        _classCallCheck(this, PolymerElement);

        var _this = _possibleConstructorReturn(this, (PolymerElement.__proto__ || Object.getPrototypeOf(PolymerElement)).call(this));

        Polymer.telemetry.instanceCount++;
        // Stamp template
        if (_this._template) {
          _this.root = _this._stampTemplate(_this._template);
        } else {
          _this.root = _this;
        }
        return _this;
      }

      /**
       * Overrides the default `Polymer.PropertyAccessors` to ensure class
       * metaprogramming related to property accessors and effects has
       * completed (calls `finalize`).
       *
       * It also initializes any property defaults provided via `value` in
       * `properties` metadata.
       *
       * @override
       */


      _createClass(PolymerElement, [{
        key: '_initializeProperties',
        value: function _initializeProperties() {
          this.constructor.finalize();
          var importPath = this.constructor.importPath;
          // note: finalize template when we have access to `localName` to
          // avoid dependence on `is` for polyfilling styling.
          if (this._template && !this._template.__polymerFinalized) {
            this._template.__polymerFinalized = true;
            var baseURI = importPath ? Polymer.ResolveUrl.resolveUrl(importPath) : '';
            finalizeTemplate(this.__proto__, this._template, baseURI, this.localName);
          }
          _get(PolymerElement.prototype.__proto__ || Object.getPrototypeOf(PolymerElement.prototype), '_initializeProperties', this).call(this);
          // set path defaults
          this.rootPath = Polymer.rootPath;
          this.importPath = importPath;
          // apply property defaults...
          var p$ = propertyDefaultsForClass(this.constructor);
          if (!p$) {
            return;
          }
          for (var p in p$) {
            var info = p$[p];
            if (!this._isPropertyPending(p)) {
              var value = typeof info.value == 'function' ? info.value.call(this) : info.value;
              if (this._hasPropertyEffect(p)) {
                this._setProperty(p, value);
              } else {
                this[p] = value;
              }
            }
          }
        }

        /**
         * Provides a default implementation of the standard Custom Elements
         * `connectedCallback`.
         *
         * The default implementation enables the property effects system and
         * flushes any pending properties, and updates shimmed CSS properties
         * when using the ShadyCSS scoping/custom properties polyfill.
         *
         * @override
         */

      }, {
        key: 'connectedCallback',
        value: function connectedCallback() {
          if (window.ShadyCSS) {
            window.ShadyCSS.styleElement(this);
          }
          // this._flushProperties();
        }

        /**
         * Provides a default implementation of the standard Custom Elements
         * `disconnectedCallback`.
         *
         * @override
         */

      }, {
        key: 'disconnectedCallback',
        value: function disconnectedCallback() {}

        /**
         * Implements `PropertyEffects`'s `_readyClients` call. Attaches
         * element dom by calling `_attachDom` with the dom stamped from the
         * element's template via `_stampTemplate`. Note that this allows
         * client dom to be attached to the element prior to any observers
         * running.
         *
         * @override
         */

      }, {
        key: '_readyClients',
        value: function _readyClients() {
          _get(PolymerElement.prototype.__proto__ || Object.getPrototypeOf(PolymerElement.prototype), '_readyClients', this).call(this);
          if (this._template) {
            this.root = this._attachDom(this.root);
          }
        }

        /**
         * Attaches an element's stamped dom to itself. By default,
         * this method creates a `shadowRoot` and adds the dom to it.
         * However, this method may be overridden to allow an element
         * to put its dom in another location.
         *
         * @method _attachDom
         * @throws {Error}
         * @suppress {missingReturn}
         * @param {NodeList} dom to attach to the element.
         * @return {Node} node to which the dom has been attached.
         */

      }, {
        key: '_attachDom',
        value: function _attachDom(dom) {
          if (this.attachShadow) {
            if (dom) {
              if (!this.shadowRoot) {
                this.attachShadow({ mode: 'open' });
              }
              this.shadowRoot.appendChild(dom);
              return this.shadowRoot;
            }
          } else {
            throw new Error('ShadowDOM not available. ' +
            // TODO(sorvell): move to compile-time conditional when supported
            'Polymer.Element can create dom as children instead of in ' + 'ShadowDOM by setting `this.root = this;\` before \`ready\`.');
          }
        }

        /**
         * Provides a default implementation of the standard Custom Elements
         * `attributeChangedCallback`.
         *
         * By default, attributes declared in `properties` metadata are
         * deserialized using their `type` information to properties of the
         * same name.  "Dash-cased" attributes are deserialzed to "camelCase"
         * properties.
         *
         * @override
         */

      }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(name, old, value) {
          if (old !== value) {
            var property = caseMap.dashToCamelCase(name);
            var type = propertiesForClass(this.constructor)[property].type;
            if (!this._hasReadOnlyEffect(property)) {
              this._attributeToProperty(name, value, type);
            }
          }
        }

        /**
         * When using the ShadyCSS scoping and custom property shim, causes all
         * shimmed styles in this element (and its subtree) to be updated
         * based on current custom property values.
         *
         * The optional parameter overrides inline custom property styles with an
         * object of properties where the keys are CSS properties, and the values
         * are strings.
         *
         * Example: `this.updateStyles({'--color': 'blue'})`
         *
         * These properties are retained unless a value of `null` is set.
         *
         * @param {Object=} properties Bag of custom property key/values to
         *   apply to this element.
         */

      }, {
        key: 'updateStyles',
        value: function updateStyles(properties) {
          if (window.ShadyCSS) {
            window.ShadyCSS.styleSubtree(this, properties);
          }
        }

        /**
         * Rewrites a given URL relative to a base URL. The base URL defaults to
         * the original location of the document containing the `dom-module` for
         * this element. This method will return the same URL before and after
         * bundling.
         *
         * @param {string} url URL to resolve.
         * @param {string=} base Optional base URL to resolve against, defaults
         * to the element's `importPath`
         * @return {string} Rewritten URL relative to base
         */

      }, {
        key: 'resolveUrl',
        value: function resolveUrl(url, base) {
          if (!base && this.importPath) {
            base = Polymer.ResolveUrl.resolveUrl(this.importPath);
          }
          return Polymer.ResolveUrl.resolveUrl(url, base);
        }
      }]);

      return PolymerElement;
    }(polymerElementBase);

    return PolymerElement;
  });

  /**
   * Provides basic tracking of element definitions (registrations) and
   * instance counts.
   *
   * @namespace
   * @summary Provides basic tracking of element definitions (registrations) and
   * instance counts.
   */
  Polymer.telemetry = {
    /**
     * Total number of Polymer element instances created.
     * @type {number}
     */
    instanceCount: 0,
    /**
     * Array of Polymer element classes that have been finalized.
     * @type {Array<Polymer.Element>}
     */
    registrations: [],
    /**
     * @private
     */
    _regLog: function _regLog(prototype) {
      console.log('[' + prototype.is + ']: registered');
    },
    /**
     * Registers a class prototype for telemetry purposes.
     * @protected
     */
    register: function register(prototype) {
      this.registrations.push(prototype);
      Polymer.log && this._regLog(prototype);
    },
    /**
     * Logs all elements registered with an `is` to the console.
     * @public
     */
    dumpRegistrations: function dumpRegistrations() {
      this.registrations.forEach(this._regLog);
    }
  };

  /**
   * When using the ShadyCSS scoping and custom property shim, causes all
   * shimmed `styles` (via `custom-style`) in the document (and its subtree)
   * to be updated based on current custom property values.
   *
   * The optional parameter overrides inline custom property styles with an
   * object of properties where the keys are CSS properties, and the values
   * are strings.
   *
   * Example: `Polymer.updateStyles({'--color': 'blue'})`
   *
   * These properties are retained unless a value of `null` is set.
   *
   * @param {Object=} properties Bag of custom property key/values to
   *   apply to the document.
   */
  Polymer.updateStyles = function (props) {
    if (window.ShadyCSS) {
      window.ShadyCSS.styleDocument(props);
    }
  };

  /**
   * Globally settable property that is automatically assigned to
   * `Polymer.ElementMixin` instances, useful for binding in templates to
   * make URL's relative to an application's root.  Defaults to the main
   * document URL, but can be overridden by users.  It may be useful to set
   * `Polymer.rootPath` to provide a stable application mount path when
   * using client side routing.
   *
   * @memberof Polymer
   */
  // Polymer.rootPath = Polymer.rootPath || Polymer.ResolveUrl.pathFromUrl(document.baseURI || window.location.href);
})();











(function () {
  'use strict';

  /**
   * Base class that provides the core API for Polymer's meta-programming
   * features including template stamping, data-binding, attribute deserialization,
   * and property change observation.
   *
   * @polymerElement
   * @memberof Polymer
   * @extends HTMLElement
   * @mixes Polymer.ElementMixin
   * @summary Custom element base class that provides the core API for Polymer's
   *   key meta-programming features including template stamping, data-binding,
   *   attribute deserialization, and property change observation
   */

  var Element = Polymer.ElementMixin(HTMLElement);
  Polymer.Element = Element;
})();