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
        chartsBar.setTooltips(data);


        chartsBar.setCustomLegend(data);
        chartsBar.truncateLabels(data);
        chartsBar.formatLabels(data);
        chartsBar.setUpMobile(data);

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
   * Hide ticks of Axis on mobile  if chart is Vertical
   * @param data (JSON)
   * current data from endpoint
   */
  chartsBar.setUpMobile = function (data) {
    if (chartsBar._isMobile()) {
      if (data.type === 'bar') {
        if (data.options.scales.yAxes[0].hasOwnProperty('ticks')) {
         $.extend(data.options.scales.yAxes[0].ticks, {
            display: false,
          })
        }
        $.extend(data.options.scales.xAxes[0], {
          ticks: {
            display: false
          },
        })
      }
      if (data.type === 'horizontalBar') {
        if (data.options.scales.xAxes[0].hasOwnProperty('ticks')) {
          $.extend(data.options.scales.xAxes[0].ticks, {
            display: false,
          })
        }
        $.extend(data.options.scales.yAxes[0], {
          ticks: {
            display: false
          },
        })
      }
    }
  }

  /**
   * Generate custom Tooltip whit Unit
   * @param data (JSON)
   * data from endpoint
   */
  chartsBar.setTooltips = function (data) {
    data.options.tooltips = {
      callbacks: {
        title: function (tooltipItem, data) {
          return data['labels_original'][tooltipItem[0].index];
        },
        label: function (tooltipItem, data) {
          var formatted_number = chartsBar._formatTooltipData(Number(data.datasets[tooltipItem.datasetIndex]['data'][tooltipItem.index]));
          if (data.hasOwnProperty('unit') && data.hasOwnProperty('unit_position')) {
            if (data['unit_position'] === 'before') {
              return ' ' + data.unit + ' ' + formatted_number + ' ' + data.datasets[tooltipItem.datasetIndex].label;
            } else {
              return ' ' + formatted_number  + ' ' + data.unit + ' ' + data.datasets[tooltipItem.datasetIndex].label;
            }
          }else {
            return data.datasets[tooltipItem.datasetIndex].label+' '+ formatted_number;
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
    $.extend(data.options, {
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
   * Truncate labels if it length is more than 20 in array of three words
   * @param data
   * data from endpoint
   */
  chartsBar.truncateLabels = function (data) {
    $.extend(data.data, {
      'labels_original': []
    })
    for (var i = 0; i < data.data.labels.length; i++) {
      data.data.labels_original.push(data.data.labels[i]);
      if (data.data.labels[i].length > 20) {
        data.data.labels[i] = chartsBar._splitByWordCount(data.data.labels[i], 3).join('\r\n');
      }
    }
  }

  /**
   * Format label if it contain \n
   * @param data
   */
  chartsBar.formatLabels = function (data) {
    $.extend(data, {
      plugins: [{
        beforeInit: function (chart) {
          chart.data.labels.forEach(function (e, i, a) {
            if (/\n/.test(e)) {
              a[i] = e.split(/\n/);
            }
          });
        }
      }]
    });
  }

  /**
   * Format the tooltip data value in a more readable way
   * @param value
   * @returns {string}
   */
  chartsBar._formatTooltipData = function (value) {
    var unit =  chartsBar._countDecimal(value);
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
  chartsBar._isMobile = function () {
    return $(window).width() <= 1024
  }

  /**
   * Group string in array by count
   * @param str
   * current string
   * @param count
   * @returns {[]}
   * @private
   */
  chartsBar._splitByWordCount = function (str, count) {
    var arr = str.split(' ')
    var r = [];
    while (arr.length) {
      r.push(arr.splice(0, count).join(' '))
    }
    return r;
  }

  /**
   * Get number of decimal position of number
   * @param number
   * @returns {number|number}
   * number of decimal position of number
   * @private
   */
  chartsBar._countDecimal = function (number) {
    if (Math.floor(number) === number) return 0;
    return number.toString().split(".")[1].length || 0;
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
