var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  'use strict';

  /** @typedef {{run: function(function(), number=):number, cancel: function(number)}} */

  var AsyncModule = void 0; // eslint-disable-line no-unused-vars

  var Debouncer = function () {
    function Debouncer() {
      _classCallCheck(this, Debouncer);

      this._asyncModule = null;
      this._callback = null;
      this._timer = null;
    }
    /**
     * Sets the scheduler; that is, a module with the Async interface,
     * a callback and optional arguments to be passed to the run function
     * from the async module.
     *
     * @param {!AsyncModule} asyncModule
     * @param {function()} callback
     */


    _createClass(Debouncer, [{
      key: 'setConfig',
      value: function setConfig(asyncModule, cb) {
        var _this = this;

        this._asyncModule = asyncModule;
        this._callback = cb;
        this._timer = this._asyncModule.run(function () {
          _this._timer = null;
          _this._callback();
        });
      }
      /**
       * Cancels an active debouncer and returns a reference to itself.
       */

    }, {
      key: 'cancel',
      value: function cancel() {
        if (this.isActive()) {
          this._asyncModule.cancel(this._timer);
          this._timer = null;
        }
      }
      /**
       * Flushes an active debouncer and returns a reference to itself.
       */

    }, {
      key: 'flush',
      value: function flush() {
        if (this.isActive()) {
          this.cancel();
          this._callback();
        }
      }
      /**
       * Returns true if the debouncer is active.
       *
       * @return {boolean}
       */

    }, {
      key: 'isActive',
      value: function isActive() {
        return this._timer != null;
      }
      /**
       * Creates a debouncer if no debouncer is passed as a parameter
       * or it cancels an active debouncer otherwise.
       *
       * @param {Polymer.Debouncer?} debouncer
       * @param {!AsyncModule} asyncModule
       * @param {function()} cb
       * @return {!Debouncer}
       */

    }], [{
      key: 'debounce',
      value: function debounce(debouncer, asyncModule, cb) {
        if (debouncer instanceof Debouncer) {
          debouncer.cancel();
        } else {
          debouncer = new Debouncer();
        }
        debouncer.setConfig(asyncModule, cb);
        return debouncer;
      }
    }]);

    return Debouncer;
  }();

  Polymer.Debouncer = Debouncer;
})();