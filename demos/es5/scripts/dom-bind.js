var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  'use strict';

  var domBindBase = Polymer.OptionalMutableData(Polymer.PropertyEffects(HTMLElement));

  /**
   * Custom element to allow using Polymer's template features (data binding,
   * declarative event listeners, etc.) in the main document without defining
   * a new custom element.
   *
   * `<template>` tags utilizing bindings may be wrapped with the `<dom-bind>`
   * element, which will immediately stamp the wrapped template into the main
   * document and bind elements to the `dom-bind` element itself as the
   * binding scope.
   *
   * @extends HTMLElement
   * @mixes Polymer.PropertyEffects
   * @memberof Polymer
   * @summary Custom element to allow using Polymer's template features (data
   *   binding, declarative event listeners, etc.) in the main document.
   */

  var DomBind = function (_domBindBase) {
    _inherits(DomBind, _domBindBase);

    function DomBind() {
      _classCallCheck(this, DomBind);

      return _possibleConstructorReturn(this, (DomBind.__proto__ || Object.getPrototypeOf(DomBind)).apply(this, arguments));
    }

    _createClass(DomBind, [{
      key: 'attributeChangedCallback',


      // assumes only one observed attribute
      value: function attributeChangedCallback() {
        this.mutableData = true;
      }
    }, {
      key: 'connectedCallback',
      value: function connectedCallback() {
        this.render();
      }
    }, {
      key: 'disconnectedCallback',
      value: function disconnectedCallback() {
        this.__removeChildren();
      }
    }, {
      key: '__insertChildren',
      value: function __insertChildren() {
        this.parentNode.insertBefore(this.root, this);
      }
    }, {
      key: '__removeChildren',
      value: function __removeChildren() {
        if (this.__children) {
          for (var i = 0; i < this.__children.length; i++) {
            this.root.appendChild(this.__children[i]);
          }
        }
      }

      /**
       * Forces the element to render its content. This is typically only
       * necessary to call if HTMLImports with the async attribute are used.
       */

    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var template = void 0;
        if (!this.__children) {
          template = template || this.querySelector('template');
          if (!template) {
            // Wait until childList changes and template should be there by then
            var observer = new MutationObserver(function () {
              template = _this2.querySelector('template');
              if (template) {
                observer.disconnect();
                _this2.render(template);
              } else {
                throw new Error('dom-bind requires a <template> child');
              }
            });
            observer.observe(this, { childList: true });
            return;
          }
          this._bindTemplate(template);
          this.root = this._stampTemplate(template);
          this.__children = [];
          for (var n = this.root.firstChild; n; n = n.nextSibling) {
            this.__children[this.__children.length] = n;
          }
          this._flushProperties();
        }
        this.__insertChildren();
        this.dispatchEvent(new CustomEvent('dom-change', {
          bubbles: true,
          composed: true
        }));
      }
    }], [{
      key: 'observedAttributes',
      get: function get() {
        return ['mutable-data'];
      }
    }]);

    return DomBind;
  }(domBindBase);

  customElements.define('dom-bind', DomBind);
})();