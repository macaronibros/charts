<?php

namespace Drupal\macaroni_charts\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Component\Serialization\Yaml;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\Entity\Term;
use Psr\Log\LoggerInterface;

/**
 * Provides the Doughnut Chart Resource
 *
 * @RestResource(
 *   id = "doughnut_chart_resource",
 *   label = @Translation("Doughnut Chart Resource"),
 *   uri_paths = {
 *     "canonical" = "/macaroni-charts/doughnut-chart/{id}"
 *   }
 * )
 */
class DoughnutChartResource extends CircleChartResource {

  const TYPE = 'doughnut_chart';
  const CHART_TYPE = 'doughnut';

}
