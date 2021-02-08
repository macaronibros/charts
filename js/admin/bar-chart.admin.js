(function ($) {
  "use strict";
  window.CHARTJS = {};

  CHARTJS.data = [];

  const ENTITY = 'entity';
  const CATEGORY = 'category';
  const WIDGET = 'widget';

  /**
   * Init function
   */
  CHARTJS.init = function() {

    CHARTJS.s = {
      $container: $('.bar-chart'),
      $entities: $('.bar-chart .field--name-field-charts-entity-ref select.select2-widget'),
      $categories: $('.bar-chart .field--name-field-charts-category-ref select.select2-widget'),
      $data: $('.bar-chart .field--name-field-charts-aggregated-data textarea'),
      adminWrapperClass: 'bar-chart-admin-wrapper',
    };

    CHARTJS.s.$entities.bind('change', CHARTJS.entityDataHandler);
    CHARTJS.s.$categories.bind('change', CHARTJS.categoryDataHandler);

    //hide aggregated data field
    //CHARTJS.s.$data.parents('.field--name-field-charts-aggregated-data').hide();

    CHARTJS.buildForms();
  }
  /**
   * Generate the forms
   */
  CHARTJS.buildForms = function () {
    //destroy previously created forms
    CHARTJS.destroyForms();

    CHARTJS.s.$container.each(function (index) {
      //parse Form fields
      CHARTJS.initData(index);

      //build Form from parsed Data
      CHARTJS.buildForm(index);
    });
  }
  /**
   * Generate a Form from a given index
   *
   * @param index
   * the index in the data structure to be generated
   */
  CHARTJS.buildForm = function(index) {

    if(CHARTJS._drawable(index)) {

      var $container = $('<div class="' + CHARTJS.s.adminWrapperClass + '"><ul></ul></div>');

      $.each(CHARTJS.data[index].entities, function (entityIndex) {

        var $li = $('<li></li>');
        var $label = $('<h5>' + CHARTJS._cleanLabel(CHARTJS.data[index].entities[entityIndex]) + '</h5>');

        $li.append($label);
        $container.children().append($li);

        var $wrapper = $('<div class="inner-wrapper"></div>');
        $.each(CHARTJS.data[index].categories, function (categoryIndex) {

          var dataID = 'category-' + entityIndex + '-' + categoryIndex;
          var $dataLabel = $('<label for="' + dataID + '">' + CHARTJS.data[index].categories[categoryIndex] + '</label>');
          var $dataInput = $('<div class="field--type-decimal"><div class="form-type-number"><input type="number" step="0.01" class="form-number required"' +
            'id="' + dataID +
            '" name="' + dataID +
            '" data-' + ENTITY +'="' + entityIndex +
            '" data-' + CATEGORY +'="' + categoryIndex +
            '" data-' + WIDGET +'="' + index + '"' +
            '" value="' + CHARTJS.data[index].data[entityIndex][categoryIndex] + '"/></div></div>');

          $dataInput.find('input').bind('change', CHARTJS.aggregatedDataHandler);
          //update aggregated data form field
          CHARTJS.setAggregatedDataField(index);

          $wrapper.append($dataLabel);
          $wrapper.append($dataInput);
          $li.append($wrapper);

        });

      });

      $(CHARTJS.s.$container[index]).append($container);
    }
  }
  /**
   * Set the Aggregated data form field from the data structure
   *
   * @param index
   *
   */
  CHARTJS.setAggregatedDataField = function(index) {
    var $element = $(CHARTJS.s.$data[index]);

    //convert data bidimensional array into aggregated field string
    var categories = [];

    for(var i=0; i<CHARTJS.data[index].data.length; i++) {
      categories.push(CHARTJS.data[index].data[i].join(';'));
    }

    $element.val(categories.join('|'));

  }
  /**
   * Destroy and Build a Form from a given index
   *
   * @param index
   * the index in the data structure to be rebuilt
   */
  CHARTJS.rebuildForm = function(index) {
    CHARTJS.destroyForm(index);
    CHARTJS.buildForm(index);
  }
  /**
   * Destroy all generated form
   */
  CHARTJS.destroyForms = function() {
    $('.'+ CHARTJS.s.adminWrapperClass).remove();
  }
  /**
   * Destroy a specific form
   *
   * @param index
   * the index of the form to destroy
   */
  CHARTJS.destroyForm = function(index) {
    $($('.'+CHARTJS.s.adminWrapperClass).get(index)).remove();
  }

  /**
   * Read data from fields and build the data structure for a given Form
   *
   * @param index
   * the index of the form to be parsed
   */
  CHARTJS.initData = function(index) {

    CHARTJS.data[index] = {};

    //parse entities field
    CHARTJS.data[index].entities = [];
    CHARTJS.data[index].entities = CHARTJS._getDataFromField(CHARTJS.data[index].entities, CHARTJS.s.$entities, index);
    //console.log(CHARTJS.data[index].entities);

    //parse categories field
    CHARTJS.data[index].categories = [];
    CHARTJS.data[index].categories = CHARTJS._getDataFromField(CHARTJS.data[index].categories, CHARTJS.s.$categories, index);
    //console.log(CHARTJS.data[index].categories);

    //parse aggregated data field
    CHARTJS.data[index].data = [];
    CHARTJS.data[index].data = CHARTJS._getAggregatedDataFromField(CHARTJS.data[index].data, CHARTJS.s.$data, index);
    //console.log(CHARTJS.data[index].data);

  }
  /**
   * Handler for change event on Entities Form Field
   *
   * React to Form field value change, update data structure and rebuild the form
   *
   * @param event
   * the event object
   */
  CHARTJS.entityDataHandler = function(event) {

    var $this = $(this);
    var index = CHARTJS._getWidgetIndex($this);

    CHARTJS.data[index].entities = CHARTJS._setData($this, CHARTJS.data[index].entities, ENTITY, index);

    CHARTJS.rebuildForm(index);
  }
  /**
   * Handler for change event on Categories Form Field
   *
   * React to Form field value change, update data structure and rebuild the form
   *
   * @param event
   * the event object
   */
  CHARTJS.categoryDataHandler = function(event) {

    var $this = $(this);
    var index = CHARTJS._getWidgetIndex($this);

    CHARTJS.data[index].categories = CHARTJS._setData($this, CHARTJS.data[index].categories, CATEGORY, index);

    CHARTJS.rebuildForm(index);

  }

  /**
   * Handler for change event on Aggregated Data Form Field
   *
   * React to Form field value change, update data structure and rebuild the form
   *
   * @param event
   * the event object
   */
  CHARTJS.aggregatedDataHandler = function(event) {

    var $this = $(this);
    //get object coordinates on data structure from field data-values
    var index = $this.data(WIDGET);
    var entityId = $this.data(ENTITY);
    var categoryId = $this.data(CATEGORY);

    //set default value if the input field has been deleted
    if($this.val() === '') {
      $this.val('0');
    }

    CHARTJS.data[index].data[entityId][categoryId] = $this.val();

    CHARTJS.rebuildForm(index);
  }

  /**
   * Set data structure from Form Field and return it
   *
   * @param $element
   * the Form Field DOM element
   *
   * @param data
   * the data structure to be set
   *
   * @param fieldType
   * entity|category type that need to be passed through
   *
   * @param index
   * the index of the form
   *
   * @returns
   * the data structure
   *
   * @private
   */
  CHARTJS._setData = function($element, data, fieldType, index) {

    var newData = [];

    var options = $element.find(':selected')
    $.each(options, function(i) {
      newData.push(options[i].text)
    });

    CHARTJS._setAggregatedData(data, newData, fieldType, index);
    data = newData;

    return data;
  }
  /**
   * Set bidimensional data array in the structure from entity and categories data
   *
   * @param data
   * the current data structure
   *
   * @param newData
   * the current data structure with entities and categories fields updated
   *
   * @param fieldType
   * entity|category type that need to be passed through
   *
   * @param index
   * the index of the form
   * @private
   */
  CHARTJS._setAggregatedData = function(data, newData, fieldType, index) {

    for(var i=0; i<newData.length; i++) {
      if($.inArray(newData[i], data) === -1) {

        switch (fieldType) {
          case ENTITY:
            CHARTJS._addEntityToAggregatedData(i, index);
            break;

          case CATEGORY:
            CHARTJS._addCategoryToAggregatedData(i, index);
            break;
        }
        //console.log('added: '+newData[i]+' at position: '+i);
        return;
      }
    }

    //check arrays diff
    for(var i=0; i<data.length; i++) {
      if($.inArray(data[i], newData) === -1) {
        switch (fieldType) {
          case ENTITY:
            CHARTJS._removeEntityFromAggregatedData(i, index);
            break;

          case CATEGORY:
            CHARTJS._removeCategoryFromAggregatedData(i, index);
            break;
        }
        //console.log('removed: '+data[i]+' from position: '+i);
        return;
      }
    }

    //check if swapped
    var swapped = [];
    for (var i = 0; i < data.length; i++) {
      swapped.push($.inArray(newData[i], data));
    }
    //console.log('swapped: '+swapped);

    switch (fieldType) {
      case ENTITY:
        CHARTJS._swapEntityOnAggregatedData(swapped, index);
        break;

      case CATEGORY:
        CHARTJS._swapCategoryOnAggregatedData(swapped, index);
        break;
    }

  }
  /**
   * Add an entity to data bidimensional array
   *
   * @param entity
   * the entity to add
   * @param index
   * the index of the form
   * @private
   */
  CHARTJS._addEntityToAggregatedData = function(entity, index) {

    //init newEntity
    var newEntity = [];
    newEntity.push('0');
    //fill newEntity with 0 only if we have at least one category
    if((CHARTJS.data[index].categories[0] !== '')  && (CHARTJS.data[index].categories.length > 1 )) {
      $.each(CHARTJS.data[index].categories, function () {
        newEntity.push('0');
      });
    }

    if((CHARTJS.data[index].entities[0] !== '') && (CHARTJS.data[index].entities.length > 0)) {
      CHARTJS.data[index].data.splice(entity, 0, newEntity);
    }

  }
  /**
   * Add a category to data bidimensional array
   *
   * @param category
   * the category to add
   * @param index
   * the index of the form
   * @private
   */
  CHARTJS._addCategoryToAggregatedData = function(category, index) {

    if((CHARTJS.data[index].categories[0] !== '') && (CHARTJS.data[index].categories.length > 0)) {
      $.each(CHARTJS.data[index].entities, function (entityIndex) {
        CHARTJS.data[index].data[entityIndex].splice(category, 0, '0');
      });
    }
  }
  /**
   * Remove an entity from data bidimensional array
   *
   * @param entity
   * the entity to remove
   * @param index
   * the index of the form
   * @private
   */
  CHARTJS._removeEntityFromAggregatedData = function(entity, index) {

    CHARTJS.data[index].data.splice(entity, 1);

    //if we removed everything fill at least with a default value
    if(!CHARTJS.data[index].data.length) {
      CHARTJS.data[index].data.push(['0']);
    }
  }
  /**
   * Remove a category from data bidimensional array
   *
   * @param category
   * the category to remove
   * @param index
   * the index of the form
   * @private
   */
  CHARTJS._removeCategoryFromAggregatedData = function(category, index) {
    $.each(CHARTJS.data[index].data, function(entityIndex) {
      CHARTJS.data[index].data[entityIndex].splice(category, 1);

      //if we removed everything fill at least with a default value
      if(!CHARTJS.data[index].data[entityIndex].length) {
        CHARTJS.data[index].data[entityIndex].push('0');
      }
    })
  }
  /**
   * Swap an entity on data bidimensional array
   *
   * @param swapped
   * the array of new elements positions for an entity
   * @param index
   * the index of the form
   * @private
   */
  CHARTJS._swapEntityOnAggregatedData = function(swapped, index) {

    var newData = [];
    $.each(swapped, function (indexSwapped) {
      newData.push(CHARTJS.data[index].data[swapped[indexSwapped]]);
    });
    CHARTJS.data[index].data = newData;

  }
  /**
   * Swap a category on data bidimensional array
   *
   * @param swapped
   * the array of new elements positions for a category
   * @param index
   * the index of the form
   * @private
   */
  CHARTJS._swapCategoryOnAggregatedData = function(swapped, index) {

    $.each(CHARTJS.data[index].data, function(entityIndex) {
      var newData = [];
      $.each(swapped, function (indexSwapped) {
        newData.push(CHARTJS.data[index].data[entityIndex][swapped[indexSwapped]]);
      });
      CHARTJS.data[index].data[entityIndex] = newData;
    });
  }
  /**
   * Get data from Form field for a given form and save to data structure
   *
   * @param data
   * the data structure where to save data
   *
   * @param element
   * the form field element
   *
   * @param id
   * the index of the form
   *
   * @returns
   * the data structure filled with form field value
   * @private
   */
  CHARTJS._getDataFromField = function(data, element, id) {

    var $element = $(element[id]);
    if($element.length) {
      $.each($element.children('option'), function(index) {

        data[index] = $(this).html();

      });
    }

    return data;
  }
  /**
   * Get data from Form field for a given form and save to data structure
   *
   * @param data
   * the data structure where to save data
   *
   * @param element
   * the form field element
   *
   * @param id
   * the index of the form
   *
   * @returns
   * the data structure filled with form field value
   * @private
   */
  CHARTJS._getAggregatedDataFromField = function(data, element, id) {

    var $element = $(element[id]);
    //parse field value to transform string of type 0;0;0|0;0;0 to bidimensional array
    if($element.val().length) {
      var dataStructure = $element.val().split('|');
      $.each(dataStructure, function(index) {

        var dataStructureSingle = this.split(';');
        data[index] = [];
        $.each(dataStructureSingle, function(key) {
          data[index].push(dataStructureSingle[key]);
        });

      });
    }

    return data;
  }
  /**
   * Return the Form index from a DOM element
   *
   * @param $element
   * the DOM element
   *
   * @returns
   * the Form index
   *
   * @private
   */
  CHARTJS._getWidgetIndex = function($element) {
    var $parent = $element.parents('.bar-chart');
    var result = undefined;

    $.each($('.bar-chart'), function(index) {

      var $this = $(this);

      if($this.is($parent)) {

        result = index;
      }

    });

    return result;
  }
  /**
   * Clean string removing "(<anything>)"
   *
   * @param label
   * the string to be cleaned
   * @returns string
   * the cleaned string
   * @private
   */
  CHARTJS._cleanLabel = function(label) {
    if(label.indexOf(" (") !== -1) {
      return label.substring(0, label.length - (label.split("").reverse().join("").indexOf("( ")) - 2);
    }
    return label;
  }

  CHARTJS._drawable = function(index) {
    return (
      (CHARTJS.data[index].data !== undefined)
      && CHARTJS.data[index].data.length
      && (CHARTJS.data[index].categories[0] !== '')
      && CHARTJS.data[index].categories.length
      && (CHARTJS.data[index].entities[0] !== '')
      && CHARTJS.data[index].entities.length
    );
  }

})(jQuery);


(function ($, drupalSettings, Sortable) {

  Drupal.behaviors.macaroniChartsVerticalBarAdmin = {
    attach: function (context) {

      if( (context === window.document) || (context === $('.node-form')[0]) ) {
        CHARTJS.init();
      }

      /*
       * SELECT 2 Patch to trigger change event on select 2 drag&drop sort
       */
      $('select.select2-widget', context).once('select2-init').each(function () {

        var config = $(this).data('select2-config');
        config.createTag = function (params) {
          var term = $.trim(params.term);
          if (term === '') {
            return null;
          }
          return {
            id: '$ID:' + term,
            text: term
          };
        };
        config.templateSelection = function (option, container) {
          // The placeholder doesn't have value.
          if ('element' in option && 'value' in option.element) {
            // Add option value to selection container for sorting.
            $(container).data('optionValue', option.element.value);
          }
          return option.text;
        };
        $(this).data('select2-config', config);

        // Emit an event, that other modules have the chance to modify the
        // select2 settings. Make sure that other JavaScript code that rely on
        // this event will be loaded first.
        // @see: modules/select2_publish/select2_publish.libraries.yml
        $(this).trigger('select2-init');
        config = $(this).data('select2-config');

        // If config has a dropdownParent property, wrap it a jQuery object.
        if (Object.prototype.hasOwnProperty.call(config, 'dropdownParent')) {
          config.dropdownParent = $(config.dropdownParent);
        }
        $(this).select2(config);

        if (Object.prototype.hasOwnProperty.call(config, 'ajax') && config.multiple) {
          var $select = $(this);
          var $list = $select.next('.select2-container').find('ul.select2-selection__rendered');
          Sortable.create($list[0], {
            draggable: 'li:not(.select2-search)',
            forceFallback: true,
            onEnd: function () {
              $($list.find('.select2-selection__choice').get().reverse()).each(function () {
                $select.prepend($select.find('option[value="' + $(this).data('optionValue') + '"]').first());
              });
              $select.trigger('change');
            }
          });
        }
      });
    }
  };

})(jQuery, drupalSettings, Sortable);
