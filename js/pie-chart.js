(function ($) {
  "use strict";

  window.charts_pie = {};

  charts_pie.animated = {};

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
        if (charts_pie._isMobile()) {
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
  charts_pie.init = function () {

    var $wrappers = $('.chart-wrapper-pie');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'chart-wrapper-pie-' + index);

        charts_pie.animated[$canvas.attr('id')] = true;

        charts_pie.handleScroll(endpoint, $canvas, index);

      });
    }
  }

  /**
   * Scroll Handler
   */
  charts_pie.handleScroll = function (url, $canvas, index) {
    
    $(window).scroll(function () {
      if ($('.chart-wrapper-pie').length > 0) {
        $('.chart-wrapper-pie').each(function () {
          if ($(this).visible() && charts_pie.animated[$canvas.attr('id')]) {
            charts_pie.createWidget(url, $canvas, index);
          }
        })
      }
    })
  }



  /**
   * Get Json from Endpoint ; modify options based on JSON and generate Pie Chart
   * @param url (string)
   * url endpoint
   * @param $canvas
   * bubble chart canvas
   * @param index (int)
   * bubble chart canvas index
   */

  charts_pie.createWidget = function (url, $canvas, index) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {

        //set custom tooltip with unit
        if (data.data.datasets[0].hasOwnProperty('unit')) {
          charts_pie.setUnit(data);
        }

        charts_pie.setCustomLegend(data);

        var chart = new Chart($canvas, data);

        //set custom legend Wrapper
        $canvas.parent().append('<div class="pie-legend" id="pie-legend-' + index + '"></div>')

        var legend = $('#pie-legend-' + index);

        //CHARTJS generate legend Function
        legend.html(chart.generateLegend());

        charts_pie.animated[$canvas.attr('id')] = false;

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
  charts_pie.setCustomLegend = function (data) {
    Object.assign(data.options, {
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
  charts_pie.setUnit = function (data) {
    data.options.tooltips = {
      callbacks: {
        label: function (tooltipItem, data) {

          if (data.datasets[0].hasOwnProperty('unit_position')) {
            if (data.datasets[0]['unit_position'] === 'before') {
              return data.datasets[0]['unit'] + ' ' + Number(data.datasets[0]['data'][tooltipItem.index]) + ' ' + data.labels[tooltipItem.index];
            } else {
              return data.labels[tooltipItem.index] + ' ' + Number(data.datasets[0]['data'][tooltipItem.index]) + ' ' + data.datasets[0]['unit'];
            }
          }
        }
      }
    }
  }


  /**
   * Helper functions
   */

  /**
   * Check if window width is small than 1024
   * @returns {boolean}
   * @private
   */
  charts_pie._isMobile = function () {
    return $(window).width() <= 1024
  }

})(jQuery);


(function ($, Drupal) {

  /**
   * Use this behavior as a template for custom Javascript.
   */
  Drupal.behaviors.pie_charts = {
    attach: function (context, settings) {

      if (context === window.document) {
        charts_pie.init();
      }
    }
  };

})(jQuery, Drupal);
