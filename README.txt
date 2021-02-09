MACARONI CHARTS
===============

This module provides a unified format to build some kind of chart with Chart JS provider.

Any Chart JS solution has a specific data scheme. Its very hard to build an unique
chart data scheme that works for every kind of charts.

That's why MACARONI CHARTS is so great! It uses a standard data scheme to describe
charts data, and through Paragraphs, Display Suite Fields and Web Services, it
automatically converts to each chosen solution.

INSTALLATION
============

Using composer:

1: Ensure that you have the `composer/installers` package installed.

2: Ensure you have an installer-paths for the drupal-library type like this:

   "installer-paths": {
       "web/core": [
           "type:drupal-core"
       ],
       "web/libraries/{$name}": [
           "type:drupal-library",
           "type:bower-asset",
           "type:npm-asset"
       ],
       "web/modules/contrib/{$name}": [
           "type:drupal-module"
       ],
       "web/profiles/contrib/{$name}": [
           "type:drupal-profile"
       ],
       "web/themes/contrib/{$name}": [
           "type:drupal-theme"
       ],
       "drush/Commands/contrib/{$name}": [
           "type:drupal-drush"
       ],
       "web/modules/custom/{$name}": [
           "type:drupal-custom-module"
       ],
       "web/themes/custom/{$name}": [
           "type:drupal-custom-theme"
       ]
    }

3: Ensure you have an installer-types for the drupal-library type like this:

    "installer-types": ["bower-asset", "npm-asset"]

4: Ensure you have a repository section like this:

    "repositories": [
            {
                "type": "composer",
                "url": "https://packages.drupal.org/8"
            },
            {
                    "type": "composer",
                    "url": "https://asset-packagist.org"
            }
        ]

5: Run: composer require macaronibros/macaroni_charts

ADDITIONAL LIBRARIES
====================

This module relies on some third party libraries: Chart JS, chartjs-plugin-deferred,
jquery-visibleand select2. The installer throught composer will provide all the
libraries required except for theselect2 one. To install this one run:
composer require oomphinc/composer-installers-extender npm-asset/select2
