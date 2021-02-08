<?php
namespace Drupal\macaroni_charts\Plugin\rest\resource;

use Drupal\Component\Serialization\Yaml;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;

class ChartResource extends ResourceBase {

  protected $data;
  protected $colors;

  /**
   * Responds to entity GET requests.
   *
   * @param $id
   * @return ResourceResponse
   * @throws \Exception
   */
  public function get($id) {

    try {
      $paragraph = Paragraph::load($id);
    }
    catch (\Exception $ex) {
      throw new \Exception('Unable to load entity '.$id);
    }

    $this->getData($paragraph);

    $build = array(
      '#cache' => array(
        'max-age' => 0,
      ),
    );

    return (new ResourceResponse($this->data))->addCacheableDependency($build);
  }

  protected function getData($paragraph) {

    $this->data['options'] = $this->getOptions();

    foreach($this->data['data']['datasets'] as $key => &$dataset) {

      $style = $this->getStyle();

      if(!empty($style)) {
        foreach ($style as $key => $value) {
          $dataset[$key] = $value;
        }
      }
    }

    $style = $paragraph->get('field_charts_style')->getValue();

    $this->getColors($style[0]['value']);
  }



  private function getColors($style) {

    $colors = (int) \Drupal::config('macaroni_charts.settings')->get('colors');
    $styles = \Drupal::config('macaroni_charts.settings')->get($style);

    for($j=0; $j<$colors; $j++) {
      $this->colors[] = $styles['colors']['color-'.$j];
    }

    foreach($this->data['data']['datasets'] as $key => &$dataset) {

      $colorIndex = 0;
      for ($i=0; $i<count($dataset['data']); $i++) {

        //reset colorIndex if dataset is larger than defined colors
        $colorIndex = ($i == count($this->colors)) ? 0 : $colorIndex++;

        $dataset['backgroundColor'][] = $this->colors[$colorIndex];
        $dataset['borderColor'][] = $this->colors[$colorIndex];

        $colorIndex++;
      }
    }

  }


  private function getStyle() {
    return $this->getConfiguration()['style'];
  }

  private function getOptions() {

    return $this->getConfiguration()['options'];
  }

  /**
   * return the configuration object for a given style read from a yaml configuration file
   *
   * @param $style
   * the style name (ex: style_1)
   * @return mixed
   * @throws \Exception
   */
  private function getConfiguration() {

    $module_handler = \Drupal::service('module_handler');
    $module_path = $module_handler->getModule('macaroni_charts')->getPath();

    $path = DRUPAL_ROOT . '/' . $module_path . '/config/'.static::TYPE.'.yml';

    try {
      $data = file_get_contents($path);
    }
    catch (\Exception $ex) {
      throw new \Exception('Unable to read file '.$path);
    }

    return Yaml::decode($data);

  }

}
