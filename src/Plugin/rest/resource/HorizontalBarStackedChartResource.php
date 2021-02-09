<?php

namespace Drupal\macaroni_charts\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Component\Serialization\Yaml;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\Entity\Term;
use Drupal\file\Entity;
use Psr\Log\LoggerInterface;

/**
 * Provides the Horizontal Bar Stacked Chart Resource
 *
 * @RestResource(
 *   id = "horizontal_bar_stacked_chart_resource",
 *   label = @Translation("Horizontal Bar Stacked Chart Resource"),
 *   uri_paths = {
 *     "canonical" = "/macaroni-charts/horizontal-bar-stacked-chart/{id}"
 *   }
 * )
 */
class HorizontalBarStackedChartResource extends BarChartResource {


  const TYPE = 'horizontal_bar_stacked_chart';
  const CHART_TYPE = 'horizontalBar';

}
