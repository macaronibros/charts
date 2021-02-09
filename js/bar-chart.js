(function ($) {
  "use strict";

  window.chartsBar = {};



  /**
   * Init
   */
  chartsBar.init = function () {

    var $wrappers = $('.bar-chart-wrapper');

    if ($wrappers.length > 0) {

      $.each($wrappers, function (index, element) {

        var endpoint = $(element).data('endpoint');
        var $canvas = $(element).attr('id', 'bar-chart-wrapper-' + index);


        chartsBar.createWidget(endpoint, $canvas, index);

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

  chartsBar.createWidget = function (url, $canvas, index) {

    $.get({
      url: url,
      dataType: 'json'
    }).done(
      function (data) {

        //set custom tooltip with unit
        if (data.data.hasOwnProperty('unit')) {
          chartsBar.setUnit(data);
        }

        chartsBar.setCustomLegend(data);

        var $chart = new Chart($canvas, data);

        //set custom legend Wrapper
        $canvas.parent().append('<div class="bar-chart-legend" id="bar-chart-legend-' + index + '"></div>')

        var $legend = $('#bar-chart-legend-' + index);

        //CHARTJS generate legend Function
        $legend.html($chart.generateLegend());

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
  chartsBar.setUnit = function (data) {
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
  chartsBar.setCustomLegend = function (data) {
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
  chartsBar._isMobile = function () {
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
        chartsBar.init();
      }
    }
  };

})(jQuery, Drupal);
