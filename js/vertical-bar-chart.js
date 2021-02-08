(function ($) {
  "use strict";

  window.charts_vertical_bar = {};

  /**
   * CHARTJS Draw
   */

  /*Chart.elements.Rectangle.prototype.draw = function () {

    var ctx = this._chart.ctx;
    var vm = this._view;
    var left, right, top, bottom, signX, signY, borderSkipped;
    var borderWidth = vm.borderWidth;
    // Set Radius Here
    // If radius is large enough to cause drawing errors a max radius is imposed
    var cornerRadius = 15;

    if (!vm.horizontal) {
      // bar
      left = vm.x - vm.width / 2;
      right = vm.x + vm.width / 2;
      top = vm.y;
      bottom = vm.base;
      signX = 1;
      signY = bottom > top ? 1 : -1;
      borderSkipped = vm.borderSkipped || 'bottom';
    } else {
      // horizontal bar
      left = vm.base;
      right = vm.x;
      top = vm.y - vm.height / 2;
      bottom = vm.y + vm.height / 2;
      signX = right > left ? 1 : -1;
      signY = 1;
      borderSkipped = vm.borderSkipped || 'left';
    }

    // Canvas doesn't allow us to stroke inside the width so we can
    // adjust the sizes to fit if we're setting a stroke on the line
    if (borderWidth) {
      // borderWidth shold be less than bar width and bar height.
      var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
      borderWidth = borderWidth > barSize ? barSize : borderWidth;
      var halfStroke = borderWidth / 2;
      // Adjust borderWidth when bar top position is near vm.base(zero).
      var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
      var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
      var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
      var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
      // not become a vertical line?
      if (borderLeft !== borderRight) {
        top = borderTop;
        bottom = borderBottom;
      }
      // not become a horizontal line?
      if (borderTop !== borderBottom) {
        left = borderLeft;
        right = borderRight;
      }
    }

    ctx.beginPath();
    ctx.fillStyle = vm.backgroundColor;
    ctx.strokeStyle = vm.borderColor;
    ctx.lineWidth = borderWidth;

    // Corner points, from bottom-left to bottom-right clockwise
    // | 1 2 |
    // | 0 3 |
    var corners = [
      [left, bottom],
      [left, top],
      [right, top],
      [right, bottom]
    ];

    // Find first (starting) corner with fallback to 'bottom'
    var borders = ['bottom', 'left', 'top', 'right'];
    var startCorner = borders.indexOf(borderSkipped, 0);
    if (startCorner === -1) {
      startCorner = 0;
    }

    function cornerAt(index) {
      return corners[(startCorner + index) % 4];
    }

    // Draw rectangle from 'startCorner'
    var corner = cornerAt(0);
    ctx.moveTo(corner[0], corner[1]);

    for (var i = 1; i < 4; i++) {
      corner = cornerAt(i);
      var nextCornerId = i + 1;
      if (nextCornerId == 4) {
        nextCornerId = 0
      }

      var width = corners[2][0] - corners[1][0];
      var height = corners[0][1] - corners[1][1];
      var x = corners[1][0];
      var y = corners[1][1];

      var radius = cornerRadius;

      // Fix radius being too large
      if (radius > height / 2) {
        radius = height / 2;
      }
      if (radius > width / 2) {
        radius = width / 2;
      }

      var lastVisible = 0;
      for (var findLast = 0, findLastTo = this._chart.data.datasets.length; findLast < findLastTo; findLast++) {
        if (!this._chart.getDatasetMeta(findLast).hidden) {
          lastVisible = findLast;
        } else {
          return;
        }
      }

      var rounded = this._datasetIndex === lastVisible;

      if (rounded) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y);
      }

    }

    ctx.fill();
    if (borderWidth) {
      ctx.stroke();
    }
  };*/


  /**
   * Init
   */
  charts_bar.init = function () {

    var $wrappers = $('.chart-wrapper-vertical-bar');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'chart-wrapper-vertical-bar-' + index);


        charts_bar.createWidget(endpoint, $canvas, index);

      });
    }
  }

  /**
   * Get Json from Endpoint ; modify options based on JSON and generate Vertical Chart
   * @param url (string)
   * url endpoint
   * @param $canvas
   * vertical chart canvas
   * @param index (int)
   * vertical chart canvas index
   */

  charts_bar.createWidget = function (url, $canvas, index) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {

        //set custom tooltip with unit
        if (data.data.hasOwnProperty('unit')) {
          charts_bar.setUnit(data);
        }

        charts_bar.setCustomLegend(data);

        var chart = new Chart($canvas, data);

        //set custom legend Wrapper
        $canvas.parent().append('<div class="vertical-bar-legend" id="vertical-bar-legend-' + index + '"></div>')

        var legend = $('#vertical-bar-legend-' + index);

        //CHARTJS generate legend Function
        legend.html(chart.generateLegend());

      }
    ).fail(function () {
      console.log('Fail get data')
    })
  }

  /**
   * Generate custom Tooltip whit Unit
   * @param data (JSON)
   * data from endpoint
   */
  charts_bar.setUnit = function (data) {
    data.options.tooltips = {
      callbacks: {
        label: function (tooltipItem, data) {
          if (data.hasOwnProperty('unit_position')) {
            if (data['unit_position'] === 'before') {
              return ' ' + data.unit + ' ' + Number(data.datasets[tooltipItem.datasetIndex]['data'][tooltipItem.index]) + ' ' + data.datasets[tooltipItem.datasetIndex].label;
            } else {
              return ' ' + Number(data.datasets[tooltipItem.datasetIndex]['data'][tooltipItem.index]) + ' ' + data.unit + ' ' + data.datasets[tooltipItem.datasetIndex].label;
            }
          }
        }
      }
    }
  }

  /**
   * Generate HTML legend
   * @param data (JSON)
   * data from endpoint
   */
  charts_bar.setCustomLegend = function (data) {
    Object.assign(data.options, {
      'legendCallback': function (chart) {
        var text = [];
        text.push('<ul class="' + chart.id + '-legend">');
        for (var i = 0; i < chart.data.datasets.length; i++) {
          text.push('<li><span style="background-color:' + chart.data.datasets[i].backgroundColor + '"></span>');
          if (chart.data.datasets[i].label) {
            text.push('<div class="label-item">' + chart.data.datasets[i].label + '</div>');
          }
          text.push('</li>');
        }
        text.push('</ul>');
        return text.join("");
      }
    });
  }


  /**
   * Helper functions
   */

  /**
   * Check if window width is small than 1024
   * @returns {boolean}
   * @private
   */
  charts_bar._isMobile = function () {
    return $(window).width() <= 1024
  }

})(jQuery);


(function ($, Drupal) {

  /**
   * Use this behavior as a template for custom Javascript.
   */
  Drupal.behaviors.vertical_bar_charts = {
    attach: function (context, settings) {

      if (context === window.document) {
        charts_bar.init();
      }
    }
  };

})(jQuery, Drupal);
