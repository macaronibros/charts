<?php

namespace Drupal\macaroni_charts\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Drupal\Component\Serialization\Yaml;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\Entity\Term;
use Psr\Log\LoggerInterface;

/**
 * Provides the Social Chart Resource
 *
 * @RestResource(
 *   id = "slide_chart_resource",
 *   label = @Translation("Slide Chart Resource"),
 *   uri_paths = {
 *     "canonical" = "/macaroni-charts/slide-chart/{paragraph_id}"
 *   }
 * )
 */
class SlideChartResource extends ChartResource
{


  const TYPE = 'slide_chart';
  const LABEL_BEFORE = 'before';
  const MAX_WORDS = 18;

  public function __construct(array $configuration, $plugin_id, $plugin_definition, array $serializer_formats, LoggerInterface $logger)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->data = [
      "type" => "slide",
      "data" => [
        "datasets" => [
        ]
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
  protected function getData($paragraph)
  {

    //get data from paragraph field_data_ph
    $field_data_ph = $paragraph->get('field_charts_data_ph')->getValue();

    foreach($field_data_ph as $sub_paragraph) {
      $data_paragraph = Paragraph::load($sub_paragraph['target_id']);

      $field_data = $data_paragraph->get('field_charts_data')->getValue();
      $field_unit = $data_paragraph->get('field_charts_unit')->getValue();

      if (!empty($field_unit)) {
        $data['unit'][] = $field_unit[0]['value'];
      }

      $field_unit_position = $data_paragraph->get('field_charts_unit_position')->getValue();

      if(!empty($field_unit_position[0]['value'])) {
        $data['unit_position'][] = ($field_unit_position[0]['value']);
      }else {
        $data['unit_position'][] = "";
      }

      $data['data'][] = $field_data[0]['value'];

      $field_label = $data_paragraph->get('field_charts_label')->getValue();

      $data['info'][] = (str_word_count($field_label[0]['value']) > static::MAX_WORDS)
        ? $this->limit_text($field_label[0]['value'], static::MAX_WORDS)
        : $field_label[0]['value'];

      $field_icon = $data_paragraph->get('field_charts_icon_ref')->getValue();
      $field_icon_term = Term::load($field_icon[0]['target_id']);
      $field_icon_svg_uri = $field_icon_term->get('field_svg_file')->entity->getFileUri();
      $field_icon_svg = file_exists($field_icon_svg_uri) ? file_get_contents($field_icon_svg_uri) : NULL;
      $data['icons'][] = $field_icon_svg;
    }

    $this->data['data']['datasets'][0] = $data;

    parent::getData($paragraph);

  }


  private function limit_text($text, $limit) {
    if (str_word_count($text, 0) > $limit) {
      $words = str_word_count($text, 2);
      $pos   = array_keys($words);
      $text  = substr($text, 0, $pos[$limit]);
    }
    return $text;
  }


}
