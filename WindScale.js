// Leaflet WindScale-Control for leaflet-arrows by Meteotest
// https://github.com/meteotest/leaflet-arrows

// Module Loader Boilerplate
(function(factory, window) {
  // define an AMD module that relies on 'leaflet'
  if (typeof define === 'function' && define.amd) {
    define(['leaflet'], factory);

    // define a Common JS module that relies on 'leaflet'
  } else if (typeof exports === 'object') {
    module.exports = factory(require('leaflet'));
  }

  // attach your plugin to the global 'L' variable
  if (typeof window !== 'undefined' && window.L) {
    window.L.WindScale = factory(L);
  }
}(function(L) {
  // Extend with WindScale
  // added a new control to display the windscale.
  // Built upon the core scale object

  var WindScale = L.Control.extend({
    options: {
      position: 'bottomleft',
      maxWidth: 200,
      updateWhenIdle: false,
      stretchFactor: 1, // factor to map unit into km on map
      unitToMeter: 1000, // factor to map unit into meter
      unitLegend: 'km/h',
      lineColor: '#000',
      lineWidth: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.5)'
    },

    onAdd: function(map) {
      this._map = map;

      var className = 'leaflet-control-windscale', container = L.DomUtil
        .create('div', className), options = this.options;

      this._addScales(options, className, container);

      map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this);
      this._update();

      return container;
    },

    onRemove: function(map) {
      map.off(this.options.updateWhenIdle ? 'moveend'
        : 'move', this._update, this);
    },

    _addScales: function(options, className, container) {
      this._mScale = L.DomUtil.create('div', className +
        '-line', container);
    },

    _update: function() {
      var bounds = this._map.getBounds(), centerLat = bounds
        .getCenter().lat, halfWorldMeters = 6378137 *
          Math.PI *
          Math.cos(centerLat * Math.PI / 180), dist = halfWorldMeters *
          (bounds.getNorthEast().lng - bounds
            .getSouthWest().lng) /
          180,

        size = this._map.getSize(), options = this.options, maxMeters = 0;

      if (size.x > 0) {
        maxMeters = dist * (options.maxWidth / size.x);
      }

      this._updateScales(options, maxMeters);
    },

    _updateScales: function(options, maxMeters) {
      if (maxMeters) {
        this._updateMetric(maxMeters);
      }
    },

    _updateMetric: function(maxMeters) {
      maxMeters = maxMeters * this.options.stretchFactor;
      var meters = this._getRoundNum(maxMeters);

      this._mScale.style.width = this
          ._getScaleWidth(meters / maxMeters) +
        'px';

      // those styles are hard coded, not the best idea, i know
      this._mScale.style.border = 'none';
      this._mScale.style.borderBottom = this.options.lineWidth + 'px solid ' + this.options.lineColor;
      this._mScale.style.color = this.options.lineColor;
      this._mScale.style.lineHeight = 1;
      this._mScale.style.paddingBotton = '2px';
      this._mScale.style.backgroundColor = this.options.backgroundColor;
      this._mScale.style.padding = '2px 5px';
      this._mScale.style.boxSizing = 'border-box';
      this._mScale.innerHTML = (meters / this.options.unitToMeter) + ' ' + this.options.unitLegend;
    },

    _getScaleWidth: function(ratio) {
      return Math.round(this.options.maxWidth * ratio) - 10;
    },

    _getRoundNum: function(num) {
      var pow10 = Math
        .pow(10, (Math.floor(num) + '').length - 1), d = num /
        pow10;

      d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3
        : d >= 2 ? 2 : 1;

      return pow10 * d;
    }
  });
  return WindScale;
}, window));
