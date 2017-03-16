var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {

  'use strict';

  var gestures = Polymer.Gestures;

  /**
   * Element class mixin that provides API for adding Polymer's cross-platform
   * gesture events to nodes.
   *
   * The API is designed to be compatible with override points implemented
   * in `Polymer.TemplateStamp` such that declarative event listeners in
   * templates will support gesture events when this mixin is applied along with
   * `Polymer.TemplateStamp`.
   *
   * @polymerMixin
   * @memberof Polymer
   * @summary Element class mixin that provides API for adding Polymer's cross-platform
   * gesture events to nodes
   */
  Polymer.GestureEventListeners = Polymer.dedupingMixin(function (superClass) {

    return function (_superClass) {
      _inherits(GestureEventListeners, _superClass);

      function GestureEventListeners() {
        _classCallCheck(this, GestureEventListeners);

        return _possibleConstructorReturn(this, (GestureEventListeners.__proto__ || Object.getPrototypeOf(GestureEventListeners)).apply(this, arguments));
      }

      _createClass(GestureEventListeners, [{
        key: '_addEventListenerToNode',
        value: function _addEventListenerToNode(node, eventName, handler) {
          if (!gestures.addListener(node, eventName, handler) && _get(GestureEventListeners.prototype.__proto__ || Object.getPrototypeOf(GestureEventListeners.prototype), '_addEventListenerToNode', this)) {
            _get(GestureEventListeners.prototype.__proto__ || Object.getPrototypeOf(GestureEventListeners.prototype), '_addEventListenerToNode', this).call(this, node, eventName, handler);
          }
        }
      }, {
        key: '_removeEventListenerFromNode',
        value: function _removeEventListenerFromNode(node, eventName, handler) {
          if (!gestures.removeListener(node, eventName, handler) && _get(GestureEventListeners.prototype.__proto__ || Object.getPrototypeOf(GestureEventListeners.prototype), '_removeEventListenerFromNode', this)) {
            _get(GestureEventListeners.prototype.__proto__ || Object.getPrototypeOf(GestureEventListeners.prototype), '_removeEventListenerFromNode', this).call(this, node, eventName, handler);
          }
        }
      }]);

      return GestureEventListeners;
    }(superClass);
  });
})();