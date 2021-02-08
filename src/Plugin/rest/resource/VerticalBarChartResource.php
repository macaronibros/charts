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
 * Provides the Vertical Bar Chart Resource
 *
 * @RestResource(
 *   id = "vertical_bar_chart_resource",
 *   label = @Translation("Vertical Bar Chart Resource"),
 *   uri_paths = {
 *     "canonical" = "/macaroni-charts/vertical-bar-chart/{paragraph_id}"
 *   }
 * )
 */
class VerticalBarChartResource extends BarChartResource {


  const TYPE = 'vertical_bar_chart';
  const CHART_TYPE = 'bar';

}
