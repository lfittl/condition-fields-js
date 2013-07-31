(function( $ ) {
  function regenerateOutput(randomField) {
    var container = $(randomField).hasClass("condition-fields-container") ? randomField : $(randomField).parents(".condition-fields-container");
    var input = $(container).prev("input[data-condition-fields=true]");
    console.log(input[0]);
    var output = [];
    container.find("fieldset.or_group").each(function () {
      var hsh = {};
      console.log(this);
      $(this).find("div.condition").each(function () {
        var key = $(this).find("input.key")[0].value;
        var value = $(this).find("input.value")[0].value;
        hsh[key] = value;
      });
      output.push(hsh);
    });
    input.val(JSON.stringify(output));
    input.change();
  }
  function generateAndCondition(key, value, firstElement) {
    var andCondition = $('<div/>', {
      'class': 'condition',
      html: $('<input/>', {
        'value': key,
        'class': 'key'})
        .on("change", function () { regenerateOutput(this); })
      .add($('<span/>', {
        'text': " = "}))
      .add($('<input/>', {
        'value': value,
        'class': 'value'})
        .on("change", function () { regenerateOutput(this); }))
      .add($('<a/>', {
        'href': "#",
        'html': ' &times;',
        'class': 'delete'
      }).on("click", function () {
        var condition = $(this).parent('.condition');
        var conditionsContainer = $(this).parents(".condition-fields-container");
        // Remove whole fieldset if there are no conditions left (and this isn't the only fieldset)
        var conditionCount = $(this).parents("fieldset").find(".condition").length;
        var fieldsetCount = conditionsContainer.find("fieldset").length;
        if (conditionCount == 1 && fieldsetCount > 1) {
          $(this).parents("fieldset").remove();
        } else {
          if (condition.next('.operator').length > 0)
            condition.next('.operator').remove();
          else
            condition.prev('.operator').remove();
          condition.remove();
        }
        regenerateOutput(conditionsContainer);
        return false;
      }))
    });
    if (!firstElement) {
      andCondition = $('<span/>', {
        'text': "AND",
        'class': 'operator'
      }).add(andCondition);
    }
    return andCondition;
  }
  function generateOrCondition(orGroup) {
    var fieldset = $('<fieldset/>', {"class": "or_group"});
    fieldset.append($('<legend/>', {text: "OR"}));
    for (var key in orGroup) {
      var firstElement = key == Object.keys(orGroup)[0];
      fieldset.append(generateAndCondition(key, orGroup[key], firstElement));
    }
    fieldset.append($('<a/>', {
      href: "#nojs",
      text: 'Add AND condition'
    }).on("click", function () {
      var firstElement = $(this).parent("fieldset").find(".condition").length == 0;
      $(this).before(generateAndCondition("", "", firstElement));
      return false;
    }));
    return fieldset;
  }
  $.fn.conditionFields = function(options) {
    return this.each(function() {
      $('input[data-condition-fields=true]').each(function () {
        var element = $('<div/>', {'class': 'condition-fields-container'}).insertAfter(this);
        var conditions = $.parseJSON(this.value);
        conditions.forEach(function(orGroup) {
          element.append(generateOrCondition(orGroup));
        });
        element.append($('<a/>', {
          'href': "#nojs",
          'text': 'Add OR condition'
        }).on("click", function () {
          $(this).before(generateOrCondition({"": ""}));
          return false;
        }));
      });
    });
  };
}( jQuery ));