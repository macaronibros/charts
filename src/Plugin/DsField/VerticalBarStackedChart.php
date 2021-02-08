<?php

namespace Drupal\macaroni_charts\Plugin\DsField;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Link;
use Drupal\ds\Plugin\DsField\DsFieldBase;
use Drupal\image\Entity\ImageStyle;
use Drupal\file\Entity\File;

/**
* Plugin that renders the terms from a chosen taxonomy vocabulary.
*
* @DsField(
*   id = "macaroni_vertical_bar_stacked_chart",
*   title = @Translation("Chart"),
*   entity_type = "paragraph",
*   provider = "macaroni_charts",
*   ui_limit = {"vertical_bar_stacked_chart|default"}
* )
*/
class VerticalBarStackedChart extends DsChart
{

  const THEME = 'bar_chart';
  const LIBRARY = 'macaroni_charts/charts_bar';
  const RESOURCE = 'macaroni-charts/vertical-bar-stacked-chart';
}
