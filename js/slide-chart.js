(function ($) {
  "use strict";
  window.charts_slide = {};

  charts_slide.animated = {};

  /**
   * Init
   */
  charts_slide.init = function () {

    var $wrappers = $('.chart-wrapper-slide');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'chart-wrapper-slide-' + index);
        charts_slide.animated[$canvas.attr('id')] = true;

        charts_slide.createWidget(endpoint, $canvas);

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

  charts_slide.createWidget = function (url, $canvas) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {
        charts_slide.createSlideChart($canvas, data);
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
  charts_slide.createSlideChart = function ($canvas, data) {


    $canvas.append('<ul class="slide-infographics"></ul>');

    var $ul = $canvas.children('ul');


    var current_data = data.data.datasets[0];


    var max = Math.max.apply(Math, current_data.data);
    var min = Math.min.apply(Math, current_data.data);

    $.each(current_data.data, function (index) {

      var $li = $('<li class="slide-item"></li>');

      var element = '<div class="icon">' + current_data.icons[index] + '</div>';
      element += '<div class="slide-info">' + current_data.info[index] + '<div class="triangle-right"></div></div>'
      element += '<div class="number"><div class="number-item">' + charts_slide._formatNumber(current_data.data[index], index, current_data) + '</div><div class="triangle-right"></div>';

      $ul.append($li);
      $li.append(element);

      charts_slide.setUpSlideStyle($li, index, current_data);
    });

    charts_slide.setUpSlideWidth($ul, current_data, min, max);
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

  charts_slide.setUpSlideStyle = function ($current, index, current_data) {

    var backgroundColor = current_data.backgroundColor[index];

    $current.children('.icon').css('background-color', backgroundColor);

    $current.children('.number').css('background-color', backgroundColor);

    $current.children('.slide-info').css('background-color', charts_slide._LightenDarkenColor(backgroundColor, 20));

    $current.children('.slide-info ').children('.triangle-right').css('border-left-color', charts_slide._LightenDarkenColor(backgroundColor, 20));

    $current.children('.number ').children('.triangle-right').css('border-left-color', backgroundColor);
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

  charts_slide.setUpSlideWidth = function ($ul, current_data, min, max) {

    $ul.children('.slide-item').each(function (index) {

      $(this).children('.slide-info').css('width', $ul.width() * 0.5);

      var triangle_width = $(this).children('.number').innerHeight() / 2;
      // ul width - (slide info width - slide info's triangle width) + number's triangle width
      var max_width = ($ul.width() - $(this).children('.icon').width() - $(this).children('.slide-info').outerWidth() - triangle_width) + $(this).children('.slide-info').innerHeight() / 2;
      //number min width +  number's triangle width
      var min_width = parseInt($(this).children('.number').children().css('width'), 10) + $(this).children('.slide-info').innerHeight() / 2 + triangle_width;

      if (!charts_slide._isMobile()) {
        if (current_data.data.length > 1) {
          var current_value = charts_slide._normalizeRange(current_data['data'][index], [max, min], [max_width, min_width]);
        } else {
          current_value = max_width;
        }
        $(this).children('.number').css('width', current_value);

      } else {
        current_value = $ul.width() - $(this).children('.icon').width() + triangle_width;
        $(this).children('.slide-info').css('width', current_value);
      }
    })
  }

  /**
   * Scroll Handler
   */

  charts_slide.handleScroll = function () {
    $(window).scroll(function () {
      if ($('.slide-infographics').length > 0) {
        $('.slide-infographics').each(function () {
          if ($(this).visible()) {
            charts_slide.animateSlide($(this));
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
  charts_slide.animateSlide = function ($element) {
    $element.find('.number').each(function () {
      if (charts_slide.animated[$element.parent().attr('id')] && !charts_slide._isMobile()) {
        $(this).animate({
          left: $(this).siblings('.slide-info').outerWidth() + parseInt($(this).css('left'), 10)
        }, 1000, 'linear');
      }
    });
    charts_slide.animated[$element.parent().attr('id')] = false;
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
  charts_slide._LightenDarkenColor = function (color, percentage) {

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

  charts_slide._normalizeRange = function (value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
  }

  /**
   * Check if window width is small than 1024
   * @returns {boolean}
   * @private
   */
  charts_slide._isMobile = function () {
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
  charts_slide._formatNumber = function (string, index, data) {
    if (charts_slide._countDecimal(parseFloat(string)) === 0) {
      string = parseFloat(string).toFixed(0)
    }
    var formatted_number = string.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
    if (data.unit_position[index].length > 0 && data.unit_position[index] === "before") {
      return data.unit[index] + ' ' + formatted_number;
    } else {
      return formatted_number + ' ' + data.unit[index];
    }
  }

  /**
   * Get number of decimal position of number
   * @param number
   * @returns {number|number}
   * number of decimal position of number
   * @private
   */
  charts_slide._countDecimal = function (number) {
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
        charts_slide.init();
        charts_slide.handleScroll();
      }
    }
  };

})(jQuery, Drupal);
