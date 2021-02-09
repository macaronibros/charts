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
 * Provides the Social Chart Resource
 *
 * @RestResource(
 *   id = "social_chart_resource",
 *   label = @Translation("Social Chart Resource"),
 *   uri_paths = {
 *     "canonical" = "/macaroni-charts/social-chart/{id}"
 *   }
 * )
 */
class SocialChartResource extends ChartResource {


  const TYPE = 'social_chart';


  public function __construct(array $configuration, $plugin_id, $plugin_definition, array $serializer_formats, LoggerInterface $logger)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->data = [
      "type" => "social",
      "data" => [
        "labels" => [],
        "datasets" => [[
          "data" => [],
          "icons" => [],
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
      $this->data['data']['labels'][] = $field_label[0]['value'];


      $field_icon = $data_paragraph->get('field_charts_icon_ref')->getValue();
      $field_icon_term = Term::load($field_icon[0]['target_id']);
      $field_icon_svg_uri = $field_icon_term->get('field_svg_file')->entity->getFileUri();
      $field_icon_svg = file_exists($field_icon_svg_uri) ? file_get_contents($field_icon_svg_uri) : NULL;
      $data['icons'][] = $field_icon_svg;
    }

    $this->data['data']['datasets'][0] = $data;

    parent::getData($paragraph);

    $this->normalizeColors();

  }

  /**
   * Normalize colors setting all borderColor and backgroundColor to the first color in settings for the current style
   */
  private function normalizeColors() {

    foreach($this->data['data']['datasets'] as $key => &$dataset) {


      $dataset['backgroundColor'] = [$dataset['backgroundColor'][0], $dataset['backgroundColor'][1]];
      $dataset['borderColor'] = [$dataset['backgroundColor'][0], $dataset['backgroundColor'][1]];

    }
  }


}
