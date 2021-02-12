(function ($) {
  "use strict";

  window.chartsCircle = {};

  /**
   * CHARTJS Plugin register
   */

  Chart.pluginService.register({
    beforeDraw: function (chart) {
      var ctx = chart.chart.ctx;

      //check if centered title is options
      if (chart.config.options.elements.center) {
        // Get options from the center object in options
        var centerConfig = chart.config.options.elements.center;
        var fontStyle = centerConfig.fontStyle || 'Arial';
        var txt = centerConfig.text;
        if (chartsCircle._isMobile()) {
          txt = '';
        } else {
          txt = centerConfig.text
        }
        var color = centerConfig.color || '#000';
        var maxFontSize = centerConfig.maxFontSize || 75;
        var sidePadding = centerConfig.sidePadding || 20;
        var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)
        // Start with a base font of 30px
        ctx.font = "30px " + fontStyle;

        // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
        var stringWidth = ctx.measureText(txt).width;
        var elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

        // Find out how much the font can grow in width.
        var widthRatio = elementWidth / stringWidth;
        var newFontSize = Math.floor(30 * widthRatio);
        var elementHeight = (chart.innerRadius * 2);

        // Pick a new font size so it will not be larger than the height of label.
        var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
        var minFontSize = centerConfig.minFontSize;
        var lineHeight = centerConfig.lineHeight || 25;
        var wrapText = false;

        if (minFontSize === undefined) {
          minFontSize = 20;
        }

        if (minFontSize && fontSizeToUse < minFontSize) {
          fontSizeToUse = minFontSize;
          wrapText = true;
        }

        // Set font settings to draw it correctly.
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        var centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
        var centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);
        ctx.font = fontSizeToUse + "px " + fontStyle;
        ctx.fillStyle = color;

        if (!wrapText) {
          ctx.fillText(txt, centerX, centerY);
          return;
        }

        var words = txt.split(' ');
        var line = '';
        var lines = [];

        // Break words up into multiple lines if necessary
        for (var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = ctx.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > elementWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
          } else {
            line = testLine;
          }
        }

        // Move the center up depending on line height and number of lines
        centerY -= (lines.length / 2) * lineHeight;

        for (var n = 0; n < lines.length; n++) {
          ctx.fillText(lines[n], centerX, centerY);
          centerY += lineHeight;
        }
        //Draw text in center
        ctx.fillText(line, centerX, centerY);
      }
    }
  });

  /**
   * Init
   */
  chartsCircle.init = function () {

    var $wrappers = $('.circle-chart-wrapper');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'circle-chart-wrapper-' + index);

        chartsCircle.createWidget(endpoint, $canvas, index);

      });
    }
  }



  /**
   * Get Json from Endpoint ; modify options based on JSON and generate Circle Chart
   * @param url (string)
   * url endpoint
   * @param $canvas
   * bubble chart canvas
   * @param index (int)
   * bubble chart canvas index
   */

  chartsCircle.createWidget = function (url, $canvas, index) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {

        //set custom tooltip with unit
        chartsCircle.setTooltips(data);

        chartsCircle.setCustomLegend(data);

        var chart = new Chart($canvas, data);

        //set custom legend Wrapper
        $canvas.parent().append('<div class="circle-legend" id="circle-legend-' + index + '"></div>')

        var $legend = $('#circle-legend-' + index);

        //CHARTJS generate legend Function
        $legend.html(chart.generateLegend());

      }
    ).fail(function () {
      console.log('Fail get data')
    })
  }

  /**
   * Generate HTML legend
   * @param data (JSON)
   * data from endpoint
   */
  chartsCircle.setCustomLegend = function (data) {
    $.extend(data.options, {
      'legendCallback': function (chart) {
        var text = [];
        var legend_title = "";
        if (chart.data.datasets[0].hasOwnProperty('legend_title')) {
          legend_title = chart.data.datasets[0]['legend_title'];
        }
        text.push('<ul class="' + chart.id + '-legend"><h3 style="color:' + chart.data.datasets[0].backgroundColor[0] + '">'+ legend_title +'</h3>');
        for (var i = 0; i < chart.data.datasets[0].data.length; i++) {
          text.push('<li><span style="background-color:' + chart.data.datasets[0].backgroundColor[i] + '"></span>');
          if (chart.data.labels[i]) {
            text.push('<div class="label-item">' + chart.data.labels[i] + '</div>');
          }
          text.push('</li>');
        }
        text.push('</ul>');
        return text.join("");
      }
    });
  }

  /**
   * Generate custom Tooltip whit Unit
   * @param data (JSON)
   * data from endpoint
   */
  chartsCircle.setTooltips = function (data) {
    data.options.tooltips = {
      callbacks: {
        label: function (tooltipItem, data) {
          var formatted_number = chartsCircle.formatTooltipData(Number(data.datasets[0]['data'][tooltipItem.index]));
          if (data.datasets[0].hasOwnProperty('unit') && data.datasets[0].hasOwnProperty('unit_position')) {
            if (data.datasets[0]['unit_position'] === 'before') {
              return data.datasets[0]['unit'] + ' ' + formatted_number + ' ' + data.labels[tooltipItem.index];
            } else {
              return data.labels[tooltipItem.index] + ' ' + formatted_number + ' ' + data.datasets[0]['unit'];
            }
          }else {
            return formatted_number;
          }
        }
      }
    }
  }

  /**
   * Format the tooltip data value in a more readable way
   * @param value
   * @returns {string}
   */
  chartsCircle.formatTooltipData = function (value) {
    var unit =  chartsCircle._countDecimal(value);
    return value.toFixed(unit).replace(/./g, function(c, i, a) {
      return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
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
  chartsCircle._isMobile = function () {
    return $(window).width() <= 1024
  }

  /**
   * Get number of decimal position of number
   * @param number
   * @returns {number|number}
   * number of decimal position of number
   * @private
   */
  chartsCircle._countDecimal = function (number) {
    if (Math.floor(number) === number) return 0;
    return number.toString().split(".")[1].length || 0;
  }


})(jQuery);


(function ($, Drupal) {

  /**
   * Use this behavior as a template for custom Javascript.
   */
  Drupal.behaviors.charts_circle = {
    attach: function (context, settings) {

      if (context === window.document) {
        chartsCircle.init();
      }
    }
  };

})(jQuery, Drupal);
