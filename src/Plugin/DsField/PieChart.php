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
 *   id = "macaroni_pie_chart",
 *   title = @Translation("Chart"),
 *   entity_type = "paragraph",
 *   provider = "macaroni_charts",
 *   ui_limit = {"pie_chart|default"}
 * )
 */
class PieChart extends DsChart {

  const THEME = 'circle_chart';
  const LIBRARY = 'macaroni_charts/charts_circle';
  const RESOURCE = 'macaroni-charts/pie-chart';

}
