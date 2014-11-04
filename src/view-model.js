// Backbone.ViewModel v0.1.0
//
// Copyright (C)2012 Tom Hallett
// Distributed Under MIT License
//
// Documentation and Full License Available at:
// http://github.com/tommyh/backbone-view-model

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(["underscore", "backbone"], factory);
  } else {
    factory();
  }
}(this, function() {

  'use strict';

  Backbone.ViewModel = (function () {
    var Model = Backbone.Model,
      ViewModel = function(attributes, options) {
        Model.apply(this, [attributes, options]);
        this.initializeViewModel();
      };

    _.extend(ViewModel.prototype, Model.prototype, {

      initializeViewModel: function(){
        this.setComputedAttributes();
        this.bindToChangesInSourceModel();
      },

      setComputedAttributes: function(){
        _.each(this.computed_attributes, function(value, key){
          this.set(key, value.call(this));
          this.trigger('change');
          this.trigger('change:' + key);
        }, this);
      },

      bindToChangesInSourceModel: function(){
        var sourceModel = this.get('source_model') ? [this.get('source_model')] : [],
          sourceModels = _.values(this.get('source_models'));

        _.each(_.union(sourceModel, sourceModels), function(model){
          this.listenTo(model, 'change', this.setComputedAttributes);
        }, this);
      }

    });

    ViewModel.extend = Model.extend;

    return ViewModel;
  })();

  Backbone.ViewCollection = (function() {
    var Collection = Backbone.Collection;
    var ViewCollection = function(models, options) {
        var sourceCollection;
        options = options || {};
        sourceCollection = options.source_collection; //jshint ignore:line
        Collection.apply(this, arguments);
        if (
            sourceCollection &&
            sourceCollection instanceof Backbone.Collection
        ) {
            this.listenTo(sourceCollection, 'all', function(e, entity) {
                var passThruEvents = ['add', 'remove', 'reset', 'destroy'];

                if (e === 'sync') {
                    this.set(entity.models);
                }
                if (_.indexOf(passThruEvents, e) !== -1) {
                    this[e](entity);
                }
            });
        }
    };

    _.extend(ViewCollection.prototype, Collection.prototype, {
        wrapSourceModels: function(sourceModels) {
            if (!_.isArray(sourceModels)) {
                sourceModels = [sourceModels];
            }
            return _.map(sourceModels, function(model) {
                return {
                    source_model: model // jshint ignore:line
                };
            });
        },
        set: function(models, options) {
            models = this.wrapSourceModels(models);
            Collection.prototype.set.call(this, models, options);
        }
    });

    ViewCollection.extend = Collection.extend;

    return ViewCollection;
  })();
}));
