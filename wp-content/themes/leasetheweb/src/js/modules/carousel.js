/* eslint-env browser */
'use strict';

import $ from 'jquery';
import 'vendor/jquery.slick.js';

const carousel = function() {
  $('.js-carousel').slick({
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
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 700,
        settings: {
          arrows: false,
          dots: true,
          slidesToShow: 1,
        },
      },
    ],
  });
};

export default carousel;
