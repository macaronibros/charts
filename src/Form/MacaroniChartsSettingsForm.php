<?php

namespace Drupal\macaroni_charts\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Ajax\AjaxResponse;
use Drupal\Core\Ajax\ReplaceCommand;
use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\Render\Element;

use Drupal\field\Entity\FieldStorageConfig;
use Drupal\Core\Entity\ContentEntityInterface;

/**
 * Configure example settings for this site.
 */
class MacaroniChartsSettingsForm extends ConfigFormBase
{

  /**
   * number of styles
   */
  const MAX_STYLES = 10;
  const COLORS = 10;

  /**
   * Config settings.
   *
   * @var string
   */
  const SETTINGS = 'macaroni_charts.settings';


  public function __construct(ConfigFactoryInterface $config_factory)
  {

    parent::__construct($config_factory);

    $this->configFactory->getEditable(static::SETTINGS)->set('colors', static::COLORS)->save();

  }

  /**
   * {@inheritdoc}
   */
  public function getFormId()
  {

    return 'macaroni_charts_admin_settings';

  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames()
  {

    return [
      static::SETTINGS,
    ];

  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $options = [];

    for($i=1; $i<=static::MAX_STYLES; $i++) {
      $options[$i] = $i;
    }

    $form['styles'] = [
      '#type' => 'select',
      '#title' => $this->t('Select number of Styles'),
      '#options' => $options,
      '#default_value' => $this->config(static::SETTINGS)->get('styles'),
      '#required' => TRUE,
    ];

    for ($i = 1; $i <= $this->config(static::SETTINGS)->get('styles'); $i++) {
      $form['style_' . $i] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Style @num', ['@num' => $i]),
        '#tree' => true,
      ];

      $form['style_' . $i]['name'] = [
        '#type' => 'textfield',
        '#title' => $this->t('Name'),
        '#size' => 30,
        '#default_value' => $this->config(static::SETTINGS)->get('style_'.$i)['name'],
        '#required' => true,
      ];

      $form['style_' . $i]['colors'] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Colors'),
      ];

      $colors = $this->configFactory->getEditable(static::SETTINGS)->get('colors');

      for ($j = 0; $j < $colors; $j++) {
        $form['style_' . $i]['colors']['color-'.$j] = [
          '#type' => 'color',
          '#default_value' => $this->config(static::SETTINGS)->get('style_'.$i)['colors']['color-'.$j],
        ];
      }
    }

    $form['#attached']['library'][] = 'macaroni_charts/charts_admin_settings';

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state)
  {

  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state)
  {

    // Retrieve the configuration.
    $styles = $this->config(static::SETTINGS)->get('styles');

    // save the new settings
    for($i = 1; $i<=$styles; $i++) {

      $this->config(static::SETTINGS)->set('style_'.$i, $form_state->getValue('style_'.$i))->save();

    }

    $this->config(static::SETTINGS)->set('styles', $form_state->getValue('styles'))->save();

    parent::submitForm($form, $form_state);
  }

  public static function getAllowedValues(FieldStorageConfig $definition, ContentEntityInterface $entity = NULL, $cacheable) {

    $styles = \Drupal::config('macaroni_charts.settings')->get('styles');
    $options = [];

    for($i=1; $i<=$styles; $i++) {
      $style = 'style_'.$i;
      $options['style_'.$i] = \Drupal::config('macaroni_charts.settings')->get($style)['name'];
    }

    return $options;
  }
}
