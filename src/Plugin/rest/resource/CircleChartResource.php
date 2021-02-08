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
 * Circle Chart Resource Base class
 *
 */
class CircleChartResource extends ChartResource {

  const CHART_TYPE = '';

  public function __construct(array $configuration, $plugin_id, $plugin_definition, array $serializer_formats, LoggerInterface $logger)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->data = [
      "type" => static::CHART_TYPE,
      "data" => [
        "labels" => [],
        "datasets" => [[
          "label" => "",
          "data" => [],
          "backgroundColor" => [],
          "borderColor" => [],
          "borderWidth" => 6
        ]],
      ],
    ];
  }

  /**
   * get data from paragraph entity and configuration file and builds the response array
   *
   * @param $paragraph
   * @return array
   * @throws \Exception
   */
  protected function getData($paragraph)
  {

    //get data from paragraph field_data_ph
    $field_data_ph = $paragraph->get('field_charts_data_ph')->getValue();

    foreach($field_data_ph as $sub_paragraph) {

      $data_paragraph = Paragraph::load($sub_paragraph['target_id']);

      $field_data = $data_paragraph->get('field_charts_data')->getValue();
      $data['data'][] = $field_data[0]['value'];

      $field_label = $data_paragraph->get('field_charts_label')->getValue();
      $this->data['data']['labels'][] = $field_label[0]['value'];

    }
    $this->data['data']['datasets'][0] = $data;

    //get unit
    $field_unit = $paragraph->get('field_charts_unit')->getValue();
    if (!empty($field_unit)) {
      $this->data['data']['datasets'][0]['unit'] = $field_unit[0]['value'];
    }

    //get unit position
    $field_unit_position = $paragraph->get('field_charts_unit_position')->getValue();
    if (!empty($field_unit_position)) {
      $this->data['data']['datasets'][0]['unit_position'] = $field_unit_position[0]['value'];
    }

    //get legend title
    $field_legend_title = $paragraph->get('field_charts_legend_title')->getValue();
    if (!empty($field_legend_title)) {
      $this->data['data']['datasets'][0]['legend_title'] = $field_legend_title[0]['value'];
    }

    parent::getData($paragraph);

    //get center text
    if($paragraph->hasField('field_charts_center_text')) {
      $field_center_text = $paragraph->get('field_charts_center_text')->getValue();
      if (!empty($field_center_text)) {
        $this->data['options']["elements"] = [
          "center" => [
            "text" => $field_center_text[0]['value'],
            "color" => $this->data['data']['datasets'][0]['backgroundColor'][0]
          ]
        ];
      }
    }
  }
}
