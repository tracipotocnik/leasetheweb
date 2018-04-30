/* eslint-env browser */
'use strict';

import $ from 'jquery';
import 'vendor/jquery.slick.js';

const carousel = function() {
  $('.js-carousel').slick({
    slidesToShow: 2,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    focusOnSelect: false,
    infinite: true,
    responsive: [
      {
        breakpoint: 800,
        settings: {
          arrows: false,
          slidesToShow: 1,
        },
      },
    ],
  });
};

export default carousel;
