<?php

namespace Drupal\macaroni_charts\Plugin\DsField;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Link;
use Drupal\ds\Plugin\DsField\DsFieldBase;
use Drupal\image\Entity\ImageStyle;
use Drupal\file\Entity\File;

class DsChart extends DsFieldBase
{

  const THEME = '';
  const LIBRARY = '';

  protected $build_info;

  /**
   * {@inheritdoc}
   */
  public function build()
  {
    $entity = $this->entity();

    $library = [
      'library' => [static::LIBRARY],
    ];

    $this->build_info = array(
      '#theme' => static::THEME,
      '#attached' => $library,
      '#id' => $entity->id(),
    );

    return $this->build_info;
  }
}
