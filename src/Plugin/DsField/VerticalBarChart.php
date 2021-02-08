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
*   id = "macaroni_vertical_bar_chart",
*   title = @Translation("Chart"),
*   entity_type = "paragraph",
*   provider = "macaroni_charts",
*   ui_limit = {"vertical_bar_chart|default"}
* )
*/
class VerticalBarChart extends BarChart
{

  const RESOURCE = '/macaroni-charts/vertical-bar-chart';
}
