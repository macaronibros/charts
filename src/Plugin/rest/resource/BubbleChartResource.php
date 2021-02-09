<?php

namespace Drupal\macaroni_charts\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Component\Serialization\Yaml;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\Entity\Term;
use Psr\Log\LoggerInterface;

/**
 * Provides the Bubble Chart Resource
 *
 * @RestResource(
 *   id = "bubble_chart_resource",
 *   label = @Translation("Bubble Chart Resource"),
 *   uri_paths = {
 *     "canonical" = "/macaroni-charts/bubble-chart/{id}"
 *   }
 * )
 */
class BubbleChartResource extends ChartResource {


  const TYPE = 'bubble_chart';


  public function __construct(array $configuration, $plugin_id, $plugin_definition, array $serializer_formats, LoggerInterface $logger)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->data = [
      "type" => "bubble",
      "data" => [
        "datasets" =>[[
          "data" => [],
          "fill" => false,
          "backgroundColor" => [],
          "borderColor" => [],
          "borderWidth" => 6
        ]]
      ]
    ];

  }

  /**
   * get data from paragraph entity and configuration file and builds the response array
   *
   * @param $paragraph
   * @return array
   * @throws \Exception
   */
  protected function getData($paragraph) {

    //get data from paragraph field_data_ph
    $field_data_ph = $paragraph->get('field_charts_data_ph')->getValue();

    foreach($field_data_ph as $sub_paragraph) {
      $data_paragraph = Paragraph::load($sub_paragraph['target_id']);

      $field_data = $data_paragraph->get('field_charts_data')->getValue();
      $data['data'][] = $field_data[0]['value'];

      $field_label = $data_paragraph->get('field_charts_label')->getValue();
      $data['labels'][] = $field_label[0]['value'];

    }

    $this->data['data']['datasets'][0] = $data;

    parent::getData($paragraph);

  }
}
