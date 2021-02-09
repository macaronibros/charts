(function ($) {
  "use strict";
  window.chartsSocial = {};

  chartsSocial.animated = {};

  /**
   * Init
   */
  chartsSocial.init = function () {

    var $wrappers = $('.chart-wrapper-social');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'chart-wrapper-social-' + index);
        chartsSocial.animated[$canvas.attr('id')] = true;

        chartsSocial.createWidget(endpoint, $canvas);

      });
    }
  }

  /**
   * Get Json from Endpoint and call createSocialChart function
   * @param url (string)
   * url endpoint
   * @param $canvas
   * social chart canvas
   */

  chartsSocial.createWidget = function (url, $canvas) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {
        chartsSocial.createSocialChart($canvas, data);
      }
    ).fail(function () {
      console.log('Fail get data')
    })

  }

  /**
   * Generate DOM structure of chart and change style of elements based on Data sorted by value;
   * @param $canvas
   * slide chart canvas
   * @param data (JSON)
   * data from endpoint
   */
  chartsSocial.createSocialChart = function ($canvas, data) {

    $canvas.append('<ul class="social-infographics"></ul>');

    var $ul = $canvas.children('ul');

    var currentData = data.data.datasets[0];

    //generate social widget structure
    $.each(currentData.data, function (index) {
      var $li = $('<li style="color:' + currentData.backgroundColor[0] + '" data-hover="' + currentData.backgroundColor[1] + '" data-color="' + currentData.backgroundColor[0] + '"></li>');

      var element = '<div class="social" style="border-color:' + currentData.borderColor[0] + '"><div class="icon" style="fill:' + currentData.borderColor[0] + '">' + currentData.icons[index] + '</div>' +
        '<span class="arrow-down" style="border-top-color:' + currentData.borderColor[0] + '"></span></div>';

      element += '<div class="n-format">' + chartsSocial._nFormatter(currentData.data[index]) + '</div>';

      element += '<h6>' + data.data.labels[index] + '</h6>';


      $ul.append($li);
      $li.append(element);

      $li.hover(chartsSocial.onHoverIn, chartsSocial.onHoverOut);

      //setup style based on data
      chartsSocial.setUpSocialStyle($ul, currentData, $li, index);
    });
  }

  /**
   * Hover in
   * @param event
   */
  chartsSocial.onHoverIn = function (event) {

    var $this = $(this);

    var color = $this.data('hover');

    var $socialItem = $this.children('.social');
    var $arrowDown = $socialItem.children('.arrow-down');

    $this.css({
      'color': color
    });

    $socialItem.css({
      'border-color': color,
      'color': color
    });
    $socialItem.children('.icon').children('svg').css('fill', color);
    $arrowDown.css('border-top-color', color);

  };

  /**
   * Hover out
   * @param event
   */
  chartsSocial.onHoverOut = function (event) {

    var $this = $(this);

    var color = $this.data('color');

    var $socialItem = $this.children('.social');
    var $arrowDown = $socialItem.children('.arrow-down');

    $this.css({
      'border-color': color,
      'color': color
    });

    $socialItem.css({
      'border-color': color,
      'color': color
    });
    $socialItem.children('.icon').children('svg').css('fill', color)
    $arrowDown.css('border-top-color', color)

  };

  /**
   * Change Style of current element
   * @param $current
   * current element
   * @param index (int)
   * current index of element
   * @param currentData
   * current data from endpoint
   */
  chartsSocial.setUpSocialStyle = function ($ul, currentData, $current) {
    var width, height, fontIcon, fontLabel, borderWidth;

    // Calculate social chart elements value based on number of items
    if (currentData.data.length > 6 && !chartsSocial._isMobile()) {
      width = ($ul.width() / currentData.data.length) - 20;
      height = width;
      fontIcon = (width * 50) / 100;
      fontLabel = (width * 16) / 100;
    } else if (chartsSocial._isMobile()) {
      width = 60;
      height = 60;
      fontIcon = 30;
      fontLabel = 16;
    } else {
      width = 100;
      height = 100;
      fontIcon = 50;
      fontLabel = 16;
    }

    var $social_item = $current.children('.social');
    var $arrow_down = $social_item.children('.arrow-down');

    var borderWidth = currentData.borderWidth;


    //change style of social item
    $social_item.css({
      'border-width': borderWidth,
      'width': width,
      'height': height,
      'font-size': fontIcon,
    });

    //change style of icon
    $social_item.children('.icon').children().css({
      'width': fontIcon,
      'height': fontIcon,
    });

    //change style of label
    $current.children('h6').css('font-size', fontLabel);

    //change style of triangle; divided in two to allow the calculation of triangle's border width
    $arrow_down.css('border-width', borderWidth*4);

    $arrow_down.css({
      'bottom': -(borderWidth*4)
    });
  }

  /**
   * Scroll Handler
   */
  chartsSocial.handleScroll = function () {

    $(window).scroll(function () {
      var $infographics = $('.social-infographics');
      if ($infographics.length > 0) {
        $infographics.each(function () {
          var $this= $(this);
          if ($this.visible()) {
            chartsSocial.animateNumbers($this);
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
  chartsSocial.animateNumbers = function ($element) {
    $element.find('.number').each(function () {
      var $this= $(this);
      //check if element's animation was already done
      if (chartsSocial.animated[$element.parent().attr('id')]) {
        if ($this.text().split('.').length > 1) {
          var digit = chartsSocial._countDecimal($this.text());
          $this.prop('Counter', 0).animate({
            Counter: $this.text()
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
    chartsSocial.animated[$element.parent().attr('id')] = false;
  }


  /**
   * Helper functions
   */

  /**
   * Check if window width is small than 1024
   * @returns {boolean}
   * @private
   */

  chartsSocial._isMobile = function () {
    return $(window).width() <= 1024
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
  chartsSocial._nFormatter = function (number, digits = 2) {
    var value = [
      {value: 1, symbol: ""},
      {value: 1E3, symbol: "K"},
      {value: 1E6, symbol: "M"},
      {value: 1E9, symbol: "G"},
      {value: 1E12, symbol: "T"},
      {value: 1E15, symbol: "P"},
      {value: 1E18, symbol: "E"}
    ];
    var regExp = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var i = value.length - 1;
    for (i; i > 0; i--) {
      if (number >= value[i].value) {
        break;
      }
    }
    return '<div class="number">' + (number / value[i].value).toFixed(digits).replace(regExp, "$1") + '</div>' + value[i].symbol;
  }


  /**
   * Get number of decimal position of number
   * @param number
   * @returns {number|number}
   * number of decimal position of number
   * @private
   */
  chartsSocial._countDecimal = function (number) {
    if (Math.floor(number) === number) return 0;
    return number.toString().split(".")[1].length || 0;
  }


})(jQuery);


(function ($, Drupal) {

  /**
   * Use this behavior as a template for custom Javascript.
   */
  Drupal.behaviors.social_chart = {
    attach: function (context, settings) {

      if (context === window.document) {
        chartsSocial.init();
        chartsSocial.handleScroll();
      }

    }
  };

})(jQuery, Drupal);
