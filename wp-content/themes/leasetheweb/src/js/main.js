/* eslint-env browser */
'use strict';

// Foundation Core
import 'foundation-sites/js/foundation.core.js';
// Foundation Utilities
import 'foundation-sites/js/foundation.util.box.js';
import 'foundation-sites/js/foundation.util.keyboard.js';
import 'foundation-sites/js/foundation.util.mediaQuery.js';
import 'foundation-sites/js/foundation.util.motion.js';
import 'foundation-sites/js/foundation.util.nest.js';
import 'foundation-sites/js/foundation.util.timerAndImageLoader.js';
import 'foundation-sites/js/foundation.util.touch.js';
import 'foundation-sites/js/foundation.util.triggers.js';
// Foundation Plugins. Add or remove as needed for your site
import 'foundation-sites/js/foundation.drilldown.js';
import 'foundation-sites/js/foundation.dropdownMenu.js';
import 'foundation-sites/js/foundation.responsiveMenu.js';
import 'foundation-sites/js/foundation.offcanvas.js';

import cssVars from 'css-vars-ponyfill';

import jquery from 'jquery';
import socialShare from 'modules/socialShare.js';
import carousel from 'modules/carousel.js';
import accordion from 'modules/accordion.js';

cssVars({
  onComplete: function() {
    jquery('#css-vars-ponyfill').appendTo('head');
  },
});

(function($) {
  // Initialize Foundation
  $(document).foundation();

  // Initialize social share functionality
  // Replace the empty string parameter with your Facebook ID
  socialShare('');

  // Initialize carousels
  carousel();

  // Initialize accordions
  accordion();

  // Initialize Plugins
  $('.magnific-trigger').magnificPopup({
    type: 'inline',
  });

  $('.meerkat-cta').meerkat({
    background: 'rgb(21, 76, 102) repeat-x left top',
    height: '120px',
    width: '100%',
    position: 'bottom',
    close: '.close-meerkat',
    dontShowAgain: '.dont-show',
    animationIn: 'fade',
    animationSpeed: 500,
    opacity: 0.9,
  });
})(jquery);
