(function ($) {
  "use strict";
  window.chartsSlide = {};

  chartsSlide.animated = {};

  /**
   * Init
   */
  chartsSlide.init = function () {

    var $wrappers = $('.chart-wrapper-slide');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'chart-wrapper-slide-' + index);
        chartsSlide.animated[$canvas.attr('id')] = true;

        chartsSlide.createWidget(endpoint, $canvas);

      });
    }
  }

  /**
   * Get Json from Endpoint and call createSlideChart function
   * @param url (string)
   * url endpoint
   * @param $canvas
   * slide chart canvas
   */

  chartsSlide.createWidget = function (url, $canvas) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {
        chartsSlide.createSlideChart($canvas, data);
      }
    ).fail(function () {
      console.log('Fail get data')
    })

  }


  /**
   * Generate DOM structure of chart and change style of elements based on Data sorted by value;
   * After change width of items
   * @param $canvas
   * slide chart canvas
   * @param data (JSON)
   * data from endpoint
   */
  chartsSlide.createSlideChart = function ($canvas, data) {


    $canvas.append('<ul class="slide-infographics"></ul>');

    var $ul = $canvas.children('ul');


    var currentData = data.data.datasets[0];


    var max = Math.max.apply(Math, currentData.data);
    var min = Math.min.apply(Math, currentData.data);

    $.each(currentData.data, function (index) {

      var $li = $('<li class="slide-item"></li>');

      var element = '<div class="icon">' + currentData.icons[index] + '</div>';
      element += '<div class="slide-info">' + currentData.info[index] + '</div>';
      element += '<div class="triangle"></div>';
      element += '<div class="number"><div class="number-item">' + chartsSlide._formatNumber(currentData.data[index], index, currentData) + '</div><div class="triangle"></div>';

      $ul.append($li);
      $li.append(element);

      chartsSlide.setUpSlideStyle($li, index, currentData);
    });

    chartsSlide.setUpSlideWidth($ul, currentData, min, max);
  }

  /**
   * Change Style of current element
   * @param $current
   * current element
   * @param index (int)
   * current index of element
   * @param current_data
   * current data from endpoint
   */

  chartsSlide.setUpSlideStyle = function ($current, index, current_data) {

    var backgroundColor = current_data.backgroundColor[index];

    $current.children('.icon').css('background-color', backgroundColor);

    $current.children('.number').css('background-color', backgroundColor);

    $current.children('.slide-info').css('background-color', chartsSlide._LightenDarkenColor(backgroundColor, 20));

    $current.children('.triangle').css('border-left-color', chartsSlide._LightenDarkenColor(backgroundColor, 20));

    $current.children('.number ').children('.triangle').css('border-left-color', backgroundColor);
  }


  /**
   * Change item width based on max and min values
   * @param $ul
   * parent wrapper of elements
   * @param current_data
   * current data from endpoint
   * @param min
   * min value from data
   * @param max
   * max value from data
   */

  chartsSlide.setUpSlideWidth = function ($ul, current_data, min, max) {

    $ul.children('.slide-item').each(function (index) {

      var $this = $(this);

      var $icon = $this.children('.icon');
      var $info = $this.children('.slide-info');
      var $triangle = $this.children('.triangle');
      var $number = $this.children('.number');
      var $numberTriangle = $number.children('.triangle');

      var height = $icon.width();
      var padding = 10;

      $icon.css('height', height);
      $triangle.css({
        'border-top-width': height / 2,
        'border-bottom-width': height / 2,
        'border-left-width': height / 2
      });

      $number.css({
        'height': height - padding,
        'padding-left': (height / 2) + padding,
      });

      $numberTriangle.css({
        'border-top-width': (height - padding) / 2,
        'border-bottom-width': (height - padding) / 2,
        'border-left-width': (height - padding) / 2,
        'right': -(height - padding) / 2
      });

      // ul width - (slide info width - slide info's triangle width) + number's triangle width
      console.log(($numberTriangle.width() / 2));
      var max_width = ($this.width() * 0.45) - ((height - padding) / 2);
      //number min width +  number's triangle width
      var min_width = $this.width() * 0.2;

      if (!chartsSlide._isMobile()) {
        var current_value = '';
        if (current_data.data.length > 1) {
          current_value = chartsSlide._normalizeRange(current_data['data'][index], [max, min], [max_width, min_width]);
        } else {
          current_value = max_width;
        }
        $number.css('width', current_value);

      } else {
        current_value = $ul.width() - (height / 2);
        $info.css('width', current_value);
      }
    })
  }

  /**
   * Scroll Handler
   */

  chartsSlide.handleScroll = function () {
    $(window).scroll(function () {
      var $slide = $('.slide-infographics');
      if ($slide.length > 0) {
        $slide.each(function () {
          var $this = $(this);
          if ($this.visible()) {
            chartsSlide.animateSlide($this);
          }
        })
      }
    })
  }

  /**
   * Animate from 0 to number of current element
   * @param $element
   * current element
   */
  chartsSlide.animateSlide = function ($element) {
    $element.find('.number').each(function () {
      var $this = $(this);
      if (chartsSlide.animated[$element.parent().attr('id')] && !chartsSlide._isMobile()) {
        $this.animate({
          left: $this.parent().width() * 0.55
        }, 1000, 'linear');
      }
    });
    chartsSlide.animated[$element.parent().attr('id')] = false;
  }


  /**
   * Helper functions
   */

  /**
   * Change current color by percentage
   * @param color
   * current color
   * @param percentage
   * + percentage = SCSS lighten(percentage); - percentage = SCSS darken(percentage)
   * @returns {string}
   * modified color
   * @constructor
   */
  chartsSlide._LightenDarkenColor = function (color, percentage) {

    var usePound = false;

    if (color[0] === "#") {
      color = color.slice(1);
      usePound = true;
    }

    var num = parseInt(color, 16);

    var r = (num >> 16) + percentage;

    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    var b = ((num >> 8) & 0x00FF) + percentage;

    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    var g = (num & 0x0000FF) + percentage;

    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);

  }

  /**
   * Normalize value first in range 1 and normalize result in range 2
   * @param value (int)
   * current value
   * @param r1[]
   * first range
   * @param r2[]
   * second range
   * @returns normalized value (int)
   */

  chartsSlide._normalizeRange = function (value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
  }

  /**
   * Check if window width is small than 1024
   * @returns {boolean}
   * @private
   */
  chartsSlide._isMobile = function () {
    return $(window).width() <= 1024
  }


  /**
   * Form number En notation
   * @param string
   * current data
   * @param index
   * current index of data
   * @param data
   * data from JSON
   * @returns {string}
   * @private
   */
  chartsSlide._formatNumber = function (string, index, data) {
    if (chartsSlide._countDecimal(parseFloat(string)) === 0) {
      string = parseFloat(string).toFixed(0)
    }
    var formattedNumber = string.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    if (data.unit_position[index].length > 0 && data.unit_position[index] === "before") {
      return data.unit[index] + ' ' + formattedNumber;
    } else {
      return formattedNumber + ' ' + data.unit[index];
    }
  }

  /**
   * Get number of decimal position of number
   * @param number
   * @returns {number|number}
   * number of decimal position of number
   * @private
   */
  chartsSlide._countDecimal = function (number) {
    if (Math.floor(number) === number) return 0;
    return number.toString().split(".")[1].length || 0;
  }


})(jQuery);


(function ($, Drupal) {

  /**
   * Use this behavior as a template for custom Javascript.
   */
  Drupal.behaviors.slide_chart = {
    attach: function (context, settings) {
      if (context === window.document) {
        chartsSlide.init();
        chartsSlide.handleScroll();
      }
    }
  };

})(jQuery, Drupal);
