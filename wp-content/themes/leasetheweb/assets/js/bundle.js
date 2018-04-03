(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.1';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
                                  * Stores initialized plugins.
                                  */
    _plugins: {},

    /**
                   * Stores generated unique ids for plugin instances
                   */
    _uuids: [],

    /**
                 * Returns a boolean for RTL support
                 */
    rtl: function rtl() {
      return $('html').attr('dir') === 'rtl';
    },
    /**
        * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
        * @param {Object} plugin - The constructor of the plugin.
        */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
        * @function
        * Populates the _uuids array with pointers to each individual plugin instance.
        * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
        * Also fires the initialization event for each plugin, consolidating repetitive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @param {String} name - the name of the plugin, passed as a camelCased string.
        * @fires Plugin#init
        */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {plugin.$element.attr('data-' + pluginName, plugin.uuid);}
      if (!plugin.$element.data('zfPlugin')) {plugin.$element.data('zfPlugin', plugin);}
      /**
                                                                                          * Fires when the plugin has initialized.
                                                                                          * @event Plugin#init
                                                                                          */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
        * @function
        * Removes the plugins uuid from the _uuids array.
        * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
        * Also fires the destroyed event for the plugin, consolidating repetitive code.
        * @param {Object} plugin - an instance of a plugin, usually `this` in context.
        * @fires Plugin#destroyed
        */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
                                                                               * Fires when the plugin has been destroyed.
                                                                               * @event Plugin#destroyed
                                                                               */.
      trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
        * @function
        * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
        * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
        * @default If no argument is passed, reflow all currently active plugins.
        */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
          _this = this,
          fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            } };

          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
        * returns a random base-36 uid with namespacing
        * @function
        * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
        * @param {String} namespace - name of plugin to be incorporated in uid, optional.
        * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
        * @returns {String} - unique id
        */
    GetYoDigits: function GetYoDigits(length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
        * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
        * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
        * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
        */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
          opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {return el.trim();});
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function transitionend($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend' };

      var elem = document.createElement('div'),
      end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    } };


  Foundation.util = {
    /**
                       * Function for applying a debounce effect to a function call.
                       * @function
                       * @param {Function} func - Function to be called at end of timeout.
                       * @param {Number} delay - Time in ms to delay the call of `func`.
                       * @returns function
                       */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    } };


  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function foundation(method) {
    var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
    $meta = $('meta.foundation-mq'),
    $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {//needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {//an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {//make sure both the class and method exist
        if (this.length === 1) {//if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {//otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {//error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {//error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now)
    window.Date.now = Date.now = function () {return new Date().getTime();};

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] ||
      window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) ||
    !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {callback(lastTime = nextTime);},
        nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
       * Polyfill for performance.now, required by rAF
       */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {return Date.now() - this.start;} };

    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
      fToBind = this,
      fNOP = function fNOP() {},
      fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ?
        this :
        oThis,
        aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else
    if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else
    {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else
    if ('false' === str) return false;else
    if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

}(jQuery);

},{}],2:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * Drilldown module.
                * @module foundation.drilldown
                * @requires foundation.util.keyboard
                * @requires foundation.util.motion
                * @requires foundation.util.nest
                */var

  Drilldown = function () {
    /**
                            * Creates a new instance of a drilldown menu.
                            * @class
                            * @param {jQuery} element - jQuery object to make into an accordion menu.
                            * @param {Object} options - Overrides to the default plugin settings.
                            */
    function Drilldown(element, options) {_classCallCheck(this, Drilldown);
      this.$element = element;
      this.options = $.extend({}, Drilldown.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'drilldown');

      this._init();

      Foundation.registerPlugin(this, 'Drilldown');
      Foundation.Keyboard.register('Drilldown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close',
        'TAB': 'down',
        'SHIFT_TAB': 'up' });

    }

    /**
       * Initializes the drilldown by creating jQuery collections of elements
       * @private
       */_createClass(Drilldown, [{ key: '_init', value: function _init()
      {
        this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent').children('a');
        this.$submenus = this.$submenuAnchors.parent('li').children('[data-submenu]');
        this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'menuitem').find('a');
        this.$element.attr('data-mutate', this.$element.attr('data-drilldown') || Foundation.GetYoDigits(6, 'drilldown'));

        this._prepareMenu();
        this._registerEvents();

        this._keyboardEvents();
      }

      /**
         * prepares drilldown menu by setting attributes to links and elements
         * sets a min height to prevent content jumping
         * wraps the element if not already wrapped
         * @private
         * @function
         */ }, { key: '_prepareMenu', value: function _prepareMenu()
      {
        var _this = this;
        // if(!this.options.holdOpen){
        //   this._menuLinkEvents();
        // }
        this.$submenuAnchors.each(function () {
          var $link = $(this);
          var $sub = $link.parent();
          if (_this.options.parentLink) {
            $link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menu-item"></li>');
          }
          $link.data('savedHref', $link.attr('href')).removeAttr('href').attr('tabindex', 0);
          $link.children('[data-submenu]').
          attr({
            'aria-hidden': true,
            'tabindex': 0,
            'role': 'menu' });

          _this._events($link);
        });
        this.$submenus.each(function () {
          var $menu = $(this),
          $back = $menu.find('.js-drilldown-back');
          if (!$back.length) {
            switch (_this.options.backButtonPosition) {
              case "bottom":
                $menu.append(_this.options.backButton);
                break;
              case "top":
                $menu.prepend(_this.options.backButton);
                break;
              default:
                console.error("Unsupported backButtonPosition value '" + _this.options.backButtonPosition + "'");}

          }
          _this._back($menu);
        });

        this.$submenus.addClass('invisible');
        if (!this.options.autoHeight) {
          this.$submenus.addClass('drilldown-submenu-cover-previous');
        }

        // create a wrapper on element if it doesn't exist.
        if (!this.$element.parent().hasClass('is-drilldown')) {
          this.$wrapper = $(this.options.wrapper).addClass('is-drilldown');
          if (this.options.animateHeight) this.$wrapper.addClass('animate-height');
          this.$element.wrap(this.$wrapper);
        }
        // set wrapper
        this.$wrapper = this.$element.parent();
        this.$wrapper.css(this._getMaxDims());
      } }, { key: '_resize', value: function _resize()

      {
        this.$wrapper.css({ 'max-width': 'none', 'min-height': 'none' });
        // _getMaxDims has side effects (boo) but calling it should update all other necessary heights & widths
        this.$wrapper.css(this._getMaxDims());
      }

      /**
         * Adds event handlers to elements in the menu.
         * @function
         * @private
         * @param {jQuery} $elem - the current menu item to add handlers to.
         */ }, { key: '_events', value: function _events(
      $elem) {
        var _this = this;

        $elem.off('click.zf.drilldown').
        on('click.zf.drilldown', function (e) {
          if ($(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')) {
            e.stopImmediatePropagation();
            e.preventDefault();
          }

          // if(e.target !== e.currentTarget.firstElementChild){
          //   return false;
          // }
          _this._show($elem.parent('li'));

          if (_this.options.closeOnClick) {
            var $body = $('body');
            $body.off('.zf.drilldown').on('click.zf.drilldown', function (e) {
              if (e.target === _this.$element[0] || $.contains(_this.$element[0], e.target)) {return;}
              e.preventDefault();
              _this._hideAll();
              $body.off('.zf.drilldown');
            });
          }
        });
        this.$element.on('mutateme.zf.trigger', this._resize.bind(this));
      }

      /**
         * Adds event handlers to the menu element.
         * @function
         * @private
         */ }, { key: '_registerEvents', value: function _registerEvents()
      {
        if (this.options.scrollTop) {
          this._bindHandler = this._scrollTop.bind(this);
          this.$element.on('open.zf.drilldown hide.zf.drilldown closed.zf.drilldown', this._bindHandler);
        }
      }

      /**
         * Scroll to Top of Element or data-scroll-top-element
         * @function
         * @fires Drilldown#scrollme
         */ }, { key: '_scrollTop', value: function _scrollTop()
      {
        var _this = this;
        var $scrollTopElement = _this.options.scrollTopElement != '' ? $(_this.options.scrollTopElement) : _this.$element,
        scrollPos = parseInt($scrollTopElement.offset().top + _this.options.scrollTopOffset);
        $('html, body').stop(true).animate({ scrollTop: scrollPos }, _this.options.animationDuration, _this.options.animationEasing, function () {
          /**
                                                                                                                                                    * Fires after the menu has scrolled
                                                                                                                                                    * @event Drilldown#scrollme
                                                                                                                                                    */
          if (this === $('html')[0]) _this.$element.trigger('scrollme.zf.drilldown');
        });
      }

      /**
         * Adds keydown event listener to `li`'s in the menu.
         * @private
         */ }, { key: '_keyboardEvents', value: function _keyboardEvents()
      {
        var _this = this;

        this.$menuItems.add(this.$element.find('.js-drilldown-back > a, .is-submenu-parent-item > a')).on('keydown.zf.drilldown', function (e) {
          var $element = $(this),
          $elements = $element.parent('li').parent('ul').children('li').children('a'),
          $prevElement,
          $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              return;
            }
          });

          Foundation.Keyboard.handleKey(e, 'Drilldown', {
            next: function next() {
              if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            previous: function previous() {
              _this._hide($element.parent('li').parent('ul'));
              $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                setTimeout(function () {
                  $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                }, 1);
              });
              return true;
            },
            up: function up() {
              $prevElement.focus();
              // Don't tap focus on first element in root ul
              return !$element.is(_this.$element.find('> li:first-child > a'));
            },
            down: function down() {
              $nextElement.focus();
              // Don't tap focus on last element in root ul
              return !$element.is(_this.$element.find('> li:last-child > a'));
            },
            close: function close() {
              // Don't close on element in root ul
              if (!$element.is(_this.$element.find('> li > a'))) {
                _this._hide($element.parent().parent());
                $element.parent().parent().siblings('a').focus();
              }
            },
            open: function open() {
              if (!$element.is(_this.$menuItems)) {// not menu item means back button
                _this._hide($element.parent('li').parent('ul'));
                $element.parent('li').parent('ul').one(Foundation.transitionend($element), function () {
                  setTimeout(function () {
                    $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                  }, 1);
                });
                return true;
              } else if ($element.is(_this.$submenuAnchors)) {
                _this._show($element.parent('li'));
                $element.parent('li').one(Foundation.transitionend($element), function () {
                  $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
                });
                return true;
              }
            },
            handled: function handled(preventDefault) {
              if (preventDefault) {
                e.preventDefault();
              }
              e.stopImmediatePropagation();
            } });

        }); // end keyboardAccess
      }

      /**
         * Closes all open elements, and returns to root menu.
         * @function
         * @fires Drilldown#closed
         */ }, { key: '_hideAll', value: function _hideAll()
      {
        var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
        $elem.one(Foundation.transitionend($elem), function (e) {
          $elem.removeClass('is-active is-closing');
        });
        /**
             * Fires when the menu is fully closed.
             * @event Drilldown#closed
             */
        this.$element.trigger('closed.zf.drilldown');
      }

      /**
         * Adds event listener for each `back` button, and closes open menus.
         * @function
         * @fires Drilldown#back
         * @param {jQuery} $elem - the current sub-menu to add `back` event.
         */ }, { key: '_back', value: function _back(
      $elem) {
        var _this = this;
        $elem.off('click.zf.drilldown');
        $elem.children('.js-drilldown-back').
        on('click.zf.drilldown', function (e) {
          e.stopImmediatePropagation();
          // console.log('mouseup on back');
          _this._hide($elem);

          // If there is a parent submenu, call show
          var parentSubMenu = $elem.parent('li').parent('ul').parent('li');
          if (parentSubMenu.length) {
            _this._show(parentSubMenu);
          }
        });
      }

      /**
         * Adds event listener to menu items w/o submenus to close open menus on click.
         * @function
         * @private
         */ }, { key: '_menuLinkEvents', value: function _menuLinkEvents()
      {
        var _this = this;
        this.$menuItems.not('.is-drilldown-submenu-parent').
        off('click.zf.drilldown').
        on('click.zf.drilldown', function (e) {
          // e.stopImmediatePropagation();
          setTimeout(function () {
            _this._hideAll();
          }, 0);
        });
      }

      /**
         * Opens a submenu.
         * @function
         * @fires Drilldown#open
         * @param {jQuery} $elem - the current element with a submenu to open, i.e. the `li` tag.
         */ }, { key: '_show', value: function _show(
      $elem) {
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.children('[data-submenu]').data('calcHeight') });
        $elem.attr('aria-expanded', true);
        $elem.children('[data-submenu]').addClass('is-active').removeClass('invisible').attr('aria-hidden', false);
        /**
                                                                                                                     * Fires when the submenu has opened.
                                                                                                                     * @event Drilldown#open
                                                                                                                     */
        this.$element.trigger('open.zf.drilldown', [$elem]);
      } }, { key: '_hide',

      /**
                            * Hides a submenu
                            * @function
                            * @fires Drilldown#hide
                            * @param {jQuery} $elem - the current sub-menu to hide, i.e. the `ul` tag.
                            */value: function _hide(
      $elem) {
        if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') });
        var _this = this;
        $elem.parent('li').attr('aria-expanded', false);
        $elem.attr('aria-hidden', true).addClass('is-closing');
        $elem.addClass('is-closing').
        one(Foundation.transitionend($elem), function () {
          $elem.removeClass('is-active is-closing');
          $elem.blur().addClass('invisible');
        });
        /**
             * Fires when the submenu has closed.
             * @event Drilldown#hide
             */
        $elem.trigger('hide.zf.drilldown', [$elem]);
      }

      /**
         * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
         * Prevents content jumping.
         * @function
         * @private
         */ }, { key: '_getMaxDims', value: function _getMaxDims()
      {
        var maxHeight = 0,result = {},_this = this;
        this.$submenus.add(this.$element).each(function () {
          var numOfElems = $(this).children('li').length;
          var height = Foundation.Box.GetDimensions(this).height;
          maxHeight = height > maxHeight ? height : maxHeight;
          if (_this.options.autoHeight) {
            $(this).data('calcHeight', height);
            if (!$(this).hasClass('is-drilldown-submenu')) result['height'] = height;
          }
        });

        if (!this.options.autoHeight) result['min-height'] = maxHeight + 'px';

        result['max-width'] = this.$element[0].getBoundingClientRect().width + 'px';

        return result;
      }

      /**
         * Destroys the Drilldown Menu
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        if (this.options.scrollTop) this.$element.off('.zf.drilldown', this._bindHandler);
        this._hideAll();
        this.$element.off('mutateme.zf.trigger');
        Foundation.Nest.Burn(this.$element, 'drilldown');
        this.$element.unwrap().
        find('.js-drilldown-back, .is-submenu-parent-item').remove().
        end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').
        end().find('[data-submenu]').removeAttr('aria-hidden tabindex role');
        this.$submenuAnchors.each(function () {
          $(this).off('.zf.drilldown');
        });

        this.$submenus.removeClass('drilldown-submenu-cover-previous');

        this.$element.find('a').each(function () {
          var $link = $(this);
          $link.removeAttr('tabindex');
          if ($link.data('savedHref')) {
            $link.attr('href', $link.data('savedHref')).removeData('savedHref');
          } else {return;}
        });
        Foundation.unregisterPlugin(this);
      } }]);return Drilldown;}();


  Drilldown.defaults = {
    /**
                          * Markup used for JS generated back button. Prepended  or appended (see backButtonPosition) to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
                          * @option
                          * @type {string}
                          * @default '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>'
                          */
    backButton: '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>',
    /**
                                                                                * Position the back button either at the top or bottom of drilldown submenus. Can be `'left'` or `'bottom'`.
                                                                                * @option
                                                                                * @type {string}
                                                                                * @default top
                                                                                */
    backButtonPosition: 'top',
    /**
                                * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
                                * @option
                                * @type {string}
                                * @default '<div></div>'
                                */
    wrapper: '<div></div>',
    /**
                             * Adds the parent link to the submenu.
                             * @option
                             * @type {boolean}
                             * @default false
                             */
    parentLink: false,
    /**
                        * Allow the menu to return to root list on body click.
                        * @option
                        * @type {boolean}
                        * @default false
                        */
    closeOnClick: false,
    /**
                          * Allow the menu to auto adjust height.
                          * @option
                          * @type {boolean}
                          * @default false
                          */
    autoHeight: false,
    /**
                        * Animate the auto adjust height.
                        * @option
                        * @type {boolean}
                        * @default false
                        */
    animateHeight: false,
    /**
                           * Scroll to the top of the menu after opening a submenu or navigating back using the menu back button
                           * @option
                           * @type {boolean}
                           * @default false
                           */
    scrollTop: false,
    /**
                       * String jquery selector (for example 'body') of element to take offset().top from, if empty string the drilldown menu offset().top is taken
                       * @option
                       * @type {string}
                       * @default ''
                       */
    scrollTopElement: '',
    /**
                           * ScrollTop offset
                           * @option
                           * @type {number}
                           * @default 0
                           */
    scrollTopOffset: 0,
    /**
                         * Scroll animation duration
                         * @option
                         * @type {number}
                         * @default 500
                         */
    animationDuration: 500,
    /**
                             * Scroll animation easing. Can be `'swing'` or `'linear'`.
                             * @option
                             * @type {string}
                             * @see {@link https://api.jquery.com/animate|JQuery animate}
                             * @default 'swing'
                             */
    animationEasing: 'swing'
    // holdOpen: false
  };

  // Window exports
  Foundation.plugin(Drilldown, 'Drilldown');

}(jQuery);

},{}],3:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * DropdownMenu module.
                * @module foundation.dropdown-menu
                * @requires foundation.util.keyboard
                * @requires foundation.util.box
                * @requires foundation.util.nest
                */var

  DropdownMenu = function () {
    /**
                               * Creates a new instance of DropdownMenu.
                               * @class
                               * @fires DropdownMenu#init
                               * @param {jQuery} element - jQuery object to make into a dropdown menu.
                               * @param {Object} options - Overrides to the default plugin settings.
                               */
    function DropdownMenu(element, options) {_classCallCheck(this, DropdownMenu);
      this.$element = element;
      this.options = $.extend({}, DropdownMenu.defaults, this.$element.data(), options);

      Foundation.Nest.Feather(this.$element, 'dropdown');
      this._init();

      Foundation.registerPlugin(this, 'DropdownMenu');
      Foundation.Keyboard.register('DropdownMenu', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close' });

    }

    /**
       * Initializes the plugin, and calls _prepareMenu
       * @private
       * @function
       */_createClass(DropdownMenu, [{ key: '_init', value: function _init()
      {
        var subs = this.$element.find('li.is-dropdown-submenu-parent');
        this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

        this.$menuItems = this.$element.find('[role="menuitem"]');
        this.$tabs = this.$element.children('[role="menuitem"]');
        this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

        if (this.$element.hasClass(this.options.rightClass) || this.options.alignment === 'right' || Foundation.rtl() || this.$element.parents('.top-bar-right').is('*')) {
          this.options.alignment = 'right';
          subs.addClass('opens-left');
        } else {
          subs.addClass('opens-right');
        }
        this.changed = false;
        this._events();
      } }, { key: '_isVertical', value: function _isVertical()

      {
        return this.$tabs.css('display') === 'block';
      }

      /**
         * Adds event listeners to elements within the menu
         * @private
         * @function
         */ }, { key: '_events', value: function _events()
      {
        var _this = this,
        hasTouch = 'ontouchstart' in window || typeof window.ontouchstart !== 'undefined',
        parClass = 'is-dropdown-submenu-parent';

        // used for onClick and in the keyboard handlers
        var handleClickFn = function handleClickFn(e) {
          var $elem = $(e.target).parentsUntil('ul', '.' + parClass),
          hasSub = $elem.hasClass(parClass),
          hasClicked = $elem.attr('data-is-click') === 'true',
          $sub = $elem.children('.is-dropdown-submenu');

          if (hasSub) {
            if (hasClicked) {
              if (!_this.options.closeOnClick || !_this.options.clickOpen && !hasTouch || _this.options.forceFollow && hasTouch) {return;} else
              {
                e.stopImmediatePropagation();
                e.preventDefault();
                _this._hide($elem);
              }
            } else {
              e.preventDefault();
              e.stopImmediatePropagation();
              _this._show($sub);
              $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
            }
          }
        };

        if (this.options.clickOpen || hasTouch) {
          this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', handleClickFn);
        }

        // Handle Leaf element Clicks
        if (_this.options.closeOnClickInside) {
          this.$menuItems.on('click.zf.dropdownmenu', function (e) {
            var $elem = $(this),
            hasSub = $elem.hasClass(parClass);
            if (!hasSub) {
              _this._hide();
            }
          });
        }

        if (!this.options.disableHover) {
          this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e) {
            var $elem = $(this),
            hasSub = $elem.hasClass(parClass);

            if (hasSub) {
              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._show($elem.children('.is-dropdown-submenu'));
              }, _this.options.hoverDelay));
            }
          }).on('mouseleave.zf.dropdownmenu', function (e) {
            var $elem = $(this),
            hasSub = $elem.hasClass(parClass);
            if (hasSub && _this.options.autoclose) {
              if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) {return false;}

              clearTimeout($elem.data('_delay'));
              $elem.data('_delay', setTimeout(function () {
                _this._hide($elem);
              }, _this.options.closingTime));
            }
          });
        }
        this.$menuItems.on('keydown.zf.dropdownmenu', function (e) {
          var $element = $(e.target).parentsUntil('ul', '[role="menuitem"]'),
          isTab = _this.$tabs.index($element) > -1,
          $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
          $prevElement,
          $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              $prevElement = $elements.eq(i - 1);
              $nextElement = $elements.eq(i + 1);
              return;
            }
          });

          var nextSibling = function nextSibling() {
            if (!$element.is(':last-child')) {
              $nextElement.children('a:first').focus();
              e.preventDefault();
            }
          },prevSibling = function prevSibling() {
            $prevElement.children('a:first').focus();
            e.preventDefault();
          },openSub = function openSub() {
            var $sub = $element.children('ul.is-dropdown-submenu');
            if ($sub.length) {
              _this._show($sub);
              $element.find('li > a:first').focus();
              e.preventDefault();
            } else {return;}
          },closeSub = function closeSub() {
            //if ($element.is(':first-child')) {
            var close = $element.parent('ul').parent('li');
            close.children('a:first').focus();
            _this._hide(close);
            e.preventDefault();
            //}
          };
          var functions = {
            open: openSub,
            close: function close() {
              _this._hide(_this.$element);
              _this.$menuItems.find('a:first').focus(); // focus to first element
              e.preventDefault();
            },
            handled: function handled() {
              e.stopImmediatePropagation();
            } };


          if (isTab) {
            if (_this._isVertical()) {// vertical menu
              if (Foundation.rtl()) {// right aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: closeSub,
                  previous: openSub });

              } else {// left aligned
                $.extend(functions, {
                  down: nextSibling,
                  up: prevSibling,
                  next: openSub,
                  previous: closeSub });

              }
            } else {// horizontal menu
              if (Foundation.rtl()) {// right aligned
                $.extend(functions, {
                  next: prevSibling,
                  previous: nextSibling,
                  down: openSub,
                  up: closeSub });

              } else {// left aligned
                $.extend(functions, {
                  next: nextSibling,
                  previous: prevSibling,
                  down: openSub,
                  up: closeSub });

              }
            }
          } else {// not tabs -> one sub
            if (Foundation.rtl()) {// right aligned
              $.extend(functions, {
                next: closeSub,
                previous: openSub,
                down: nextSibling,
                up: prevSibling });

            } else {// left aligned
              $.extend(functions, {
                next: openSub,
                previous: closeSub,
                down: nextSibling,
                up: prevSibling });

            }
          }
          Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);

        });
      }

      /**
         * Adds an event handler to the body to close any dropdowns on a click.
         * @function
         * @private
         */ }, { key: '_addBodyHandler', value: function _addBodyHandler()
      {
        var $body = $(document.body),
        _this = this;
        $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').
        on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
          var $link = _this.$element.find(e.target);
          if ($link.length) {return;}

          _this._hide();
          $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
        });
      }

      /**
         * Opens a dropdown pane, and checks for collisions first.
         * @param {jQuery} $sub - ul element that is a submenu to show
         * @function
         * @private
         * @fires DropdownMenu#show
         */ }, { key: '_show', value: function _show(
      $sub) {
        var idx = this.$tabs.index(this.$tabs.filter(function (i, el) {
          return $(el).find($sub).length > 0;
        }));
        var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
        this._hide($sibs, idx);
        $sub.css('visibility', 'hidden').addClass('js-dropdown-active').
        parent('li.is-dropdown-submenu-parent').addClass('is-active');
        var clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
        if (!clear) {
          var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
          $parentLi = $sub.parent('.is-dropdown-submenu-parent');
          $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
          clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
          if (!clear) {
            $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
          }
          this.changed = true;
        }
        $sub.css('visibility', '');
        if (this.options.closeOnClick) {this._addBodyHandler();}
        /**
                                                                  * Fires when the new dropdown pane is visible.
                                                                  * @event DropdownMenu#show
                                                                  */
        this.$element.trigger('show.zf.dropdownmenu', [$sub]);
      }

      /**
         * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
         * @function
         * @param {jQuery} $elem - element with a submenu to hide
         * @param {Number} idx - index of the $tabs collection to hide
         * @private
         */ }, { key: '_hide', value: function _hide(
      $elem, idx) {
        var $toClose;
        if ($elem && $elem.length) {
          $toClose = $elem;
        } else if (idx !== undefined) {
          $toClose = this.$tabs.not(function (i, el) {
            return i === idx;
          });
        } else
        {
          $toClose = this.$element;
        }
        var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

        if (somethingToClose) {
          $toClose.find('li.is-active').add($toClose).attr({
            'data-is-click': false }).
          removeClass('is-active');

          $toClose.find('ul.js-dropdown-active').removeClass('js-dropdown-active');

          if (this.changed || $toClose.find('opens-inner').length) {
            var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
            $toClose.find('li.is-dropdown-submenu-parent').add($toClose).
            removeClass('opens-inner opens-' + this.options.alignment).
            addClass('opens-' + oldClass);
            this.changed = false;
          }
          /**
             * Fires when the open menus are closed.
             * @event DropdownMenu#hide
             */
          this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
        }
      }

      /**
         * Destroys the plugin.
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').
        removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
        $(document.body).off('.zf.dropdownmenu');
        Foundation.Nest.Burn(this.$element, 'dropdown');
        Foundation.unregisterPlugin(this);
      } }]);return DropdownMenu;}();


  /**
                                      * Default settings for plugin
                                      */
  DropdownMenu.defaults = {
    /**
                             * Disallows hover events from opening submenus
                             * @option
                             * @type {boolean}
                             * @default false
                             */
    disableHover: false,
    /**
                          * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
                          * @option
                          * @type {boolean}
                          * @default true
                          */
    autoclose: true,
    /**
                      * Amount of time to delay opening a submenu on hover event.
                      * @option
                      * @type {number}
                      * @default 50
                      */
    hoverDelay: 50,
    /**
                     * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
                     * @option
                     * @type {boolean}
                     * @default false
                     */
    clickOpen: false,
    /**
                       * Amount of time to delay closing a submenu on a mouseleave event.
                       * @option
                       * @type {number}
                       * @default 500
                       */

    closingTime: 500,
    /**
                       * Position of the menu relative to what direction the submenus should open. Handled by JS. Can be `'left'` or `'right'`.
                       * @option
                       * @type {string}
                       * @default 'left'
                       */
    alignment: 'left',
    /**
                        * Allow clicks on the body to close any open submenus.
                        * @option
                        * @type {boolean}
                        * @default true
                        */
    closeOnClick: true,
    /**
                         * Allow clicks on leaf anchor links to close any open submenus.
                         * @option
                         * @type {boolean}
                         * @default true
                         */
    closeOnClickInside: true,
    /**
                               * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
                               * @option
                               * @type {string}
                               * @default 'vertical'
                               */
    verticalClass: 'vertical',
    /**
                                * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
                                * @option
                                * @type {string}
                                * @default 'align-right'
                                */
    rightClass: 'align-right',
    /**
                                * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
                                * @option
                                * @type {boolean}
                                * @default true
                                */
    forceFollow: true };


  // Window exports
  Foundation.plugin(DropdownMenu, 'DropdownMenu');

}(jQuery);

},{}],4:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * OffCanvas module.
                * @module foundation.offcanvas
                * @requires foundation.util.keyboard
                * @requires foundation.util.mediaQuery
                * @requires foundation.util.triggers
                * @requires foundation.util.motion
                */var

  OffCanvas = function () {
    /**
                            * Creates a new instance of an off-canvas wrapper.
                            * @class
                            * @fires OffCanvas#init
                            * @param {Object} element - jQuery object to initialize.
                            * @param {Object} options - Overrides to the default plugin settings.
                            */
    function OffCanvas(element, options) {_classCallCheck(this, OffCanvas);
      this.$element = element;
      this.options = $.extend({}, OffCanvas.defaults, this.$element.data(), options);
      this.$lastTrigger = $();
      this.$triggers = $();

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'OffCanvas');
      Foundation.Keyboard.register('OffCanvas', {
        'ESCAPE': 'close' });


    }

    /**
       * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
       * @function
       * @private
       */_createClass(OffCanvas, [{ key: '_init', value: function _init()
      {
        var id = this.$element.attr('id');

        this.$element.attr('aria-hidden', 'true');

        this.$element.addClass('is-transition-' + this.options.transition);

        // Find triggers that affect this element and add aria-expanded to them
        this.$triggers = $(document).
        find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').
        attr('aria-expanded', 'false').
        attr('aria-controls', id);

        // Add an overlay over the content if necessary
        if (this.options.contentOverlay === true) {
          var overlay = document.createElement('div');
          var overlayPosition = $(this.$element).css("position") === 'fixed' ? 'is-overlay-fixed' : 'is-overlay-absolute';
          overlay.setAttribute('class', 'js-off-canvas-overlay ' + overlayPosition);
          this.$overlay = $(overlay);
          if (overlayPosition === 'is-overlay-fixed') {
            $('body').append(this.$overlay);
          } else {
            this.$element.siblings('[data-off-canvas-content]').append(this.$overlay);
          }
        }

        this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

        if (this.options.isRevealed === true) {
          this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
          this._setMQChecker();
        }
        if (!this.options.transitionTime === true) {
          this.options.transitionTime = parseFloat(window.getComputedStyle($('[data-off-canvas]')[0]).transitionDuration) * 1000;
        }
      }

      /**
         * Adds event handlers to the off-canvas wrapper and the exit overlay.
         * @function
         * @private
         */ }, { key: '_events', value: function _events()
      {
        this.$element.off('.zf.trigger .zf.offcanvas').on({
          'open.zf.trigger': this.open.bind(this),
          'close.zf.trigger': this.close.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this),
          'keydown.zf.offcanvas': this._handleKeyboard.bind(this) });


        if (this.options.closeOnClick === true) {
          var $target = this.options.contentOverlay ? this.$overlay : $('[data-off-canvas-content]');
          $target.on({ 'click.zf.offcanvas': this.close.bind(this) });
        }
      }

      /**
         * Applies event listener for elements that will reveal at certain breakpoints.
         * @private
         */ }, { key: '_setMQChecker', value: function _setMQChecker()
      {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          } else {
            _this.reveal(false);
          }
        }).one('load.zf.offcanvas', function () {
          if (Foundation.MediaQuery.atLeast(_this.options.revealOn)) {
            _this.reveal(true);
          }
        });
      }

      /**
         * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
         * @param {Boolean} isRevealed - true if element should be revealed.
         * @function
         */ }, { key: 'reveal', value: function reveal(
      isRevealed) {
        var $closer = this.$element.find('[data-close]');
        if (isRevealed) {
          this.close();
          this.isRevealed = true;
          this.$element.attr('aria-hidden', 'false');
          this.$element.off('open.zf.trigger toggle.zf.trigger');
          if ($closer.length) {$closer.hide();}
        } else {
          this.isRevealed = false;
          this.$element.attr('aria-hidden', 'true');
          this.$element.on({
            'open.zf.trigger': this.open.bind(this),
            'toggle.zf.trigger': this.toggle.bind(this) });

          if ($closer.length) {
            $closer.show();
          }
        }
      }

      /**
         * Stops scrolling of the body when offcanvas is open on mobile Safari and other troublesome browsers.
         * @private
         */ }, { key: '_stopScrolling', value: function _stopScrolling(
      event) {
        return false;
      }

      // Taken and adapted from http://stackoverflow.com/questions/16889447/prevent-full-page-scrolling-ios
      // Only really works for y, not sure how to extend to x or if we need to.
    }, { key: '_recordScrollable', value: function _recordScrollable(event) {
        var elem = this; // called from event handler context with this as elem

        // If the element is scrollable (content overflows), then...
        if (elem.scrollHeight !== elem.clientHeight) {
          // If we're at the top, scroll down one pixel to allow scrolling up
          if (elem.scrollTop === 0) {
            elem.scrollTop = 1;
          }
          // If we're at the bottom, scroll up one pixel to allow scrolling down
          if (elem.scrollTop === elem.scrollHeight - elem.clientHeight) {
            elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1;
          }
        }
        elem.allowUp = elem.scrollTop > 0;
        elem.allowDown = elem.scrollTop < elem.scrollHeight - elem.clientHeight;
        elem.lastY = event.originalEvent.pageY;
      } }, { key: '_stopScrollPropagation', value: function _stopScrollPropagation(

      event) {
        var elem = this; // called from event handler context with this as elem
        var up = event.pageY < elem.lastY;
        var down = !up;
        elem.lastY = event.pageY;

        if (up && elem.allowUp || down && elem.allowDown) {
          event.stopPropagation();
        } else {
          event.preventDefault();
        }
      }

      /**
         * Opens the off-canvas menu.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         * @fires OffCanvas#opened
         */ }, { key: 'open', value: function open(
      event, trigger) {
        if (this.$element.hasClass('is-open') || this.isRevealed) {return;}
        var _this = this;

        if (trigger) {
          this.$lastTrigger = trigger;
        }

        if (this.options.forceTo === 'top') {
          window.scrollTo(0, 0);
        } else if (this.options.forceTo === 'bottom') {
          window.scrollTo(0, document.body.scrollHeight);
        }

        /**
           * Fires when the off-canvas menu opens.
           * @event OffCanvas#opened
           */
        _this.$element.addClass('is-open');

        this.$triggers.attr('aria-expanded', 'true');
        this.$element.attr('aria-hidden', 'false').
        trigger('opened.zf.offcanvas');

        // If `contentScroll` is set to false, add class and disable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').addClass('is-off-canvas-open').on('touchmove', this._stopScrolling);
          this.$element.on('touchstart', this._recordScrollable);
          this.$element.on('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.addClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.addClass('is-closable');
        }

        if (this.options.autoFocus === true) {
          this.$element.one(Foundation.transitionend(this.$element), function () {
            _this.$element.find('a, button').eq(0).focus();
          });
        }

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').attr('tabindex', '-1');
          Foundation.Keyboard.trapFocus(this.$element);
        }
      }

      /**
         * Closes the off-canvas menu.
         * @function
         * @param {Function} cb - optional cb to fire after closure.
         * @fires OffCanvas#closed
         */ }, { key: 'close', value: function close(
      cb) {
        if (!this.$element.hasClass('is-open') || this.isRevealed) {return;}

        var _this = this;

        _this.$element.removeClass('is-open');

        this.$element.attr('aria-hidden', 'true')
        /**
                                                   * Fires when the off-canvas menu opens.
                                                   * @event OffCanvas#closed
                                                   */.
        trigger('closed.zf.offcanvas');

        // If `contentScroll` is set to false, remove class and re-enable scrolling on touch devices.
        if (this.options.contentScroll === false) {
          $('body').removeClass('is-off-canvas-open').off('touchmove', this._stopScrolling);
          this.$element.off('touchstart', this._recordScrollable);
          this.$element.off('touchmove', this._stopScrollPropagation);
        }

        if (this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-visible');
        }

        if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
          this.$overlay.removeClass('is-closable');
        }

        this.$triggers.attr('aria-expanded', 'false');

        if (this.options.trapFocus === true) {
          this.$element.siblings('[data-off-canvas-content]').removeAttr('tabindex');
          Foundation.Keyboard.releaseFocus(this.$element);
        }
      }

      /**
         * Toggles the off-canvas menu open or closed.
         * @function
         * @param {Object} event - Event object passed from listener.
         * @param {jQuery} trigger - element that triggered the off-canvas to open.
         */ }, { key: 'toggle', value: function toggle(
      event, trigger) {
        if (this.$element.hasClass('is-open')) {
          this.close(event, trigger);
        } else
        {
          this.open(event, trigger);
        }
      }

      /**
         * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
         * @function
         * @private
         */ }, { key: '_handleKeyboard', value: function _handleKeyboard(
      e) {var _this2 = this;
        Foundation.Keyboard.handleKey(e, 'OffCanvas', {
          close: function close() {
            _this2.close();
            _this2.$lastTrigger.focus();
            return true;
          },
          handled: function handled() {
            e.stopPropagation();
            e.preventDefault();
          } });

      }

      /**
         * Destroys the offcanvas plugin.
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        this.close();
        this.$element.off('.zf.trigger .zf.offcanvas');
        this.$overlay.off('.zf.offcanvas');

        Foundation.unregisterPlugin(this);
      } }]);return OffCanvas;}();


  OffCanvas.defaults = {
    /**
                          * Allow the user to click outside of the menu to close it.
                          * @option
                          * @type {boolean}
                          * @default true
                          */
    closeOnClick: true,

    /**
                         * Adds an overlay on top of `[data-off-canvas-content]`.
                         * @option
                         * @type {boolean}
                         * @default true
                         */
    contentOverlay: true,

    /**
                           * Enable/disable scrolling of the main content when an off canvas panel is open.
                           * @option
                           * @type {boolean}
                           * @default true
                           */
    contentScroll: true,

    /**
                          * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
                          * @option
                          * @type {number}
                          * @default 0
                          */
    transitionTime: 0,

    /**
                        * Type of transition for the offcanvas menu. Options are 'push', 'detached' or 'slide'.
                        * @option
                        * @type {string}
                        * @default push
                        */
    transition: 'push',

    /**
                         * Force the page to scroll to top or bottom on open.
                         * @option
                         * @type {?string}
                         * @default null
                         */
    forceTo: null,

    /**
                    * Allow the offcanvas to remain open for certain breakpoints.
                    * @option
                    * @type {boolean}
                    * @default false
                    */
    isRevealed: false,

    /**
                        * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
                        * @option
                        * @type {?string}
                        * @default null
                        */
    revealOn: null,

    /**
                     * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
                     * @option
                     * @type {boolean}
                     * @default true
                     */
    autoFocus: true,

    /**
                      * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
                      * @option
                      * @type {string}
                      * @default reveal-for-
                      * @todo improve the regex testing for this.
                      */
    revealClass: 'reveal-for-',

    /**
                                 * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
                                 * @option
                                 * @type {boolean}
                                 * @default false
                                 */
    trapFocus: false


    // Window exports
  };Foundation.plugin(OffCanvas, 'OffCanvas');

}(jQuery);

},{}],5:[function(require,module,exports){
'use strict';var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}

!function ($) {

  /**
                * ResponsiveMenu module.
                * @module foundation.responsiveMenu
                * @requires foundation.util.triggers
                * @requires foundation.util.mediaQuery
                */var

  ResponsiveMenu = function () {
    /**
                                 * Creates a new instance of a responsive menu.
                                 * @class
                                 * @fires ResponsiveMenu#init
                                 * @param {jQuery} element - jQuery object to make into a dropdown menu.
                                 * @param {Object} options - Overrides to the default plugin settings.
                                 */
    function ResponsiveMenu(element, options) {_classCallCheck(this, ResponsiveMenu);
      this.$element = $(element);
      this.rules = this.$element.data('responsive-menu');
      this.currentMq = null;
      this.currentPlugin = null;

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'ResponsiveMenu');
    }

    /**
       * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
       * @function
       * @private
       */_createClass(ResponsiveMenu, [{ key: '_init', value: function _init()
      {
        // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
        if (typeof this.rules === 'string') {
          var rulesTree = {};

          // Parse rules from "classes" pulled from data attribute
          var rules = this.rules.split(' ');

          // Iterate through every rule found
          for (var i = 0; i < rules.length; i++) {
            var rule = rules[i].split('-');
            var ruleSize = rule.length > 1 ? rule[0] : 'small';
            var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

            if (MenuPlugins[rulePlugin] !== null) {
              rulesTree[ruleSize] = MenuPlugins[rulePlugin];
            }
          }

          this.rules = rulesTree;
        }

        if (!$.isEmptyObject(this.rules)) {
          this._checkMediaQueries();
        }
        // Add data-mutate since children may need it.
        this.$element.attr('data-mutate', this.$element.attr('data-mutate') || Foundation.GetYoDigits(6, 'responsive-menu'));
      }

      /**
         * Initializes events for the Menu.
         * @function
         * @private
         */ }, { key: '_events', value: function _events()
      {
        var _this = this;

        $(window).on('changed.zf.mediaquery', function () {
          _this._checkMediaQueries();
        });
        // $(window).on('resize.zf.ResponsiveMenu', function() {
        //   _this._checkMediaQueries();
        // });
      }

      /**
         * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
         * @function
         * @private
         */ }, { key: '_checkMediaQueries', value: function _checkMediaQueries()
      {
        var matchedMq,_this = this;
        // Iterate through each rule and find the last matching rule
        $.each(this.rules, function (key) {
          if (Foundation.MediaQuery.atLeast(key)) {
            matchedMq = key;
          }
        });

        // No match? No dice
        if (!matchedMq) return;

        // Plugin already initialized? We good
        if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

        // Remove existing plugin-specific CSS classes
        $.each(MenuPlugins, function (key, value) {
          _this.$element.removeClass(value.cssClass);
        });

        // Add the CSS class for the new plugin
        this.$element.addClass(this.rules[matchedMq].cssClass);

        // Create an instance of the new plugin
        if (this.currentPlugin) this.currentPlugin.destroy();
        this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {});
      }

      /**
         * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
         * @function
         */ }, { key: 'destroy', value: function destroy()
      {
        this.currentPlugin.destroy();
        $(window).off('.zf.ResponsiveMenu');
        Foundation.unregisterPlugin(this);
      } }]);return ResponsiveMenu;}();


  ResponsiveMenu.defaults = {};

  // The plugin matches the plugin classes with these plugin instances.
  var MenuPlugins = {
    dropdown: {
      cssClass: 'dropdown',
      plugin: Foundation._plugins['dropdown-menu'] || null },

    drilldown: {
      cssClass: 'drilldown',
      plugin: Foundation._plugins['drilldown'] || null },

    accordion: {
      cssClass: 'accordion-menu',
      plugin: Foundation._plugins['accordion-menu'] || null } };



  // Window exports
  Foundation.plugin(ResponsiveMenu, 'ResponsiveMenu');

}(jQuery);

},{}],6:[function(require,module,exports){
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets


    /**
                            * Compares the dimensions of an element to a container and determines collision events with container.
                            * @function
                            * @param {jQuery} element - jQuery object to test for collisions.
                            * @param {jQuery} parent - jQuery object to use as bounding container.
                            * @param {Boolean} lrOnly - set to true to check left and right values only.
                            * @param {Boolean} tbOnly - set to true to check top and bottom values only.
                            * @default if no parent object passed, detects collisions with `window`.
                            * @returns {Boolean} - true if collision free, false if a collision in any direction.
                            */ };
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
    top,bottom,left,right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else
    {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
      * Uses native methods to return an object of dimension values.
      * @function
      * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
      * @returns {Object} - nested object of integer pixel values
      * TODO - if element is window, return only those values.
      */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
    parRect = elem.parentNode.getBoundingClientRect(),
    winRect = document.body.getBoundingClientRect(),
    winY = window.pageYOffset,
    winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX },

      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX } },


      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX } } };



  }

  /**
     * Returns an object of top and left integer pixel values for dynamically rendered elements,
     * such as: Tooltip, Reveal, and Dropdown
     * @function
     * @param {jQuery} element - jQuery object for the element being positioned.
     * @param {jQuery} anchor - jQuery object for the element's anchor point.
     * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
     * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
     * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
     * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
     * TODO alter/rewrite to work with `em` values as well/instead of pixels
     */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
    $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset) };

        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top };

        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top };

        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset) };

        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };

        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2 };

        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2 };

        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2 };

        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset };

      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top };

        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };

        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };

        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset };}


  }

}(jQuery);

},{}],7:[function(require,module,exports){
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN' };


  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
                                  * Parses the (keyboard) event and returns a String that represents its key
                                  * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
                                  * @param {Event} event - the event generated by the event handler
                                  * @return String key - String that represents the key pressed
                                  */
    parseKey: function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },

    /**
        * Handles the given (keyboard) event
        * @param {Event} event - the event generated by the event handler
        * @param {String} component - Foundation component's name, e.g. Slider or Reveal
        * @param {Objects} functions - collection of functions that are to be executed
        */
    handleKey: function handleKey(event, component, functions) {
      var commandList = commands[component],
      keyCode = this.parseKey(event),
      cmds,
      command,
      fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {// this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {// merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else

        cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {// execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {// execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {// execute function when event was not handled
          functions.unhandled();
        }
      }
    },

    /**
        * Finds all focusable elements within the given `$element`
        * @param {jQuery} $element - jQuery object to search within
        * @return {jQuery} $focusable - all focusable elements within `$element`
        */
    findFocusable: function findFocusable($element) {
      if (!$element) {return false;}
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {return false;} //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },

    /**
        * Returns the component name name
        * @param {Object} component - Foundation component, e.g. Slider or Reveal
        * @return String componentName
        */

    register: function register(componentName, cmds) {
      commands[componentName] = cmds;
    },

    /**
        * Traps the focus in the given element.
        * @param  {jQuery} $element  jQuery object to trap the foucs into.
        */
    trapFocus: function trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
      $firstFocusable = $focusable.eq(0),
      $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else
        if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },
    /**
        * Releases the trapped focus from the given element.
        * @param  {jQuery} $element  jQuery object to release the focus for.
        */
    releaseFocus: function releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    } };


  /*
          * Constants for easier comparing.
          * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
          */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {k[kcs[kc]] = kcs[kc];}
    return k;
  }

  Foundation.Keyboard = Keyboard;

}(jQuery);

},{}],8:[function(require,module,exports){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' +
    'only screen and (min--moz-device-pixel-ratio: 2),' +
    'only screen and (-o-min-device-pixel-ratio: 2/1),' +
    'only screen and (min-device-pixel-ratio: 2),' +
    'only screen and (min-resolution: 192dpi),' +
    'only screen and (min-resolution: 2dppx)' };


  var MediaQuery = {
    queries: [],

    current: '',

    /**
                  * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
                  * @function
                  * @private
                  */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')' });

        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },

    /**
        * Checks if the screen is at least as wide as a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to check.
        * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
        */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },

    /**
        * Checks if the screen matches to a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
        * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
        */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },

    /**
        * Gets the media query of a breakpoint.
        * @function
        * @param {String} size - Name of the breakpoint to get.
        * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
        */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },

    /**
        * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
        * @function
        * @private
        * @returns {String} Name of the current breakpoint.
        */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },

    /**
        * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
        * @function
        * @private
        */
    _watcher: function _watcher() {var _this = this;
      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    } };


  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit
    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
      script = document.getElementsByTagName('script')[0],
      info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        } };

    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all' };

    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;

}(jQuery);

},{}],9:[function(require,module,exports){
'use strict';

!function ($) {

  /**
                * Motion module.
                * @module foundation.motion
                */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function animateIn(element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function animateOut(element, animation, cb) {
      animate(false, element, animation, cb);
    } };


  function Move(duration, elem, fn) {
    var anim,prog,start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {anim = window.requestAnimationFrame(move, elem);} else
      {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
     * Animates an element in or out using a CSS transition class.
     * @function
     * @private
     * @param {Boolean} isIn - Defines if the animation is in or out.
     * @param {Object} element - jQuery or HTML object to animate.
     * @param {String} animation - CSS class to use.
     * @param {Function} cb - Callback to run when animation is finished.
     */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.
    addClass(animation).
    css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.
      css('transition', '').
      addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;

}(jQuery);

},{}],10:[function(require,module,exports){
'use strict';

!function ($) {

  var Nest = {
    Feather: function Feather(menu) {var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';
      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
      subMenuClass = 'is-' + type + '-submenu',
      subItemClass = subMenuClass + '-item',
      hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
        $sub = $item.children('ul');

        if ($sub.length) {
          $item.
          addClass(hasSubClass).
          attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text() });

          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.
          addClass('submenu ' + subMenuClass).
          attr({
            'data-submenu': '',
            'role': 'menu' });

          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },

    Burn: function Burn(menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
      subItemClass = subMenuClass + '-item',
      hasSubClass = 'is-' + type + '-submenu-parent';

      menu.
      find('>li, .menu, .menu > li').
      removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').
      removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    } };


  Foundation.Nest = Nest;

}(jQuery);

},{}],11:[function(require,module,exports){
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
    duration = options.duration, //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
    remain = -1,
    start,
    timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {cb();}
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
     * Runs a callback function when images are fully loaded.
     * @param {Object} images - Image(s) to check if loaded.
     * @param {Func} callback - Function to execute when image is fully loaded.
     */
  function onImagesLoaded(images, callback) {
    var self = this,
    unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;

}(jQuery);

},{}],12:[function(require,module,exports){
'use strict'; //**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200 };


	var startPosX,
	startPosY,
	startTime,
	elapsedTime,
	isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {e.preventDefault();}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function setup() {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
             * Method for adding psuedo drag events to elements *
             ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function handleTouch(event) {
			var touches = event.changedTouches,
			first = touches[0],
			eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup' },

			type = eventTypes[event.type],
			simulatedEvent;


			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY });

			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);


//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/

},{}],13:[function(require,module,exports){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function triggers(el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else
    {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
      * Fires once after all other scripts have loaded
      * @function
      * @private
      */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    mutateListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
    plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
    $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').
      on('resize.zf.trigger', function (e) {
        if (timer) {clearTimeout(timer);}

        timer = setTimeout(function () {

          if (!MutationObserver) {//fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
    $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').
      on('scroll.zf.trigger', function (e) {
        if (timer) {clearTimeout(timer);}

        timer = setTimeout(function () {

          if (!MutationObserver) {//fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function mutateListener(debounce) {
    var $nodes = $('[data-mutate]');
    if ($nodes.length && MutationObserver) {
      //trigger all listening elements and signal a mutate event
      //no IE 9 or 10
      $nodes.each(function () {
        $(this).triggerHandler('mutateme.zf.trigger');
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {return false;}
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;

}(jQuery);

// function domMutationObserver(debounce) {
//   // !!! This is coming soon and needs more work; not active  !!! //
//   var timer,
//   nodes = document.querySelectorAll('[data-mutate]');
//   //
//   if (nodes.length) {
//     // var MutationObserver = (function () {
//     //   var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
//     //   for (var i=0; i < prefixes.length; i++) {
//     //     if (prefixes[i] + 'MutationObserver' in window) {
//     //       return window[prefixes[i] + 'MutationObserver'];
//     //     }
//     //   }
//     //   return false;
//     // }());
//
//
//     //for the body, we need to listen for all changes effecting the style and class attributes
//     var bodyObserver = new MutationObserver(bodyMutation);
//     bodyObserver.observe(document.body, { attributes: true, childList: true, characterData: false, subtree:true, attributeFilter:["style", "class"]});
//
//
//     //body callback
//     function bodyMutation(mutate) {
//       //trigger all listening elements and signal a mutation event
//       if (timer) { clearTimeout(timer); }
//
//       timer = setTimeout(function() {
//         bodyObserver.disconnect();
//         $('[data-mutate]').attr('data-events',"mutate");
//       }, debounce || 150);
//     }
//   }
// }

},{}],14:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';

// Foundation Core
require('foundation-sites/js/foundation.core.js');

require('foundation-sites/js/foundation.util.box.js');
require('foundation-sites/js/foundation.util.keyboard.js');
require('foundation-sites/js/foundation.util.mediaQuery.js');
require('foundation-sites/js/foundation.util.motion.js');
require('foundation-sites/js/foundation.util.nest.js');
require('foundation-sites/js/foundation.util.timerAndImageLoader.js');
require('foundation-sites/js/foundation.util.touch.js');
require('foundation-sites/js/foundation.util.triggers.js');

require('foundation-sites/js/foundation.drilldown.js');
require('foundation-sites/js/foundation.dropdownMenu.js');
require('foundation-sites/js/foundation.responsiveMenu.js');
require('foundation-sites/js/foundation.offcanvas.js');

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);
var _socialShare = require('modules/socialShare.js');var _socialShare2 = _interopRequireDefault(_socialShare);
var _carousel = require('modules/carousel.js');var _carousel2 = _interopRequireDefault(_carousel);
var _accordion = require('modules/accordion.js');var _accordion2 = _interopRequireDefault(_accordion);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // Foundation Plugins. Add or remove as needed for your site
// Foundation Utilities
(function ($) {
  // Initialize Foundation
  $(document).foundation();

  // Initialize social share functionality
  // Replace the empty string parameter with your Facebook ID
  (0, _socialShare2.default)('');

  // Initialize carousels
  (0, _carousel2.default)();

  // Initialize accordions
  (0, _accordion2.default)();

  // Initialize Plugins
  $('.magnific-trigger').magnificPopup({
    type: 'inline' });


  $('.meerkat-cta').meerkat({
    background: 'rgb(21, 76, 102) repeat-x left top',
    height: '120px',
    width: '100%',
    position: 'bottom',
    close: '.close-meerkat',
    dontShowAgain: '.dont-show',
    animationIn: 'fade',
    animationSpeed: 500,
    opacity: 0.9 });

})(_jquery2.default);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"foundation-sites/js/foundation.core.js":1,"foundation-sites/js/foundation.drilldown.js":2,"foundation-sites/js/foundation.dropdownMenu.js":3,"foundation-sites/js/foundation.offcanvas.js":4,"foundation-sites/js/foundation.responsiveMenu.js":5,"foundation-sites/js/foundation.util.box.js":6,"foundation-sites/js/foundation.util.keyboard.js":7,"foundation-sites/js/foundation.util.mediaQuery.js":8,"foundation-sites/js/foundation.util.motion.js":9,"foundation-sites/js/foundation.util.nest.js":10,"foundation-sites/js/foundation.util.timerAndImageLoader.js":11,"foundation-sites/js/foundation.util.touch.js":12,"foundation-sites/js/foundation.util.triggers.js":13,"modules/accordion.js":15,"modules/carousel.js":16,"modules/socialShare.js":17}],15:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var accordion = function accordion() {
  var $toggleButton = (0, _jquery2.default)('[data-accordion-toggle]');

  /**
                                                                         * Removes accordion container height declaration
                                                                         */
  function prepToggleContainer() {
    $toggleButton.each(function (e) {
      var $this = (0, _jquery2.default)(this); // eslint-disable-line no-invalid-this
      var $toggleContent = $this.closest('.accordion-list__item').
      find($toggleButton.data('accordion-toggle'));
      var isHidden = $toggleContent.attr('aria-hidden') === 'false' ?
      false : true;
      $toggleContent.attr('aria-hidden', false);
      $toggleContent.css('height', '');
      $toggleContent.css('height', $toggleContent.height());
      $toggleContent.attr('aria-hidden', isHidden);
    });
  }

  /**
     * Toggles accordion container
     */
  function toggle() {
    var toggleSection = function toggleSection(e) {
      var $this = (0, _jquery2.default)(e.currentTarget);
      console.log($this); // eslint-disable-line no-console
      $this.toggleClass('accordion-active');
      var $currentToggleContainer = $this.closest('.accordion-list__item').
      find($this.data('accordion-toggle'));
      var isHidden = $currentToggleContainer.
      attr('aria-hidden') === 'false' ? false : true;
      $currentToggleContainer.attr('aria-hidden', !isHidden);
    };

    $toggleButton.on('click', toggleSection);
  }

  (0, _jquery2.default)(document).ready(function () {
    prepToggleContainer();
    toggle();
  });

  (0, _jquery2.default)(window).on('resize', function () {
    prepToggleContainer();
  });
};exports.default =

accordion;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],16:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);
require('vendor/jquery.slick.js');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var carousel = function carousel() {
  (0, _jquery2.default)('.js-carousel').slick({
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    dots: false,
    focusOnSelect: false,
    infinite: true,
    responsive: [
    {
      breakpoint: 950,
      settings: {
        slidesToShow: 2 } },


    {
      breakpoint: 700,
      settings: {
        arrows: false,
        dots: true,
        slidesToShow: 1 } }] });




};exports.default =

carousel;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"vendor/jquery.slick.js":18}],17:[function(require,module,exports){
(function (global){
/* eslint-env browser */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });

var _jquery = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);var _jquery2 = _interopRequireDefault(_jquery);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

var socialShare = function socialShare(fbId) {
  var $body = (0, _jquery2.default)('body');

  // Facebook sharing with the SDK
  _jquery2.default.getScript('//connect.facebook.net/en_US/sdk.js').done(function () {
    $body.on('click.sharer-fb', '.sharer-fb', function (e) {
      var $link = (0, _jquery2.default)(e.currentTarget);
      var options = {
        method: 'feed',
        display: 'popup' };

      var newUrl = $link.data('redirect-to') ?
      $link.data('redirect-to') : null;

      e.preventDefault();

      window.FB.init({
        appId: fbId,
        xfbml: false,
        version: 'v2.0',
        status: false,
        cookie: true });


      if ($link.data('title')) {
        options.name = $link.data('title');
      }

      if ($link.data('url')) {
        options.link = $link.data('url');
      }

      if ($link.data('picture')) {
        options.picture = $link.data('picture');
      }

      if ($link.data('description')) {
        options.description = $link.data('description');
      }

      window.FB.ui(options, function (response) {
        if (newUrl) {
          window.location.href = newUrl;
        }
      });
    });
  });

  // Twitter sharing
  $body.on('click.sharer-tw', '.sharer-tw', function (e) {
    var $link = (0, _jquery2.default)(e.currentTarget);
    var url = $link.data('url');
    var text = $link.data('description');
    var via = $link.data('source');
    var twitterURL = 'https://twitter.com/share?url=' + encodeURIComponent(url);

    e.preventDefault();

    if (text) {
      twitterURL += '&text=' + encodeURIComponent(text);
    }
    if (via) {
      twitterURL += '&via=' + encodeURIComponent(via);
    }
    window.open(twitterURL, 'tweet',
    'width=500,height=384,menubar=no,status=no,toolbar=no');
  });

  // LinkedIn sharing
  $body.on('click.sharer-li', '.sharer-li', function (e) {
    var $link = (0, _jquery2.default)(e.target);
    var url = $link.data('url');
    var title = $link.data('title');
    var summary = $link.data('description');
    var source = $link.data('source');
    var linkedinURL = 'https://www.linkedin.com/shareArticle?mini=true&url=' +
    encodeURIComponent(url);

    e.preventDefault();

    if (title) {
      linkedinURL += '&title=' + encodeURIComponent(title);
    } else {
      linkedinURL += '&title=';
    }

    if (summary) {
      linkedinURL += '&summary=' +
      encodeURIComponent(summary.substring(0, 256));
    }

    if (source) {
      linkedinURL += '&source=' + encodeURIComponent(source);
    }

    window.open(linkedinURL, 'linkedin',
    'width=520,height=570,menubar=no,status=no,toolbar=no');
  });
};exports.default =

socialShare;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],18:[function(require,module,exports){
(function (global){
'use strict';var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;}; /*
                                                                                                                                                                                                                                                                                            _ _      _       _
                                                                                                                                                                                                                                                                                        ___| (_) ___| | __  (_)___
                                                                                                                                                                                                                                                                                       / __| | |/ __| |/ /  | / __|
                                                                                                                                                                                                                                                                                       \__ \ | | (__|   < _ | \__ \
                                                                                                                                                                                                                                                                                       |___/_|_|\___|_|\_(_)/ |___/
                                                                                                                                                                                                                                                                                                          |__/
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        Version: 1.5.0
                                                                                                                                                                                                                                                                                         Author: Ken Wheeler
                                                                                                                                                                                                                                                                                        Website: http://kenwheeler.github.io
                                                                                                                                                                                                                                                                                           Docs: http://kenwheeler.github.io/slick
                                                                                                                                                                                                                                                                                           Repo: http://github.com/kenwheeler/slick
                                                                                                                                                                                                                                                                                         Issues: http://github.com/kenwheeler/slick/issues
                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                        */
/* global window, document, define, jQuery, setInterval, clearInterval */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory((typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null));
    } else {
        factory(jQuery);
    }

})(function ($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = function () {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this,
            dataSettings,responsiveSettings,breakpoint;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev" aria-label="previous">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next" aria-label="next">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function customPaging(slider, i) {
                    return '<button type="button" data-role="none">' + (i + 1) + '</button>';
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true };


            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                $list: null,
                touchObject: {},
                transformsEnabled: false };


            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.hidden = 'hidden';
            _.paused = false;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, dataSettings, settings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;
            responsiveSettings = _.options.responsive || null;

            if (responsiveSettings && responsiveSettings.length > -1) {
                _.respondTo = _.options.respondTo || 'window';
                for (breakpoint in responsiveSettings) {
                    if (responsiveSettings.hasOwnProperty(breakpoint)) {
                        _.breakpoints.push(responsiveSettings[
                        breakpoint].breakpoint);
                        _.breakpointSettings[responsiveSettings[
                        breakpoint].breakpoint] =
                        responsiveSettings[breakpoint].settings;
                    }
                }
                _.breakpoints.sort(function (a, b) {
                    if (_.options.mobileFirst === true) {
                        return a - b;
                    } else {
                        return b - a;
                    }
                });
            }

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.msHidden !== 'undefined') {
                _.hidden = 'msHidden';
                _.visibilityChange = 'msvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;

            _.init();

            _.checkResponsive(true);

        }

        return Slick;

    }();

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function (markup, index, addBefore) {

        var _ = this;

        if (typeof index === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || index >= _.slideCount) {
            return false;
        }

        _.unload();

        if (typeof index === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function () {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight },
            _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function (targetLeft, callback) {

        var animProps = {},
        _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft },
                _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft },
                _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -_.currentLeft;
                }
                $({
                    animStart: _.currentLeft }).
                animate({
                    animStart: targetLeft },
                {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function step(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                            now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                            now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function complete() {
                        if (callback) {
                            callback.call();
                        }
                    } });


            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function () {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.asNavFor = function (index) {
        var _ = this,
        asNavFor = _.options.asNavFor !== null ? $(_.options.asNavFor).slick('getSlick') : null;
        if (asNavFor !== null) asNavFor.slideHandler(index, true);
    };

    Slick.prototype.applyTransition = function (slide) {

        var _ = this,
        transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function () {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

        if (_.slideCount > _.options.slidesToShow && _.paused !== true) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator,
            _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function () {

        var _ = this;
        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function () {

        var _ = this;

        if (_.options.infinite === false) {

            if (_.direction === 1) {

                if (_.currentSlide + 1 === _.slideCount -
                1) {
                    _.direction = 0;
                }

                _.slideHandler(_.currentSlide + _.options.slidesToScroll);

            } else {

                if (_.currentSlide - 1 === 0) {

                    _.direction = 1;

                }

                _.slideHandler(_.currentSlide - _.options.slidesToScroll);

            }

        } else {

            _.slideHandler(_.currentSlide + _.options.slidesToScroll);

        }

    };

    Slick.prototype.buildArrows = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow = $(_.options.prevArrow);
            _.$nextArrow = $(_.options.nextArrow);

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.appendTo(_.options.appendArrows);
            }

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.appendTo(_.options.appendArrows);
            }

            if (_.options.infinite !== true) {
                _.$prevArrow.addClass('slick-disabled');
            }

        }

    };

    Slick.prototype.buildDots = function () {

        var _ = this,
        i,dotString;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            dotString = '<ul class="' + _.options.dotsClass + '">';

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dotString += '<li>' + _.options.customPaging.call(this, _, i) + '</li>';
            }

            dotString += '</ul>';

            _.$dots = $(dotString).appendTo(
            _.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active').attr('aria-hidden', 'false');

        }

    };

    Slick.prototype.buildOut = function () {

        var _ = this;

        _.$slides = _.$slider.children(
        ':not(.slick-cloned)').addClass(
        'slick-slide');
        _.slideCount = _.$slides.length;

        _.$slides.each(function (index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.$slider.addClass('slick-slider');

        _.$slideTrack = _.slideCount === 0 ?
        $('<div class="slick-track"/>').appendTo(_.$slider) :
        _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
        '<div aria-live="polite" class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();

        if (_.options.accessibility === true) {
            _.$list.prop('tabIndex', 0);
        }

        _.setSlideClasses(typeof this.currentSlide === 'number' ? this.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function () {

        var _ = this,a,b,c,newSlides,numOfSlides,originalSlides,slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 1) {
            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
            originalSlides.length / slidesPerSection);


            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = a * slidesPerSection + (b * _.options.slidesPerRow + c);
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            };
            _.$slider.html(newSlides);
            _.$slider.children().children().children().
            width(100 / _.options.slidesPerRow + "%").
            css({ 'display': 'inline-block' });
        };

    };

    Slick.prototype.checkResponsive = function (initial) {

        var _ = this,
        breakpoint,targetBreakpoint,respondToWidth;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();
        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.originalSettings.responsive && _.originalSettings.
        responsive.length > -1 && _.originalSettings.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint) {
                        _.activeBreakpoint =
                        targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick();
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                            targetBreakpoint]);
                            if (initial === true)
                            _.currentSlide = _.options.initialSlide;
                            _.refresh();
                        }
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick();
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                        _.breakpointSettings[
                        targetBreakpoint]);
                        if (initial === true)
                        _.currentSlide = _.options.initialSlide;
                        _.refresh();
                    }
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true)
                    _.currentSlide = _.options.initialSlide;
                    _.refresh();
                }
            }

        }

    };

    Slick.prototype.changeSlide = function (event, dontAnimate) {

        var _ = this,
        $target = $(event.target),
        indexOffset,slideOffset,unevenOffset;

        // If target is a link, prevent default action.
        $target.is('a') && event.preventDefault();

        unevenOffset = _.slideCount % _.options.slidesToScroll !== 0;
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                event.data.index || $(event.target).parent().index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                break;

            default:
                return;}


    };

    Slick.prototype.checkNavigable = function (index) {

        var _ = this,
        navigables,prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).off('click.slick', _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
            $('li', _.$dots).
            off('mouseenter.slick', _.setPaused.bind(_, true)).
            off('mouseleave.slick', _.setPaused.bind(_, false));
        }

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        if (_.options.autoplay === true) {
            $(document).off(_.visibilityChange, _.visibility);
        }

        _.$list.off('mouseenter.slick', _.setPaused.bind(_, true));
        _.$list.off('mouseleave.slick', _.setPaused.bind(_, false));

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).off('ready.slick.slick-' + _.instanceUid, _.setPosition);
    };

    Slick.prototype.cleanUpRows = function () {

        var _ = this,originalSlides;

        if (_.options.rows > 1) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.html(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function (event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function () {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow && _typeof(_.options.prevArrow) !== 'object') {
            _.$prevArrow.remove();
        }
        if (_.$nextArrow && _typeof(_.options.nextArrow) !== 'object') {
            _.$nextArrow.remove();
        }

        if (_.$slides) {
            _.$slides.removeClass('slick-slide slick-active slick-center slick-visible').
            attr('aria-hidden', 'true').
            removeAttr('data-slick-index').
            css({
                position: '',
                left: '',
                top: '',
                zIndex: '',
                opacity: '',
                width: '' });


            _.$slider.html(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');

    };

    Slick.prototype.disableTransition = function (slide) {

        var _ = this,
        transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function (slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: 1000 });


            _.$slides.eq(slideIndex).animate({
                opacity: 1 },
            _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: 1000 });


            if (callback) {
                setTimeout(function () {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function (filter) {

        var _ = this;

        if (filter !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function () {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function () {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            pagerQty = Math.ceil(_.slideCount / _.options.slidesToScroll);
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToShow;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function (slideIndex) {

        var _ = this,
        targetLeft,
        verticalHeight,
        verticalOffset = 0,
        targetSlide;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight();

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = _.slideWidth * _.options.slidesToShow * -1;
                verticalOffset = verticalHeight * _.options.slidesToShow * -1;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth * -1;
                        verticalOffset = (_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight * -1;
                    } else {
                        _.slideOffset = _.slideCount % _.options.slidesToScroll * _.slideWidth * -1;
                        verticalOffset = _.slideCount % _.options.slidesToScroll * verticalHeight * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * _.slideWidth;
                verticalOffset = (slideIndex + _.options.slidesToShow - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = slideIndex * _.slideWidth * -1 + _.slideOffset;
        } else {
            targetLeft = slideIndex * verticalHeight * -1 + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;

            if (_.options.centerMode === true) {
                if (_.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function (option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function () {

        var _ = this,
        breakPoint = 0,
        counter = 0,
        indexes = [],
        max;

        if (_.options.infinite === false) {
            max = _.slideCount - _.options.slidesToShow + 1;
            if (_.options.centerMode === true) max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function () {

        return this;

    };

    Slick.prototype.getSlideCount = function () {

        var _ = this,
        slidesTraversed,swipedSlide,centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function (index, slide) {
                if (slide.offsetLeft - centerOffset + $(slide).outerWidth() / 2 > _.swipeLeft * -1) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function (slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide) } },

        dontAnimate);

    };

    Slick.prototype.init = function () {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');
            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
        }

        _.$slider.trigger('init', [_]);

    };

    Slick.prototype.initArrowEvents = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.on('click.slick', {
                message: 'previous' },
            _.changeSlide);
            _.$nextArrow.on('click.slick', {
                message: 'next' },
            _.changeSlide);
        }

    };

    Slick.prototype.initDotEvents = function () {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index' },
            _.changeSlide);
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.options.autoplay === true) {
            $('li', _.$dots).
            on('mouseenter.slick', _.setPaused.bind(_, true)).
            on('mouseleave.slick', _.setPaused.bind(_, false));
        }

    };

    Slick.prototype.initializeEvents = function () {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start' },
        _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move' },
        _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end' },
        _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end' },
        _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        if (_.options.autoplay === true) {
            $(document).on(_.visibilityChange, _.visibility.bind(_));
        }

        _.$list.on('mouseenter.slick', _.setPaused.bind(_, true));
        _.$list.on('mouseleave.slick', _.setPaused.bind(_, false));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange.bind(_));

        $(window).on('resize.slick.slick-' + _.instanceUid, _.resize.bind(_));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(document).on('ready.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.initUI = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

        if (_.options.autoplay === true) {

            _.autoPlay();

        }

    };

    Slick.prototype.keyHandler = function (event) {

        var _ = this;

        if (event.keyCode === 37 && _.options.accessibility === true) {
            _.changeSlide({
                data: {
                    message: 'previous' } });


        } else if (event.keyCode === 39 && _.options.accessibility === true) {
            _.changeSlide({
                data: {
                    message: 'next' } });


        }

    };

    Slick.prototype.lazyLoad = function () {

        var _ = this,
        loadRange,cloneRange,rangeStart,rangeEnd;

        function loadImages(imagesScope) {
            $('img[data-lazy]', imagesScope).each(function () {
                var image = $(this),
                imageSource = $(this).attr('data-lazy'),
                imageToLoad = document.createElement('img');

                imageToLoad.onload = function () {
                    image.animate({
                        opacity: 1 },
                    200);
                };
                imageToLoad.src = imageSource;

                image.
                css({
                    opacity: 0 }).

                attr('src', imageSource).
                removeAttr('data-lazy').
                removeClass('slick-loading');
            });
        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = rangeStart + _.options.slidesToShow;
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);
        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function () {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1 });


        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next' } });



    };

    Slick.prototype.orientationChange = function () {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function () {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function () {

        var _ = this;

        _.paused = false;
        _.autoPlay();

    };

    Slick.prototype.postSlide = function (index) {

        var _ = this;

        _.$slider.trigger('afterChange', [_, index]);

        _.animating = false;

        _.setPosition();

        _.swipeLeft = null;

        if (_.options.autoplay === true && _.paused === false) {
            _.autoPlay();
        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function () {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous' } });



    };

    Slick.prototype.preventDefault = function (e) {
        e.preventDefault();
    };

    Slick.prototype.progressiveLazyLoad = function () {

        var _ = this,
        imgCount,targetImage;

        imgCount = $('img[data-lazy]', _.$slider).length;

        if (imgCount > 0) {
            targetImage = $('img[data-lazy]', _.$slider).first();
            targetImage.attr('src', targetImage.attr('data-lazy')).removeClass('slick-loading').load(function () {
                targetImage.removeAttr('data-lazy');
                _.progressiveLazyLoad();

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }
            }).
            error(function () {
                targetImage.removeAttr('data-lazy');
                _.progressiveLazyLoad();
            });
        }

    };

    Slick.prototype.refresh = function () {

        var _ = this,
        currentSlide = _.currentSlide;

        _.destroy();

        $.extend(_, _.initials);

        _.init();

        _.changeSlide({
            data: {
                message: 'index',
                index: currentSlide } },

        false);

    };

    Slick.prototype.reinit = function () {

        var _ = this;

        _.$slides = _.$slideTrack.children(_.options.slide).addClass(
        'slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.setProps();

        _.setupInfinite();

        _.buildArrows();

        _.updateArrows();

        _.initArrowEvents();

        _.buildDots();

        _.updateDots();

        _.initDotEvents();

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(0);

        _.setPosition();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function () {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function () {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                _.setPosition();
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function (index, removeBefore, removeAll) {

        var _ = this;

        if (typeof index === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function (position) {

        var _ = this,
        positionProps = {},
        x,y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function () {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: '0px ' + _.options.centerPadding });

            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: _.options.centerPadding + ' 0px' });

            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil(_.slideWidth * _.$slideTrack.children('.slick-slide').length));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil(_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function () {

        var _ = this,
        targetLeft;

        _.$slides.each(function (index, element) {
            targetLeft = _.slideWidth * index * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: 800,
                    opacity: 0 });

            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: 800,
                    opacity: 0 });

            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: 900,
            opacity: 1 });


    };

    Slick.prototype.setHeight = function () {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption = Slick.prototype.slickSetOption = function (option, value, refresh) {

        var _ = this;
        _.options[option] = value;

        if (refresh === true) {
            _.unload();
            _.reinit();
        }

    };

    Slick.prototype.setPosition = function () {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function () {

        var _ = this,
        bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
        bodyStyle.MozTransition !== undefined ||
        bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.animType !== null && _.animType !== false;

    };


    Slick.prototype.setSlideClasses = function (index) {

        var _ = this,
        centerOffset,allSlides,indexOffset,remainder;

        _.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden', 'true').removeClass('slick-center');
        allSlides = _.$slider.find('.slick-slide');

        if (_.options.centerMode === true) {

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= _.slideCount - 1 - centerOffset) {
                    _.$slides.slice(index - centerOffset, index + centerOffset + 1).addClass('slick-active').attr('aria-hidden', 'false');
                } else {
                    indexOffset = _.options.slidesToShow + index;
                    allSlides.slice(indexOffset - centerOffset + 1, indexOffset + centerOffset + 2).addClass('slick-active').attr('aria-hidden', 'false');
                }

                if (index === 0) {
                    allSlides.eq(allSlides.length - 1 - _.options.slidesToShow).addClass('slick-center');
                } else if (index === _.slideCount - 1) {
                    allSlides.eq(_.options.slidesToShow).addClass('slick-center');
                }

            }

            _.$slides.eq(index).addClass('slick-center');

        } else {

            if (index >= 0 && index <= _.slideCount - _.options.slidesToShow) {
                _.$slides.slice(index, index + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
            } else if (allSlides.length <= _.options.slidesToShow) {
                allSlides.addClass('slick-active').attr('aria-hidden', 'false');
            } else {
                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;
                if (_.options.slidesToShow == _.options.slidesToScroll && _.slideCount - index < _.options.slidesToShow) {
                    allSlides.slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder).addClass('slick-active').attr('aria-hidden', 'false');
                } else {
                    allSlides.slice(indexOffset, indexOffset + _.options.slidesToShow).addClass('slick-active').attr('aria-hidden', 'false');
                }
            }

        }

        if (_.options.lazyLoad === 'ondemand') {
            _.lazyLoad();
        }

    };

    Slick.prototype.setupInfinite = function () {

        var _ = this,
        i,slideIndex,infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > _.slideCount -
                infiniteCount; i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').
                    attr('data-slick-index', slideIndex - _.slideCount).
                    prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '').
                    attr('data-slick-index', slideIndex + _.slideCount).
                    appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function () {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.setPaused = function (paused) {

        var _ = this;

        if (_.options.autoplay === true && _.options.pauseOnHover === true) {
            _.paused = paused;
            _.autoPlayClear();
        }
    };

    Slick.prototype.selectHandler = function (event) {

        var _ = this;

        var targetElement = $(event.target).is('.slick-slide') ?
        $(event.target) :
        $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {
            _.$slider.find('.slick-slide').removeClass('slick-active').attr('aria-hidden', 'true');
            _.$slides.eq(index).addClass('slick-active').attr("aria-hidden", "false");
            if (_.options.centerMode === true) {
                _.$slider.find('.slick-slide').removeClass('slick-center');
                _.$slides.eq(index).addClass('slick-center');
            }
            _.asNavFor(index);
            return;
        }
        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function (index, sync, dontAnimate) {

        var targetSlide,animSlide,oldSlide,slideLeft,targetLeft = null,
        _ = this;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > _.slideCount - _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true) {
                    _.animateSlide(slideLeft, function () {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay === true) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - _.slideCount % _.options.slidesToScroll;
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger("beforeChange", [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {
                _.fadeSlide(animSlide, function () {
                    _.postSlide(animSlide);
                });
            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true) {
            _.animateSlide(targetLeft, function () {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function () {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function () {

        var xDist,yDist,r,swipeAngle,_ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if (swipeAngle <= 45 && swipeAngle >= 0) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle <= 360 && swipeAngle >= 315) {
            return _.options.rtl === false ? 'left' : 'right';
        }
        if (swipeAngle >= 135 && swipeAngle <= 225) {
            return _.options.rtl === false ? 'right' : 'left';
        }
        if (_.options.verticalSwiping === true) {
            if (swipeAngle >= 35 && swipeAngle <= 135) {
                return 'left';
            } else {
                return 'right';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function (event) {

        var _ = this,
        slideCount;

        _.dragging = false;

        _.shouldClick = _.touchObject.swipeLength > 10 ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger("edge", [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            switch (_.swipeDirection()) {
                case 'left':
                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide + _.getSlideCount()) : _.currentSlide + _.getSlideCount();
                    _.slideHandler(slideCount);
                    _.currentDirection = 0;
                    _.touchObject = {};
                    _.$slider.trigger("swipe", [_, "left"]);
                    break;

                case 'right':
                    slideCount = _.options.swipeToSlide ? _.checkNavigable(_.currentSlide - _.getSlideCount()) : _.currentSlide - _.getSlideCount();
                    _.slideHandler(slideCount);
                    _.currentDirection = 1;
                    _.touchObject = {};
                    _.$slider.trigger("swipe", [_, "right"]);
                    break;}

        } else {
            if (_.touchObject.startX !== _.touchObject.curX) {
                _.slideHandler(_.currentSlide);
                _.touchObject = {};
            }
        }

    };

    Slick.prototype.swipeHandler = function (event) {

        var _ = this;

        if (_.options.swipe === false || 'ontouchend' in document && _.options.swipe === false) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
        event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options.
        touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options.
            touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;}



    };

    Slick.prototype.swipeMove = function (event) {

        var _ = this,
        edgeWasHit = false,
        curLeft,swipeDirection,swipeLength,positionOffset,touches;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
        Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));
        }

        swipeDirection = _.swipeDirection();

        if (swipeDirection === 'vertical') {
            return;
        }

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if (_.currentSlide === 0 && swipeDirection === "right" || _.currentSlide >= _.getDotCount() && swipeDirection === "left") {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + swipeLength * (_.$list.height() / _.listWidth) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function (event) {

        var _ = this,
        touches;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function () {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function () {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();
        if (_.$dots) {
            _.$dots.remove();
        }
        if (_.$prevArrow && _typeof(_.options.prevArrow) !== 'object') {
            _.$prevArrow.remove();
        }
        if (_.$nextArrow && _typeof(_.options.nextArrow) !== 'object') {
            _.$nextArrow.remove();
        }
        _.$slides.removeClass('slick-slide slick-active slick-visible').attr("aria-hidden", "true").css('width', '');

    };

    Slick.prototype.unslick = function () {

        var _ = this;
        _.destroy();

    };

    Slick.prototype.updateArrows = function () {

        var _ = this,
        centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true && _.options.infinite !==
        true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow.removeClass('slick-disabled');
            _.$nextArrow.removeClass('slick-disabled');
            if (_.currentSlide === 0) {
                _.$prevArrow.addClass('slick-disabled');
                _.$nextArrow.removeClass('slick-disabled');
            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {
                _.$nextArrow.addClass('slick-disabled');
                _.$prevArrow.removeClass('slick-disabled');
            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {
                _.$nextArrow.addClass('slick-disabled');
                _.$prevArrow.removeClass('slick-disabled');
            }
        }

    };

    Slick.prototype.updateDots = function () {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots.find('li').removeClass('slick-active').attr("aria-hidden", "true");
            _.$dots.find('li').eq(Math.floor(_.currentSlide / _.options.slidesToScroll)).addClass('slick-active').attr("aria-hidden", "false");

        }

    };

    Slick.prototype.visibility = function () {

        var _ = this;

        if (document[_.hidden]) {
            _.paused = true;
            _.autoPlayClear();
        } else {
            _.paused = false;
            _.autoPlay();
        }

    };

    $.fn.slick = function () {
        var _ = this,
        opt = arguments[0],
        args = Array.prototype.slice.call(arguments, 1),
        l = _.length,
        i = 0,
        ret;
        for (i; i < l; i++) {
            if ((typeof opt === 'undefined' ? 'undefined' : _typeof(opt)) == 'object' || typeof opt == 'undefined')
            _[i].slick = new Slick(_[i], opt);else

            ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[14])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLmNvcmUuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLmRyaWxsZG93bi5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24uZHJvcGRvd25NZW51LmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi5vZmZjYW52YXMuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnJlc3BvbnNpdmVNZW51LmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLmJveC5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC5rZXlib2FyZC5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5LmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLm1vdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9mb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC5uZXN0LmpzIiwibm9kZV9tb2R1bGVzL2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLnRpbWVyQW5kSW1hZ2VMb2FkZXIuanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwudG91Y2guanMiLCJub2RlX21vZHVsZXMvZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnMuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2FjY29yZGlvbi5qcyIsInNyYy9qcy9tb2R1bGVzL2Nhcm91c2VsLmpzIiwic3JjL2pzL21vZHVsZXMvc29jaWFsU2hhcmUuanMiLCJzcmMvanMvdmVuZG9yL2pxdWVyeS5zbGljay5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtzUkNBQSxDQUFDLFVBQVMsQ0FBVCxFQUFZOztBQUViOztBQUVBLE1BQUkscUJBQXFCLE9BQXpCOztBQUVBO0FBQ0E7QUFDQSxNQUFJLGFBQWE7QUFDZixhQUFTLGtCQURNOztBQUdmOzs7QUFHQSxjQUFVLEVBTks7O0FBUWY7OztBQUdBLFlBQVEsRUFYTzs7QUFhZjs7O0FBR0EsU0FBSyxlQUFVO0FBQ2IsYUFBTyxFQUFFLE1BQUYsRUFBVSxJQUFWLENBQWUsS0FBZixNQUEwQixLQUFqQztBQUNELEtBbEJjO0FBbUJmOzs7O0FBSUEsWUFBUSxnQkFBUyxPQUFULEVBQWlCLElBQWpCLEVBQXVCO0FBQzdCO0FBQ0E7QUFDQSxVQUFJLFlBQWEsUUFBUSxhQUFhLE9BQWIsQ0FBekI7QUFDQTtBQUNBO0FBQ0EsVUFBSSxXQUFZLFVBQVUsU0FBVixDQUFoQjs7QUFFQTtBQUNBLFdBQUssUUFBTCxDQUFjLFFBQWQsSUFBMEIsS0FBSyxTQUFMLElBQWtCLE9BQTVDO0FBQ0QsS0FqQ2M7QUFrQ2Y7Ozs7Ozs7OztBQVNBLG9CQUFnQix3QkFBUyxNQUFULEVBQWlCLElBQWpCLEVBQXNCO0FBQ3BDLFVBQUksYUFBYSxPQUFPLFVBQVUsSUFBVixDQUFQLEdBQXlCLGFBQWEsT0FBTyxXQUFwQixFQUFpQyxXQUFqQyxFQUExQztBQUNBLGFBQU8sSUFBUCxHQUFjLEtBQUssV0FBTCxDQUFpQixDQUFqQixFQUFvQixVQUFwQixDQUFkOztBQUVBLFVBQUcsQ0FBQyxPQUFPLFFBQVAsQ0FBZ0IsSUFBaEIsV0FBNkIsVUFBN0IsQ0FBSixFQUErQyxDQUFFLE9BQU8sUUFBUCxDQUFnQixJQUFoQixXQUE2QixVQUE3QixFQUEyQyxPQUFPLElBQWxELEVBQTBEO0FBQzNHLFVBQUcsQ0FBQyxP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QUVKLEtBWkQ7O0FBY0EsTUFBRSxFQUFGLENBQUssS0FBTCxHQUFhLFlBQVc7QUFDcEIsWUFBSSxJQUFJLElBQVI7QUFDSSxjQUFNLFVBQVUsQ0FBVixDQURWO0FBRUksZUFBTyxNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBMkIsU0FBM0IsRUFBc0MsQ0FBdEMsQ0FGWDtBQUdJLFlBQUksRUFBRSxNQUhWO0FBSUksWUFBSSxDQUpSO0FBS0ksV0FMSjtBQU1BLGFBQUssQ0FBTCxFQUFRLElBQUksQ0FBWixFQUFlLEdBQWYsRUFBb0I7QUFDaEIsZ0JBQUksUUFBTyxHQUFQLHlDQUFPLEdBQVAsTUFBYyxRQUFkLElBQTBCLE9BQU8sR0FBUCxJQUFjLFdBQTVDO0FBQ0ksY0FBRSxDQUFGLEVBQUssS0FBTCxHQUFhLElBQUksS0FBSixDQUFVLEVBQUUsQ0FBRixDQUFWLEVBQWdCLEdBQWhCLENBQWIsQ0FESjs7QUFHSSxrQkFBTSxFQUFFLENBQUYsRUFBSyxLQUFMLENBQVcsR0FBWCxFQUFnQixLQUFoQixDQUFzQixFQUFFLENBQUYsRUFBSyxLQUEzQixFQUFrQyxJQUFsQyxDQUFOO0FBQ0osZ0JBQUksT0FBTyxHQUFQLElBQWMsV0FBbEIsRUFBK0IsT0FBTyxHQUFQO0FBQ2xDO0FBQ0QsZUFBTyxDQUFQO0FBQ0gsS0FmRDs7QUFpQkgsQ0EvdUVBLENBQUQiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiIWZ1bmN0aW9uKCQpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBGT1VOREFUSU9OX1ZFUlNJT04gPSAnNi4zLjEnO1xuXG4vLyBHbG9iYWwgRm91bmRhdGlvbiBvYmplY3Rcbi8vIFRoaXMgaXMgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdywgb3IgdXNlZCBhcyBhIG1vZHVsZSBmb3IgQU1EL0Jyb3dzZXJpZnlcbnZhciBGb3VuZGF0aW9uID0ge1xuICB2ZXJzaW9uOiBGT1VOREFUSU9OX1ZFUlNJT04sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBpbml0aWFsaXplZCBwbHVnaW5zLlxuICAgKi9cbiAgX3BsdWdpbnM6IHt9LFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICovXG4gIF91dWlkczogW10sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciBSVEwgc3VwcG9ydFxuICAgKi9cbiAgcnRsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiAkKCdodG1sJykuYXR0cignZGlyJykgPT09ICdydGwnO1xuICB9LFxuICAvKipcbiAgICogRGVmaW5lcyBhIEZvdW5kYXRpb24gcGx1Z2luLCBhZGRpbmcgaXQgdG8gdGhlIGBGb3VuZGF0aW9uYCBuYW1lc3BhY2UgYW5kIHRoZSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZSB3aGVuIHJlZmxvd2luZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxuICAgKi9cbiAgcGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpIHtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgICAvLyBFeGFtcGxlczogRm91bmRhdGlvbi5SZXZlYWwsIEZvdW5kYXRpb24uT2ZmQ2FudmFzXG4gICAgdmFyIGNsYXNzTmFtZSA9IChuYW1lIHx8IGZ1bmN0aW9uTmFtZShwbHVnaW4pKTtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGUgaWRlbnRpZnlpbmcgZGF0YSBhdHRyaWJ1dGUgZm9yIHRoZSBwbHVnaW5cbiAgICAvLyBFeGFtcGxlczogZGF0YS1yZXZlYWwsIGRhdGEtb2ZmLWNhbnZhc1xuICAgIHZhciBhdHRyTmFtZSAgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcblxuICAgIC8vIEFkZCB0byB0aGUgRm91bmRhdGlvbiBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxuICAgKiBBZGRzIHRoZSBgemZQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5mb3VuZGF0aW9uKG1ldGhvZCkgY2FsbHMuXG4gICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAqL1xuICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IG5hbWUgPyBoeXBoZW5hdGUobmFtZSkgOiBmdW5jdGlvbk5hbWUocGx1Z2luLmNvbnN0cnVjdG9yKS50b0xvd2VyQ2FzZSgpO1xuICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcblxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkpeyBwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCwgcGx1Z2luLnV1aWQpOyB9XG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKXsgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTsgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNpbml0XG4gICAgICAgICAgICovXG4gICAgcGx1Z2luLiRlbGVtZW50LnRyaWdnZXIoYGluaXQuemYuJHtwbHVnaW5OYW1lfWApO1xuXG4gICAgdGhpcy5fdXVpZHMucHVzaChwbHVnaW4udXVpZCk7XG5cbiAgICByZXR1cm47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICogUmVtb3ZlcyB0aGUgemZQbHVnaW4gZGF0YSBhdHRyaWJ1dGUsIGFzIHdlbGwgYXMgdGhlIGRhdGEtcGx1Z2luLW5hbWUgYXR0cmlidXRlLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBmaXJlcyBQbHVnaW4jZGVzdHJveWVkXG4gICAqL1xuICB1bnJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4pe1xuICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuXG4gICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICBwbHVnaW4uJGVsZW1lbnQucmVtb3ZlQXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkucmVtb3ZlRGF0YSgnemZQbHVnaW4nKVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAgICAgKi9cbiAgICAgICAgICAudHJpZ2dlcihgZGVzdHJveWVkLnpmLiR7cGx1Z2luTmFtZX1gKTtcbiAgICBmb3IodmFyIHByb3AgaW4gcGx1Z2luKXtcbiAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7Ly9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgIH1cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBDYXVzZXMgb25lIG9yIG1vcmUgYWN0aXZlIHBsdWdpbnMgdG8gcmUtaW5pdGlhbGl6ZSwgcmVzZXR0aW5nIGV2ZW50IGxpc3RlbmVycywgcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBsdWdpbnMgLSBvcHRpb25hbCBzdHJpbmcgb2YgYW4gaW5kaXZpZHVhbCBwbHVnaW4ga2V5LCBhdHRhaW5lZCBieSBjYWxsaW5nIGAkKGVsZW1lbnQpLmRhdGEoJ3BsdWdpbk5hbWUnKWAsIG9yIHN0cmluZyBvZiBhIHBsdWdpbiBjbGFzcyBpLmUuIGAnZHJvcGRvd24nYFxuICAgKiBAZGVmYXVsdCBJZiBubyBhcmd1bWVudCBpcyBwYXNzZWQsIHJlZmxvdyBhbGwgY3VycmVudGx5IGFjdGl2ZSBwbHVnaW5zLlxuICAgKi9cbiAgIHJlSW5pdDogZnVuY3Rpb24ocGx1Z2lucyl7XG4gICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XG4gICAgIHRyeXtcbiAgICAgICBpZihpc0pRKXtcbiAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3pmUGx1Z2luJykuX2luaXQoKTtcbiAgICAgICAgIH0pO1xuICAgICAgIH1lbHNle1xuICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgIGZucyA9IHtcbiAgICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uKHBsZ3Mpe1xuICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbihwKXtcbiAgICAgICAgICAgICAgIHAgPSBoeXBoZW5hdGUocCk7XG4gICAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHBsdWdpbnMgPSBoeXBoZW5hdGUocGx1Z2lucyk7XG4gICAgICAgICAgICAgJCgnW2RhdGEtJysgcGx1Z2lucyArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICB0aGlzWydvYmplY3QnXShPYmplY3Qua2V5cyhfdGhpcy5fcGx1Z2lucykpO1xuICAgICAgICAgICB9XG4gICAgICAgICB9O1xuICAgICAgICAgZm5zW3R5cGVdKHBsdWdpbnMpO1xuICAgICAgIH1cbiAgICAgfWNhdGNoKGVycil7XG4gICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICB9ZmluYWxseXtcbiAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgfVxuICAgfSxcblxuICAvKipcbiAgICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIHRvIHRoZSB1aWQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAqL1xuICBHZXRZb0RpZ2l0czogZnVuY3Rpb24obGVuZ3RoLCBuYW1lc3BhY2Upe1xuICAgIGxlbmd0aCA9IGxlbmd0aCB8fCA2O1xuICAgIHJldHVybiBNYXRoLnJvdW5kKChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gYC0ke25hbWVzcGFjZX1gIDogJycpO1xuICB9LFxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBwbHVnaW5zIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gYGVsZW1gIChhbmQgYGVsZW1gIGl0c2VsZikgdGhhdCBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIG9iamVjdC5cbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAqL1xuICByZWZsb3c6IGZ1bmN0aW9uKGVsZW0sIHBsdWdpbnMpIHtcblxuICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICB9XG4gICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAkLmVhY2gocGx1Z2lucywgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxuICAgICAgdmFyIHBsdWdpbiA9IF90aGlzLl9wbHVnaW5zW25hbWVdO1xuXG4gICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pLmZpbmQoJ1tkYXRhLScrbmFtZSsnXScpLmFkZEJhY2soJ1tkYXRhLScrbmFtZSsnXScpO1xuXG4gICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICRlbGVtLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICAvLyBEb24ndCBkb3VibGUtZGlwIG9uIHBsdWdpbnNcbiAgICAgICAgaWYgKCRlbC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIituYW1lK1wiIG9uIGFuIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyBhIEZvdW5kYXRpb24gcGx1Z2luLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZigkZWwuYXR0cignZGF0YS1vcHRpb25zJykpe1xuICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24oZSwgaSl7XG4gICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbihlbCl7IHJldHVybiBlbC50cmltKCk7IH0pO1xuICAgICAgICAgICAgaWYob3B0WzBdKSBvcHRzW29wdFswXV0gPSBwYXJzZVZhbHVlKG9wdFsxXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICRlbC5kYXRhKCd6ZlBsdWdpbicsIG5ldyBwbHVnaW4oJCh0aGlzKSwgb3B0cykpO1xuICAgICAgICB9Y2F0Y2goZXIpe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICB9ZmluYWxseXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBnZXRGbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24oJGVsZW0pe1xuICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgICB9O1xuICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIGVuZDtcblxuICAgIGZvciAodmFyIHQgaW4gdHJhbnNpdGlvbnMpe1xuICAgICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZihlbmQpe1xuICAgICAgcmV0dXJuIGVuZDtcbiAgICB9ZWxzZXtcbiAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgIH0sIDEpO1xuICAgICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcbiAgICB9XG4gIH1cbn07XG5cbkZvdW5kYXRpb24udXRpbCA9IHtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cbiAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICovXG4gIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcbiAgICB2YXIgdGltZXIgPSBudWxsO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgaWYgKHRpbWVyID09PSBudWxsKSB7XG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG4vLyBUT0RPOiBjb25zaWRlciBub3QgbWFraW5nIHRoaXMgYSBqUXVlcnkgZnVuY3Rpb25cbi8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuLyoqXG4gKiBUaGUgRm91bmRhdGlvbiBqUXVlcnkgbWV0aG9kLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gKi9cbnZhciBmb3VuZGF0aW9uID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIG1ldGhvZCxcbiAgICAgICRtZXRhID0gJCgnbWV0YS5mb3VuZGF0aW9uLW1xJyksXG4gICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuXG4gIGlmKCEkbWV0YS5sZW5ndGgpe1xuICAgICQoJzxtZXRhIGNsYXNzPVwiZm91bmRhdGlvbi1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO1xuICB9XG4gIGlmKCRub0pTLmxlbmd0aCl7XG4gICAgJG5vSlMucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG4gIH1cblxuICBpZih0eXBlID09PSAndW5kZWZpbmVkJyl7Ly9uZWVkcyB0byBpbml0aWFsaXplIHRoZSBGb3VuZGF0aW9uIG9iamVjdCwgb3IgYW4gaW5kaXZpZHVhbCBwbHVnaW4uXG4gICAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5Ll9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWZsb3codGhpcyk7XG4gIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXsvL2FuIGluZGl2aWR1YWwgbWV0aG9kIHRvIGludm9rZSBvbiBhIHBsdWdpbiBvciBncm91cCBvZiBwbHVnaW5zXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpOy8vY29sbGVjdCBhbGwgdGhlIGFyZ3VtZW50cywgaWYgbmVjZXNzYXJ5XG4gICAgdmFyIHBsdWdDbGFzcyA9IHRoaXMuZGF0YSgnemZQbHVnaW4nKTsvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG5cbiAgICBpZihwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKXsvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICBpZih0aGlzLmxlbmd0aCA9PT0gMSl7Ly9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGVsKXsvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIG1ldGhvZCBvbiBlYWNoXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgnemZQbHVnaW4nKSwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1lbHNley8vZXJyb3IgZm9yIG5vIGNsYXNzIG9yIG5vIG1ldGhvZFxuICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFwiJyBpcyBub3QgYW4gYXZhaWxhYmxlIG1ldGhvZCBmb3IgXCIgKyAocGx1Z0NsYXNzID8gZnVuY3Rpb25OYW1lKHBsdWdDbGFzcykgOiAndGhpcyBlbGVtZW50JykgKyAnLicpO1xuICAgIH1cbiAgfWVsc2V7Ly9lcnJvciBmb3IgaW52YWxpZCBhcmd1bWVudCB0eXBlXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgV2UncmUgc29ycnksICR7dHlwZX0gaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyLiBZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLmApO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxud2luZG93LkZvdW5kYXRpb24gPSBGb3VuZGF0aW9uO1xuJC5mbi5mb3VuZGF0aW9uID0gZm91bmRhdGlvbjtcblxuLy8gUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuKGZ1bmN0aW9uKCkge1xuICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpXG4gICAgd2luZG93LkRhdGUubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG4gIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnArJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZwKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXSk7XG4gIH1cbiAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWUgLSBub3cpO1xuICAgIH07XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xuICB9XG4gIC8qKlxuICAgKiBQb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93LCByZXF1aXJlZCBieSByQUZcbiAgICovXG4gIGlmKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpe1xuICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxuICAgICAgbm93OiBmdW5jdGlvbigpeyByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7IH1cbiAgICB9O1xuICB9XG59KSgpO1xuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG9UaGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgfVxuXG4gICAgdmFyIGFBcmdzICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgICAgZk5PUCAgICA9IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIGZCb3VuZCAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUFxuICAgICAgICAgICAgICAgICA/IHRoaXNcbiAgICAgICAgICAgICAgICAgOiBvVGhpcyxcbiAgICAgICAgICAgICAgICAgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgICAgfTtcblxuICAgIGlmICh0aGlzLnByb3RvdHlwZSkge1xuICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgIH1cbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgIHJldHVybiBmQm91bmQ7XG4gIH07XG59XG4vLyBQb2x5ZmlsbCB0byBnZXQgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiBpbiBJRTlcbmZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmbikge1xuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKFteKF17MSx9KVxcKC87XG4gICAgdmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuICAgIHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXS50cmltKCkgOiBcIlwiO1xuICB9XG4gIGVsc2UgaWYgKGZuLnByb3RvdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZuLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG59XG5mdW5jdGlvbiBwYXJzZVZhbHVlKHN0cil7XG4gIGlmICgndHJ1ZScgPT09IHN0cikgcmV0dXJuIHRydWU7XG4gIGVsc2UgaWYgKCdmYWxzZScgPT09IHN0cikgcmV0dXJuIGZhbHNlO1xuICBlbHNlIGlmICghaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gIHJldHVybiBzdHI7XG59XG4vLyBDb252ZXJ0IFBhc2NhbENhc2UgdG8ga2ViYWItY2FzZVxuLy8gVGhhbmsgeW91OiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84OTU1NTgwXG5mdW5jdGlvbiBoeXBoZW5hdGUoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbn1cblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIERyaWxsZG93biBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uZHJpbGxkb3duXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLmtleWJvYXJkXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5uZXN0XG4gKi9cblxuY2xhc3MgRHJpbGxkb3duIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSBkcmlsbGRvd24gbWVudS5cbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uIG1lbnUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJpbGxkb3duLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICBGb3VuZGF0aW9uLk5lc3QuRmVhdGhlcih0aGlzLiRlbGVtZW50LCAnZHJpbGxkb3duJyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdEcmlsbGRvd24nKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcmlsbGRvd24nLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAndXAnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cycsXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJyxcbiAgICAgICdUQUInOiAnZG93bicsXG4gICAgICAnU0hJRlRfVEFCJzogJ3VwJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBkcmlsbGRvd24gYnkgY3JlYXRpbmcgalF1ZXJ5IGNvbGxlY3Rpb25zIG9mIGVsZW1lbnRzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLiRzdWJtZW51QW5jaG9ycyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuaXMtZHJpbGxkb3duLXN1Ym1lbnUtcGFyZW50JykuY2hpbGRyZW4oJ2EnKTtcbiAgICB0aGlzLiRzdWJtZW51cyA9IHRoaXMuJHN1Ym1lbnVBbmNob3JzLnBhcmVudCgnbGknKS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKTtcbiAgICB0aGlzLiRtZW51SXRlbXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpJykubm90KCcuanMtZHJpbGxkb3duLWJhY2snKS5hdHRyKCdyb2xlJywgJ21lbnVpdGVtJykuZmluZCgnYScpO1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cignZGF0YS1tdXRhdGUnLCAodGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLWRyaWxsZG93bicpIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2RyaWxsZG93bicpKSk7XG5cbiAgICB0aGlzLl9wcmVwYXJlTWVudSgpO1xuICAgIHRoaXMuX3JlZ2lzdGVyRXZlbnRzKCk7XG5cbiAgICB0aGlzLl9rZXlib2FyZEV2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIHByZXBhcmVzIGRyaWxsZG93biBtZW51IGJ5IHNldHRpbmcgYXR0cmlidXRlcyB0byBsaW5rcyBhbmQgZWxlbWVudHNcbiAgICogc2V0cyBhIG1pbiBoZWlnaHQgdG8gcHJldmVudCBjb250ZW50IGp1bXBpbmdcbiAgICogd3JhcHMgdGhlIGVsZW1lbnQgaWYgbm90IGFscmVhZHkgd3JhcHBlZFxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9wcmVwYXJlTWVudSgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIC8vIGlmKCF0aGlzLm9wdGlvbnMuaG9sZE9wZW4pe1xuICAgIC8vICAgdGhpcy5fbWVudUxpbmtFdmVudHMoKTtcbiAgICAvLyB9XG4gICAgdGhpcy4kc3VibWVudUFuY2hvcnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICRsaW5rID0gJCh0aGlzKTtcbiAgICAgIHZhciAkc3ViID0gJGxpbmsucGFyZW50KCk7XG4gICAgICBpZihfdGhpcy5vcHRpb25zLnBhcmVudExpbmspe1xuICAgICAgICAkbGluay5jbG9uZSgpLnByZXBlbmRUbygkc3ViLmNoaWxkcmVuKCdbZGF0YS1zdWJtZW51XScpKS53cmFwKCc8bGkgY2xhc3M9XCJpcy1zdWJtZW51LXBhcmVudC1pdGVtIGlzLXN1Ym1lbnUtaXRlbSBpcy1kcmlsbGRvd24tc3VibWVudS1pdGVtXCIgcm9sZT1cIm1lbnUtaXRlbVwiPjwvbGk+Jyk7XG4gICAgICB9XG4gICAgICAkbGluay5kYXRhKCdzYXZlZEhyZWYnLCAkbGluay5hdHRyKCdocmVmJykpLnJlbW92ZUF0dHIoJ2hyZWYnKS5hdHRyKCd0YWJpbmRleCcsIDApO1xuICAgICAgJGxpbmsuY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJylcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oaWRkZW4nOiB0cnVlLFxuICAgICAgICAgICAgJ3RhYmluZGV4JzogMCxcbiAgICAgICAgICAgICdyb2xlJzogJ21lbnUnXG4gICAgICAgICAgfSk7XG4gICAgICBfdGhpcy5fZXZlbnRzKCRsaW5rKTtcbiAgICB9KTtcbiAgICB0aGlzLiRzdWJtZW51cy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJG1lbnUgPSAkKHRoaXMpLFxuICAgICAgICAgICRiYWNrID0gJG1lbnUuZmluZCgnLmpzLWRyaWxsZG93bi1iYWNrJyk7XG4gICAgICBpZighJGJhY2subGVuZ3RoKXtcbiAgICAgICAgc3dpdGNoIChfdGhpcy5vcHRpb25zLmJhY2tCdXR0b25Qb3NpdGlvbikge1xuICAgICAgICAgIGNhc2UgXCJib3R0b21cIjpcbiAgICAgICAgICAgICRtZW51LmFwcGVuZChfdGhpcy5vcHRpb25zLmJhY2tCdXR0b24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInRvcFwiOlxuICAgICAgICAgICAgJG1lbnUucHJlcGVuZChfdGhpcy5vcHRpb25zLmJhY2tCdXR0b24pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJVbnN1cHBvcnRlZCBiYWNrQnV0dG9uUG9zaXRpb24gdmFsdWUgJ1wiICsgX3RoaXMub3B0aW9ucy5iYWNrQnV0dG9uUG9zaXRpb24gKyBcIidcIik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF90aGlzLl9iYWNrKCRtZW51KTtcbiAgICB9KTtcblxuICAgIHRoaXMuJHN1Ym1lbnVzLmFkZENsYXNzKCdpbnZpc2libGUnKTtcbiAgICBpZighdGhpcy5vcHRpb25zLmF1dG9IZWlnaHQpIHtcbiAgICAgIHRoaXMuJHN1Ym1lbnVzLmFkZENsYXNzKCdkcmlsbGRvd24tc3VibWVudS1jb3Zlci1wcmV2aW91cycpO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBhIHdyYXBwZXIgb24gZWxlbWVudCBpZiBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIGlmKCF0aGlzLiRlbGVtZW50LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1kcmlsbGRvd24nKSl7XG4gICAgICB0aGlzLiR3cmFwcGVyID0gJCh0aGlzLm9wdGlvbnMud3JhcHBlcikuYWRkQ2xhc3MoJ2lzLWRyaWxsZG93bicpO1xuICAgICAgaWYodGhpcy5vcHRpb25zLmFuaW1hdGVIZWlnaHQpIHRoaXMuJHdyYXBwZXIuYWRkQ2xhc3MoJ2FuaW1hdGUtaGVpZ2h0Jyk7XG4gICAgICB0aGlzLiRlbGVtZW50LndyYXAodGhpcy4kd3JhcHBlcik7XG4gICAgfVxuICAgIC8vIHNldCB3cmFwcGVyXG4gICAgdGhpcy4kd3JhcHBlciA9IHRoaXMuJGVsZW1lbnQucGFyZW50KCk7XG4gICAgdGhpcy4kd3JhcHBlci5jc3ModGhpcy5fZ2V0TWF4RGltcygpKTtcbiAgfVxuXG4gIF9yZXNpemUoKSB7XG4gICAgdGhpcy4kd3JhcHBlci5jc3MoeydtYXgtd2lkdGgnOiAnbm9uZScsICdtaW4taGVpZ2h0JzogJ25vbmUnfSk7XG4gICAgLy8gX2dldE1heERpbXMgaGFzIHNpZGUgZWZmZWN0cyAoYm9vKSBidXQgY2FsbGluZyBpdCBzaG91bGQgdXBkYXRlIGFsbCBvdGhlciBuZWNlc3NhcnkgaGVpZ2h0cyAmIHdpZHRoc1xuICAgIHRoaXMuJHdyYXBwZXIuY3NzKHRoaXMuX2dldE1heERpbXMoKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byBlbGVtZW50cyBpbiB0aGUgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IG1lbnUgaXRlbSB0byBhZGQgaGFuZGxlcnMgdG8uXG4gICAqL1xuICBfZXZlbnRzKCRlbGVtKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICRlbGVtLm9mZignY2xpY2suemYuZHJpbGxkb3duJylcbiAgICAub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYoJChlLnRhcmdldCkucGFyZW50c1VudGlsKCd1bCcsICdsaScpLmhhc0NsYXNzKCdpcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKSl7XG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gaWYoZS50YXJnZXQgIT09IGUuY3VycmVudFRhcmdldC5maXJzdEVsZW1lbnRDaGlsZCl7XG4gICAgICAvLyAgIHJldHVybiBmYWxzZTtcbiAgICAgIC8vIH1cbiAgICAgIF90aGlzLl9zaG93KCRlbGVtLnBhcmVudCgnbGknKSk7XG5cbiAgICAgIGlmKF90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKXtcbiAgICAgICAgdmFyICRib2R5ID0gJCgnYm9keScpO1xuICAgICAgICAkYm9keS5vZmYoJy56Zi5kcmlsbGRvd24nKS5vbignY2xpY2suemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgaWYgKGUudGFyZ2V0ID09PSBfdGhpcy4kZWxlbWVudFswXSB8fCAkLmNvbnRhaW5zKF90aGlzLiRlbGVtZW50WzBdLCBlLnRhcmdldCkpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLl9oaWRlQWxsKCk7XG4gICAgICAgICAgJGJvZHkub2ZmKCcuemYuZHJpbGxkb3duJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuXHQgIHRoaXMuJGVsZW1lbnQub24oJ211dGF0ZW1lLnpmLnRyaWdnZXInLCB0aGlzLl9yZXNpemUuYmluZCh0aGlzKSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyB0byB0aGUgbWVudSBlbGVtZW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9yZWdpc3RlckV2ZW50cygpIHtcbiAgICBpZih0aGlzLm9wdGlvbnMuc2Nyb2xsVG9wKXtcbiAgICAgIHRoaXMuX2JpbmRIYW5kbGVyID0gdGhpcy5fc2Nyb2xsVG9wLmJpbmQodGhpcyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCdvcGVuLnpmLmRyaWxsZG93biBoaWRlLnpmLmRyaWxsZG93biBjbG9zZWQuemYuZHJpbGxkb3duJyx0aGlzLl9iaW5kSGFuZGxlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjcm9sbCB0byBUb3Agb2YgRWxlbWVudCBvciBkYXRhLXNjcm9sbC10b3AtZWxlbWVudFxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNzY3JvbGxtZVxuICAgKi9cbiAgX3Njcm9sbFRvcCgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciAkc2Nyb2xsVG9wRWxlbWVudCA9IF90aGlzLm9wdGlvbnMuc2Nyb2xsVG9wRWxlbWVudCE9Jyc/JChfdGhpcy5vcHRpb25zLnNjcm9sbFRvcEVsZW1lbnQpOl90aGlzLiRlbGVtZW50LFxuICAgICAgICBzY3JvbGxQb3MgPSBwYXJzZUludCgkc2Nyb2xsVG9wRWxlbWVudC5vZmZzZXQoKS50b3ArX3RoaXMub3B0aW9ucy5zY3JvbGxUb3BPZmZzZXQpO1xuICAgICQoJ2h0bWwsIGJvZHknKS5zdG9wKHRydWUpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IHNjcm9sbFBvcyB9LCBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkR1cmF0aW9uLCBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkVhc2luZyxmdW5jdGlvbigpe1xuICAgICAgLyoqXG4gICAgICAgICogRmlyZXMgYWZ0ZXIgdGhlIG1lbnUgaGFzIHNjcm9sbGVkXG4gICAgICAgICogQGV2ZW50IERyaWxsZG93biNzY3JvbGxtZVxuICAgICAgICAqL1xuICAgICAgaWYodGhpcz09PSQoJ2h0bWwnKVswXSlfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdzY3JvbGxtZS56Zi5kcmlsbGRvd24nKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGtleWRvd24gZXZlbnQgbGlzdGVuZXIgdG8gYGxpYCdzIGluIHRoZSBtZW51LlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2tleWJvYXJkRXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiRtZW51SXRlbXMuYWRkKHRoaXMuJGVsZW1lbnQuZmluZCgnLmpzLWRyaWxsZG93bi1iYWNrID4gYSwgLmlzLXN1Ym1lbnUtcGFyZW50LWl0ZW0gPiBhJykpLm9uKCdrZXlkb3duLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgICAkZWxlbWVudHMgPSAkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpLmNoaWxkcmVuKCdsaScpLmNoaWxkcmVuKCdhJyksXG4gICAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKE1hdGgubWluKGkrMSwgJGVsZW1lbnRzLmxlbmd0aC0xKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0RyaWxsZG93bicsIHtcbiAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtZW50LnBhcmVudCgnbGknKSk7XG4gICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5maW5kKCd1bCBsaSBhJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKSk7XG4gICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtZW50KSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpLmNoaWxkcmVuKCdhJykuZmlyc3QoKS5mb2N1cygpO1xuICAgICAgICAgICAgfSwgMSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkcHJldkVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgICAvLyBEb24ndCB0YXAgZm9jdXMgb24gZmlyc3QgZWxlbWVudCBpbiByb290IHVsXG4gICAgICAgICAgcmV0dXJuICEkZWxlbWVudC5pcyhfdGhpcy4kZWxlbWVudC5maW5kKCc+IGxpOmZpcnN0LWNoaWxkID4gYScpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZG93bjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJG5leHRFbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgLy8gRG9uJ3QgdGFwIGZvY3VzIG9uIGxhc3QgZWxlbWVudCBpbiByb290IHVsXG4gICAgICAgICAgcmV0dXJuICEkZWxlbWVudC5pcyhfdGhpcy4kZWxlbWVudC5maW5kKCc+IGxpOmxhc3QtY2hpbGQgPiBhJykpO1xuICAgICAgICB9LFxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gRG9uJ3QgY2xvc2Ugb24gZWxlbWVudCBpbiByb290IHVsXG4gICAgICAgICAgaWYgKCEkZWxlbWVudC5pcyhfdGhpcy4kZWxlbWVudC5maW5kKCc+IGxpID4gYScpKSkge1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW1lbnQucGFyZW50KCkucGFyZW50KCkpO1xuICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCkucGFyZW50KCkuc2libGluZ3MoJ2EnKS5mb2N1cygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCEkZWxlbWVudC5pcyhfdGhpcy4kbWVudUl0ZW1zKSkgeyAvLyBub3QgbWVudSBpdGVtIG1lYW5zIGJhY2sgYnV0dG9uXG4gICAgICAgICAgICBfdGhpcy5faGlkZSgkZWxlbWVudC5wYXJlbnQoJ2xpJykucGFyZW50KCd1bCcpKTtcbiAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgJGVsZW1lbnQucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5wYXJlbnQoJ2xpJykuY2hpbGRyZW4oJ2EnKS5maXJzdCgpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIH0sIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCRlbGVtZW50LmlzKF90aGlzLiRzdWJtZW51QW5jaG9ycykpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtZW50LnBhcmVudCgnbGknKSk7XG4gICAgICAgICAgICAkZWxlbWVudC5wYXJlbnQoJ2xpJykub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCgkZWxlbWVudCksIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICRlbGVtZW50LnBhcmVudCgnbGknKS5maW5kKCd1bCBsaSBhJykuZmlsdGVyKF90aGlzLiRtZW51SXRlbXMpLmZpcnN0KCkuZm9jdXMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbihwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgIGlmIChwcmV2ZW50RGVmYXVsdCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTsgLy8gZW5kIGtleWJvYXJkQWNjZXNzXG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIGFsbCBvcGVuIGVsZW1lbnRzLCBhbmQgcmV0dXJucyB0byByb290IG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAZmlyZXMgRHJpbGxkb3duI2Nsb3NlZFxuICAgKi9cbiAgX2hpZGVBbGwoKSB7XG4gICAgdmFyICRlbGVtID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtZHJpbGxkb3duLXN1Ym1lbnUuaXMtYWN0aXZlJykuYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKTtcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgdGhpcy4kd3JhcHBlci5jc3Moe2hlaWdodDokZWxlbS5wYXJlbnQoKS5jbG9zZXN0KCd1bCcpLmRhdGEoJ2NhbGNIZWlnaHQnKX0pO1xuICAgICRlbGVtLm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoJGVsZW0pLCBmdW5jdGlvbihlKXtcbiAgICAgICRlbGVtLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtY2xvc2luZycpO1xuICAgIH0pO1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgbWVudSBpcyBmdWxseSBjbG9zZWQuXG4gICAgICAgICAqIEBldmVudCBEcmlsbGRvd24jY2xvc2VkXG4gICAgICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2xvc2VkLnpmLmRyaWxsZG93bicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgbGlzdGVuZXIgZm9yIGVhY2ggYGJhY2tgIGJ1dHRvbiwgYW5kIGNsb3NlcyBvcGVuIG1lbnVzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIERyaWxsZG93biNiYWNrXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIHRoZSBjdXJyZW50IHN1Yi1tZW51IHRvIGFkZCBgYmFja2AgZXZlbnQuXG4gICAqL1xuICBfYmFjaygkZWxlbSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgJGVsZW0ub2ZmKCdjbGljay56Zi5kcmlsbGRvd24nKTtcbiAgICAkZWxlbS5jaGlsZHJlbignLmpzLWRyaWxsZG93bi1iYWNrJylcbiAgICAgIC5vbignY2xpY2suemYuZHJpbGxkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdtb3VzZXVwIG9uIGJhY2snKTtcbiAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGEgcGFyZW50IHN1Ym1lbnUsIGNhbGwgc2hvd1xuICAgICAgICBsZXQgcGFyZW50U3ViTWVudSA9ICRlbGVtLnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpO1xuICAgICAgICBpZiAocGFyZW50U3ViTWVudS5sZW5ndGgpIHtcbiAgICAgICAgICBfdGhpcy5fc2hvdyhwYXJlbnRTdWJNZW51KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBsaXN0ZW5lciB0byBtZW51IGl0ZW1zIHcvbyBzdWJtZW51cyB0byBjbG9zZSBvcGVuIG1lbnVzIG9uIGNsaWNrLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9tZW51TGlua0V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJG1lbnVJdGVtcy5ub3QoJy5pcy1kcmlsbGRvd24tc3VibWVudS1wYXJlbnQnKVxuICAgICAgICAub2ZmKCdjbGljay56Zi5kcmlsbGRvd24nKVxuICAgICAgICAub24oJ2NsaWNrLnpmLmRyaWxsZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIC8vIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgX3RoaXMuX2hpZGVBbGwoKTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgc3VibWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBEcmlsbGRvd24jb3BlblxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBlbGVtZW50IHdpdGggYSBzdWJtZW51IHRvIG9wZW4sIGkuZS4gdGhlIGBsaWAgdGFnLlxuICAgKi9cbiAgX3Nob3coJGVsZW0pIHtcbiAgICBpZih0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgdGhpcy4kd3JhcHBlci5jc3Moe2hlaWdodDokZWxlbS5jaGlsZHJlbignW2RhdGEtc3VibWVudV0nKS5kYXRhKCdjYWxjSGVpZ2h0Jyl9KTtcbiAgICAkZWxlbS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgdHJ1ZSk7XG4gICAgJGVsZW0uY2hpbGRyZW4oJ1tkYXRhLXN1Ym1lbnVdJykuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdpbnZpc2libGUnKS5hdHRyKCdhcmlhLWhpZGRlbicsIGZhbHNlKTtcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBzdWJtZW51IGhhcyBvcGVuZWQuXG4gICAgICogQGV2ZW50IERyaWxsZG93biNvcGVuXG4gICAgICovXG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdvcGVuLnpmLmRyaWxsZG93bicsIFskZWxlbV0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBIaWRlcyBhIHN1Ym1lbnVcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBmaXJlcyBEcmlsbGRvd24jaGlkZVxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW0gLSB0aGUgY3VycmVudCBzdWItbWVudSB0byBoaWRlLCBpLmUuIHRoZSBgdWxgIHRhZy5cbiAgICovXG4gIF9oaWRlKCRlbGVtKSB7XG4gICAgaWYodGhpcy5vcHRpb25zLmF1dG9IZWlnaHQpIHRoaXMuJHdyYXBwZXIuY3NzKHtoZWlnaHQ6JGVsZW0ucGFyZW50KCkuY2xvc2VzdCgndWwnKS5kYXRhKCdjYWxjSGVpZ2h0Jyl9KTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICRlbGVtLnBhcmVudCgnbGknKS5hdHRyKCdhcmlhLWV4cGFuZGVkJywgZmFsc2UpO1xuICAgICRlbGVtLmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSkuYWRkQ2xhc3MoJ2lzLWNsb3NpbmcnKVxuICAgICRlbGVtLmFkZENsYXNzKCdpcy1jbG9zaW5nJylcbiAgICAgICAgIC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKCRlbGVtKSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgJGVsZW0ucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZSBpcy1jbG9zaW5nJyk7XG4gICAgICAgICAgICRlbGVtLmJsdXIoKS5hZGRDbGFzcygnaW52aXNpYmxlJyk7XG4gICAgICAgICB9KTtcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBzdWJtZW51IGhhcyBjbG9zZWQuXG4gICAgICogQGV2ZW50IERyaWxsZG93biNoaWRlXG4gICAgICovXG4gICAgJGVsZW0udHJpZ2dlcignaGlkZS56Zi5kcmlsbGRvd24nLCBbJGVsZW1dKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJdGVyYXRlcyB0aHJvdWdoIHRoZSBuZXN0ZWQgbWVudXMgdG8gY2FsY3VsYXRlIHRoZSBtaW4taGVpZ2h0LCBhbmQgbWF4LXdpZHRoIGZvciB0aGUgbWVudS5cbiAgICogUHJldmVudHMgY29udGVudCBqdW1waW5nLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9nZXRNYXhEaW1zKCkge1xuICAgIHZhciAgbWF4SGVpZ2h0ID0gMCwgcmVzdWx0ID0ge30sIF90aGlzID0gdGhpcztcbiAgICB0aGlzLiRzdWJtZW51cy5hZGQodGhpcy4kZWxlbWVudCkuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyIG51bU9mRWxlbXMgPSAkKHRoaXMpLmNoaWxkcmVuKCdsaScpLmxlbmd0aDtcbiAgICAgIHZhciBoZWlnaHQgPSBGb3VuZGF0aW9uLkJveC5HZXREaW1lbnNpb25zKHRoaXMpLmhlaWdodDtcbiAgICAgIG1heEhlaWdodCA9IGhlaWdodCA+IG1heEhlaWdodCA/IGhlaWdodCA6IG1heEhlaWdodDtcbiAgICAgIGlmKF90aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkge1xuICAgICAgICAkKHRoaXMpLmRhdGEoJ2NhbGNIZWlnaHQnLGhlaWdodCk7XG4gICAgICAgIGlmICghJCh0aGlzKS5oYXNDbGFzcygnaXMtZHJpbGxkb3duLXN1Ym1lbnUnKSkgcmVzdWx0WydoZWlnaHQnXSA9IGhlaWdodDtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmKCF0aGlzLm9wdGlvbnMuYXV0b0hlaWdodCkgcmVzdWx0WydtaW4taGVpZ2h0J10gPSBgJHttYXhIZWlnaHR9cHhgO1xuXG4gICAgcmVzdWx0WydtYXgtd2lkdGgnXSA9IGAke3RoaXMuJGVsZW1lbnRbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGh9cHhgO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgRHJpbGxkb3duIE1lbnVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIGlmKHRoaXMub3B0aW9ucy5zY3JvbGxUb3ApIHRoaXMuJGVsZW1lbnQub2ZmKCcuemYuZHJpbGxkb3duJyx0aGlzLl9iaW5kSGFuZGxlcik7XG4gICAgdGhpcy5faGlkZUFsbCgpO1xuXHQgIHRoaXMuJGVsZW1lbnQub2ZmKCdtdXRhdGVtZS56Zi50cmlnZ2VyJyk7XG4gICAgRm91bmRhdGlvbi5OZXN0LkJ1cm4odGhpcy4kZWxlbWVudCwgJ2RyaWxsZG93bicpO1xuICAgIHRoaXMuJGVsZW1lbnQudW53cmFwKClcbiAgICAgICAgICAgICAgICAgLmZpbmQoJy5qcy1kcmlsbGRvd24tYmFjaywgLmlzLXN1Ym1lbnUtcGFyZW50LWl0ZW0nKS5yZW1vdmUoKVxuICAgICAgICAgICAgICAgICAuZW5kKCkuZmluZCgnLmlzLWFjdGl2ZSwgLmlzLWNsb3NpbmcsIC5pcy1kcmlsbGRvd24tc3VibWVudScpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUgaXMtY2xvc2luZyBpcy1kcmlsbGRvd24tc3VibWVudScpXG4gICAgICAgICAgICAgICAgIC5lbmQoKS5maW5kKCdbZGF0YS1zdWJtZW51XScpLnJlbW92ZUF0dHIoJ2FyaWEtaGlkZGVuIHRhYmluZGV4IHJvbGUnKTtcbiAgICB0aGlzLiRzdWJtZW51QW5jaG9ycy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS5vZmYoJy56Zi5kcmlsbGRvd24nKTtcbiAgICB9KTtcblxuICAgIHRoaXMuJHN1Ym1lbnVzLnJlbW92ZUNsYXNzKCdkcmlsbGRvd24tc3VibWVudS1jb3Zlci1wcmV2aW91cycpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdhJykuZWFjaChmdW5jdGlvbigpe1xuICAgICAgdmFyICRsaW5rID0gJCh0aGlzKTtcbiAgICAgICRsaW5rLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgICBpZigkbGluay5kYXRhKCdzYXZlZEhyZWYnKSl7XG4gICAgICAgICRsaW5rLmF0dHIoJ2hyZWYnLCAkbGluay5kYXRhKCdzYXZlZEhyZWYnKSkucmVtb3ZlRGF0YSgnc2F2ZWRIcmVmJyk7XG4gICAgICB9ZWxzZXsgcmV0dXJuOyB9XG4gICAgfSk7XG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9O1xufVxuXG5EcmlsbGRvd24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBNYXJrdXAgdXNlZCBmb3IgSlMgZ2VuZXJhdGVkIGJhY2sgYnV0dG9uLiBQcmVwZW5kZWQgIG9yIGFwcGVuZGVkIChzZWUgYmFja0J1dHRvblBvc2l0aW9uKSB0byBzdWJtZW51IGxpc3RzIGFuZCBkZWxldGVkIG9uIGBkZXN0cm95YCBtZXRob2QsICdqcy1kcmlsbGRvd24tYmFjaycgY2xhc3MgcmVxdWlyZWQuIFJlbW92ZSB0aGUgYmFja3NsYXNoIChgXFxgKSBpZiBjb3B5IGFuZCBwYXN0aW5nLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICc8bGkgY2xhc3M9XCJqcy1kcmlsbGRvd24tYmFja1wiPjxhIHRhYmluZGV4PVwiMFwiPkJhY2s8L2E+PC9saT4nXG4gICAqL1xuICBiYWNrQnV0dG9uOiAnPGxpIGNsYXNzPVwianMtZHJpbGxkb3duLWJhY2tcIj48YSB0YWJpbmRleD1cIjBcIj5CYWNrPC9hPjwvbGk+JyxcbiAgLyoqXG4gICAqIFBvc2l0aW9uIHRoZSBiYWNrIGJ1dHRvbiBlaXRoZXIgYXQgdGhlIHRvcCBvciBib3R0b20gb2YgZHJpbGxkb3duIHN1Ym1lbnVzLiBDYW4gYmUgYCdsZWZ0J2Agb3IgYCdib3R0b20nYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCB0b3BcbiAgICovXG4gIGJhY2tCdXR0b25Qb3NpdGlvbjogJ3RvcCcsXG4gIC8qKlxuICAgKiBNYXJrdXAgdXNlZCB0byB3cmFwIGRyaWxsZG93biBtZW51LiBVc2UgYSBjbGFzcyBuYW1lIGZvciBpbmRlcGVuZGVudCBzdHlsaW5nOyB0aGUgSlMgYXBwbGllZCBjbGFzczogYGlzLWRyaWxsZG93bmAgaXMgcmVxdWlyZWQuIFJlbW92ZSB0aGUgYmFja3NsYXNoIChgXFxgKSBpZiBjb3B5IGFuZCBwYXN0aW5nLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICc8ZGl2PjwvZGl2PidcbiAgICovXG4gIHdyYXBwZXI6ICc8ZGl2PjwvZGl2PicsXG4gIC8qKlxuICAgKiBBZGRzIHRoZSBwYXJlbnQgbGluayB0byB0aGUgc3VibWVudS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHBhcmVudExpbms6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3cgdGhlIG1lbnUgdG8gcmV0dXJuIHRvIHJvb3QgbGlzdCBvbiBib2R5IGNsaWNrLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgY2xvc2VPbkNsaWNrOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBtZW51IHRvIGF1dG8gYWRqdXN0IGhlaWdodC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9IZWlnaHQ6IGZhbHNlLFxuICAvKipcbiAgICogQW5pbWF0ZSB0aGUgYXV0byBhZGp1c3QgaGVpZ2h0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYW5pbWF0ZUhlaWdodDogZmFsc2UsXG4gIC8qKlxuICAgKiBTY3JvbGwgdG8gdGhlIHRvcCBvZiB0aGUgbWVudSBhZnRlciBvcGVuaW5nIGEgc3VibWVudSBvciBuYXZpZ2F0aW5nIGJhY2sgdXNpbmcgdGhlIG1lbnUgYmFjayBidXR0b25cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHNjcm9sbFRvcDogZmFsc2UsXG4gIC8qKlxuICAgKiBTdHJpbmcganF1ZXJ5IHNlbGVjdG9yIChmb3IgZXhhbXBsZSAnYm9keScpIG9mIGVsZW1lbnQgdG8gdGFrZSBvZmZzZXQoKS50b3AgZnJvbSwgaWYgZW1wdHkgc3RyaW5nIHRoZSBkcmlsbGRvd24gbWVudSBvZmZzZXQoKS50b3AgaXMgdGFrZW5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnJ1xuICAgKi9cbiAgc2Nyb2xsVG9wRWxlbWVudDogJycsXG4gIC8qKlxuICAgKiBTY3JvbGxUb3Agb2Zmc2V0XG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMFxuICAgKi9cbiAgc2Nyb2xsVG9wT2Zmc2V0OiAwLFxuICAvKipcbiAgICogU2Nyb2xsIGFuaW1hdGlvbiBkdXJhdGlvblxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDUwMFxuICAgKi9cbiAgYW5pbWF0aW9uRHVyYXRpb246IDUwMCxcbiAgLyoqXG4gICAqIFNjcm9sbCBhbmltYXRpb24gZWFzaW5nLiBDYW4gYmUgYCdzd2luZydgIG9yIGAnbGluZWFyJ2AuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9hbmltYXRlfEpRdWVyeSBhbmltYXRlfVxuICAgKiBAZGVmYXVsdCAnc3dpbmcnXG4gICAqL1xuICBhbmltYXRpb25FYXNpbmc6ICdzd2luZydcbiAgLy8gaG9sZE9wZW46IGZhbHNlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oRHJpbGxkb3duLCAnRHJpbGxkb3duJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBEcm9wZG93bk1lbnUgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmRyb3Bkb3duLW1lbnVcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwuYm94XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm5lc3RcbiAqL1xuXG5jbGFzcyBEcm9wZG93bk1lbnUge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBEcm9wZG93bk1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgRHJvcGRvd25NZW51I2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhIGRyb3Bkb3duIG1lbnUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgRHJvcGRvd25NZW51LmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICBGb3VuZGF0aW9uLk5lc3QuRmVhdGhlcih0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdEcm9wZG93bk1lbnUnKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdEcm9wZG93bk1lbnUnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAndXAnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnZG93bicsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cycsXG4gICAgICAnRVNDQVBFJzogJ2Nsb3NlJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBwbHVnaW4sIGFuZCBjYWxscyBfcHJlcGFyZU1lbnVcbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgc3VicyA9IHRoaXMuJGVsZW1lbnQuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICB0aGlzLiRlbGVtZW50LmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5jaGlsZHJlbignLmlzLWRyb3Bkb3duLXN1Ym1lbnUnKS5hZGRDbGFzcygnZmlyc3Qtc3ViJyk7XG5cbiAgICB0aGlzLiRtZW51SXRlbXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tyb2xlPVwibWVudWl0ZW1cIl0nKTtcbiAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW3JvbGU9XCJtZW51aXRlbVwiXScpO1xuICAgIHRoaXMuJHRhYnMuZmluZCgndWwuaXMtZHJvcGRvd24tc3VibWVudScpLmFkZENsYXNzKHRoaXMub3B0aW9ucy52ZXJ0aWNhbENsYXNzKTtcblxuICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKHRoaXMub3B0aW9ucy5yaWdodENsYXNzKSB8fCB0aGlzLm9wdGlvbnMuYWxpZ25tZW50ID09PSAncmlnaHQnIHx8IEZvdW5kYXRpb24ucnRsKCkgfHwgdGhpcy4kZWxlbWVudC5wYXJlbnRzKCcudG9wLWJhci1yaWdodCcpLmlzKCcqJykpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPSAncmlnaHQnO1xuICAgICAgc3Vicy5hZGRDbGFzcygnb3BlbnMtbGVmdCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJzLmFkZENsYXNzKCdvcGVucy1yaWdodCcpO1xuICAgIH1cbiAgICB0aGlzLmNoYW5nZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfTtcblxuICBfaXNWZXJ0aWNhbCgpIHtcbiAgICByZXR1cm4gdGhpcy4kdGFicy5jc3MoJ2Rpc3BsYXknKSA9PT0gJ2Jsb2NrJztcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGxpc3RlbmVycyB0byBlbGVtZW50cyB3aXRoaW4gdGhlIG1lbnVcbiAgICogQHByaXZhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgIGhhc1RvdWNoID0gJ29udG91Y2hzdGFydCcgaW4gd2luZG93IHx8ICh0eXBlb2Ygd2luZG93Lm9udG91Y2hzdGFydCAhPT0gJ3VuZGVmaW5lZCcpLFxuICAgICAgICBwYXJDbGFzcyA9ICdpcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCc7XG5cbiAgICAvLyB1c2VkIGZvciBvbkNsaWNrIGFuZCBpbiB0aGUga2V5Ym9hcmQgaGFuZGxlcnNcbiAgICB2YXIgaGFuZGxlQ2xpY2tGbiA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciAkZWxlbSA9ICQoZS50YXJnZXQpLnBhcmVudHNVbnRpbCgndWwnLCBgLiR7cGFyQ2xhc3N9YCksXG4gICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpLFxuICAgICAgICAgIGhhc0NsaWNrZWQgPSAkZWxlbS5hdHRyKCdkYXRhLWlzLWNsaWNrJykgPT09ICd0cnVlJyxcbiAgICAgICAgICAkc3ViID0gJGVsZW0uY2hpbGRyZW4oJy5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG5cbiAgICAgIGlmIChoYXNTdWIpIHtcbiAgICAgICAgaWYgKGhhc0NsaWNrZWQpIHtcbiAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrIHx8ICghX3RoaXMub3B0aW9ucy5jbGlja09wZW4gJiYgIWhhc1RvdWNoKSB8fCAoX3RoaXMub3B0aW9ucy5mb3JjZUZvbGxvdyAmJiBoYXNUb3VjaCkpIHsgcmV0dXJuOyB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBfdGhpcy5fc2hvdygkc3ViKTtcbiAgICAgICAgICAkZWxlbS5hZGQoJGVsZW0ucGFyZW50c1VudGlsKF90aGlzLiRlbGVtZW50LCBgLiR7cGFyQ2xhc3N9YCkpLmF0dHIoJ2RhdGEtaXMtY2xpY2snLCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsaWNrT3BlbiB8fCBoYXNUb3VjaCkge1xuICAgICAgdGhpcy4kbWVudUl0ZW1zLm9uKCdjbGljay56Zi5kcm9wZG93bm1lbnUgdG91Y2hzdGFydC56Zi5kcm9wZG93bm1lbnUnLCBoYW5kbGVDbGlja0ZuKTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgTGVhZiBlbGVtZW50IENsaWNrc1xuICAgIGlmKF90aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrSW5zaWRlKXtcbiAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignY2xpY2suemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuICAgICAgICBpZighaGFzU3ViKXtcbiAgICAgICAgICBfdGhpcy5faGlkZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMub3B0aW9ucy5kaXNhYmxlSG92ZXIpIHtcbiAgICAgIHRoaXMuJG1lbnVJdGVtcy5vbignbW91c2VlbnRlci56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgICBoYXNTdWIgPSAkZWxlbS5oYXNDbGFzcyhwYXJDbGFzcyk7XG5cbiAgICAgICAgaWYgKGhhc1N1Yikge1xuICAgICAgICAgIGNsZWFyVGltZW91dCgkZWxlbS5kYXRhKCdfZGVsYXknKSk7XG4gICAgICAgICAgJGVsZW0uZGF0YSgnX2RlbGF5Jywgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIF90aGlzLl9zaG93KCRlbGVtLmNoaWxkcmVuKCcuaXMtZHJvcGRvd24tc3VibWVudScpKTtcbiAgICAgICAgICB9LCBfdGhpcy5vcHRpb25zLmhvdmVyRGVsYXkpKTtcbiAgICAgICAgfVxuICAgICAgfSkub24oJ21vdXNlbGVhdmUuemYuZHJvcGRvd25tZW51JywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICAgaGFzU3ViID0gJGVsZW0uaGFzQ2xhc3MocGFyQ2xhc3MpO1xuICAgICAgICBpZiAoaGFzU3ViICYmIF90aGlzLm9wdGlvbnMuYXV0b2Nsb3NlKSB7XG4gICAgICAgICAgaWYgKCRlbGVtLmF0dHIoJ2RhdGEtaXMtY2xpY2snKSA9PT0gJ3RydWUnICYmIF90aGlzLm9wdGlvbnMuY2xpY2tPcGVuKSB7IHJldHVybiBmYWxzZTsgfVxuXG4gICAgICAgICAgY2xlYXJUaW1lb3V0KCRlbGVtLmRhdGEoJ19kZWxheScpKTtcbiAgICAgICAgICAkZWxlbS5kYXRhKCdfZGVsYXknLCBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMuX2hpZGUoJGVsZW0pO1xuICAgICAgICAgIH0sIF90aGlzLm9wdGlvbnMuY2xvc2luZ1RpbWUpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHRoaXMuJG1lbnVJdGVtcy5vbigna2V5ZG93bi56Zi5kcm9wZG93bm1lbnUnLCBmdW5jdGlvbihlKSB7XG4gICAgICB2YXIgJGVsZW1lbnQgPSAkKGUudGFyZ2V0KS5wYXJlbnRzVW50aWwoJ3VsJywgJ1tyb2xlPVwibWVudWl0ZW1cIl0nKSxcbiAgICAgICAgICBpc1RhYiA9IF90aGlzLiR0YWJzLmluZGV4KCRlbGVtZW50KSA+IC0xLFxuICAgICAgICAgICRlbGVtZW50cyA9IGlzVGFiID8gX3RoaXMuJHRhYnMgOiAkZWxlbWVudC5zaWJsaW5ncygnbGknKS5hZGQoJGVsZW1lbnQpLFxuICAgICAgICAgICRwcmV2RWxlbWVudCxcbiAgICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgJHByZXZFbGVtZW50ID0gJGVsZW1lbnRzLmVxKGktMSk7XG4gICAgICAgICAgJG5leHRFbGVtZW50ID0gJGVsZW1lbnRzLmVxKGkrMSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdmFyIG5leHRTaWJsaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghJGVsZW1lbnQuaXMoJzpsYXN0LWNoaWxkJykpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuY2hpbGRyZW4oJ2E6Zmlyc3QnKS5mb2N1cygpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfSwgcHJldlNpYmxpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHByZXZFbGVtZW50LmNoaWxkcmVuKCdhOmZpcnN0JykuZm9jdXMoKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgfSwgb3BlblN1YiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJHN1YiA9ICRlbGVtZW50LmNoaWxkcmVuKCd1bC5pcy1kcm9wZG93bi1zdWJtZW51Jyk7XG4gICAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAgIF90aGlzLl9zaG93KCRzdWIpO1xuICAgICAgICAgICRlbGVtZW50LmZpbmQoJ2xpID4gYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9IGVsc2UgeyByZXR1cm47IH1cbiAgICAgIH0sIGNsb3NlU3ViID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vaWYgKCRlbGVtZW50LmlzKCc6Zmlyc3QtY2hpbGQnKSkge1xuICAgICAgICB2YXIgY2xvc2UgPSAkZWxlbWVudC5wYXJlbnQoJ3VsJykucGFyZW50KCdsaScpO1xuICAgICAgICBjbG9zZS5jaGlsZHJlbignYTpmaXJzdCcpLmZvY3VzKCk7XG4gICAgICAgIF90aGlzLl9oaWRlKGNsb3NlKTtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvL31cbiAgICAgIH07XG4gICAgICB2YXIgZnVuY3Rpb25zID0ge1xuICAgICAgICBvcGVuOiBvcGVuU3ViLFxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgX3RoaXMuX2hpZGUoX3RoaXMuJGVsZW1lbnQpO1xuICAgICAgICAgIF90aGlzLiRtZW51SXRlbXMuZmluZCgnYTpmaXJzdCcpLmZvY3VzKCk7IC8vIGZvY3VzIHRvIGZpcnN0IGVsZW1lbnRcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0sXG4gICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChpc1RhYikge1xuICAgICAgICBpZiAoX3RoaXMuX2lzVmVydGljYWwoKSkgeyAvLyB2ZXJ0aWNhbCBtZW51XG4gICAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIHsgLy8gcmlnaHQgYWxpZ25lZFxuICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgIGRvd246IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICB1cDogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgICBwcmV2aW91czogb3BlblN1YlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHsgLy8gbGVmdCBhbGlnbmVkXG4gICAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgICAgZG93bjogbmV4dFNpYmxpbmcsXG4gICAgICAgICAgICAgIHVwOiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgbmV4dDogb3BlblN1YixcbiAgICAgICAgICAgICAgcHJldmlvdXM6IGNsb3NlU3ViXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7IC8vIGhvcml6b250YWwgbWVudVxuICAgICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSB7IC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAgICQuZXh0ZW5kKGZ1bmN0aW9ucywge1xuICAgICAgICAgICAgICBuZXh0OiBwcmV2U2libGluZyxcbiAgICAgICAgICAgICAgcHJldmlvdXM6IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICBkb3duOiBvcGVuU3ViLFxuICAgICAgICAgICAgICB1cDogY2xvc2VTdWJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7IC8vIGxlZnQgYWxpZ25lZFxuICAgICAgICAgICAgJC5leHRlbmQoZnVuY3Rpb25zLCB7XG4gICAgICAgICAgICAgIG5leHQ6IG5leHRTaWJsaW5nLFxuICAgICAgICAgICAgICBwcmV2aW91czogcHJldlNpYmxpbmcsXG4gICAgICAgICAgICAgIGRvd246IG9wZW5TdWIsXG4gICAgICAgICAgICAgIHVwOiBjbG9zZVN1YlxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyBub3QgdGFicyAtPiBvbmUgc3ViXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSB7IC8vIHJpZ2h0IGFsaWduZWRcbiAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgIG5leHQ6IGNsb3NlU3ViLFxuICAgICAgICAgICAgcHJldmlvdXM6IG9wZW5TdWIsXG4gICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgeyAvLyBsZWZ0IGFsaWduZWRcbiAgICAgICAgICAkLmV4dGVuZChmdW5jdGlvbnMsIHtcbiAgICAgICAgICAgIG5leHQ6IG9wZW5TdWIsXG4gICAgICAgICAgICBwcmV2aW91czogY2xvc2VTdWIsXG4gICAgICAgICAgICBkb3duOiBuZXh0U2libGluZyxcbiAgICAgICAgICAgIHVwOiBwcmV2U2libGluZ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnRHJvcGRvd25NZW51JywgZnVuY3Rpb25zKTtcblxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYW4gZXZlbnQgaGFuZGxlciB0byB0aGUgYm9keSB0byBjbG9zZSBhbnkgZHJvcGRvd25zIG9uIGEgY2xpY2suXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZEJvZHlIYW5kbGVyKCkge1xuICAgIHZhciAkYm9keSA9ICQoZG9jdW1lbnQuYm9keSksXG4gICAgICAgIF90aGlzID0gdGhpcztcbiAgICAkYm9keS5vZmYoJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScpXG4gICAgICAgICAub24oJ21vdXNldXAuemYuZHJvcGRvd25tZW51IHRvdWNoZW5kLnpmLmRyb3Bkb3dubWVudScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgdmFyICRsaW5rID0gX3RoaXMuJGVsZW1lbnQuZmluZChlLnRhcmdldCk7XG4gICAgICAgICAgIGlmICgkbGluay5sZW5ndGgpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgICAgX3RoaXMuX2hpZGUoKTtcbiAgICAgICAgICAgJGJvZHkub2ZmKCdtb3VzZXVwLnpmLmRyb3Bkb3dubWVudSB0b3VjaGVuZC56Zi5kcm9wZG93bm1lbnUnKTtcbiAgICAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIGEgZHJvcGRvd24gcGFuZSwgYW5kIGNoZWNrcyBmb3IgY29sbGlzaW9ucyBmaXJzdC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICRzdWIgLSB1bCBlbGVtZW50IHRoYXQgaXMgYSBzdWJtZW51IHRvIHNob3dcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBmaXJlcyBEcm9wZG93bk1lbnUjc2hvd1xuICAgKi9cbiAgX3Nob3coJHN1Yikge1xuICAgIHZhciBpZHggPSB0aGlzLiR0YWJzLmluZGV4KHRoaXMuJHRhYnMuZmlsdGVyKGZ1bmN0aW9uKGksIGVsKSB7XG4gICAgICByZXR1cm4gJChlbCkuZmluZCgkc3ViKS5sZW5ndGggPiAwO1xuICAgIH0pKTtcbiAgICB2YXIgJHNpYnMgPSAkc3ViLnBhcmVudCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5zaWJsaW5ncygnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKTtcbiAgICB0aGlzLl9oaWRlKCRzaWJzLCBpZHgpO1xuICAgICRzdWIuY3NzKCd2aXNpYmlsaXR5JywgJ2hpZGRlbicpLmFkZENsYXNzKCdqcy1kcm9wZG93bi1hY3RpdmUnKVxuICAgICAgICAucGFyZW50KCdsaS5pcy1kcm9wZG93bi1zdWJtZW51LXBhcmVudCcpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICB2YXIgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgIGlmICghY2xlYXIpIHtcbiAgICAgIHZhciBvbGRDbGFzcyA9IHRoaXMub3B0aW9ucy5hbGlnbm1lbnQgPT09ICdsZWZ0JyA/ICctcmlnaHQnIDogJy1sZWZ0JyxcbiAgICAgICAgICAkcGFyZW50TGkgPSAkc3ViLnBhcmVudCgnLmlzLWRyb3Bkb3duLXN1Ym1lbnUtcGFyZW50Jyk7XG4gICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoYG9wZW5zJHtvbGRDbGFzc31gKS5hZGRDbGFzcyhgb3BlbnMtJHt0aGlzLm9wdGlvbnMuYWxpZ25tZW50fWApO1xuICAgICAgY2xlYXIgPSBGb3VuZGF0aW9uLkJveC5JbU5vdFRvdWNoaW5nWW91KCRzdWIsIG51bGwsIHRydWUpO1xuICAgICAgaWYgKCFjbGVhcikge1xuICAgICAgICAkcGFyZW50TGkucmVtb3ZlQ2xhc3MoYG9wZW5zLSR7dGhpcy5vcHRpb25zLmFsaWdubWVudH1gKS5hZGRDbGFzcygnb3BlbnMtaW5uZXInKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hhbmdlZCA9IHRydWU7XG4gICAgfVxuICAgICRzdWIuY3NzKCd2aXNpYmlsaXR5JywgJycpO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrKSB7IHRoaXMuX2FkZEJvZHlIYW5kbGVyKCk7IH1cbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIHRoZSBuZXcgZHJvcGRvd24gcGFuZSBpcyB2aXNpYmxlLlxuICAgICAqIEBldmVudCBEcm9wZG93bk1lbnUjc2hvd1xuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignc2hvdy56Zi5kcm9wZG93bm1lbnUnLCBbJHN1Yl0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhpZGVzIGEgc2luZ2xlLCBjdXJyZW50bHkgb3BlbiBkcm9wZG93biBwYW5lLCBpZiBwYXNzZWQgYSBwYXJhbWV0ZXIsIG90aGVyd2lzZSwgaGlkZXMgZXZlcnl0aGluZy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbSAtIGVsZW1lbnQgd2l0aCBhIHN1Ym1lbnUgdG8gaGlkZVxuICAgKiBAcGFyYW0ge051bWJlcn0gaWR4IC0gaW5kZXggb2YgdGhlICR0YWJzIGNvbGxlY3Rpb24gdG8gaGlkZVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2hpZGUoJGVsZW0sIGlkeCkge1xuICAgIHZhciAkdG9DbG9zZTtcbiAgICBpZiAoJGVsZW0gJiYgJGVsZW0ubGVuZ3RoKSB7XG4gICAgICAkdG9DbG9zZSA9ICRlbGVtO1xuICAgIH0gZWxzZSBpZiAoaWR4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICR0b0Nsb3NlID0gdGhpcy4kdGFicy5ub3QoZnVuY3Rpb24oaSwgZWwpIHtcbiAgICAgICAgcmV0dXJuIGkgPT09IGlkeDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICR0b0Nsb3NlID0gdGhpcy4kZWxlbWVudDtcbiAgICB9XG4gICAgdmFyIHNvbWV0aGluZ1RvQ2xvc2UgPSAkdG9DbG9zZS5oYXNDbGFzcygnaXMtYWN0aXZlJykgfHwgJHRvQ2xvc2UuZmluZCgnLmlzLWFjdGl2ZScpLmxlbmd0aCA+IDA7XG5cbiAgICBpZiAoc29tZXRoaW5nVG9DbG9zZSkge1xuICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtYWN0aXZlJykuYWRkKCR0b0Nsb3NlKS5hdHRyKHtcbiAgICAgICAgJ2RhdGEtaXMtY2xpY2snOiBmYWxzZVxuICAgICAgfSkucmVtb3ZlQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgICAkdG9DbG9zZS5maW5kKCd1bC5qcy1kcm9wZG93bi1hY3RpdmUnKS5yZW1vdmVDbGFzcygnanMtZHJvcGRvd24tYWN0aXZlJyk7XG5cbiAgICAgIGlmICh0aGlzLmNoYW5nZWQgfHwgJHRvQ2xvc2UuZmluZCgnb3BlbnMtaW5uZXInKS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIG9sZENsYXNzID0gdGhpcy5vcHRpb25zLmFsaWdubWVudCA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgICAgICAgJHRvQ2xvc2UuZmluZCgnbGkuaXMtZHJvcGRvd24tc3VibWVudS1wYXJlbnQnKS5hZGQoJHRvQ2xvc2UpXG4gICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKGBvcGVucy1pbm5lciBvcGVucy0ke3RoaXMub3B0aW9ucy5hbGlnbm1lbnR9YClcbiAgICAgICAgICAgICAgICAuYWRkQ2xhc3MoYG9wZW5zLSR7b2xkQ2xhc3N9YCk7XG4gICAgICAgIHRoaXMuY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSBvcGVuIG1lbnVzIGFyZSBjbG9zZWQuXG4gICAgICAgKiBAZXZlbnQgRHJvcGRvd25NZW51I2hpZGVcbiAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdoaWRlLnpmLmRyb3Bkb3dubWVudScsIFskdG9DbG9zZV0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyB0aGUgcGx1Z2luLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kbWVudUl0ZW1zLm9mZignLnpmLmRyb3Bkb3dubWVudScpLnJlbW92ZUF0dHIoJ2RhdGEtaXMtY2xpY2snKVxuICAgICAgICAucmVtb3ZlQ2xhc3MoJ2lzLXJpZ2h0LWFycm93IGlzLWxlZnQtYXJyb3cgaXMtZG93bi1hcnJvdyBvcGVucy1yaWdodCBvcGVucy1sZWZ0IG9wZW5zLWlubmVyJyk7XG4gICAgJChkb2N1bWVudC5ib2R5KS5vZmYoJy56Zi5kcm9wZG93bm1lbnUnKTtcbiAgICBGb3VuZGF0aW9uLk5lc3QuQnVybih0aGlzLiRlbGVtZW50LCAnZHJvcGRvd24nKTtcbiAgICBGb3VuZGF0aW9uLnVucmVnaXN0ZXJQbHVnaW4odGhpcyk7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAqL1xuRHJvcGRvd25NZW51LmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogRGlzYWxsb3dzIGhvdmVyIGV2ZW50cyBmcm9tIG9wZW5pbmcgc3VibWVudXNcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRpc2FibGVIb3ZlcjogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvdyBhIHN1Ym1lbnUgdG8gYXV0b21hdGljYWxseSBjbG9zZSBvbiBhIG1vdXNlbGVhdmUgZXZlbnQsIGlmIG5vdCBjbGlja2VkIG9wZW4uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGF1dG9jbG9zZTogdHJ1ZSxcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IG9wZW5pbmcgYSBzdWJtZW51IG9uIGhvdmVyIGV2ZW50LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDUwXG4gICAqL1xuICBob3ZlckRlbGF5OiA1MCxcbiAgLyoqXG4gICAqIEFsbG93IGEgc3VibWVudSB0byBvcGVuL3JlbWFpbiBvcGVuIG9uIHBhcmVudCBjbGljayBldmVudC4gQWxsb3dzIGN1cnNvciB0byBtb3ZlIGF3YXkgZnJvbSBtZW51LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgY2xpY2tPcGVuOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGRlbGF5IGNsb3NpbmcgYSBzdWJtZW51IG9uIGEgbW91c2VsZWF2ZSBldmVudC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCA1MDBcbiAgICovXG5cbiAgY2xvc2luZ1RpbWU6IDUwMCxcbiAgLyoqXG4gICAqIFBvc2l0aW9uIG9mIHRoZSBtZW51IHJlbGF0aXZlIHRvIHdoYXQgZGlyZWN0aW9uIHRoZSBzdWJtZW51cyBzaG91bGQgb3Blbi4gSGFuZGxlZCBieSBKUy4gQ2FuIGJlIGAnbGVmdCdgIG9yIGAncmlnaHQnYC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnbGVmdCdcbiAgICovXG4gIGFsaWdubWVudDogJ2xlZnQnLFxuICAvKipcbiAgICogQWxsb3cgY2xpY2tzIG9uIHRoZSBib2R5IHRvIGNsb3NlIGFueSBvcGVuIHN1Ym1lbnVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBjbG9zZU9uQ2xpY2s6IHRydWUsXG4gIC8qKlxuICAgKiBBbGxvdyBjbGlja3Mgb24gbGVhZiBhbmNob3IgbGlua3MgdG8gY2xvc2UgYW55IG9wZW4gc3VibWVudXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNsb3NlT25DbGlja0luc2lkZTogdHJ1ZSxcbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdmVydGljYWwgb3JpZW50ZWQgbWVudXMsIEZvdW5kYXRpb24gZGVmYXVsdCBpcyBgdmVydGljYWxgLiBVcGRhdGUgdGhpcyBpZiB1c2luZyB5b3VyIG93biBjbGFzcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAndmVydGljYWwnXG4gICAqL1xuICB2ZXJ0aWNhbENsYXNzOiAndmVydGljYWwnLFxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byByaWdodC1zaWRlIG9yaWVudGVkIG1lbnVzLCBGb3VuZGF0aW9uIGRlZmF1bHQgaXMgYGFsaWduLXJpZ2h0YC4gVXBkYXRlIHRoaXMgaWYgdXNpbmcgeW91ciBvd24gY2xhc3MuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2FsaWduLXJpZ2h0J1xuICAgKi9cbiAgcmlnaHRDbGFzczogJ2FsaWduLXJpZ2h0JyxcbiAgLyoqXG4gICAqIEJvb2xlYW4gdG8gZm9yY2Ugb3ZlcmlkZSB0aGUgY2xpY2tpbmcgb2YgbGlua3MgdG8gcGVyZm9ybSBkZWZhdWx0IGFjdGlvbiwgb24gc2Vjb25kIHRvdWNoIGV2ZW50IGZvciBtb2JpbGUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGZvcmNlRm9sbG93OiB0cnVlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oRHJvcGRvd25NZW51LCAnRHJvcGRvd25NZW51Jyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBPZmZDYW52YXMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm9mZmNhbnZhc1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tZWRpYVF1ZXJ5XG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLnRyaWdnZXJzXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1vdGlvblxuICovXG5cbmNsYXNzIE9mZkNhbnZhcyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIGFuIG9mZi1jYW52YXMgd3JhcHBlci5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gaW5pdGlhbGl6ZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBPZmZDYW52YXMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcbiAgICB0aGlzLiRsYXN0VHJpZ2dlciA9ICQoKTtcbiAgICB0aGlzLiR0cmlnZ2VycyA9ICQoKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLl9ldmVudHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ09mZkNhbnZhcycpXG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignT2ZmQ2FudmFzJywge1xuICAgICAgJ0VTQ0FQRSc6ICdjbG9zZSdcbiAgICB9KTtcblxuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYnkgYWRkaW5nIHRoZSBleGl0IG92ZXJsYXkgKGlmIG5lZWRlZCkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIGlkID0gdGhpcy4kZWxlbWVudC5hdHRyKCdpZCcpO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmFkZENsYXNzKGBpcy10cmFuc2l0aW9uLSR7dGhpcy5vcHRpb25zLnRyYW5zaXRpb259YCk7XG5cbiAgICAvLyBGaW5kIHRyaWdnZXJzIHRoYXQgYWZmZWN0IHRoaXMgZWxlbWVudCBhbmQgYWRkIGFyaWEtZXhwYW5kZWQgdG8gdGhlbVxuICAgIHRoaXMuJHRyaWdnZXJzID0gJChkb2N1bWVudClcbiAgICAgIC5maW5kKCdbZGF0YS1vcGVuPVwiJytpZCsnXCJdLCBbZGF0YS1jbG9zZT1cIicraWQrJ1wiXSwgW2RhdGEtdG9nZ2xlPVwiJytpZCsnXCJdJylcbiAgICAgIC5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJylcbiAgICAgIC5hdHRyKCdhcmlhLWNvbnRyb2xzJywgaWQpO1xuXG4gICAgLy8gQWRkIGFuIG92ZXJsYXkgb3ZlciB0aGUgY29udGVudCBpZiBuZWNlc3NhcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRPdmVybGF5ID09PSB0cnVlKSB7XG4gICAgICB2YXIgb3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgdmFyIG92ZXJsYXlQb3NpdGlvbiA9ICQodGhpcy4kZWxlbWVudCkuY3NzKFwicG9zaXRpb25cIikgPT09ICdmaXhlZCcgPyAnaXMtb3ZlcmxheS1maXhlZCcgOiAnaXMtb3ZlcmxheS1hYnNvbHV0ZSc7XG4gICAgICBvdmVybGF5LnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnanMtb2ZmLWNhbnZhcy1vdmVybGF5ICcgKyBvdmVybGF5UG9zaXRpb24pO1xuICAgICAgdGhpcy4kb3ZlcmxheSA9ICQob3ZlcmxheSk7XG4gICAgICBpZihvdmVybGF5UG9zaXRpb24gPT09ICdpcy1vdmVybGF5LWZpeGVkJykge1xuICAgICAgICAkKCdib2R5JykuYXBwZW5kKHRoaXMuJG92ZXJsYXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmFwcGVuZCh0aGlzLiRvdmVybGF5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMuaXNSZXZlYWxlZCA9IHRoaXMub3B0aW9ucy5pc1JldmVhbGVkIHx8IG5ldyBSZWdFeHAodGhpcy5vcHRpb25zLnJldmVhbENsYXNzLCAnZycpLnRlc3QodGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5pc1JldmVhbGVkID09PSB0cnVlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMucmV2ZWFsT24gPSB0aGlzLm9wdGlvbnMucmV2ZWFsT24gfHwgdGhpcy4kZWxlbWVudFswXS5jbGFzc05hbWUubWF0Y2goLyhyZXZlYWwtZm9yLW1lZGl1bXxyZXZlYWwtZm9yLWxhcmdlKS9nKVswXS5zcGxpdCgnLScpWzJdO1xuICAgICAgdGhpcy5fc2V0TVFDaGVja2VyKCk7XG4gICAgfVxuICAgIGlmICghdGhpcy5vcHRpb25zLnRyYW5zaXRpb25UaW1lID09PSB0cnVlKSB7XG4gICAgICB0aGlzLm9wdGlvbnMudHJhbnNpdGlvblRpbWUgPSBwYXJzZUZsb2F0KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKCQoJ1tkYXRhLW9mZi1jYW52YXNdJylbMF0pLnRyYW5zaXRpb25EdXJhdGlvbikgKiAxMDAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIHRvIHRoZSBvZmYtY2FudmFzIHdyYXBwZXIgYW5kIHRoZSBleGl0IG92ZXJsYXkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLiRlbGVtZW50Lm9mZignLnpmLnRyaWdnZXIgLnpmLm9mZmNhbnZhcycpLm9uKHtcbiAgICAgICdvcGVuLnpmLnRyaWdnZXInOiB0aGlzLm9wZW4uYmluZCh0aGlzKSxcbiAgICAgICdjbG9zZS56Zi50cmlnZ2VyJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpLFxuICAgICAgJ3RvZ2dsZS56Zi50cmlnZ2VyJzogdGhpcy50b2dnbGUuYmluZCh0aGlzKSxcbiAgICAgICdrZXlkb3duLnpmLm9mZmNhbnZhcyc6IHRoaXMuX2hhbmRsZUtleWJvYXJkLmJpbmQodGhpcylcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlKSB7XG4gICAgICB2YXIgJHRhcmdldCA9IHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA/IHRoaXMuJG92ZXJsYXkgOiAkKCdbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdJyk7XG4gICAgICAkdGFyZ2V0Lm9uKHsnY2xpY2suemYub2ZmY2FudmFzJzogdGhpcy5jbG9zZS5iaW5kKHRoaXMpfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgZXZlbnQgbGlzdGVuZXIgZm9yIGVsZW1lbnRzIHRoYXQgd2lsbCByZXZlYWwgYXQgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRNUUNoZWNrZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KS5vbmUoJ2xvYWQuemYub2ZmY2FudmFzJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LmF0TGVhc3QoX3RoaXMub3B0aW9ucy5yZXZlYWxPbikpIHtcbiAgICAgICAgX3RoaXMucmV2ZWFsKHRydWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIHJldmVhbGluZy9oaWRpbmcgdGhlIG9mZi1jYW52YXMgYXQgYnJlYWtwb2ludHMsIG5vdCB0aGUgc2FtZSBhcyBvcGVuLlxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzUmV2ZWFsZWQgLSB0cnVlIGlmIGVsZW1lbnQgc2hvdWxkIGJlIHJldmVhbGVkLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHJldmVhbChpc1JldmVhbGVkKSB7XG4gICAgdmFyICRjbG9zZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLWNsb3NlXScpO1xuICAgIGlmIChpc1JldmVhbGVkKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICB0aGlzLmlzUmV2ZWFsZWQgPSB0cnVlO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ29wZW4uemYudHJpZ2dlciB0b2dnbGUuemYudHJpZ2dlcicpO1xuICAgICAgaWYgKCRjbG9zZXIubGVuZ3RoKSB7ICRjbG9zZXIuaGlkZSgpOyB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaXNSZXZlYWxlZCA9IGZhbHNlO1xuICAgICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgICAgJ29wZW4uemYudHJpZ2dlcic6IHRoaXMub3Blbi5iaW5kKHRoaXMpLFxuICAgICAgICAndG9nZ2xlLnpmLnRyaWdnZXInOiB0aGlzLnRvZ2dsZS5iaW5kKHRoaXMpXG4gICAgICB9KTtcbiAgICAgIGlmICgkY2xvc2VyLmxlbmd0aCkge1xuICAgICAgICAkY2xvc2VyLnNob3coKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU3RvcHMgc2Nyb2xsaW5nIG9mIHRoZSBib2R5IHdoZW4gb2ZmY2FudmFzIGlzIG9wZW4gb24gbW9iaWxlIFNhZmFyaSBhbmQgb3RoZXIgdHJvdWJsZXNvbWUgYnJvd3NlcnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc3RvcFNjcm9sbGluZyhldmVudCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIFRha2VuIGFuZCBhZGFwdGVkIGZyb20gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNjg4OTQ0Ny9wcmV2ZW50LWZ1bGwtcGFnZS1zY3JvbGxpbmctaW9zXG4gIC8vIE9ubHkgcmVhbGx5IHdvcmtzIGZvciB5LCBub3Qgc3VyZSBob3cgdG8gZXh0ZW5kIHRvIHggb3IgaWYgd2UgbmVlZCB0by5cbiAgX3JlY29yZFNjcm9sbGFibGUoZXZlbnQpIHtcbiAgICBsZXQgZWxlbSA9IHRoaXM7IC8vIGNhbGxlZCBmcm9tIGV2ZW50IGhhbmRsZXIgY29udGV4dCB3aXRoIHRoaXMgYXMgZWxlbVxuXG4gICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIHNjcm9sbGFibGUgKGNvbnRlbnQgb3ZlcmZsb3dzKSwgdGhlbi4uLlxuICAgIGlmIChlbGVtLnNjcm9sbEhlaWdodCAhPT0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGF0IHRoZSB0b3AsIHNjcm9sbCBkb3duIG9uZSBwaXhlbCB0byBhbGxvdyBzY3JvbGxpbmcgdXBcbiAgICAgIGlmIChlbGVtLnNjcm9sbFRvcCA9PT0gMCkge1xuICAgICAgICBlbGVtLnNjcm9sbFRvcCA9IDE7XG4gICAgICB9XG4gICAgICAvLyBJZiB3ZSdyZSBhdCB0aGUgYm90dG9tLCBzY3JvbGwgdXAgb25lIHBpeGVsIHRvIGFsbG93IHNjcm9sbGluZyBkb3duXG4gICAgICBpZiAoZWxlbS5zY3JvbGxUb3AgPT09IGVsZW0uc2Nyb2xsSGVpZ2h0IC0gZWxlbS5jbGllbnRIZWlnaHQpIHtcbiAgICAgICAgZWxlbS5zY3JvbGxUb3AgPSBlbGVtLnNjcm9sbEhlaWdodCAtIGVsZW0uY2xpZW50SGVpZ2h0IC0gMTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxlbS5hbGxvd1VwID0gZWxlbS5zY3JvbGxUb3AgPiAwO1xuICAgIGVsZW0uYWxsb3dEb3duID0gZWxlbS5zY3JvbGxUb3AgPCAoZWxlbS5zY3JvbGxIZWlnaHQgLSBlbGVtLmNsaWVudEhlaWdodCk7XG4gICAgZWxlbS5sYXN0WSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQucGFnZVk7XG4gIH1cblxuICBfc3RvcFNjcm9sbFByb3BhZ2F0aW9uKGV2ZW50KSB7XG4gICAgbGV0IGVsZW0gPSB0aGlzOyAvLyBjYWxsZWQgZnJvbSBldmVudCBoYW5kbGVyIGNvbnRleHQgd2l0aCB0aGlzIGFzIGVsZW1cbiAgICBsZXQgdXAgPSBldmVudC5wYWdlWSA8IGVsZW0ubGFzdFk7XG4gICAgbGV0IGRvd24gPSAhdXA7XG4gICAgZWxlbS5sYXN0WSA9IGV2ZW50LnBhZ2VZO1xuXG4gICAgaWYoKHVwICYmIGVsZW0uYWxsb3dVcCkgfHwgKGRvd24gJiYgZWxlbS5hbGxvd0Rvd24pKSB7XG4gICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIG9mZi1jYW52YXMgbWVudS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSBsaXN0ZW5lci5cbiAgICogQHBhcmFtIHtqUXVlcnl9IHRyaWdnZXIgLSBlbGVtZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBvZmYtY2FudmFzIHRvIG9wZW4uXG4gICAqIEBmaXJlcyBPZmZDYW52YXMjb3BlbmVkXG4gICAqL1xuICBvcGVuKGV2ZW50LCB0cmlnZ2VyKSB7XG4gICAgaWYgKHRoaXMuJGVsZW1lbnQuaGFzQ2xhc3MoJ2lzLW9wZW4nKSB8fCB0aGlzLmlzUmV2ZWFsZWQpIHsgcmV0dXJuOyB9XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGlmICh0cmlnZ2VyKSB7XG4gICAgICB0aGlzLiRsYXN0VHJpZ2dlciA9IHRyaWdnZXI7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5mb3JjZVRvID09PSAndG9wJykge1xuICAgICAgd2luZG93LnNjcm9sbFRvKDAsIDApO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmZvcmNlVG8gPT09ICdib3R0b20nKSB7XG4gICAgICB3aW5kb3cuc2Nyb2xsVG8oMCxkb2N1bWVudC5ib2R5LnNjcm9sbEhlaWdodCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW5zLlxuICAgICAqIEBldmVudCBPZmZDYW52YXMjb3BlbmVkXG4gICAgICovXG4gICAgX3RoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoJ2lzLW9wZW4nKVxuXG4gICAgdGhpcy4kdHJpZ2dlcnMuYXR0cignYXJpYS1leHBhbmRlZCcsICd0cnVlJyk7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpXG4gICAgICAgIC50cmlnZ2VyKCdvcGVuZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCBhZGQgY2xhc3MgYW5kIGRpc2FibGUgc2Nyb2xsaW5nIG9uIHRvdWNoIGRldmljZXMuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50U2Nyb2xsID09PSBmYWxzZSkge1xuICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdpcy1vZmYtY2FudmFzLW9wZW4nKS5vbigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaHN0YXJ0JywgdGhpcy5fcmVjb3JkU2Nyb2xsYWJsZSk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9uKCd0b3VjaG1vdmUnLCB0aGlzLl9zdG9wU2Nyb2xsUHJvcGFnYXRpb24pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLXZpc2libGUnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNsb3NlT25DbGljayA9PT0gdHJ1ZSAmJiB0aGlzLm9wdGlvbnMuY29udGVudE92ZXJsYXkgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJG92ZXJsYXkuYWRkQ2xhc3MoJ2lzLWNsb3NhYmxlJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5hdXRvRm9jdXMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZCh0aGlzLiRlbGVtZW50KSwgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLiRlbGVtZW50LmZpbmQoJ2EsIGJ1dHRvbicpLmVxKDApLmZvY3VzKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLmF0dHIoJ3RhYmluZGV4JywgJy0xJyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnRyYXBGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSBvZmYtY2FudmFzIG1lbnUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIG9wdGlvbmFsIGNiIHRvIGZpcmUgYWZ0ZXIgY2xvc3VyZS5cbiAgICogQGZpcmVzIE9mZkNhbnZhcyNjbG9zZWRcbiAgICovXG4gIGNsb3NlKGNiKSB7XG4gICAgaWYgKCF0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykgfHwgdGhpcy5pc1JldmVhbGVkKSB7IHJldHVybjsgfVxuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKCdpcy1vcGVuJyk7XG5cbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSBvZmYtY2FudmFzIG1lbnUgb3BlbnMuXG4gICAgICAgKiBAZXZlbnQgT2ZmQ2FudmFzI2Nsb3NlZFxuICAgICAgICovXG4gICAgICAgIC50cmlnZ2VyKCdjbG9zZWQuemYub2ZmY2FudmFzJyk7XG5cbiAgICAvLyBJZiBgY29udGVudFNjcm9sbGAgaXMgc2V0IHRvIGZhbHNlLCByZW1vdmUgY2xhc3MgYW5kIHJlLWVuYWJsZSBzY3JvbGxpbmcgb24gdG91Y2ggZGV2aWNlcy5cbiAgICBpZiAodGhpcy5vcHRpb25zLmNvbnRlbnRTY3JvbGwgPT09IGZhbHNlKSB7XG4gICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ2lzLW9mZi1jYW52YXMtb3BlbicpLm9mZigndG91Y2htb3ZlJywgdGhpcy5fc3RvcFNjcm9sbGluZyk7XG4gICAgICB0aGlzLiRlbGVtZW50Lm9mZigndG91Y2hzdGFydCcsIHRoaXMuX3JlY29yZFNjcm9sbGFibGUpO1xuICAgICAgdGhpcy4kZWxlbWVudC5vZmYoJ3RvdWNobW92ZScsIHRoaXMuX3N0b3BTY3JvbGxQcm9wYWdhdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5yZW1vdmVDbGFzcygnaXMtdmlzaWJsZScpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuY2xvc2VPbkNsaWNrID09PSB0cnVlICYmIHRoaXMub3B0aW9ucy5jb250ZW50T3ZlcmxheSA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kb3ZlcmxheS5yZW1vdmVDbGFzcygnaXMtY2xvc2FibGUnKTtcbiAgICB9XG5cbiAgICB0aGlzLiR0cmlnZ2Vycy5hdHRyKCdhcmlhLWV4cGFuZGVkJywgJ2ZhbHNlJyk7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnRyYXBGb2N1cyA9PT0gdHJ1ZSkge1xuICAgICAgdGhpcy4kZWxlbWVudC5zaWJsaW5ncygnW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XScpLnJlbW92ZUF0dHIoJ3RhYmluZGV4Jyk7XG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlbGVhc2VGb2N1cyh0aGlzLiRlbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyB0aGUgb2ZmLWNhbnZhcyBtZW51IG9wZW4gb3IgY2xvc2VkLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gRXZlbnQgb2JqZWN0IHBhc3NlZCBmcm9tIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gdHJpZ2dlciAtIGVsZW1lbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIG9mZi1jYW52YXMgdG8gb3Blbi5cbiAgICovXG4gIHRvZ2dsZShldmVudCwgdHJpZ2dlcikge1xuICAgIGlmICh0aGlzLiRlbGVtZW50Lmhhc0NsYXNzKCdpcy1vcGVuJykpIHtcbiAgICAgIHRoaXMuY2xvc2UoZXZlbnQsIHRyaWdnZXIpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMub3BlbihldmVudCwgdHJpZ2dlcik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZXMga2V5Ym9hcmQgaW5wdXQgd2hlbiBkZXRlY3RlZC4gV2hlbiB0aGUgZXNjYXBlIGtleSBpcyBwcmVzc2VkLCB0aGUgb2ZmLWNhbnZhcyBtZW51IGNsb3NlcywgYW5kIGZvY3VzIGlzIHJlc3RvcmVkIHRvIHRoZSBlbGVtZW50IHRoYXQgb3BlbmVkIHRoZSBtZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9oYW5kbGVLZXlib2FyZChlKSB7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ09mZkNhbnZhcycsIHtcbiAgICAgIGNsb3NlOiAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xvc2UoKTtcbiAgICAgICAgdGhpcy4kbGFzdFRyaWdnZXIuZm9jdXMoKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgICAgaGFuZGxlZDogKCkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgdGhlIG9mZmNhbnZhcyBwbHVnaW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNsb3NlKCk7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5vZmZjYW52YXMnKTtcbiAgICB0aGlzLiRvdmVybGF5Lm9mZignLnpmLm9mZmNhbnZhcycpO1xuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbk9mZkNhbnZhcy5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFsbG93IHRoZSB1c2VyIHRvIGNsaWNrIG91dHNpZGUgb2YgdGhlIG1lbnUgdG8gY2xvc2UgaXQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNsb3NlT25DbGljazogdHJ1ZSxcblxuICAvKipcbiAgICogQWRkcyBhbiBvdmVybGF5IG9uIHRvcCBvZiBgW2RhdGEtb2ZmLWNhbnZhcy1jb250ZW50XWAuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIGNvbnRlbnRPdmVybGF5OiB0cnVlLFxuXG4gIC8qKlxuICAgKiBFbmFibGUvZGlzYWJsZSBzY3JvbGxpbmcgb2YgdGhlIG1haW4gY29udGVudCB3aGVuIGFuIG9mZiBjYW52YXMgcGFuZWwgaXMgb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgY29udGVudFNjcm9sbDogdHJ1ZSxcblxuICAvKipcbiAgICogQW1vdW50IG9mIHRpbWUgaW4gbXMgdGhlIG9wZW4gYW5kIGNsb3NlIHRyYW5zaXRpb24gcmVxdWlyZXMuIElmIG5vbmUgc2VsZWN0ZWQsIHB1bGxzIGZyb20gYm9keSBzdHlsZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAwXG4gICAqL1xuICB0cmFuc2l0aW9uVGltZTogMCxcblxuICAvKipcbiAgICogVHlwZSBvZiB0cmFuc2l0aW9uIGZvciB0aGUgb2ZmY2FudmFzIG1lbnUuIE9wdGlvbnMgYXJlICdwdXNoJywgJ2RldGFjaGVkJyBvciAnc2xpZGUnLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0IHB1c2hcbiAgICovXG4gIHRyYW5zaXRpb246ICdwdXNoJyxcblxuICAvKipcbiAgICogRm9yY2UgdGhlIHBhZ2UgdG8gc2Nyb2xsIHRvIHRvcCBvciBib3R0b20gb24gb3Blbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgZm9yY2VUbzogbnVsbCxcblxuICAvKipcbiAgICogQWxsb3cgdGhlIG9mZmNhbnZhcyB0byByZW1haW4gb3BlbiBmb3IgY2VydGFpbiBicmVha3BvaW50cy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGlzUmV2ZWFsZWQ6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBCcmVha3BvaW50IGF0IHdoaWNoIHRvIHJldmVhbC4gSlMgd2lsbCB1c2UgYSBSZWdFeHAgdG8gdGFyZ2V0IHN0YW5kYXJkIGNsYXNzZXMsIGlmIGNoYW5naW5nIGNsYXNzbmFtZXMsIHBhc3MgeW91ciBjbGFzcyB3aXRoIHRoZSBgcmV2ZWFsQ2xhc3NgIG9wdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P3N0cmluZ31cbiAgICogQGRlZmF1bHQgbnVsbFxuICAgKi9cbiAgcmV2ZWFsT246IG51bGwsXG5cbiAgLyoqXG4gICAqIEZvcmNlIGZvY3VzIHRvIHRoZSBvZmZjYW52YXMgb24gb3Blbi4gSWYgdHJ1ZSwgd2lsbCBmb2N1cyB0aGUgb3BlbmluZyB0cmlnZ2VyIG9uIGNsb3NlLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICBhdXRvRm9jdXM6IHRydWUsXG5cbiAgLyoqXG4gICAqIENsYXNzIHVzZWQgdG8gZm9yY2UgYW4gb2ZmY2FudmFzIHRvIHJlbWFpbiBvcGVuLiBGb3VuZGF0aW9uIGRlZmF1bHRzIGZvciB0aGlzIGFyZSBgcmV2ZWFsLWZvci1sYXJnZWAgJiBgcmV2ZWFsLWZvci1tZWRpdW1gLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0IHJldmVhbC1mb3ItXG4gICAqIEB0b2RvIGltcHJvdmUgdGhlIHJlZ2V4IHRlc3RpbmcgZm9yIHRoaXMuXG4gICAqL1xuICByZXZlYWxDbGFzczogJ3JldmVhbC1mb3ItJyxcblxuICAvKipcbiAgICogVHJpZ2dlcnMgb3B0aW9uYWwgZm9jdXMgdHJhcHBpbmcgd2hlbiBvcGVuaW5nIGFuIG9mZmNhbnZhcy4gU2V0cyB0YWJpbmRleCBvZiBbZGF0YS1vZmYtY2FudmFzLWNvbnRlbnRdIHRvIC0xIGZvciBhY2Nlc3NpYmlsaXR5IHB1cnBvc2VzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgdHJhcEZvY3VzOiBmYWxzZVxufVxuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oT2ZmQ2FudmFzLCAnT2ZmQ2FudmFzJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBSZXNwb25zaXZlTWVudSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnVcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudHJpZ2dlcnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICovXG5cbmNsYXNzIFJlc3BvbnNpdmVNZW51IHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYSByZXNwb25zaXZlIG1lbnUuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgUmVzcG9uc2l2ZU1lbnUjaW5pdFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gbWFrZSBpbnRvIGEgZHJvcGRvd24gbWVudS5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgIHRoaXMucnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ3Jlc3BvbnNpdmUtbWVudScpO1xuICAgIHRoaXMuY3VycmVudE1xID0gbnVsbDtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4gPSBudWxsO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnUmVzcG9uc2l2ZU1lbnUnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgTWVudSBieSBwYXJzaW5nIHRoZSBjbGFzc2VzIGZyb20gdGhlICdkYXRhLVJlc3BvbnNpdmVNZW51JyBhdHRyaWJ1dGUgb24gdGhlIGVsZW1lbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgLy8gVGhlIGZpcnN0IHRpbWUgYW4gSW50ZXJjaGFuZ2UgcGx1Z2luIGlzIGluaXRpYWxpemVkLCB0aGlzLnJ1bGVzIGlzIGNvbnZlcnRlZCBmcm9tIGEgc3RyaW5nIG9mIFwiY2xhc3Nlc1wiIHRvIGFuIG9iamVjdCBvZiBydWxlc1xuICAgIGlmICh0eXBlb2YgdGhpcy5ydWxlcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGxldCBydWxlc1RyZWUgPSB7fTtcblxuICAgICAgLy8gUGFyc2UgcnVsZXMgZnJvbSBcImNsYXNzZXNcIiBwdWxsZWQgZnJvbSBkYXRhIGF0dHJpYnV0ZVxuICAgICAgbGV0IHJ1bGVzID0gdGhpcy5ydWxlcy5zcGxpdCgnICcpO1xuXG4gICAgICAvLyBJdGVyYXRlIHRocm91Z2ggZXZlcnkgcnVsZSBmb3VuZFxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBydWxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgcnVsZSA9IHJ1bGVzW2ldLnNwbGl0KCctJyk7XG4gICAgICAgIGxldCBydWxlU2l6ZSA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMF0gOiAnc21hbGwnO1xuICAgICAgICBsZXQgcnVsZVBsdWdpbiA9IHJ1bGUubGVuZ3RoID4gMSA/IHJ1bGVbMV0gOiBydWxlWzBdO1xuXG4gICAgICAgIGlmIChNZW51UGx1Z2luc1tydWxlUGx1Z2luXSAhPT0gbnVsbCkge1xuICAgICAgICAgIHJ1bGVzVHJlZVtydWxlU2l6ZV0gPSBNZW51UGx1Z2luc1tydWxlUGx1Z2luXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLnJ1bGVzID0gcnVsZXNUcmVlO1xuICAgIH1cblxuICAgIGlmICghJC5pc0VtcHR5T2JqZWN0KHRoaXMucnVsZXMpKSB7XG4gICAgICB0aGlzLl9jaGVja01lZGlhUXVlcmllcygpO1xuICAgIH1cbiAgICAvLyBBZGQgZGF0YS1tdXRhdGUgc2luY2UgY2hpbGRyZW4gbWF5IG5lZWQgaXQuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdkYXRhLW11dGF0ZScsICh0aGlzLiRlbGVtZW50LmF0dHIoJ2RhdGEtbXV0YXRlJykgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAncmVzcG9uc2l2ZS1tZW51JykpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIHRoZSBNZW51LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5fY2hlY2tNZWRpYVF1ZXJpZXMoKTtcbiAgICB9KTtcbiAgICAvLyAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5SZXNwb25zaXZlTWVudScsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgX3RoaXMuX2NoZWNrTWVkaWFRdWVyaWVzKCk7XG4gICAgLy8gfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIHRoZSBjdXJyZW50IHNjcmVlbiB3aWR0aCBhZ2FpbnN0IGF2YWlsYWJsZSBtZWRpYSBxdWVyaWVzLiBJZiB0aGUgbWVkaWEgcXVlcnkgaGFzIGNoYW5nZWQsIGFuZCB0aGUgcGx1Z2luIG5lZWRlZCBoYXMgY2hhbmdlZCwgdGhlIHBsdWdpbnMgd2lsbCBzd2FwIG91dC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfY2hlY2tNZWRpYVF1ZXJpZXMoKSB7XG4gICAgdmFyIG1hdGNoZWRNcSwgX3RoaXMgPSB0aGlzO1xuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUgYW5kIGZpbmQgdGhlIGxhc3QgbWF0Y2hpbmcgcnVsZVxuICAgICQuZWFjaCh0aGlzLnJ1bGVzLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkuYXRMZWFzdChrZXkpKSB7XG4gICAgICAgIG1hdGNoZWRNcSA9IGtleTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIE5vIG1hdGNoPyBObyBkaWNlXG4gICAgaWYgKCFtYXRjaGVkTXEpIHJldHVybjtcblxuICAgIC8vIFBsdWdpbiBhbHJlYWR5IGluaXRpYWxpemVkPyBXZSBnb29kXG4gICAgaWYgKHRoaXMuY3VycmVudFBsdWdpbiBpbnN0YW5jZW9mIHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4pIHJldHVybjtcblxuICAgIC8vIFJlbW92ZSBleGlzdGluZyBwbHVnaW4tc3BlY2lmaWMgQ1NTIGNsYXNzZXNcbiAgICAkLmVhY2goTWVudVBsdWdpbnMsIGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIF90aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKHZhbHVlLmNzc0NsYXNzKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCB0aGUgQ1NTIGNsYXNzIGZvciB0aGUgbmV3IHBsdWdpblxuICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3ModGhpcy5ydWxlc1ttYXRjaGVkTXFdLmNzc0NsYXNzKTtcblxuICAgIC8vIENyZWF0ZSBhbiBpbnN0YW5jZSBvZiB0aGUgbmV3IHBsdWdpblxuICAgIGlmICh0aGlzLmN1cnJlbnRQbHVnaW4pIHRoaXMuY3VycmVudFBsdWdpbi5kZXN0cm95KCk7XG4gICAgdGhpcy5jdXJyZW50UGx1Z2luID0gbmV3IHRoaXMucnVsZXNbbWF0Y2hlZE1xXS5wbHVnaW4odGhpcy4kZWxlbWVudCwge30pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIHRoZSBpbnN0YW5jZSBvZiB0aGUgY3VycmVudCBwbHVnaW4gb24gdGhpcyBlbGVtZW50LCBhcyB3ZWxsIGFzIHRoZSB3aW5kb3cgcmVzaXplIGhhbmRsZXIgdGhhdCBzd2l0Y2hlcyB0aGUgcGx1Z2lucyBvdXQuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmN1cnJlbnRQbHVnaW4uZGVzdHJveSgpO1xuICAgICQod2luZG93KS5vZmYoJy56Zi5SZXNwb25zaXZlTWVudScpO1xuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5SZXNwb25zaXZlTWVudS5kZWZhdWx0cyA9IHt9O1xuXG4vLyBUaGUgcGx1Z2luIG1hdGNoZXMgdGhlIHBsdWdpbiBjbGFzc2VzIHdpdGggdGhlc2UgcGx1Z2luIGluc3RhbmNlcy5cbnZhciBNZW51UGx1Z2lucyA9IHtcbiAgZHJvcGRvd246IHtcbiAgICBjc3NDbGFzczogJ2Ryb3Bkb3duJyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2Ryb3Bkb3duLW1lbnUnXSB8fCBudWxsXG4gIH0sXG4gZHJpbGxkb3duOiB7XG4gICAgY3NzQ2xhc3M6ICdkcmlsbGRvd24nLFxuICAgIHBsdWdpbjogRm91bmRhdGlvbi5fcGx1Z2luc1snZHJpbGxkb3duJ10gfHwgbnVsbFxuICB9LFxuICBhY2NvcmRpb246IHtcbiAgICBjc3NDbGFzczogJ2FjY29yZGlvbi1tZW51JyxcbiAgICBwbHVnaW46IEZvdW5kYXRpb24uX3BsdWdpbnNbJ2FjY29yZGlvbi1tZW51J10gfHwgbnVsbFxuICB9XG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oUmVzcG9uc2l2ZU1lbnUsICdSZXNwb25zaXZlTWVudScpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbkZvdW5kYXRpb24uQm94ID0ge1xuICBJbU5vdFRvdWNoaW5nWW91OiBJbU5vdFRvdWNoaW5nWW91LFxuICBHZXREaW1lbnNpb25zOiBHZXREaW1lbnNpb25zLFxuICBHZXRPZmZzZXRzOiBHZXRPZmZzZXRzXG59XG5cbi8qKlxuICogQ29tcGFyZXMgdGhlIGRpbWVuc2lvbnMgb2YgYW4gZWxlbWVudCB0byBhIGNvbnRhaW5lciBhbmQgZGV0ZXJtaW5lcyBjb2xsaXNpb24gZXZlbnRzIHdpdGggY29udGFpbmVyLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gdGVzdCBmb3IgY29sbGlzaW9ucy5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBwYXJlbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHVzZSBhcyBib3VuZGluZyBjb250YWluZXIuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGxyT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIGxlZnQgYW5kIHJpZ2h0IHZhbHVlcyBvbmx5LlxuICogQHBhcmFtIHtCb29sZWFufSB0Yk9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayB0b3AgYW5kIGJvdHRvbSB2YWx1ZXMgb25seS5cbiAqIEBkZWZhdWx0IGlmIG5vIHBhcmVudCBvYmplY3QgcGFzc2VkLCBkZXRlY3RzIGNvbGxpc2lvbnMgd2l0aCBgd2luZG93YC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSAtIHRydWUgaWYgY29sbGlzaW9uIGZyZWUsIGZhbHNlIGlmIGEgY29sbGlzaW9uIGluIGFueSBkaXJlY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIEltTm90VG91Y2hpbmdZb3UoZWxlbWVudCwgcGFyZW50LCBsck9ubHksIHRiT25seSkge1xuICB2YXIgZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICB0b3AsIGJvdHRvbSwgbGVmdCwgcmlnaHQ7XG5cbiAgaWYgKHBhcmVudCkge1xuICAgIHZhciBwYXJEaW1zID0gR2V0RGltZW5zaW9ucyhwYXJlbnQpO1xuXG4gICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IHBhckRpbXMuaGVpZ2h0ICsgcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgbGVmdCAgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gcGFyRGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IHBhckRpbXMud2lkdGggKyBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgfVxuICBlbHNlIHtcbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCArIGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICB0b3AgICAgPSAoZWxlRGltcy5vZmZzZXQudG9wID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBlbGVEaW1zLndpbmRvd0RpbXMud2lkdGgpO1xuICB9XG5cbiAgdmFyIGFsbERpcnMgPSBbYm90dG9tLCB0b3AsIGxlZnQsIHJpZ2h0XTtcblxuICBpZiAobHJPbmx5KSB7XG4gICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0ID09PSB0cnVlO1xuICB9XG5cbiAgaWYgKHRiT25seSkge1xuICAgIHJldHVybiB0b3AgPT09IGJvdHRvbSA9PT0gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiBhbGxEaXJzLmluZGV4T2YoZmFsc2UpID09PSAtMTtcbn07XG5cbi8qKlxuICogVXNlcyBuYXRpdmUgbWV0aG9kcyB0byByZXR1cm4gYW4gb2JqZWN0IG9mIGRpbWVuc2lvbiB2YWx1ZXMuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5IHx8IEhUTUx9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IG9yIERPTSBlbGVtZW50IGZvciB3aGljaCB0byBnZXQgdGhlIGRpbWVuc2lvbnMuIENhbiBiZSBhbnkgZWxlbWVudCBvdGhlciB0aGF0IGRvY3VtZW50IG9yIHdpbmRvdy5cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0gbmVzdGVkIG9iamVjdCBvZiBpbnRlZ2VyIHBpeGVsIHZhbHVlc1xuICogVE9ETyAtIGlmIGVsZW1lbnQgaXMgd2luZG93LCByZXR1cm4gb25seSB0aG9zZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIEdldERpbWVuc2lvbnMoZWxlbSwgdGVzdCl7XG4gIGVsZW0gPSBlbGVtLmxlbmd0aCA/IGVsZW1bMF0gOiBlbGVtO1xuXG4gIGlmIChlbGVtID09PSB3aW5kb3cgfHwgZWxlbSA9PT0gZG9jdW1lbnQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJJ20gc29ycnksIERhdmUuIEknbSBhZnJhaWQgSSBjYW4ndCBkbyB0aGF0LlwiKTtcbiAgfVxuXG4gIHZhciByZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHBhclJlY3QgPSBlbGVtLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3aW5SZWN0ID0gZG9jdW1lbnQuYm9keS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG4gICAgICB3aW5YID0gd2luZG93LnBhZ2VYT2Zmc2V0O1xuXG4gIHJldHVybiB7XG4gICAgd2lkdGg6IHJlY3Qud2lkdGgsXG4gICAgaGVpZ2h0OiByZWN0LmhlaWdodCxcbiAgICBvZmZzZXQ6IHtcbiAgICAgIHRvcDogcmVjdC50b3AgKyB3aW5ZLFxuICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgd2luWFxuICAgIH0sXG4gICAgcGFyZW50RGltczoge1xuICAgICAgd2lkdGg6IHBhclJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHBhclJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogcGFyUmVjdC50b3AgKyB3aW5ZLFxuICAgICAgICBsZWZ0OiBwYXJSZWN0LmxlZnQgKyB3aW5YXG4gICAgICB9XG4gICAgfSxcbiAgICB3aW5kb3dEaW1zOiB7XG4gICAgICB3aWR0aDogd2luUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogd2luUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiB3aW5ZLFxuICAgICAgICBsZWZ0OiB3aW5YXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgb2YgdG9wIGFuZCBsZWZ0IGludGVnZXIgcGl4ZWwgdmFsdWVzIGZvciBkeW5hbWljYWxseSByZW5kZXJlZCBlbGVtZW50cyxcbiAqIHN1Y2ggYXM6IFRvb2x0aXAsIFJldmVhbCwgYW5kIERyb3Bkb3duXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQgYmVpbmcgcG9zaXRpb25lZC5cbiAqIEBwYXJhbSB7alF1ZXJ5fSBhbmNob3IgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCdzIGFuY2hvciBwb2ludC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwb3NpdGlvbiAtIGEgc3RyaW5nIHJlbGF0aW5nIHRvIHRoZSBkZXNpcmVkIHBvc2l0aW9uIG9mIHRoZSBlbGVtZW50LCByZWxhdGl2ZSB0byBpdCdzIGFuY2hvclxuICogQHBhcmFtIHtOdW1iZXJ9IHZPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgdmVydGljYWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7TnVtYmVyfSBoT2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIGhvcml6b250YWwgc2VwYXJhdGlvbiBiZXR3ZWVuIGFuY2hvciBhbmQgZWxlbWVudC5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNPdmVyZmxvdyAtIGlmIGEgY29sbGlzaW9uIGV2ZW50IGlzIGRldGVjdGVkLCBzZXRzIHRvIHRydWUgdG8gZGVmYXVsdCB0aGUgZWxlbWVudCB0byBmdWxsIHdpZHRoIC0gYW55IGRlc2lyZWQgb2Zmc2V0LlxuICogVE9ETyBhbHRlci9yZXdyaXRlIHRvIHdvcmsgd2l0aCBgZW1gIHZhbHVlcyBhcyB3ZWxsL2luc3RlYWQgb2YgcGl4ZWxzXG4gKi9cbmZ1bmN0aW9uIEdldE9mZnNldHMoZWxlbWVudCwgYW5jaG9yLCBwb3NpdGlvbiwgdk9mZnNldCwgaE9mZnNldCwgaXNPdmVyZmxvdykge1xuICB2YXIgJGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgJGFuY2hvckRpbXMgPSBhbmNob3IgPyBHZXREaW1lbnNpb25zKGFuY2hvcikgOiBudWxsO1xuXG4gIHN3aXRjaCAocG9zaXRpb24pIHtcbiAgICBjYXNlICd0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciB0b3AnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgKCRhbmNob3JEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMiksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCAtICgkZWxlRGltcy5oZWlnaHQgKyB2T2Zmc2V0KVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiBpc092ZXJmbG93ID8gaE9mZnNldCA6ICgoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciBsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgcmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgKyAxLFxuICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0ICsgKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAoJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgKCRlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZXZlYWwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMud2lkdGggLSAkZWxlRGltcy53aWR0aCkgLyAyLFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArIHZPZmZzZXRcbiAgICAgIH1cbiAgICBjYXNlICdyZXZlYWwgZnVsbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICB0b3A6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbGVmdCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQgLSAkZWxlRGltcy53aWR0aCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH1cbiAgfVxufVxuXG59KGpRdWVyeSk7XG4iLCIvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqIFRoaXMgdXRpbCB3YXMgY3JlYXRlZCBieSBNYXJpdXMgT2xiZXJ0eiAqXG4gKiBQbGVhc2UgdGhhbmsgTWFyaXVzIG9uIEdpdEh1YiAvb3dsYmVydHogKlxuICogb3IgdGhlIHdlYiBodHRwOi8vd3d3Lm1hcml1c29sYmVydHouZGUvICpcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4ndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IGtleUNvZGVzID0ge1xuICA5OiAnVEFCJyxcbiAgMTM6ICdFTlRFUicsXG4gIDI3OiAnRVNDQVBFJyxcbiAgMzI6ICdTUEFDRScsXG4gIDM3OiAnQVJST1dfTEVGVCcsXG4gIDM4OiAnQVJST1dfVVAnLFxuICAzOTogJ0FSUk9XX1JJR0hUJyxcbiAgNDA6ICdBUlJPV19ET1dOJ1xufVxuXG52YXIgY29tbWFuZHMgPSB7fVxuXG52YXIgS2V5Ym9hcmQgPSB7XG4gIGtleXM6IGdldEtleUNvZGVzKGtleUNvZGVzKSxcblxuICAvKipcbiAgICogUGFyc2VzIHRoZSAoa2V5Ym9hcmQpIGV2ZW50IGFuZCByZXR1cm5zIGEgU3RyaW5nIHRoYXQgcmVwcmVzZW50cyBpdHMga2V5XG4gICAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHJldHVybiBTdHJpbmcga2V5IC0gU3RyaW5nIHRoYXQgcmVwcmVzZW50cyB0aGUga2V5IHByZXNzZWRcbiAgICovXG4gIHBhcnNlS2V5KGV2ZW50KSB7XG4gICAgdmFyIGtleSA9IGtleUNvZGVzW2V2ZW50LndoaWNoIHx8IGV2ZW50LmtleUNvZGVdIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZXZlbnQud2hpY2gpLnRvVXBwZXJDYXNlKCk7XG5cbiAgICAvLyBSZW1vdmUgdW4tcHJpbnRhYmxlIGNoYXJhY3RlcnMsIGUuZy4gZm9yIGBmcm9tQ2hhckNvZGVgIGNhbGxzIGZvciBDVFJMIG9ubHkgZXZlbnRzXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL1xcVysvLCAnJyk7XG5cbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkpIGtleSA9IGBTSElGVF8ke2tleX1gO1xuICAgIGlmIChldmVudC5jdHJsS2V5KSBrZXkgPSBgQ1RSTF8ke2tleX1gO1xuICAgIGlmIChldmVudC5hbHRLZXkpIGtleSA9IGBBTFRfJHtrZXl9YDtcblxuICAgIC8vIFJlbW92ZSB0cmFpbGluZyB1bmRlcnNjb3JlLCBpbiBjYXNlIG9ubHkgbW9kaWZpZXJzIHdlcmUgdXNlZCAoZS5nLiBvbmx5IGBDVFJMX0FMVGApXG4gICAga2V5ID0ga2V5LnJlcGxhY2UoL18kLywgJycpO1xuXG4gICAgcmV0dXJuIGtleTtcbiAgfSxcblxuICAvKipcbiAgICogSGFuZGxlcyB0aGUgZ2l2ZW4gKGtleWJvYXJkKSBldmVudFxuICAgKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIHRoZSBldmVudCBnZW5lcmF0ZWQgYnkgdGhlIGV2ZW50IGhhbmRsZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50J3MgbmFtZSwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEBwYXJhbSB7T2JqZWN0c30gZnVuY3Rpb25zIC0gY29sbGVjdGlvbiBvZiBmdW5jdGlvbnMgdGhhdCBhcmUgdG8gYmUgZXhlY3V0ZWRcbiAgICovXG4gIGhhbmRsZUtleShldmVudCwgY29tcG9uZW50LCBmdW5jdGlvbnMpIHtcbiAgICB2YXIgY29tbWFuZExpc3QgPSBjb21tYW5kc1tjb21wb25lbnRdLFxuICAgICAga2V5Q29kZSA9IHRoaXMucGFyc2VLZXkoZXZlbnQpLFxuICAgICAgY21kcyxcbiAgICAgIGNvbW1hbmQsXG4gICAgICBmbjtcblxuICAgIGlmICghY29tbWFuZExpc3QpIHJldHVybiBjb25zb2xlLndhcm4oJ0NvbXBvbmVudCBub3QgZGVmaW5lZCEnKTtcblxuICAgIGlmICh0eXBlb2YgY29tbWFuZExpc3QubHRyID09PSAndW5kZWZpbmVkJykgeyAvLyB0aGlzIGNvbXBvbmVudCBkb2VzIG5vdCBkaWZmZXJlbnRpYXRlIGJldHdlZW4gbHRyIGFuZCBydGxcbiAgICAgICAgY21kcyA9IGNvbW1hbmRMaXN0OyAvLyB1c2UgcGxhaW4gbGlzdFxuICAgIH0gZWxzZSB7IC8vIG1lcmdlIGx0ciBhbmQgcnRsOiBpZiBkb2N1bWVudCBpcyBydGwsIHJ0bCBvdmVyd3JpdGVzIGx0ciBhbmQgdmljZSB2ZXJzYVxuICAgICAgICBpZiAoRm91bmRhdGlvbi5ydGwoKSkgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5sdHIsIGNvbW1hbmRMaXN0LnJ0bCk7XG5cbiAgICAgICAgZWxzZSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0LnJ0bCwgY29tbWFuZExpc3QubHRyKTtcbiAgICB9XG4gICAgY29tbWFuZCA9IGNtZHNba2V5Q29kZV07XG5cbiAgICBmbiA9IGZ1bmN0aW9uc1tjb21tYW5kXTtcbiAgICBpZiAoZm4gJiYgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gIGlmIGV4aXN0c1xuICAgICAgdmFyIHJldHVyblZhbHVlID0gZm4uYXBwbHkoKTtcbiAgICAgIGlmIChmdW5jdGlvbnMuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLmhhbmRsZWQocmV0dXJuVmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZnVuY3Rpb25zLnVuaGFuZGxlZCB8fCB0eXBlb2YgZnVuY3Rpb25zLnVuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIG5vdCBoYW5kbGVkXG4gICAgICAgICAgZnVuY3Rpb25zLnVuaGFuZGxlZCgpO1xuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRmluZHMgYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gdGhlIGdpdmVuIGAkZWxlbWVudGBcbiAgICogQHBhcmFtIHtqUXVlcnl9ICRlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBzZWFyY2ggd2l0aGluXG4gICAqIEByZXR1cm4ge2pRdWVyeX0gJGZvY3VzYWJsZSAtIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIGAkZWxlbWVudGBcbiAgICovXG4gIGZpbmRGb2N1c2FibGUoJGVsZW1lbnQpIHtcbiAgICBpZighJGVsZW1lbnQpIHtyZXR1cm4gZmFsc2U7IH1cbiAgICByZXR1cm4gJGVsZW1lbnQuZmluZCgnYVtocmVmXSwgYXJlYVtocmVmXSwgaW5wdXQ6bm90KFtkaXNhYmxlZF0pLCBzZWxlY3Q6bm90KFtkaXNhYmxlZF0pLCB0ZXh0YXJlYTpub3QoW2Rpc2FibGVkXSksIGJ1dHRvbjpub3QoW2Rpc2FibGVkXSksIGlmcmFtZSwgb2JqZWN0LCBlbWJlZCwgKlt0YWJpbmRleF0sICpbY29udGVudGVkaXRhYmxlXScpLmZpbHRlcihmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJCh0aGlzKS5pcygnOnZpc2libGUnKSB8fCAkKHRoaXMpLmF0dHIoJ3RhYmluZGV4JykgPCAwKSB7IHJldHVybiBmYWxzZTsgfSAvL29ubHkgaGF2ZSB2aXNpYmxlIGVsZW1lbnRzIGFuZCB0aG9zZSB0aGF0IGhhdmUgYSB0YWJpbmRleCBncmVhdGVyIG9yIGVxdWFsIDBcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgbmFtZSBuYW1lXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCwgZS5nLiBTbGlkZXIgb3IgUmV2ZWFsXG4gICAqIEByZXR1cm4gU3RyaW5nIGNvbXBvbmVudE5hbWVcbiAgICovXG5cbiAgcmVnaXN0ZXIoY29tcG9uZW50TmFtZSwgY21kcykge1xuICAgIGNvbW1hbmRzW2NvbXBvbmVudE5hbWVdID0gY21kcztcbiAgfSwgIFxuXG4gIC8qKlxuICAgKiBUcmFwcyB0aGUgZm9jdXMgaW4gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gdHJhcCB0aGUgZm91Y3MgaW50by5cbiAgICovXG4gIHRyYXBGb2N1cygkZWxlbWVudCkge1xuICAgIHZhciAkZm9jdXNhYmxlID0gRm91bmRhdGlvbi5LZXlib2FyZC5maW5kRm9jdXNhYmxlKCRlbGVtZW50KSxcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgwKSxcbiAgICAgICAgJGxhc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKC0xKTtcblxuICAgICRlbGVtZW50Lm9uKCdrZXlkb3duLnpmLnRyYXBmb2N1cycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0ID09PSAkbGFzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGZpcnN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChldmVudC50YXJnZXQgPT09ICRmaXJzdEZvY3VzYWJsZVswXSAmJiBGb3VuZGF0aW9uLktleWJvYXJkLnBhcnNlS2V5KGV2ZW50KSA9PT0gJ1NISUZUX1RBQicpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJGxhc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcbiAgLyoqXG4gICAqIFJlbGVhc2VzIHRoZSB0cmFwcGVkIGZvY3VzIGZyb20gdGhlIGdpdmVuIGVsZW1lbnQuXG4gICAqIEBwYXJhbSAge2pRdWVyeX0gJGVsZW1lbnQgIGpRdWVyeSBvYmplY3QgdG8gcmVsZWFzZSB0aGUgZm9jdXMgZm9yLlxuICAgKi9cbiAgcmVsZWFzZUZvY3VzKCRlbGVtZW50KSB7XG4gICAgJGVsZW1lbnQub2ZmKCdrZXlkb3duLnpmLnRyYXBmb2N1cycpO1xuICB9XG59XG5cbi8qXG4gKiBDb25zdGFudHMgZm9yIGVhc2llciBjb21wYXJpbmcuXG4gKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAqL1xuZnVuY3Rpb24gZ2V0S2V5Q29kZXMoa2NzKSB7XG4gIHZhciBrID0ge307XG4gIGZvciAodmFyIGtjIGluIGtjcykga1trY3Nba2NdXSA9IGtjc1trY107XG4gIHJldHVybiBrO1xufVxuXG5Gb3VuZGF0aW9uLktleWJvYXJkID0gS2V5Ym9hcmQ7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLy8gRGVmYXVsdCBzZXQgb2YgbWVkaWEgcXVlcmllc1xuY29uc3QgZGVmYXVsdFF1ZXJpZXMgPSB7XG4gICdkZWZhdWx0JyA6ICdvbmx5IHNjcmVlbicsXG4gIGxhbmRzY2FwZSA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgcG9ydHJhaXQgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogcG9ydHJhaXQpJyxcbiAgcmV0aW5hIDogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbnZhciBNZWRpYVF1ZXJ5ID0ge1xuICBxdWVyaWVzOiBbXSxcblxuICBjdXJyZW50OiAnJyxcblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIG1lZGlhIHF1ZXJ5IGhlbHBlciwgYnkgZXh0cmFjdGluZyB0aGUgYnJlYWtwb2ludCBsaXN0IGZyb20gdGhlIENTUyBhbmQgYWN0aXZhdGluZyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZXh0cmFjdGVkU3R5bGVzID0gJCgnLmZvdW5kYXRpb24tbXEnKS5jc3MoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgdmFyIG5hbWVkUXVlcmllcztcblxuICAgIG5hbWVkUXVlcmllcyA9IHBhcnNlU3R5bGVUb09iamVjdChleHRyYWN0ZWRTdHlsZXMpO1xuXG4gICAgZm9yICh2YXIga2V5IGluIG5hbWVkUXVlcmllcykge1xuICAgICAgaWYobmFtZWRRdWVyaWVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgc2VsZi5xdWVyaWVzLnB1c2goe1xuICAgICAgICAgIG5hbWU6IGtleSxcbiAgICAgICAgICB2YWx1ZTogYG9ubHkgc2NyZWVuIGFuZCAobWluLXdpZHRoOiAke25hbWVkUXVlcmllc1trZXldfSlgXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY3VycmVudCA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCk7XG5cbiAgICB0aGlzLl93YXRjaGVyKCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIGlzIGF0IGxlYXN0IGFzIHdpZGUgYXMgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQncyBzbWFsbGVyLlxuICAgKi9cbiAgYXRMZWFzdChzaXplKSB7XG4gICAgdmFyIHF1ZXJ5ID0gdGhpcy5nZXQoc2l6ZSk7XG5cbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHJldHVybiB3aW5kb3cubWF0Y2hNZWRpYShxdWVyeSkubWF0Y2hlcztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgc2NyZWVuIG1hdGNoZXMgdG8gYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGNoZWNrLCBlaXRoZXIgJ3NtYWxsIG9ubHknIG9yICdzbWFsbCcuIE9taXR0aW5nICdvbmx5JyBmYWxscyBiYWNrIHRvIHVzaW5nIGF0TGVhc3QoKSBtZXRob2QuXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCBkb2VzIG5vdC5cbiAgICovXG4gIGlzKHNpemUpIHtcbiAgICBzaXplID0gc2l6ZS50cmltKCkuc3BsaXQoJyAnKTtcbiAgICBpZihzaXplLmxlbmd0aCA+IDEgJiYgc2l6ZVsxXSA9PT0gJ29ubHknKSB7XG4gICAgICBpZihzaXplWzBdID09PSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpKSByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuYXRMZWFzdChzaXplWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBtZWRpYSBxdWVyeSBvZiBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gZ2V0LlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfG51bGx9IC0gVGhlIG1lZGlhIHF1ZXJ5IG9mIHRoZSBicmVha3BvaW50LCBvciBgbnVsbGAgaWYgdGhlIGJyZWFrcG9pbnQgZG9lc24ndCBleGlzdC5cbiAgICovXG4gIGdldChzaXplKSB7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnF1ZXJpZXMpIHtcbiAgICAgIGlmKHRoaXMucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG4gICAgICAgIGlmIChzaXplID09PSBxdWVyeS5uYW1lKSByZXR1cm4gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGN1cnJlbnQgYnJlYWtwb2ludCBuYW1lIGJ5IHRlc3RpbmcgZXZlcnkgYnJlYWtwb2ludCBhbmQgcmV0dXJuaW5nIHRoZSBsYXN0IG9uZSB0byBtYXRjaCAodGhlIGJpZ2dlc3Qgb25lKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IE5hbWUgb2YgdGhlIGN1cnJlbnQgYnJlYWtwb2ludC5cbiAgICovXG4gIF9nZXRDdXJyZW50U2l6ZSgpIHtcbiAgICB2YXIgbWF0Y2hlZDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5xdWVyaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcXVlcnkgPSB0aGlzLnF1ZXJpZXNbaV07XG5cbiAgICAgIGlmICh3aW5kb3cubWF0Y2hNZWRpYShxdWVyeS52YWx1ZSkubWF0Y2hlcykge1xuICAgICAgICBtYXRjaGVkID0gcXVlcnk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBtYXRjaGVkID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIG1hdGNoZWQubmFtZTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1hdGNoZWQ7XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBBY3RpdmF0ZXMgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlciwgd2hpY2ggZmlyZXMgYW4gZXZlbnQgb24gdGhlIHdpbmRvdyB3aGVuZXZlciB0aGUgYnJlYWtwb2ludCBjaGFuZ2VzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF93YXRjaGVyKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLm1lZGlhcXVlcnknLCAoKSA9PiB7XG4gICAgICB2YXIgbmV3U2l6ZSA9IHRoaXMuX2dldEN1cnJlbnRTaXplKCksIGN1cnJlbnRTaXplID0gdGhpcy5jdXJyZW50O1xuXG4gICAgICBpZiAobmV3U2l6ZSAhPT0gY3VycmVudFNpemUpIHtcbiAgICAgICAgLy8gQ2hhbmdlIHRoZSBjdXJyZW50IG1lZGlhIHF1ZXJ5XG4gICAgICAgIHRoaXMuY3VycmVudCA9IG5ld1NpemU7XG5cbiAgICAgICAgLy8gQnJvYWRjYXN0IHRoZSBtZWRpYSBxdWVyeSBjaGFuZ2Ugb24gdGhlIHdpbmRvd1xuICAgICAgICAkKHdpbmRvdykudHJpZ2dlcignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgW25ld1NpemUsIGN1cnJlbnRTaXplXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn07XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbi8vIG1hdGNoTWVkaWEoKSBwb2x5ZmlsbCAtIFRlc3QgYSBDU1MgbWVkaWEgdHlwZS9xdWVyeSBpbiBKUy5cbi8vIEF1dGhvcnMgJiBjb3B5cmlnaHQgKGMpIDIwMTI6IFNjb3R0IEplaGwsIFBhdWwgSXJpc2gsIE5pY2hvbGFzIFpha2FzLCBEYXZpZCBLbmlnaHQuIER1YWwgTUlUL0JTRCBsaWNlbnNlXG53aW5kb3cubWF0Y2hNZWRpYSB8fCAod2luZG93Lm1hdGNoTWVkaWEgPSBmdW5jdGlvbigpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8vIEZvciBicm93c2VycyB0aGF0IHN1cHBvcnQgbWF0Y2hNZWRpdW0gYXBpIHN1Y2ggYXMgSUUgOSBhbmQgd2Via2l0XG4gIHZhciBzdHlsZU1lZGlhID0gKHdpbmRvdy5zdHlsZU1lZGlhIHx8IHdpbmRvdy5tZWRpYSk7XG5cbiAgLy8gRm9yIHRob3NlIHRoYXQgZG9uJ3Qgc3VwcG9ydCBtYXRjaE1lZGl1bVxuICBpZiAoIXN0eWxlTWVkaWEpIHtcbiAgICB2YXIgc3R5bGUgICA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJyksXG4gICAgc2NyaXB0ICAgICAgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnc2NyaXB0JylbMF0sXG4gICAgaW5mbyAgICAgICAgPSBudWxsO1xuXG4gICAgc3R5bGUudHlwZSAgPSAndGV4dC9jc3MnO1xuICAgIHN0eWxlLmlkICAgID0gJ21hdGNobWVkaWFqcy10ZXN0JztcblxuICAgIHNjcmlwdCAmJiBzY3JpcHQucGFyZW50Tm9kZSAmJiBzY3JpcHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc3R5bGUsIHNjcmlwdCk7XG5cbiAgICAvLyAnc3R5bGUuY3VycmVudFN0eWxlJyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICd3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZScgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgIGluZm8gPSAoJ2dldENvbXB1dGVkU3R5bGUnIGluIHdpbmRvdykgJiYgd2luZG93LmdldENvbXB1dGVkU3R5bGUoc3R5bGUsIG51bGwpIHx8IHN0eWxlLmN1cnJlbnRTdHlsZTtcblxuICAgIHN0eWxlTWVkaWEgPSB7XG4gICAgICBtYXRjaE1lZGl1bShtZWRpYSkge1xuICAgICAgICB2YXIgdGV4dCA9IGBAbWVkaWEgJHttZWRpYX17ICNtYXRjaG1lZGlhanMtdGVzdCB7IHdpZHRoOiAxcHg7IH0gfWA7XG5cbiAgICAgICAgLy8gJ3N0eWxlLnN0eWxlU2hlZXQnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3N0eWxlLnRleHRDb250ZW50JyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgICAgIGlmIChzdHlsZS5zdHlsZVNoZWV0KSB7XG4gICAgICAgICAgc3R5bGUuc3R5bGVTaGVldC5jc3NUZXh0ID0gdGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHlsZS50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUZXN0IGlmIG1lZGlhIHF1ZXJ5IGlzIHRydWUgb3IgZmFsc2VcbiAgICAgICAgcmV0dXJuIGluZm8ud2lkdGggPT09ICcxcHgnO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihtZWRpYSkge1xuICAgIHJldHVybiB7XG4gICAgICBtYXRjaGVzOiBzdHlsZU1lZGlhLm1hdGNoTWVkaXVtKG1lZGlhIHx8ICdhbGwnKSxcbiAgICAgIG1lZGlhOiBtZWRpYSB8fCAnYWxsJ1xuICAgIH07XG4gIH1cbn0oKSk7XG5cbi8vIFRoYW5rIHlvdTogaHR0cHM6Ly9naXRodWIuY29tL3NpbmRyZXNvcmh1cy9xdWVyeS1zdHJpbmdcbmZ1bmN0aW9uIHBhcnNlU3R5bGVUb09iamVjdChzdHIpIHtcbiAgdmFyIHN0eWxlT2JqZWN0ID0ge307XG5cbiAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3RyID0gc3RyLnRyaW0oKS5zbGljZSgxLCAtMSk7IC8vIGJyb3dzZXJzIHJlLXF1b3RlIHN0cmluZyBzdHlsZSB2YWx1ZXNcblxuICBpZiAoIXN0cikge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0eWxlT2JqZWN0ID0gc3RyLnNwbGl0KCcmJykucmVkdWNlKGZ1bmN0aW9uKHJldCwgcGFyYW0pIHtcbiAgICB2YXIgcGFydHMgPSBwYXJhbS5yZXBsYWNlKC9cXCsvZywgJyAnKS5zcGxpdCgnPScpO1xuICAgIHZhciBrZXkgPSBwYXJ0c1swXTtcbiAgICB2YXIgdmFsID0gcGFydHNbMV07XG4gICAga2V5ID0gZGVjb2RlVVJJQ29tcG9uZW50KGtleSk7XG5cbiAgICAvLyBtaXNzaW5nIGA9YCBzaG91bGQgYmUgYG51bGxgOlxuICAgIC8vIGh0dHA6Ly93My5vcmcvVFIvMjAxMi9XRC11cmwtMjAxMjA1MjQvI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICB2YWwgPSB2YWwgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkZWNvZGVVUklDb21wb25lbnQodmFsKTtcblxuICAgIGlmICghcmV0Lmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgIHJldFtrZXldID0gdmFsO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShyZXRba2V5XSkpIHtcbiAgICAgIHJldFtrZXldLnB1c2godmFsKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0W2tleV0gPSBbcmV0W2tleV0sIHZhbF07XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH0sIHt9KTtcblxuICByZXR1cm4gc3R5bGVPYmplY3Q7XG59XG5cbkZvdW5kYXRpb24uTWVkaWFRdWVyeSA9IE1lZGlhUXVlcnk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBNb3Rpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLm1vdGlvblxuICovXG5cbmNvbnN0IGluaXRDbGFzc2VzICAgPSBbJ211aS1lbnRlcicsICdtdWktbGVhdmUnXTtcbmNvbnN0IGFjdGl2ZUNsYXNzZXMgPSBbJ211aS1lbnRlci1hY3RpdmUnLCAnbXVpLWxlYXZlLWFjdGl2ZSddO1xuXG5jb25zdCBNb3Rpb24gPSB7XG4gIGFuaW1hdGVJbjogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUodHJ1ZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH0sXG5cbiAgYW5pbWF0ZU91dDogZnVuY3Rpb24oZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICAgIGFuaW1hdGUoZmFsc2UsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1vdmUoZHVyYXRpb24sIGVsZW0sIGZuKXtcbiAgdmFyIGFuaW0sIHByb2csIHN0YXJ0ID0gbnVsbDtcbiAgLy8gY29uc29sZS5sb2coJ2NhbGxlZCcpO1xuXG4gIGlmIChkdXJhdGlvbiA9PT0gMCkge1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdmUodHMpe1xuICAgIGlmKCFzdGFydCkgc3RhcnQgPSB0cztcbiAgICAvLyBjb25zb2xlLmxvZyhzdGFydCwgdHMpO1xuICAgIHByb2cgPSB0cyAtIHN0YXJ0O1xuICAgIGZuLmFwcGx5KGVsZW0pO1xuXG4gICAgaWYocHJvZyA8IGR1cmF0aW9uKXsgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSwgZWxlbSk7IH1cbiAgICBlbHNle1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKGFuaW0pO1xuICAgICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgfVxuICB9XG4gIGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUpO1xufVxuXG4vKipcbiAqIEFuaW1hdGVzIGFuIGVsZW1lbnQgaW4gb3Igb3V0IHVzaW5nIGEgQ1NTIHRyYW5zaXRpb24gY2xhc3MuXG4gKiBAZnVuY3Rpb25cbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW4gLSBEZWZpbmVzIGlmIHRoZSBhbmltYXRpb24gaXMgaW4gb3Igb3V0LlxuICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb3IgSFRNTCBvYmplY3QgdG8gYW5pbWF0ZS5cbiAqIEBwYXJhbSB7U3RyaW5nfSBhbmltYXRpb24gLSBDU1MgY2xhc3MgdG8gdXNlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgLSBDYWxsYmFjayB0byBydW4gd2hlbiBhbmltYXRpb24gaXMgZmluaXNoZWQuXG4gKi9cbmZ1bmN0aW9uIGFuaW1hdGUoaXNJbiwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYikge1xuICBlbGVtZW50ID0gJChlbGVtZW50KS5lcSgwKTtcblxuICBpZiAoIWVsZW1lbnQubGVuZ3RoKSByZXR1cm47XG5cbiAgdmFyIGluaXRDbGFzcyA9IGlzSW4gPyBpbml0Q2xhc3Nlc1swXSA6IGluaXRDbGFzc2VzWzFdO1xuICB2YXIgYWN0aXZlQ2xhc3MgPSBpc0luID8gYWN0aXZlQ2xhc3Nlc1swXSA6IGFjdGl2ZUNsYXNzZXNbMV07XG5cbiAgLy8gU2V0IHVwIHRoZSBhbmltYXRpb25cbiAgcmVzZXQoKTtcblxuICBlbGVtZW50XG4gICAgLmFkZENsYXNzKGFuaW1hdGlvbilcbiAgICAuY3NzKCd0cmFuc2l0aW9uJywgJ25vbmUnKTtcblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnQuYWRkQ2xhc3MoaW5pdENsYXNzKTtcbiAgICBpZiAoaXNJbikgZWxlbWVudC5zaG93KCk7XG4gIH0pO1xuXG4gIC8vIFN0YXJ0IHRoZSBhbmltYXRpb25cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50WzBdLm9mZnNldFdpZHRoO1xuICAgIGVsZW1lbnRcbiAgICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnJylcbiAgICAgIC5hZGRDbGFzcyhhY3RpdmVDbGFzcyk7XG4gIH0pO1xuXG4gIC8vIENsZWFuIHVwIHRoZSBhbmltYXRpb24gd2hlbiBpdCBmaW5pc2hlc1xuICBlbGVtZW50Lm9uZShGb3VuZGF0aW9uLnRyYW5zaXRpb25lbmQoZWxlbWVudCksIGZpbmlzaCk7XG5cbiAgLy8gSGlkZXMgdGhlIGVsZW1lbnQgKGZvciBvdXQgYW5pbWF0aW9ucyksIHJlc2V0cyB0aGUgZWxlbWVudCwgYW5kIHJ1bnMgYSBjYWxsYmFja1xuICBmdW5jdGlvbiBmaW5pc2goKSB7XG4gICAgaWYgKCFpc0luKSBlbGVtZW50LmhpZGUoKTtcbiAgICByZXNldCgpO1xuICAgIGlmIChjYikgY2IuYXBwbHkoZWxlbWVudCk7XG4gIH1cblxuICAvLyBSZXNldHMgdHJhbnNpdGlvbnMgYW5kIHJlbW92ZXMgbW90aW9uLXNwZWNpZmljIGNsYXNzZXNcbiAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgZWxlbWVudFswXS5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAwO1xuICAgIGVsZW1lbnQucmVtb3ZlQ2xhc3MoYCR7aW5pdENsYXNzfSAke2FjdGl2ZUNsYXNzfSAke2FuaW1hdGlvbn1gKTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk1vdmUgPSBNb3ZlO1xuRm91bmRhdGlvbi5Nb3Rpb24gPSBNb3Rpb247XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTmVzdCA9IHtcbiAgRmVhdGhlcihtZW51LCB0eXBlID0gJ3pmJykge1xuICAgIG1lbnUuYXR0cigncm9sZScsICdtZW51YmFyJyk7XG5cbiAgICB2YXIgaXRlbXMgPSBtZW51LmZpbmQoJ2xpJykuYXR0cih7J3JvbGUnOiAnbWVudWl0ZW0nfSksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIGl0ZW1zLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcblxuICAgICAgaWYgKCRzdWIubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtXG4gICAgICAgICAgLmFkZENsYXNzKGhhc1N1YkNsYXNzKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdhcmlhLWhhc3BvcHVwJzogdHJ1ZSxcbiAgICAgICAgICAgICdhcmlhLWxhYmVsJzogJGl0ZW0uY2hpbGRyZW4oJ2E6Zmlyc3QnKS50ZXh0KClcbiAgICAgICAgICB9KTtcbiAgICAgICAgICAvLyBOb3RlOiAgRHJpbGxkb3ducyBiZWhhdmUgZGlmZmVyZW50bHkgaW4gaG93IHRoZXkgaGlkZSwgYW5kIHNvIG5lZWRcbiAgICAgICAgICAvLyBhZGRpdGlvbmFsIGF0dHJpYnV0ZXMuICBXZSBzaG91bGQgbG9vayBpZiB0aGlzIHBvc3NpYmx5IG92ZXItZ2VuZXJhbGl6ZWRcbiAgICAgICAgICAvLyB1dGlsaXR5IChOZXN0KSBpcyBhcHByb3ByaWF0ZSB3aGVuIHdlIHJld29yayBtZW51cyBpbiA2LjRcbiAgICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICAgJGl0ZW0uYXR0cih7J2FyaWEtZXhwYW5kZWQnOiBmYWxzZX0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAkc3ViXG4gICAgICAgICAgLmFkZENsYXNzKGBzdWJtZW51ICR7c3ViTWVudUNsYXNzfWApXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2RhdGEtc3VibWVudSc6ICcnLFxuICAgICAgICAgICAgJ3JvbGUnOiAnbWVudSdcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAkc3ViLmF0dHIoeydhcmlhLWhpZGRlbic6IHRydWV9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCkge1xuICAgICAgICAkaXRlbS5hZGRDbGFzcyhgaXMtc3VibWVudS1pdGVtICR7c3ViSXRlbUNsYXNzfWApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIEJ1cm4obWVudSwgdHlwZSkge1xuICAgIHZhciAvL2l0ZW1zID0gbWVudS5maW5kKCdsaScpLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBtZW51XG4gICAgICAuZmluZCgnPmxpLCAubWVudSwgLm1lbnUgPiBsaScpXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7c3ViTWVudUNsYXNzfSAke3N1Ykl0ZW1DbGFzc30gJHtoYXNTdWJDbGFzc30gaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUgaXMtYWN0aXZlYClcbiAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG5cbiAgICAvLyBjb25zb2xlLmxvZyggICAgICBtZW51LmZpbmQoJy4nICsgc3ViTWVudUNsYXNzICsgJywgLicgKyBzdWJJdGVtQ2xhc3MgKyAnLCAuaGFzLXN1Ym1lbnUsIC5pcy1zdWJtZW51LWl0ZW0sIC5zdWJtZW51LCBbZGF0YS1zdWJtZW51XScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVDbGFzcyhzdWJNZW51Q2xhc3MgKyAnICcgKyBzdWJJdGVtQ2xhc3MgKyAnIGhhcy1zdWJtZW51IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51JylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpKTtcbiAgICAvLyBpdGVtcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgLy8gICB2YXIgJGl0ZW0gPSAkKHRoaXMpLFxuICAgIC8vICAgICAgICRzdWIgPSAkaXRlbS5jaGlsZHJlbigndWwnKTtcbiAgICAvLyAgIGlmKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaXMtc3VibWVudS1pdGVtICcgKyBzdWJJdGVtQ2xhc3MpO1xuICAgIC8vICAgfVxuICAgIC8vICAgaWYoJHN1Yi5sZW5ndGgpe1xuICAgIC8vICAgICAkaXRlbS5yZW1vdmVDbGFzcygnaGFzLXN1Ym1lbnUnKTtcbiAgICAvLyAgICAgJHN1Yi5yZW1vdmVDbGFzcygnc3VibWVudSAnICsgc3ViTWVudUNsYXNzKS5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKTtcbiAgICAvLyAgIH1cbiAgICAvLyB9KTtcbiAgfVxufVxuXG5Gb3VuZGF0aW9uLk5lc3QgPSBOZXN0O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmZ1bmN0aW9uIFRpbWVyKGVsZW0sIG9wdGlvbnMsIGNiKSB7XG4gIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICBkdXJhdGlvbiA9IG9wdGlvbnMuZHVyYXRpb24sLy9vcHRpb25zIGlzIGFuIG9iamVjdCBmb3IgZWFzaWx5IGFkZGluZyBmZWF0dXJlcyBsYXRlci5cbiAgICAgIG5hbWVTcGFjZSA9IE9iamVjdC5rZXlzKGVsZW0uZGF0YSgpKVswXSB8fCAndGltZXInLFxuICAgICAgcmVtYWluID0gLTEsXG4gICAgICBzdGFydCxcbiAgICAgIHRpbWVyO1xuXG4gIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcblxuICB0aGlzLnJlc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICByZW1haW4gPSAtMTtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIHRoaXMuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG4gICAgLy8gaWYoIWVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICByZW1haW4gPSByZW1haW4gPD0gMCA/IGR1cmF0aW9uIDogcmVtYWluO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgZmFsc2UpO1xuICAgIHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIGlmKG9wdGlvbnMuaW5maW5pdGUpe1xuICAgICAgICBfdGhpcy5yZXN0YXJ0KCk7Ly9yZXJ1biB0aGUgdGltZXIuXG4gICAgICB9XG4gICAgICBpZiAoY2IgJiYgdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nKSB7IGNiKCk7IH1cbiAgICB9LCByZW1haW4pO1xuICAgIGVsZW0udHJpZ2dlcihgdGltZXJzdGFydC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxuXG4gIHRoaXMucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmlzUGF1c2VkID0gdHJ1ZTtcbiAgICAvL2lmKGVsZW0uZGF0YSgncGF1c2VkJykpeyByZXR1cm4gZmFsc2U7IH0vL21heWJlIGltcGxlbWVudCB0aGlzIHNhbml0eSBjaGVjayBpZiB1c2VkIGZvciBvdGhlciB0aGluZ3MuXG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIHRydWUpO1xuICAgIHZhciBlbmQgPSBEYXRlLm5vdygpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiAtIChlbmQgLSBzdGFydCk7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnBhdXNlZC56Zi4ke25hbWVTcGFjZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFJ1bnMgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGltYWdlcyBhcmUgZnVsbHkgbG9hZGVkLlxuICogQHBhcmFtIHtPYmplY3R9IGltYWdlcyAtIEltYWdlKHMpIHRvIGNoZWNrIGlmIGxvYWRlZC5cbiAqIEBwYXJhbSB7RnVuY30gY2FsbGJhY2sgLSBGdW5jdGlvbiB0byBleGVjdXRlIHdoZW4gaW1hZ2UgaXMgZnVsbHkgbG9hZGVkLlxuICovXG5mdW5jdGlvbiBvbkltYWdlc0xvYWRlZChpbWFnZXMsIGNhbGxiYWNrKXtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgdW5sb2FkZWQgPSBpbWFnZXMubGVuZ3RoO1xuXG4gIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgIGNhbGxiYWNrKCk7XG4gIH1cblxuICBpbWFnZXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAvLyBDaGVjayBpZiBpbWFnZSBpcyBsb2FkZWRcbiAgICBpZiAodGhpcy5jb21wbGV0ZSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSA0KSB8fCAodGhpcy5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSkge1xuICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICB9XG4gICAgLy8gRm9yY2UgbG9hZCB0aGUgaW1hZ2VcbiAgICBlbHNlIHtcbiAgICAgIC8vIGZpeCBmb3IgSUUuIFNlZSBodHRwczovL2Nzcy10cmlja3MuY29tL3NuaXBwZXRzL2pxdWVyeS9maXhpbmctbG9hZC1pbi1pZS1mb3ItY2FjaGVkLWltYWdlcy9cbiAgICAgIHZhciBzcmMgPSAkKHRoaXMpLmF0dHIoJ3NyYycpO1xuICAgICAgJCh0aGlzKS5hdHRyKCdzcmMnLCBzcmMgKyAoc3JjLmluZGV4T2YoJz8nKSA+PSAwID8gJyYnIDogJz8nKSArIChuZXcgRGF0ZSgpLmdldFRpbWUoKSkpO1xuICAgICAgJCh0aGlzKS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc2luZ2xlSW1hZ2VMb2FkZWQoKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2luZ2xlSW1hZ2VMb2FkZWQoKSB7XG4gICAgdW5sb2FkZWQtLTtcbiAgICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICB9XG59XG5cbkZvdW5kYXRpb24uVGltZXIgPSBUaW1lcjtcbkZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQgPSBvbkltYWdlc0xvYWRlZDtcblxufShqUXVlcnkpO1xuIiwiLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKldvcmsgaW5zcGlyZWQgYnkgbXVsdGlwbGUganF1ZXJ5IHN3aXBlIHBsdWdpbnMqKlxuLy8qKkRvbmUgYnkgWW9oYWkgQXJhcmF0ICoqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuKGZ1bmN0aW9uKCQpIHtcblxuICAkLnNwb3RTd2lwZSA9IHtcbiAgICB2ZXJzaW9uOiAnMS4wLjAnLFxuICAgIGVuYWJsZWQ6ICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCxcbiAgICBwcmV2ZW50RGVmYXVsdDogZmFsc2UsXG4gICAgbW92ZVRocmVzaG9sZDogNzUsXG4gICAgdGltZVRocmVzaG9sZDogMjAwXG4gIH07XG5cbiAgdmFyICAgc3RhcnRQb3NYLFxuICAgICAgICBzdGFydFBvc1ksXG4gICAgICAgIHN0YXJ0VGltZSxcbiAgICAgICAgZWxhcHNlZFRpbWUsXG4gICAgICAgIGlzTW92aW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcbiAgICAvLyAgYWxlcnQodGhpcyk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSk7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQpO1xuICAgIGlzTW92aW5nID0gZmFsc2U7XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoTW92ZShlKSB7XG4gICAgaWYgKCQuc3BvdFN3aXBlLnByZXZlbnREZWZhdWx0KSB7IGUucHJldmVudERlZmF1bHQoKTsgfVxuICAgIGlmKGlzTW92aW5nKSB7XG4gICAgICB2YXIgeCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIHZhciB5ID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgdmFyIGR4ID0gc3RhcnRQb3NYIC0geDtcbiAgICAgIHZhciBkeSA9IHN0YXJ0UG9zWSAtIHk7XG4gICAgICB2YXIgZGlyO1xuICAgICAgZWxhcHNlZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHN0YXJ0VGltZTtcbiAgICAgIGlmKE1hdGguYWJzKGR4KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcbiAgICAgICAgZGlyID0gZHggPiAwID8gJ2xlZnQnIDogJ3JpZ2h0JztcbiAgICAgIH1cbiAgICAgIC8vIGVsc2UgaWYoTWF0aC5hYnMoZHkpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgLy8gICBkaXIgPSBkeSA+IDAgPyAnZG93bicgOiAndXAnO1xuICAgICAgLy8gfVxuICAgICAgaWYoZGlyKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgb25Ub3VjaEVuZC5jYWxsKHRoaXMpO1xuICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ3N3aXBlJywgZGlyKS50cmlnZ2VyKGBzd2lwZSR7ZGlyfWApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hTdGFydChlKSB7XG4gICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT0gMSkge1xuICAgICAgc3RhcnRQb3NYID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgc3RhcnRQb3NZID0gZS50b3VjaGVzWzBdLnBhZ2VZO1xuICAgICAgaXNNb3ZpbmcgPSB0cnVlO1xuICAgICAgc3RhcnRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCBmYWxzZSk7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCwgZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdGhpcy5hZGRFdmVudExpc3RlbmVyICYmIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgZmFsc2UpO1xuICB9XG5cbiAgZnVuY3Rpb24gdGVhcmRvd24oKSB7XG4gICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcbiAgfVxuXG4gICQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHsgc2V0dXA6IGluaXQgfTtcblxuICAkLmVhY2goWydsZWZ0JywgJ3VwJywgJ2Rvd24nLCAncmlnaHQnXSwgZnVuY3Rpb24gKCkge1xuICAgICQuZXZlbnQuc3BlY2lhbFtgc3dpcGUke3RoaXN9YF0gPSB7IHNldHVwOiBmdW5jdGlvbigpe1xuICAgICAgJCh0aGlzKS5vbignc3dpcGUnLCAkLm5vb3ApO1xuICAgIH0gfTtcbiAgfSk7XG59KShqUXVlcnkpO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqIE1ldGhvZCBmb3IgYWRkaW5nIHBzdWVkbyBkcmFnIGV2ZW50cyB0byBlbGVtZW50cyAqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuIWZ1bmN0aW9uKCQpe1xuICAkLmZuLmFkZFRvdWNoID0gZnVuY3Rpb24oKXtcbiAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSxlbCl7XG4gICAgICAkKGVsKS5iaW5kKCd0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbCcsZnVuY3Rpb24oKXtcbiAgICAgICAgLy93ZSBwYXNzIHRoZSBvcmlnaW5hbCBldmVudCBvYmplY3QgYmVjYXVzZSB0aGUgalF1ZXJ5IGV2ZW50XG4gICAgICAgIC8vb2JqZWN0IGlzIG5vcm1hbGl6ZWQgdG8gdzNjIHNwZWNzIGFuZCBkb2VzIG5vdCBwcm92aWRlIHRoZSBUb3VjaExpc3RcbiAgICAgICAgaGFuZGxlVG91Y2goZXZlbnQpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICB2YXIgaGFuZGxlVG91Y2ggPSBmdW5jdGlvbihldmVudCl7XG4gICAgICB2YXIgdG91Y2hlcyA9IGV2ZW50LmNoYW5nZWRUb3VjaGVzLFxuICAgICAgICAgIGZpcnN0ID0gdG91Y2hlc1swXSxcbiAgICAgICAgICBldmVudFR5cGVzID0ge1xuICAgICAgICAgICAgdG91Y2hzdGFydDogJ21vdXNlZG93bicsXG4gICAgICAgICAgICB0b3VjaG1vdmU6ICdtb3VzZW1vdmUnLFxuICAgICAgICAgICAgdG91Y2hlbmQ6ICdtb3VzZXVwJ1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdHlwZSA9IGV2ZW50VHlwZXNbZXZlbnQudHlwZV0sXG4gICAgICAgICAgc2ltdWxhdGVkRXZlbnRcbiAgICAgICAgO1xuXG4gICAgICBpZignTW91c2VFdmVudCcgaW4gd2luZG93ICYmIHR5cGVvZiB3aW5kb3cuTW91c2VFdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IG5ldyB3aW5kb3cuTW91c2VFdmVudCh0eXBlLCB7XG4gICAgICAgICAgJ2J1YmJsZXMnOiB0cnVlLFxuICAgICAgICAgICdjYW5jZWxhYmxlJzogdHJ1ZSxcbiAgICAgICAgICAnc2NyZWVuWCc6IGZpcnN0LnNjcmVlblgsXG4gICAgICAgICAgJ3NjcmVlblknOiBmaXJzdC5zY3JlZW5ZLFxuICAgICAgICAgICdjbGllbnRYJzogZmlyc3QuY2xpZW50WCxcbiAgICAgICAgICAnY2xpZW50WSc6IGZpcnN0LmNsaWVudFlcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaW11bGF0ZWRFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdNb3VzZUV2ZW50Jyk7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50LmluaXRNb3VzZUV2ZW50KHR5cGUsIHRydWUsIHRydWUsIHdpbmRvdywgMSwgZmlyc3Quc2NyZWVuWCwgZmlyc3Quc2NyZWVuWSwgZmlyc3QuY2xpZW50WCwgZmlyc3QuY2xpZW50WSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgZmFsc2UsIDAvKmxlZnQqLywgbnVsbCk7XG4gICAgICB9XG4gICAgICBmaXJzdC50YXJnZXQuZGlzcGF0Y2hFdmVudChzaW11bGF0ZWRFdmVudCk7XG4gICAgfTtcbiAgfTtcbn0oalF1ZXJ5KTtcblxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipGcm9tIHRoZSBqUXVlcnkgTW9iaWxlIExpYnJhcnkqKlxuLy8qKm5lZWQgdG8gcmVjcmVhdGUgZnVuY3Rpb25hbGl0eSoqXG4vLyoqYW5kIHRyeSB0byBpbXByb3ZlIGlmIHBvc3NpYmxlKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vKiBSZW1vdmluZyB0aGUgalF1ZXJ5IGZ1bmN0aW9uICoqKipcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4oZnVuY3Rpb24oICQsIHdpbmRvdywgdW5kZWZpbmVkICkge1xuXG5cdHZhciAkZG9jdW1lbnQgPSAkKCBkb2N1bWVudCApLFxuXHRcdC8vIHN1cHBvcnRUb3VjaCA9ICQubW9iaWxlLnN1cHBvcnQudG91Y2gsXG5cdFx0dG91Y2hTdGFydEV2ZW50ID0gJ3RvdWNoc3RhcnQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoc3RhcnRcIiA6IFwibW91c2Vkb3duXCIsXG5cdFx0dG91Y2hTdG9wRXZlbnQgPSAndG91Y2hlbmQnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNoZW5kXCIgOiBcIm1vdXNldXBcIixcblx0XHR0b3VjaE1vdmVFdmVudCA9ICd0b3VjaG1vdmUnLy9zdXBwb3J0VG91Y2ggPyBcInRvdWNobW92ZVwiIDogXCJtb3VzZW1vdmVcIjtcblxuXHQvLyBzZXR1cCBuZXcgZXZlbnQgc2hvcnRjdXRzXG5cdCQuZWFjaCggKCBcInRvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIFwiICtcblx0XHRcInN3aXBlIHN3aXBlbGVmdCBzd2lwZXJpZ2h0XCIgKS5zcGxpdCggXCIgXCIgKSwgZnVuY3Rpb24oIGksIG5hbWUgKSB7XG5cblx0XHQkLmZuWyBuYW1lIF0gPSBmdW5jdGlvbiggZm4gKSB7XG5cdFx0XHRyZXR1cm4gZm4gPyB0aGlzLmJpbmQoIG5hbWUsIGZuICkgOiB0aGlzLnRyaWdnZXIoIG5hbWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8galF1ZXJ5IDwgMS44XG5cdFx0aWYgKCAkLmF0dHJGbiApIHtcblx0XHRcdCQuYXR0ckZuWyBuYW1lIF0gPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0ZnVuY3Rpb24gdHJpZ2dlckN1c3RvbUV2ZW50KCBvYmosIGV2ZW50VHlwZSwgZXZlbnQsIGJ1YmJsZSApIHtcblx0XHR2YXIgb3JpZ2luYWxUeXBlID0gZXZlbnQudHlwZTtcblx0XHRldmVudC50eXBlID0gZXZlbnRUeXBlO1xuXHRcdGlmICggYnViYmxlICkge1xuXHRcdFx0JC5ldmVudC50cmlnZ2VyKCBldmVudCwgdW5kZWZpbmVkLCBvYmogKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JC5ldmVudC5kaXNwYXRjaC5jYWxsKCBvYmosIGV2ZW50ICk7XG5cdFx0fVxuXHRcdGV2ZW50LnR5cGUgPSBvcmlnaW5hbFR5cGU7XG5cdH1cblxuXHQvLyBhbHNvIGhhbmRsZXMgdGFwaG9sZFxuXG5cdC8vIEFsc28gaGFuZGxlcyBzd2lwZWxlZnQsIHN3aXBlcmlnaHRcblx0JC5ldmVudC5zcGVjaWFsLnN3aXBlID0ge1xuXG5cdFx0Ly8gTW9yZSB0aGFuIHRoaXMgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQsIGFuZCB3ZSB3aWxsIHN1cHByZXNzIHNjcm9sbGluZy5cblx0XHRzY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkOiAzMCxcblxuXHRcdC8vIE1vcmUgdGltZSB0aGFuIHRoaXMsIGFuZCBpdCBpc24ndCBhIHN3aXBlLlxuXHRcdGR1cmF0aW9uVGhyZXNob2xkOiAxMDAwLFxuXG5cdFx0Ly8gU3dpcGUgaG9yaXpvbnRhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBtb3JlIHRoYW4gdGhpcy5cblx0XHRob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Ly8gU3dpcGUgdmVydGljYWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbGVzcyB0aGFuIHRoaXMuXG5cdFx0dmVydGljYWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHRnZXRMb2NhdGlvbjogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRcdHZhciB3aW5QYWdlWCA9IHdpbmRvdy5wYWdlWE9mZnNldCxcblx0XHRcdFx0d2luUGFnZVkgPSB3aW5kb3cucGFnZVlPZmZzZXQsXG5cdFx0XHRcdHggPSBldmVudC5jbGllbnRYLFxuXHRcdFx0XHR5ID0gZXZlbnQuY2xpZW50WTtcblxuXHRcdFx0aWYgKCBldmVudC5wYWdlWSA9PT0gMCAmJiBNYXRoLmZsb29yKCB5ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWSApIHx8XG5cdFx0XHRcdGV2ZW50LnBhZ2VYID09PSAwICYmIE1hdGguZmxvb3IoIHggKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gaU9TNCBjbGllbnRYL2NsaWVudFkgaGF2ZSB0aGUgdmFsdWUgdGhhdCBzaG91bGQgaGF2ZSBiZWVuXG5cdFx0XHRcdC8vIGluIHBhZ2VYL3BhZ2VZLiBXaGlsZSBwYWdlWC9wYWdlLyBoYXZlIHRoZSB2YWx1ZSAwXG5cdFx0XHRcdHggPSB4IC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSB5IC0gd2luUGFnZVk7XG5cdFx0XHR9IGVsc2UgaWYgKCB5IDwgKCBldmVudC5wYWdlWSAtIHdpblBhZ2VZKSB8fCB4IDwgKCBldmVudC5wYWdlWCAtIHdpblBhZ2VYICkgKSB7XG5cblx0XHRcdFx0Ly8gU29tZSBBbmRyb2lkIGJyb3dzZXJzIGhhdmUgdG90YWxseSBib2d1cyB2YWx1ZXMgZm9yIGNsaWVudFgvWVxuXHRcdFx0XHQvLyB3aGVuIHNjcm9sbGluZy96b29taW5nIGEgcGFnZS4gRGV0ZWN0YWJsZSBzaW5jZSBjbGllbnRYL2NsaWVudFlcblx0XHRcdFx0Ly8gc2hvdWxkIG5ldmVyIGJlIHNtYWxsZXIgdGhhbiBwYWdlWC9wYWdlWSBtaW51cyBwYWdlIHNjcm9sbFxuXHRcdFx0XHR4ID0gZXZlbnQucGFnZVggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IGV2ZW50LnBhZ2VZIC0gd2luUGFnZVk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHg6IHgsXG5cdFx0XHRcdHk6IHlcblx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdLFxuXHRcdFx0XHRcdFx0b3JpZ2luOiAkKCBldmVudC50YXJnZXQgKVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdHN0b3A6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF1cblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRoYW5kbGVTd2lwZTogZnVuY3Rpb24oIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICkge1xuXHRcdFx0aWYgKCBzdG9wLnRpbWUgLSBzdGFydC50aW1lIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLmR1cmF0aW9uVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ob3Jpem9udGFsRGlzdGFuY2VUaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMSBdIC0gc3RvcC5jb29yZHNbIDEgXSApIDwgJC5ldmVudC5zcGVjaWFsLnN3aXBlLnZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQgKSB7XG5cdFx0XHRcdHZhciBkaXJlY3Rpb24gPSBzdGFydC5jb29yZHNbMF0gPiBzdG9wLmNvb3Jkc1sgMCBdID8gXCJzd2lwZWxlZnRcIiA6IFwic3dpcGVyaWdodFwiO1xuXG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgXCJzd2lwZVwiLCAkLkV2ZW50KCBcInN3aXBlXCIsIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0pLCB0cnVlICk7XG5cdFx0XHRcdHRyaWdnZXJDdXN0b21FdmVudCggdGhpc09iamVjdCwgZGlyZWN0aW9uLCQuRXZlbnQoIGRpcmVjdGlvbiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSApLCB0cnVlICk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fSxcblxuXHRcdC8vIFRoaXMgc2VydmVzIGFzIGEgZmxhZyB0byBlbnN1cmUgdGhhdCBhdCBtb3N0IG9uZSBzd2lwZSBldmVudCBldmVudCBpc1xuXHRcdC8vIGluIHdvcmsgYXQgYW55IGdpdmVuIHRpbWVcblx0XHRldmVudEluUHJvZ3Jlc3M6IGZhbHNlLFxuXG5cdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cyxcblx0XHRcdFx0dGhpc09iamVjdCA9IHRoaXMsXG5cdFx0XHRcdCR0aGlzID0gJCggdGhpc09iamVjdCApLFxuXHRcdFx0XHRjb250ZXh0ID0ge307XG5cblx0XHRcdC8vIFJldHJpZXZlIHRoZSBldmVudHMgZGF0YSBmb3IgdGhpcyBlbGVtZW50IGFuZCBhZGQgdGhlIHN3aXBlIGNvbnRleHRcblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggIWV2ZW50cyApIHtcblx0XHRcdFx0ZXZlbnRzID0geyBsZW5ndGg6IDAgfTtcblx0XHRcdFx0JC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiwgZXZlbnRzICk7XG5cdFx0XHR9XG5cdFx0XHRldmVudHMubGVuZ3RoKys7XG5cdFx0XHRldmVudHMuc3dpcGUgPSBjb250ZXh0O1xuXG5cdFx0XHRjb250ZXh0LnN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXG5cdFx0XHRcdC8vIEJhaWwgaWYgd2UncmUgYWxyZWFkeSB3b3JraW5nIG9uIGEgc3dpcGUgZXZlbnRcblx0XHRcdFx0aWYgKCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gdHJ1ZTtcblxuXHRcdFx0XHR2YXIgc3RvcCxcblx0XHRcdFx0XHRzdGFydCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdGFydCggZXZlbnQgKSxcblx0XHRcdFx0XHRvcmlnVGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0XHRcdGVtaXR0ZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdFx0aWYgKCAhc3RhcnQgfHwgZXZlbnQuaXNEZWZhdWx0UHJldmVudGVkKCkgKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0c3RvcCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zdG9wKCBldmVudCApO1xuXHRcdFx0XHRcdGlmICggIWVtaXR0ZWQgKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhhbmRsZVN3aXBlKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApO1xuXHRcdFx0XHRcdFx0aWYgKCBlbWl0dGVkICkge1xuXG5cdFx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIHByZXZlbnQgc2Nyb2xsaW5nXG5cdFx0XHRcdFx0aWYgKCBNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZCApIHtcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGNvbnRleHQuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdC8vIFJlc2V0IHRoZSBjb250ZXh0IHRvIG1ha2Ugd2F5IGZvciB0aGUgbmV4dCBzd2lwZSBldmVudFxuXHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tb3ZlID0gbnVsbDtcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQkZG9jdW1lbnQub24oIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKVxuXHRcdFx0XHRcdC5vbmUoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdH07XG5cdFx0XHQkdGhpcy5vbiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0fSxcblxuXHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsIGNvbnRleHQ7XG5cblx0XHRcdGV2ZW50cyA9ICQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdGlmICggZXZlbnRzICkge1xuXHRcdFx0XHRjb250ZXh0ID0gZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRkZWxldGUgZXZlbnRzLnN3aXBlO1xuXHRcdFx0XHRldmVudHMubGVuZ3RoLS07XG5cdFx0XHRcdGlmICggZXZlbnRzLmxlbmd0aCA9PT0gMCApIHtcblx0XHRcdFx0XHQkLnJlbW92ZURhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBjb250ZXh0ICkge1xuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RhcnQgKSB7XG5cdFx0XHRcdFx0JCggdGhpcyApLm9mZiggdG91Y2hTdGFydEV2ZW50LCBjb250ZXh0LnN0YXJ0ICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0Lm1vdmUgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5zdG9wICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoU3RvcEV2ZW50LCBjb250ZXh0LnN0b3AgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0JC5lYWNoKHtcblx0XHRzd2lwZWxlZnQ6IFwic3dpcGUubGVmdFwiLFxuXHRcdHN3aXBlcmlnaHQ6IFwic3dpcGUucmlnaHRcIlxuXHR9LCBmdW5jdGlvbiggZXZlbnQsIHNvdXJjZUV2ZW50ICkge1xuXG5cdFx0JC5ldmVudC5zcGVjaWFsWyBldmVudCBdID0ge1xuXHRcdFx0c2V0dXA6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkuYmluZCggc291cmNlRXZlbnQsICQubm9vcCApO1xuXHRcdFx0fSxcblx0XHRcdHRlYXJkb3duOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLnVuYmluZCggc291cmNlRXZlbnQgKTtcblx0XHRcdH1cblx0XHR9O1xuXHR9KTtcbn0pKCBqUXVlcnksIHRoaXMgKTtcbiovXG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE11dGF0aW9uT2JzZXJ2ZXIgPSAoZnVuY3Rpb24gKCkge1xuICB2YXIgcHJlZml4ZXMgPSBbJ1dlYktpdCcsICdNb3onLCAnTycsICdNcycsICcnXTtcbiAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmAgaW4gd2luZG93KSB7XG4gICAgICByZXR1cm4gd2luZG93W2Ake3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufSgpKTtcblxuY29uc3QgdHJpZ2dlcnMgPSAoZWwsIHR5cGUpID0+IHtcbiAgZWwuZGF0YSh0eXBlKS5zcGxpdCgnICcpLmZvckVhY2goaWQgPT4ge1xuICAgICQoYCMke2lkfWApWyB0eXBlID09PSAnY2xvc2UnID8gJ3RyaWdnZXInIDogJ3RyaWdnZXJIYW5kbGVyJ10oYCR7dHlwZX0uemYudHJpZ2dlcmAsIFtlbF0pO1xuICB9KTtcbn07XG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLW9wZW5dIHdpbGwgcmV2ZWFsIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtb3Blbl0nLCBmdW5jdGlvbigpIHtcbiAgdHJpZ2dlcnMoJCh0aGlzKSwgJ29wZW4nKTtcbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NlXSB3aWxsIGNsb3NlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuLy8gSWYgdXNlZCB3aXRob3V0IGEgdmFsdWUgb24gW2RhdGEtY2xvc2VdLCB0aGUgZXZlbnQgd2lsbCBidWJibGUsIGFsbG93aW5nIGl0IHRvIGNsb3NlIGEgcGFyZW50IGNvbXBvbmVudC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ2Nsb3NlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICdjbG9zZScpO1xuICB9XG4gIGVsc2Uge1xuICAgICQodGhpcykudHJpZ2dlcignY2xvc2UuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS10b2dnbGVdIHdpbGwgdG9nZ2xlIGEgcGx1Z2luIHRoYXQgc3VwcG9ydHMgaXQgd2hlbiBjbGlja2VkLlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAndG9nZ2xlJyk7XG4gIH0gZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCd0b2dnbGUuemYudHJpZ2dlcicpO1xuICB9XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zYWJsZV0gd2lsbCByZXNwb25kIHRvIGNsb3NlLnpmLnRyaWdnZXIgZXZlbnRzLlxuJChkb2N1bWVudCkub24oJ2Nsb3NlLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2FibGVdJywgZnVuY3Rpb24oZSl7XG4gIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIGxldCBhbmltYXRpb24gPSAkKHRoaXMpLmRhdGEoJ2Nsb3NhYmxlJyk7XG5cbiAgaWYoYW5pbWF0aW9uICE9PSAnJyl7XG4gICAgRm91bmRhdGlvbi5Nb3Rpb24uYW5pbWF0ZU91dCgkKHRoaXMpLCBhbmltYXRpb24sIGZ1bmN0aW9uKCkge1xuICAgICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgICB9KTtcbiAgfWVsc2V7XG4gICAgJCh0aGlzKS5mYWRlT3V0KCkudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gIH1cbn0pO1xuXG4kKGRvY3VtZW50KS5vbignZm9jdXMuemYudHJpZ2dlciBibHVyLnpmLnRyaWdnZXInLCAnW2RhdGEtdG9nZ2xlLWZvY3VzXScsIGZ1bmN0aW9uKCkge1xuICBsZXQgaWQgPSAkKHRoaXMpLmRhdGEoJ3RvZ2dsZS1mb2N1cycpO1xuICAkKGAjJHtpZH1gKS50cmlnZ2VySGFuZGxlcigndG9nZ2xlLnpmLnRyaWdnZXInLCBbJCh0aGlzKV0pO1xufSk7XG5cbi8qKlxuKiBGaXJlcyBvbmNlIGFmdGVyIGFsbCBvdGhlciBzY3JpcHRzIGhhdmUgbG9hZGVkXG4qIEBmdW5jdGlvblxuKiBAcHJpdmF0ZVxuKi9cbiQod2luZG93KS5vbignbG9hZCcsICgpID0+IHtcbiAgY2hlY2tMaXN0ZW5lcnMoKTtcbn0pO1xuXG5mdW5jdGlvbiBjaGVja0xpc3RlbmVycygpIHtcbiAgZXZlbnRzTGlzdGVuZXIoKTtcbiAgcmVzaXplTGlzdGVuZXIoKTtcbiAgc2Nyb2xsTGlzdGVuZXIoKTtcbiAgbXV0YXRlTGlzdGVuZXIoKTtcbiAgY2xvc2VtZUxpc3RlbmVyKCk7XG59XG5cbi8vKioqKioqKiogb25seSBmaXJlcyB0aGlzIGZ1bmN0aW9uIG9uY2Ugb24gbG9hZCwgaWYgdGhlcmUncyBzb21ldGhpbmcgdG8gd2F0Y2ggKioqKioqKipcbmZ1bmN0aW9uIGNsb3NlbWVMaXN0ZW5lcihwbHVnaW5OYW1lKSB7XG4gIHZhciB5ZXRpQm94ZXMgPSAkKCdbZGF0YS15ZXRpLWJveF0nKSxcbiAgICAgIHBsdWdOYW1lcyA9IFsnZHJvcGRvd24nLCAndG9vbHRpcCcsICdyZXZlYWwnXTtcblxuICBpZihwbHVnaW5OYW1lKXtcbiAgICBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLnB1c2gocGx1Z2luTmFtZSk7XG4gICAgfWVsc2UgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwbHVnaW5OYW1lWzBdID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMuY29uY2F0KHBsdWdpbk5hbWUpO1xuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5lcnJvcignUGx1Z2luIG5hbWVzIG11c3QgYmUgc3RyaW5ncycpO1xuICAgIH1cbiAgfVxuICBpZih5ZXRpQm94ZXMubGVuZ3RoKXtcbiAgICBsZXQgbGlzdGVuZXJzID0gcGx1Z05hbWVzLm1hcCgobmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIGBjbG9zZW1lLnpmLiR7bmFtZX1gO1xuICAgIH0pLmpvaW4oJyAnKTtcblxuICAgICQod2luZG93KS5vZmYobGlzdGVuZXJzKS5vbihsaXN0ZW5lcnMsIGZ1bmN0aW9uKGUsIHBsdWdpbklkKXtcbiAgICAgIGxldCBwbHVnaW4gPSBlLm5hbWVzcGFjZS5zcGxpdCgnLicpWzBdO1xuICAgICAgbGV0IHBsdWdpbnMgPSAkKGBbZGF0YS0ke3BsdWdpbn1dYCkubm90KGBbZGF0YS15ZXRpLWJveD1cIiR7cGx1Z2luSWR9XCJdYCk7XG5cbiAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICBsZXQgX3RoaXMgPSAkKHRoaXMpO1xuXG4gICAgICAgIF90aGlzLnRyaWdnZXJIYW5kbGVyKCdjbG9zZS56Zi50cmlnZ2VyJywgW190aGlzXSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNpemVMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXJlc2l6ZV0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZigncmVzaXplLnpmLnRyaWdnZXInKVxuICAgIC5vbigncmVzaXplLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdyZXNpemVtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHJlc2l6ZSBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInJlc2l6ZVwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHJlc2l6ZSBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHNjcm9sbExpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtc2Nyb2xsXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdzY3JvbGwuemYudHJpZ2dlcicpXG4gICAgLm9uKCdzY3JvbGwuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpe1xuICAgICAgaWYodGltZXIpeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgc2Nyb2xsIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwic2Nyb2xsXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgc2Nyb2xsIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbXV0YXRlTGlzdGVuZXIoZGVib3VuY2UpIHtcbiAgICBsZXQgJG5vZGVzID0gJCgnW2RhdGEtbXV0YXRlXScpO1xuICAgIGlmICgkbm9kZXMubGVuZ3RoICYmIE11dGF0aW9uT2JzZXJ2ZXIpe1xuXHRcdFx0Ly90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0ZSBldmVudFxuICAgICAgLy9ubyBJRSA5IG9yIDEwXG5cdFx0XHQkbm9kZXMuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHQgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInKTtcblx0XHRcdH0pO1xuICAgIH1cbiB9XG5cbmZ1bmN0aW9uIGV2ZW50c0xpc3RlbmVyKCkge1xuICBpZighTXV0YXRpb25PYnNlcnZlcil7IHJldHVybiBmYWxzZTsgfVxuICBsZXQgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yZXNpemVdLCBbZGF0YS1zY3JvbGxdLCBbZGF0YS1tdXRhdGVdJyk7XG5cbiAgLy9lbGVtZW50IGNhbGxiYWNrXG4gIHZhciBsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uID0gZnVuY3Rpb24gKG11dGF0aW9uUmVjb3Jkc0xpc3QpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG5cblx0ICAvL3RyaWdnZXIgdGhlIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBlbGVtZW50IGRlcGVuZGluZyBvbiB0eXBlXG4gICAgICBzd2l0Y2ggKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udHlwZSkge1xuXG4gICAgICAgIGNhc2UgXCJhdHRyaWJ1dGVzXCI6XG4gICAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInNjcm9sbFwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG5cdFx0ICBcdCR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInLCBbJHRhcmdldCwgd2luZG93LnBhZ2VZT2Zmc2V0XSk7XG5cdFx0ICB9XG5cdFx0ICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwicmVzaXplXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0XSk7XG5cdFx0ICAgfVxuXHRcdCAgaWYgKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIik7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuXHRcdCAgfVxuXHRcdCAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImNoaWxkTGlzdFwiOlxuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvL25vdGhpbmdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuICAgICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCBvciBtdXRhdGlvbiBhZGQgYSBzaW5nbGUgb2JzZXJ2ZXJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG5vZGVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2YXIgZWxlbWVudE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbik7XG4gICAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKG5vZGVzW2ldLCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZUZpbHRlcjogW1wiZGF0YS1ldmVudHNcIiwgXCJzdHlsZVwiXSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFtQSF1cbi8vIEZvdW5kYXRpb24uQ2hlY2tXYXRjaGVycyA9IGNoZWNrV2F0Y2hlcnM7XG5Gb3VuZGF0aW9uLklIZWFyWW91ID0gY2hlY2tMaXN0ZW5lcnM7XG4vLyBGb3VuZGF0aW9uLklTZWVZb3UgPSBzY3JvbGxMaXN0ZW5lcjtcbi8vIEZvdW5kYXRpb24uSUZlZWxZb3UgPSBjbG9zZW1lTGlzdGVuZXI7XG5cbn0oalF1ZXJ5KTtcblxuLy8gZnVuY3Rpb24gZG9tTXV0YXRpb25PYnNlcnZlcihkZWJvdW5jZSkge1xuLy8gICAvLyAhISEgVGhpcyBpcyBjb21pbmcgc29vbiBhbmQgbmVlZHMgbW9yZSB3b3JrOyBub3QgYWN0aXZlICAhISEgLy9cbi8vICAgdmFyIHRpbWVyLFxuLy8gICBub2RlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLW11dGF0ZV0nKTtcbi8vICAgLy9cbi8vICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuLy8gICAgIC8vIHZhciBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbi8vICAgICAvLyAgIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuLy8gICAgIC8vICAgZm9yICh2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKyspIHtcbi8vICAgICAvLyAgICAgaWYgKHByZWZpeGVzW2ldICsgJ011dGF0aW9uT2JzZXJ2ZXInIGluIHdpbmRvdykge1xuLy8gICAgIC8vICAgICAgIHJldHVybiB3aW5kb3dbcHJlZml4ZXNbaV0gKyAnTXV0YXRpb25PYnNlcnZlciddO1xuLy8gICAgIC8vICAgICB9XG4vLyAgICAgLy8gICB9XG4vLyAgICAgLy8gICByZXR1cm4gZmFsc2U7XG4vLyAgICAgLy8gfSgpKTtcbi8vXG4vL1xuLy8gICAgIC8vZm9yIHRoZSBib2R5LCB3ZSBuZWVkIHRvIGxpc3RlbiBmb3IgYWxsIGNoYW5nZXMgZWZmZWN0aW5nIHRoZSBzdHlsZSBhbmQgY2xhc3MgYXR0cmlidXRlc1xuLy8gICAgIHZhciBib2R5T2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihib2R5TXV0YXRpb24pO1xuLy8gICAgIGJvZHlPYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LmJvZHksIHsgYXR0cmlidXRlczogdHJ1ZSwgY2hpbGRMaXN0OiB0cnVlLCBjaGFyYWN0ZXJEYXRhOiBmYWxzZSwgc3VidHJlZTp0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6W1wic3R5bGVcIiwgXCJjbGFzc1wiXX0pO1xuLy9cbi8vXG4vLyAgICAgLy9ib2R5IGNhbGxiYWNrXG4vLyAgICAgZnVuY3Rpb24gYm9keU11dGF0aW9uKG11dGF0ZSkge1xuLy8gICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIG11dGF0aW9uIGV2ZW50XG4vLyAgICAgICBpZiAodGltZXIpIHsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuLy9cbi8vICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbi8vICAgICAgICAgYm9keU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbi8vICAgICAgICAgJCgnW2RhdGEtbXV0YXRlXScpLmF0dHIoJ2RhdGEtZXZlbnRzJyxcIm11dGF0ZVwiKTtcbi8vICAgICAgIH0sIGRlYm91bmNlIHx8IDE1MCk7XG4vLyAgICAgfVxuLy8gICB9XG4vLyB9XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuLy8gRm91bmRhdGlvbiBDb3JlXG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi5jb3JlLmpzJztcbi8vIEZvdW5kYXRpb24gVXRpbGl0aWVzXG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLmJveC5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzJztcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeS5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLm1vdGlvbi5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi51dGlsLm5lc3QuanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyLmpzJztcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLnV0aWwudG91Y2guanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyc7XG4vLyBGb3VuZGF0aW9uIFBsdWdpbnMuIEFkZCBvciByZW1vdmUgYXMgbmVlZGVkIGZvciB5b3VyIHNpdGVcbmltcG9ydCAnZm91bmRhdGlvbi1zaXRlcy9qcy9mb3VuZGF0aW9uLmRyaWxsZG93bi5qcyc7XG5pbXBvcnQgJ2ZvdW5kYXRpb24tc2l0ZXMvanMvZm91bmRhdGlvbi5kcm9wZG93bk1lbnUuanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24ucmVzcG9uc2l2ZU1lbnUuanMnO1xuaW1wb3J0ICdmb3VuZGF0aW9uLXNpdGVzL2pzL2ZvdW5kYXRpb24ub2ZmY2FudmFzLmpzJztcblxuaW1wb3J0IGpxdWVyeSBmcm9tICdqcXVlcnknO1xuaW1wb3J0IHNvY2lhbFNoYXJlIGZyb20gJ21vZHVsZXMvc29jaWFsU2hhcmUuanMnO1xuaW1wb3J0IGNhcm91c2VsIGZyb20gJ21vZHVsZXMvY2Fyb3VzZWwuanMnO1xuaW1wb3J0IGFjY29yZGlvbiBmcm9tICdtb2R1bGVzL2FjY29yZGlvbi5qcyc7XG5cbihmdW5jdGlvbigkKSB7XG4gIC8vIEluaXRpYWxpemUgRm91bmRhdGlvblxuICAkKGRvY3VtZW50KS5mb3VuZGF0aW9uKCk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBzb2NpYWwgc2hhcmUgZnVuY3Rpb25hbGl0eVxuICAvLyBSZXBsYWNlIHRoZSBlbXB0eSBzdHJpbmcgcGFyYW1ldGVyIHdpdGggeW91ciBGYWNlYm9vayBJRFxuICBzb2NpYWxTaGFyZSgnJyk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBjYXJvdXNlbHNcbiAgY2Fyb3VzZWwoKTtcblxuICAvLyBJbml0aWFsaXplIGFjY29yZGlvbnNcbiAgYWNjb3JkaW9uKCk7XG5cbiAgLy8gSW5pdGlhbGl6ZSBQbHVnaW5zXG4gICQoJy5tYWduaWZpYy10cmlnZ2VyJykubWFnbmlmaWNQb3B1cCh7XG4gICAgdHlwZTogJ2lubGluZScsXG4gIH0pO1xuXG4gICQoJy5tZWVya2F0LWN0YScpLm1lZXJrYXQoe1xuICAgIGJhY2tncm91bmQ6ICdyZ2IoMjEsIDc2LCAxMDIpIHJlcGVhdC14IGxlZnQgdG9wJyxcbiAgICBoZWlnaHQ6ICcxMjBweCcsXG4gICAgd2lkdGg6ICcxMDAlJyxcbiAgICBwb3NpdGlvbjogJ2JvdHRvbScsXG4gICAgY2xvc2U6ICcuY2xvc2UtbWVlcmthdCcsXG4gICAgZG9udFNob3dBZ2FpbjogJy5kb250LXNob3cnLFxuICAgIGFuaW1hdGlvbkluOiAnZmFkZScsXG4gICAgYW5pbWF0aW9uU3BlZWQ6IDUwMCxcbiAgICBvcGFjaXR5OiAwLjksXG4gIH0pO1xufSkoanF1ZXJ5KTtcbiIsIi8qIGVzbGludC1lbnYgYnJvd3NlciAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgJCBmcm9tICdqcXVlcnknO1xuXG5jb25zdCBhY2NvcmRpb24gPSBmdW5jdGlvbigpIHtcbiAgY29uc3QgJHRvZ2dsZUJ1dHRvbiA9ICQoJ1tkYXRhLWFjY29yZGlvbi10b2dnbGVdJyk7XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWNjb3JkaW9uIGNvbnRhaW5lciBoZWlnaHQgZGVjbGFyYXRpb25cbiAgICovXG4gIGZ1bmN0aW9uIHByZXBUb2dnbGVDb250YWluZXIoKSB7XG4gICAgJHRvZ2dsZUJ1dHRvbi5lYWNoKGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnN0ICR0aGlzID0gJCh0aGlzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1pbnZhbGlkLXRoaXNcbiAgICAgIGNvbnN0ICR0b2dnbGVDb250ZW50ID0gJHRoaXMuY2xvc2VzdCgnLmFjY29yZGlvbi1saXN0X19pdGVtJylcbiAgICAgICAgLmZpbmQoJHRvZ2dsZUJ1dHRvbi5kYXRhKCdhY2NvcmRpb24tdG9nZ2xlJykpO1xuICAgICAgY29uc3QgaXNIaWRkZW4gPSAkdG9nZ2xlQ29udGVudC5hdHRyKCdhcmlhLWhpZGRlbicpID09PSAnZmFsc2UnXG4gICAgICAgID8gZmFsc2UgOiB0cnVlO1xuICAgICAgJHRvZ2dsZUNvbnRlbnQuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSk7XG4gICAgICAkdG9nZ2xlQ29udGVudC5jc3MoJ2hlaWdodCcsICcnKTtcbiAgICAgICR0b2dnbGVDb250ZW50LmNzcygnaGVpZ2h0JywgJHRvZ2dsZUNvbnRlbnQuaGVpZ2h0KCkpO1xuICAgICAgJHRvZ2dsZUNvbnRlbnQuYXR0cignYXJpYS1oaWRkZW4nLCBpc0hpZGRlbik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVG9nZ2xlcyBhY2NvcmRpb24gY29udGFpbmVyXG4gICAqL1xuICBmdW5jdGlvbiB0b2dnbGUoKSB7XG4gICAgY29uc3QgdG9nZ2xlU2VjdGlvbiA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnN0ICR0aGlzID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgY29uc29sZS5sb2coJHRoaXMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICR0aGlzLnRvZ2dsZUNsYXNzKCdhY2NvcmRpb24tYWN0aXZlJyk7XG4gICAgICBjb25zdCAkY3VycmVudFRvZ2dsZUNvbnRhaW5lciA9ICR0aGlzLmNsb3Nlc3QoJy5hY2NvcmRpb24tbGlzdF9faXRlbScpXG4gICAgICAgIC5maW5kKCR0aGlzLmRhdGEoJ2FjY29yZGlvbi10b2dnbGUnKSk7XG4gICAgICBjb25zdCBpc0hpZGRlbiA9ICRjdXJyZW50VG9nZ2xlQ29udGFpbmVyXG4gICAgICAgIC5hdHRyKCdhcmlhLWhpZGRlbicpID09PSAnZmFsc2UnID8gZmFsc2UgOiB0cnVlO1xuICAgICAgJGN1cnJlbnRUb2dnbGVDb250YWluZXIuYXR0cignYXJpYS1oaWRkZW4nLCAhaXNIaWRkZW4pO1xuICAgIH07XG5cbiAgICAkdG9nZ2xlQnV0dG9uLm9uKCdjbGljaycsIHRvZ2dsZVNlY3Rpb24pO1xuICB9XG5cbiAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgcHJlcFRvZ2dsZUNvbnRhaW5lcigpO1xuICAgIHRvZ2dsZSgpO1xuICB9KTtcblxuICAkKHdpbmRvdykub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uKCkge1xuICAgIHByZXBUb2dnbGVDb250YWluZXIoKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBhY2NvcmRpb247XG4iLCIvKiBlc2xpbnQtZW52IGJyb3dzZXIgKi9cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0ICQgZnJvbSAnanF1ZXJ5JztcbmltcG9ydCAndmVuZG9yL2pxdWVyeS5zbGljay5qcyc7XG5cbmNvbnN0IGNhcm91c2VsID0gZnVuY3Rpb24oKSB7XG4gICQoJy5qcy1jYXJvdXNlbCcpLnNsaWNrKHtcbiAgICBzbGlkZXNUb1Nob3c6IDMsXG4gICAgc2xpZGVzVG9TY3JvbGw6IDEsXG4gICAgYXJyb3dzOiB0cnVlLFxuICAgIGRvdHM6IGZhbHNlLFxuICAgIGZvY3VzT25TZWxlY3Q6IGZhbHNlLFxuICAgIGluZmluaXRlOiB0cnVlLFxuICAgIHJlc3BvbnNpdmU6IFtcbiAgICAgIHtcbiAgICAgICAgYnJlYWtwb2ludDogOTUwLFxuICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgIHNsaWRlc1RvU2hvdzogMixcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGJyZWFrcG9pbnQ6IDcwMCxcbiAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICBhcnJvd3M6IGZhbHNlLFxuICAgICAgICAgIGRvdHM6IHRydWUsXG4gICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICB9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNhcm91c2VsO1xuIiwiLyogZXNsaW50LWVudiBicm93c2VyICovXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCAkIGZyb20gJ2pxdWVyeSc7XG5cbmNvbnN0IHNvY2lhbFNoYXJlID0gZnVuY3Rpb24oZmJJZCkge1xuICBjb25zdCAkYm9keSA9ICQoJ2JvZHknKTtcblxuICAvLyBGYWNlYm9vayBzaGFyaW5nIHdpdGggdGhlIFNES1xuICAkLmdldFNjcmlwdCgnLy9jb25uZWN0LmZhY2Vib29rLm5ldC9lbl9VUy9zZGsuanMnKS5kb25lKGZ1bmN0aW9uKCkge1xuICAgICRib2R5Lm9uKCdjbGljay5zaGFyZXItZmInLCAnLnNoYXJlci1mYicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGNvbnN0ICRsaW5rID0gJChlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgbWV0aG9kOiAnZmVlZCcsXG4gICAgICAgIGRpc3BsYXk6ICdwb3B1cCcsXG4gICAgICB9O1xuICAgICAgY29uc3QgbmV3VXJsID0gJGxpbmsuZGF0YSgncmVkaXJlY3QtdG8nKSA/XG4gICAgICAgICAgJGxpbmsuZGF0YSgncmVkaXJlY3QtdG8nKSA6IG51bGw7XG5cbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgd2luZG93LkZCLmluaXQoe1xuICAgICAgICBhcHBJZDogZmJJZCxcbiAgICAgICAgeGZibWw6IGZhbHNlLFxuICAgICAgICB2ZXJzaW9uOiAndjIuMCcsXG4gICAgICAgIHN0YXR1czogZmFsc2UsXG4gICAgICAgIGNvb2tpZTogdHJ1ZSxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAoJGxpbmsuZGF0YSgndGl0bGUnKSkge1xuICAgICAgICBvcHRpb25zLm5hbWUgPSAkbGluay5kYXRhKCd0aXRsZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGxpbmsuZGF0YSgndXJsJykpIHtcbiAgICAgICAgb3B0aW9ucy5saW5rID0gJGxpbmsuZGF0YSgndXJsJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICgkbGluay5kYXRhKCdwaWN0dXJlJykpIHtcbiAgICAgICAgb3B0aW9ucy5waWN0dXJlID0gJGxpbmsuZGF0YSgncGljdHVyZScpO1xuICAgICAgfVxuXG4gICAgICBpZiAoJGxpbmsuZGF0YSgnZGVzY3JpcHRpb24nKSkge1xuICAgICAgICBvcHRpb25zLmRlc2NyaXB0aW9uID0gJGxpbmsuZGF0YSgnZGVzY3JpcHRpb24nKTtcbiAgICAgIH1cblxuICAgICAgd2luZG93LkZCLnVpKG9wdGlvbnMsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIGlmIChuZXdVcmwpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IG5ld1VybDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIFR3aXR0ZXIgc2hhcmluZ1xuICAkYm9keS5vbignY2xpY2suc2hhcmVyLXR3JywgJy5zaGFyZXItdHcnLCBmdW5jdGlvbihlKSB7XG4gICAgY29uc3QgJGxpbmsgPSAkKGUuY3VycmVudFRhcmdldCk7XG4gICAgY29uc3QgdXJsID0gJGxpbmsuZGF0YSgndXJsJyk7XG4gICAgY29uc3QgdGV4dCA9ICRsaW5rLmRhdGEoJ2Rlc2NyaXB0aW9uJyk7XG4gICAgY29uc3QgdmlhID0gJGxpbmsuZGF0YSgnc291cmNlJyk7XG4gICAgbGV0IHR3aXR0ZXJVUkwgPSBgaHR0cHM6Ly90d2l0dGVyLmNvbS9zaGFyZT91cmw9JHtlbmNvZGVVUklDb21wb25lbnQodXJsKX1gO1xuXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaWYgKHRleHQpIHtcbiAgICAgIHR3aXR0ZXJVUkwgKz0gYCZ0ZXh0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHRleHQpfWA7XG4gICAgfVxuICAgIGlmICh2aWEpIHtcbiAgICAgIHR3aXR0ZXJVUkwgKz0gYCZ2aWE9JHtlbmNvZGVVUklDb21wb25lbnQodmlhKX1gO1xuICAgIH1cbiAgICB3aW5kb3cub3Blbih0d2l0dGVyVVJMLCAndHdlZXQnLFxuICAgICAgICAnd2lkdGg9NTAwLGhlaWdodD0zODQsbWVudWJhcj1ubyxzdGF0dXM9bm8sdG9vbGJhcj1ubycpO1xuICB9KTtcblxuICAvLyBMaW5rZWRJbiBzaGFyaW5nXG4gICRib2R5Lm9uKCdjbGljay5zaGFyZXItbGknLCAnLnNoYXJlci1saScsIGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zdCAkbGluayA9ICQoZS50YXJnZXQpO1xuICAgIGNvbnN0IHVybCA9ICRsaW5rLmRhdGEoJ3VybCcpO1xuICAgIGNvbnN0IHRpdGxlID0gJGxpbmsuZGF0YSgndGl0bGUnKTtcbiAgICBjb25zdCBzdW1tYXJ5ID0gJGxpbmsuZGF0YSgnZGVzY3JpcHRpb24nKTtcbiAgICBjb25zdCBzb3VyY2UgPSAkbGluay5kYXRhKCdzb3VyY2UnKTtcbiAgICBsZXQgbGlua2VkaW5VUkwgPSAnaHR0cHM6Ly93d3cubGlua2VkaW4uY29tL3NoYXJlQXJ0aWNsZT9taW5pPXRydWUmdXJsPScgK1xuICAgICAgICBlbmNvZGVVUklDb21wb25lbnQodXJsKTtcblxuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIGlmICh0aXRsZSkge1xuICAgICAgbGlua2VkaW5VUkwgKz0gYCZ0aXRsZT0ke2VuY29kZVVSSUNvbXBvbmVudCh0aXRsZSl9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlua2VkaW5VUkwgKz0gJyZ0aXRsZT0nO1xuICAgIH1cblxuICAgIGlmIChzdW1tYXJ5KSB7XG4gICAgICBsaW5rZWRpblVSTCArPVxuICAgICAgICAgIGAmc3VtbWFyeT0ke2VuY29kZVVSSUNvbXBvbmVudChzdW1tYXJ5LnN1YnN0cmluZygwLCAyNTYpKX1gO1xuICAgIH1cblxuICAgIGlmIChzb3VyY2UpIHtcbiAgICAgIGxpbmtlZGluVVJMICs9IGAmc291cmNlPSR7ZW5jb2RlVVJJQ29tcG9uZW50KHNvdXJjZSl9YDtcbiAgICB9XG5cbiAgICB3aW5kb3cub3BlbihsaW5rZWRpblVSTCwgJ2xpbmtlZGluJyxcbiAgICAgICAgJ3dpZHRoPTUyMCxoZWlnaHQ9NTcwLG1lbnViYXI9bm8sc3RhdHVzPW5vLHRvb2xiYXI9bm8nKTtcbiAgfSk7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBzb2NpYWxTaGFyZTtcbiIsIi8qXG4gICAgIF8gXyAgICAgIF8gICAgICAgX1xuIF9fX3wgKF8pIF9fX3wgfCBfXyAgKF8pX19fXG4vIF9ffCB8IHwvIF9ffCB8LyAvICB8IC8gX198XG5cXF9fIFxcIHwgfCAoX198ICAgPCBfIHwgXFxfXyBcXFxufF9fXy9ffF98XFxfX198X3xcXF8oXykvIHxfX18vXG4gICAgICAgICAgICAgICAgICAgfF9fL1xuXG4gVmVyc2lvbjogMS41LjBcbiAgQXV0aG9yOiBLZW4gV2hlZWxlclxuIFdlYnNpdGU6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pb1xuICAgIERvY3M6IGh0dHA6Ly9rZW53aGVlbGVyLmdpdGh1Yi5pby9zbGlja1xuICAgIFJlcG86IGh0dHA6Ly9naXRodWIuY29tL2tlbndoZWVsZXIvc2xpY2tcbiAgSXNzdWVzOiBodHRwOi8vZ2l0aHViLmNvbS9rZW53aGVlbGVyL3NsaWNrL2lzc3Vlc1xuXG4gKi9cbi8qIGdsb2JhbCB3aW5kb3csIGRvY3VtZW50LCBkZWZpbmUsIGpRdWVyeSwgc2V0SW50ZXJ2YWwsIGNsZWFySW50ZXJ2YWwgKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cblxufShmdW5jdGlvbigkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIHZhciBTbGljayA9IHdpbmRvdy5TbGljayB8fCB7fTtcblxuICAgIFNsaWNrID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBpbnN0YW5jZVVpZCA9IDA7XG5cbiAgICAgICAgZnVuY3Rpb24gU2xpY2soZWxlbWVudCwgc2V0dGluZ3MpIHtcblxuICAgICAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgICAgIGRhdGFTZXR0aW5ncywgcmVzcG9uc2l2ZVNldHRpbmdzLCBicmVha3BvaW50O1xuXG4gICAgICAgICAgICBfLmRlZmF1bHRzID0ge1xuICAgICAgICAgICAgICAgIGFjY2Vzc2liaWxpdHk6IHRydWUsXG4gICAgICAgICAgICAgICAgYWRhcHRpdmVIZWlnaHQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGFwcGVuZEFycm93czogJChlbGVtZW50KSxcbiAgICAgICAgICAgICAgICBhcHBlbmREb3RzOiAkKGVsZW1lbnQpLFxuICAgICAgICAgICAgICAgIGFycm93czogdHJ1ZSxcbiAgICAgICAgICAgICAgICBhc05hdkZvcjogbnVsbCxcbiAgICAgICAgICAgICAgICBwcmV2QXJyb3c6ICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXJvbGU9XCJub25lXCIgY2xhc3M9XCJzbGljay1wcmV2XCIgYXJpYS1sYWJlbD1cInByZXZpb3VzXCI+UHJldmlvdXM8L2J1dHRvbj4nLFxuICAgICAgICAgICAgICAgIG5leHRBcnJvdzogJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGRhdGEtcm9sZT1cIm5vbmVcIiBjbGFzcz1cInNsaWNrLW5leHRcIiBhcmlhLWxhYmVsPVwibmV4dFwiPk5leHQ8L2J1dHRvbj4nLFxuICAgICAgICAgICAgICAgIGF1dG9wbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhdXRvcGxheVNwZWVkOiAzMDAwLFxuICAgICAgICAgICAgICAgIGNlbnRlck1vZGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNlbnRlclBhZGRpbmc6ICc1MHB4JyxcbiAgICAgICAgICAgICAgICBjc3NFYXNlOiAnZWFzZScsXG4gICAgICAgICAgICAgICAgY3VzdG9tUGFnaW5nOiBmdW5jdGlvbihzbGlkZXIsIGkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBkYXRhLXJvbGU9XCJub25lXCI+JyArIChpICsgMSkgKyAnPC9idXR0b24+JztcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGRvdHM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRvdHNDbGFzczogJ3NsaWNrLWRvdHMnLFxuICAgICAgICAgICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlYXNpbmc6ICdsaW5lYXInLFxuICAgICAgICAgICAgICAgIGVkZ2VGcmljdGlvbjogMC4zNSxcbiAgICAgICAgICAgICAgICBmYWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBmb2N1c09uU2VsZWN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBpbmZpbml0ZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpbml0aWFsU2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgbGF6eUxvYWQ6ICdvbmRlbWFuZCcsXG4gICAgICAgICAgICAgICAgbW9iaWxlRmlyc3Q6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHBhdXNlT25Ib3ZlcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBwYXVzZU9uRG90c0hvdmVyOiBmYWxzZSxcbiAgICAgICAgICAgICAgICByZXNwb25kVG86ICd3aW5kb3cnLFxuICAgICAgICAgICAgICAgIHJlc3BvbnNpdmU6IG51bGwsXG4gICAgICAgICAgICAgICAgcm93czogMSxcbiAgICAgICAgICAgICAgICBydGw6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNsaWRlOiAnJyxcbiAgICAgICAgICAgICAgICBzbGlkZXNQZXJSb3c6IDEsXG4gICAgICAgICAgICAgICAgc2xpZGVzVG9TaG93OiAxLFxuICAgICAgICAgICAgICAgIHNsaWRlc1RvU2Nyb2xsOiAxLFxuICAgICAgICAgICAgICAgIHNwZWVkOiA1MDAsXG4gICAgICAgICAgICAgICAgc3dpcGU6IHRydWUsXG4gICAgICAgICAgICAgICAgc3dpcGVUb1NsaWRlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB0b3VjaE1vdmU6IHRydWUsXG4gICAgICAgICAgICAgICAgdG91Y2hUaHJlc2hvbGQ6IDUsXG4gICAgICAgICAgICAgICAgdXNlQ1NTOiB0cnVlLFxuICAgICAgICAgICAgICAgIHZhcmlhYmxlV2lkdGg6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZlcnRpY2FsOiBmYWxzZSxcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbFN3aXBpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHdhaXRGb3JBbmltYXRlOiB0cnVlXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBfLmluaXRpYWxzID0ge1xuICAgICAgICAgICAgICAgIGFuaW1hdGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZHJhZ2dpbmc6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGF1dG9QbGF5VGltZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgY3VycmVudERpcmVjdGlvbjogMCxcbiAgICAgICAgICAgICAgICBjdXJyZW50TGVmdDogbnVsbCxcbiAgICAgICAgICAgICAgICBjdXJyZW50U2xpZGU6IDAsXG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uOiAxLFxuICAgICAgICAgICAgICAgICRkb3RzOiBudWxsLFxuICAgICAgICAgICAgICAgIGxpc3RXaWR0aDogbnVsbCxcbiAgICAgICAgICAgICAgICBsaXN0SGVpZ2h0OiBudWxsLFxuICAgICAgICAgICAgICAgIGxvYWRJbmRleDogMCxcbiAgICAgICAgICAgICAgICAkbmV4dEFycm93OiBudWxsLFxuICAgICAgICAgICAgICAgICRwcmV2QXJyb3c6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGVDb3VudDogbnVsbCxcbiAgICAgICAgICAgICAgICBzbGlkZVdpZHRoOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZVRyYWNrOiBudWxsLFxuICAgICAgICAgICAgICAgICRzbGlkZXM6IG51bGwsXG4gICAgICAgICAgICAgICAgc2xpZGluZzogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2xpZGVPZmZzZXQ6IDAsXG4gICAgICAgICAgICAgICAgc3dpcGVMZWZ0OiBudWxsLFxuICAgICAgICAgICAgICAgICRsaXN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHRvdWNoT2JqZWN0OiB7fSxcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1zRW5hYmxlZDogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQuZXh0ZW5kKF8sIF8uaW5pdGlhbHMpO1xuXG4gICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPSBudWxsO1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9IG51bGw7XG4gICAgICAgICAgICBfLmFuaW1Qcm9wID0gbnVsbDtcbiAgICAgICAgICAgIF8uYnJlYWtwb2ludHMgPSBbXTtcbiAgICAgICAgICAgIF8uYnJlYWtwb2ludFNldHRpbmdzID0gW107XG4gICAgICAgICAgICBfLmNzc1RyYW5zaXRpb25zID0gZmFsc2U7XG4gICAgICAgICAgICBfLmhpZGRlbiA9ICdoaWRkZW4nO1xuICAgICAgICAgICAgXy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8ucG9zaXRpb25Qcm9wID0gbnVsbDtcbiAgICAgICAgICAgIF8ucmVzcG9uZFRvID0gbnVsbDtcbiAgICAgICAgICAgIF8ucm93Q291bnQgPSAxO1xuICAgICAgICAgICAgXy5zaG91bGRDbGljayA9IHRydWU7XG4gICAgICAgICAgICBfLiRzbGlkZXIgPSAkKGVsZW1lbnQpO1xuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBudWxsO1xuICAgICAgICAgICAgXy50cmFuc2Zvcm1UeXBlID0gbnVsbDtcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSBudWxsO1xuICAgICAgICAgICAgXy52aXNpYmlsaXR5Q2hhbmdlID0gJ3Zpc2liaWxpdHljaGFuZ2UnO1xuICAgICAgICAgICAgXy53aW5kb3dXaWR0aCA9IDA7XG4gICAgICAgICAgICBfLndpbmRvd1RpbWVyID0gbnVsbDtcblxuICAgICAgICAgICAgZGF0YVNldHRpbmdzID0gJChlbGVtZW50KS5kYXRhKCdzbGljaycpIHx8IHt9O1xuXG4gICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5kZWZhdWx0cywgZGF0YVNldHRpbmdzLCBzZXR0aW5ncyk7XG5cbiAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcblxuICAgICAgICAgICAgXy5vcmlnaW5hbFNldHRpbmdzID0gXy5vcHRpb25zO1xuICAgICAgICAgICAgcmVzcG9uc2l2ZVNldHRpbmdzID0gXy5vcHRpb25zLnJlc3BvbnNpdmUgfHwgbnVsbDtcblxuICAgICAgICAgICAgaWYgKHJlc3BvbnNpdmVTZXR0aW5ncyAmJiByZXNwb25zaXZlU2V0dGluZ3MubGVuZ3RoID4gLTEpIHtcbiAgICAgICAgICAgICAgICBfLnJlc3BvbmRUbyA9IF8ub3B0aW9ucy5yZXNwb25kVG8gfHwgJ3dpbmRvdyc7XG4gICAgICAgICAgICAgICAgZm9yIChicmVha3BvaW50IGluIHJlc3BvbnNpdmVTZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2l2ZVNldHRpbmdzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRzLnB1c2gocmVzcG9uc2l2ZVNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrcG9pbnRdLmJyZWFrcG9pbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5icmVha3BvaW50U2V0dGluZ3NbcmVzcG9uc2l2ZVNldHRpbmdzW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVha3BvaW50XS5icmVha3BvaW50XSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzcG9uc2l2ZVNldHRpbmdzW2JyZWFrcG9pbnRdLnNldHRpbmdzO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF8uYnJlYWtwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMubW9iaWxlRmlyc3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhIC0gYjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBiIC0gYTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICdtb3pIaWRkZW4nO1xuICAgICAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICdtb3p2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50Lm1zSGlkZGVuICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIF8uaGlkZGVuID0gJ21zSGlkZGVuJztcbiAgICAgICAgICAgICAgICBfLnZpc2liaWxpdHlDaGFuZ2UgPSAnbXN2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGRvY3VtZW50LndlYmtpdEhpZGRlbiAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBfLmhpZGRlbiA9ICd3ZWJraXRIaWRkZW4nO1xuICAgICAgICAgICAgICAgIF8udmlzaWJpbGl0eUNoYW5nZSA9ICd3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlJztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgXy5hdXRvUGxheSA9ICQucHJveHkoXy5hdXRvUGxheSwgXyk7XG4gICAgICAgICAgICBfLmF1dG9QbGF5Q2xlYXIgPSAkLnByb3h5KF8uYXV0b1BsYXlDbGVhciwgXyk7XG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlID0gJC5wcm94eShfLmNoYW5nZVNsaWRlLCBfKTtcbiAgICAgICAgICAgIF8uY2xpY2tIYW5kbGVyID0gJC5wcm94eShfLmNsaWNrSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLnNlbGVjdEhhbmRsZXIgPSAkLnByb3h5KF8uc2VsZWN0SGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLnNldFBvc2l0aW9uID0gJC5wcm94eShfLnNldFBvc2l0aW9uLCBfKTtcbiAgICAgICAgICAgIF8uc3dpcGVIYW5kbGVyID0gJC5wcm94eShfLnN3aXBlSGFuZGxlciwgXyk7XG4gICAgICAgICAgICBfLmRyYWdIYW5kbGVyID0gJC5wcm94eShfLmRyYWdIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8ua2V5SGFuZGxlciA9ICQucHJveHkoXy5rZXlIYW5kbGVyLCBfKTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlJdGVyYXRvciA9ICQucHJveHkoXy5hdXRvUGxheUl0ZXJhdG9yLCBfKTtcblxuICAgICAgICAgICAgXy5pbnN0YW5jZVVpZCA9IGluc3RhbmNlVWlkKys7XG5cbiAgICAgICAgICAgIC8vIEEgc2ltcGxlIHdheSB0byBjaGVjayBmb3IgSFRNTCBzdHJpbmdzXG4gICAgICAgICAgICAvLyBTdHJpY3QgSFRNTCByZWNvZ25pdGlvbiAobXVzdCBzdGFydCB3aXRoIDwpXG4gICAgICAgICAgICAvLyBFeHRyYWN0ZWQgZnJvbSBqUXVlcnkgdjEuMTEgc291cmNlXG4gICAgICAgICAgICBfLmh0bWxFeHByID0gL14oPzpcXHMqKDxbXFx3XFxXXSs+KVtePl0qKSQvO1xuXG4gICAgICAgICAgICBfLmluaXQoKTtcblxuICAgICAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUodHJ1ZSk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBTbGljaztcblxuICAgIH0oKSk7XG5cbiAgICBTbGljay5wcm90b3R5cGUuYWRkU2xpZGUgPSBTbGljay5wcm90b3R5cGUuc2xpY2tBZGQgPSBmdW5jdGlvbihtYXJrdXAsIGluZGV4LCBhZGRCZWZvcmUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKHR5cGVvZihpbmRleCkgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgYWRkQmVmb3JlID0gaW5kZXg7XG4gICAgICAgICAgICBpbmRleCA9IG51bGw7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5kZXggPCAwIHx8IChpbmRleCA+PSBfLnNsaWRlQ291bnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgIGlmICh0eXBlb2YoaW5kZXgpID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwICYmIF8uJHNsaWRlcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFkZEJlZm9yZSkge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5pbnNlcnRCZWZvcmUoXy4kc2xpZGVzLmVxKGluZGV4KSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICQobWFya3VwKS5pbnNlcnRBZnRlcihfLiRzbGlkZXMuZXEoaW5kZXgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhZGRCZWZvcmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKG1hcmt1cCkuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXMgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmRldGFjaCgpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2suYXBwZW5kKF8uJHNsaWRlcyk7XG5cbiAgICAgICAgXy4kc2xpZGVzLmVhY2goZnVuY3Rpb24oaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgICQoZWxlbWVudCkuYXR0cignZGF0YS1zbGljay1pbmRleCcsIGluZGV4KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgXy4kc2xpZGVzQ2FjaGUgPSBfLiRzbGlkZXM7XG5cbiAgICAgICAgXy5yZWluaXQoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYW5pbWF0ZUhlaWdodCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgIF8uJGxpc3QuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgaGVpZ2h0OiB0YXJnZXRIZWlnaHRcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFuaW1hdGVTbGlkZSA9IGZ1bmN0aW9uKHRhcmdldExlZnQsIGNhbGxiYWNrKSB7XG5cbiAgICAgICAgdmFyIGFuaW1Qcm9wcyA9IHt9LFxuICAgICAgICAgICAgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hbmltYXRlSGVpZ2h0KCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUgJiYgXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IC10YXJnZXRMZWZ0O1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLnRyYW5zZm9ybXNFbmFibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkLCBfLm9wdGlvbnMuZWFzaW5nLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIHRvcDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMucnRsID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIF8uY3VycmVudExlZnQgPSAtKF8uY3VycmVudExlZnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbVN0YXJ0OiBfLmN1cnJlbnRMZWZ0XG4gICAgICAgICAgICAgICAgfSkuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1TdGFydDogdGFyZ2V0TGVmdFxuICAgICAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICAgICAgZHVyYXRpb246IF8ub3B0aW9ucy5zcGVlZCxcbiAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiBfLm9wdGlvbnMuZWFzaW5nLFxuICAgICAgICAgICAgICAgICAgICBzdGVwOiBmdW5jdGlvbihub3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vdyA9IE1hdGguY2VpbChub3cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyAncHgsIDBweCknO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKGFuaW1Qcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUoMHB4LCcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3cgKyAncHgpJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhhbmltUHJvcHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKCk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IE1hdGguY2VpbCh0YXJnZXRMZWZ0KTtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGFuaW1Qcm9wc1tfLmFuaW1UeXBlXSA9ICd0cmFuc2xhdGUzZCgnICsgdGFyZ2V0TGVmdCArICdweCwgMHB4LCAwcHgpJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhbmltUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoMHB4LCcgKyB0YXJnZXRMZWZ0ICsgJ3B4LCAwcHgpJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MoYW5pbVByb3BzKTtcblxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBfLmRpc2FibGVUcmFuc2l0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmFzTmF2Rm9yID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYXNOYXZGb3IgPSBfLm9wdGlvbnMuYXNOYXZGb3IgIT09IG51bGwgPyAkKF8ub3B0aW9ucy5hc05hdkZvcikuc2xpY2soJ2dldFNsaWNrJykgOiBudWxsO1xuICAgICAgICBpZiAoYXNOYXZGb3IgIT09IG51bGwpIGFzTmF2Rm9yLnNsaWRlSGFuZGxlcihpbmRleCwgdHJ1ZSk7XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5hcHBseVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB7fTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gXy50cmFuc2Zvcm1UeXBlICsgJyAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb25bXy50cmFuc2l0aW9uVHlwZV0gPSAnb3BhY2l0eSAnICsgXy5vcHRpb25zLnNwZWVkICsgJ21zICcgKyBfLm9wdGlvbnMuY3NzRWFzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHRyYW5zaXRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlKS5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXkgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uYXV0b1BsYXlUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgJiYgXy5wYXVzZWQgIT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlUaW1lciA9IHNldEludGVydmFsKF8uYXV0b1BsYXlJdGVyYXRvcixcbiAgICAgICAgICAgICAgICBfLm9wdGlvbnMuYXV0b3BsYXlTcGVlZCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYXV0b1BsYXlDbGVhciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcbiAgICAgICAgaWYgKF8uYXV0b1BsYXlUaW1lcikge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmF1dG9QbGF5SXRlcmF0b3IgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgaWYgKF8uZGlyZWN0aW9uID09PSAxKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoKF8uY3VycmVudFNsaWRlICsgMSkgPT09IF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgIDEpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgLSAxID09PSAwKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIF8uZGlyZWN0aW9uID0gMTtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlIC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY3VycmVudFNsaWRlICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkQXJyb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93ID0gJChfLm9wdGlvbnMucHJldkFycm93KTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdyA9ICQoXy5vcHRpb25zLm5leHRBcnJvdyk7XG5cbiAgICAgICAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLnByZXZBcnJvdykpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYXBwZW5kVG8oXy5vcHRpb25zLmFwcGVuZEFycm93cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLmh0bWxFeHByLnRlc3QoXy5vcHRpb25zLm5leHRBcnJvdykpIHtcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cuYXBwZW5kVG8oXy5vcHRpb25zLmFwcGVuZEFycm93cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5idWlsZERvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBpLCBkb3RTdHJpbmc7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgZG90U3RyaW5nID0gJzx1bCBjbGFzcz1cIicgKyBfLm9wdGlvbnMuZG90c0NsYXNzICsgJ1wiPic7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPD0gXy5nZXREb3RDb3VudCgpOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBkb3RTdHJpbmcgKz0gJzxsaT4nICsgXy5vcHRpb25zLmN1c3RvbVBhZ2luZy5jYWxsKHRoaXMsIF8sIGkpICsgJzwvbGk+JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG90U3RyaW5nICs9ICc8L3VsPic7XG5cbiAgICAgICAgICAgIF8uJGRvdHMgPSAkKGRvdFN0cmluZykuYXBwZW5kVG8oXG4gICAgICAgICAgICAgICAgXy5vcHRpb25zLmFwcGVuZERvdHMpO1xuXG4gICAgICAgICAgICBfLiRkb3RzLmZpbmQoJ2xpJykuZmlyc3QoKS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmJ1aWxkT3V0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlci5jaGlsZHJlbihcbiAgICAgICAgICAgICc6bm90KC5zbGljay1jbG9uZWQpJykuYWRkQ2xhc3MoXG4gICAgICAgICAgICAnc2xpY2stc2xpZGUnKTtcbiAgICAgICAgXy5zbGlkZUNvdW50ID0gXy4kc2xpZGVzLmxlbmd0aDtcblxuICAgICAgICBfLiRzbGlkZXMuZWFjaChmdW5jdGlvbihpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5hdHRyKCdkYXRhLXNsaWNrLWluZGV4JywgaW5kZXgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLiRzbGlkZXIuYWRkQ2xhc3MoJ3NsaWNrLXNsaWRlcicpO1xuXG4gICAgICAgIF8uJHNsaWRlVHJhY2sgPSAoXy5zbGlkZUNvdW50ID09PSAwKSA/XG4gICAgICAgICAgICAkKCc8ZGl2IGNsYXNzPVwic2xpY2stdHJhY2tcIi8+JykuYXBwZW5kVG8oXy4kc2xpZGVyKSA6XG4gICAgICAgICAgICBfLiRzbGlkZXMud3JhcEFsbCgnPGRpdiBjbGFzcz1cInNsaWNrLXRyYWNrXCIvPicpLnBhcmVudCgpO1xuXG4gICAgICAgIF8uJGxpc3QgPSBfLiRzbGlkZVRyYWNrLndyYXAoXG4gICAgICAgICAgICAnPGRpdiBhcmlhLWxpdmU9XCJwb2xpdGVcIiBjbGFzcz1cInNsaWNrLWxpc3RcIi8+JykucGFyZW50KCk7XG4gICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKCdvcGFjaXR5JywgMCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlIHx8IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA9IDE7XG4gICAgICAgIH1cblxuICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIF8uJHNsaWRlcikubm90KCdbc3JjXScpLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICAgICAgXy5zZXR1cEluZmluaXRlKCk7XG5cbiAgICAgICAgXy5idWlsZEFycm93cygpO1xuXG4gICAgICAgIF8uYnVpbGREb3RzKCk7XG5cbiAgICAgICAgXy51cGRhdGVEb3RzKCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0LnByb3AoJ3RhYkluZGV4JywgMCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNldFNsaWRlQ2xhc3Nlcyh0eXBlb2YgdGhpcy5jdXJyZW50U2xpZGUgPT09ICdudW1iZXInID8gdGhpcy5jdXJyZW50U2xpZGUgOiAwKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRyYWdnYWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kbGlzdC5hZGRDbGFzcygnZHJhZ2dhYmxlJyk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuYnVpbGRSb3dzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLCBhLCBiLCBjLCBuZXdTbGlkZXMsIG51bU9mU2xpZGVzLCBvcmlnaW5hbFNsaWRlcyxzbGlkZXNQZXJTZWN0aW9uO1xuXG4gICAgICAgIG5ld1NsaWRlcyA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgb3JpZ2luYWxTbGlkZXMgPSBfLiRzbGlkZXIuY2hpbGRyZW4oKTtcblxuICAgICAgICBpZihfLm9wdGlvbnMucm93cyA+IDEpIHtcbiAgICAgICAgICAgIHNsaWRlc1BlclNlY3Rpb24gPSBfLm9wdGlvbnMuc2xpZGVzUGVyUm93ICogXy5vcHRpb25zLnJvd3M7XG4gICAgICAgICAgICBudW1PZlNsaWRlcyA9IE1hdGguY2VpbChcbiAgICAgICAgICAgICAgICBvcmlnaW5hbFNsaWRlcy5sZW5ndGggLyBzbGlkZXNQZXJTZWN0aW9uXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBmb3IoYSA9IDA7IGEgPCBudW1PZlNsaWRlczsgYSsrKXtcbiAgICAgICAgICAgICAgICB2YXIgc2xpZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICBmb3IoYiA9IDA7IGIgPCBfLm9wdGlvbnMucm93czsgYisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yKGMgPSAwOyBjIDwgXy5vcHRpb25zLnNsaWRlc1BlclJvdzsgYysrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gKGEgKiBzbGlkZXNQZXJTZWN0aW9uICsgKChiICogXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyBjKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cuYXBwZW5kQ2hpbGQob3JpZ2luYWxTbGlkZXMuZ2V0KHRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlLmFwcGVuZENoaWxkKHJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld1NsaWRlcy5hcHBlbmRDaGlsZChzbGlkZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgXy4kc2xpZGVyLmh0bWwobmV3U2xpZGVzKTtcbiAgICAgICAgICAgIF8uJHNsaWRlci5jaGlsZHJlbigpLmNoaWxkcmVuKCkuY2hpbGRyZW4oKVxuICAgICAgICAgICAgICAgIC53aWR0aCgoMTAwIC8gXy5vcHRpb25zLnNsaWRlc1BlclJvdykgKyBcIiVcIilcbiAgICAgICAgICAgICAgICAuY3NzKHsnZGlzcGxheSc6ICdpbmxpbmUtYmxvY2snfSk7XG4gICAgICAgIH07XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNoZWNrUmVzcG9uc2l2ZSA9IGZ1bmN0aW9uKGluaXRpYWwpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBicmVha3BvaW50LCB0YXJnZXRCcmVha3BvaW50LCByZXNwb25kVG9XaWR0aDtcbiAgICAgICAgdmFyIHNsaWRlcldpZHRoID0gXy4kc2xpZGVyLndpZHRoKCk7XG4gICAgICAgIHZhciB3aW5kb3dXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoIHx8ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICBpZiAoXy5yZXNwb25kVG8gPT09ICd3aW5kb3cnKSB7XG4gICAgICAgICAgICByZXNwb25kVG9XaWR0aCA9IHdpbmRvd1dpZHRoO1xuICAgICAgICB9IGVsc2UgaWYgKF8ucmVzcG9uZFRvID09PSAnc2xpZGVyJykge1xuICAgICAgICAgICAgcmVzcG9uZFRvV2lkdGggPSBzbGlkZXJXaWR0aDtcbiAgICAgICAgfSBlbHNlIGlmIChfLnJlc3BvbmRUbyA9PT0gJ21pbicpIHtcbiAgICAgICAgICAgIHJlc3BvbmRUb1dpZHRoID0gTWF0aC5taW4od2luZG93V2lkdGgsIHNsaWRlcldpZHRoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9yaWdpbmFsU2V0dGluZ3MucmVzcG9uc2l2ZSAmJiBfLm9yaWdpbmFsU2V0dGluZ3NcbiAgICAgICAgICAgIC5yZXNwb25zaXZlLmxlbmd0aCA+IC0xICYmIF8ub3JpZ2luYWxTZXR0aW5ncy5yZXNwb25zaXZlICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQgPSBudWxsO1xuXG4gICAgICAgICAgICBmb3IgKGJyZWFrcG9pbnQgaW4gXy5icmVha3BvaW50cykge1xuICAgICAgICAgICAgICAgIGlmIChfLmJyZWFrcG9pbnRzLmhhc093blByb3BlcnR5KGJyZWFrcG9pbnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfLm9yaWdpbmFsU2V0dGluZ3MubW9iaWxlRmlyc3QgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPCBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uZFRvV2lkdGggPiBfLmJyZWFrcG9pbnRzW2JyZWFrcG9pbnRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludCA9IF8uYnJlYWtwb2ludHNbYnJlYWtwb2ludF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0YXJnZXRCcmVha3BvaW50ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8uYWN0aXZlQnJlYWtwb2ludCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0QnJlYWtwb2ludCAhPT0gXy5hY3RpdmVCcmVha3BvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfLmFjdGl2ZUJyZWFrcG9pbnQgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoXy5icmVha3BvaW50U2V0dGluZ3NbdGFyZ2V0QnJlYWtwb2ludF0gPT09ICd1bnNsaWNrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8udW5zbGljaygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgXy5vcmlnaW5hbFNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldEJyZWFrcG9pbnRdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ucmVmcmVzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID0gdGFyZ2V0QnJlYWtwb2ludDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uYnJlYWtwb2ludFNldHRpbmdzW3RhcmdldEJyZWFrcG9pbnRdID09PSAndW5zbGljaycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8udW5zbGljaygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gJC5leHRlbmQoe30sIF8ub3JpZ2luYWxTZXR0aW5ncyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmJyZWFrcG9pbnRTZXR0aW5nc1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0QnJlYWtwb2ludF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluaXRpYWwgPT09IHRydWUpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLm9wdGlvbnMuaW5pdGlhbFNsaWRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChfLmFjdGl2ZUJyZWFrcG9pbnQgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hY3RpdmVCcmVha3BvaW50ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgXy5vcHRpb25zID0gXy5vcmlnaW5hbFNldHRpbmdzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaW5pdGlhbCA9PT0gdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uY3VycmVudFNsaWRlID0gXy5vcHRpb25zLmluaXRpYWxTbGlkZTtcbiAgICAgICAgICAgICAgICAgICAgXy5yZWZyZXNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2hhbmdlU2xpZGUgPSBmdW5jdGlvbihldmVudCwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpLFxuICAgICAgICAgICAgaW5kZXhPZmZzZXQsIHNsaWRlT2Zmc2V0LCB1bmV2ZW5PZmZzZXQ7XG5cbiAgICAgICAgLy8gSWYgdGFyZ2V0IGlzIGEgbGluaywgcHJldmVudCBkZWZhdWx0IGFjdGlvbi5cbiAgICAgICAgJHRhcmdldC5pcygnYScpICYmIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdW5ldmVuT2Zmc2V0ID0gKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCk7XG4gICAgICAgIGluZGV4T2Zmc2V0ID0gdW5ldmVuT2Zmc2V0ID8gMCA6IChfLnNsaWRlQ291bnQgLSBfLmN1cnJlbnRTbGlkZSkgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5kYXRhLm1lc3NhZ2UpIHtcblxuICAgICAgICAgICAgY2FzZSAncHJldmlvdXMnOlxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0ID0gaW5kZXhPZmZzZXQgPT09IDAgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gaW5kZXhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoXy5jdXJyZW50U2xpZGUgLSBzbGlkZU9mZnNldCwgZmFsc2UsIGRvbnRBbmltYXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgJ25leHQnOlxuICAgICAgICAgICAgICAgIHNsaWRlT2Zmc2V0ID0gaW5kZXhPZmZzZXQgPT09IDAgPyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgOiBpbmRleE9mZnNldDtcbiAgICAgICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSArIHNsaWRlT2Zmc2V0LCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnaW5kZXgnOlxuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGV2ZW50LmRhdGEuaW5kZXggPT09IDAgPyAwIDpcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuZGF0YS5pbmRleCB8fCAkKGV2ZW50LnRhcmdldCkucGFyZW50KCkuaW5kZXgoKSAqIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcblxuICAgICAgICAgICAgICAgIF8uc2xpZGVIYW5kbGVyKF8uY2hlY2tOYXZpZ2FibGUoaW5kZXgpLCBmYWxzZSwgZG9udEFuaW1hdGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jaGVja05hdmlnYWJsZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgbmF2aWdhYmxlcywgcHJldk5hdmlnYWJsZTtcblxuICAgICAgICBuYXZpZ2FibGVzID0gXy5nZXROYXZpZ2FibGVJbmRleGVzKCk7XG4gICAgICAgIHByZXZOYXZpZ2FibGUgPSAwO1xuICAgICAgICBpZiAoaW5kZXggPiBuYXZpZ2FibGVzW25hdmlnYWJsZXMubGVuZ3RoIC0gMV0pIHtcbiAgICAgICAgICAgIGluZGV4ID0gbmF2aWdhYmxlc1tuYXZpZ2FibGVzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgbiBpbiBuYXZpZ2FibGVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgbmF2aWdhYmxlc1tuXSkge1xuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHByZXZOYXZpZ2FibGU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBwcmV2TmF2aWdhYmxlID0gbmF2aWdhYmxlc1tuXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmNsZWFuVXBFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cykub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8ub3B0aW9ucy5wYXVzZU9uRG90c0hvdmVyID09PSB0cnVlICYmIF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCBfLnNldFBhdXNlZC5iaW5kKF8sIHRydWUpKVxuICAgICAgICAgICAgICAgIC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCBfLnNldFBhdXNlZC5iaW5kKF8sIGZhbHNlKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cgJiYgXy4kcHJldkFycm93Lm9mZignY2xpY2suc2xpY2snLCBfLmNoYW5nZVNsaWRlKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdyAmJiBfLiRuZXh0QXJyb3cub2ZmKCdjbGljay5zbGljaycsIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoc3RhcnQuc2xpY2sgbW91c2Vkb3duLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuICAgICAgICBfLiRsaXN0Lm9mZigndG91Y2htb3ZlLnNsaWNrIG1vdXNlbW92ZS5zbGljaycsIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ3RvdWNoZW5kLnNsaWNrIG1vdXNldXAuc2xpY2snLCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub2ZmKCd0b3VjaGNhbmNlbC5zbGljayBtb3VzZWxlYXZlLnNsaWNrJywgXy5zd2lwZUhhbmRsZXIpO1xuXG4gICAgICAgIF8uJGxpc3Qub2ZmKCdjbGljay5zbGljaycsIF8uY2xpY2tIYW5kbGVyKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmF1dG9wbGF5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vZmYoXy52aXNpYmlsaXR5Q2hhbmdlLCBfLnZpc2liaWxpdHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kbGlzdC5vZmYoJ21vdXNlZW50ZXIuc2xpY2snLCBfLnNldFBhdXNlZC5iaW5kKF8sIHRydWUpKTtcbiAgICAgICAgXy4kbGlzdC5vZmYoJ21vdXNlbGVhdmUuc2xpY2snLCBfLnNldFBhdXNlZC5iaW5kKF8sIGZhbHNlKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRsaXN0Lm9mZigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZvY3VzT25TZWxlY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vZmYoJ2NsaWNrLnNsaWNrJywgXy5zZWxlY3RIYW5kbGVyKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQod2luZG93KS5vZmYoJ29yaWVudGF0aW9uY2hhbmdlLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLm9yaWVudGF0aW9uQ2hhbmdlKTtcblxuICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8ucmVzaXplKTtcblxuICAgICAgICAkKCdbZHJhZ2dhYmxlIT10cnVlXScsIF8uJHNsaWRlVHJhY2spLm9mZignZHJhZ3N0YXJ0JywgXy5wcmV2ZW50RGVmYXVsdCk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9mZignbG9hZC5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5zZXRQb3NpdGlvbik7XG4gICAgICAgICQoZG9jdW1lbnQpLm9mZigncmVhZHkuc2xpY2suc2xpY2stJyArIF8uaW5zdGFuY2VVaWQsIF8uc2V0UG9zaXRpb24pO1xuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuY2xlYW5VcFJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsIG9yaWdpbmFsU2xpZGVzO1xuXG4gICAgICAgIGlmKF8ub3B0aW9ucy5yb3dzID4gMSkge1xuICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMgPSBfLiRzbGlkZXMuY2hpbGRyZW4oKS5jaGlsZHJlbigpO1xuICAgICAgICAgICAgb3JpZ2luYWxTbGlkZXMucmVtb3ZlQXR0cignc3R5bGUnKTtcbiAgICAgICAgICAgIF8uJHNsaWRlci5odG1sKG9yaWdpbmFsU2xpZGVzKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5zaG91bGRDbGljayA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5hdXRvUGxheUNsZWFyKCk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuXG4gICAgICAgIF8uY2xlYW5VcEV2ZW50cygpO1xuXG4gICAgICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLnJlbW92ZSgpO1xuXG4gICAgICAgIGlmIChfLiRkb3RzKSB7XG4gICAgICAgICAgICBfLiRkb3RzLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLiRwcmV2QXJyb3cgJiYgKHR5cGVvZiBfLm9wdGlvbnMucHJldkFycm93ICE9PSAnb2JqZWN0JykpIHtcbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy4kbmV4dEFycm93ICYmICh0eXBlb2YgXy5vcHRpb25zLm5leHRBcnJvdyAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy4kc2xpZGVzKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXMucmVtb3ZlQ2xhc3MoJ3NsaWNrLXNsaWRlIHNsaWNrLWFjdGl2ZSBzbGljay1jZW50ZXIgc2xpY2stdmlzaWJsZScpXG4gICAgICAgICAgICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKVxuICAgICAgICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXNsaWNrLWluZGV4JylcbiAgICAgICAgICAgICAgICAuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246ICcnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgekluZGV4OiAnJyxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogJycsXG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiAnJ1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXIuaHRtbChfLiRzbGlkZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5jbGVhblVwUm93cygpO1xuXG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGVyJyk7XG4gICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZGlzYWJsZVRyYW5zaXRpb24gPSBmdW5jdGlvbihzbGlkZSkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRyYW5zaXRpb24gPSB7fTtcblxuICAgICAgICB0cmFuc2l0aW9uW18udHJhbnNpdGlvblR5cGVdID0gJyc7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3ModHJhbnNpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGUpLmNzcyh0cmFuc2l0aW9uKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5mYWRlU2xpZGUgPSBmdW5jdGlvbihzbGlkZUluZGV4LCBjYWxsYmFjaykge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5jc3NUcmFuc2l0aW9ucyA9PT0gZmFsc2UpIHtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmNzcyh7XG4gICAgICAgICAgICAgICAgekluZGV4OiAxMDAwXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzLmVxKHNsaWRlSW5kZXgpLmFuaW1hdGUoe1xuICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgIH0sIF8ub3B0aW9ucy5zcGVlZCwgXy5vcHRpb25zLmVhc2luZywgY2FsbGJhY2spO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIF8uYXBwbHlUcmFuc2l0aW9uKHNsaWRlSW5kZXgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZXMuZXEoc2xpZGVJbmRleCkuY3NzKHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICAgICAgICAgIHpJbmRleDogMTAwMFxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgXy5kaXNhYmxlVHJhbnNpdGlvbihzbGlkZUluZGV4KTtcblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKCk7XG4gICAgICAgICAgICAgICAgfSwgXy5vcHRpb25zLnNwZWVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmZpbHRlclNsaWRlcyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0ZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlcikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoZmlsdGVyICE9PSBudWxsKSB7XG5cbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKS5kZXRhY2goKTtcblxuICAgICAgICAgICAgXy4kc2xpZGVzQ2FjaGUuZmlsdGVyKGZpbHRlcikuYXBwZW5kVG8oXy4kc2xpZGVUcmFjayk7XG5cbiAgICAgICAgICAgIF8ucmVpbml0KCk7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5nZXRDdXJyZW50ID0gU2xpY2sucHJvdG90eXBlLnNsaWNrQ3VycmVudFNsaWRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuICAgICAgICByZXR1cm4gXy5jdXJyZW50U2xpZGU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldERvdENvdW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHZhciBicmVha1BvaW50ID0gMDtcbiAgICAgICAgdmFyIGNvdW50ZXIgPSAwO1xuICAgICAgICB2YXIgcGFnZXJRdHkgPSAwO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gTWF0aC5jZWlsKF8uc2xpZGVDb3VudCAvIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCk7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBhZ2VyUXR5ID0gXy5zbGlkZUNvdW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgICAgICArK3BhZ2VyUXR5O1xuICAgICAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgICAgICBjb3VudGVyICs9IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID8gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsIDogXy5vcHRpb25zLnNsaWRlc1RvU2hvdztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwYWdlclF0eSAtIDE7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmdldExlZnQgPSBmdW5jdGlvbihzbGlkZUluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgIHZlcnRpY2FsSGVpZ2h0LFxuICAgICAgICAgICAgdmVydGljYWxPZmZzZXQgPSAwLFxuICAgICAgICAgICAgdGFyZ2V0U2xpZGU7XG5cbiAgICAgICAgXy5zbGlkZU9mZnNldCA9IDA7XG4gICAgICAgIHZlcnRpY2FsSGVpZ2h0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoXy5zbGlkZVdpZHRoICogXy5vcHRpb25zLnNsaWRlc1RvU2hvdykgKiAtMTtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICh2ZXJ0aWNhbEhlaWdodCAqIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpICogLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPiBfLnNsaWRlQ291bnQgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2xpZGVJbmRleCA+IF8uc2xpZGVDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIChzbGlkZUluZGV4IC0gXy5zbGlkZUNvdW50KSkgKiBfLnNsaWRlV2lkdGgpICogLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAtIChzbGlkZUluZGV4IC0gXy5zbGlkZUNvdW50KSkgKiB2ZXJ0aWNhbEhlaWdodCkgKiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAoKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCkgKiBfLnNsaWRlV2lkdGgpICogLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoXy5zbGlkZUNvdW50ICUgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSAqIHZlcnRpY2FsSGVpZ2h0KSAqIC0xO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID4gXy5zbGlkZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgXy5zbGlkZU9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIF8uc2xpZGVXaWR0aDtcbiAgICAgICAgICAgICAgICB2ZXJ0aWNhbE9mZnNldCA9ICgoc2xpZGVJbmRleCArIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIC0gXy5zbGlkZUNvdW50KSAqIHZlcnRpY2FsSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLnNsaWRlT2Zmc2V0ID0gMDtcbiAgICAgICAgICAgIHZlcnRpY2FsT2Zmc2V0ID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgKz0gXy5zbGlkZVdpZHRoICogTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMikgLSBfLnNsaWRlV2lkdGg7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uc2xpZGVPZmZzZXQgPSAwO1xuICAgICAgICAgICAgXy5zbGlkZU9mZnNldCArPSBfLnNsaWRlV2lkdGggKiBNYXRoLmZsb29yKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKChzbGlkZUluZGV4ICogXy5zbGlkZVdpZHRoKSAqIC0xKSArIF8uc2xpZGVPZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKChzbGlkZUluZGV4ICogdmVydGljYWxIZWlnaHQpICogLTEpICsgdmVydGljYWxPZmZzZXQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZhcmlhYmxlV2lkdGggPT09IHRydWUpIHtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93IHx8IF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFyZ2V0TGVmdCA9IHRhcmdldFNsaWRlWzBdID8gdGFyZ2V0U2xpZGVbMF0ub2Zmc2V0TGVmdCAqIC0xIDogMDtcblxuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5lcShzbGlkZUluZGV4KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmVxKHNsaWRlSW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRhcmdldExlZnQgPSB0YXJnZXRTbGlkZVswXSA/IHRhcmdldFNsaWRlWzBdLm9mZnNldExlZnQgKiAtMSA6IDA7XG4gICAgICAgICAgICAgICAgdGFyZ2V0TGVmdCArPSAoXy4kbGlzdC53aWR0aCgpIC0gdGFyZ2V0U2xpZGUub3V0ZXJXaWR0aCgpKSAvIDI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGFyZ2V0TGVmdDtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0T3B0aW9uID0gU2xpY2sucHJvdG90eXBlLnNsaWNrR2V0T3B0aW9uID0gZnVuY3Rpb24ob3B0aW9uKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHJldHVybiBfLm9wdGlvbnNbb3B0aW9uXTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0TmF2aWdhYmxlSW5kZXhlcyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSAwLFxuICAgICAgICAgICAgY291bnRlciA9IDAsXG4gICAgICAgICAgICBpbmRleGVzID0gW10sXG4gICAgICAgICAgICBtYXg7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIG1heCA9IF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgKyAxO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSBtYXggPSBfLnNsaWRlQ291bnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBicmVha1BvaW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICogLTE7XG4gICAgICAgICAgICBjb3VudGVyID0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICogLTE7XG4gICAgICAgICAgICBtYXggPSBfLnNsaWRlQ291bnQgKiAyO1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKGJyZWFrUG9pbnQgPCBtYXgpIHtcbiAgICAgICAgICAgIGluZGV4ZXMucHVzaChicmVha1BvaW50KTtcbiAgICAgICAgICAgIGJyZWFrUG9pbnQgPSBjb3VudGVyICsgXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsO1xuICAgICAgICAgICAgY291bnRlciArPSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyA/IF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCA6IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZXhlcztcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0U2xpY2sgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ2V0U2xpZGVDb3VudCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHNsaWRlc1RyYXZlcnNlZCwgc3dpcGVkU2xpZGUsIGNlbnRlck9mZnNldDtcblxuICAgICAgICBjZW50ZXJPZmZzZXQgPSBfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSA/IF8uc2xpZGVXaWR0aCAqIE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpIDogMDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5maW5kKCcuc2xpY2stc2xpZGUnKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBzbGlkZSkge1xuICAgICAgICAgICAgICAgIGlmIChzbGlkZS5vZmZzZXRMZWZ0IC0gY2VudGVyT2Zmc2V0ICsgKCQoc2xpZGUpLm91dGVyV2lkdGgoKSAvIDIpID4gKF8uc3dpcGVMZWZ0ICogLTEpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN3aXBlZFNsaWRlID0gc2xpZGU7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2xpZGVzVHJhdmVyc2VkID0gTWF0aC5hYnMoJChzd2lwZWRTbGlkZSkuYXR0cignZGF0YS1zbGljay1pbmRleCcpIC0gXy5jdXJyZW50U2xpZGUpIHx8IDE7XG5cbiAgICAgICAgICAgIHJldHVybiBzbGlkZXNUcmF2ZXJzZWQ7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGw7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuZ29UbyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja0dvVG8gPSBmdW5jdGlvbihzbGlkZSwgZG9udEFuaW1hdGUpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBpbmRleDogcGFyc2VJbnQoc2xpZGUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGRvbnRBbmltYXRlKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoISQoXy4kc2xpZGVyKS5oYXNDbGFzcygnc2xpY2staW5pdGlhbGl6ZWQnKSkge1xuXG4gICAgICAgICAgICAkKF8uJHNsaWRlcikuYWRkQ2xhc3MoJ3NsaWNrLWluaXRpYWxpemVkJyk7XG4gICAgICAgICAgICBfLmJ1aWxkUm93cygpO1xuICAgICAgICAgICAgXy5idWlsZE91dCgpO1xuICAgICAgICAgICAgXy5zZXRQcm9wcygpO1xuICAgICAgICAgICAgXy5zdGFydExvYWQoKTtcbiAgICAgICAgICAgIF8ubG9hZFNsaWRlcigpO1xuICAgICAgICAgICAgXy5pbml0aWFsaXplRXZlbnRzKCk7XG4gICAgICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuICAgICAgICAgICAgXy51cGRhdGVEb3RzKCk7XG4gICAgICAgIH1cblxuICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcignaW5pdCcsIFtfXSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRBcnJvd0V2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdwcmV2aW91cydcbiAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICAgICAgXy4kbmV4dEFycm93Lm9uKCdjbGljay5zbGljaycsIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnbmV4dCdcbiAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXREb3RFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgICQoJ2xpJywgXy4kZG90cykub24oJ2NsaWNrLnNsaWNrJywge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdpbmRleCdcbiAgICAgICAgICAgIH0sIF8uY2hhbmdlU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5kb3RzID09PSB0cnVlICYmIF8ub3B0aW9ucy5wYXVzZU9uRG90c0hvdmVyID09PSB0cnVlICYmIF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgJCgnbGknLCBfLiRkb3RzKVxuICAgICAgICAgICAgICAgIC5vbignbW91c2VlbnRlci5zbGljaycsIF8uc2V0UGF1c2VkLmJpbmQoXywgdHJ1ZSkpXG4gICAgICAgICAgICAgICAgLm9uKCdtb3VzZWxlYXZlLnNsaWNrJywgXy5zZXRQYXVzZWQuYmluZChfLCBmYWxzZSkpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmluaXRpYWxpemVFdmVudHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5pbml0QXJyb3dFdmVudHMoKTtcblxuICAgICAgICBfLmluaXREb3RFdmVudHMoKTtcblxuICAgICAgICBfLiRsaXN0Lm9uKCd0b3VjaHN0YXJ0LnNsaWNrIG1vdXNlZG93bi5zbGljaycsIHtcbiAgICAgICAgICAgIGFjdGlvbjogJ3N0YXJ0J1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNobW92ZS5zbGljayBtb3VzZW1vdmUuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdtb3ZlJ1xuICAgICAgICB9LCBfLnN3aXBlSGFuZGxlcik7XG4gICAgICAgIF8uJGxpc3Qub24oJ3RvdWNoZW5kLnNsaWNrIG1vdXNldXAuc2xpY2snLCB7XG4gICAgICAgICAgICBhY3Rpb246ICdlbmQnXG4gICAgICAgIH0sIF8uc3dpcGVIYW5kbGVyKTtcbiAgICAgICAgXy4kbGlzdC5vbigndG91Y2hjYW5jZWwuc2xpY2sgbW91c2VsZWF2ZS5zbGljaycsIHtcbiAgICAgICAgICAgIGFjdGlvbjogJ2VuZCdcbiAgICAgICAgfSwgXy5zd2lwZUhhbmRsZXIpO1xuXG4gICAgICAgIF8uJGxpc3Qub24oJ2NsaWNrLnNsaWNrJywgXy5jbGlja0hhbmRsZXIpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKF8udmlzaWJpbGl0eUNoYW5nZSwgXy52aXNpYmlsaXR5LmJpbmQoXykpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy4kbGlzdC5vbignbW91c2VlbnRlci5zbGljaycsIF8uc2V0UGF1c2VkLmJpbmQoXywgdHJ1ZSkpO1xuICAgICAgICBfLiRsaXN0Lm9uKCdtb3VzZWxlYXZlLnNsaWNrJywgXy5zZXRQYXVzZWQuYmluZChfLCBmYWxzZSkpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kbGlzdC5vbigna2V5ZG93bi5zbGljaycsIF8ua2V5SGFuZGxlcik7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZvY3VzT25TZWxlY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vbignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdvcmllbnRhdGlvbmNoYW5nZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5vcmllbnRhdGlvbkNoYW5nZS5iaW5kKF8pKTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5zbGljay5zbGljay0nICsgXy5pbnN0YW5jZVVpZCwgXy5yZXNpemUuYmluZChfKSk7XG5cbiAgICAgICAgJCgnW2RyYWdnYWJsZSE9dHJ1ZV0nLCBfLiRzbGlkZVRyYWNrKS5vbignZHJhZ3N0YXJ0JywgXy5wcmV2ZW50RGVmYXVsdCk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdsb2FkLnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcbiAgICAgICAgJChkb2N1bWVudCkub24oJ3JlYWR5LnNsaWNrLnNsaWNrLScgKyBfLmluc3RhbmNlVWlkLCBfLnNldFBvc2l0aW9uKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuaW5pdFVJID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXJyb3dzID09PSB0cnVlICYmIF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgXy4kcHJldkFycm93LnNob3coKTtcbiAgICAgICAgICAgIF8uJG5leHRBcnJvdy5zaG93KCk7XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZG90cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJGRvdHMuc2hvdygpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmF1dG9wbGF5ID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmtleUhhbmRsZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMzcgJiYgXy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT09IDM5ICYmIF8ub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmNoYW5nZVNsaWRlKHtcbiAgICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICduZXh0J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLmxhenlMb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgbG9hZFJhbmdlLCBjbG9uZVJhbmdlLCByYW5nZVN0YXJ0LCByYW5nZUVuZDtcblxuICAgICAgICBmdW5jdGlvbiBsb2FkSW1hZ2VzKGltYWdlc1Njb3BlKSB7XG4gICAgICAgICAgICAkKCdpbWdbZGF0YS1sYXp5XScsIGltYWdlc1Njb3BlKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGltYWdlU291cmNlID0gJCh0aGlzKS5hdHRyKCdkYXRhLWxhenknKSxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VUb0xvYWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKTtcblxuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpbWFnZS5hbmltYXRlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wYWNpdHk6IDFcbiAgICAgICAgICAgICAgICAgICAgfSwgMjAwKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGltYWdlVG9Mb2FkLnNyYyA9IGltYWdlU291cmNlO1xuXG4gICAgICAgICAgICAgICAgaW1hZ2VcbiAgICAgICAgICAgICAgICAgICAgLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKCdzcmMnLCBpbWFnZVNvdXJjZSlcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtbGF6eScpXG4gICAgICAgICAgICAgICAgICAgIC5yZW1vdmVDbGFzcygnc2xpY2stbG9hZGluZycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5jdXJyZW50U2xpZGUgKyAoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIgKyAxKTtcbiAgICAgICAgICAgICAgICByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgMjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmFuZ2VTdGFydCA9IE1hdGgubWF4KDAsIF8uY3VycmVudFNsaWRlIC0gKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgLyAyICsgMSkpO1xuICAgICAgICAgICAgICAgIHJhbmdlRW5kID0gMiArIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMiArIDEpICsgXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByYW5nZVN0YXJ0ID0gXy5vcHRpb25zLmluZmluaXRlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIF8uY3VycmVudFNsaWRlIDogXy5jdXJyZW50U2xpZGU7XG4gICAgICAgICAgICByYW5nZUVuZCA9IHJhbmdlU3RhcnQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJhbmdlU3RhcnQgPiAwKSByYW5nZVN0YXJ0LS07XG4gICAgICAgICAgICAgICAgaWYgKHJhbmdlRW5kIDw9IF8uc2xpZGVDb3VudCkgcmFuZ2VFbmQrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxvYWRSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stc2xpZGUnKS5zbGljZShyYW5nZVN0YXJ0LCByYW5nZUVuZCk7XG4gICAgICAgIGxvYWRJbWFnZXMobG9hZFJhbmdlKTtcblxuICAgICAgICBpZiAoXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJyk7XG4gICAgICAgICAgICBsb2FkSW1hZ2VzKGNsb25lUmFuZ2UpO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIGNsb25lUmFuZ2UgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLWNsb25lZCcpLnNsaWNlKDAsIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgbG9hZEltYWdlcyhjbG9uZVJhbmdlKTtcbiAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA9PT0gMCkge1xuICAgICAgICAgICAgY2xvbmVSYW5nZSA9IF8uJHNsaWRlci5maW5kKCcuc2xpY2stY2xvbmVkJykuc2xpY2UoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAqIC0xKTtcbiAgICAgICAgICAgIGxvYWRJbWFnZXMoY2xvbmVSYW5nZSk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUubG9hZFNsaWRlciA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5jc3Moe1xuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICB9KTtcblxuICAgICAgICBfLiRzbGlkZXIucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKTtcblxuICAgICAgICBfLmluaXRVSSgpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMubGF6eUxvYWQgPT09ICdwcm9ncmVzc2l2ZScpIHtcbiAgICAgICAgICAgIF8ucHJvZ3Jlc3NpdmVMYXp5TG9hZCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLm5leHQgPSBTbGljay5wcm90b3R5cGUuc2xpY2tOZXh0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uY2hhbmdlU2xpZGUoe1xuICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICduZXh0J1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUub3JpZW50YXRpb25DaGFuZ2UgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGVja1Jlc3BvbnNpdmUoKTtcbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5wYXVzZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1BhdXNlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuICAgICAgICBfLnBhdXNlZCA9IHRydWU7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnBsYXkgPSBTbGljay5wcm90b3R5cGUuc2xpY2tQbGF5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8ucGF1c2VkID0gZmFsc2U7XG4gICAgICAgIF8uYXV0b1BsYXkoKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucG9zdFNsaWRlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoJ2FmdGVyQ2hhbmdlJywgW18sIGluZGV4XSk7XG5cbiAgICAgICAgXy5hbmltYXRpbmcgPSBmYWxzZTtcblxuICAgICAgICBfLnNldFBvc2l0aW9uKCk7XG5cbiAgICAgICAgXy5zd2lwZUxlZnQgPSBudWxsO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUgJiYgXy5wYXVzZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLmF1dG9QbGF5KCk7XG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1ByZXYgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ3ByZXZpb3VzJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnByb2dyZXNzaXZlTGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBpbWdDb3VudCwgdGFyZ2V0SW1hZ2U7XG5cbiAgICAgICAgaW1nQ291bnQgPSAkKCdpbWdbZGF0YS1sYXp5XScsIF8uJHNsaWRlcikubGVuZ3RoO1xuXG4gICAgICAgIGlmIChpbWdDb3VudCA+IDApIHtcbiAgICAgICAgICAgIHRhcmdldEltYWdlID0gJCgnaW1nW2RhdGEtbGF6eV0nLCBfLiRzbGlkZXIpLmZpcnN0KCk7XG4gICAgICAgICAgICB0YXJnZXRJbWFnZS5hdHRyKCdzcmMnLCB0YXJnZXRJbWFnZS5hdHRyKCdkYXRhLWxhenknKSkucmVtb3ZlQ2xhc3MoJ3NsaWNrLWxvYWRpbmcnKS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRJbWFnZS5yZW1vdmVBdHRyKCdkYXRhLWxhenknKTtcbiAgICAgICAgICAgICAgICAgICAgXy5wcm9ncmVzc2l2ZUxhenlMb2FkKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZXJyb3IoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldEltYWdlLnJlbW92ZUF0dHIoJ2RhdGEtbGF6eScpO1xuICAgICAgICAgICAgICAgICAgICBfLnByb2dyZXNzaXZlTGF6eUxvYWQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgY3VycmVudFNsaWRlID0gXy5jdXJyZW50U2xpZGU7XG5cbiAgICAgICAgXy5kZXN0cm95KCk7XG5cbiAgICAgICAgJC5leHRlbmQoXywgXy5pbml0aWFscyk7XG5cbiAgICAgICAgXy5pbml0KCk7XG5cbiAgICAgICAgXy5jaGFuZ2VTbGlkZSh7XG4gICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogJ2luZGV4JyxcbiAgICAgICAgICAgICAgICBpbmRleDogY3VycmVudFNsaWRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGZhbHNlKTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUucmVpbml0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oXy5vcHRpb25zLnNsaWRlKS5hZGRDbGFzcyhcbiAgICAgICAgICAgICdzbGljay1zbGlkZScpO1xuXG4gICAgICAgIF8uc2xpZGVDb3VudCA9IF8uJHNsaWRlcy5sZW5ndGg7XG5cbiAgICAgICAgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAmJiBfLmN1cnJlbnRTbGlkZSAhPT0gMCkge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBfLmN1cnJlbnRTbGlkZSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPD0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuICAgICAgICAgICAgXy5jdXJyZW50U2xpZGUgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5zZXRQcm9wcygpO1xuXG4gICAgICAgIF8uc2V0dXBJbmZpbml0ZSgpO1xuXG4gICAgICAgIF8uYnVpbGRBcnJvd3MoKTtcblxuICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuXG4gICAgICAgIF8uaW5pdEFycm93RXZlbnRzKCk7XG5cbiAgICAgICAgXy5idWlsZERvdHMoKTtcblxuICAgICAgICBfLnVwZGF0ZURvdHMoKTtcblxuICAgICAgICBfLmluaXREb3RFdmVudHMoKTtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZvY3VzT25TZWxlY3QgPT09IHRydWUpIHtcbiAgICAgICAgICAgICQoXy4kc2xpZGVUcmFjaykuY2hpbGRyZW4oKS5vbignY2xpY2suc2xpY2snLCBfLnNlbGVjdEhhbmRsZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXMoMCk7XG5cbiAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdyZUluaXQnLCBbX10pO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKCQod2luZG93KS53aWR0aCgpICE9PSBfLndpbmRvd1dpZHRoKSB7XG4gICAgICAgICAgICBjbGVhclRpbWVvdXQoXy53aW5kb3dEZWxheSk7XG4gICAgICAgICAgICBfLndpbmRvd0RlbGF5ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgXy53aW5kb3dXaWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuICAgICAgICAgICAgICAgIF8uY2hlY2tSZXNwb25zaXZlKCk7XG4gICAgICAgICAgICAgICAgXy5zZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5yZW1vdmVTbGlkZSA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1JlbW92ZSA9IGZ1bmN0aW9uKGluZGV4LCByZW1vdmVCZWZvcmUsIHJlbW92ZUFsbCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAodHlwZW9mKGluZGV4KSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICByZW1vdmVCZWZvcmUgPSBpbmRleDtcbiAgICAgICAgICAgIGluZGV4ID0gcmVtb3ZlQmVmb3JlID09PSB0cnVlID8gMCA6IF8uc2xpZGVDb3VudCAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmRleCA9IHJlbW92ZUJlZm9yZSA9PT0gdHJ1ZSA/IC0taW5kZXggOiBpbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLnNsaWRlQ291bnQgPCAxIHx8IGluZGV4IDwgMCB8fCBpbmRleCA+IF8uc2xpZGVDb3VudCAtIDEpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udW5sb2FkKCk7XG5cbiAgICAgICAgaWYgKHJlbW92ZUFsbCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbigpLnJlbW92ZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jaGlsZHJlbih0aGlzLm9wdGlvbnMuc2xpZGUpLmVxKGluZGV4KS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlcyA9IF8uJHNsaWRlVHJhY2suY2hpbGRyZW4odGhpcy5vcHRpb25zLnNsaWRlKTtcblxuICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgXy4kc2xpZGVUcmFjay5hcHBlbmQoXy4kc2xpZGVzKTtcblxuICAgICAgICBfLiRzbGlkZXNDYWNoZSA9IF8uJHNsaWRlcztcblxuICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXRDU1MgPSBmdW5jdGlvbihwb3NpdGlvbikge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fSxcbiAgICAgICAgICAgIHgsIHk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gLXBvc2l0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHggPSBfLnBvc2l0aW9uUHJvcCA9PSAnbGVmdCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuICAgICAgICB5ID0gXy5wb3NpdGlvblByb3AgPT0gJ3RvcCcgPyBNYXRoLmNlaWwocG9zaXRpb24pICsgJ3B4JyA6ICcwcHgnO1xuXG4gICAgICAgIHBvc2l0aW9uUHJvcHNbXy5wb3NpdGlvblByb3BdID0gcG9zaXRpb247XG5cbiAgICAgICAgaWYgKF8udHJhbnNmb3Jtc0VuYWJsZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNzcyhwb3NpdGlvblByb3BzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBvc2l0aW9uUHJvcHMgPSB7fTtcbiAgICAgICAgICAgIGlmIChfLmNzc1RyYW5zaXRpb25zID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlKCcgKyB4ICsgJywgJyArIHkgKyAnKSc7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVUcmFjay5jc3MocG9zaXRpb25Qcm9wcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uUHJvcHNbXy5hbmltVHlwZV0gPSAndHJhbnNsYXRlM2QoJyArIHggKyAnLCAnICsgeSArICcsIDBweCknO1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suY3NzKHBvc2l0aW9uUHJvcHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldERpbWVuc2lvbnMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKCcwcHggJyArIF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy4kbGlzdC5oZWlnaHQoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KTtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIF8uJGxpc3QuY3NzKHtcbiAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogKF8ub3B0aW9ucy5jZW50ZXJQYWRkaW5nICsgJyAwcHgnKVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgXy5saXN0V2lkdGggPSBfLiRsaXN0LndpZHRoKCk7XG4gICAgICAgIF8ubGlzdEhlaWdodCA9IF8uJGxpc3QuaGVpZ2h0KCk7XG5cblxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsID09PSBmYWxzZSAmJiBfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc2xpZGVXaWR0aCA9IE1hdGguY2VpbChfLmxpc3RXaWR0aCAvIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpO1xuICAgICAgICAgICAgXy4kc2xpZGVUcmFjay53aWR0aChNYXRoLmNlaWwoKF8uc2xpZGVXaWR0aCAqIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLmxlbmd0aCkpKTtcblxuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy52YXJpYWJsZVdpZHRoID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLndpZHRoKDUwMDAgKiBfLnNsaWRlQ291bnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5zbGlkZVdpZHRoID0gTWF0aC5jZWlsKF8ubGlzdFdpZHRoKTtcbiAgICAgICAgICAgIF8uJHNsaWRlVHJhY2suaGVpZ2h0KE1hdGguY2VpbCgoXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJIZWlnaHQodHJ1ZSkgKiBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKCcuc2xpY2stc2xpZGUnKS5sZW5ndGgpKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb2Zmc2V0ID0gXy4kc2xpZGVzLmZpcnN0KCkub3V0ZXJXaWR0aCh0cnVlKSAtIF8uJHNsaWRlcy5maXJzdCgpLndpZHRoKCk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmFyaWFibGVXaWR0aCA9PT0gZmFsc2UpIF8uJHNsaWRlVHJhY2suY2hpbGRyZW4oJy5zbGljay1zbGlkZScpLndpZHRoKF8uc2xpZGVXaWR0aCAtIG9mZnNldCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldEZhZGUgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICB0YXJnZXRMZWZ0O1xuXG4gICAgICAgIF8uJHNsaWRlcy5lYWNoKGZ1bmN0aW9uKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB0YXJnZXRMZWZ0ID0gKF8uc2xpZGVXaWR0aCAqIGluZGV4KSAqIC0xO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5ydGwgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICByaWdodDogdGFyZ2V0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgICAgICAgICAgICB6SW5kZXg6IDgwMCxcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eTogMFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmNzcyh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiB0YXJnZXRMZWZ0LFxuICAgICAgICAgICAgICAgICAgICB0b3A6IDAsXG4gICAgICAgICAgICAgICAgICAgIHpJbmRleDogODAwLFxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF8uJHNsaWRlcy5lcShfLmN1cnJlbnRTbGlkZSkuY3NzKHtcbiAgICAgICAgICAgIHpJbmRleDogOTAwLFxuICAgICAgICAgICAgb3BhY2l0eTogMVxuICAgICAgICB9KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0SGVpZ2h0ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93ID09PSAxICYmIF8ub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCA9PT0gdHJ1ZSAmJiBfLm9wdGlvbnMudmVydGljYWwgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0SGVpZ2h0ID0gXy4kc2xpZGVzLmVxKF8uY3VycmVudFNsaWRlKS5vdXRlckhlaWdodCh0cnVlKTtcbiAgICAgICAgICAgIF8uJGxpc3QuY3NzKCdoZWlnaHQnLCB0YXJnZXRIZWlnaHQpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldE9wdGlvbiA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1NldE9wdGlvbiA9IGZ1bmN0aW9uKG9wdGlvbiwgdmFsdWUsIHJlZnJlc2gpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8ub3B0aW9uc1tvcHRpb25dID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHJlZnJlc2ggPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8udW5sb2FkKCk7XG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIF8uc2V0RGltZW5zaW9ucygpO1xuXG4gICAgICAgIF8uc2V0SGVpZ2h0KCk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgXy5zZXRDU1MoXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnNldEZhZGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKCdzZXRQb3NpdGlvbicsIFtfXSk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFByb3BzID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgYm9keVN0eWxlID0gZG9jdW1lbnQuYm9keS5zdHlsZTtcblxuICAgICAgICBfLnBvc2l0aW9uUHJvcCA9IF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gdHJ1ZSA/ICd0b3AnIDogJ2xlZnQnO1xuXG4gICAgICAgIGlmIChfLnBvc2l0aW9uUHJvcCA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci5hZGRDbGFzcygnc2xpY2stdmVydGljYWwnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF8uJHNsaWRlci5yZW1vdmVDbGFzcygnc2xpY2stdmVydGljYWwnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChib2R5U3R5bGUuV2Via2l0VHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBib2R5U3R5bGUuTW96VHJhbnNpdGlvbiAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgICAgICBib2R5U3R5bGUubXNUcmFuc2l0aW9uICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMudXNlQ1NTID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5jc3NUcmFuc2l0aW9ucyA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYm9keVN0eWxlLk9UcmFuc2Zvcm0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgXy5hbmltVHlwZSA9ICdPVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctby10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICdPVHJhbnNpdGlvbic7XG4gICAgICAgICAgICBpZiAoYm9keVN0eWxlLnBlcnNwZWN0aXZlUHJvcGVydHkgPT09IHVuZGVmaW5lZCAmJiBib2R5U3R5bGUud2Via2l0UGVyc3BlY3RpdmUgPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUuTW96VHJhbnNmb3JtICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAnTW96VHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbW96LXRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zaXRpb25UeXBlID0gJ01velRyYW5zaXRpb24nO1xuICAgICAgICAgICAgaWYgKGJvZHlTdHlsZS5wZXJzcGVjdGl2ZVByb3BlcnR5ID09PSB1bmRlZmluZWQgJiYgYm9keVN0eWxlLk1velBlcnNwZWN0aXZlID09PSB1bmRlZmluZWQpIF8uYW5pbVR5cGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYm9keVN0eWxlLndlYmtpdFRyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ3dlYmtpdFRyYW5zZm9ybSc7XG4gICAgICAgICAgICBfLnRyYW5zZm9ybVR5cGUgPSAnLXdlYmtpdC10cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd3ZWJraXRUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUucGVyc3BlY3RpdmVQcm9wZXJ0eSA9PT0gdW5kZWZpbmVkICYmIGJvZHlTdHlsZS53ZWJraXRQZXJzcGVjdGl2ZSA9PT0gdW5kZWZpbmVkKSBfLmFuaW1UeXBlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJvZHlTdHlsZS5tc1RyYW5zZm9ybSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBfLmFuaW1UeXBlID0gJ21zVHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICctbXMtdHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNpdGlvblR5cGUgPSAnbXNUcmFuc2l0aW9uJztcbiAgICAgICAgICAgIGlmIChib2R5U3R5bGUubXNUcmFuc2Zvcm0gPT09IHVuZGVmaW5lZCkgXy5hbmltVHlwZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChib2R5U3R5bGUudHJhbnNmb3JtICE9PSB1bmRlZmluZWQgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYW5pbVR5cGUgPSAndHJhbnNmb3JtJztcbiAgICAgICAgICAgIF8udHJhbnNmb3JtVHlwZSA9ICd0cmFuc2Zvcm0nO1xuICAgICAgICAgICAgXy50cmFuc2l0aW9uVHlwZSA9ICd0cmFuc2l0aW9uJztcbiAgICAgICAgfVxuICAgICAgICBfLnRyYW5zZm9ybXNFbmFibGVkID0gKF8uYW5pbVR5cGUgIT09IG51bGwgJiYgXy5hbmltVHlwZSAhPT0gZmFsc2UpO1xuXG4gICAgfTtcblxuXG4gICAgU2xpY2sucHJvdG90eXBlLnNldFNsaWRlQ2xhc3NlcyA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgY2VudGVyT2Zmc2V0LCBhbGxTbGlkZXMsIGluZGV4T2Zmc2V0LCByZW1haW5kZXI7XG5cbiAgICAgICAgXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnJlbW92ZUNsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICd0cnVlJykucmVtb3ZlQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuICAgICAgICBhbGxTbGlkZXMgPSBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJyk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgIGNlbnRlck9mZnNldCA9IE1hdGguZmxvb3IoXy5vcHRpb25zLnNsaWRlc1RvU2hvdyAvIDIpO1xuXG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlKSB7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPj0gY2VudGVyT2Zmc2V0ICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSAxKSAtIGNlbnRlck9mZnNldCkge1xuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXMuc2xpY2UoaW5kZXggLSBjZW50ZXJPZmZzZXQsIGluZGV4ICsgY2VudGVyT2Zmc2V0ICsgMSkuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhPZmZzZXQgPSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICsgaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5zbGljZShpbmRleE9mZnNldCAtIGNlbnRlck9mZnNldCArIDEsIGluZGV4T2Zmc2V0ICsgY2VudGVyT2Zmc2V0ICsgMikuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ2ZhbHNlJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5lcShhbGxTbGlkZXMubGVuZ3RoIC0gMSAtIF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGluZGV4ID09PSBfLnNsaWRlQ291bnQgLSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5lcShfLm9wdGlvbnMuc2xpZGVzVG9TaG93KS5hZGRDbGFzcygnc2xpY2stY2VudGVyJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWNrLWNlbnRlcicpO1xuXG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDw9IChfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSkge1xuICAgICAgICAgICAgICAgIF8uJHNsaWRlcy5zbGljZShpbmRleCwgaW5kZXggKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYWxsU2xpZGVzLmxlbmd0aCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgYWxsU2xpZGVzLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1haW5kZXIgPSBfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93O1xuICAgICAgICAgICAgICAgIGluZGV4T2Zmc2V0ID0gXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlID8gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIGluZGV4IDogaW5kZXg7XG4gICAgICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cgPT0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsICYmIChfLnNsaWRlQ291bnQgLSBpbmRleCkgPCBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5zbGljZShpbmRleE9mZnNldCAtIChfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC0gcmVtYWluZGVyKSwgaW5kZXhPZmZzZXQgKyByZW1haW5kZXIpLmFkZENsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKCdhcmlhLWhpZGRlbicsICdmYWxzZScpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFsbFNsaWRlcy5zbGljZShpbmRleE9mZnNldCwgaW5kZXhPZmZzZXQgKyBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cignYXJpYS1oaWRkZW4nLCAnZmFsc2UnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMubGF6eUxvYWQgPT09ICdvbmRlbWFuZCcpIHtcbiAgICAgICAgICAgIF8ubGF6eUxvYWQoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS5zZXR1cEluZmluaXRlID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgaSwgc2xpZGVJbmRleCwgaW5maW5pdGVDb3VudDtcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8ub3B0aW9ucy5jZW50ZXJNb2RlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmluZmluaXRlID09PSB0cnVlICYmIF8ub3B0aW9ucy5mYWRlID09PSBmYWxzZSkge1xuXG4gICAgICAgICAgICBzbGlkZUluZGV4ID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA+IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcblxuICAgICAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuY2VudGVyTW9kZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50ID0gXy5vcHRpb25zLnNsaWRlc1RvU2hvdyArIDE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaW5maW5pdGVDb3VudCA9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3c7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gXy5zbGlkZUNvdW50OyBpID4gKF8uc2xpZGVDb3VudCAtXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmZpbml0ZUNvdW50KTsgaSAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNsaWRlSW5kZXggPSBpIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggLSBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAucHJlcGVuZFRvKF8uJHNsaWRlVHJhY2spLmFkZENsYXNzKCdzbGljay1jbG9uZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGluZmluaXRlQ291bnQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzbGlkZUluZGV4ID0gaTtcbiAgICAgICAgICAgICAgICAgICAgJChfLiRzbGlkZXNbc2xpZGVJbmRleF0pLmNsb25lKHRydWUpLmF0dHIoJ2lkJywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZGF0YS1zbGljay1pbmRleCcsIHNsaWRlSW5kZXggKyBfLnNsaWRlQ291bnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAuYXBwZW5kVG8oXy4kc2xpZGVUcmFjaykuYWRkQ2xhc3MoJ3NsaWNrLWNsb25lZCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmZpbmQoJy5zbGljay1jbG9uZWQnKS5maW5kKCdbaWRdJykuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdpZCcsICcnKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2V0UGF1c2VkID0gZnVuY3Rpb24ocGF1c2VkKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuYXV0b3BsYXkgPT09IHRydWUgJiYgXy5vcHRpb25zLnBhdXNlT25Ib3ZlciA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5wYXVzZWQgPSBwYXVzZWQ7XG4gICAgICAgICAgICBfLmF1dG9QbGF5Q2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2VsZWN0SGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIHZhciB0YXJnZXRFbGVtZW50ID0gJChldmVudC50YXJnZXQpLmlzKCcuc2xpY2stc2xpZGUnKSA/XG4gICAgICAgICAgICAkKGV2ZW50LnRhcmdldCkgOlxuICAgICAgICAgICAgJChldmVudC50YXJnZXQpLnBhcmVudHMoJy5zbGljay1zbGlkZScpO1xuXG4gICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KHRhcmdldEVsZW1lbnQuYXR0cignZGF0YS1zbGljay1pbmRleCcpKTtcblxuICAgICAgICBpZiAoIWluZGV4KSBpbmRleCA9IDA7XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIuZmluZCgnLnNsaWNrLXNsaWRlJykucmVtb3ZlQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoJ2FyaWEtaGlkZGVuJywgJ3RydWUnKTtcbiAgICAgICAgICAgIF8uJHNsaWRlcy5lcShpbmRleCkuYWRkQ2xhc3MoJ3NsaWNrLWFjdGl2ZScpLmF0dHIoXCJhcmlhLWhpZGRlblwiLCBcImZhbHNlXCIpO1xuICAgICAgICAgICAgaWYgKF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy4kc2xpZGVyLmZpbmQoJy5zbGljay1zbGlkZScpLnJlbW92ZUNsYXNzKCdzbGljay1jZW50ZXInKTtcbiAgICAgICAgICAgICAgICBfLiRzbGlkZXMuZXEoaW5kZXgpLmFkZENsYXNzKCdzbGljay1jZW50ZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIF8uc2xpZGVIYW5kbGVyKGluZGV4KTtcblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc2xpZGVIYW5kbGVyID0gZnVuY3Rpb24oaW5kZXgsIHN5bmMsIGRvbnRBbmltYXRlKSB7XG5cbiAgICAgICAgdmFyIHRhcmdldFNsaWRlLCBhbmltU2xpZGUsIG9sZFNsaWRlLCBzbGlkZUxlZnQsIHRhcmdldExlZnQgPSBudWxsLFxuICAgICAgICAgICAgXyA9IHRoaXM7XG5cbiAgICAgICAgc3luYyA9IHN5bmMgfHwgZmFsc2U7XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlICYmIF8ub3B0aW9ucy53YWl0Rm9yQW5pbWF0ZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5mYWRlID09PSB0cnVlICYmIF8uY3VycmVudFNsaWRlID09PSBpbmRleCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uc2xpZGVDb3VudCA8PSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc3luYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uYXNOYXZGb3IoaW5kZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0U2xpZGUgPSBpbmRleDtcbiAgICAgICAgdGFyZ2V0TGVmdCA9IF8uZ2V0TGVmdCh0YXJnZXRTbGlkZSk7XG4gICAgICAgIHNsaWRlTGVmdCA9IF8uZ2V0TGVmdChfLmN1cnJlbnRTbGlkZSk7XG5cbiAgICAgICAgXy5jdXJyZW50TGVmdCA9IF8uc3dpcGVMZWZ0ID09PSBudWxsID8gc2xpZGVMZWZ0IDogXy5zd2lwZUxlZnQ7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IGZhbHNlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiBfLmdldERvdENvdW50KCkgKiBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKSB7XG4gICAgICAgICAgICBpZiAoXy5vcHRpb25zLmZhZGUgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0U2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgICAgICAgICBpZiAoZG9udEFuaW1hdGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5hbmltYXRlU2xpZGUoc2xpZGVMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8ucG9zdFNsaWRlKHRhcmdldFNsaWRlKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChfLm9wdGlvbnMuaW5maW5pdGUgPT09IGZhbHNlICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSB0cnVlICYmIChpbmRleCA8IDAgfHwgaW5kZXggPiAoXy5zbGlkZUNvdW50IC0gXy5vcHRpb25zLnNsaWRlc1RvU2Nyb2xsKSkpIHtcbiAgICAgICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRTbGlkZSA9IF8uY3VycmVudFNsaWRlO1xuICAgICAgICAgICAgICAgIGlmIChkb250QW5pbWF0ZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBfLmFuaW1hdGVTbGlkZShzbGlkZUxlZnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUodGFyZ2V0U2xpZGUpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZSh0YXJnZXRTbGlkZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hdXRvcGxheSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChfLmF1dG9QbGF5VGltZXIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRhcmdldFNsaWRlIDwgMCkge1xuICAgICAgICAgICAgaWYgKF8uc2xpZGVDb3VudCAlIF8ub3B0aW9ucy5zbGlkZXNUb1Njcm9sbCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGFuaW1TbGlkZSA9IF8uc2xpZGVDb3VudCAtIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSBfLnNsaWRlQ291bnQgKyB0YXJnZXRTbGlkZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0YXJnZXRTbGlkZSA+PSBfLnNsaWRlQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChfLnNsaWRlQ291bnQgJSBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhbmltU2xpZGUgPSB0YXJnZXRTbGlkZSAtIF8uc2xpZGVDb3VudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFuaW1TbGlkZSA9IHRhcmdldFNsaWRlO1xuICAgICAgICB9XG5cbiAgICAgICAgXy5hbmltYXRpbmcgPSB0cnVlO1xuXG4gICAgICAgIF8uJHNsaWRlci50cmlnZ2VyKFwiYmVmb3JlQ2hhbmdlXCIsIFtfLCBfLmN1cnJlbnRTbGlkZSwgYW5pbVNsaWRlXSk7XG5cbiAgICAgICAgb2xkU2xpZGUgPSBfLmN1cnJlbnRTbGlkZTtcbiAgICAgICAgXy5jdXJyZW50U2xpZGUgPSBhbmltU2xpZGU7XG5cbiAgICAgICAgXy5zZXRTbGlkZUNsYXNzZXMoXy5jdXJyZW50U2xpZGUpO1xuXG4gICAgICAgIF8udXBkYXRlRG90cygpO1xuICAgICAgICBfLnVwZGF0ZUFycm93cygpO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgXy5mYWRlU2xpZGUoYW5pbVNsaWRlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5wb3N0U2xpZGUoYW5pbVNsaWRlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF8uYW5pbWF0ZUhlaWdodCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRvbnRBbmltYXRlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBfLmFuaW1hdGVTbGlkZSh0YXJnZXRMZWZ0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnBvc3RTbGlkZShhbmltU2xpZGUpO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN0YXJ0TG9hZCA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcztcblxuICAgICAgICBpZiAoXy5vcHRpb25zLmFycm93cyA9PT0gdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG5cbiAgICAgICAgICAgIF8uJHByZXZBcnJvdy5oaWRlKCk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cuaGlkZSgpO1xuXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5vcHRpb25zLmRvdHMgPT09IHRydWUgJiYgXy5zbGlkZUNvdW50ID4gXy5vcHRpb25zLnNsaWRlc1RvU2hvdykge1xuXG4gICAgICAgICAgICBfLiRkb3RzLmhpZGUoKTtcblxuICAgICAgICB9XG5cbiAgICAgICAgXy4kc2xpZGVyLmFkZENsYXNzKCdzbGljay1sb2FkaW5nJyk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRGlyZWN0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHhEaXN0LCB5RGlzdCwgciwgc3dpcGVBbmdsZSwgXyA9IHRoaXM7XG5cbiAgICAgICAgeERpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WCAtIF8udG91Y2hPYmplY3QuY3VyWDtcbiAgICAgICAgeURpc3QgPSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSAtIF8udG91Y2hPYmplY3QuY3VyWTtcbiAgICAgICAgciA9IE1hdGguYXRhbjIoeURpc3QsIHhEaXN0KTtcblxuICAgICAgICBzd2lwZUFuZ2xlID0gTWF0aC5yb3VuZChyICogMTgwIC8gTWF0aC5QSSk7XG4gICAgICAgIGlmIChzd2lwZUFuZ2xlIDwgMCkge1xuICAgICAgICAgICAgc3dpcGVBbmdsZSA9IDM2MCAtIE1hdGguYWJzKHN3aXBlQW5nbGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKChzd2lwZUFuZ2xlIDw9IDQ1KSAmJiAoc3dpcGVBbmdsZSA+PSAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIChfLm9wdGlvbnMucnRsID09PSBmYWxzZSA/ICdsZWZ0JyA6ICdyaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgoc3dpcGVBbmdsZSA8PSAzNjApICYmIChzd2lwZUFuZ2xlID49IDMxNSkpIHtcbiAgICAgICAgICAgIHJldHVybiAoXy5vcHRpb25zLnJ0bCA9PT0gZmFsc2UgPyAnbGVmdCcgOiAncmlnaHQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHN3aXBlQW5nbGUgPj0gMTM1KSAmJiAoc3dpcGVBbmdsZSA8PSAyMjUpKSB7XG4gICAgICAgICAgICByZXR1cm4gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gJ3JpZ2h0JyA6ICdsZWZ0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlmICgoc3dpcGVBbmdsZSA+PSAzNSkgJiYgKHN3aXBlQW5nbGUgPD0gMTM1KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAnbGVmdCc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAncmlnaHQnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICd2ZXJ0aWNhbCc7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlRW5kID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBzbGlkZUNvdW50O1xuXG4gICAgICAgIF8uZHJhZ2dpbmcgPSBmYWxzZTtcblxuICAgICAgICBfLnNob3VsZENsaWNrID0gKF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPiAxMCkgPyBmYWxzZSA6IHRydWU7XG5cbiAgICAgICAgaWYgKF8udG91Y2hPYmplY3QuY3VyWCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy50b3VjaE9iamVjdC5lZGdlSGl0ID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcihcImVkZ2VcIiwgW18sIF8uc3dpcGVEaXJlY3Rpb24oKV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPj0gXy50b3VjaE9iamVjdC5taW5Td2lwZSkge1xuXG4gICAgICAgICAgICBzd2l0Y2ggKF8uc3dpcGVEaXJlY3Rpb24oKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgICAgICAgICAgICAgICBzbGlkZUNvdW50ID0gXy5vcHRpb25zLnN3aXBlVG9TbGlkZSA/IF8uY2hlY2tOYXZpZ2FibGUoXy5jdXJyZW50U2xpZGUgKyBfLmdldFNsaWRlQ291bnQoKSkgOiBfLmN1cnJlbnRTbGlkZSArIF8uZ2V0U2xpZGVDb3VudCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihzbGlkZUNvdW50KTtcbiAgICAgICAgICAgICAgICAgICAgXy5jdXJyZW50RGlyZWN0aW9uID0gMDtcbiAgICAgICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfLiRzbGlkZXIudHJpZ2dlcihcInN3aXBlXCIsIFtfLCBcImxlZnRcIl0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgICAgICAgICAgICAgICAgc2xpZGVDb3VudCA9IF8ub3B0aW9ucy5zd2lwZVRvU2xpZGUgPyBfLmNoZWNrTmF2aWdhYmxlKF8uY3VycmVudFNsaWRlIC0gXy5nZXRTbGlkZUNvdW50KCkpIDogXy5jdXJyZW50U2xpZGUgLSBfLmdldFNsaWRlQ291bnQoKTtcbiAgICAgICAgICAgICAgICAgICAgXy5zbGlkZUhhbmRsZXIoc2xpZGVDb3VudCk7XG4gICAgICAgICAgICAgICAgICAgIF8uY3VycmVudERpcmVjdGlvbiA9IDE7XG4gICAgICAgICAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgXy4kc2xpZGVyLnRyaWdnZXIoXCJzd2lwZVwiLCBbXywgXCJyaWdodFwiXSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKF8udG91Y2hPYmplY3Quc3RhcnRYICE9PSBfLnRvdWNoT2JqZWN0LmN1clgpIHtcbiAgICAgICAgICAgICAgICBfLnNsaWRlSGFuZGxlcihfLmN1cnJlbnRTbGlkZSk7XG4gICAgICAgICAgICAgICAgXy50b3VjaE9iamVjdCA9IHt9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlSGFuZGxlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmICgoXy5vcHRpb25zLnN3aXBlID09PSBmYWxzZSkgfHwgKCdvbnRvdWNoZW5kJyBpbiBkb2N1bWVudCAmJiBfLm9wdGlvbnMuc3dpcGUgPT09IGZhbHNlKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKF8ub3B0aW9ucy5kcmFnZ2FibGUgPT09IGZhbHNlICYmIGV2ZW50LnR5cGUuaW5kZXhPZignbW91c2UnKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIF8udG91Y2hPYmplY3QuZmluZ2VyQ291bnQgPSBldmVudC5vcmlnaW5hbEV2ZW50ICYmIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyAhPT0gdW5kZWZpbmVkID9cbiAgICAgICAgICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcy5sZW5ndGggOiAxO1xuXG4gICAgICAgIF8udG91Y2hPYmplY3QubWluU3dpcGUgPSBfLmxpc3RXaWR0aCAvIF8ub3B0aW9uc1xuICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuXG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnRvdWNoT2JqZWN0Lm1pblN3aXBlID0gXy5saXN0SGVpZ2h0IC8gXy5vcHRpb25zXG4gICAgICAgICAgICAgICAgLnRvdWNoVGhyZXNob2xkO1xuICAgICAgICB9XG5cbiAgICAgICAgc3dpdGNoIChldmVudC5kYXRhLmFjdGlvbikge1xuXG4gICAgICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZVN0YXJ0KGV2ZW50KTtcbiAgICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSAnbW92ZSc6XG4gICAgICAgICAgICAgICAgXy5zd2lwZU1vdmUoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgIF8uc3dpcGVFbmQoZXZlbnQpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUuc3dpcGVNb3ZlID0gZnVuY3Rpb24oZXZlbnQpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBlZGdlV2FzSGl0ID0gZmFsc2UsXG4gICAgICAgICAgICBjdXJMZWZ0LCBzd2lwZURpcmVjdGlvbiwgc3dpcGVMZW5ndGgsIHBvc2l0aW9uT2Zmc2V0LCB0b3VjaGVzO1xuXG4gICAgICAgIHRvdWNoZXMgPSBldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgPyBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgOiBudWxsO1xuXG4gICAgICAgIGlmICghXy5kcmFnZ2luZyB8fCB0b3VjaGVzICYmIHRvdWNoZXMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJMZWZ0ID0gXy5nZXRMZWZ0KF8uY3VycmVudFNsaWRlKTtcblxuICAgICAgICBfLnRvdWNoT2JqZWN0LmN1clggPSB0b3VjaGVzICE9PSB1bmRlZmluZWQgPyB0b3VjaGVzWzBdLnBhZ2VYIDogZXZlbnQuY2xpZW50WDtcbiAgICAgICAgXy50b3VjaE9iamVjdC5jdXJZID0gdG91Y2hlcyAhPT0gdW5kZWZpbmVkID8gdG91Y2hlc1swXS5wYWdlWSA6IGV2ZW50LmNsaWVudFk7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5zd2lwZUxlbmd0aCA9IE1hdGgucm91bmQoTWF0aC5zcXJ0KFxuICAgICAgICAgICAgTWF0aC5wb3coXy50b3VjaE9iamVjdC5jdXJYIC0gXy50b3VjaE9iamVjdC5zdGFydFgsIDIpKSk7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbFN3aXBpbmcgPT09IHRydWUpIHtcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGggPSBNYXRoLnJvdW5kKE1hdGguc3FydChcbiAgICAgICAgICAgICAgICBNYXRoLnBvdyhfLnRvdWNoT2JqZWN0LmN1clkgLSBfLnRvdWNoT2JqZWN0LnN0YXJ0WSwgMikpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXBlRGlyZWN0aW9uID0gXy5zd2lwZURpcmVjdGlvbigpO1xuXG4gICAgICAgIGlmIChzd2lwZURpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQgIT09IHVuZGVmaW5lZCAmJiBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBvc2l0aW9uT2Zmc2V0ID0gKF8ub3B0aW9ucy5ydGwgPT09IGZhbHNlID8gMSA6IC0xKSAqIChfLnRvdWNoT2JqZWN0LmN1clggPiBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA/IDEgOiAtMSk7XG4gICAgICAgIGlmIChfLm9wdGlvbnMudmVydGljYWxTd2lwaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBwb3NpdGlvbk9mZnNldCA9IF8udG91Y2hPYmplY3QuY3VyWSA+IF8udG91Y2hPYmplY3Quc3RhcnRZID8gMSA6IC0xO1xuICAgICAgICB9XG5cblxuICAgICAgICBzd2lwZUxlbmd0aCA9IF8udG91Y2hPYmplY3Quc3dpcGVMZW5ndGg7XG5cbiAgICAgICAgXy50b3VjaE9iamVjdC5lZGdlSGl0ID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5pbmZpbml0ZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICgoXy5jdXJyZW50U2xpZGUgPT09IDAgJiYgc3dpcGVEaXJlY3Rpb24gPT09IFwicmlnaHRcIikgfHwgKF8uY3VycmVudFNsaWRlID49IF8uZ2V0RG90Q291bnQoKSAmJiBzd2lwZURpcmVjdGlvbiA9PT0gXCJsZWZ0XCIpKSB7XG4gICAgICAgICAgICAgICAgc3dpcGVMZW5ndGggPSBfLnRvdWNoT2JqZWN0LnN3aXBlTGVuZ3RoICogXy5vcHRpb25zLmVkZ2VGcmljdGlvbjtcbiAgICAgICAgICAgICAgICBfLnRvdWNoT2JqZWN0LmVkZ2VIaXQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy52ZXJ0aWNhbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIF8uc3dpcGVMZWZ0ID0gY3VyTGVmdCArIHN3aXBlTGVuZ3RoICogcG9zaXRpb25PZmZzZXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IGN1ckxlZnQgKyAoc3dpcGVMZW5ndGggKiAoXy4kbGlzdC5oZWlnaHQoKSAvIF8ubGlzdFdpZHRoKSkgKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5vcHRpb25zLnZlcnRpY2FsU3dpcGluZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgXy5zd2lwZUxlZnQgPSBjdXJMZWZ0ICsgc3dpcGVMZW5ndGggKiBwb3NpdGlvbk9mZnNldDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChfLm9wdGlvbnMuZmFkZSA9PT0gdHJ1ZSB8fCBfLm9wdGlvbnMudG91Y2hNb3ZlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uYW5pbWF0aW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICBfLnN3aXBlTGVmdCA9IG51bGw7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBfLnNldENTUyhfLnN3aXBlTGVmdCk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnN3aXBlU3RhcnQgPSBmdW5jdGlvbihldmVudCkge1xuXG4gICAgICAgIHZhciBfID0gdGhpcyxcbiAgICAgICAgICAgIHRvdWNoZXM7XG5cbiAgICAgICAgaWYgKF8udG91Y2hPYmplY3QuZmluZ2VyQ291bnQgIT09IDEgfHwgXy5zbGlkZUNvdW50IDw9IF8ub3B0aW9ucy5zbGlkZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIF8udG91Y2hPYmplY3QgPSB7fTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudC5vcmlnaW5hbEV2ZW50ICE9PSB1bmRlZmluZWQgJiYgZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRvdWNoZXMgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbMF07XG4gICAgICAgIH1cblxuICAgICAgICBfLnRvdWNoT2JqZWN0LnN0YXJ0WCA9IF8udG91Y2hPYmplY3QuY3VyWCA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXMucGFnZVggOiBldmVudC5jbGllbnRYO1xuICAgICAgICBfLnRvdWNoT2JqZWN0LnN0YXJ0WSA9IF8udG91Y2hPYmplY3QuY3VyWSA9IHRvdWNoZXMgIT09IHVuZGVmaW5lZCA/IHRvdWNoZXMucGFnZVkgOiBldmVudC5jbGllbnRZO1xuXG4gICAgICAgIF8uZHJhZ2dpbmcgPSB0cnVlO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51bmZpbHRlclNsaWRlcyA9IFNsaWNrLnByb3RvdHlwZS5zbGlja1VuZmlsdGVyID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChfLiRzbGlkZXNDYWNoZSAhPT0gbnVsbCkge1xuXG4gICAgICAgICAgICBfLnVubG9hZCgpO1xuXG4gICAgICAgICAgICBfLiRzbGlkZVRyYWNrLmNoaWxkcmVuKHRoaXMub3B0aW9ucy5zbGlkZSkuZGV0YWNoKCk7XG5cbiAgICAgICAgICAgIF8uJHNsaWRlc0NhY2hlLmFwcGVuZFRvKF8uJHNsaWRlVHJhY2spO1xuXG4gICAgICAgICAgICBfLnJlaW5pdCgpO1xuXG4gICAgICAgIH1cblxuICAgIH07XG5cbiAgICBTbGljay5wcm90b3R5cGUudW5sb2FkID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgICQoJy5zbGljay1jbG9uZWQnLCBfLiRzbGlkZXIpLnJlbW92ZSgpO1xuICAgICAgICBpZiAoXy4kZG90cykge1xuICAgICAgICAgICAgXy4kZG90cy5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy4kcHJldkFycm93ICYmICh0eXBlb2YgXy5vcHRpb25zLnByZXZBcnJvdyAhPT0gJ29iamVjdCcpKSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uJG5leHRBcnJvdyAmJiAodHlwZW9mIF8ub3B0aW9ucy5uZXh0QXJyb3cgIT09ICdvYmplY3QnKSkge1xuICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICAgIF8uJHNsaWRlcy5yZW1vdmVDbGFzcygnc2xpY2stc2xpZGUgc2xpY2stYWN0aXZlIHNsaWNrLXZpc2libGUnKS5hdHRyKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpLmNzcygnd2lkdGgnLCAnJyk7XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVuc2xpY2sgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG4gICAgICAgIF8uZGVzdHJveSgpO1xuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS51cGRhdGVBcnJvd3MgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXMsXG4gICAgICAgICAgICBjZW50ZXJPZmZzZXQ7XG5cbiAgICAgICAgY2VudGVyT2Zmc2V0ID0gTWF0aC5mbG9vcihfLm9wdGlvbnMuc2xpZGVzVG9TaG93IC8gMik7XG5cbiAgICAgICAgaWYgKF8ub3B0aW9ucy5hcnJvd3MgPT09IHRydWUgJiYgXy5vcHRpb25zLmluZmluaXRlICE9PVxuICAgICAgICAgICAgdHJ1ZSAmJiBfLnNsaWRlQ291bnQgPiBfLm9wdGlvbnMuc2xpZGVzVG9TaG93KSB7XG4gICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICBfLiRuZXh0QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICBpZiAoXy5jdXJyZW50U2xpZGUgPT09IDApIHtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgXy4kbmV4dEFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChfLmN1cnJlbnRTbGlkZSA+PSBfLnNsaWRlQ291bnQgLSBfLm9wdGlvbnMuc2xpZGVzVG9TaG93ICYmIF8ub3B0aW9ucy5jZW50ZXJNb2RlID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIF8uJG5leHRBcnJvdy5hZGRDbGFzcygnc2xpY2stZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICBfLiRwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKF8uY3VycmVudFNsaWRlID49IF8uc2xpZGVDb3VudCAtIDEgJiYgXy5vcHRpb25zLmNlbnRlck1vZGUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBfLiRuZXh0QXJyb3cuYWRkQ2xhc3MoJ3NsaWNrLWRpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgXy4kcHJldkFycm93LnJlbW92ZUNsYXNzKCdzbGljay1kaXNhYmxlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgU2xpY2sucHJvdG90eXBlLnVwZGF0ZURvdHMgPSBmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgXyA9IHRoaXM7XG5cbiAgICAgICAgaWYgKF8uJGRvdHMgIT09IG51bGwpIHtcblxuICAgICAgICAgICAgXy4kZG90cy5maW5kKCdsaScpLnJlbW92ZUNsYXNzKCdzbGljay1hY3RpdmUnKS5hdHRyKFwiYXJpYS1oaWRkZW5cIiwgXCJ0cnVlXCIpO1xuICAgICAgICAgICAgXy4kZG90cy5maW5kKCdsaScpLmVxKE1hdGguZmxvb3IoXy5jdXJyZW50U2xpZGUgLyBfLm9wdGlvbnMuc2xpZGVzVG9TY3JvbGwpKS5hZGRDbGFzcygnc2xpY2stYWN0aXZlJykuYXR0cihcImFyaWEtaGlkZGVuXCIsIFwiZmFsc2VcIik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgIFNsaWNrLnByb3RvdHlwZS52aXNpYmlsaXR5ID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIF8gPSB0aGlzO1xuXG4gICAgICAgIGlmIChkb2N1bWVudFtfLmhpZGRlbl0pIHtcbiAgICAgICAgICAgIF8ucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXlDbGVhcigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgXy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIF8uYXV0b1BsYXkoKTtcbiAgICAgICAgfVxuXG4gICAgfTtcblxuICAgICQuZm4uc2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF8gPSB0aGlzLFxuICAgICAgICAgICAgb3B0ID0gYXJndW1lbnRzWzBdLFxuICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSksXG4gICAgICAgICAgICBsID0gXy5sZW5ndGgsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIHJldDtcbiAgICAgICAgZm9yIChpOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG9wdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2Ygb3B0ID09ICd1bmRlZmluZWQnKVxuICAgICAgICAgICAgICAgIF9baV0uc2xpY2sgPSBuZXcgU2xpY2soX1tpXSwgb3B0KTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXQgPSBfW2ldLnNsaWNrW29wdF0uYXBwbHkoX1tpXS5zbGljaywgYXJncyk7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHJldCAhPSAndW5kZWZpbmVkJykgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXztcbiAgICB9O1xuXG59KSk7XG4iXX0=
