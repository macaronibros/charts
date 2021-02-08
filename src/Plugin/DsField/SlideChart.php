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
 *   id = "macaroni_slide_chart",
 *   title = @Translation("Chart"),
 *   entity_type = "paragraph",
 *   provider = "macaroni_charts",
 *   ui_limit = {"slide_chart|default"}
 * )
 */
class SlideChart extends DsChart
{

  const THEME = 'slide_chart';
  const LIBRARY = 'macaroni_charts/charts_slide';

}
