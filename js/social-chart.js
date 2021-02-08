(function ($) {
  "use strict";
  window.charts_social = {};

  charts_social.animated = {};

  /**
   * Init
   */
  charts_social.init = function () {

    var $wrappers = $('.chart-wrapper-social');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'chart-wrapper-social-' + index);
        charts_social.animated[$canvas.attr('id')] = true;

        charts_social.createWidget(endpoint, $canvas);

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

  charts_social.createWidget = function (url, $canvas) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {
        charts_social.createSocialChart($canvas, data);
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
  charts_social.createSocialChart = function ($canvas, data) {

    $canvas.append('<ul class="social-infographics"></ul>');

    var $ul = $canvas.children('ul');

    var current_data = data.data.datasets[0];

    //generate social widget structure
    $.each(current_data.data, function (index) {
      var $li = $('<li style="color:' + current_data.backgroundColor[0] + '" data-hover="' + current_data.backgroundColor[1] + '" data-color="' + current_data.backgroundColor[0] + '"></li>');

      var element = '<div class="social" style="border-color:' + current_data.borderColor[0] + '"><div class="icon" style="fill:' + current_data.borderColor[0] + '">' + current_data.icons[index] + '</div>' +
        '<span class="arrow-down" style="border-top-color:' + current_data.borderColor[0] + '"></span></div>';

      element += '<div class="n-format">' + charts_social._nFormatter(current_data.data[index]) + '</div>';

      element += '<h6>' + data.data.labels[index] + '</h6>';


      $ul.append($li);
      $li.append(element);

      $li.hover(charts_social.onHoverIn, charts_social.onHoverOut);

      //setup style based on data
      charts_social.setUpSocialStyle($ul, current_data, $li, index);
    });
  }

  /**
   * Hover in
   * @param event
   */
  charts_social.onHoverIn = function (event) {

    var $this = $(this);

    var color = $this.data('hover');

    var $social_item = $this.children('.social');
    var $arrow_down = $social_item.children('.arrow-down');

    $this.css({
      'color': color
    });

    $social_item.css({
      'border-color': color,
      'color': color
    });
    $social_item.children('.icon').children('svg').css('fill', color);
    $arrow_down.css('border-top-color', color);

  };

  /**
   * Hover out
   * @param event
   */
  charts_social.onHoverOut = function (event) {

    var $this = $(this);

    var color = $this.data('color');

    var $social_item = $this.children('.social');
    var $arrow_down = $social_item.children('.arrow-down');

    $this.css({
      'border-color': color,
      'color': color
    });

    $social_item.css({
      'border-color': color,
      'color': color
    });
    $social_item.children('.icon').children('svg').css('fill', color)
    $arrow_down.css('border-top-color', color)

  };

  /**
   * Change Style of current element
   * @param $current
   * current element
   * @param index (int)
   * current index of element
   * @param current_data
   * current data from endpoint
   */
  charts_social.setUpSocialStyle = function ($ul, current_data, $current, index) {
    var width, height, font_icon, font_label, border_width;

    // Calculate social chart elements value based on number of items
    if (current_data.data.length > 6 && !charts_social._isMobile()) {
      width = ($ul.width() / current_data.data.length) - 20;
      height = width;
      font_icon = (width * 50) / 100;
      font_label = (width * 16) / 100;
      border_width = (width * 12) / 100
    } else if (charts_social._isMobile()) {
      width = 60;
      height = 60;
      font_icon = 30;
      font_label = 16;
      border_width = 6;
    } else {
      width = 100;
      height = 100;
      font_icon = 50;
      font_label = 16;
      border_width = 12;
    }

    var $social_item = $current.children('.social');
    var $arrow_down = $social_item.children('.arrow-down');

    var borderWidth = current_data.borderWidth;


    //change style of social item
    $social_item.css({
      'border-width': borderWidth,
      'width': width,
      'height': height,
      'font-size': font_icon,
    });

    //change style of icon
    $social_item.children('.icon').children().css({
      'width': font_icon,
      'height': font_icon,
    });

    //change style of label
    $current.children('h6').css('font-size', font_label);

    //change style of triangle; divided in two to allow the calculation of triangle's border width
    $arrow_down.css('border-width', border_width);

    $arrow_down.css({
      'bottom': -(borderWidth + parseInt($arrow_down.css('border-top').split(' ')[0].replace(/[^0-9.]/g, "")) - 1)
    });
  }

  /**
   * Scroll Handler
   */
  charts_social.handleScroll = function () {

    $(window).scroll(function () {
      if ($('.social-infographics').length > 0) {
        $('.social-infographics').each(function () {
          if ($(this).visible()) {
            charts_social.animateNumbers($(this));
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
  charts_social.animateNumbers = function ($element) {
    $element.find('.number').each(function () {

      //check if element's animation was already done
      if (charts_social.animated[$element.parent().attr('id')]) {
        if ($(this).text().split('.').length > 1) {
          var digit = charts_social._countDecimal($(this).text());
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
    charts_social.animated[$element.parent().attr('id')] = false;
  }


  /**
   * Helper functions
   */

  /**
   * Check if window width is small than 1024
   * @returns {boolean}
   * @private
   */

  charts_social._isMobile = function () {
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
  charts_social._nFormatter = function (number, digits = 2) {
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
  charts_social._countDecimal = function (number) {
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
        charts_social.init();
        charts_social.handleScroll();
      }

    }
  };

})(jQuery, Drupal);
