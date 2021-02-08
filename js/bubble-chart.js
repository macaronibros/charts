(function ($) {
  "use strict";
  window.charts_bubble = {};

  charts_bubble.animated = {};

  /**
   * Init function
   */
  charts_bubble.init = function () {

    var $wrappers = $('.chart-wrapper-bubble');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'chart-wrapper-bubble-' + index);
        charts_bubble.animated[$canvas.attr('id')] = true;

        charts_bubble.createWidget(endpoint, $canvas);

      });
    }
  }

  /**
   * Get Json from Endpoint and call createBubbleChart function
   * @param url (string)
   * url endpoint
   * @param $canvas
   * bubble chart canvas
   */
  charts_bubble.createWidget = function (url, $canvas) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {
        charts_bubble.createbubbleChart($canvas, data);
      }
    ).fail(function () {
      console.log('Fail get data')
    })

  }

  /**
   * Generate DOM structure of chart and change style of elements based on Data sorted by value;
   * After change width of items
   * @param $canvas
   * bubble chart canvas
   * @param data (JSON)
   * data from endpoint
   */

  charts_bubble.createbubbleChart = function ($canvas, data) {

    $canvas.append('<ul class="bubble-infographics"></ul>');

    var $ul = $canvas.children('ul');

    var current_data = data.data.datasets[0];


    charts_bubble._sortValues(current_data);

    $.each(current_data.data, function (index) {
      var $li = $('<li class="bubble-item"></li>');

      var element = '<div class="bubble"><div class="bubble-title">' + current_data.labels[index] + '</div>';

      element += '<div class="n-format">' + charts_bubble._nFormatter(current_data.data[index]) + '</div>';

      element += '</div>';

      $ul.append($li);

      $li.append(element);

      charts_bubble.setUpBubbleStyle($li, index, current_data);
    });

    charts_bubble.setUpBubbleWidth($ul, current_data);

  }


  /**
   * Change color of each bubble based on data's style
   * @param current
   * current chart
   * @param index (int)
   * current data index
   * @param current_data (JSON)
   * current data from endpoint
   */
  charts_bubble.setUpBubbleStyle = function ($current, index, current_data) {
    $current.css('background-color', current_data.backgroundColor[index]);
  }


  /**
   * Calculate width of each bubbles based on data's range
   * @param $ul
   * parent wrapper of elements
   * @param current_data (JSON)
   * current data from endpoint
   */

  charts_bubble.setUpBubbleWidth = function ($ul, current_data) {

    var canvas_width = $ul.width(),
      number_elements = current_data.data.length,
      $items = $ul.children('li'),
      max_width = canvas_width * 0.3,
      min_width = canvas_width * 0.17;

    //set dimension of first and last items
    $items.first().css({
      width: max_width,
      height: max_width
    })
    $items.last().css({
      width: min_width,
      height: min_width
    })

    $items.each(function (index) {

      if (index !== 0 && index !== number_elements - 1) {
        var current_value = charts_bubble._normalizeRange(current_data.data[index].data, [current_data.data[number_elements - 1].data, current_data.data[0].data], [min_width, max_width]);
        //check min width
        if (current_value < min_width) {
          current_value = min_width;
        }
        //set dimension
        $(this).css({
          width: current_value,
          height: current_value
        })
      }
    })

    //set viewport_width
    var viewport_width;
    if (number_elements < 3) {
      viewport_width = max_width;
      $ul.css('background-image', 'none')
    } else {
      viewport_width = number_elements * canvas_width * 0.12;
    }


    $ul.css('height', viewport_width);
    charts_bubble.randomPosition($ul, $items);
    charts_bubble.setUpText($items);
  }


  /**
   * Put Bubbles in random position in canvas preventing overlap
   * @param $ul
   * parent wrapper of elements
   * @param $elements
   * all items in list
   */
  charts_bubble.randomPosition = function ($ul, $elements) {

    var filled_areas = [];

    $elements.each(function () {
      var rand_x = 0;
      var rand_y = 0;
      var area;
      //regenerate position of element until it don't overlap others
      do {
        //random position x,y of element
        rand_x = Math.random() * ($ul.width() - $(this).width());
        rand_y = Math.random() * ($ul.height() - $(this).height());
        //set area based on width and height of element
        area = {
          x: rand_x,
          y: rand_y,
          width: $(this).width(),
          height: $(this).height()
        };
      } while (charts_bubble._check_overlap(area, filled_areas, $(this)));
      //if element don't overlap other push it in filled areas
      filled_areas.push(area);
      //if element don't overlap other change position
      $(this).css({left: rand_x, top: rand_y});
    });
  }


  /**
   * Scale text of item based on final Width
   * @param $elements
   * elements in wrapper
   */
  charts_bubble.setUpText = function ($elements) {
    $elements.each(function () {
      $(this).children().children('.bubble-title').css('font-size', $(this).width() * 0.1);
      $(this).children().children('.n-format').css('font-size', $(this).width() * 0.2)
    })
  }


  /**
   * Scroll Handler
   */
  charts_bubble.handleScroll = function () {

    $(window).scroll(function () {

      if ($('.bubble-infographics').length > 0) {
        $('.bubble-infographics').each(function () {
          if ($(this).visible()) {
            charts_bubble.animateNumbers($(this));
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
  charts_bubble.animateNumbers = function ($element) {
    $element.find('.number').each(function () {

      if (charts_bubble.animated[$element.parent().attr('id')]) {

        if ($(this).text().split('.').length > 1) {
          var digit = charts_bubble._countDecimal($(this).text());
          $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
          }, {
            duration: 4000,
            easing: 'swing',
            step: function (now) {
              $(this).text(now.toFixed(digit).replace(/(\d)(?=(\d{3})+\.)/g, '$1.'));
            }
          });
        } else {
          $(this).prop('Counter', 0).animate({
            Counter: $(this).text()
          }, {
            duration: 4000,
            easing: 'swing',
            step: function (now) {
              $(this).text(Math.ceil(now));
            }
          });
        }
      }
    });
    charts_bubble.animated[$element.parent().attr('id')] = false;
  }


  /**
   *
   * Support functions
   *
   */

  /**
   * Check overlap between elements in area and new element
   * @param area
   * area of new element
   * @param filled_areas
   * area of previous elements
   * @param $element
   * new element
   * @returns {boolean}
   * @private
   */
  charts_bubble._check_overlap = function (area, filled_areas, $element) {
    for (var i = 0; i < filled_areas.length; i++) {

      var check_area = filled_areas[i];

      var bottom1 = area.y + area.height;
      var bottom2 = check_area.y + check_area.height;
      var top1 = area.y;
      var top2 = check_area.y;
      var left1 = area.x;
      var left2 = check_area.x;
      var right1 = area.x + area.width;
      var right2 = check_area.x + check_area.width;
      //check if element overlap with filled areas
      if (bottom1 < top2 || top1 > bottom2 || right1 < left2 || left1 > right2) {
        continue;
      }
      //reduce element dimension of 1px to prevent flood
      $element.each(function () {
        var bubble_h = $(this).height();
        var bubble_w = $(this).width();
        $(this).css({
          height: (bubble_h - 1),
          width: (bubble_w - 1),
        })
      })
      return true;
    }
    return false;
  }

  /**
   * Sort DESC values of data
   * @param current_data
   * data from endpoint
   */
  charts_bubble._sortValues = function (current_data) {
    var values_data = current_data.data;
    var values_labels = current_data.labels;

    var values = [];
    for (var j = 0; j < values_data.length; j++)
      values.push({'data': values_data[j], 'label': values_labels[j]});

    values.sort(function (a, b) {
      return b.data - a.data;
    });

    for (var k = 0; k < values.length; k++) {
      values_data[k] = values[k].data;
      values_labels[k] = values[k].label;
    }

    current_data.data = values_data;
    current_data.labels = values_labels;
  }

  /**
   * Normalize value first in range 1 and normalize result in range 2
   *
   * @param value (int)
   * current value
   * @param r1[]
   * first range
   * @param r2[]
   * second range
   * @returns normalized value (int)
   */

  charts_bubble._normalizeRange = function (value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
  }

  /**
   * Get number of decimal position of number
   * @param number
   * @returns {number|number}
   * number of decimal position of number
   * @private
   */
  charts_bubble._countDecimal = function (number) {
    if(Math.floor(number) === number) return 0;
    return number.toString().split(".")[1].length || 0;
  }

  /**
   * @param number
   * Current number
   * @param digits
   * Number of digits after ,
   * @returns {string}
   * Formatted number
   * @private
   */
  charts_bubble._nFormatter = function (number,digits= 2) {

    var value = [
      { value: 1, symbol: "" },
      { value: 1E3, symbol: "K" },
      { value: 1E6, symbol: "M" },
      { value: 1E9, symbol: "G" },
      { value: 1E12, symbol: "T" },
      { value: 1E15, symbol: "P" },
      { value: 1E18, symbol: "E" }
    ];
    var regExp = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i = value.length - 1;
    for (i ; i > 0; i--) {
      if (number >= value[i].value) {
        break;
      }
    }
    return '<div class="number">'+(number / value[i].value).toFixed(digits).replace(regExp, "$1")+ '</div>' + value[i].symbol;
  }


})(jQuery);


(function ($, Drupal) {

  /**
   * Use this behavior as a template for custom Javascript.
   */
  Drupal.behaviors.bubble_chart = {
    attach: function (context, settings) {

      if (context === window.document) {
        charts_bubble.init();
        charts_bubble.handleScroll();
      }

    }
  };

})(jQuery, Drupal);
