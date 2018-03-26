/* eslint-env browser */
'use strict';

import $ from 'jquery';

const accordion = function() {
  const $toggleButton = $('[data-accordion-toggle]');

  /**
   * Removes accordion container height declaration
   */
  function prepToggleContainer() {
    $toggleButton.each(function(e) {
      const $this = $(this); // eslint-disable-line no-invalid-this
      const $toggleContent = $this.closest('.accordion-list__item')
        .find($toggleButton.data('accordion-toggle'));
      const isHidden = $toggleContent.attr('aria-hidden') === 'false'
        ? false : true;
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
    const toggleSection = function(e) {
      const $this = $(e.currentTarget);
      console.log($this); // eslint-disable-line no-console
      $this.toggleClass('accordion-active');
      const $currentToggleContainer = $this.closest('.accordion-list__item')
        .find($this.data('accordion-toggle'));
      const isHidden = $currentToggleContainer
        .attr('aria-hidden') === 'false' ? false : true;
      $currentToggleContainer.attr('aria-hidden', !isHidden);
    };

    $toggleButton.on('click', toggleSection);
  }

  $(document).ready(function() {
    prepToggleContainer();
    toggle();
  });

  $(window).on('resize', function() {
    prepToggleContainer();
  });
};

export default accordion;
