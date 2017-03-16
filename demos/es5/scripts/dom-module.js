var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var modules = {};
  var lcModules = {};
  function findModule(id) {
    return modules[id] || lcModules[id.toLowerCase()];
  }

  function styleOutsideTemplateCheck(inst) {
    if (inst.querySelector('style')) {
      console.warn('dom-module %s has style outside template', inst.id);
    }
  }

  /**
   * The `dom-module` element registers the dom it contains to the name given
   * by the module's id attribute. It provides a unified database of dom
   * accessible via its static `import` API.
   *
   * A key use case of `dom-module` is for providing custom element `<template>`s
   * via HTML imports that are parsed by the native HTML parser, that can be
   * relocated during a bundling pass and still looked up by `id`.
   *
   * Example:
   *
   *     <dom-module id="foo">
   *       <img src="stuff.png">
   *     </dom-module>
   *
   * Then in code in some other location that cannot access the dom-module above
   *
   *     let img = document.createElement('dom-module').import('foo', 'img');
   *
   * @extends HTMLElement
   * @memberof Polymer
   * @summary Custom element that provides a registry of relocatable DOM content
   *   by `id` that is agnostic to bundling.
   */

  var DomModule = function (_HTMLElement) {

    _inherits(DomModule, _HTMLElement);

    function DomModule() {
      _classCallCheck(this, DomModule);

      return _possibleConstructorReturn(this, (DomModule.__proto__ || Object.getPrototypeOf(DomModule)).apply(this, arguments));
    }

    _createClass(DomModule, [{
      key: 'attributeChangedCallback',
      value: function attributeChangedCallback(name, old, value) {
        if (old !== value) {
          this.register();
        }
      }

      /**
       * The absolute URL of the original location of this `dom-module`.
       *
       * This value will differ from this element's `ownerDocument` in the
       * following ways:
       * - Takes into account any `assetpath` attribute added during bundling
       *   to indicate the original location relative to the bundled location
       * - Uses the HTMLImports polyfill's `importForElement` API to ensure
       *   the path is relative to the import document's location since
       *   `ownerDocument` is not currently polyfilled
       */

    }, {
      key: 'register',


      /**
       * Registers the dom-module at a given id. This method should only be called
       * when a dom-module is imperatively created. For
       * example, `document.createElement('dom-module').register('foo')`.
       * @method register
       * @param {string=} id The id at which to register the dom-module.
       */
      value: function register(id) {
        id = id || this.id;
        if (id) {
          this.id = id;
          // store id separate from lowercased id so that
          // in all cases mixedCase id will stored distinctly
          // and lowercase version is a fallback
          modules[id] = this;
          lcModules[id.toLowerCase()] = this;
          styleOutsideTemplateCheck(this);
        }
      }
    }, {
      key: 'assetpath',
      get: function get() {
        // Don't override existing assetpath.
        if (!this.__assetpath) {
          // note: assetpath set via an attribute must be relative to this
          // element's location; accomodate polyfilled HTMLImports
          var owner = window.HTMLImports && HTMLImports.importForElement ? HTMLImports.importForElement(this) || document : this.ownerDocument;
          var url = Polymer.ResolveUrl.resolveUrl(this.getAttribute('assetpath') || '', owner.baseURI);
          this.__assetpath = Polymer.ResolveUrl.pathFromUrl(url);
        }
        return this.__assetpath;
      }
    }], [{
      key: 'import',


      /**
       * Retrieves the dom specified by `selector` in the module specified by
       * `id`. For example, this.import('foo', 'img');
       * @method register
       * @param {string} id
       * @param {string=} selector
       * @return {Element} Returns the dom which matches `selector` in the module
       * at the specified `id`.
       */
      value: function _import(id, selector) {
        if (id) {
          var m = findModule(id);
          if (m && selector) {
            return m.querySelector(selector);
          }
          return m;
        }
        return null;
      }
    }, {
      key: 'observedAttributes',
      get: function get() {
        return ['id'];
      }
    }]);

    return DomModule;
  }(HTMLElement);

  DomModule.prototype['modules'] = modules;

  customElements.define('dom-module', DomModule);

  // export
  Polymer.DomModule = DomModule;
})();