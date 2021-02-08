<?php

namespace Drupal\macaroni_charts\Plugin\DsField;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Link;
use Drupal\ds\Plugin\DsField\DsFieldBase;
use Drupal\image\Entity\ImageStyle;
use Drupal\file\Entity\File;

class CircleChart extends DsChart
{

  const THEME = 'circle_chart';
  const RESOURCE = '';
  const LIBRARY = 'macaroni_charts/charts_circle';

  /**
   * {@inheritdoc}
   */
  public function build() {

    parent::build();
    $this->build_info['#resource'] = static::RESOURCE;

    return $this->build_info;

  }
}
