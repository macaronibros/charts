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
 * Bar Chart Resource Base class
 *
 */
class BarChartResource extends ChartResource {

  const CHART_TYPE = '';

  public function __construct(array $configuration, $plugin_id, $plugin_definition, array $serializer_formats, LoggerInterface $logger)
  {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->data = [
      "type" => static::CHART_TYPE,
      "data" => [],
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

    //get unit
    $field_unit = $paragraph->get('field_charts_unit')->getValue();
    if (!empty($field_unit)) {
      $this->data['data']['unit'] = $field_unit[0]['value'];
    }

    //get unit position
    $field_unit_position = $paragraph->get('field_charts_unit_position')->getValue();
    if (!empty($field_unit_position)) {
      $this->data['data']['unit_position'] = $field_unit_position[0]['value'];
    }


    //set categories
    $categories = [];
    $field_category_ref = $paragraph->get('field_charts_category_ref')->getValue();

    if(is_array($field_category_ref)) {
      foreach ($field_category_ref as $category) {
        $this->data['data']['datasets'][]['label'] = Term::load($category['target_id'])->getName();
      }
    }

    //set entities and categories
    $field_entity_ref = $paragraph->get('field_charts_entity_ref')->getValue();

    if(is_array($field_entity_ref)) {
      foreach($field_entity_ref as $entity) {
        $this->data['data']['labels'][] = Term::load($entity['target_id'])->getName();
      }
    }

    $field_aggregated_data = $paragraph->get('field_charts_aggregated_data')->getValue();

    if(!empty($field_aggregated_data[0]['value'])) {

      $this->parseDataField($field_aggregated_data[0]['value']);
    }

    parent::getData($paragraph);

    $this->rearrangeColors();

  }

  private function parseDataField($value) {
    $entities = explode('|', $value);

    foreach($entities as $key => $entity) {
      $entities[$key] = explode(';', $entity);
    }

    //set data
    for($i=0; $i<count($entities[0]); $i++) {
      foreach($entities as $key => $entity) {
        $this->data['data']['datasets'][$i]['data'][] = $entities[$key][$i];
      }
    }

  }

  private function rearrangeColors() {

    $colorIndex = 0;
    foreach($this->data['data']['datasets'] as $key => &$dataset) {
      //remove border color property
      unset($dataset['borderColor']);

      //reset colorIndex if dataset is larger than defined colors
      $colorIndex = ($key == count($this->colors)) ? 0 : $key;
      $dataset['backgroundColor'] = $this->colors[$colorIndex];
      $colorIndex++;

    }
  }
}
