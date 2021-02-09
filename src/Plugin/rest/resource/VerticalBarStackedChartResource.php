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
 *   id = "vertical_bar_stacked_chart_resource",
 *   label = @Translation("Vertical Bar Stacked Chart Resource"),
 *   uri_paths = {
 *     "canonical" = "/macaroni-charts/vertical-bar-stacked-chart/{id}"
 *   }
 * )
 */
class VerticalBarStackedChartResource extends BarChartResource {


  const TYPE = 'vertical_bar_stacked_chart';
  const CHART_TYPE = 'bar';

}
