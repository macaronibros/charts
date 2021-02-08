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
 * Provides the Horizontal Bar Chart Resource
 *
 * @RestResource(
 *   id = "horizontal_bar_chart_resource",
 *   label = @Translation("Horizontal Bar Chart Resource"),
 *   uri_paths = {
 *     "canonical" = "/macaroni-charts/horizontal-bar-chart/{paragraph_id}"
 *   }
 * )
 */
class HorizontalBarChartResource extends BarChartResource {

  const TYPE = 'horizontal_bar_chart';
  const CHART_TYPE = 'horizontalBar';

}
