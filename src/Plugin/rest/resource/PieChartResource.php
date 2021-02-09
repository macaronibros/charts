<?php

namespace Drupal\macaroni_charts\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Component\Serialization\Yaml;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\Entity\Term;
use Psr\Log\LoggerInterface;

/**
 * Provides the Pie Chart Resource
 *
 * @RestResource(
 *   id = "pie_chart_resource",
 *   label = @Translation("Pie Chart Resource"),
 *   uri_paths = {
 *     "canonical" = "/macaroni-charts/pie-chart/{id}"
 *   }
 * )
 */
class PieChartResource extends CircleChartResource {

  const TYPE = 'pie_chart';
  const CHART_TYPE = 'pie';

}
