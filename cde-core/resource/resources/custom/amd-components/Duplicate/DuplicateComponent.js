/*!
 * Copyright 2002 - 2015 Webdetails, a Pentaho company. All rights reserved.
 *
 * This software was developed by Webdetails and is provided under the terms
 * of the Mozilla Public License, Version 2.0, or any later version. You may not use
 * this file except in compliance with the license. If you need a copy of the license,
 * please go to http://mozilla.org/MPL/2.0/. The Initial Developer is Webdetails.
 *
 * Software distributed under the Mozilla Public License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. Please refer to
 * the license for the specific language governing your rights and limitations.
 */

define([
  'cdf/components/BaseComponent',
  'cdf/Logger',
  'cdf/lib/jquery'],
  function(BaseComponent, Logger, $) {

  var duplicateIndex = 0;

  var DuplicateComponent = BaseComponent.extend({

    update: function() {
      var myself = this,
        ph = $("#" + myself.htmlObject).empty(),
        link = $("<a href='javascript:;'>Duplicate</a>");
      link.click(function() {
        myself.duplicate();
      });
      link.appendTo(ph);
    },

    duplicate: function(parameterValues) {
      var myself = this;

      var cdePrefix = "render_";
      parameterValues = parameterValues || {};

      duplicateIndex += 1;

      var suffix = "_" + duplicateIndex;
      
      var params = {};

      $.each(myself.parameters, function(i, p) {
        var param =  p + suffix; 
        myself.dashboard.setBookmarkable(param, myself.dashboard.isBookmarkable(p));
        myself.dashboard.setParameter(param, parameterValues[p] || myself.dashboard.getParameterValue(p));
        params[p] = param;
      });

      var comps = {};

      $.each(myself.components, function(i, c) {
        var comp =  c + suffix; 
        comps[c] = comp;
      });
      
      for(var c in myself.components) {
        var cName = myself.components[c];
        cName = RegExp("^"+ cdePrefix).test(cName) ? cName : cdePrefix + cName;
        var component = myself.dashboard.getComponent(cName);
        if(component) {
          // map component's htmlObject to the new HTML object (newPh)
          // e.g. htmlRemap['column1'] = 'column1_1'
          //    Were 'column1' is the component's HTML object
          //    'column1_1' is the duplicated component's HTML object
          var htmlRemap = {};
          var newPh = $("#" + component.htmlObject).clone();
          newPh.attr("id", component.htmlObject + suffix);
          newPh.find("[id]").each(function(i, e) {
            var $e = $(e);
            $e.attr("id", $e.attr("id") + suffix);  
          });

          if(myself.targetContainer) {
            newPh.appendTo('#' + myself.targetContainer);  
          } else {
            newPh.insertAfter('#' + myself.targetHtmlObject);
          }

  	      htmlRemap[component.htmlObject] = newPh.attr('id').replace(/([^\\])\$/g, '$1\\$');
      	  var clone = component.clone(params, comps, htmlRemap);
  	      clone.name = clone.name + suffix;
  	      myself.dashboard.addComponents([clone]);
      	  myself.dashboard.update(clone);
        }
      }
    },

    clone: function(parameterRemap, componentRemap, htmlRemap) {
      Logger.warn("This function is deprecated. Please use targetComponent.clone(...), see BaseComponent.js in CDF for more details.");
      var that = this.base(parameterRemap, componentRemap, htmlRemap);
      that.targetHtmlObject = htmlRemap[that.targetHtmlObject];
      if(that.parameters) {
        that.parameters = that.parameters.map(function(param) {
          if(param in parameterRemap) {
            return parameterRemap[param];
          } else {
            return param;
          }
        });
      }
      return that;
    }
  });

  return DuplicateComponent;

});
