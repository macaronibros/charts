(function ($) {
  "use strict";

  window.chartsBubble = {};

  chartsBubble.animated = {};

  /**
   * Init function
   */
  chartsBubble.init = function () {

    var $wrappers = $('.chart-wrapper-bubble');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'chart-wrapper-bubble-' + index);
        chartsBubble.animated[$canvas.attr('id')] = true;

        chartsBubble.createWidget(endpoint, $canvas);

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
  chartsBubble.createWidget = function (url, $canvas) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {
        chartsBubble.createBubbleChart($canvas, data);
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

  chartsBubble.createBubbleChart = function ($canvas, data) {

    $canvas.append('<ul class="bubble-infographics"></ul>');

    var $ul = $canvas.children('ul');

    var currentData = data.data.datasets[0];


    chartsBubble._sortValues(currentData);

    $.each(currentData.data, function (index) {
      var $li = $('<li class="bubble-item"></li>');

      var element = '<div class="bubble"><div class="bubble-text"><div class="bubble-title">' + currentData.labels[index] + '</div>';

      element += '<div class="n-format">' + chartsBubble._nFormatter(currentData.data[index],2) + '</div></div>';

      element += '</div>';

      $ul.append($li);

      $li.append(element);

      chartsBubble.setUpBubbleStyle($li, index, currentData);
    });

    chartsBubble.setUpBubbleWidth($ul, currentData);

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
  chartsBubble.setUpBubbleStyle = function ($current, index, currentData) {
    $current.css('background-color', currentData.backgroundColor[index]);
  }


  /**
   * Calculate width of each bubbles based on data's range
   * @param $ul
   * parent wrapper of elements
   * @param current_data (JSON)
   * current data from endpoint
   */

  chartsBubble.setUpBubbleWidth = function ($ul, currentData) {

    var canvasWidth = $ul.width(),
      numberElements = currentData.data.length,
      $items = $ul.children('li'),
      maxWidth, minWidth;

    if(!chartsBubble._isMobile()) {
      maxWidth = canvasWidth * 0.3;
      minWidth = canvasWidth * 0.17;
    } else {
      maxWidth = canvasWidth * 0.40;
      minWidth = canvasWidth * 0.28;
    }

    //set dimension of first and last items
    $items.first().css({
      width: maxWidth,
      height: maxWidth
    })
    $items.first().children().css({
      width: maxWidth - 30,
      height: maxWidth - 20
    })

    $items.last().css({
      width: minWidth,
      height: minWidth
    })
    $items.last().children().css({
      width: minWidth - 40,
      height: minWidth - 20
    })

    $items.each(function (index) {
      var $this= $(this);

      if (index !== 0 && index !== numberElements - 1) {

        var currentValue = chartsBubble._normalizeRange(currentData.data[index], [currentData.data[numberElements - 1], currentData.data[0]], [minWidth, maxWidth]);
        //check min width
        if (currentValue < minWidth) {
          currentValue = minWidth;
        }
        //set dimension
        $this.css({
          width: currentValue,
          height: currentValue
        })
        $this.children().css({
          width: currentValue - 30,
          height: currentValue - 20
        })
      }
    })

    //set viewport Height
    var viewportHeight;
    if (numberElements < 3) {
      viewportHeight = maxWidth;
      $ul.css('background-image', 'none')
    } else {
      viewportHeight = numberElements * canvasWidth * 0.12;
    }


    $ul.css('height', viewportHeight);
    if(!chartsBubble._isMobile()) {
      chartsBubble.randomPosition($ul, $items);
    }
    chartsBubble.setUpText($items);
  }


  /**
   * Put Bubbles in random position in canvas preventing overlap
   * @param $ul
   * parent wrapper of elements
   * @param $elements
   * all items in list
   */
  chartsBubble.randomPosition = function ($ul, $elements) {

    var filledAreas = [];

    $elements.each(function () {
      var randX = 0;
      var randY = 0;
      var area;
      var $this = $(this);
      //regenerate position of element until it don't overlap others
      do {
        //random position x,y of element
        randX = Math.random() * ($ul.width() -$this.width());
        randY = Math.random() * ($ul.height() - $this.height());
        //set area based on width and height of element
        area = {
          x: randX,
          y: randY,
          width: $this.width(),
          height: $this.height()
        };
      } while (chartsBubble._checkOverlap(area, filledAreas, $this));
      //if element don't overlap other push it in filled areas
      filledAreas.push(area);
      //if element don't overlap other change position
      $(this).css({left: randX, top: randY});
    });
  }


  /**
   * Scale text of item based on final Width
   * @param $elements
   * elements in wrapper
   */
  chartsBubble.setUpText = function ($elements) {
    $elements.each(function () {
      var $this = $(this);
      $this.children().children().children('.bubble-title').css('font-size', $this.width() * 0.1);
      $this.children().children().children('.n-format').css('font-size', $this.width() * 0.2);
    })
  }


  /**
   * Scroll Handler
   */
  chartsBubble.handleScroll = function () {

    $(window).scroll(function () {
      var $bubbles = $('.bubble-infographics');

      if ($bubbles.length > 0) {
        $bubbles.each(function () {
          var $this = $(this);
          if ($this.visible()) {
            chartsBubble.animateNumbers($this);
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
  chartsBubble.animateNumbers = function ($element) {
    $element.find('.number').each(function () {

      var $this = $(this);

      if (chartsBubble.animated[$element.parent().attr('id')]) {

        if ($this.text().split('.').length > 1) {
          var digit = chartsBubble._countDecimal($this.text());
          $this.prop('Counter', 0).animate({
            Counter:$this.text()
          }, {
            duration: 4000,
            easing: 'swing',
            step: function (now) {
              $this.text(now.toFixed(digit).replace(/(\d)(?=(\d{3})+\.)/g, '$1.'));
            }
          });
        } else {
          $this.prop('Counter', 0).animate({
            Counter: $this.text()
          }, {
            duration: 4000,
            easing: 'swing',
            step: function (now) {
              $this.text(Math.ceil(now));
            }
          });
        }
      }
    });
    chartsBubble.animated[$element.parent().attr('id')] = false;
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
   * @param filledAreas
   * area of previous elements
   * @param $element
   * new element
   * @returns {boolean}
   * @private
   */
  chartsBubble._checkOverlap = function (area, filledAreas, $element) {
    for (var i = 0; i < filledAreas.length; i++) {

      var checkArea = filledAreas[i];

      var bottom1 = area.y + area.height;
      var bottom2 = checkArea.y + checkArea.height;
      var top1 = area.y;
      var top2 = checkArea.y;
      var left1 = area.x;
      var left2 = checkArea.x;
      var right1 = area.x + area.width;
      var right2 = checkArea.x + checkArea.width;
      //check if element overlap with filled areas
      if (bottom1 < top2 || top1 > bottom2 || right1 < left2 || left1 > right2) {
        continue;
      }
      //reduce element dimension of 1px to prevent flood
      $element.each(function () {
        var $this= $(this);
        var bubbleH = $this.height();
        var bubbleW = $this.width();
        $(this).css({
          height: (bubbleH - 1),
          width: (bubbleW - 1),
        })
      })
      return true;
    }
    return false;
  }

  /**
   * Sort DESC values of data
   * @param currentData
   * data from endpoint
   */
  chartsBubble._sortValues = function (currentData) {
    var valuesData = currentData.data;
    var valuesLabels = currentData.labels;

    var values = [];
    for (var j = 0; j < valuesData.length; j++)
      values.push({'data': valuesData[j], 'label': valuesLabels[j]});

    values.sort(function (a, b) {
      return b.data - a.data;
    });

    for (var k = 0; k < values.length; k++) {
      valuesData[k] = values[k].data;
      valuesLabels[k] = values[k].label;
    }

    currentData.data = valuesData;
    currentData.labels = valuesLabels;
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

  chartsBubble._normalizeRange = function (value, r1, r2) {
    return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
  }

  /**
   * Get number of decimal position of number
   * @param number
   * @returns {number|number}
   * number of decimal position of number
   * @private
   */
  chartsBubble._countDecimal = function (number) {
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
  chartsBubble._nFormatter = function (number, digits) {

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

  /**
   * Check if window width is small than 1024
   * @returns {boolean}
   * @private
   */
  chartsBubble._isMobile = function () {
    return $(window).width() <= 1024
  }



})(jQuery);


(function ($, Drupal) {

  /**
   * Use this behavior as a template for custom Javascript.
   */
  Drupal.behaviors.bubble_chart = {
    attach: function (context, settings) {

      if (context === window.document) {
        chartsBubble.init();
        chartsBubble.handleScroll();
      }

    }
  };

})(jQuery, Drupal);
